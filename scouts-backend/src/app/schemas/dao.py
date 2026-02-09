"""
Dao Pydantic schemas.
Request/response models for dao endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DaoBase(BaseModel):
    """Base dao schema with common fields."""

    ten_dao: Optional[str] = Field(None, max_length=255, description="Tên đạo")
    chau_id: Optional[int] = Field(None, description="ID của châu")
    dia_chi: Optional[str] = Field(None, max_length=255, description="Địa chỉ")
    mo_ta: Optional[str] = Field(None, description="Mô tả")


class DaoCreate(DaoBase):
    """Schema for creating a new dao."""

    ten_dao: str = Field(..., min_length=1, max_length=255, description="Tên đạo")
    chau_id: int = Field(..., description="ID của châu")


class DaoUpdate(DaoBase):
    """Schema for updating a dao."""

    pass


class DaoInDB(DaoBase):
    """Schema for dao as stored in database."""

    dao_id: int
    chau_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Dao(DaoBase):
    """Schema for dao in API responses."""

    dao_id: int
    chau_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DaoList(BaseModel):
    """Schema for list of dao."""

    dao: list[Dao]
    total: int

    model_config = ConfigDict(from_attributes=True)
