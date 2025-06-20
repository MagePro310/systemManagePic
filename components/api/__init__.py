"""API route handlers."""

from .upload_routes import router as upload_router
from .folder_routes import router as folder_router
from .picture_routes import router as picture_router

__all__ = [
    "upload_router",
    "folder_router",
    "picture_router"
]
