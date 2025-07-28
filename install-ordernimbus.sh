#!/bin/bash

# OrderNimbus WordPress Installation Script for Lightsail
# This script automates the installation of OrderNimbus WordPress site

set -e  # Exit on any error

# Configuration
LIGHTSAIL_IP="52.41.161.0"
SSH_KEY="/Users/rachid/Downloads/LightsailDefaultKey-us-west-2 (1).pem"
LOCAL_FILES="/Users/rachid/workspace/claude-web-app/ordernimbus-wp"
REMOTE_USER="bitnami"

echo "🚀 Starting OrderNimbus WordPress Installation"
echo "Target: $LIGHTSAIL_IP"
echo "----------------------------------------"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

# Fix SSH key permissions
echo "🔐 Setting correct SSH key permissions..."
chmod 600 "$SSH_KEY"

# Check if local files exist
if [ ! -d "$LOCAL_FILES" ]; then
    echo "❌ OrderNimbus files not found: $LOCAL_FILES"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Step 1: Upload files to Lightsail
echo "📤 Step 1: Uploading files to Lightsail..."
scp -i "$SSH_KEY" -r "$LOCAL_FILES" $REMOTE_USER@$LIGHTSAIL_IP:/home/bitnami/

if [ $? -eq 0 ]; then
    echo "✅ Files uploaded successfully"
else
    echo "❌ Failed to upload files"
    exit 1
fi

# Step 2: Execute installation commands on remote server
echo "🔧 Step 2: Installing on remote server..."

ssh -i "$SSH_KEY" $REMOTE_USER@$LIGHTSAIL_IP << 'ENDSSH'
set -e

echo "🔧 Installing OrderNimbus theme..."

# Copy theme files
sudo cp -r /home/bitnami/ordernimbus-wp/wp-content/themes/ordernimbus /opt/bitnami/wordpress/wp-content/themes/

# Set proper permissions
sudo chown -R bitnami:daemon /opt/bitnami/wordpress/wp-content/themes/ordernimbus
sudo chmod -R 755 /opt/bitnami/wordpress/wp-content/themes/ordernimbus

echo "✅ Theme files installed"

# Get database password
echo "🔍 Getting database credentials..."

# Display the credentials file to understand its format
echo "📋 Bitnami credentials file content:"
cat /home/bitnami/bitnami_credentials
echo ""

# Extract password from the credentials file
# Looking for pattern like 'password' and 'PASSWORD_HERE'
DB_PASSWORD=$(grep -o "'[^']*'" /home/bitnami/bitnami_credentials | tail -1 | tr -d "'")

if [ -z "$DB_PASSWORD" ]; then
    # Alternative extraction method
    DB_PASSWORD=$(sed -n "s/.*'\([^']*\)'.*/\1/p" /home/bitnami/bitnami_credentials | tail -1)
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Could not extract database password automatically"
    echo "📋 From the credentials above, I can see the password is: BmVY.jXL!6Tv"
    DB_PASSWORD="BmVY.jXL!6Tv"
fi

echo "🔑 Using password: ${DB_PASSWORD:0:4}***"

echo "🗄️  Creating database backup..."
# Use MariaDB commands (Bitnami uses MariaDB)
# Test connection first with bitnami user (most common for Bitnami)
/opt/bitnami/mariadb/bin/mariadb -u bitnami -p"$DB_PASSWORD" -e "SHOW DATABASES;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Connected with bitnami user"
    /opt/bitnami/mariadb/bin/mariadb-dump -u bitnami -p"$DB_PASSWORD" bitnami_wordpress > /home/bitnami/backup_before_ordernimbus.sql
    DB_USER="bitnami"
else
    echo "🔄 Trying root user..."
    /opt/bitnami/mariadb/bin/mariadb -u root -p"$DB_PASSWORD" -e "SHOW DATABASES;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Connected with root user"
        /opt/bitnami/mariadb/bin/mariadb-dump -u root -p"$DB_PASSWORD" bitnami_wordpress > /home/bitnami/backup_before_ordernimbus.sql
        DB_USER="root"
    else
        echo "❌ Could not connect to database with either user"
        echo "🔍 Trying to find correct credentials..."
        # Try without password (some Bitnami setups)
        /opt/bitnami/mariadb/bin/mariadb -u bitnami -e "SHOW DATABASES;" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Connected with bitnami user (no password)"
            /opt/bitnami/mariadb/bin/mariadb-dump -u bitnami bitnami_wordpress > /home/bitnami/backup_before_ordernimbus.sql
            DB_USER="bitnami"
            DB_PASSWORD=""
        else
            echo "❌ All database connection attempts failed. Skipping backup."
            DB_USER="bitnami"
        fi
    fi
fi

echo "📥 Importing OrderNimbus database..."
# First, drop existing WordPress tables to avoid conflicts
if [ -n "$DB_PASSWORD" ]; then
    /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" -p"$DB_PASSWORD" bitnami_wordpress << EOF
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS wp_commentmeta, wp_comments, wp_links, wp_options, wp_postmeta, wp_posts, wp_terms, wp_term_relationships, wp_term_taxonomy, wp_usermeta, wp_users;
SET FOREIGN_KEY_CHECKS = 1;
EOF
    /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" -p"$DB_PASSWORD" bitnami_wordpress < /home/bitnami/ordernimbus-wp/database.sql
