"""
Chau repository.
Data access layer for chau operations.
"""

from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chau import Chau


class ChauRepository:
    """Repository for chau data access operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, chau_id: int) -> Optional[Chau]:
        """
        Get chau by ID.
        
        Args:
            chau_id: Chau ID
            
        Returns:
            Chau if found, None otherwise
        """
        result = await self.db.execute(
            select(Chau).where(Chau.chau_id == chau_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_name(self, ten_chau: str) -> Optional[Chau]:
        """
        Get chau by name.
        
        Args:
            ten_chau: Chau name
            
        Returns:
            Chau if found, None otherwise
        """
        result = await self.db.execute(
            select(Chau).where(Chau.ten_chau == ten_chau)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Chau]:
        """
        Get all chau with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of chau
        """
        result = await self.db.execute(
            select(Chau)
            .order_by(Chau.chau_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def count(self) -> int:
        """
        Get total count of chau.
        
        Returns:
            Total number of chau
        """
        result = await self.db.execute(
            select(func.count()).select_from(Chau)
        )
        return result.scalar_one()
    
    async def create(self, chau: Chau) -> Chau:
        """
        Create a new chau.
        
        Args:
            chau: Chau instance to create
            
        Returns:
            Created chau
        """
        self.db.add(chau)
        await self.db.flush()
        await self.db.refresh(chau)
        return chau
    
    async def update(self, chau: Chau) -> Chau:
        """
        Update an existing chau.
        
        Args:
            chau: Chau instance to update
            
        Returns:
            Updated chau
        """
        await self.db.flush()
        await self.db.refresh(chau)
        return chau
    
    async def delete(self, chau: Chau) -> None:
        """
        Delete a chau.
        
        Args:
            chau: Chau instance to delete
        """
        await self.db.delete(chau)
        await self.db.flush()
