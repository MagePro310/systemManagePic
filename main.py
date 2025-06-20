from fastapi import FastAPI
from components.manage.upload import router as upload_router
from components.manage.list import router as list_router
from components.manage.picture import router as picture_router

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(list_router)
app.include_router(picture_router)

@app.get("/")
def read_root():
    return {"message": "Picture Management API"}
