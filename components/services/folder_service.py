"""Folder service for managing folders."""

import os
from typing import Dict, Optional
from fastapi import HTTPException

from ..models.folder import Folder, FolderInfo
from ..models.picture import Picture
from ..utils import (
    UPLOAD_DIR, 
    is_image_file, 
    get_file_info, 
    get_folder_info,
    copy_folder,
    delete_folder,
    sanitize_folder_name
)


class FolderService:
    """Service for managing folders and their contents."""
    
    @staticmethod
    def list_folders() -> Dict[str, Folder]:
        """List all folders and their contents."""
        if not os.path.exists(UPLOAD_DIR):
            return {}
        
        folders = {}
        
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            
            if os.path.isdir(item_path):
                pictures = []
                
                # Get pictures in this folder
                for file in os.listdir(item_path):
                    file_path = os.path.join(item_path, file)
                    if os.path.isfile(file_path) and is_image_file(file):
                        size = os.path.getsize(file_path)
                        pictures.append(Picture(
                            filename=file,
                            size=size,
                            path=f"{item}/{file}",
                            folder=item
                        ))
                
                folders[item] = Folder(
                    name=item,
                    pictures=pictures,
                    count=len(pictures)
                )
        
        return folders
    
    @staticmethod
    def get_folder_contents(folder_name: str) -> Folder:
        """Get contents of a specific folder."""
        folder_path = os.path.join(UPLOAD_DIR, folder_name)
        
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        if not os.path.isdir(folder_path):
            raise HTTPException(status_code=400, detail="Path is not a folder")
        
        pictures = []
        
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path) and is_image_file(file):
                size = os.path.getsize(file_path)
                pictures.append(Picture(
                    filename=file,
                    size=size,
                    path=f"{folder_name}/{file}",
                    folder=folder_name
                ))
        
        return Folder(
            name=folder_name,
            pictures=pictures,
            count=len(pictures)
        )
    
    @staticmethod
    def get_folder_info(folder_name: str) -> FolderInfo:
        """Get detailed information about a folder."""
        folder_path = os.path.join(UPLOAD_DIR, folder_name)
        
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        folder = FolderService.get_folder_contents(folder_name)
        info = get_folder_info(folder_path)
        
        return FolderInfo(
            name=folder.name,
            pictures=folder.pictures,
            count=folder.count,
            created_at=info.get("created_at"),
            modified_at=info.get("modified_at"),
            total_size=info.get("total_size")
        )
    
    @staticmethod
    def rename_folder(old_name: str, new_name: str) -> Dict[str, str]:
        """Rename a folder."""
        old_path = os.path.join(UPLOAD_DIR, old_name)
        
        if not os.path.exists(old_path):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        clean_new_name = sanitize_folder_name(new_name)
        new_path = os.path.join(UPLOAD_DIR, clean_new_name)
        
        if os.path.exists(new_path):
            raise HTTPException(status_code=400, detail="Folder with new name already exists")
        
        try:
            os.rename(old_path, new_path)
            return {
                "message": "Folder renamed successfully",
                "old_name": old_name,
                "new_name": clean_new_name
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Error renaming folder: {str(e)}"
            )
    
    @staticmethod
    def duplicate_folder(folder_name: str, new_name: Optional[str] = None) -> Dict[str, str]:
        """Duplicate a folder."""
        source_path = os.path.join(UPLOAD_DIR, folder_name)
        
        if not os.path.exists(source_path):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        if new_name is None:
            new_name = f"{folder_name}_copy"
        
        clean_new_name = sanitize_folder_name(new_name)
        
        # Find unique name if needed
        counter = 1
        original_new_name = clean_new_name
        while os.path.exists(os.path.join(UPLOAD_DIR, clean_new_name)):
            clean_new_name = f"{original_new_name}_{counter}"
            counter += 1
        
        dest_path = os.path.join(UPLOAD_DIR, clean_new_name)
        
        try:
            if copy_folder(source_path, dest_path):
                return {
                    "message": "Folder duplicated successfully",
                    "original_name": folder_name,
                    "new_name": clean_new_name
                }
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Error duplicating folder"
                )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error duplicating folder: {str(e)}"
            )
    
    @staticmethod
    def delete_folder(folder_name: str) -> Dict[str, str]:
        """Delete a folder and all its contents."""
        folder_path = os.path.join(UPLOAD_DIR, folder_name)
        
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        try:
            if delete_folder(folder_path):
                return {
                    "message": "Folder deleted successfully",
                    "folder_name": folder_name
                }
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Error deleting folder"
                )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting folder: {str(e)}"
            )
