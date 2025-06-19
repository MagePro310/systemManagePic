from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List, Optional
import shutil
import os
import mimetypes

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

@router.post("/pictures")
async def upload_pictures(
    files: List[UploadFile] = File(...),
    replace: bool = Form(False),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    saved_files = []
    replaced_files = []
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
            
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            file_exists = os.path.exists(file_path)
            
            # Handle existing files based on replace option
            if file_exists and not replace:
                # Create unique filename
                base_name, ext = os.path.splitext(file.filename)
                counter = 1
                
                while os.path.exists(file_path):
                    new_filename = f"{base_name}_{counter}{ext}"
                    file_path = os.path.join(UPLOAD_DIR, new_filename)
                    counter += 1
                
                final_filename = os.path.basename(file_path)
            else:
                final_filename = file.filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_info = {
                "filename": final_filename,
                "original_name": file.filename,
                "path": file_path,
                "size": file.size
            }
            
            if file_exists and replace:
                replaced_files.append(file_info)
            else:
                saved_files.append(file_info)
            
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    result = {
        "uploaded": saved_files,
        "replaced": replaced_files
    }
    
    if errors:
        result["errors"] = errors
    
    if not saved_files and not replaced_files and errors:
        raise HTTPException(status_code=400, detail="No files were uploaded successfully")
    
    return result