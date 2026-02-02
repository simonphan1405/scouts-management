"""
API v1 router.
Combines all v1 endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth_endpoint, health_endpoint, users_endpoint, chau_endpoint

api_router = APIRouter()

# Include authentication routes
api_router.include_router(
    auth_endpoint.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Include health check routes
api_router.include_router(
    health_endpoint.router,
    prefix="/health",
    tags=["Health"]
)

# Include user routes
api_router.include_router(
    users_endpoint.router,
    prefix="/users",
    tags=["Users"]
)

# Include chau routes
api_router.include_router(
    chau_endpoint.router,
    prefix="/chau",
    tags=["Chau"]
)

