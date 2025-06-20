"""File utility functions."""

import os
import shutil
import mimetypes
from datetime import datetime
from typing import Optional, Dict, Any
from .constants import UPLOAD_DIR, ALLOWED_EXTENSIONS


def get_unique_filename(directory: str, filename: str) -> str:
    """Generate a unique filename by adding numbers if file exists."""
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


def sanitize_folder_name(folder_name: Optional[str]) -> str:
    """Sanitize and validate folder name."""
    if not folder_name:
        return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    # Remove invalid characters
    sanitized = "".join(c for c in folder_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
    
    if not sanitized:
        return "default_folder"
    
    return sanitized


def create_folder_path(folder_name: Optional[str]) -> tuple[str, str]:
    """Create and return folder path."""
    clean_name = sanitize_folder_name(folder_name)
    folder_path = os.path.join(UPLOAD_DIR, clean_name)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path, clean_name


def is_image_file(filename: str) -> bool:
    """Check if file is a valid image based on extension."""
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS


def get_mime_type(file_path: str) -> Optional[str]:
    """Get MIME type of a file."""
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type


def get_file_info(file_path: str) -> Dict[str, Any]:
    """Get detailed information about a file."""
    if not os.path.exists(file_path):
        return {}
    
    stat = os.stat(file_path)
    return {
        "size": stat.st_size,
        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "mime_type": get_mime_type(file_path)
    }


def get_folder_info(folder_path: str) -> Dict[str, Any]:
    """Get detailed information about a folder."""
    if not os.path.exists(folder_path) or not os.path.isdir(folder_path):
        return {}
    
    total_size = 0
    file_count = 0
    
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.exists(file_path):
                total_size += os.path.getsize(file_path)
                if is_image_file(file):
                    file_count += 1
    
    stat = os.stat(folder_path)
    return {
        "total_size": total_size,
        "file_count": file_count,
        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
    }


def copy_folder(src_path: str, dst_path: str) -> bool:
    """Copy a folder and all its contents."""
    try:
        shutil.copytree(src_path, dst_path)
        return True
    except Exception:
        return False


def delete_folder(folder_path: str) -> bool:
    """Delete a folder and all its contents."""
    try:
        shutil.rmtree(folder_path)
        return True
    except Exception:
        return False
