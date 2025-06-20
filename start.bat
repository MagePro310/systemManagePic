@echo off
echo 🖼️  Starting Picture Management System...
echo ========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed!
    pause
    exit /b 1
)

echo ✅ Python found

REM Check and install dependencies
echo 📦 Checking dependencies...
python -c "import fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing required packages...
    pip install fastapi uvicorn python-multipart
)

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    mkdir uploads
    echo ✅ Created uploads directory
)

echo.
echo 🚀 Starting FastAPI server...
echo 📡 Server will be available at:
echo    • Web UI: http://localhost:8000/ui
echo    • API Docs: http://localhost:8000/docs
echo    • API: http://localhost:8000/
echo.
echo 💡 Press Ctrl+C to stop the server
echo.

REM Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
