#!/bin/bash

# Picture Management System Demo Script

echo "🖼️  Picture Management System Demo"
echo "================================="

# Check if server is running
if ! curl -s http://localhost:8000/ > /dev/null; then
    echo "❌ Server is not running!"
    echo "Please start the server first:"
    echo "  python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    exit 1
fi

echo "✅ Server is running"
echo ""

echo "🌐 Available interfaces:"
echo "  • Web UI: http://localhost:8000/ui"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • API: http://localhost:8000/"
echo ""

echo "📋 Demo features:"
echo "  1. Modern drag & drop file upload"
echo "  2. Beautiful picture gallery with filtering"
echo "  3. Folder management with previews"
echo "  4. Full-size image modal with actions"
echo "  5. Real-time toast notifications"
echo "  6. Responsive design for all devices"
echo "  7. Keyboard shortcuts for power users"
echo ""

echo "⌨️  Keyboard shortcuts:"
echo "  • Ctrl+1: Upload tab"
echo "  • Ctrl+2: Gallery tab"
echo "  • Ctrl+3: Folders tab"
echo "  • Ctrl+R: Refresh current view"
echo "  • F5: Refresh current view"
echo "  • Escape: Close modal"
echo ""

echo "🚀 Quick test using CLI:"
echo "  ./picture_cli.sh list"
echo ""

if [ -f "picture_cli.sh" ]; then
    ./picture_cli.sh list
else
    echo "❌ CLI script not found"
fi

echo ""
echo "🎉 Ready to go! Open http://localhost:8000/ui to start using the web interface!"
echo ""
