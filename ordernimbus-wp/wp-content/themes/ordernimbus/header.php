<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

<header class="site-header">
    <div class="container">
        <div class="header-content">
            <a href="<?php echo home_url(); ?>" class="logo">
                OrderNimbus
            </a>
            <nav class="main-nav">
                <ul>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/solutions">Solutions</a></li>
                    <li><a href="/pricing">Pricing</a></li>
                    <li><a href="/how-it-works">How it Works</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="https://app.ordernimbus.com" class="btn btn-primary" target="_blank" rel="noopener">
                    Get Started
                </a>
            </div>
        </div>
    </div>
</header>