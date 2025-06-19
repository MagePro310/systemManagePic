from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import List
import shutil
import os

UPLOAD_DIR = "uploads"

router = APIRouter()

@router.get("/pictures/{filename}")
def get_picture(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Picture not found")
    
    # Return file with proper headers for download
    return FileResponse(
        file_path,
        media_type='application/octet-stream',
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.put("/pictures/{filename}")
async def update_picture(filename: str, file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Picture not found")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "Picture updated", "filename": filename}

@router.delete("/pictures")
def delete_pictures(filenames: List[str]):
    deleted = []
    for filename in filenames:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            deleted.append(filename)
    return {"deleted": deleted}