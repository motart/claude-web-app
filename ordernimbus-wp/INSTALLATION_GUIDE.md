# OrderNimbus WordPress Installation Guide

## Quick Start with All-in-One WP Migration

### Prerequisites
- WordPress hosting account
- Admin access to WordPress dashboard
- All-in-One WP Migration plugin

### Step 1: Prepare Your WordPress Site
1. Install fresh WordPress on your hosting
2. Log into WordPress admin dashboard
3. Install "All-in-One WP Migration" plugin from the WordPress plugin directory
4. Activate the plugin

### Step 2: Create the Import File
Since GitHub doesn't support large .wpress files, you'll need to create the import file:

1. Create a temporary WordPress site locally or on staging
2. Upload all the theme files to `/wp-content/themes/ordernimbus/`
3. Import the database.sql file
4. Use All-in-One WP Migration to export the site
5. Download the .wpress file

### Step 3: Import to Your Live Site
1. Go to All-in-One WP Migration > Import in your WordPress admin
2. Upload the .wpress file
3. Wait for import to complete
4. Update site URLs if needed

## Manual Installation (Alternative Method)

### Step 1: Upload Theme Files
```bash
# Upload to your WordPress installation
wp-content/themes/ordernimbus/
├── style.css
├── index.php
├── header.php
├── footer.php
├── functions.php
├── page-about.php
├── page-contact.php
└── page-pricing.php
```

### Step 2: Database Setup
1. Create a new MySQL database for WordPress
2. Import the provided `database.sql` file
3. Update `wp-config.php` with your database credentials:

```php
define( 'DB_NAME', 'your_database_name' );
define( 'DB_USER', 'your_username' );
define( 'DB_PASSWORD', 'your_password' );
define( 'DB_HOST', 'localhost' );
```

### Step 3: Update Site URLs
After importing, update these in your database:
- `wp_options` table: `siteurl` and `home` options
- Or use WordPress CLI: `wp search-replace 'oldurl.com' 'newurl.com'`

### Step 4: Activate Theme
1. Log into WordPress admin (admin/admin123!)
2. Go to Appearance > Themes
3. Activate "OrderNimbus" theme

## Post-Installation Setup

### Security Setup (CRITICAL)
1. **Change admin password immediately**:
   - Go to Users > Profile
   - Set a strong password
   - Update email address

2. **Update WordPress**:
   - Update core WordPress
   - Update any plugins
   - Install security plugins

### Content Configuration
1. **Set homepage**: Go to Settings > Reading, set "Home" page as static front page
2. **Configure menus**: Go to Appearance > Menus, create navigation menu
3. **Update contact information**: Edit contact page and footer details
4. **Add Google Analytics**: Add tracking code to header.php or use plugin

### Theme Customization
1. **Logo**: Replace "OrderNimbus" text with actual logo in header.php
2. **Colors**: Modify color scheme in style.css
3. **Content**: Update all placeholder content with real information
4. **Images**: Add actual product screenshots and team photos

## Recommended Plugins

Essential plugins for OrderNimbus site:

1. **Security**:
   - Wordfence Security
   - Limit Login Attempts

2. **SEO**:
   - Yoast SEO
   - Google Analytics

3. **Performance**:
   - W3 Total Cache
   - Smush (image optimization)

4. **Forms**:
   - Contact Form 7 (alternative to built-in form)
   - Mailchimp integration

5. **Backup**:
   - UpdraftPlus
   - All-in-One WP Migration

## Troubleshooting

### Common Issues

**Issue**: Site shows default WordPress theme
**Solution**: Activate OrderNimbus theme in Appearance > Themes

**Issue**: Pages return 404 errors
**Solution**: Go to Settings > Permalinks, click "Save Changes"

**Issue**: Contact form not working
**Solution**: Configure SMTP settings or install SMTP plugin

**Issue**: Images/styling broken
**Solution**: Update site URLs in database or wp-config.php

### Database URL Updates
If moving domains, update these database entries:
```sql
UPDATE wp_options SET option_value = 'https://newdomain.com' WHERE option_name = 'home';
UPDATE wp_options SET option_value = 'https://newdomain.com' WHERE option_name = 'siteurl';
```

## Maintenance

### Regular Tasks
- Update WordPress core, themes, and plugins monthly
- Backup site weekly
- Monitor security logs
- Check for broken links
- Update content and pricing as needed

### Performance Optimization
- Optimize images before uploading
- Use caching plugins
- Monitor page load speeds
- Minimize plugins

## Support

This installation package includes:
- Complete WordPress theme
- Database with sample content
- Page templates for all main sections
- Contact form functionality
- SEO-optimized structure

The theme is built on the comprehensive OrderNimbus business plan and follows enterprise website best practices.

---

**Need help?** This site is designed to be self-contained and easy to manage. All content is based on the OrderNimbus business strategy and market positioning.