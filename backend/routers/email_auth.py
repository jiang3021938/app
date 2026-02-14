"""Email authentication router with Resend email verification."""

import logging
import re
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from services.email_auth import EmailAuthService
from core.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/email-auth", tags=["email-authentication"])


def validate_email(email: str) -> str:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError('Invalid email format')
    return email.lower()


class SendCodeRequest(BaseModel):
    email: str
    purpose: str = "register"

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        return validate_email(v)

    @field_validator('purpose')
    @classmethod
    def validate_purpose(cls, v):
        if v not in ("register", "reset"):
            raise ValueError('Purpose must be "register" or "reset"')
        return v


class VerifyCodeRequest(BaseModel):
    email: str
    code: str

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        return validate_email(v)


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        return validate_email(v)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        return validate_email(v)


class ResetPasswordRequest(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        return validate_email(v)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


@router.post("/send-code")
async def send_code(request: SendCodeRequest, db: AsyncSession = Depends(get_db)):
    """Send verification code to email via Resend."""
    try:
        service = EmailAuthService(db)
        success, result = await service.send_verification_code(request.email, purpose=request.purpose)
        if success:
            return {"success": True, "message": "Verification code sent to your email"}
        else:
            return {"success": False, "message": result}
    except Exception as e:
        logger.error(f"Error sending code: {str(e)}")
        return {"success": False, "message": "Failed to send verification code"}


@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    """Verify code sent to email."""
    try:
        service = EmailAuthService(db)
        success, message = await service.verify_code(request.email, request.code)
        return {"success": success, "message": message}
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        return {"success": False, "message": "Verification failed"}


@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    try:
        service = EmailAuthService(db)
        success, message, user = await service.register_user(
            email=request.email,
            password=request.password,
            name=request.name
        )
        
        if not success:
            return {"success": False, "message": message}
        
        return {"success": True, "message": message, "user": user}
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        return {"success": False, "message": "Registration failed"}


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    try:
        service = EmailAuthService(db)
        success, message, token = await service.login_user(
            email=request.email,
            password=request.password
        )
        
        if not success:
            return {"success": False, "message": message}
        
        return {"success": True, "message": message, "token": token}
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}")
        return {"success": False, "message": "Login failed"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password after email verification."""
    try:
        service = EmailAuthService(db)
        success, message = await service.reset_password(
            email=request.email,
            new_password=request.password
        )
        if not success:
            return {"success": False, "message": message}
        return {"success": True, "message": message}
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        return {"success": False, "message": "Password reset failed"}


@router.get("/me")
async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    """Get current user from JWT token."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            return {"success": False, "message": "No token provided"}
        
        token = authorization.replace("Bearer ", "")
        
        # Create service instance to verify token
        service = EmailAuthService(db)
        user = await service.verify_token(token)
        
        if not user:
            return {"success": False, "message": "Invalid token"}
        
        return {"success": True, "user": user}
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return {"success": False, "message": "Failed to verify token"}