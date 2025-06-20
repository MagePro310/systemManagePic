"""Upload service for handling file uploads."""

import os
import shutil
from typing import List, Optional
from fastapi import UploadFile, HTTPException

from ..models.upload import UploadResponse
from ..utils import create_folder_path, get_unique_filename, is_image_file, UPLOAD_DIR


class UploadService:
    """Service for handling file uploads."""
    
    @staticmethod
    async def upload_files(
        files: List[UploadFile], 
        folder_name: Optional[str] = None
    ) -> UploadResponse:
        """Upload multiple files to a folder."""
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Create folder
        folder_path, clean_folder_name = create_folder_path(folder_name)
        
        uploaded_files = []
        
        for file in files:
            if not file.filename:
                continue
                
            # Validate file type
            if not is_image_file(file.filename):
                raise HTTPException(
                    status_code=400, 
                    detail=f"File {file.filename} is not a valid image"
                )
            
            # Generate unique filename
            unique_filename = get_unique_filename(folder_path, file.filename)
            file_path = os.path.join(folder_path, unique_filename)
            
            # Save file
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                uploaded_files.append(unique_filename)
            except Exception as e:
                # Clean up any uploaded files on error
                for uploaded_file in uploaded_files:
                    uploaded_path = os.path.join(folder_path, uploaded_file)
                    if os.path.exists(uploaded_path):
                        os.remove(uploaded_path)
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error saving file {file.filename}: {str(e)}"
                )
        
        return UploadResponse(
            message="Files uploaded successfully",
            folder=clean_folder_name,
            files=uploaded_files,
            total_files=len(uploaded_files)
        )
