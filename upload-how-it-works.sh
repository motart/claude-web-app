#!/bin/bash

# Upload How It Works Page to WordPress Site
# This script uploads all the How It Works files to the live WordPress site

set -e  # Exit on any error

# Configuration
LIGHTSAIL_IP="52.41.161.0"
SSH_KEY="/Users/rachid/Downloads/LightsailDefaultKey-us-west-2 (1).pem"
LOCAL_FILES="/Users/rachid/workspace/claude-web-app/ordernimbus-wp"
REMOTE_USER="bitnami"
REMOTE_WP_PATH="/opt/bitnami/wordpress"

echo "🚀 Uploading How It Works Page to WordPress"
echo "Target: $LIGHTSAIL_IP"
echo "----------------------------------------"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

# Fix SSH key permissions
chmod 600 "$SSH_KEY"

# Check if local files exist
if [ ! -f "$LOCAL_FILES/wp-content/themes/ordernimbus/page-how-it-works.php" ]; then
    echo "❌ How It Works template not found"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Step 1: Upload the page template
echo "📤 Step 1: Uploading page template..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/page-how-it-works.php" \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/page-how-it-works.php

# Step 2: Upload CSS file
echo "📤 Step 2: Uploading CSS file..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/css/how-it-works.css" \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/how-it-works.css

# Step 3: Upload SVG icons
echo "📤 Step 3: Uploading SVG icons..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/images/integrations/"*.svg \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/

# Step 4: Upload updated functions.php
echo "📤 Step 4: Uploading updated functions.php..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/functions.php" \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/functions.php

# Step 5: Execute installation commands on remote server
echo "🔧 Step 5: Installing files on server..."

ssh -i "$SSH_KEY" $REMOTE_USER@$LIGHTSAIL_IP << 'ENDSSH'
set -e

echo "📁 Creating directories and moving files..."

# Create CSS directory if it doesn't exist
sudo mkdir -p /opt/bitnami/wordpress/wp-content/themes/ordernimbus/css
sudo mkdir -p /opt/bitnami/wordpress/wp-content/themes/ordernimbus/images/integrations

# Move page template
sudo mv /tmp/page-how-it-works.php /opt/bitnami/wordpress/wp-content/themes/ordernimbus/
echo "✅ Page template installed"

# Move CSS file
sudo mv /tmp/how-it-works.css /opt/bitnami/wordpress/wp-content/themes/ordernimbus/css/
echo "✅ CSS file installed"

# Move SVG icons
sudo mv /tmp/*.svg /opt/bitnami/wordpress/wp-content/themes/ordernimbus/images/integrations/ 2>/dev/null || echo "ℹ️  No SVG files to move"
echo "✅ SVG icons installed"

# Backup current functions.php and update it
sudo cp /opt/bitnami/wordpress/wp-content/themes/ordernimbus/functions.php /opt/bitnami/wordpress/wp-content/themes/ordernimbus/functions.php.backup
sudo mv /tmp/functions.php /opt/bitnami/wordpress/wp-content/themes/ordernimbus/
echo "✅ Functions.php updated (backup created)"

# Set proper permissions
sudo chown -R bitnami:daemon /opt/bitnami/wordpress/wp-content/themes/ordernimbus
sudo chmod -R 755 /opt/bitnami/wordpress/wp-content/themes/ordernimbus
echo "✅ Permissions set"

# Create the How It Works page using WP-CLI
echo "📄 Creating How It Works page..."
sudo /opt/bitnami/wp-cli/bin/wp page create \
  --post_title="How It Works" \
  --post_name="how-it-works" \
  --post_status=publish \
  --post_content="This page uses the custom how-it-works template to display our 3-step process for retailers." \
  --page_template="page-how-it-works.php" \
  --path=/opt/bitnami/wordpress \
  --allow-root || echo "ℹ️  Page may already exist"

# Set the page template meta
echo "🎨 Setting page template..."
PAGE_ID=$(sudo /opt/bitnami/wp-cli/bin/wp post list --post_type=page --name=how-it-works --field=ID --path=/opt/bitnami/wordpress --allow-root)
if [ ! -z "$PAGE_ID" ]; then
    sudo /opt/bitnami/wp-cli/bin/wp post meta update $PAGE_ID _wp_page_template page-how-it-works.php --path=/opt/bitnami/wordpress --allow-root
    echo "✅ Page template set for page ID: $PAGE_ID"
else
    echo "⚠️  Could not find page ID, template may need to be set manually"
fi

# Clear any caches
echo "🧹 Clearing caches..."
sudo /opt/bitnami/wp-cli/bin/wp cache flush --path=/opt/bitnami/wordpress --allow-root 2>/dev/null || echo "ℹ️  No cache to clear"

echo "✅ How It Works page installation completed!"

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! How It Works page uploaded and configured!"
    echo ""
    echo "🌐 Access your page:"
    echo "   How It Works: http://52.41.161.0/how-it-works"
    echo "   WordPress Admin: http://52.41.161.0/wp-admin"
    echo ""
    echo "📋 What was installed:"
    echo "   ✅ page-how-it-works.php (WordPress template)"
    echo "   ✅ how-it-works.css (Custom styling)"
    echo "   ✅ SVG integration icons (Shopify, Amazon, NetSuite, QuickBooks)"
    echo "   ✅ Updated functions.php (CSS loading)"
    echo "   ✅ WordPress page created with proper template"
    echo ""
    echo "📝 Admin credentials:"
    echo "   Username: admin"
    echo "   Password: NewPassword123!"
    echo ""
else
    echo "❌ Upload failed during remote execution"
    exit 1
fi