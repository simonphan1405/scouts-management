"""
User service.
Business logic layer for user operations.
"""

import bcrypt

from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.user_model import User
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserCreate, UserUpdate


class UserService:
    """Service for user business logic."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = UserRepository(db)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        # Convert string to bytes and hash with bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Return as string for storage in database
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its bcrypt hash.
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password
            
        Returns:
            True if password matches, False otherwise
        """
        # Convert both to bytes for bcrypt
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    async def get_user_by_id(self, user_id: int) -> User:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User instance
            
        Raises:
            NotFoundException: If user not found
        """
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User with ID {user_id} not found")
        return user
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> tuple[List[User], int]:
        """
        Get all users with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (list of users, total count)
        """
        users = await self.repository.get_all(skip=skip, limit=limit)
        total = await self.repository.count()
        return users, total
    
    async def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            user_data: User creation data
            
        Returns:
            Created user
            
        Raises:
            BadRequestException: If email or username already exists
        """
        # Check if email already exists
        existing_user = await self.repository.get_by_email(user_data.email)
        if existing_user:
            raise BadRequestException(f"Email {user_data.email} already registered")
        
        # Check if username already exists
        existing_user = await self.repository.get_by_username(user_data.username)
        if existing_user:
            raise BadRequestException(f"Username {user_data.username} already taken")
        
        # Create user
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=self.hash_password(user_data.password),
            is_active=user_data.is_active
        )
        
        return await self.repository.create(user)
    
    async def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """
        Update an existing user.
        
        Args:
            user_id: User ID
            user_data: User update data
            
        Returns:
            Updated user
            
        Raises:
            NotFoundException: If user not found
            BadRequestException: If email or username already taken by another user
        """
        user = await self.get_user_by_id(user_id)
        
        # Check if email is being updated and if it's already taken
        if user_data.email and user_data.email != user.email:
            existing_user = await self.repository.get_by_email(user_data.email)
            if existing_user and existing_user.id != user_id:
                raise BadRequestException(f"Email {user_data.email} already registered")
            user.email = user_data.email
        
        # Check if username is being updated and if it's already taken
        if user_data.username and user_data.username != user.username:
            existing_user = await self.repository.get_by_username(user_data.username)
            if existing_user and existing_user.id != user_id:
                raise BadRequestException(f"Username {user_data.username} already taken")
            user.username = user_data.username
        
        # Update other fields
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        
        if user_data.password:
            user.hashed_password = self.hash_password(user_data.password)
        
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        
        return await self.repository.update(user)
    
    async def delete_user(self, user_id: int) -> None:
        """
        Delete a user.
        
        Args:
            user_id: User ID
            
        Raises:
            NotFoundException: If user not found
        """
        user = await self.get_user_by_id(user_id)
        await self.repository.delete(user)
