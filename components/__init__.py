"""Components package for the picture management system.

This package contains the core components of the application organized into:
- api: FastAPI route handlers
- services: Business logic and data operations  
- models: Data models and schemas
- utils: Shared utilities and helpers
"""

from .api import upload_router, folder_router, picture_router
from .services import UploadService, FolderService, PictureService
from .models import Picture, Folder, UploadResponse
from .utils import UPLOAD_DIR, ALLOWED_EXTENSIONS

__all__ = [
    # API routers
    "upload_router",
    "folder_router", 
    "picture_router",
    
    # Services
    "UploadService",
    "FolderService",
    "PictureService",
    
    # Models
    "Picture",
    "Folder", 
    "UploadResponse",
    
    # Constants
    "UPLOAD_DIR",
    "ALLOWED_EXTENSIONS"
]
