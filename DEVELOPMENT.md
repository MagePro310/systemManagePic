# Development Setup for Live Server

## Quick Start with Live Server

1. **Start the backend server** (if not already running):
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **In VS Code:**
   - Right-click on `frontend/index.html`
   - Select "Open with Live Server"
   - Your browser will open at `http://localhost:5500/frontend/index.html` (or similar)

3. **The frontend will automatically connect to:**
   - Backend API: `http://localhost:8000`
   - Your UI will be fully functional!

## How it Works

The frontend automatically detects if it's running on Live Server and connects to the backend at `localhost:8000`. You can now:

- Use Live Server for instant reload during frontend development
- Keep the backend running on port 8000
- All API calls will work seamlessly

## Alternative: Direct FastAPI Serving

If you prefer to serve everything from FastAPI:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Then visit: `http://localhost:8000/ui`

## Ports Used

- **Live Server**: Usually `http://localhost:5500` (frontend)
- **FastAPI Backend**: `http://localhost:8000` (API + optional UI serving)
- **API Endpoints**: All under `http://localhost:8000/`

## Development Workflow

1. Keep the backend server running in one terminal
2. Use Live Server for frontend development with instant reload
3. Make changes to CSS/JS files and see them immediately
4. API functionality works perfectly with live reload!
