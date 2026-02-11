"""
Google OAuth 2.0 authentication router.

Provides Google Sign-In as an alternative authentication method alongside
the existing OIDC flow. Creates the same JWT session tokens for compatibility.
"""

import logging
import os
import secrets
from typing import Optional
from urllib.parse import urlencode

import httpx
from core.auth import create_access_token
from core.config import settings
from core.database import get_db
from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from models.auth import User
from services.auth import AuthService
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth/google", tags=["google-auth"])

# Google OAuth 2.0 endpoints
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# In-memory state store (use Redis in production)
_oauth_states: dict = {}


def _get_google_client_id() -> str:
    val = os.environ.get("GOOGLE_CLIENT_ID", "")
    if not val:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID environment variable.",
        )
    return val


def _get_google_client_secret() -> str:
    val = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    if not val:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_SECRET environment variable.",
        )
    return val


def _get_redirect_uri(request: Request) -> str:
    """Build redirect URI dynamically from the request."""
    scheme = request.headers.get("x-forwarded-proto", "https")
    host = (
        request.headers.get("mgx-external-domain")
        or request.headers.get("x-forwarded-host")
        or request.headers.get("host")
    )

    if not host:
        return f"{settings.backend_url}/api/v1/auth/google/callback"

    # Local dev patch
    if os.getenv("LOCAL_PATCH", "").lower() in ("true", "1"):
        scheme = "http"
        host = host.replace(":8000", ":3000")

    return f"{scheme}://{host}/api/v1/auth/google/callback"


@router.get("/config")
async def google_auth_config():
    """Return Google OAuth configuration status (for frontend feature detection)."""
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    return {
        "enabled": bool(client_id),
        "client_id": client_id if client_id else None,
    }


@router.get("/login")
async def google_login(request: Request):
    """Initiate Google OAuth 2.0 login flow."""
    client_id = _get_google_client_id()
    redirect_uri = _get_redirect_uri(request)

    state = secrets.token_urlsafe(32)
    _oauth_states[state] = True  # Mark as valid

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }

    auth_url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    logger.info("[google/login] Redirecting to Google OAuth, redirect_uri=%s", redirect_uri)
    return {"redirect_url": auth_url}


@router.get("/callback")
async def google_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth 2.0 callback."""
    # Determine frontend redirect base
    scheme = request.headers.get("x-forwarded-proto", "https")
    host = (
        request.headers.get("mgx-external-domain")
        or request.headers.get("x-forwarded-host")
        or request.headers.get("host")
    )
    frontend_base = f"{scheme}://{host}" if host else settings.backend_url

    if os.getenv("LOCAL_PATCH", "").lower() in ("true", "1"):
        frontend_base = frontend_base.replace("https://", "http://").replace(":8000", ":3000")

    def redirect_with_error(message: str) -> RedirectResponse:
        fragment = urlencode({"msg": message})
        return RedirectResponse(
            url=f"{frontend_base}/auth/error?{fragment}",
            status_code=status.HTTP_302_FOUND,
        )

    if error:
        return redirect_with_error(f"Google login error: {error}")

    if not code or not state:
        return redirect_with_error("Missing code or state parameter")

    # Validate state
    if state not in _oauth_states:
        return redirect_with_error("Invalid or expired state parameter")
    del _oauth_states[state]

    try:
        client_id = _get_google_client_id()
        client_secret = _get_google_client_secret()
        redirect_uri = _get_redirect_uri(request)

        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        if token_response.status_code != 200:
            logger.error(
                "[google/callback] Token exchange failed: %s %s",
                token_response.status_code,
                token_response.text,
            )
            return redirect_with_error("Failed to exchange Google authorization code")

        tokens = token_response.json()
        access_token = tokens.get("access_token")
        if not access_token:
            return redirect_with_error("No access token received from Google")

        # Get user info
        async with httpx.AsyncClient() as client:
            userinfo_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

        if userinfo_response.status_code != 200:
            return redirect_with_error("Failed to get user information from Google")

        userinfo = userinfo_response.json()
        email = userinfo.get("email", "")
        name = userinfo.get("name", "") or email.split("@")[0]
        google_sub = userinfo.get("sub", "")

        if not email:
            return redirect_with_error("No email address received from Google")

        # Create or get user – prefix Google sub to avoid collision with OIDC users
        platform_sub = f"google_{google_sub}"

        auth_service = AuthService(db)
        user = await auth_service.get_or_create_user(
            platform_sub=platform_sub,
            email=email,
            name=name,
        )

        # Issue application JWT
        app_token, expires_at, _ = await auth_service.issue_app_token(user=user)

        # Redirect to auth callback page with token
        fragment = urlencode({
            "token": app_token,
            "expires_at": int(expires_at.timestamp()),
            "token_type": "Bearer",
        })
        redirect_url = f"{frontend_base}/auth/callback?{fragment}"
        logger.info("[google/callback] Login successful for %s, redirecting", email)
        return RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in Google callback: {e}")
        return redirect_with_error("Authentication processing failed. Please try again.")
