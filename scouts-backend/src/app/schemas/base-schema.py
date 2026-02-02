"""
Base Pydantic schemas.
Provides common schemas for responses, pagination, etc.
"""

from datetime import datetime
from typing import Any, Generic, List, TypeVar

from pydantic import BaseModel, ConfigDict


class TimestampSchema(BaseModel):
    """Schema mixin for timestamps."""
    
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    """Generic message response."""
    
    message: str


class ErrorResponse(BaseModel):
    """Error response schema."""
    
    error: dict[str, Any]


class HealthResponse(BaseModel):
    """Health check response."""
    
    status: str
    timestamp: datetime
    details: dict[str, Any] | None = None


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""
    
    items: List[T]
    total: int
    skip: int
    limit: int
    
    model_config = ConfigDict(from_attributes=True)
