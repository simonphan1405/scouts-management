"""
Dao endpoints.
CRUD endpoints for dao management.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, CommonQueryParams, get_current_active_user, get_current_superuser
from app.models.user import User as UserModel
from app.schemas.base import MessageResponse
from app.schemas.dao import Dao, DaoCreate, DaoUpdate, DaoList
from app.services.dao import DaoService

router = APIRouter()


@router.get(
    "",
    response_model=DaoList,
    status_code=status.HTTP_200_OK,
    summary="List all dao",
    description="Retrieve a paginated list of all dao"
)
async def get_dao_list(
    commons: CommonQueryParams = Depends(),
    chau_id: Optional[int] = Query(None, description="Filter by chau ID"),
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> DaoList:
    """Get all dao with pagination, optionally filtered by chau_id."""
    service = DaoService(db)

    if chau_id is not None:
        dao_list, total = await service.get_dao_by_chau_id(chau_id, skip=commons.skip, limit=commons.limit)
    else:
        dao_list, total = await service.get_dao_list(skip=commons.skip, limit=commons.limit)

    return DaoList(dao=dao_list, total=total)


@router.get(
    "/{dao_id}",
    response_model=Dao,
    status_code=status.HTTP_200_OK,
    summary="Get dao by ID",
    description="Retrieve a specific dao by their ID"
)
async def get_dao(
    dao_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> Dao:
    """Get a dao by ID."""
    service = DaoService(db)
    return await service.get_dao_by_id(dao_id)


@router.post(
    "",
    response_model=Dao,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new dao",
    description="Create a new dao with the provided information"
)
async def create_dao(
    dao_data: DaoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> Dao:
    """Create a new dao."""
    service = DaoService(db)
    return await service.create_dao(dao_data)


@router.put(
    "/{dao_id}",
    response_model=Dao,
    status_code=status.HTTP_200_OK,
    summary="Update a dao",
    description="Update an existing dao's information"
)
async def update_dao(
    dao_id: int,
    dao_data: DaoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> Dao:
    """Update a dao."""
    service = DaoService(db)
    return await service.update_dao(dao_id, dao_data)


@router.delete(
    "/{dao_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a dao",
    description="Delete a dao by their ID"
)
async def delete_dao(
    dao_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_superuser),
) -> MessageResponse:
    """Delete a dao."""
    service = DaoService(db)
    ten_dao = await service.delete_dao(dao_id)
    return MessageResponse(message=f"Đạo '{ten_dao}' đã được xóa thành công")
