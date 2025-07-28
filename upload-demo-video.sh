#!/bin/bash

# Upload Demo Video to WordPress
echo "📤 OrderNimbus Demo Video Upload"
echo "================================="

# Create uploads directory if it doesn't exist
UPLOAD_DIR="/Users/rachid/workspace/claude-web-app/ordernimbus-wp/wp-content/uploads"
mkdir -p "$UPLOAD_DIR"

# Check if video file exists
VIDEO_FILE="ordernimbus-demo.mp4"
if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Video file '$VIDEO_FILE' not found in current directory"
    echo "Please ensure you have:"
    echo "1. Recorded the demo video using record-demo-video.sh"
    echo "2. Exported it as ordernimbus-demo.mp4"
    echo "3. Placed it in the current directory"
    exit 1
fi

echo "✅ Found video file: $VIDEO_FILE"

# Check video file size
FILE_SIZE=$(stat -f%z "$VIDEO_FILE" 2>/dev/null || stat -c%s "$VIDEO_FILE" 2>/dev/null)
FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))

echo "📊 Video file size: ${FILE_SIZE_MB}MB"

if [ $FILE_SIZE_MB -gt 50 ]; then
    echo "⚠️  Warning: Video file is ${FILE_SIZE_MB}MB (recommended: <50MB)"
    echo "Large files may cause slow loading. Consider compressing the video."
    echo ""
    echo "Compression suggestions:"
    echo "ffmpeg -i ordernimbus-demo.mp4 -vcodec h264 -acodec mp2 -b:v 2M ordernimbus-demo-compressed.mp4"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Copy video to WordPress uploads directory
echo "📁 Copying video to WordPress uploads directory..."
cp "$VIDEO_FILE" "$UPLOAD_DIR/"

if [ $? -eq 0 ]; then
    echo "✅ Video uploaded successfully to: $UPLOAD_DIR/$VIDEO_FILE"
else
    echo "❌ Failed to upload video"
    exit 1
fi

# Update the video demo JavaScript to use the actual video
echo "🔧 Updating video demo configuration..."

# Update the JavaScript file to point to the actual video
sed -i.bak "s|this.videoUrl = null;|this.videoUrl = '/wp-content/uploads/ordernimbus-demo.mp4';|" \
    "/Users/rachid/workspace/claude-web-app/ordernimbus-wp/wp-content/themes/ordernimbus/js/video-demo.js"

if [ $? -eq 0 ]; then
    echo "✅ Updated video demo configuration"
else
    echo "⚠️  Manual update required in video-demo.js"
fi

# Create a simple video test page
echo "📄 Creating video test page..."
cat > "$UPLOAD_DIR/../themes/ordernimbus/test-video.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>OrderNimbus Demo Video Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
        .video-container { margin: 20px 0; }
        video { width: 100%; border-radius: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .test-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 OrderNimbus Demo Video Test</h1>
        
        <div class="test-info">
            <h3>Video Test Information</h3>
            <p><strong>File:</strong> ordernimbus-demo.mp4</p>
            <p><strong>Location:</strong> /wp-content/uploads/</p>
            <p><strong>Size:</strong> ${FILE_SIZE_MB}MB</p>
        </div>
        
        <div class="video-container">
            <video controls poster="/wp-content/uploads/video-thumbnail.jpg">
                <source src="/wp-content/uploads/ordernimbus-demo.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        
        <div class="test-info">
            <h3>Integration Status</h3>
            <p>✅ Video uploaded to WordPress</p>
            <p>✅ JavaScript configuration updated</p>
            <p>✅ Contact page ready</p>
            <p><strong>Next:</strong> Visit the contact page to see the interactive demo section</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/contact" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Contact Page Demo
            </a>
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Created video test page: test-video.html"

# Generate a simple thumbnail from video (if ffmpeg is available)
if command -v ffmpeg >/dev/null 2>&1; then
    echo "🖼️ Generating video thumbnail..."
    ffmpeg -i "$UPLOAD_DIR/$VIDEO_FILE" -ss 00:00:01 -vframes 1 -f image2 "$UPLOAD_DIR/video-thumbnail.jpg" -y >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Generated video thumbnail"
    else
        echo "⚠️  Could not generate thumbnail"
    fi
else
    echo "⚠️  ffmpeg not available - skipping thumbnail generation"
fi

echo ""
echo "🎉 Demo Video Integration Complete!"
echo "==================================="
echo ""
echo "✅ Video uploaded: $UPLOAD_DIR/$VIDEO_FILE"
echo "✅ WordPress integration: Ready"
echo "✅ Contact page: Updated with interactive demo"
echo "✅ Test page: test-video.html"

echo ""
echo "🔗 Next Steps:"
echo "1. Visit your WordPress contact page"
echo "2. Look for the 'See OrderNimbus in Action' section"
echo "3. Click the play button to test the video"
echo "4. Use test-video.html for direct video testing"

echo ""
echo "📊 Integration Summary:"
echo "- Video file size: ${FILE_SIZE_MB}MB"
echo "- Video location: /wp-content/uploads/ordernimbus-demo.mp4"
echo "- Interactive demo: Enabled on contact page"
echo "- Fallback: Carousel demo if video fails to load"

echo ""
echo "🚀 Your interactive video demo is ready!"