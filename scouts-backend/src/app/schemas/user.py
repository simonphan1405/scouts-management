"""
User Pydantic schemas.
Request/response models for user endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Unique username")
    full_name: Optional[str] = Field(None, max_length=255, description="Full name")
    is_active: bool = Field(default=True, description="Whether user is active")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    
    password: str = Field(..., min_length=8, max_length=100, description="User password")


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    
    email: Optional[EmailStr] = Field(None, description="User email address")
    username: Optional[str] = Field(None, min_length=3, max_length=100, description="Unique username")
    full_name: Optional[str] = Field(None, max_length=255, description="Full name")
    password: Optional[str] = Field(None, min_length=8, max_length=100, description="User password")
    is_active: Optional[bool] = Field(None, description="Whether user is active")


class UserInDB(UserBase):
    """Schema for user as stored in database."""
    
    id: int
    hashed_password: str
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class User(UserBase):
    """Schema for user in API responses."""
    
    id: int
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserList(BaseModel):
    """Schema for list of users."""
    
    users: list[User]
    total: int
    
    model_config = ConfigDict(from_attributes=True)
