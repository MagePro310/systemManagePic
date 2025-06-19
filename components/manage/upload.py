from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List, Optional
import shutil
import os
import mimetypes
from datetime import datetime

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

def get_unique_filename(directory, filename):
    """Generate a unique filename by adding numbers if file exists"""
    base_path = os.path.join(directory, filename)
    
    if not os.path.exists(base_path):
        return filename
    
    # Split filename and extension
    name, ext = os.path.splitext(filename)
    counter = 1
    
    # Keep incrementing until we find a unique name
    while True:
        new_filename = f"{name}_{counter}{ext}"
        new_path = os.path.join(directory, new_filename)
        
        if not os.path.exists(new_path):
            return new_filename
        
        counter += 1

def create_folder_path(folder_name):
    """Create and return folder path"""
    if not folder_name:
        folder_name = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    # Sanitize folder name
    folder_name = "".join(c for c in folder_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
    if not folder_name:
        folder_name = "default_folder"
    
    folder_path = os.path.join(UPLOAD_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path, folder_name

@router.post("/pictures")
async def upload_pictures(
    files: List[UploadFile] = File(...),
    folder_name: Optional[str] = Form(None)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Create folder
    folder_path, actual_folder_name = create_folder_path(folder_name)
    
    saved_files = []
    errors = []
    
    for file in files:
        try:
            # Check if file is an image
            if not file.content_type or not file.content_type.startswith('image/'):
                errors.append(f"{file.filename}: Not an image file")
                continue
            
            # Check file size (limit to 10MB)
            if file.size and file.size > 10 * 1024 * 1024:
                errors.append(f"{file.filename}: File too large (max 10MB)")
                continue
            
            # Get unique filename within the folder
            unique_filename = get_unique_filename(folder_path, file.filename)
            file_path = os.path.join(folder_path, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_info = {
                "filename": unique_filename,
                "original_name": file.filename,
                "folder": actual_folder_name,
                "path": file_path,
                "size": file.size,
                "renamed": unique_filename != file.filename
            }
            
            saved_files.append(file_info)
            
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    result = {
        "uploaded": saved_files,
        "folder": actual_folder_name,
        "total_files": len(saved_files)
    }
    
    if errors:
        result["errors"] = errors
    
    if not saved_files and errors:
        raise HTTPException(status_code=400, detail="No files were uploaded successfully")
    
    return result

@router.post("/folders")
async def create_folder(folder_name: str = Form(...)):
    """Create a new empty folder"""
    try:
        folder_path, actual_folder_name = create_folder_path(folder_name)
        return {
            "message": "Folder created successfully",
            "folder_name": actual_folder_name,
            "path": folder_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")