#!/bin/bash

# Open Picture Management UI in browser

URL="http://localhost:8000/ui"

echo "🌐 Opening Picture Management UI..."
echo "📍 URL: $URL"

# Check if server is running
if curl -s "$URL" > /dev/null 2>&1; then
    echo "✅ Server is running"
    
    # Try to open in browser (works on most systems)
    if command -v xdg-open > /dev/null; then
        xdg-open "$URL"
    elif command -v open > /dev/null; then
        open "$URL"
    elif command -v start > /dev/null; then
        start "$URL"
    else
        echo "🖱️  Please open this URL in your browser:"
        echo "   $URL"
    fi
else
    echo "❌ Server is not running!"
    echo "💡 Start the server first with:"
    echo "   ./start.sh"
    echo "   or"
    echo "   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
fi
