"""Upload API routes."""

from fastapi import APIRouter, File, UploadFile, Form
from typing import List, Optional

from ..services.upload_service import UploadService
from ..models.upload import UploadResponse

router = APIRouter(prefix="", tags=["upload"])


@router.post("/pictures", response_model=UploadResponse)
async def upload_pictures(
    files: List[UploadFile] = File(...),
    folder: Optional[str] = Form(None)
):
    """Upload multiple pictures to a folder."""
    return await UploadService.upload_files(files, folder)
