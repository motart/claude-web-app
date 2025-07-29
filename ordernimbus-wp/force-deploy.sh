#!/bin/bash

# Force deployment - manually override everything

# Configuration
REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "💪 FORCE DEPLOYING OrderNimbus Theme"
echo "===================================="

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

# Force install
echo "💪 Force installing theme..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" 'bash -s' << 'EOF'
    # Find WordPress
    WP_PATH=$(find /opt/bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /var/www -name wp-config.php 2>/dev/null | head -1 | xargs dirname)
    
    if [ -z "$WP_PATH" ]; then
        echo "❌ WordPress not found!"
        exit 1
    fi
    
    echo "WordPress at: $WP_PATH"
    
    # Stop services
    sudo /opt/bitnami/ctlscript.sh stop apache 2>/dev/null || sudo systemctl stop apache2 2>/dev/null || sudo service apache2 stop 2>/dev/null
    
    # Remove old theme completely
    sudo rm -rf "$WP_PATH/wp-content/themes/ordernimbus"
    
    # Extract new theme
    cd "$WP_PATH/wp-content/themes"
    sudo tar -xzf /tmp/ordernimbus.tar.gz
    
    # Set aggressive permissions
    sudo chown -R www-data:www-data ordernimbus 2>/dev/null || sudo chown -R bitnami:daemon ordernimbus || sudo chown -R apache:apache ordernimbus
    sudo chmod -R 755 ordernimbus
    
    # Get database info
    DB_NAME=$(grep "define.*DB_NAME" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_USER=$(grep "define.*DB_USER" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_PASS=$(grep "define.*DB_PASSWORD" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_HOST=$(grep "define.*DB_HOST" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    
    echo "Database: $DB_NAME on $DB_HOST"
    
    # Force activate theme in database
    echo "🎨 Force activating theme..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" << MYSQL
        UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'template';
        UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'stylesheet';
        UPDATE wp_options SET option_value = 'OrderNimbus' WHERE option_name = 'blogname';
        UPDATE wp_options SET option_value = 'Enterprise AI-Powered Sales Forecasting Platform' WHERE option_name = 'blogdescription';
MYSQL
    
    # Clear all caches
    echo "🧹 Clearing all caches..."
    sudo rm -rf "$WP_PATH/wp-content/cache/" 2>/dev/null
    sudo rm -rf "$WP_PATH/wp-content/uploads/cache/" 2>/dev/null
    sudo rm -f "$WP_PATH/wp-content/object-cache.php" 2>/dev/null
    sudo rm -f "$WP_PATH/.htaccess" 2>/dev/null
    
    # Start services
    sudo /opt/bitnami/ctlscript.sh start apache 2>/dev/null || sudo systemctl start apache2 2>/dev/null || sudo service apache2 start 2>/dev/null
    sudo /opt/bitnami/ctlscript.sh restart php-fpm 2>/dev/null
    
    # Wait a moment then restart again
    sleep 3
    sudo /opt/bitnami/ctlscript.sh restart apache 2>/dev/null || sudo systemctl restart apache2 2>/dev/null
    
    # Cleanup
    rm /tmp/ordernimbus.tar.gz
    
    echo "✅ Force deployment complete!"
    echo "Theme files installed and database updated"
EOF

# Cleanup
rm ./wp-content/themes/ordernimbus.tar.gz

echo ""
echo "💪 FORCE DEPLOYMENT COMPLETE!"
echo "============================="
echo ""
echo "🔄 Please wait 30 seconds, then check: http://52.41.161.0"
echo ""
echo "🧹 If still showing old theme:"
echo "1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)"
echo "2. Try incognito/private browsing"
echo "3. Check http://52.41.161.0/?nocache=1"