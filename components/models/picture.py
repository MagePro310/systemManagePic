"""Picture-related data models."""

from pydantic import BaseModel
from typing import Optional


class Picture(BaseModel):
    """Model for a picture file."""
    filename: str
    size: int
    path: str
    folder: str


class PictureInfo(BaseModel):
    """Extended picture information."""
    filename: str
    size: int
    path: str
    folder: str
    created_at: Optional[str] = None
    modified_at: Optional[str] = None
    mime_type: Optional[str] = None
