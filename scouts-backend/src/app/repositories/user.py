"""
User repository.
Data access layer for user operations.
"""

from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    """Repository for user data access operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User if found, None otherwise
        """
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            email: User email
            
        Returns:
            User if found, None otherwise
        """
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.
        
        Args:
            username: Username
            
        Returns:
            User if found, None otherwise
        """
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get all users with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of users
        """
        result = await self.db.execute(
            select(User)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def count(self) -> int:
        """
        Get total count of users.
        
        Returns:
            Total number of users
        """
        result = await self.db.execute(
            select(func.count()).select_from(User)
        )
        return result.scalar_one()
    
    async def create(self, user: User) -> User:
        """
        Create a new user.
        
        Args:
            user: User instance to create
            
        Returns:
            Created user
        """
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def update(self, user: User) -> User:
        """
        Update an existing user.
        
        Args:
            user: User instance to update
            
        Returns:
            Updated user
        """
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def delete(self, user: User) -> None:
        """
        Delete a user.
        
        Args:
            user: User instance to delete
        """
        await self.db.delete(user)
        await self.db.flush()
