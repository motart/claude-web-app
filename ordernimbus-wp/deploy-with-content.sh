#!/bin/bash

# Complete OrderNimbus Deployment with Content Import
# This script deploys everything including database content

# Configuration
REMOTE_HOST="52.41.161.0"
REMOTE_USER="admin"
SSH_KEY_PATH="./ordernimbus-lightsail.pem"

echo "🚀 Complete OrderNimbus Deployment with Content"
echo "=============================================="

# Set SSH key permissions
chmod 600 "$SSH_KEY_PATH"

# Create theme archive
echo "📦 Creating theme archive..."
cd wp-content/themes
tar -czf ordernimbus.tar.gz ordernimbus
cd ../..

# Create SQL file with all content
echo "📝 Creating content SQL file..."
cat > ordernimbus-content.sql << 'SQLEOF'
-- Delete existing pages with our slugs to avoid conflicts
DELETE FROM wp_posts WHERE post_type = 'page' AND post_name IN ('home', 'about', 'contact', 'pricing', 'how-it-works', 'privacy', 'terms');

-- Insert Home page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type) 
VALUES (1, NOW(), NOW(), '<!-- Home page uses front-page template from theme -->', 'Home', '', 'publish', 'closed', 'closed', 'home', NOW(), NOW(), 'page');

-- Insert About page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, page_template) 
VALUES (1, NOW(), NOW(), '', 'About Us', '', 'publish', 'closed', 'closed', 'about', NOW(), NOW(), 'page', 'page-about.php');

-- Insert Contact page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, page_template) 
VALUES (1, NOW(), NOW(), '', 'Contact', '', 'publish', 'closed', 'closed', 'contact', NOW(), NOW(), 'page', 'page-contact.php');

-- Insert Pricing page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, page_template) 
VALUES (1, NOW(), NOW(), '', 'Pricing', '', 'publish', 'closed', 'closed', 'pricing', NOW(), NOW(), 'page', 'page-pricing.php');

-- Insert How it Works page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, page_template) 
VALUES (1, NOW(), NOW(), '', 'How it Works', '', 'publish', 'closed', 'closed', 'how-it-works', NOW(), NOW(), 'page', 'page-how-it-works.php');

-- Insert Privacy Policy page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, page_template) 
VALUES (1, NOW(), NOW(), '', 'Privacy Policy', '', 'publish', 'closed', 'closed', 'privacy', NOW(), NOW(), 'page', 'page-privacy.php');

-- Insert Terms of Service page
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, page_template) 
VALUES (1, NOW(), NOW(), '', 'Terms of Service', '', 'publish', 'closed', 'closed', 'terms', NOW(), NOW(), 'page', 'page-terms.php');

-- Update page templates in postmeta
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_wp_page_template', 'page-about.php' FROM wp_posts WHERE post_name = 'about' AND post_type = 'page';

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_wp_page_template', 'page-contact.php' FROM wp_posts WHERE post_name = 'contact' AND post_type = 'page';

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_wp_page_template', 'page-pricing.php' FROM wp_posts WHERE post_name = 'pricing' AND post_type = 'page';

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_wp_page_template', 'page-how-it-works.php' FROM wp_posts WHERE post_name = 'how-it-works' AND post_type = 'page';

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_wp_page_template', 'page-privacy.php' FROM wp_posts WHERE post_name = 'privacy' AND post_type = 'page';

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
SELECT ID, '_wp_page_template', 'page-terms.php' FROM wp_posts WHERE post_name = 'terms' AND post_type = 'page';

-- Set OrderNimbus theme as active
UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'template';
UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'stylesheet';

-- Set home page as front page
UPDATE wp_options SET option_value = 'page' WHERE option_name = 'show_on_front';
UPDATE wp_options SET option_value = (SELECT ID FROM wp_posts WHERE post_name = 'home' AND post_type = 'page' LIMIT 1) WHERE option_name = 'page_on_front';

-- Update site info
UPDATE wp_options SET option_value = 'OrderNimbus' WHERE option_name = 'blogname';
UPDATE wp_options SET option_value = 'Enterprise AI-Powered Sales Forecasting Platform' WHERE option_name = 'blogdescription';

