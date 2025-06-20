"""Picture API routes."""

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse

from ..services.picture_service import PictureService
from ..models.picture import PictureInfo

router = APIRouter(prefix="", tags=["pictures"])


@router.get("/pictures/{folder_name}/{filename}")
def get_picture(folder_name: str, filename: str) -> FileResponse:
    """Get a picture file for download/viewing."""
    return PictureService.get_picture_file(folder_name, filename)


@router.get("/pictures/{folder_name}/{filename}/info", response_model=PictureInfo)
def get_picture_info(folder_name: str, filename: str):
    """Get detailed information about a picture."""
    return PictureService.get_picture_info(folder_name, filename)


@router.put("/pictures/{folder_name}/{filename}")
async def update_picture(
    folder_name: str, 
    filename: str, 
    file: UploadFile = File(...)
):
    """Update/replace a picture file."""
    return await PictureService.update_picture(folder_name, filename, file)


@router.delete("/pictures/{folder_name}/{filename}")
def delete_picture(folder_name: str, filename: str):
    """Delete a specific picture."""
    return PictureService.delete_picture(folder_name, filename)
