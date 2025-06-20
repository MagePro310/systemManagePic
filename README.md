# Picture Management System

A FastAPI-based picture management system that allows you to upload, organize, and manage pictures through both web UI, web API, and terminal commands.

## Table of Contents

- [Picture Management System](#picture-management-system)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Using the Web UI](#using-the-web-ui)
    - [Features of the Web UI:](#features-of-the-web-ui)
      - [📤 Upload Tab](#-upload-tab)
      - [🖼️ Gallery Tab](#️-gallery-tab)
      - [📁 Folders Tab](#-folders-tab)
      - [⚡ Additional Features](#-additional-features)
    - [Web UI Workflow Example:](#web-ui-workflow-example)
  - [Installation (Manual)](#installation-manual)
  - [Starting the Server](#starting-the-server)
  - [Terminal Usage Guide](#terminal-usage-guide)
    - [Using cURL Commands](#using-curl-commands)
      - [1. Upload Pictures](#1-upload-pictures)
      - [2. List Folders and Pictures](#2-list-folders-and-pictures)
      - [3. Download Pictures](#3-download-pictures)
      - [4. Update Pictures](#4-update-pictures)
      - [5. Delete Operations](#5-delete-operations)
    - [Using the CLI Script](#using-the-cli-script)
      - [Available Commands](#available-commands)
  - [API Endpoints](#api-endpoints)
  - [Examples](#examples)
    - [Complete Workflow Example](#complete-workflow-example)
    - [Batch Operations](#batch-operations)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Useful Commands](#useful-commands)
  - [File Structure](#file-structure)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 📁 **Folder Management**: Organize pictures in custom folders
- 📤 **Upload Pictures**: Upload single or multiple pictures with drag & drop
- 📋 **List Contents**: View all folders and their pictures in a beautiful gallery
- 🖼️ **Picture Operations**: View, update, and delete pictures
- � **Modern Web UI**: Clean, responsive interface for easy management
- �🔧 **CLI Interface**: Easy terminal commands for all operations
- 🌐 **Web API**: RESTful API for programmatic access
- 📱 **Mobile Friendly**: Works great on desktop, tablet, and mobile devices

## Prerequisites

- Python 3.7+
- pip (Python package installer)
- curl (for terminal commands)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Start

1. **Run the setup script:**

   ```bash
   ./setup.sh
   ```

2. **Start the server:**

   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Open the web interface:**
   - **Web UI**: http://localhost:8000/ui
   - **API Documentation**: http://localhost:8000/docs
   - **API**: http://localhost:8000/

## Using the Web UI

The web interface provides an intuitive way to manage your pictures without using terminal commands.

### Features of the Web UI:

#### 📤 Upload Tab
- **Drag & Drop**: Simply drag pictures from your file manager into the upload area
- **File Browser**: Click to browse and select multiple files
- **Custom Folders**: Organize uploads into named folders
- **Live Preview**: See thumbnails of selected files before uploading
- **Progress Tracking**: Real-time upload progress with visual feedback

#### 🖼️ Gallery Tab
- **Grid View**: Beautiful grid layout showing all your pictures
- **Folder Filtering**: Filter pictures by specific folders
- **Quick Actions**: View, download, or delete pictures with one click
- **Image Preview**: Click any image to view it in full size
- **Responsive Design**: Adapts to any screen size

#### 📁 Folders Tab
- **Folder Overview**: See all folders with picture counts and previews
- **Bulk Operations**: Download all pictures from a folder or delete entire folders
- **Quick Navigation**: Click any folder to jump to gallery view with that folder selected

#### ⚡ Additional Features
- **Keyboard Shortcuts**: 
  - `Ctrl+1`: Upload tab
  - `Ctrl+2`: Gallery tab  
  - `Ctrl+3`: Folders tab
  - `Ctrl+R` or `F5`: Refresh current view
- **Toast Notifications**: Real-time feedback for all operations
- **Error Handling**: Graceful error messages and retry options
- **Offline Detection**: Notifications when connection is lost

### Web UI Workflow Example:

1. **Upload Pictures:**
   - Go to the Upload tab
   - Drag your pictures into the upload area or click to browse
   - Optionally enter a folder name (or leave empty for auto-generated folder)
   - Click "Upload Files"

2. **View Your Gallery:**
   - Switch to the Gallery tab to see all uploaded pictures
   - Use the folder filter to view pictures from specific folders
   - Click any picture to view it full-size

3. **Manage Folders:**
   - Go to the Folders tab to see an overview of all your folders
   - Click a folder to view its contents in the gallery
   - Use the action buttons to download all pictures or delete folders

## Installation (Manual)
   ```bash
   cd /path/to/your/system
   ```

2. **Install required Python packages:**
   ```bash
   pip install fastapi uvicorn python-multipart
   ```

3. **Make the CLI script executable:**
   ```bash
   chmod +x picture_cli.sh
   ```

## Starting the Server

1. **Start the FastAPI server:**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Verify the server is running:**
   ```bash
   curl http://localhost:8000/
   ```
   You should see: `{"message":"Picture Management API"}`

## Terminal Usage Guide

### Using cURL Commands

#### 1. Upload Pictures

**Upload single picture to a specific folder:**
```bash
curl -X POST "http://localhost:8000/pictures" \
  -F "files=@/path/to/your/picture.jpg" \
  -F "folder_name=my_photos"
```

**Upload multiple pictures:**
```bash
curl -X POST "http://localhost:8000/pictures" \
  -F "files=@/path/to/photo1.jpg" \
  -F "files=@/path/to/photo2.png" \
  -F "folder_name=vacation_2025"
```

**Upload without specifying folder (auto-generates timestamp folder):**
```bash
curl -X POST "http://localhost:8000/pictures" \
  -F "files=@/path/to/your/picture.jpg"
```

#### 2. List Folders and Pictures

**List all folders:**
```bash
curl -X GET "http://localhost:8000/folders"
```

**List contents of a specific folder:**
```bash
curl -X GET "http://localhost:8000/folders/my_photos"
```

#### 3. Download Pictures

**Download a specific picture:**
```bash
curl -X GET "http://localhost:8000/pictures/my_photos/picture.jpg" \
  --output downloaded_picture.jpg
```

#### 4. Update Pictures

**Replace an existing picture:**
```bash
curl -X PUT "http://localhost:8000/pictures/my_photos/old_picture.jpg" \
  -F "file=@/path/to/new_picture.jpg"
```

#### 5. Delete Operations

**Delete a specific picture:**
```bash
curl -X DELETE "http://localhost:8000/pictures/my_photos/picture.jpg"
```

**Delete an entire folder:**
```bash
curl -X DELETE "http://localhost:8000/folders/my_photos"
```

### Using the CLI Script

The `picture_cli.sh` script provides a simplified interface for common operations.

#### Available Commands

**Download a picture:**

```bash
./picture_cli.sh get folder_name/filename.jpg
```

**Upload a picture:**

```bash
./picture_cli.sh upload /path/to/your/picture.jpg [folder_name]
```

**List all folders:**

```bash
./picture_cli.sh list
```

**List pictures in a specific folder:**

```bash
./picture_cli.sh list folder_name
```

**Delete a picture:**

```bash
./picture_cli.sh delete folder_name/filename.jpg
```

**Delete a folder:**

```bash
./picture_cli.sh delete_folder folder_name
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |
| POST | `/pictures` | Upload pictures |
| GET | `/folders` | List all folders |
| GET | `/folders/{folder_name}` | List folder contents |
| GET | `/pictures/{folder_name}/{filename}` | Download picture |
| PUT | `/pictures/{folder_name}/{filename}` | Update picture |
| DELETE | `/pictures/{folder_name}/{filename}` | Delete picture |
| DELETE | `/folders/{folder_name}` | Delete folder |

## Examples

### Complete Workflow Example

1. **Start the server:**
   ```bash
   python -m uvicorn main:app --reload
   ```

2. **Upload some vacation photos:**
   ```bash
   curl -X POST "http://localhost:8000/pictures" \
     -F "files=@beach.jpg" \
     -F "files=@sunset.png" \
     -F "folder_name=vacation_2025"
   ```

3. **Check what was uploaded:**
   ```bash
   curl -X GET "http://localhost:8000/folders/vacation_2025"
   ```

4. **Download a picture:**
   ```bash
   ./picture_cli.sh get vacation_2025/beach.jpg
   ```

5. **List all your folders:**
   ```bash
   curl -X GET "http://localhost:8000/folders"
   ```

### Batch Operations

**Upload all JPG files from a directory:**
```bash
for file in /path/to/photos/*.jpg; do
  curl -X POST "http://localhost:8000/pictures" \
    -F "files=@$file" \
    -F "folder_name=batch_upload"
done
```

**Download all pictures from a folder:**
```bash
# First get the list of files
folder_contents=$(curl -s "http://localhost:8000/folders/my_photos")

# Then download each file (requires jq for JSON parsing)
echo $folder_contents | jq -r '.pictures[].filename' | while read filename; do
  ./picture_cli.sh get "my_photos/$filename"
done
```

## Troubleshooting

### Common Issues

1. **Server not starting:**
   ```bash
   # Check if port 8000 is already in use
   lsof -i :8000
   
   # Use a different port
   python -m uvicorn main:app --reload --port 8001
   ```

2. **Permission denied for CLI script:**
   ```bash
   chmod +x picture_cli.sh
   ```

3. **File upload fails:**
   - Check file path is correct
   - Ensure file exists and is readable
   - Verify file size (large files might timeout)

4. **Connection refused:**
   - Ensure the server is running
   - Check the correct host and port
   - Verify firewall settings

### Useful Commands

**Check server status:**
```bash
curl -f http://localhost:8000/ && echo "Server is running" || echo "Server is down"
```

**Get detailed error information:**
```bash
curl -v -X GET "http://localhost:8000/folders"
```

**Check uploads directory:**
```bash
ls -la uploads/
```

## File Structure

```
system/
├── main.py                 # Main FastAPI application
├── picture_cli.sh         # CLI script for terminal operations
├── components/
│   └── manage/
│       ├── upload.py      # Upload functionality
│       ├── list.py        # Listing functionality
│       └── picture.py     # Picture management
└── uploads/               # Directory where pictures are stored
    └── [folder_name]/
        └── [pictures...]
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
