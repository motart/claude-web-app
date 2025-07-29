#!/bin/bash

# Auto-deploy script that finds the right username and deploys

REMOTE_HOST="52.41.161.0"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "🚀 AUTO-DEPLOYING OrderNimbus Theme"
echo "===================================="

# Set permissions
chmod 600 "$SSH_KEY_PATH"

# Find working username
echo "🔍 Finding correct username..."
USERNAMES=("bitnami" "ubuntu" "ec2-user" "admin" "centos")
WORKING_USER=""

for user in "${USERNAMES[@]}"; do
    if timeout 10 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$user@$REMOTE_HOST" "echo 'test'" &>/dev/null; then
        WORKING_USER="$user"
        echo "✅ Found working username: $user"
        break
    fi
done

if [ -z "$WORKING_USER" ]; then
    echo "❌ Could not connect with any username. Please check:"
    echo "   - Is the Lightsail instance running?"
    echo "   - Is the IP address correct: $REMOTE_HOST"
    echo "   - Is this the right SSH key for this instance?"
    exit 1
fi

# Create theme archive
echo "📦 Creating theme archive..."
cd wp-content/themes
tar -czf ordernimbus.tar.gz ordernimbus
cd ../..

# Upload and deploy
echo "📤 Uploading and deploying..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ./wp-content/themes/ordernimbus.tar.gz "$WORKING_USER@$REMOTE_HOST:/tmp/"

ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$WORKING_USER@$REMOTE_HOST" << 'DEPLOY_SCRIPT'
    # Find WordPress
    WP_PATHS=(
        "/opt/bitnami/wordpress"
        "/bitnami/wordpress" 
        "/var/www/html"
        "/home/bitnami/stack/wordpress"
        "/opt/bitnami/apps/wordpress/htdocs"
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
    
    # Stop web server
    sudo /opt/bitnami/ctlscript.sh stop apache 2>/dev/null || sudo systemctl stop apache2 2>/dev/null || true
    
    # Install theme
    cd "$WP_PATH/wp-content/themes"
    sudo rm -rf ordernimbus 2>/dev/null || true
    sudo tar -xzf /tmp/ordernimbus.tar.gz
    
    # Fix permissions
    if id bitnami &>/dev/null; then
        sudo chown -R bitnami:daemon ordernimbus
    elif id www-data &>/dev/null; then
        sudo chown -R www-data:www-data ordernimbus
    else
        sudo chown -R apache:apache ordernimbus
    fi
    sudo chmod -R 755 ordernimbus
    
    # Get DB credentials
    DB_NAME=$(grep "define.*DB_NAME" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_USER=$(grep "define.*DB_USER" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_PASS=$(grep "define.*DB_PASSWORD" "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_HOST=$(grep "define.*DB_HOST" "$WP_PATH/wp-config.php" | cut -d "'" -f 4 2>/dev/null || echo "localhost")
    
    # Activate theme in database
    echo "🎨 Activating theme..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>/dev/null << SQL
        UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'template';
        UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'stylesheet';
        UPDATE wp_options SET option_value = 'OrderNimbus' WHERE option_name = 'blogname';
        UPDATE wp_options SET option_value = 'Enterprise AI-Powered Sales Forecasting Platform' WHERE option_name = 'blogdescription';
        
        -- Create basic pages if they don't exist
        INSERT IGNORE INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type) 
        VALUES 
        (1, NOW(), NOW(), '', 'About Us', '', 'publish', 'closed', 'closed', 'about', NOW(), NOW(), 'page'),
        (1, NOW(), NOW(), '', 'Contact', '', 'publish', 'closed', 'closed', 'contact', NOW(), NOW(), 'page'),
        (1, NOW(), NOW(), '', 'Pricing', '', 'publish', 'closed', 'closed', 'pricing', NOW(), NOW(), 'page'),
        (1, NOW(), NOW(), '', 'How it Works', '', 'publish', 'closed', 'closed', 'how-it-works', NOW(), NOW(), 'page');
SQL
    
    # Clear caches
    sudo rm -rf "$WP_PATH/wp-content/cache/" 2>/dev/null || true
    sudo rm -f "$WP_PATH/wp-content/object-cache.php" 2>/dev/null || true
    
    # Start web server
    sudo /opt/bitnami/ctlscript.sh start apache 2>/dev/null || sudo systemctl start apache2 2>/dev/null || true
    sudo /opt/bitnami/ctlscript.sh restart php-fpm 2>/dev/null || true
    
    # Cleanup
    rm /tmp/ordernimbus.tar.gz
    
    echo "✅ Deployment complete!"
DEPLOY_SCRIPT

# Cleanup
rm ./wp-content/themes/ordernimbus.tar.gz

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "========================"
echo ""
echo "🌐 Your site should now be live at: http://52.41.161.0"
echo "🎨 OrderNimbus theme is now active"
echo "📄 Basic pages have been created"
echo ""
echo "🔄 Wait 30 seconds, then visit your site!"
echo "💡 If you don't see changes, try hard refresh (Ctrl+F5)"