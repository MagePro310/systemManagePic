from fastapi import APIRouter
import os

UPLOAD_DIR = "uploads"

router = APIRouter()

@router.get("/pictures")
def list_pictures():
    files = os.listdir(UPLOAD_DIR)
    return {"pictures": files}