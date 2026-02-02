"""
Chau endpoints.
CRUD endpoints for chau management.
"""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, CommonQueryParams
from app.schemas.base_schema import MessageResponse
from app.schemas.chau_schema import Chau, ChauCreate, ChauUpdate, ChauList
from app.services.chau_service import ChauService

router = APIRouter()


@router.get(
    "",
    response_model=ChauList,
    status_code=status.HTTP_200_OK,
    summary="List all chau",
    description="Retrieve a paginated list of all chau"
)
async def get_chau_list(
    commons: CommonQueryParams = Depends(),
    db: AsyncSession = Depends(get_db)
) -> ChauList:
    """Get all chau with pagination."""
    service = ChauService(db)
    chau_list, total = await service.get_chau_list(skip=commons.skip, limit=commons.limit)
    
    return ChauList(chau=chau_list, total=total)


@router.get(
    "/{chau_id}",
    response_model=Chau,
    status_code=status.HTTP_200_OK,
    summary="Get chau by ID",
    description="Retrieve a specific chau by their ID"
)
async def get_chau(
    chau_id: int,
    db: AsyncSession = Depends(get_db)
) -> Chau:
    """Get a chau by ID."""
    service = ChauService(db)
    return await service.get_chau_by_id(chau_id)


@router.post(
    "",
    response_model=Chau,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chau",
    description="Create a new chau with the provided information"
)
async def create_chau(
    chau_data: ChauCreate,
    db: AsyncSession = Depends(get_db)
) -> Chau:
    """Create a new chau."""
    service = ChauService(db)
    return await service.create_chau(chau_data)


@router.put(
    "/{chau_id}",
    response_model=Chau,
    status_code=status.HTTP_200_OK,
    summary="Update a chau",
    description="Update an existing chau's information"
)
async def update_chau(
    chau_id: int,
    chau_data: ChauUpdate,
    db: AsyncSession = Depends(get_db)
) -> Chau:
    """Update a chau."""
    service = ChauService(db)
    return await service.update_chau(chau_id, chau_data)


@router.delete(
    "/{chau_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a chau",
    description="Delete a chau by their ID"
)
async def delete_chau(
    chau_id: int,
    db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """Delete a chau."""
    service = ChauService(db)
    ten_chau = await service.delete_chau(chau_id)
    return MessageResponse(message=f"Châu '{ten_chau}' đã được xóa thành công")
