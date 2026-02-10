"""
API v1 router.
Combines all v1 endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, users, chau, dao

api_router = APIRouter()

# Include authentication routes
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

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

# Include chau routes
api_router.include_router(
    chau.router,
    prefix="/chau",
    tags=["Chau"]
)

# Include dao routes
api_router.include_router(
    dao.router,
    prefix="/dao",
    tags=["Dao"]
)

