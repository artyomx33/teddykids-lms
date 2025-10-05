#!/bin/bash
# Chrome Ecosystem Detective - Clean Development Environment Launcher
# Generated on 2025-10-03T07:47:09.308Z

set -e

echo "🧹 Chrome Ecosystem Detective - Clean Development Setup"
echo "=================================================="

# Check if Chrome is running and offer to close it
if pgrep -f "Google Chrome" > /dev/null; then
    echo "⚠️  Chrome is currently running."
    read -p "Close Chrome to start clean development session? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Closing Chrome..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            osascript -e 'quit app "Google Chrome"'
        else
            pkill -f "Google Chrome" || true
        fi
        sleep 2
    fi
fi

# Launch Chrome with development profile
echo "🚀 Starting Chrome with clean development profile..."
./launch-chrome-dev.sh &
CHROME_PID=$!

# Wait a moment for Chrome to start
sleep 3

# Start development server
echo "⚡ Starting Vite development server..."
npm run dev &
VITE_PID=$!

echo ""
echo "✅ Development environment ready!"
echo "   Chrome PID: $CHROME_PID"
echo "   Vite PID: $VITE_PID"
echo ""
echo "📝 To stop:"
echo "   - Press Ctrl+C to stop Vite"
echo "   - Close Chrome manually or run: kill $CHROME_PID"
echo ""

# Wait for Vite to exit
wait $VITE_PID

echo "🏁 Development session ended."
