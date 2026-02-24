"""
Chau Pydantic schemas.
Request/response models for chau endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ChauBase(BaseModel):
    """Base chau schema with common fields."""
    
    ten_chau: Optional[str] = Field(None, max_length=255, description="Tên châu")
    dia_chi: Optional[str] = Field(None, max_length=255, description="Địa chỉ")
    mo_ta: Optional[str] = Field(None, description="Mô tả")


class ChauCreate(ChauBase):
    """Schema for creating a new chau."""
    
    ten_chau: str = Field(..., min_length=1, max_length=255, description="Tên châu")


class ChauUpdate(ChauBase):
    """Schema for updating a chau."""
    
    pass


class ChauInDB(ChauBase):
    """Schema for chau as stored in database."""
    
    chau_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Chau(ChauBase):
    """Schema for chau in API responses."""
    
    chau_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChauSearch(BaseModel):
    """Schema for searching chau."""

    ten_chau: Optional[str] = Field(None, description="Tìm kiếm theo tên châu")
    dia_chi: Optional[str] = Field(None, description="Tìm kiếm theo địa chỉ")
    mo_ta: Optional[str] = Field(None, description="Tìm kiếm theo mô tả")


class ChauList(BaseModel):
    """Schema for list of chau."""

    chau: list[Chau]
    total: int

    model_config = ConfigDict(from_attributes=True)
