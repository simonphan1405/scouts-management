"""
User endpoints.
CRUD endpoints for user management.
"""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, CommonQueryParams
from app.schemas.base import MessageResponse
from app.schemas.user import User, UserCreate, UserUpdate, UserList
from app.services.user import UserService

router = APIRouter()


@router.get(
    "",
    response_model=UserList,
    status_code=status.HTTP_200_OK,
    summary="List all users",
    description="Retrieve a paginated list of all users"
)
async def get_users(
    commons: CommonQueryParams = Depends(),
    db: AsyncSession = Depends(get_db)
) -> UserList:
    """Get all users with pagination."""
    service = UserService(db)
    users, total = await service.get_users(skip=commons.skip, limit=commons.limit)
    
    return UserList(users=users, total=total)


@router.get(
    "/{user_id}",
    response_model=User,
    status_code=status.HTTP_200_OK,
    summary="Get user by ID",
    description="Retrieve a specific user by their ID"
)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get a user by ID."""
    service = UserService(db)
    return await service.get_user_by_id(user_id)


@router.post(
    "",
    response_model=User,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Create a new user with the provided information"
)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Create a new user."""
    service = UserService(db)
    return await service.create_user(user_data)


@router.put(
    "/{user_id}",
    response_model=User,
    status_code=status.HTTP_200_OK,
    summary="Update a user",
    description="Update an existing user's information"
)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Update a user."""
    service = UserService(db)
    return await service.update_user(user_id, user_data)


@router.delete(
    "/{user_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a user",
    description="Delete a user by their ID"
)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """Delete a user."""
    service = UserService(db)
    await service.delete_user(user_id)
    return MessageResponse(message=f"User {user_id} deleted successfully")
