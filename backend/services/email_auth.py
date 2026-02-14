import logging
import os
import jwt
import random
import string
import hashlib
import secrets
import uuid
import httpx
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Dict, Any

from core.auth import create_access_token
from core.config import settings
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.auth import User

logger = logging.getLogger(__name__)

# In-memory storage for verification codes (short-lived data is OK)
verification_codes: Dict[str, Dict[str, Any]] = {}

# In-memory storage for verified emails (tracks emails that passed verification)
verified_emails: Dict[str, datetime] = {}

# In-memory rate limiting for send-code endpoint
send_code_timestamps: Dict[str, list] = {}
SEND_CODE_RATE_LIMIT = 3  # max requests per window
SEND_CODE_RATE_WINDOW = 300  # 5 minutes in seconds

# Resend API configuration
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
if not RESEND_API_KEY:
    logger.warning("RESEND_API_KEY environment variable is not set. Email sending will fail.")
RESEND_API_URL = "https://api.resend.com/emails"
# Use Resend's default sender for unverified domains
FROM_EMAIL = "noreply@leaselenses.com"
BRAND_NAME = "LeaseLenses"


def hash_password(password: str) -> str:
    """Hash password using bcrypt for security."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def _verify_legacy_sha256(password: str, hashed: str) -> bool:
    """Verify password against legacy SHA-256 hash (salt$hex format)."""
    try:
        salt, stored_hash = hashed.split('$', 1)
        hash_obj = hashlib.sha256((password + salt).encode())
        return hash_obj.hexdigest() == stored_hash
    except (ValueError, AttributeError):
        return False


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash, with fallback to legacy SHA-256."""
    # Try bcrypt first
    try:
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed.encode('utf-8')
        if bcrypt.checkpw(password_bytes, hashed_bytes):
            return True
    except (ValueError, AttributeError):
        pass
    # Fallback: legacy SHA-256 (salt$hex)
    return _verify_legacy_sha256(password, hashed)


def generate_verification_code() -> str:
    """Generate 6-digit verification code."""
    return ''.join(random.choices(string.digits, k=6))


