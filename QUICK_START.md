# 🚀 Quick Start Guide

## Option 1: One-Click Startup (Recommended)

### Linux/macOS:
```bash
./start.sh
```

### Windows:
```cmd
start.bat
```

## Option 2: Manual Startup

### 1. Start the Backend Server:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Open the UI:
- **Automatic**: Run `./open-ui.sh` (Linux/macOS)
- **Manual**: Open http://localhost:8000/ui in your browser

## Available Interfaces

| Interface | URL | Description |
|-----------|-----|-------------|
| **Web UI** | http://localhost:8000/ui | Main picture management interface |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **API Root** | http://localhost:8000/ | Basic API health check |

## Quick Commands

| Command | Description |
|---------|-------------|
| `./start.sh` | Start the server (Linux/macOS) |
| `start.bat` | Start the server (Windows) |
| `./open-ui.sh` | Open UI in browser |
| `./demo.sh` | Show demo and test functionality |
| `./setup.sh` | Install dependencies |

## Development Workflow

### For Frontend Development with Live Server:
1. **Keep backend running**: `./start.sh`
2. **Use VS Code Live Server**: Right-click `frontend/index.html` → "Open with Live Server"
3. **Result**: Frontend on Live Server port (e.g., 5500), API on port 8000

### For Full-Stack Development:
1. **Start backend**: `./start.sh`
2. **Access UI**: http://localhost:8000/ui
3. **Make changes**: Edit files and refresh browser

## Troubleshooting

### Server won't start:
- Check if port 8000 is free: `lsof -i :8000`
- Install dependencies: `./setup.sh`
- Check Python version: `python --version` (need 3.7+)

### UI won't load:
- Verify server is running: `curl http://localhost:8000/`
- Check browser console for errors
- Try incognito/private browsing mode

### CORS issues with Live Server:
- Backend already configured for CORS
- Make sure Live Server port is detected in `js/utils/constants.js`

## Features Available in UI

✅ **Upload**: Drag & drop multiple files, custom folder names
✅ **Gallery**: Grid view with filtering, full-size preview modal  
✅ **Folders**: Rename, duplicate, delete, bulk operations
✅ **Management**: Download, info panels, context menus
✅ **Responsive**: Works on desktop, tablet, and mobile
✅ **Shortcuts**: Keyboard navigation (Ctrl+1/2/3, F5, etc.)

## Next Steps

1. **Start the server**: `./start.sh`
2. **Open the UI**: http://localhost:8000/ui
3. **Upload some pictures** using drag & drop
4. **Explore the features** in Gallery and Folders tabs
5. **Try keyboard shortcuts** for faster navigation

Happy picture managing! 🖼️