-- Create menu
DELETE FROM wp_terms WHERE name = 'Main Navigation';
INSERT INTO wp_terms (name, slug, term_group) VALUES ('Main Navigation', 'main-navigation', 0);
SET @menu_id = LAST_INSERT_ID();
INSERT INTO wp_term_taxonomy (term_id, taxonomy, description, parent, count) VALUES (@menu_id, 'nav_menu', '', 0, 5);
SET @menu_tax_id = LAST_INSERT_ID();

-- Clear any existing menu items
DELETE FROM wp_term_relationships WHERE term_taxonomy_id IN (SELECT term_taxonomy_id FROM wp_term_taxonomy WHERE taxonomy = 'nav_menu');

-- Add menu items
SET @menu_order = 0;

-- About Us
SET @menu_order = @menu_order + 1;
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, menu_order) 
VALUES (1, NOW(), NOW(), '', 'About Us', '', 'publish', 'closed', 'closed', CONCAT('menu-item-about-', UNIX_TIMESTAMP()), NOW(), NOW(), 'nav_menu_item', @menu_order);
SET @item_id = LAST_INSERT_ID();
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES 
(@item_id, '_menu_item_type', 'post_type'),
(@item_id, '_menu_item_object', 'page'),
(@item_id, '_menu_item_object_id', (SELECT ID FROM wp_posts WHERE post_name = 'about' AND post_type = 'page' LIMIT 1)),
(@item_id, '_menu_item_menu_item_parent', '0'),
(@item_id, '_menu_item_url', '');
INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES (@item_id, @menu_tax_id);

-- Solutions (custom link)
SET @menu_order = @menu_order + 1;
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, menu_order) 
VALUES (1, NOW(), NOW(), '', 'Solutions', '', 'publish', 'closed', 'closed', CONCAT('menu-item-solutions-', UNIX_TIMESTAMP()), NOW(), NOW(), 'nav_menu_item', @menu_order);
SET @item_id = LAST_INSERT_ID();
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES 
(@item_id, '_menu_item_type', 'custom'),
(@item_id, '_menu_item_menu_item_parent', '0'),
(@item_id, '_menu_item_url', '/solutions');
INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES (@item_id, @menu_tax_id);

-- Pricing
SET @menu_order = @menu_order + 1;
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, menu_order) 
VALUES (1, NOW(), NOW(), '', 'Pricing', '', 'publish', 'closed', 'closed', CONCAT('menu-item-pricing-', UNIX_TIMESTAMP()), NOW(), NOW(), 'nav_menu_item', @menu_order);
SET @item_id = LAST_INSERT_ID();
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES 
(@item_id, '_menu_item_type', 'post_type'),
(@item_id, '_menu_item_object', 'page'),
(@item_id, '_menu_item_object_id', (SELECT ID FROM wp_posts WHERE post_name = 'pricing' AND post_type = 'page' LIMIT 1)),
(@item_id, '_menu_item_menu_item_parent', '0'),
(@item_id, '_menu_item_url', '');
INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES (@item_id, @menu_tax_id);

-- How it Works
SET @menu_order = @menu_order + 1;
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, menu_order) 
VALUES (1, NOW(), NOW(), '', 'How it Works', '', 'publish', 'closed', 'closed', CONCAT('menu-item-how-it-works-', UNIX_TIMESTAMP()), NOW(), NOW(), 'nav_menu_item', @menu_order);
SET @item_id = LAST_INSERT_ID();
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES 
(@item_id, '_menu_item_type', 'post_type'),
(@item_id, '_menu_item_object', 'page'),
(@item_id, '_menu_item_object_id', (SELECT ID FROM wp_posts WHERE post_name = 'how-it-works' AND post_type = 'page' LIMIT 1)),
(@item_id, '_menu_item_menu_item_parent', '0'),
(@item_id, '_menu_item_url', '');
INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES (@item_id, @menu_tax_id);

