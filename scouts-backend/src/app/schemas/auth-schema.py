"""
Authentication Pydantic schemas.
Request/response models for authentication endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Schema for login request."""
    
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class TokenResponse(BaseModel):
    """Schema for token response."""
    
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    
    refresh_token: str = Field(..., description="Refresh token")


class TokenPayload(BaseModel):
    """Schema for decoded token payload."""
    
    sub: int = Field(..., description="Subject (user ID)")
    email: str = Field(..., description="User email")
    username: str = Field(..., description="Username")
    exp: datetime = Field(..., description="Expiration time")
    iat: datetime = Field(..., description="Issued at time")
    type: str = Field(..., description="Token type (access/refresh)")


class LogoutResponse(BaseModel):
    """Schema for logout response."""
    
    message: str = Field(default="Successfully logged out", description="Logout message")
