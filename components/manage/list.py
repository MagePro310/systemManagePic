from fastapi import APIRouter, HTTPException
import os
from typing import Dict, List

UPLOAD_DIR = "uploads"

router = APIRouter()

@router.get("/folders")
def list_folders():
    """List all folders and their contents"""
    try:
        if not os.path.exists(UPLOAD_DIR):
            return {"folders": []}
        
        folders = {}
        
        # Get all items in upload directory
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            
            if os.path.isdir(item_path):
                # Get pictures in this folder
                pictures = []
                for file in os.listdir(item_path):
                    file_path = os.path.join(item_path, file)
                    if os.path.isfile(file_path) and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg')):
                        # Get file size
                        size = os.path.getsize(file_path)
                        pictures.append({
                            "filename": file,
                            "size": size,
                            "path": f"{item}/{file}"
                        })
                
                folders[item] = {
                    "name": item,
                    "pictures": pictures,
                    "count": len(pictures)
                }
        
        return {"folders": folders}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing folders: {str(e)}")

@router.get("/folders/{folder_name}")
def list_folder_contents(folder_name: str):
    """List contents of a specific folder"""
    try:
        folder_path = os.path.join(UPLOAD_DIR, folder_name)
        
        if not os.path.exists(folder_path):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        if not os.path.isdir(folder_path):
            raise HTTPException(status_code=400, detail="Not a folder")
        
        pictures = []
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path) and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg')):
                size = os.path.getsize(file_path)
                pictures.append({
                    "filename": file,
                    "size": size,
                    "path": f"{folder_name}/{file}"
                })
        
        return {
            "folder_name": folder_name,
            "pictures": pictures,
            "count": len(pictures)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing folder: {str(e)}")

# Legacy endpoint for backward compatibility
@router.get("/pictures")
def list_all_pictures():
    """List all pictures from all folders"""
    try:
        folders_data = list_folders()
        all_pictures = []
        
        for folder_name, folder_info in folders_data["folders"].items():
            for picture in folder_info["pictures"]:
                all_pictures.append(picture["path"])
        
        return {"pictures": all_pictures}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing pictures: {str(e)}")