"""
Chau service.
Business logic layer for chau operations.
"""

from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.chau_model import Chau
from app.repositories.chau_repository import ChauRepository
from app.schemas.chau_schema import ChauCreate, ChauUpdate


class ChauService:
    """Service for chau business logic."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = ChauRepository(db)
    
    async def get_chau_by_id(self, chau_id: int) -> Chau:
        """
        Get chau by ID.
        
        Args:
            chau_id: Chau ID
            
        Returns:
            Chau instance
            
        Raises:
            NotFoundException: If chau not found
        """
        chau = await self.repository.get_by_id(chau_id)
        if not chau:
            raise NotFoundException(f"Châu với ID {chau_id} không tìm thấy")
        return chau
    
    async def get_chau_list(self, skip: int = 0, limit: int = 100) -> tuple[List[Chau], int]:
        """
        Get all chau with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (list of chau, total count)
        """
        chau_list = await self.repository.get_all(skip=skip, limit=limit)
        total = await self.repository.count()
        return chau_list, total
    
    async def create_chau(self, chau_data: ChauCreate) -> Chau:
        """
        Create a new chau.
        
        Args:
            chau_data: Chau creation data
            
        Returns:
            Created chau
            
        Raises:
            BadRequestException: If chau name already exists
        """
        # Check if chau name already exists
        existing_chau = await self.repository.get_by_name(chau_data.ten_chau)
        if existing_chau:
            raise BadRequestException(f"Châu với tên '{chau_data.ten_chau}' đã tồn tại")
        
        # Create chau
        chau = Chau(
            ten_chau=chau_data.ten_chau,
            dia_chi=chau_data.dia_chi,
            mo_ta=chau_data.mo_ta
        )
        
        return await self.repository.create(chau)
    
    async def update_chau(self, chau_id: int, chau_data: ChauUpdate) -> Chau:
        """
        Update an existing chau.
        
        Args:
            chau_id: Chau ID
            chau_data: Chau update data
            
        Returns:
            Updated chau
            
        Raises:
            NotFoundException: If chau not found
            BadRequestException: If chau name already taken by another chau
        """
        chau = await self.get_chau_by_id(chau_id)
        
        # Check if chau name is being updated and if it's already taken
        if chau_data.ten_chau and chau_data.ten_chau != chau.ten_chau:
            existing_chau = await self.repository.get_by_name(chau_data.ten_chau)
            if existing_chau and existing_chau.chau_id != chau_id:
                raise BadRequestException(f"Châu với tên '{chau_data.ten_chau}' đã tồn tại")
            chau.ten_chau = chau_data.ten_chau
        
        # Update other fields
        if chau_data.dia_chi is not None:
            chau.dia_chi = chau_data.dia_chi
        
        if chau_data.mo_ta is not None:
            chau.mo_ta = chau_data.mo_ta
        
        return await self.repository.update(chau)
    
    async def delete_chau(self, chau_id: int) -> str:
        """
        Delete a chau.
        
        Args:
            chau_id: Chau ID
            
        Returns:
            Name of the deleted chau
            
        Raises:
            NotFoundException: If chau not found
        """
        chau = await self.get_chau_by_id(chau_id)
        ten_chau = chau.ten_chau or f"Châu ID {chau_id}"
        await self.repository.delete(chau)
        return ten_chau
