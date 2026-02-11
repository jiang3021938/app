import logging
import jwt
import random
import string
import hashlib
import httpx
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Dict, Any

from core.auth import create_access_token
from core.config import settings

logger = logging.getLogger(__name__)

# In-memory storage for verification codes and users
verification_codes: Dict[str, Dict[str, Any]] = {}
email_users: Dict[str, Dict[str, Any]] = {}  # email -> user data

# Resend API configuration
RESEND_API_KEY = "re_3M2tYDM3_2Jc16xhPX1sZmsCniCQGZ9E4"
RESEND_API_URL = "https://api.resend.com/emails"
# Use Resend's default sender for unverified domains
FROM_EMAIL = "noreply@leaselenses.com"
BRAND_NAME = "LeaseLenses"


def hash_password(password: str) -> str:
    """Hash password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash."""
    return hash_password(password) == hashed


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


class EmailAuthService:
    def __init__(self, db=None):
        self.db = db

    async def send_verification_code(self, email: str) -> Tuple[bool, str]:
        """Send verification code to email via Resend."""
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
                    <p>© 2024 {BRAND_NAME}. All rights reserved.</p>
                    <p>AI-Powered Lease Analysis Platform</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email via Resend
        email_sent = await send_email_via_resend(
            to_email=email,
            subject=f"Your {BRAND_NAME} Verification Code: {code}",
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
        """Verify the code sent to email."""
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
        return True, "Code verified successfully."

    async def register_user(
        self, 
        email: str, 
        password: str, 
        name: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict]]:
        """Register a new user with email and password."""
        
        # Check if user already exists
        if email in email_users:
            return False, "Email already registered.", None
        
        # Create new user
        import uuid
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)
        
        user_data = {
            "id": user_id,
            "email": email,
            "name": name or email.split("@")[0],
            "password_hash": hashed_password,
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat()
        }
        
        email_users[email] = user_data
        
        return True, "Registration successful.", {
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"]
        }

    async def login_user(
        self, 
        email: str, 
        password: str
    ) -> Tuple[bool, str, Optional[str]]:
        """Login user with email and password."""
        
        # Find user by email
        if email not in email_users:
            return False, "Invalid email or password.", None
        
        user = email_users[email]
        
        # Check password
        if not verify_password(password, user["password_hash"]):
            return False, "Invalid email or password.", None
        
        # Update last login
        user["last_login"] = datetime.now(timezone.utc).isoformat()
        
        # Generate token
        try:
            expires_minutes = int(getattr(settings, "jwt_expire_minutes", 60))
        except (TypeError, ValueError):
            expires_minutes = 60
        
        claims = {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"],
        }
        if user.get("name"):
            claims["name"] = user["name"]
        
        token = create_access_token(claims, expires_minutes=expires_minutes)
        
        return True, "Login successful.", token

    async def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token and return user data."""
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
            email = payload.get("email")
            if email and email in email_users:
                user = email_users[email]
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "role": user["role"]
                }
            return None
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

# Create singleton instance
email_auth_service = EmailAuthService()
