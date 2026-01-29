"""
Dependency injection for FastAPI endpoints.
Provides reusable dependencies for database sessions, authentication, etc.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session.
    
    Yields:
        AsyncSession: SQLAlchemy async database session
        
    Example:
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


class CommonQueryParams:
    """Common query parameters for pagination and filtering."""
    
    def __init__(
        self,
        skip: int = 0,
        limit: int = 100,
        sort_by: str | None = None,
        order: str = "asc"
    ):
        self.skip = skip
        self.limit = min(limit, 100)  # Max 100 items per page
        self.sort_by = sort_by
        self.order = order.lower() if order.lower() in ["asc", "desc"] else "asc"
