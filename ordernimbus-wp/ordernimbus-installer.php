<?php
/**
 * Plugin Name: OrderNimbus Theme Installer
 * Description: Installs the OrderNimbus theme automatically
 * Version: 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'ordernimbus_installer_menu');

function ordernimbus_installer_menu() {
    add_management_page(
        'Install OrderNimbus Theme',
        'Install OrderNimbus',
        'manage_options',
        'ordernimbus-installer',
        'ordernimbus_installer_page'
    );
}

function ordernimbus_installer_page() {
    if (isset($_POST['install_theme'])) {
        ordernimbus_install_theme();
    }
    
    ?>
    <div class="wrap">
        <h1>OrderNimbus Theme Installer</h1>
        <p>This will install and activate the OrderNimbus theme on your WordPress site.</p>
        
        <form method="post">
            <?php wp_nonce_field('ordernimbus_install', 'ordernimbus_nonce'); ?>
            <p>
                <input type="submit" name="install_theme" class="button button-primary button-large" value="Install OrderNimbus Theme">
            </p>
        </form>
    </div>
    <?php
}

function ordernimbus_install_theme() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['ordernimbus_nonce'], 'ordernimbus_install')) {
        wp_die('Security check failed');
    }
    
    // Check permissions
    if (!current_user_can('manage_options')) {
        wp_die('You do not have permission to install themes');
    }
    
    echo '<div class="notice notice-info"><p>Installing OrderNimbus theme...</p></div>';
    
    // Create theme directory
    $themes_dir = get_theme_root();
    $theme_dir = $themes_dir . '/ordernimbus';
    
    if (!file_exists($theme_dir)) {
        wp_mkdir_p($theme_dir);
    }
    
    // Create theme files
    $theme_files = get_ordernimbus_theme_files();
    
    foreach ($theme_files as $filename => $content) {
        $file_path = $theme_dir . '/' . $filename;
        
        // Create subdirectories if needed
        $dir = dirname($file_path);
        if (!file_exists($dir)) {
            wp_mkdir_p($dir);
        }
        
        file_put_contents($file_path, $content);
    }
    
    // Activate theme
    switch_theme('ordernimbus');
    
    // Update site info
    update_option('blogname', 'OrderNimbus');
    update_option('blogdescription', 'Enterprise AI-Powered Sales Forecasting Platform');
    
    // Create pages
    create_ordernimbus_pages();
    
    echo '<div class="notice notice-success"><p><strong>Success!</strong> OrderNimbus theme has been installed and activated.</p></div>';
    echo '<p><a href="' . home_url() . '" target="_blank" class="button button-secondary">View Site</a></p>';
}

function get_ordernimbus_theme_files() {
    return array(
        'style.css' => '/*
Theme Name: OrderNimbus
Description: Enterprise AI-Powered Sales Forecasting Platform Theme
Version: 1.0
Author: OrderNimbus
*/

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: \'Roboto\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
}

/* Header */
.site-header {
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2563eb;
    text-decoration: none;
}

.main-nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.main-nav a {
    color: #333;
    text-decoration: none;
    font-weight: 500;
}

.btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: #2563eb;
    color: white;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 120px 2rem 80px;
    text-align: center;
}

.hero h1 {
    color: white;
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
}

.hero p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    color: rgba(255,255,255,0.9);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Content Sections */
.content-section {
    padding: 80px 0;
}

.section-title {
    text-align: center;
    margin-bottom: 3rem;
}

.section-title h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

/* Footer */
.site-footer {
    background: #1e293b;
    color: white;
    padding: 60px 0 20px;
    text-align: center;
}',
        
        'index.php' => '<?php get_header(); ?>

<main id="main-content">
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>Enterprise AI-Powered Sales Forecasting</h1>
            <p>Transform your retail operations with 94%+ forecast accuracy through enterprise-grade AI that combines security, scalability, and compliance.</p>
            <div class="hero-buttons">
                <a href="https://app.ordernimbus.com" class="btn btn-primary" target="_blank" rel="noopener">Get Started</a>
                <a href="/contact" class="btn btn-secondary">Contact Sales</a>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="content-section">
        <div class="container">
            <div class="section-title">
                <h2>Why Enterprise Retailers Choose OrderNimbus</h2>
                <p>The only AI forecasting platform built specifically for enterprise security and compliance requirements.</p>
            </div>
        </div>
    </section>
</main>

<?php get_footer(); ?>',

        'header.php' => '<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo(\'charset\'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php wp_title(\'|\', true, \'right\'); ?><?php bloginfo(\'name\'); ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<header class="site-header">
    <div class="header-content">
        <a href="<?php echo home_url(); ?>" class="logo">
            OrderNimbus
        </a>
        <nav class="main-nav">
            <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
        <div class="header-actions">
            <a href="https://app.ordernimbus.com" class="btn btn-primary" target="_blank" rel="noopener">
                Get Started
            </a>
        </div>
    </div>
</header>',

        'footer.php' => '<footer class="site-footer">
    <div class="container">
        <p>&copy; <?php echo date(\'Y\'); ?> OrderNimbus. All rights reserved.</p>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>',

        'functions.php' => '<?php
// Theme setup
function ordernimbus_theme_setup() {
    add_theme_support(\'title-tag\');
    add_theme_support(\'post-thumbnails\');
}
add_action(\'after_setup_theme\', \'ordernimbus_theme_setup\');

// Enqueue styles
function ordernimbus_scripts() {
    wp_enqueue_style(\'ordernimbus-style\', get_stylesheet_uri(), array(), \'1.0.0\');
}
add_action(\'wp_enqueue_scripts\', \'ordernimbus_scripts\');
?>'
    );
}

function create_ordernimbus_pages() {
    $pages = array(
        'About Us' => 'about',
        'Contact' => 'contact', 
        'Pricing' => 'pricing'
    );
    
    foreach ($pages as $title => $slug) {
        // Check if page already exists
        $existing_page = get_page_by_path($slug);
        if (!$existing_page) {
            wp_insert_post(array(
                'post_title' => $title,
                'post_name' => $slug,
                'post_content' => '',
                'post_status' => 'publish',
                'post_type' => 'page'
            ));
        }
    }
}
?>