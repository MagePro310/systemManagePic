#!/bin/bash

# Picture Management System Setup Script

echo "🖼️  Picture Management System Setup"
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ and try again."
    exit 1
fi

echo "✅ Python 3 found"

# Check if pip is installed
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo "❌ pip is not installed. Please install pip and try again."
    exit 1
fi

echo "✅ pip found"

# Install required packages
echo "📦 Installing required Python packages..."

pip install fastapi uvicorn python-multipart || pip3 install fastapi uvicorn python-multipart

if [ $? -eq 0 ]; then
    echo "✅ Python packages installed successfully"
else
    echo "❌ Failed to install Python packages"
    exit 1
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir uploads
    echo "✅ Created uploads directory"
fi

# Make CLI script executable
if [ -f "picture_cli.sh" ]; then
    chmod +x picture_cli.sh
    echo "✅ Made CLI script executable"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Then open your browser to:"
echo "  • Web UI: http://localhost:8000/ui"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • API: http://localhost:8000/"
echo ""
echo "For CLI usage, see the README.md file."
echo ""
