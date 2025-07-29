#!/bin/bash

# Simple OrderNimbus Theme Deployment Script

# Configuration - UPDATE THESE VALUES
REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"  # Path to your PEM file

echo "🚀 Deploying OrderNimbus Theme to Lightsail"
echo "=========================================="

# Set SSH key permissions
chmod 600 "$SSH_KEY_PATH"

# Create theme archive
echo "📦 Creating theme archive..."
cd wp-content/themes
tar -czf ordernimbus.tar.gz ordernimbus
cd ../..

# Upload to server
echo "📤 Uploading theme..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ./wp-content/themes/ordernimbus.tar.gz "$REMOTE_USER@$REMOTE_HOST:/tmp/"

# Install on server
echo "🔧 Installing theme..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" 'bash -s' << 'EOF'
    # Find WordPress path
    WP_PATH=$(find /opt/bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname)
    
    if [ -z "$WP_PATH" ]; then
        echo "❌ WordPress not found!"
        exit 1
    fi
    
    echo "Found WordPress at: $WP_PATH"
    
    # Backup existing theme if present
    if [ -d "$WP_PATH/wp-content/themes/ordernimbus" ]; then
        sudo mv "$WP_PATH/wp-content/themes/ordernimbus" "$WP_PATH/wp-content/themes/ordernimbus_backup_$(date +%s)"
    fi
    
    # Extract new theme
    cd "$WP_PATH/wp-content/themes"
    sudo tar -xzf /tmp/ordernimbus.tar.gz
    
    # Set permissions
    sudo chown -R bitnami:daemon ordernimbus
    sudo chmod -R 755 ordernimbus
    
    # Cleanup
    rm /tmp/ordernimbus.tar.gz
    
    # Restart web server
    sudo /opt/bitnami/ctlscript.sh restart apache
    
    echo "✅ Theme installed successfully!"
EOF

# Cleanup local file
rm ./wp-content/themes/ordernimbus.tar.gz

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Visit http://52.41.161.0/wp-admin"
echo "2. Log in with your WordPress admin credentials"
echo "3. Go to Appearance > Themes"
echo "4. Activate the OrderNimbus theme"
echo ""
echo "Note: You'll need to create the pages (About, Contact, etc.) in WordPress admin"