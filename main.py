from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from components.api import upload_router, folder_router, picture_router
import os

app = FastAPI(title="Picture Management API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Include API routers
app.include_router(upload_router)
app.include_router(folder_router)
app.include_router(picture_router)

@app.get("/")
def read_root():
    return {"message": "Picture Management API"}

@app.get("/ui")
def serve_ui():
    """Serve the frontend UI"""
    return FileResponse("frontend/index.html")
