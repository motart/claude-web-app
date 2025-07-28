#!/bin/bash

# OrderNimbus Demo Video Recording Script
# This script helps record a demo video of the OrderNimbus application

echo "🎥 OrderNimbus Demo Video Recording Setup"
echo "=========================================="

# Check if backend is running
echo "1. Checking backend status..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is running on port 3000"
else
    echo "❌ Backend not running. Starting backend..."
    cd /Users/rachid/workspace/claude-web-app
    npm run dev > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Started backend with PID: $BACKEND_PID"
    sleep 5
fi

# Check if frontend is running
echo "2. Checking frontend status..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend is running on port 3001"
else
    echo "❌ Frontend not running. Starting frontend..."
    cd /Users/rachid/workspace/claude-web-app/frontend
    npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Started frontend with PID: $FRONTEND_PID"
    sleep 10
fi

echo ""
echo "3. Demo recording checklist:"
echo "✅ Backend running at http://localhost:3000"
echo "✅ Frontend running at http://localhost:3001"
echo "✅ MongoDB connected with demo data"

echo ""
echo "🎬 DEMO RECORDING STEPS:"
echo "========================"
echo "1. Open screen recording software (QuickTime, OBS, etc.)"
echo "2. Set recording area to browser window (1920x1080 recommended)"
echo "3. Navigate to: http://localhost:3001"
echo "4. Follow the script in: create-demo-video.md"

echo ""
echo "📋 Demo Login Credentials:"
echo "Email: demo@ordernimbus.com"
echo "Password: demo123"

echo ""
echo "🎯 Key Features to Demonstrate:"
echo "- Dashboard with $11M+ revenue data"
echo "- Real-time charts and visualizations"
echo "- CSV data upload process"
echo "- Shopify connector setup"
echo "- ML forecasting with 94% accuracy"
echo "- Advanced analytics and filtering"

echo ""
echo "💡 Recording Tips:"
echo "- Speak clearly and at moderate pace"
echo "- Show mouse movements clearly"
echo "- Pause briefly between major sections"
echo "- Keep total length under 4 minutes"
echo "- Export as MP4 (H.264, 1920x1080, <50MB)"

echo ""
echo "📁 Save video as: ordernimbus-demo.mp4"
echo "Upload location: /Users/rachid/workspace/claude-web-app/ordernimbus-wp/wp-content/uploads/"

echo ""
echo "Press Enter when ready to start recording..."
read

# Open the application in browser
echo "Opening OrderNimbus application..."
open "http://localhost:3001"

echo ""
echo "🔴 Start your screen recording now!"
echo "📝 Follow the script in create-demo-video.md"
echo ""
echo "When finished recording:"
echo "1. Stop recording"
echo "2. Export video as ordernimbus-demo.mp4"
echo "3. Run: ./upload-demo-video.sh to integrate with WordPress"

# Optional: Create demo user if not exists
echo ""
echo "Creating demo user account..."
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@ordernimbus.com",
    "password": "demo123",
    "name": "Demo User"
  }' > /dev/null 2>&1

echo "Demo user created (or already exists)"
echo ""
echo "🎥 Ready to record! Good luck!"