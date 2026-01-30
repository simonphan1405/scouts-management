"""
Authentication endpoints.
Handles login, logout, token refresh, and user info.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    LogoutResponse
)
from app.schemas.user import User as UserSchema
from app.services.auth import AuthService

router = APIRouter(tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with email and password",
    description="Authenticate a user and return access and refresh tokens"
)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Login endpoint.
    
    Authenticates a user with email and password, and returns JWT tokens.
    
    Args:
        login_data: Login credentials (email and password)
        db: Database session
        
    Returns:
        Token response with access and refresh tokens
        
    Raises:
        UnauthorizedException: If credentials are invalid
    """
    auth_service = AuthService(db)
    
    # Login user
    access_token, refresh_token, expires_in, user = await auth_service.login(
        email=login_data.email,
        password=login_data.password
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Get a new access token using a refresh token"
)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Refresh token endpoint.
    
    Generates a new access token using a valid refresh token.
    
    Args:
        refresh_data: Refresh token data
        db: Database session
        
    Returns:
        Token response with new access and refresh tokens
        
    Raises:
        UnauthorizedException: If refresh token is invalid
    """
    auth_service = AuthService(db)
    
    # Refresh access token
    access_token, new_refresh_token, expires_in = await auth_service.refresh_access_token(
        refresh_token=refresh_data.refresh_token
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=expires_in
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout current user",
    description="Logout the currently authenticated user"
)
async def logout(
    current_user: User = Depends(get_current_user)
) -> LogoutResponse:
    """
    Logout endpoint.
    
    Logs out the current user. In a stateless JWT implementation,
    this is mainly for client-side token cleanup. For enhanced security,
    you could implement token blacklisting.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Logout success message
    """
    # In a stateless JWT implementation, logout is handled client-side
    # by removing the tokens. For enhanced security, implement token blacklisting
    # using Redis or a database table to store revoked tokens.
    
    return LogoutResponse(
        message=f"Successfully logged out user: {current_user.username}"
    )


@router.get(
    "/me",
    response_model=UserSchema,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get the currently authenticated user's information"
)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> UserSchema:
    """
    Get current user endpoint.
    
    Returns the currently authenticated user's information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user information
    """
    return UserSchema.model_validate(current_user)
