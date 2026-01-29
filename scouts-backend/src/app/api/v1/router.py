"""
API v1 router.
Combines all v1 endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health, users

api_router = APIRouter()

# Include health check routes
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"]
)

# Include user routes
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)
