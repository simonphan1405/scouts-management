"""
Dao service.
Business logic layer for dao operations.
"""

from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.dao import Dao
from app.repositories.dao import DaoRepository
from app.repositories.chau import ChauRepository
from app.schemas.dao import DaoCreate, DaoUpdate


class DaoService:
    """Service for dao business logic."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = DaoRepository(db)
        self.chau_repository = ChauRepository(db)

    async def get_dao_by_id(self, dao_id: int) -> Dao:
        """
        Get dao by ID.

        Args:
            dao_id: Dao ID

        Returns:
            Dao instance

        Raises:
            NotFoundException: If dao not found
        """
        dao = await self.repository.get_by_id(dao_id)
        if not dao:
            raise NotFoundException(f"Đạo với ID {dao_id} không tìm thấy")
        return dao

    async def get_dao_list(self, skip: int = 0, limit: int = 100) -> tuple[List[Dao], int]:
        """
        Get all dao with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of (list of dao, total count)
        """
        dao_list = await self.repository.get_all(skip=skip, limit=limit)
        total = await self.repository.count()
        return dao_list, total

    async def get_dao_by_chau_id(self, chau_id: int, skip: int = 0, limit: int = 100) -> tuple[List[Dao], int]:
        """
        Get all dao by chau_id with pagination.

        Args:
            chau_id: Chau ID
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of (list of dao, total count)

        Raises:
            NotFoundException: If chau not found
        """
        # Verify chau exists
        chau = await self.chau_repository.get_by_id(chau_id)
        if not chau:
            raise NotFoundException(f"Châu với ID {chau_id} không tìm thấy")

        dao_list = await self.repository.get_by_chau_id(chau_id, skip=skip, limit=limit)
        total = await self.repository.count_by_chau_id(chau_id)
        return dao_list, total

    async def create_dao(self, dao_data: DaoCreate) -> Dao:
        """
        Create a new dao.

        Args:
            dao_data: Dao creation data

        Returns:
            Created dao

        Raises:
            NotFoundException: If chau not found
            BadRequestException: If dao name already exists
        """
        # Verify chau exists
        chau = await self.chau_repository.get_by_id(dao_data.chau_id)
        if not chau:
            raise NotFoundException(f"Châu với ID {dao_data.chau_id} không tìm thấy")

        # Check if dao name already exists
        existing_dao = await self.repository.get_by_name(dao_data.ten_dao)
        if existing_dao:
            raise BadRequestException(f"Đạo với tên '{dao_data.ten_dao}' đã tồn tại")

        # Create dao
        dao = Dao(
            ten_dao=dao_data.ten_dao,
            chau_id=dao_data.chau_id,
            dia_chi=dao_data.dia_chi,
            mo_ta=dao_data.mo_ta
        )

        return await self.repository.create(dao)

    async def update_dao(self, dao_id: int, dao_data: DaoUpdate) -> Dao:
        """
        Update an existing dao.

        Args:
            dao_id: Dao ID
            dao_data: Dao update data

        Returns:
            Updated dao

        Raises:
            NotFoundException: If dao or chau not found
            BadRequestException: If dao name already taken by another dao
        """
        dao = await self.get_dao_by_id(dao_id)

        # Check if chau_id is being updated and if it exists
        if dao_data.chau_id is not None and dao_data.chau_id != dao.chau_id:
            chau = await self.chau_repository.get_by_id(dao_data.chau_id)
            if not chau:
                raise NotFoundException(f"Châu với ID {dao_data.chau_id} không tìm thấy")
            dao.chau_id = dao_data.chau_id

        # Check if dao name is being updated and if it's already taken
        if dao_data.ten_dao and dao_data.ten_dao != dao.ten_dao:
            existing_dao = await self.repository.get_by_name(dao_data.ten_dao)
            if existing_dao and existing_dao.dao_id != dao_id:
                raise BadRequestException(f"Đạo với tên '{dao_data.ten_dao}' đã tồn tại")
            dao.ten_dao = dao_data.ten_dao

        # Update other fields
        if dao_data.dia_chi is not None:
            dao.dia_chi = dao_data.dia_chi

        if dao_data.mo_ta is not None:
            dao.mo_ta = dao_data.mo_ta

        return await self.repository.update(dao)

    async def delete_dao(self, dao_id: int) -> str:
        """
        Delete a dao.

        Args:
            dao_id: Dao ID

        Returns:
            Name of the deleted dao

        Raises:
            NotFoundException: If dao not found
        """
        dao = await self.get_dao_by_id(dao_id)
        ten_dao = dao.ten_dao or f"Đạo ID {dao_id}"
        await self.repository.delete(dao)
        return ten_dao
