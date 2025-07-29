#!/bin/bash

# Deploy using password authentication with sshpass

REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
REMOTE_PASS="NewPassword123!"

echo "🚀 DEPLOYING OrderNimbus Theme (Password Auth)"
echo "=============================================="

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "📦 Installing sshpass..."
    if command -v brew &> /dev/null; then
        brew install hudochenkov/sshpass/sshpass
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install sshpass
    else
        echo "❌ Please install sshpass manually:"
        echo "   macOS: brew install hudochenkov/sshpass/sshpass"
        echo "   Ubuntu: sudo apt-get install sshpass"
        exit 1
    fi
fi

# Test connection
echo "🔍 Testing connection..."
if sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "echo 'Connection successful'"; then
    echo "✅ Connection successful!"
else
    echo "❌ Connection failed. Please check credentials."
    exit 1
fi

# Create theme archive
echo "📦 Creating theme archive..."
cd wp-content/themes
tar -czf ordernimbus.tar.gz ordernimbus
cd ../..

# Upload theme
echo "📤 Uploading theme..."
sshpass -p "$REMOTE_PASS" scp -o StrictHostKeyChecking=no ./wp-content/themes/ordernimbus.tar.gz "$REMOTE_USER@$REMOTE_HOST:/tmp/"

# Deploy theme
echo "🔧 Deploying theme..."
sshpass -p "$REMOTE_PASS" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << 'DEPLOY'
    # Find WordPress
    WP_PATHS=(
        "/var/www/html"
        "/var/www/wordpress"
        "/opt/bitnami/wordpress"
        "/home/wordpress"
        "/usr/share/wordpress"
    )
    
    WP_PATH=""
    for path in "${WP_PATHS[@]}"; do
        if [ -f "$path/wp-config.php" ]; then
            WP_PATH="$path"
            break
        fi
    done
    
    if [ -z "$WP_PATH" ]; then
        WP_PATH=$(find / -name wp-config.php 2>/dev/null | head -1 | xargs dirname)
    fi
    
    if [ -z "$WP_PATH" ]; then
        echo "❌ WordPress not found!"
        exit 1
    fi
    
    echo "📍 WordPress found at: $WP_PATH"
    
    # Install theme
    cd "$WP_PATH/wp-content/themes"
    sudo rm -rf ordernimbus 2>/dev/null || true
    sudo tar -xzf /tmp/ordernimbus.tar.gz
    
    # Set permissions
    sudo chown -R www-data:www-data ordernimbus 2>/dev/null || sudo chown -R apache:apache ordernimbus 2>/dev/null || sudo chown -R nobody:nobody ordernimbus
    sudo chmod -R 755 ordernimbus
    
    # Get database credentials
    DB_NAME=$(grep "define.*DB_NAME" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_USER=$(grep "define.*DB_USER" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_PASS=$(grep "define.*DB_PASSWORD" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_HOST=$(grep "define.*DB_HOST" "$WP_PATH/wp-config.php" | cut -d "'" -f 4 2>/dev/null || echo "localhost")
    
    echo "Database: $DB_NAME on $DB_HOST"
    
    # Activate theme
    echo "🎨 Activating theme..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" << SQL
        UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'template';
        UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'stylesheet';
        UPDATE wp_options SET option_value = 'OrderNimbus' WHERE option_name = 'blogname';
        UPDATE wp_options SET option_value = 'Enterprise AI-Powered Sales Forecasting Platform' WHERE option_name = 'blogdescription';
SQL
    
    # Restart web server
    sudo systemctl restart apache2 2>/dev/null || sudo service apache2 restart 2>/dev/null || sudo /etc/init.d/apache2 restart 2>/dev/null || true
    sudo systemctl restart nginx 2>/dev/null || true
    
    # Clear cache
    sudo rm -rf "$WP_PATH/wp-content/cache/" 2>/dev/null || true
    
    rm /tmp/ordernimbus.tar.gz
    echo "✅ Theme deployed successfully!"
DEPLOY

# Cleanup
rm ./wp-content/themes/ordernimbus.tar.gz

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "🌐 Your site is now live at: http://52.41.161.0"
echo "🔄 Wait 30 seconds, then check your site!"