"""
Authentication service.
Business logic layer for authentication operations.
"""

from datetime import timedelta
from typing import Tuple

from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import UnauthorizedException, NotFoundException
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user_model import User
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


class AuthService:
    """Service for authentication business logic."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repository = UserRepository(db)
        self.user_service = UserService(db)
    
    async def authenticate_user(self, email: str, password: str) -> User:
        """
        Authenticate a user with email and password.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Authenticated user instance
            
        Raises:
            UnauthorizedException: If credentials are invalid or user is inactive
        """
        # Get user by email
        user = await self.user_repository.get_by_email(email)
        if not user:
            raise UnauthorizedException("Invalid email or password")
        
        # Verify password
        if not self.user_service.verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password")
        
        # Check if user is active
        if not user.is_active:
            raise UnauthorizedException("User account is inactive")
        
        return user
    
    def create_tokens(self, user: User) -> Tuple[str, str, int]:
        """
        Create access and refresh tokens for a user.
        
        Args:
            user: User instance
            
        Returns:
            Tuple of (access_token, refresh_token, expires_in_seconds)
        """
        # Create token payload
        # Note: 'sub' must be a string according to JWT standard
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
        }
        
        # Create access token
        access_token = create_access_token(data=token_data)
        
        # Create refresh token
        refresh_token = create_refresh_token(data=token_data)
        
        # Calculate expiration time in seconds
        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        
        return access_token, refresh_token, expires_in
    
    async def login(self, email: str, password: str) -> Tuple[str, str, int, User]:
        """
        Login a user with email and password.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Tuple of (access_token, refresh_token, expires_in_seconds, user)
            
        Raises:
            UnauthorizedException: If credentials are invalid
        """
        # Authenticate user
        user = await self.authenticate_user(email, password)
        
        # Create tokens
        access_token, refresh_token, expires_in = self.create_tokens(user)
        
        return access_token, refresh_token, expires_in, user
    
    async def refresh_access_token(self, refresh_token: str) -> Tuple[str, str, int]:
        """
        Refresh an access token using a refresh token.
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Tuple of (new_access_token, new_refresh_token, expires_in_seconds)
            
        Raises:
            UnauthorizedException: If refresh token is invalid
        """
        try:
            # Decode refresh token
            payload = decode_token(refresh_token)
            
            # Verify token type
            if payload.get("type") != "refresh":
                raise UnauthorizedException("Invalid token type")
            
            # Get user ID from token (convert from string to int)
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                raise UnauthorizedException("Invalid token payload")
            
            try:
                user_id = int(user_id_str)
            except (ValueError, TypeError):
                raise UnauthorizedException("Invalid user ID in token")
            
            # Get user from database
            user = await self.user_repository.get_by_id(user_id)
            if not user:
                raise UnauthorizedException("User not found")
            
            # Check if user is active
            if not user.is_active:
                raise UnauthorizedException("User account is inactive")
            
            # Create new tokens
            access_token, new_refresh_token, expires_in = self.create_tokens(user)
            
            return access_token, new_refresh_token, expires_in
            
        except JWTError:
            raise UnauthorizedException("Invalid or expired refresh token")
    
    async def get_current_user(self, token: str) -> User:
        """
        Get the current user from an access token.
        
        Args:
            token: Access token
            
        Returns:
            Current user instance
            
        Raises:
            UnauthorizedException: If token is invalid or user not found
        """
        try:
            # Decode token
            payload = decode_token(token)
            
            # Verify token type
            if payload.get("type") != "access":
                raise UnauthorizedException("Invalid token type")
            
            # Get user ID from token (convert from string to int)
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                raise UnauthorizedException("Invalid token payload")
            
            try:
                user_id = int(user_id_str)
            except (ValueError, TypeError):
                raise UnauthorizedException("Invalid user ID in token")
            
            # Get user from database
            user = await self.user_repository.get_by_id(user_id)
            if not user:
                raise UnauthorizedException("User not found")
            
            # Check if user is active
            if not user.is_active:
                raise UnauthorizedException("User account is inactive")
            
            return user
            
        except JWTError:
            raise UnauthorizedException("Invalid or expired token")
