#!/bin/bash

# Diagnostic script to check WordPress installation

# Configuration
REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "🔍 Diagnosing OrderNimbus WordPress Site"
echo "========================================"

# Set SSH key permissions
chmod 600 "$SSH_KEY_PATH"

# Run diagnostics
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" 'bash -s' << 'EOF'
    echo "1️⃣ Finding WordPress installation..."
    WP_PATH=$(find /opt/bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /var/www -name wp-config.php 2>/dev/null | head -1 | xargs dirname)
    
    if [ -z "$WP_PATH" ]; then
        echo "❌ WordPress not found in standard locations"
        echo "Searching broader..."
        find / -name wp-config.php 2>/dev/null | head -5
    else
        echo "✅ WordPress found at: $WP_PATH"
    fi
    
    echo ""
    echo "2️⃣ Checking current theme..."
    if [ -n "$WP_PATH" ]; then
        CURRENT_THEME=$(grep -E "template|stylesheet" "$WP_PATH/wp-content/themes/*/style.css" 2>/dev/null | head -5)
        echo "Themes directory contents:"
        ls -la "$WP_PATH/wp-content/themes/"
        
        # Check if ordernimbus theme exists
        if [ -d "$WP_PATH/wp-content/themes/ordernimbus" ]; then
            echo "✅ OrderNimbus theme is installed"
            echo "Theme files:"
            ls -la "$WP_PATH/wp-content/themes/ordernimbus/" | head -10
        else
            echo "❌ OrderNimbus theme NOT found"
        fi
        
        # Check active theme in database
        echo ""
        echo "3️⃣ Checking active theme in database..."
        DB_NAME=$(grep DB_NAME "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
        DB_USER=$(grep DB_USER "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
        DB_PASS=$(grep DB_PASSWORD "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
        DB_HOST=$(grep DB_HOST "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
        
        echo "Active theme:"
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT option_name, option_value FROM wp_options WHERE option_name IN ('template', 'stylesheet');" 2>/dev/null || echo "Could not query database"
        
        echo ""
        echo "4️⃣ Checking for WP-CLI..."
        if command -v wp &> /dev/null; then
            echo "✅ WP-CLI is installed"
            cd "$WP_PATH"
            sudo -u bitnami wp theme list 2>/dev/null || wp theme list
        else
            echo "❌ WP-CLI not found"
        fi
        
        echo ""
        echo "5️⃣ Checking web server user..."
        ps aux | grep -E "apache|httpd|nginx" | grep -v grep | head -3
        
        echo ""
        echo "6️⃣ Checking file permissions..."
        ls -la "$WP_PATH/wp-content/" | grep themes
        
        echo ""
        echo "7️⃣ Checking for Bitnami..."
        if [ -d "/opt/bitnami" ]; then
            echo "✅ This is a Bitnami WordPress installation"
            echo "Bitnami services:"
            sudo /opt/bitnami/ctlscript.sh status
        else
            echo "❓ Not a standard Bitnami installation"
        fi
    fi
EOF

echo ""
echo "📋 Diagnostic complete!"