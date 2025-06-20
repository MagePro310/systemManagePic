"""Folder-related data models."""

from pydantic import BaseModel
from typing import List, Optional
from .picture import Picture


class Folder(BaseModel):
    """Model for a folder containing pictures."""
    name: str
    pictures: List[Picture]
    count: int


class FolderInfo(BaseModel):
    """Extended folder information."""
    name: str
    pictures: List[Picture]
    count: int
    created_at: Optional[str] = None
    modified_at: Optional[str] = None
    total_size: Optional[int] = None


class FolderCreateRequest(BaseModel):
    """Request model for creating a new folder."""
    name: Optional[str] = None


class FolderRenameRequest(BaseModel):
    """Request model for renaming a folder."""
    new_name: str


class FolderDuplicateRequest(BaseModel):
    """Request model for duplicating a folder."""
    new_name: Optional[str] = None
