<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <?php
    // SEO Meta Tags
    $page_title = get_the_title();
    $site_name = get_bloginfo('name');
    $site_description = get_bloginfo('description');
    
    // Set page-specific meta descriptions
    $meta_description = '';
    if (is_front_page()) {
        $meta_description = 'OrderNimbus delivers 94%+ accurate AI-powered sales forecasting for enterprise retailers. SOC 2 compliant, 3-week implementation, 340% average ROI. Transform your inventory management today.';
        $page_title = 'Enterprise AI Sales Forecasting Platform';
    } elseif (is_page('about')) {
        $meta_description = 'Learn about OrderNimbus mission to transform retail operations through enterprise-grade AI forecasting that combines accuracy, security, and scalability for Fortune 500 retailers.';
    } elseif (is_page('pricing')) {
        $meta_description = 'Transparent OrderNimbus pricing starting at $12K/year. Enterprise AI forecasting with 94%+ accuracy, SOC 2 compliance, and 340% ROI. Compare plans and calculate your savings.';
    } elseif (is_page('contact')) {
        $meta_description = 'Contact OrderNimbus for a personalized demo of our AI-powered sales forecasting platform. Schedule your consultation and see how we achieve 94%+ forecast accuracy.';
    } elseif (is_page('how-it-works')) {
        $meta_description = 'Discover how OrderNimbus AI forecasting works in 3 simple steps: Connect your data, let AI learn your business, get actionable insights with 94%+ accuracy.';
    } else {
        $meta_description = 'OrderNimbus - Enterprise AI-powered sales forecasting platform delivering 94%+ accuracy for retail businesses. SOC 2 compliant with 3-week implementation.';
    }
    ?>
    
    <title><?php echo $page_title; ?> | <?php echo $site_name; ?></title>
    <meta name="description" content="<?php echo $meta_description; ?>">
    <meta name="keywords" content="AI forecasting, sales prediction, inventory optimization, retail analytics, enterprise software, demand planning, SOC 2 compliant">
    <meta name="author" content="OrderNimbus">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="<?php echo get_permalink(); ?>">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo $page_title; ?> | <?php echo $site_name; ?>">
    <meta property="og:description" content="<?php echo $meta_description; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo get_permalink(); ?>">
    <meta property="og:site_name" content="<?php echo $site_name; ?>">
    <meta property="og:image" content="<?php echo get_template_directory_uri(); ?>/images/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@OrderNimbus">
    <meta name="twitter:creator" content="@OrderNimbus">
    <meta name="twitter:title" content="<?php echo $page_title; ?> | <?php echo $site_name; ?>">
    <meta name="twitter:description" content="<?php echo $meta_description; ?>">
    <meta name="twitter:image" content="<?php echo get_template_directory_uri(); ?>/images/twitter-card.jpg">
    
    <!-- Additional SEO Tags -->
    <meta name="theme-color" content="#2563eb">
    <meta name="msapplication-TileColor" content="#2563eb">
    <link rel="apple-touch-icon" sizes="180x180" href="<?php echo get_template_directory_uri(); ?>/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo get_template_directory_uri(); ?>/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="<?php echo get_template_directory_uri(); ?>/images/favicon-16x16.png">
    
    <!-- Preconnect for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "OrderNimbus",
        "description": "Enterprise AI-powered sales forecasting platform for retail businesses",
        "url": "<?php echo home_url(); ?>",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "12000",
            "priceCurrency": "USD",
            "priceValidUntil": "2025-12-31"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127"
        },
        "publisher": {
            "@type": "Organization",
            "name": "OrderNimbus",
            "url": "<?php echo home_url(); ?>",
            "logo": "<?php echo get_template_directory_uri(); ?>/images/logo.png"
        }
    }
    </script>
    
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
                <ul class="nav-menu">
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
                <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </div>
</header>