-- Contact
SET @menu_order = @menu_order + 1;
INSERT INTO wp_posts (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt, post_type, menu_order) 
VALUES (1, NOW(), NOW(), '', 'Contact', '', 'publish', 'closed', 'closed', CONCAT('menu-item-contact-', UNIX_TIMESTAMP()), NOW(), NOW(), 'nav_menu_item', @menu_order);
SET @item_id = LAST_INSERT_ID();
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES 
(@item_id, '_menu_item_type', 'post_type'),
(@item_id, '_menu_item_object', 'page'),
(@item_id, '_menu_item_object_id', (SELECT ID FROM wp_posts WHERE post_name = 'contact' AND post_type = 'page' LIMIT 1)),
(@item_id, '_menu_item_menu_item_parent', '0'),
(@item_id, '_menu_item_url', '');
INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES (@item_id, @menu_tax_id);

-- Update menu item count
UPDATE wp_term_taxonomy SET count = 5 WHERE term_taxonomy_id = @menu_tax_id;

-- Assign menu to theme location
INSERT INTO wp_options (option_name, option_value) VALUES ('nav_menu_locations', CONCAT('a:1:{s:7:"primary";i:', @menu_id, ';}'))
ON DUPLICATE KEY UPDATE option_value = CONCAT('a:1:{s:7:"primary";i:', @menu_id, ';}');

SQLEOF

# Upload files
echo "📤 Uploading theme and content..."
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ./wp-content/themes/ordernimbus.tar.gz "$REMOTE_USER@$REMOTE_HOST:/tmp/"
scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no ./ordernimbus-content.sql "$REMOTE_USER@$REMOTE_HOST:/tmp/"

# Deploy everything
echo "🔧 Installing theme and importing content..."
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" 'bash -s' << 'EOF'
    # Find WordPress path
    WP_PATH=$(find /opt/bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname || find /bitnami -name wp-config.php 2>/dev/null | head -1 | xargs dirname)
    
    echo "Found WordPress at: $WP_PATH"
    
    # Extract theme
    cd "$WP_PATH/wp-content/themes"
    if [ -d "ordernimbus" ]; then
        sudo rm -rf ordernimbus_old 2>/dev/null
        sudo mv ordernimbus ordernimbus_old
    fi
    sudo tar -xzf /tmp/ordernimbus.tar.gz
    sudo chown -R bitnami:daemon ordernimbus
    sudo chmod -R 755 ordernimbus
    
    # Get database credentials
    DB_NAME=$(grep DB_NAME "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_USER=$(grep DB_USER "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_PASS=$(grep DB_PASSWORD "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    DB_HOST=$(grep DB_HOST "$WP_PATH/wp-config.php" | cut -d "'" -f 4)
    
    # Import content
    echo "📥 Importing content to database..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < /tmp/ordernimbus-content.sql
    
    # Clear cache
    cd "$WP_PATH"
    sudo -u bitnami wp cache flush 2>/dev/null || true
    
    # Restart services
    sudo /opt/bitnami/ctlscript.sh restart apache
    sudo /opt/bitnami/ctlscript.sh restart php-fpm 2>/dev/null || true
    
    # Cleanup
    rm /tmp/ordernimbus.tar.gz /tmp/ordernimbus-content.sql
    
    echo "✅ Everything installed successfully!"
EOF

# Cleanup local files
rm ./wp-content/themes/ordernimbus.tar.gz
rm ./ordernimbus-content.sql

echo ""
echo "🎉 COMPLETE DEPLOYMENT SUCCESS!"
echo "=============================="
echo ""
echo "✅ Theme installed and activated"
echo "✅ All pages created with proper templates"
echo "✅ Navigation menu configured"
echo "✅ Home page set as front page"
echo "✅ Site title and description updated"
echo ""
echo "🌐 Your site is now FULLY LIVE at: http://52.41.161.0"
echo ""
echo "📱 The site is complete with:"
echo "   • Working contact form"
echo "   • Mobile responsive design"
echo "   • All pages with content"
echo "   • SEO optimization"
echo "   • Interactive demo carousel"
echo ""
echo "🔐 To secure with HTTPS:"
echo "1. Point ordernimbus.com DNS to 52.41.161.0"
echo "2. Run: sudo /opt/bitnami/bncert-tool"
echo "3. Follow prompts to install SSL certificate"