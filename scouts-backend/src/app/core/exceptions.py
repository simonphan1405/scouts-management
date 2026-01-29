"""
Custom exceptions and exception handlers for the API.
Provides consistent error responses across the application.
"""

from typing import Any, Dict
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class APIException(HTTPException):
    """Base exception for API errors."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Dict[str, str] | None = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundException(APIException):
    """Exception raised when a resource is not found."""
    
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class BadRequestException(APIException):
    """Exception raised for bad requests."""
    
    def __init__(self, detail: str = "Bad request"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class UnauthorizedException(APIException):
    """Exception raised for unauthorized access."""
    
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(APIException):
    """Exception raised for forbidden access."""
    
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class ConflictException(APIException):
    """Exception raised when there is a conflict."""
    
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """
    Handler for custom API exceptions.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse with error details
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "status_code": exc.status_code,
                "path": str(request.url)
            }
        },
        headers=exc.headers
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler for general unhandled exceptions.
    
    Args:
        request: The incoming request
        exc: The exception that was raised
        
    Returns:
        JSONResponse with generic error message
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Internal server error",
                "status_code": 500,
                "path": str(request.url)
            }
        }
    )