async def send_email_via_resend(to_email: str, subject: str, html_content: str) -> bool:
    """Send email using Resend API."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                RESEND_API_URL,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": f"{BRAND_NAME} <{FROM_EMAIL}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content
                },
                timeout=30.0
            )
            if response.status_code == 200:
                logger.info(f"[Resend] Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"[Resend] Failed to send email: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"[Resend] Error sending email: {str(e)}")
        return False


def check_send_code_rate_limit(email: str) -> bool:
    """Check if email has exceeded rate limit for sending codes.
    
    Returns True if the request is allowed, False if rate limited.
    """
    now = datetime.now(timezone.utc)
    if email not in send_code_timestamps:
        send_code_timestamps[email] = []
    
    # Remove timestamps outside the rate window
    send_code_timestamps[email] = [
        ts for ts in send_code_timestamps[email]
        if (now - ts).total_seconds() < SEND_CODE_RATE_WINDOW
    ]
    
    if len(send_code_timestamps[email]) >= SEND_CODE_RATE_LIMIT:
        return False
    
    send_code_timestamps[email].append(now)
    return True


class EmailAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send_verification_code(self, email: str, purpose: str = "register") -> Tuple[bool, str]:
        """Send verification code to email via Resend."""
        # Check rate limit
        if not check_send_code_rate_limit(email):
            return False, "Too many requests. Please try again later."
        
        # Check email existence based on purpose
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        existing_user = result.scalar_one_or_none()
        
        if purpose == "register" and existing_user:
            return False, "This email is already registered. Please sign in instead."
        if purpose == "reset" and not existing_user:
            return False, "No account found with this email address."
        
        code = generate_verification_code()
        
        # Store code with expiration (10 minutes)
        verification_codes[email] = {
            "code": code,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
            "attempts": 0
        }
        
        # Create HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ text-align: center; padding: 20px 0; }}
                .logo {{ font-size: 24px; font-weight: bold; color: #2563eb; }}
                .code-box {{ background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
                .code {{ font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏠 {BRAND_NAME}</div>
                </div>
                <h2>Verify Your Email</h2>
                <p>Hello,</p>
                <p>Thank you for signing up for {BRAND_NAME}! Please use the verification code below to complete your registration:</p>
                <div class="code-box">
                    <div class="code">{code}</div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <div class="footer">
                    <p>© {datetime.now().year} {BRAND_NAME}. All rights reserved.</p>
                    <p>AI-Powered Lease Analysis Platform</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email via Resend
        email_sent = await send_email_via_resend(
            to_email=email,
            subject=f"Your {BRAND_NAME} Verification Code",
            html_content=html_content
        )
        
        if email_sent:
            logger.info(f"[EmailAuth] Verification code sent to {email}")
            return True, code
        else:
            # Fallback: still store the code for demo purposes
            logger.warning(f"[EmailAuth] Email failed, code for {email}: {code}")
            return True, code

    async def verify_code(self, email: str, code: str) -> Tuple[bool, str]:
        """Verify code sent to email."""
        if email not in verification_codes:
            return False, "No verification code found. Please request a new one."
        
        stored = verification_codes[email]
        
        # Check expiration
        if datetime.now(timezone.utc) > stored["expires_at"]:
            del verification_codes[email]
            return False, "Verification code expired. Please request a new one."
        
        # Check attempts
        if stored["attempts"] >= 5:
            del verification_codes[email]
            return False, "Too many attempts. Please request a new code."
        
        stored["attempts"] += 1
        
        if stored["code"] != code:
            return False, "Invalid verification code."
        
        # Code is valid, remove it
        del verification_codes[email]
        # Track this email as verified (valid for 30 minutes to complete registration)
        verified_emails[email] = datetime.now(timezone.utc) + timedelta(minutes=30)
        return True, "Code verified successfully."

    async def register_user(
        self, 
        email: str, 
        password: str, 
        name: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict]]:
        """Register a new user with email and password in database."""
        
        # Check if email has been verified
        if email not in verified_emails:
            return False, "Email not verified. Please verify your email first.", None
        
        if datetime.now(timezone.utc) > verified_emails[email]:
            del verified_emails[email]
            return False, "Email verification expired. Please verify your email again.", None
        
        # Check if user already exists in database
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            return False, "Email already registered.", None
        
        # Create new user in database
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)
        
        new_user = User(
            id=user_id,
            email=email,
            name=name or email.split("@")[0],
            password_hash=hashed_password,
            role="user",
            created_at=datetime.now(timezone.utc),
            last_login=datetime.now(timezone.utc)
        )
        
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        
        # Remove verified email tracking after successful registration
        verified_emails.pop(email, None)
        
        logger.info(f"[EmailAuth] New user registered: {email}")
        
        return True, "Registration successful.", {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name
        }

    async def reset_password(
        self,
        email: str,
        new_password: str
    ) -> Tuple[bool, str]:
        """Reset password for a verified email."""
        # Check if email has been verified
        if email not in verified_emails:
            return False, "Email not verified. Please verify your email first."

        if datetime.now(timezone.utc) > verified_emails[email]:
            del verified_emails[email]
            return False, "Email verification expired. Please verify your email again."

        # Find user by email
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            return False, "No account found with this email address."

        # Update password
        user.password_hash = hash_password(new_password)
        await self.db.commit()

        # Remove verified email tracking
        verified_emails.pop(email, None)

        logger.info(f"[EmailAuth] Password reset for: {email}")
        return True, "Password reset successful. You can now sign in with your new password."

    async def login_user(
        self, 
        email: str, 
        password: str
    ) -> Tuple[bool, str, Optional[str]]:
        """Login user with email and password from database."""
        
        # Find user by email in database
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return False, "Invalid email or password.", None
        
        # Check password
        if not verify_password(password, user.password_hash):
            return False, "Invalid email or password.", None
        
        # Auto-migrate legacy SHA-256 hash to bcrypt
        if not user.password_hash.startswith("$2b$"):
            user.password_hash = hash_password(password)
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await self.db.commit()
        
        # Generate token
        try:
            expires_minutes = int(getattr(settings, "jwt_expire_minutes", 60))
        except (TypeError, ValueError):
            expires_minutes = 60
        
        claims = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
        }
        if user.name:
            claims["name"] = user.name
        
        token = create_access_token(claims, expires_minutes=expires_minutes)
        
        logger.info(f"[EmailAuth] User logged in: {email}")
        
        return True, "Login successful.", token

    async def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token and return user data from database."""
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
            user_id = payload.get("sub")
            
            if not user_id:
                return None
            
            # Query user from database
            result = await self.db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if user:
                return {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role
                }
            return None
        except jwt.ExpiredSignatureError:
            logger.warning("[EmailAuth] Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"[EmailAuth] Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"[EmailAuth] Error verifying token: {e}")
            return None