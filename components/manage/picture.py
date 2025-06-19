from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import List
import shutil
import os

UPLOAD_DIR = "uploads"

router = APIRouter()

@router.get("/pictures/{folder_name}/{filename}")
def get_picture(folder_name: str, filename: str):
    """Get a picture from a specific folder"""
    file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Picture not found")
    
    return FileResponse(
        file_path,
        media_type='application/octet-stream',
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.put("/pictures/{folder_name}/{filename}")
async def update_picture(folder_name: str, filename: str, file: UploadFile = File(...)):
    """Update a picture in a specific folder"""
    file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Picture not found")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "Picture updated", "filename": filename, "folder": folder_name}

@router.delete("/pictures/{folder_name}/{filename}")
def delete_picture(folder_name: str, filename: str):
    """Delete a specific picture from a folder"""
    file_path = os.path.join(UPLOAD_DIR, folder_name, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Picture not found")
    
    os.remove(file_path)
    return {"message": "Picture deleted", "filename": filename, "folder": folder_name}

@router.delete("/folders/{folder_name}")
def delete_folder(folder_name: str):
    """Delete an entire folder and all its contents"""
    folder_path = os.path.join(UPLOAD_DIR, folder_name)
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if not os.path.isdir(folder_path):
        raise HTTPException(status_code=400, detail="Not a folder")
    
    # Count files before deletion
    file_count = len([f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))])
    
    # Remove entire folder
    shutil.rmtree(folder_path)
    
    return {
        "message": "Folder deleted successfully",
        "folder_name": folder_name,
        "files_deleted": file_count
    }

# Legacy endpoints for backward compatibility
@router.get("/pictures/{filename}")
def get_picture_legacy(filename: str):
    """Legacy endpoint - searches all folders for the file"""
    # Search in all folders
    for item in os.listdir(UPLOAD_DIR):
        item_path = os.path.join(UPLOAD_DIR, item)
        if os.path.isdir(item_path):
            file_path = os.path.join(item_path, filename)
            if os.path.exists(file_path):
                return FileResponse(
                    file_path,
                    media_type='application/octet-stream',
                    headers={"Content-Disposition": f"attachment; filename={filename}"}
                )
    
    raise HTTPException(status_code=404, detail="Picture not found")

@router.delete("/pictures")
def delete_pictures_legacy(filenames: List[str]):
    """Legacy endpoint - deletes files from any folder"""
    deleted = []
    
    for filename in filenames:
        # Search in all folders
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            if os.path.isdir(item_path):
                file_path = os.path.join(item_path, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    deleted.append(filename)
                    break
    
    return {"deleted": deleted}