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
    Creates all tables defined in models.
    
    Note: In production, use Alembic for migrations instead.
    """
    try:
        from app.db.base import Base
        
        logger.info("Initializing database...")
        
        async with async_engine.begin() as conn:
            # In production, comment this out and use Alembic
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


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

