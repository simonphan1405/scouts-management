"""
Logging configuration for the application.
Provides structured logging with request ID tracking.
"""

import logging
import sys
from pathlib import Path

from app.config import settings


def setup_logging() -> None:
    """
    Configure application logging.
    Sets up formatters, handlers, and log levels based on environment.
    """
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Determine log level
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create formatter
    if settings.LOG_FORMAT == "json":
        # In production, you might want to use a JSON formatter library
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    else:
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    formatter = logging.Formatter(log_format)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # File handler (only in production or if needed)
    if settings.is_production:
        file_handler = logging.FileHandler(log_dir / "app.log")
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    
    if settings.is_production:
        root_logger.addHandler(file_handler)
    
    # Set third-party library log levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Name of the module requesting the logger
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)
