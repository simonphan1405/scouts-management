"""
Custom middleware for the FastAPI application.
Provides request ID tracking, timing, and logging.
"""

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging import get_logger

logger = get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add a unique request ID to each request."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Add request ID to request state and response headers.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            Response with X-Request-ID header
        """
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response


class TimingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request processing time."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Time the request and add timing header.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            Response with X-Process-Time header
        """
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        
        # Log request details
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.4f}s"
        )
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Add security headers to response.
        
        Args:
            request: The incoming request
            call_next: The next middleware or route handler
            
        Returns:
            Response with security headers
        """
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
