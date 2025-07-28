#!/bin/bash

# Upload Redesigned How It Works Page to WordPress Site
# This script uploads the brand-aligned How It Works files to the live WordPress site

set -e  # Exit on any error

# Configuration
LIGHTSAIL_IP="52.41.161.0"
SSH_KEY="/Users/rachid/Downloads/LightsailDefaultKey-us-west-2 (1).pem"
LOCAL_FILES="/Users/rachid/workspace/claude-web-app/ordernimbus-wp"
REMOTE_USER="bitnami"
REMOTE_WP_PATH="/opt/bitnami/wordpress"

echo "🎨 Uploading Redesigned How It Works Page (Brand Aligned)"
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
if [ ! -f "$LOCAL_FILES/wp-content/themes/ordernimbus/page-how-it-works-v2.php" ]; then
    echo "❌ Redesigned How It Works template not found"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Step 1: Upload the new page template
echo "📤 Step 1: Uploading redesigned page template..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/page-how-it-works-v2.php" \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/page-how-it-works-v2.php

# Step 2: Upload new CSS file
echo "📤 Step 2: Uploading brand-aligned CSS file..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/css/how-it-works-v2.css" \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/how-it-works-v2.css

# Step 3: Upload updated functions.php
echo "📤 Step 3: Uploading updated functions.php..."
scp -i "$SSH_KEY" \
  "$LOCAL_FILES/wp-content/themes/ordernimbus/functions.php" \
  $REMOTE_USER@$LIGHTSAIL_IP:/tmp/functions-updated.php

# Step 4: Execute installation commands on remote server
echo "🔧 Step 4: Installing files on server..."

ssh -i "$SSH_KEY" $REMOTE_USER@$LIGHTSAIL_IP << 'ENDSSH'
set -e

echo "📁 Installing redesigned How It Works page..."

# Move new page template
sudo mv /tmp/page-how-it-works-v2.php /opt/bitnami/wordpress/wp-content/themes/ordernimbus/
echo "✅ New page template installed"

# Move new CSS file
sudo mv /tmp/how-it-works-v2.css /opt/bitnami/wordpress/wp-content/themes/ordernimbus/css/
echo "✅ Brand-aligned CSS installed"

# Backup current functions.php and update it
sudo cp /opt/bitnami/wordpress/wp-content/themes/ordernimbus/functions.php /opt/bitnami/wordpress/wp-content/themes/ordernimbus/functions.php.backup2
sudo mv /tmp/functions-updated.php /opt/bitnami/wordpress/wp-content/themes/ordernimbus/functions.php
echo "✅ Functions.php updated (backup created)"

# Set proper permissions
sudo chown -R bitnami:daemon /opt/bitnami/wordpress/wp-content/themes/ordernimbus
sudo chmod -R 755 /opt/bitnami/wordpress/wp-content/themes/ordernimbus
echo "✅ Permissions set"

# Update the existing How It Works page to use the new template
echo "🎨 Updating page template assignment..."
PAGE_ID=$(sudo /opt/bitnami/wp-cli/bin/wp post list --post_type=page --name=how-it-works --field=ID --path=/opt/bitnami/wordpress --allow-root)
if [ ! -z "$PAGE_ID" ]; then
    sudo /opt/bitnami/wp-cli/bin/wp post meta update $PAGE_ID _wp_page_template page-how-it-works-v2.php --path=/opt/bitnami/wordpress --allow-root
    echo "✅ Page template updated to brand-aligned version (Page ID: $PAGE_ID)"
else
    echo "⚠️  Could not find existing page, creating new one..."
    NEW_PAGE_ID=$(sudo /opt/bitnami/wp-cli/bin/wp post create --post_type=page --post_title="How It Works" --post_name="how-it-works" --post_status=publish --post_content="This page uses the brand-aligned how-it-works template." --path=/opt/bitnami/wordpress --allow-root --porcelain)
    sudo /opt/bitnami/wp-cli/bin/wp post meta update $NEW_PAGE_ID _wp_page_template page-how-it-works-v2.php --path=/opt/bitnami/wordpress --allow-root
    echo "✅ New page created with brand-aligned template (Page ID: $NEW_PAGE_ID)"
fi

# Clear any caches
echo "🧹 Clearing caches..."
sudo /opt/bitnami/wp-cli/bin/wp cache flush --path=/opt/bitnami/wordpress --allow-root 2>/dev/null || echo "ℹ️  No cache to clear"

echo "✅ Brand-aligned How It Works page installation completed!"

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Brand-aligned How It Works page deployed!"
    echo ""
    echo "🎨 Key Design Updates:"
    echo "   ✅ OrderNimbus blue color scheme (#2563eb)"
    echo "   ✅ Enterprise pricing ($12K, $36K, $60K+/year)"
    echo "   ✅ Professional typography and spacing"
    echo "   ✅ Consistent button styles and hover effects"
    echo "   ✅ Enterprise-focused messaging and features"
    echo "   ✅ Brand-aligned gradients and animations"
    echo ""
    echo "🌐 Access your updated page:"
    echo "   How It Works: http://52.41.161.0/how-it-works"
    echo "   WordPress Admin: http://52.41.161.0/wp-admin"
    echo ""
    echo "📋 What was updated:"
    echo "   ✅ page-how-it-works-v2.php (Brand-aligned template)"
    echo "   ✅ how-it-works-v2.css (OrderNimbus design system)"
    echo "   ✅ functions.php (Updated CSS loading)"
    echo "   ✅ Page template assignment updated"
    echo ""
    echo "🔑 Admin credentials:"
    echo "   Username: admin"
    echo "   Password: NewPassword123!"
    echo ""
else
    echo "❌ Upload failed during remote execution"
    exit 1
fi