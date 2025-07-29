#!/bin/bash

# Complete OrderNimbus WordPress Deployment Script
# This script deploys the theme AND creates all pages

# Configuration
REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "🚀 Complete OrderNimbus Deployment"
echo "=================================="

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

# Install theme and create pages
echo "🔧 Installing theme and creating pages..."
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
    
    # Now use WP-CLI to set up everything
    cd "$WP_PATH"
    
    # Activate the theme
    echo "🎨 Activating OrderNimbus theme..."
    sudo -u bitnami wp theme activate ordernimbus
    
    # Create pages
    echo "📄 Creating pages..."
    
    # Home page
    sudo -u bitnami wp post create --post_type=page --post_title='Home' --post_status=publish --post_name='home' --post_content='<!-- This page uses the front-page template -->'
    
    # About page
    sudo -u bitnami wp post create --post_type=page --post_title='About Us' --post_status=publish --post_name='about' --page_template='page-about.php'
    
    # Contact page
    sudo -u bitnami wp post create --post_type=page --post_title='Contact' --post_status=publish --post_name='contact' --page_template='page-contact.php'
    
    # Pricing page
    sudo -u bitnami wp post create --post_type=page --post_title='Pricing' --post_status=publish --post_name='pricing' --page_template='page-pricing.php'
    
    # How it Works page
    sudo -u bitnami wp post create --post_type=page --post_title='How it Works' --post_status=publish --post_name='how-it-works' --page_template='page-how-it-works.php'
    
    # Privacy Policy page
    sudo -u bitnami wp post create --post_type=page --post_title='Privacy Policy' --post_status=publish --post_name='privacy' --page_template='page-privacy.php'
    
    # Terms of Service page
    sudo -u bitnami wp post create --post_type=page --post_title='Terms of Service' --post_status=publish --post_name='terms' --page_template='page-terms.php'
    
    # Set home page as front page
    echo "🏠 Setting home page..."
    HOME_ID=$(sudo -u bitnami wp post list --post_type=page --name=home --field=ID)
    sudo -u bitnami wp option update show_on_front 'page'
    sudo -u bitnami wp option update page_on_front "$HOME_ID"
    
    # Create main menu
    echo "📋 Creating navigation menu..."
    sudo -u bitnami wp menu create "Main Navigation"
    
    # Add pages to menu
    sudo -u bitnami wp menu item add-post main-navigation $(sudo -u bitnami wp post list --post_type=page --name=about --field=ID)
    sudo -u bitnami wp menu item add-custom main-navigation "Solutions" "/solutions"
    sudo -u bitnami wp menu item add-post main-navigation $(sudo -u bitnami wp post list --post_type=page --name=pricing --field=ID)
    sudo -u bitnami wp menu item add-post main-navigation $(sudo -u bitnami wp post list --post_type=page --name=how-it-works --field=ID)
    sudo -u bitnami wp menu item add-post main-navigation $(sudo -u bitnami wp post list --post_type=page --name=contact --field=ID)
    
    # Assign menu to location
    sudo -u bitnami wp menu location assign main-navigation primary
    
    # Update site info
    echo "⚙️ Updating site settings..."
    sudo -u bitnami wp option update blogname "OrderNimbus"
    sudo -u bitnami wp option update blogdescription "Enterprise AI-Powered Sales Forecasting Platform"
    
    # Restart services
    sudo /opt/bitnami/ctlscript.sh restart apache
    
    echo "✅ Everything installed successfully!"
EOF

# Cleanup local file
rm ./wp-content/themes/ordernimbus.tar.gz

echo ""
echo "🎉 COMPLETE DEPLOYMENT SUCCESS!"
echo "=============================="
echo ""
echo "✅ Theme installed and activated"
echo "✅ All pages created"
echo "✅ Navigation menu configured"
echo "✅ Home page set as front page"
echo "✅ Site title and description updated"
echo ""
echo "🌐 Your site is now live at: http://52.41.161.0"
echo ""
echo "📱 To use your domain (ordernimbus.com):"
echo "1. Point your domain DNS to 52.41.161.0"
echo "2. Update WordPress URLs in Settings > General"
echo "3. Install SSL certificate for HTTPS"