"""Picture service for managing individual pictures."""

import os
import shutil
from typing import Dict
from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse

from ..models.picture import Picture, PictureInfo
from ..utils import UPLOAD_DIR, is_image_file, get_file_info


class PictureService:
    """Service for managing individual pictures."""
    
    @staticmethod
    def get_picture_file(folder_name: str, filename: str) -> FileResponse:
        """Get a picture file for download/viewing."""
        file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Picture not found")
        
        return FileResponse(
            file_path,
            media_type='application/octet-stream',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    @staticmethod
    def get_picture_info(folder_name: str, filename: str) -> PictureInfo:
        """Get detailed information about a picture."""
        file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Picture not found")
        
        file_info = get_file_info(file_path)
        
        return PictureInfo(
            filename=filename,
            size=file_info.get("size", 0),
            path=f"{folder_name}/{filename}",
            folder=folder_name,
            created_at=file_info.get("created_at"),
            modified_at=file_info.get("modified_at"),
            mime_type=file_info.get("mime_type")
        )
    
    @staticmethod
    async def update_picture(
        folder_name: str, 
        filename: str, 
        file: UploadFile
    ) -> Dict[str, str]:
        """Update/replace a picture file."""
        file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Picture not found")
        
        if not file.filename or not is_image_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail="Invalid image file"
            )
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            return {
                "message": "Picture updated successfully",
                "filename": filename,
                "folder": folder_name
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error updating picture: {str(e)}"
            )
    
    @staticmethod
    def delete_picture(folder_name: str, filename: str) -> Dict[str, str]:
        """Delete a specific picture."""
        file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Picture not found")
        
        try:
            os.remove(file_path)
            return {
                "message": "Picture deleted successfully",
                "filename": filename,
                "folder": folder_name
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting picture: {str(e)}"
            )
