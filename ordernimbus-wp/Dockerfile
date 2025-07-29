FROM php:8.1-apache

# Install required PHP extensions and system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libxpm-dev \
    libmagickwand-dev \
    mariadb-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --with-xpm \
    && docker-php-ext-install -j$(nproc) \
        gd \
        mysqli \
        pdo_mysql \
        zip \
        opcache \
    && pecl install imagick \
    && docker-php-ext-enable imagick \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers expires deflate

# Configure PHP
COPY <<EOF /usr/local/etc/php/conf.d/wordpress.ini
file_uploads = On
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_vars = 3000
display_errors = Off
log_errors = On
error_log = /var/log/apache2/php_errors.log
EOF

# Configure Apache
COPY <<EOF /etc/apache2/conf-available/wordpress.conf
<Directory /var/www/html>
    AllowOverride All
    Options -Indexes +FollowSymLinks
    Require all granted
</Directory>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresDefault "access plus 2 days"
</IfModule>
EOF

RUN a2enconf wordpress

# Install WordPress CLI
RUN curl -L -o wp-cli.phar https://github.com/wp-cli/wp-cli/releases/download/v2.8.1/wp-cli-2.8.1.phar \
    && php wp-cli.phar --info \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

# Download and extract WordPress
RUN wp core download --allow-root --path=/var/www/html

# Copy custom theme and configuration
COPY wp-content/ /var/www/html/wp-content/
COPY wp-config.php /var/www/html/wp-config.php

# Create uploads directory and set permissions
RUN mkdir -p /var/www/html/wp-content/uploads \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/wp-content/uploads

# Copy entrypoint script
COPY <<'EOF' /usr/local/bin/docker-entrypoint.sh
#!/bin/bash
set -euo pipefail

# Wait for database to be ready
echo "Waiting for database connection..."
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    sleep 1
done
echo "Database is ready!"

# Update wp-config.php with environment variables
sed -i "s/define( 'DB_NAME', '.*' );/define( 'DB_NAME', '$DB_NAME' );/" /var/www/html/wp-config.php
sed -i "s/define( 'DB_USER', '.*' );/define( 'DB_USER', '$DB_USER' );/" /var/www/html/wp-config.php
sed -i "s/define( 'DB_PASSWORD', '.*' );/define( 'DB_PASSWORD', '$DB_PASSWORD' );/" /var/www/html/wp-config.php
sed -i "s/define( 'DB_HOST', '.*' );/define( 'DB_HOST', '$DB_HOST' );/" /var/www/html/wp-config.php

# Update WordPress salts if provided
if [ ! -z "${WP_AUTH_KEY:-}" ]; then
    sed -i "s/define( 'AUTH_KEY', '.*' );/define( 'AUTH_KEY', '$WP_AUTH_KEY' );/" /var/www/html/wp-config.php
fi
if [ ! -z "${WP_SECURE_AUTH_KEY:-}" ]; then
    sed -i "s/define( 'SECURE_AUTH_KEY', '.*' );/define( 'SECURE_AUTH_KEY', '$WP_SECURE_AUTH_KEY' );/" /var/www/html/wp-config.php
fi
if [ ! -z "${WP_LOGGED_IN_KEY:-}" ]; then
    sed -i "s/define( 'LOGGED_IN_KEY', '.*' );/define( 'LOGGED_IN_KEY', '$WP_LOGGED_IN_KEY' );/" /var/www/html/wp-config.php
fi
if [ ! -z "${WP_NONCE_KEY:-}" ]; then
    sed -i "s/define( 'NONCE_KEY', '.*' );/define( 'NONCE_KEY', '$WP_NONCE_KEY' );/" /var/www/html/wp-config.php
fi

# Install WordPress if not already installed
if ! wp core is-installed --allow-root --path=/var/www/html; then
    echo "Installing WordPress..."
    wp core install \
        --allow-root \
        --path=/var/www/html \
        --url="$WORDPRESS_URL" \
        --title="$WORDPRESS_TITLE" \
        --admin_user="$WORDPRESS_ADMIN_USER" \
        --admin_password="$WORDPRESS_ADMIN_PASSWORD" \
        --admin_email="$WORDPRESS_ADMIN_EMAIL"
    
    # Activate the custom theme
    wp theme activate ordernimbus --allow-root --path=/var/www/html
    
    echo "WordPress installation completed!"
fi

# Start Apache
exec apache2-foreground
EOF

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]