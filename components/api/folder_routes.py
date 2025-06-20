"""Folder API routes."""

from fastapi import APIRouter
from typing import Dict, Optional

from ..services.folder_service import FolderService
from ..models.folder import (
    Folder, 
    FolderInfo, 
    FolderRenameRequest, 
    FolderDuplicateRequest
)

router = APIRouter(prefix="", tags=["folders"])


@router.get("/folders")
def list_folders() -> Dict[str, Dict[str, Folder]]:
    """List all folders and their contents."""
    folders = FolderService.list_folders()
    return {"folders": folders}


@router.get("/folders/{folder_name}", response_model=Folder)
def get_folder_contents(folder_name: str):
    """Get contents of a specific folder."""
    return FolderService.get_folder_contents(folder_name)


@router.get("/folders/{folder_name}/info", response_model=FolderInfo)
def get_folder_info(folder_name: str):
    """Get detailed information about a folder."""
    return FolderService.get_folder_info(folder_name)


@router.put("/folders/{folder_name}/rename")
def rename_folder(folder_name: str, request: FolderRenameRequest):
    """Rename a folder."""
    return FolderService.rename_folder(folder_name, request.new_name)


@router.post("/folders/{folder_name}/duplicate")
def duplicate_folder(folder_name: str, request: FolderDuplicateRequest):
    """Duplicate a folder."""
    return FolderService.duplicate_folder(folder_name, request.new_name)


@router.delete("/folders/{folder_name}")
def delete_folder(folder_name: str):
    """Delete a folder and all its contents."""
    return FolderService.delete_folder(folder_name)
