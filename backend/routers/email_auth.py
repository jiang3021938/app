"""Email authentication router with Resend email verification."""

import logging
import re
from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, field_validator

from services.email_auth import EmailAuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/email-auth", tags=["email-authentication"])

# Global service instance (uses in-memory storage)
email_auth_service = EmailAuthService()


def validate_email(email: str) -> str:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError('Invalid email format')
    return email.lower()


class SendCodeRequest(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v):
        return validate_email(v)


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


@router.post("/send-code")
async def send_code(request: SendCodeRequest):
    """Send verification code to email via Resend."""
    try:
        success, code = await email_auth_service.send_verification_code(request.email)
        if success:
            return {"success": True, "message": "Verification code sent to your email"}
        else:
            return {"success": False, "message": "Failed to send verification code"}
    except Exception as e:
        logger.error(f"Error sending code: {str(e)}")
        return {"success": False, "message": "Failed to send verification code"}


@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    """Verify the code sent to email."""
    try:
        success, message = await email_auth_service.verify_code(request.email, request.code)
        return {"success": success, "message": message}
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        return {"success": False, "message": "Verification failed"}


@router.post("/register")
async def register(request: RegisterRequest):
    """Register a new user with email and password."""
    try:
        success, message, user = await email_auth_service.register_user(
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
async def login(request: LoginRequest):
    """Login with email and password."""
    try:
        success, message, token = await email_auth_service.login_user(
            email=request.email,
            password=request.password
        )
        
        if not success:
            return {"success": False, "message": message}
        
        return {"success": True, "message": message, "token": token}
    except Exception as e:
        logger.error(f"Error logging in: {str(e)}")
        return {"success": False, "message": "Login failed"}


@router.get("/me")
async def get_current_user(authorization: str = Header(None)):
    """Get current user from JWT token."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            return {"success": False, "message": "No token provided"}
        
        token = authorization.replace("Bearer ", "")
        
        # Decode token
        from services.email_auth import email_auth_service
        user = await email_auth_service.verify_token(token)
        
        if not user:
            return {"success": False, "message": "Invalid token"}
        
        return {"success": True, "user": user}
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return {"success": False, "message": "Failed to verify token"}