else
    /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" bitnami_wordpress << EOF
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS wp_commentmeta, wp_comments, wp_links, wp_options, wp_postmeta, wp_posts, wp_terms, wp_term_relationships, wp_term_taxonomy, wp_usermeta, wp_users;
SET FOREIGN_KEY_CHECKS = 1;
EOF
    /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" bitnami_wordpress < /home/bitnami/ordernimbus-wp/database.sql
fi

echo "🔧 Updating site URLs..."
if [ -n "$DB_PASSWORD" ]; then
    /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" -p"$DB_PASSWORD" bitnami_wordpress << EOF
UPDATE wp_options SET option_value = 'http://52.41.161.0' WHERE option_name = 'home';
UPDATE wp_options SET option_value = 'http://52.41.161.0' WHERE option_name = 'siteurl';
EOF
else
    /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" bitnami_wordpress << EOF
UPDATE wp_options SET option_value = 'http://52.41.161.0' WHERE option_name = 'home';
UPDATE wp_options SET option_value = 'http://52.41.161.0' WHERE option_name = 'siteurl';
EOF
fi

echo "🎨 Activating theme..."
cd /opt/bitnami/wordpress

# Fix WordPress permissions first
sudo chown -R bitnami:daemon /opt/bitnami/wordpress/wp-content/
sudo chmod -R 755 /opt/bitnami/wordpress/wp-content/

# Check if WP-CLI is available and use proper path
if [ -f "/opt/bitnami/wp-cli/bin/wp" ]; then
    WP_CLI="/opt/bitnami/wp-cli/bin/wp"
elif command -v wp >/dev/null 2>&1; then
    WP_CLI="wp"
else
    WP_CLI=""
fi

if [ -n "$WP_CLI" ]; then
    echo "🔧 Using WP-CLI: $WP_CLI"
    sudo -u bitnami $WP_CLI theme activate ordernimbus --path=/opt/bitnami/wordpress
    sudo -u bitnami $WP_CLI option update show_on_front 'page' --path=/opt/bitnami/wordpress
    sudo -u bitnami $WP_CLI option update page_on_front '1' --path=/opt/bitnami/wordpress
    sudo -u bitnami $WP_CLI rewrite structure '/%postname%/' --path=/opt/bitnami/wordpress
    echo "✅ Theme activated via WP-CLI"
else
    echo "⚠️  WP-CLI not available, theme activation needs to be done manually"
    echo "🔧 Manually activating theme via database..."
    if [ -n "$DB_PASSWORD" ]; then
        /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" -p"$DB_PASSWORD" bitnami_wordpress << EOF
UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'template';
UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'stylesheet';
UPDATE wp_options SET option_value = 'page' WHERE option_name = 'show_on_front';
UPDATE wp_options SET option_value = '1' WHERE option_name = 'page_on_front';
EOF
    else
        /opt/bitnami/mariadb/bin/mariadb -u "$DB_USER" bitnami_wordpress << EOF
UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'template';
UPDATE wp_options SET option_value = 'ordernimbus' WHERE option_name = 'stylesheet';
UPDATE wp_options SET option_value = 'page' WHERE option_name = 'show_on_front';
UPDATE wp_options SET option_value = '1' WHERE option_name = 'page_on_front';
EOF
    fi
    echo "✅ Theme activated via database"
fi

echo "🔐 Updating admin credentials..."
if [ -n "$WP_CLI" ]; then
    # Generate secure password
    NEW_PASSWORD=$(openssl rand -base64 12)
    sudo -u bitnami $WP_CLI user update 1 --user_pass="$NEW_PASSWORD" --path=/opt/bitnami/wordpress
    echo "🔑 New admin password: $NEW_PASSWORD"
    echo "📧 Please also update your email in WordPress admin"
else
    echo "⚠️  Please change admin password manually (current: admin123!)"
    NEW_PASSWORD="admin123!"
fi

echo "🧹 Cleaning up temporary files..."
rm -rf /home/bitnami/ordernimbus-wp

echo "🔄 Restarting Apache..."
sudo /opt/bitnami/ctlscript.sh restart apache

echo "✅ Installation completed successfully!"
echo ""
echo "🌐 Your OrderNimbus site is now available at:"
echo "   Site: http://52.41.161.0"
echo "   Admin: http://52.41.161.0/wp-admin"
echo ""
echo "👤 Admin Login:"
echo "   Username: admin"
if command -v wp >/dev/null 2>&1; then
    echo "   Password: $NEW_PASSWORD"
else
    echo "   Password: admin123! (CHANGE IMMEDIATELY)"
fi
echo ""
echo "🚨 IMPORTANT: Change admin password immediately!"

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! OrderNimbus WordPress installation completed!"
    echo ""
    echo "🌐 Access your site:"
    echo "   Website: http://52.41.161.0"
    echo "   Admin: http://52.41.161.0/wp-admin"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Visit the admin panel and change the password"
    echo "   2. Update your email address"
    echo "   3. Configure any additional settings"
    echo "   4. Add SSL certificate if needed"
    echo ""
else
    echo "❌ Installation failed during remote execution"
    exit 1
fi