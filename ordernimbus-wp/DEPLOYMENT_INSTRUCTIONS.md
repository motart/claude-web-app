# OrderNimbus WordPress Deployment Instructions

## Prerequisites

1. **Save your PEM file**: Save the SSH key (PEM file) to this directory and name it `ordernimbus-lightsail.pem`

2. **Make scripts executable**:
```bash
chmod +x deploy-simple.sh
chmod +x deploy-to-lightsail.sh
```

## Quick Deployment (Recommended)

1. **Run the simple deployment script**:
```bash
./deploy-simple.sh
```

This will:
- Upload the OrderNimbus theme to your Lightsail instance
- Install it in the WordPress themes directory
- Set proper permissions
- Restart the web server

## After Deployment

1. **Access WordPress Admin**:
   - URL: http://52.41.161.0/wp-admin
   - Username: (your WordPress admin username)
   - Password: (your WordPress admin password)

2. **Activate the Theme**:
   - Go to Appearance > Themes
   - Find "OrderNimbus" theme
   - Click "Activate"

3. **Create Pages**:
   You'll need to create these pages in WordPress admin:
   - **Home** (set as front page in Settings > Reading)
   - **About** (slug: about)
   - **Contact** (slug: contact)
   - **Pricing** (slug: pricing)
   - **How it Works** (slug: how-it-works)
   - **Privacy Policy** (slug: privacy)
   - **Terms of Service** (slug: terms)

4. **Configure Menus**:
   - Go to Appearance > Menus
   - Create a new menu called "Main Navigation"
   - Add your pages to the menu
   - Set it as the Primary Menu location

## Important Notes

- The SSH credentials you provided:
  - IP: 52.41.161.0
  - Username: admin
  - Password: NewPassword123! (for sudo commands if needed)

- If you get permission errors, the script will use sudo automatically

- The theme files are located at: `/opt/bitnami/wordpress/wp-content/themes/ordernimbus/`

## Troubleshooting

If the deployment fails:

1. **Check SSH connection**:
```bash
ssh -i ordernimbus-lightsail.pem admin@52.41.161.0
```

2. **Find WordPress manually**:
```bash
find /opt/bitnami -name wp-config.php
find /bitnami -name wp-config.php
```

3. **Check Apache/PHP status**:
```bash
sudo /opt/bitnami/ctlscript.sh status
```

## Setting Up Your Domain

Once deployed, to use ordernimbus.com:

1. Update Lightsail networking to allow HTTP/HTTPS
2. Point your domain's DNS to 52.41.161.0
3. Update WordPress settings:
   - Settings > General > WordPress Address: https://ordernimbus.com
   - Settings > General > Site Address: https://ordernimbus.com
4. Install SSL certificate (Let's Encrypt recommended)