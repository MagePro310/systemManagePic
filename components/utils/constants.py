"""Constants used throughout the application."""

import os

# Upload directory configuration
UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions for images
ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'}

# Maximum file size (in bytes) - 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024
