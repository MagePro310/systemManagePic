"""Upload-related data models."""

from pydantic import BaseModel
from typing import List


class UploadResponse(BaseModel):
    """Response model for file uploads."""
    message: str
    folder: str
    files: List[str]
    total_files: int
