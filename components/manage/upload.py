from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
import shutil
import os
import mimetypes

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

@router.post("/pictures")
async def upload_pictures(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
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
            
            # Get unique filename (automatically adds number if exists)
            unique_filename = get_unique_filename(UPLOAD_DIR, file.filename)
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_info = {
                "filename": unique_filename,
                "original_name": file.filename,
                "path": file_path,
                "size": file.size,
                "renamed": unique_filename != file.filename
            }
            
            saved_files.append(file_info)
            
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    result = {"uploaded": saved_files}
    
    if errors:
        result["errors"] = errors
    
    if not saved_files and errors:
        raise HTTPException(status_code=400, detail="No files were uploaded successfully")
    
    return result