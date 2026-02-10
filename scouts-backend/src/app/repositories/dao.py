"""
Dao repository.
Data access layer for dao operations.
"""

from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dao import Dao


class DaoRepository:
    """Repository for dao data access operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, dao_id: int) -> Optional[Dao]:
        """
        Get dao by ID.

        Args:
            dao_id: Dao ID

        Returns:
            Dao if found, None otherwise
        """
        result = await self.db.execute(
            select(Dao).where(Dao.dao_id == dao_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, ten_dao: str) -> Optional[Dao]:
        """
        Get dao by name.

        Args:
            ten_dao: Dao name

        Returns:
            Dao if found, None otherwise
        """
        result = await self.db.execute(
            select(Dao).where(Dao.ten_dao == ten_dao)
        )
        return result.scalar_one_or_none()

    async def get_by_chau_id(self, chau_id: int, skip: int = 0, limit: int = 100) -> List[Dao]:
        """
        Get all dao by chau_id with pagination.

        Args:
            chau_id: Chau ID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of dao
        """
        result = await self.db.execute(
            select(Dao)
            .where(Dao.chau_id == chau_id)
            .order_by(Dao.dao_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Dao]:
        """
        Get all dao with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of dao
        """
        result = await self.db.execute(
            select(Dao)
            .order_by(Dao.dao_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count(self) -> int:
        """
        Get total count of dao.

        Returns:
            Total number of dao
        """
        result = await self.db.execute(
            select(func.count()).select_from(Dao)
        )
        return result.scalar_one()

    async def count_by_chau_id(self, chau_id: int) -> int:
        """
        Get total count of dao by chau_id.

        Args:
            chau_id: Chau ID

        Returns:
            Total number of dao in chau
        """
        result = await self.db.execute(
            select(func.count()).select_from(Dao).where(Dao.chau_id == chau_id)
        )
        return result.scalar_one()

    async def create(self, dao: Dao) -> Dao:
        """
        Create a new dao.

        Args:
            dao: Dao instance to create

        Returns:
            Created dao
        """
        self.db.add(dao)
        await self.db.flush()
        await self.db.refresh(dao)
        return dao

    async def update(self, dao: Dao) -> Dao:
        """
        Update an existing dao.

        Args:
            dao: Dao instance to update

        Returns:
            Updated dao
        """
        await self.db.flush()
        await self.db.refresh(dao)
        return dao

    async def delete(self, dao: Dao) -> None:
        """
        Delete a dao.

        Args:
            dao: Dao instance to delete
        """
        await self.db.delete(dao)
        await self.db.flush()
