"""
Health check endpoints.
Provides endpoints for application and database health monitoring.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import check_db_connection
from app.dependencies import get_db
from app.schemas.base import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Basic health check",
    description="Returns the basic health status of the application"
)
async def health_check() -> HealthResponse:
    """Basic health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        details={
            "service": "Scouts Backend API",
            "version": "1.0.0"
        }
    )


@router.get(
    "/health/db",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Database health check",
    description="Returns the health status of the database connection"
)
async def database_health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Database health check endpoint."""
    db_healthy = await check_db_connection()
    
    return HealthResponse(
        status="healthy" if db_healthy else "unhealthy",
        timestamp=datetime.utcnow(),
        details={
            "database": "connected" if db_healthy else "disconnected"
        }
    )
