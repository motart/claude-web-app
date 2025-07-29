#!/bin/bash

# OrderNimbus WordPress Deployment Script
# This script deploys the OrderNimbus theme to AWS Lightsail

set -e  # Exit on error

# Configuration
REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"  # Update this path to your PEM file location
REMOTE_WP_PATH="/bitnami/wordpress"  # Common Bitnami path, will verify

# Local paths
LOCAL_THEME_PATH="./wp-content/themes/ordernimbus"
THEME_NAME="ordernimbus"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 OrderNimbus WordPress Deployment Script${NC}"
echo "================================================"

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ Error: SSH key not found at $SSH_KEY_PATH${NC}"
    echo "Please update the SSH_KEY_PATH variable in this script"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY_PATH"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "   Remote Host: $REMOTE_HOST"
echo "   Remote User: $REMOTE_USER"
echo "   Theme Name: $THEME_NAME"
echo ""

# Test SSH connection
echo -e "${YELLOW}🔗 Testing SSH connection...${NC}"
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${RED}❌ Failed to connect via SSH${NC}"
    echo "Please check your credentials and try again"
    exit 1
fi

# Find WordPress installation path
echo -e "${YELLOW}🔍 Locating WordPress installation...${NC}"
WP_PATH=$(ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "find /opt/bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || echo ''")

if [ -z "$WP_PATH" ]; then
    echo -e "${RED}❌ Could not find WordPress installation${NC}"
    echo "Please specify the correct WordPress path"
    exit 1
fi

echo -e "${GREEN}✅ Found WordPress at: $WP_PATH${NC}"

# Check if theme already exists and create backup
echo -e "${YELLOW}📦 Checking existing theme...${NC}"
THEME_EXISTS=$(ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "[ -d '$WP_PATH/wp-content/themes/$THEME_NAME' ] && echo 'yes' || echo 'no'")

if [ "$THEME_EXISTS" = "yes" ]; then
    echo -e "${YELLOW}📦 Creating backup of existing theme...${NC}"
    BACKUP_NAME="${THEME_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
    ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" "cd $WP_PATH/wp-content/themes && sudo tar -czf /home/$REMOTE_USER/${BACKUP_NAME}.tar.gz $THEME_NAME"
    echo -e "${GREEN}✅ Backup created: ~/${BACKUP_NAME}.tar.gz${NC}"
fi

# Create tar of local theme
echo -e "${YELLOW}📦 Preparing theme for upload...${NC}"
cd wp-content/themes
tar -czf ordernimbus.tar.gz ordernimbus
cd ../..

# Upload theme
echo -e "${YELLOW}📤 Uploading theme to server...${NC}"
scp -i "$SSH_KEY_PATH" ./wp-content/themes/ordernimbus.tar.gz "$REMOTE_USER@$REMOTE_HOST:/tmp/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Theme uploaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to upload theme${NC}"
    rm ./wp-content/themes/ordernimbus.tar.gz
    exit 1
fi

# Extract theme on server
echo -e "${YELLOW}📂 Installing theme on server...${NC}"
ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
    # Remove old theme if exists
    if [ -d "$WP_PATH/wp-content/themes/ordernimbus" ]; then
        sudo rm -rf "$WP_PATH/wp-content/themes/ordernimbus"
    fi
    
    # Extract new theme
    cd "$WP_PATH/wp-content/themes"
    sudo tar -xzf /tmp/ordernimbus.tar.gz
    
    # Set correct permissions
    sudo chown -R bitnami:daemon ordernimbus
    sudo find ordernimbus -type d -exec chmod 755 {} \;
    sudo find ordernimbus -type f -exec chmod 644 {} \;
    
    # Clean up
    rm /tmp/ordernimbus.tar.gz
    
    echo "Theme installed successfully"
ENDSSH

# Clean up local tar file
rm ./wp-content/themes/ordernimbus.tar.gz

# Clear WordPress cache
echo -e "${YELLOW}🧹 Clearing WordPress cache...${NC}"
ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
    # Clear object cache if exists
    if [ -f "$WP_PATH/wp-content/object-cache.php" ]; then
        sudo rm "$WP_PATH/wp-content/object-cache.php"
    fi
    
    # Clear any cache plugins
    if [ -d "$WP_PATH/wp-content/cache" ]; then
        sudo rm -rf "$WP_PATH/wp-content/cache/*"
    fi
    
    # Restart services
    sudo /opt/bitnami/ctlscript.sh restart apache
    sudo /opt/bitnami/ctlscript.sh restart php-fpm
ENDSSH

echo -e "${GREEN}✅ Cache cleared and services restarted${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "================================================"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit http://$REMOTE_HOST/wp-admin"
echo "2. Go to Appearance > Themes"
echo "3. Activate the OrderNimbus theme"
echo "4. Import your content or create pages"
echo ""
echo -e "${YELLOW}📝 Important Notes:${NC}"
echo "- A backup of the previous theme (if any) was saved to the home directory"
echo "- Make sure to update WordPress site URL if using a domain"
echo "- Configure SSL certificate for HTTPS"
echo "- Update any hardcoded URLs in the database"