#!/bin/bash

# Picture Management System Startup Script

echo "🖼️  Starting Picture Management System..."
echo "========================================"

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed!"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

echo "✅ Using $PYTHON_CMD"

# Check if required packages are installed
echo "📦 Checking dependencies..."
$PYTHON_CMD -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📥 Installing required packages..."
    pip install fastapi uvicorn python-multipart || pip3 install fastapi uvicorn python-multipart
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir uploads
    echo "✅ Created uploads directory"
fi

echo ""
echo "🚀 Starting FastAPI server..."
echo "📡 Server will be available at:"
echo "   • Web UI: http://localhost:8000/ui"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • API: http://localhost:8000/"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Start the server
$PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
