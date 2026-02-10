"""
Initial data setup.
Creates default superuser on first startup if it doesn't exist.
"""

from app.config import settings
from app.core.logging import get_logger
from app.db.session import async_session_maker
from app.models.user import User
from app.repositories.user import UserRepository
from app.services.user import UserService

logger = get_logger(__name__)


async def create_default_superuser() -> None:
    """
    Create default superuser if it doesn't already exist.
    Uses environment variables for user credentials.
    """
    async with async_session_maker() as session:
        try:
            repo = UserRepository(session)

            existing_user = await repo.get_by_email(settings.DEFAULT_SUPERUSER_EMAIL)
            if existing_user:
                logger.info(
                    f"Default superuser '{settings.DEFAULT_SUPERUSER_EMAIL}' already exists, skipping creation"
                )
                return

            user = User(
                email=settings.DEFAULT_SUPERUSER_EMAIL,
                username=settings.DEFAULT_SUPERUSER_USERNAME,
                full_name=settings.DEFAULT_SUPERUSER_FULL_NAME,
                hashed_password=UserService.hash_password(settings.DEFAULT_SUPERUSER_PASSWORD),
                is_active=True,
                is_superuser=True,
            )

            await repo.create(user)
            await session.commit()

            logger.info(
                f"Default superuser created: {settings.DEFAULT_SUPERUSER_EMAIL}"
            )
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to create default superuser: {e}")
            raise
