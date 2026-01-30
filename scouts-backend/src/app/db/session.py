"""
Database session management.
Provides async SQLAlchemy engine and session factory.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)

from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


# Create async engine
async_engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Verify connections before using
    future=True
)

# Create async session factory
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def init_db() -> None:
    """
    Initialize database.
    
    DEPRECATED: This function is deprecated in favor of Alembic migrations.
    Use 'alembic upgrade head' to create/update database schema instead.
    
    This function is kept for backward compatibility but does nothing.
    In production, always use Alembic for database migrations.
    """
    logger.warning(
        "init_db() is deprecated. Please use Alembic migrations instead. "
        "Run 'alembic upgrade head' to apply database migrations."
    )
    # The create_all() call has been removed. Use Alembic migrations.
    pass


async def close_db() -> None:
    """
    Close database connections.
    Should be called on application shutdown.
    """
    try:
        logger.info("Closing database connections...")
        await async_engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")
        raise


async def check_db_connection() -> bool:
    """
    Check if database connection is healthy.
    
    Returns:
        bool: True if connection is healthy, False otherwise
    """
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

