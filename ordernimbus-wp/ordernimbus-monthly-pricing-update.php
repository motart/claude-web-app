<?php
/**
 * Plugin Name: OrderNimbus Monthly Pricing Update
 * Description: Updates pricing to monthly rates
 * Version: 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'ordernimbus_pricing_update_menu');

function ordernimbus_pricing_update_menu() {
    add_management_page(
        'Update OrderNimbus Pricing',
        'Update Pricing',
        'manage_options',
        'ordernimbus-pricing-update',
        'ordernimbus_pricing_update_page'
    );
}

function ordernimbus_pricing_update_page() {
    if (isset($_POST['update_pricing'])) {
        ordernimbus_update_pricing();
    }
    
    ?>
    <div class="wrap">
        <h1>OrderNimbus Pricing Update</h1>
        <p>This will update the pricing page to show monthly rates instead of yearly.</p>
        
        <form method="post">
            <?php wp_nonce_field('ordernimbus_pricing_update', 'pricing_nonce'); ?>
            <p>
                <input type="submit" name="update_pricing" class="button button-primary button-large" value="Update to Monthly Pricing">
            </p>
        </form>
    </div>
    <?php
}

function ordernimbus_update_pricing() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['pricing_nonce'], 'ordernimbus_pricing_update')) {
        wp_die('Security check failed');
    }
    
    // Check permissions
    if (!current_user_can('manage_options')) {
        wp_die('You do not have permission to update pricing');
    }
    
    echo '<div class="notice notice-info"><p>Updating pricing to monthly rates...</p></div>';
    
    // Update pricing page content
    $pricing_page = get_page_by_path('pricing');
    if ($pricing_page) {
        // Create updated pricing page content
        $new_content = get_monthly_pricing_content();
        
        wp_update_post(array(
            'ID' => $pricing_page->ID,
            'post_content' => $new_content
        ));
        
        echo '<div class="notice notice-success"><p><strong>Success!</strong> Pricing has been updated to monthly rates.</p></div>';
        echo '<p><a href="' . get_permalink($pricing_page->ID) . '" target="_blank" class="button button-secondary">View Updated Pricing Page</a></p>';
    } else {
        // Create new pricing page if it doesn't exist
        $page_id = wp_insert_post(array(
            'post_title' => 'Pricing',
            'post_name' => 'pricing',
            'post_content' => get_monthly_pricing_content(),
            'post_status' => 'publish',
            'post_type' => 'page',
            'page_template' => 'page-pricing.php'
        ));
        
        if ($page_id) {
            echo '<div class="notice notice-success"><p><strong>Success!</strong> Pricing page created with monthly rates.</p></div>';
            echo '<p><a href="' . get_permalink($page_id) . '" target="_blank" class="button button-secondary">View New Pricing Page</a></p>';
        }
    }
}

function get_monthly_pricing_content() {
    return '<!-- This page uses the pricing template -->
<div class="pricing-section">
    <div class="pricing-grid">
        <div class="pricing-card">
            <h3>Professional</h3>
            <div class="price">$1,000<span class="price-period">/month</span></div>
            <p>Perfect for growing retail businesses</p>
            <ul>
                <li>✓ Up to 50 locations</li>
                <li>✓ Standard integrations (Shopify, Amazon, CSV)</li>
                <li>✓ 94%+ forecast accuracy</li>
                <li>✓ Real-time dashboards</li>
                <li>✓ Email support</li>
                <li>✓ Basic reporting</li>
                <li>✓ SOC 2 compliance</li>
                <li>✓ 3-week implementation</li>
            </ul>
            <a href="https://app.ordernimbus.com" class="btn btn-secondary" target="_blank">Get Started</a>
        </div>
        
        <div class="pricing-card featured">
            <div class="pricing-badge">Most Popular</div>
            <h3>Enterprise</h3>
            <div class="price">$3,000<span class="price-period">/month</span></div>
            <p>For established multi-location retailers</p>
            <ul>
                <li>✓ Up to 200 locations</li>
                <li>✓ Custom integrations + APIs</li>
                <li>✓ 94%+ forecast accuracy</li>
                <li>✓ Advanced analytics suite</li>
                <li>✓ Priority support (24/7)</li>
                <li>✓ Advanced reporting & insights</li>
                <li>✓ SSO integration</li>
                <li>✓ Dedicated customer success manager</li>
                <li>✓ Custom training programs</li>
            </ul>
            <a href="https://app.ordernimbus.com" class="btn btn-primary" target="_blank">Get Started</a>
        </div>
        
        <div class="pricing-card">
            <h3>Enterprise Plus</h3>
            <div class="price">$5,000+<span class="price-period">/month</span></div>
            <p>For large-scale enterprise operations</p>
            <ul>
                <li>✓ Unlimited locations</li>
                <li>✓ Custom model training</li>
                <li>✓ 95%+ forecast accuracy</li>
                <li>✓ White-label options</li>
                <li>✓ Dedicated customer success team</li>
                <li>✓ Custom reporting & BI integration</li>
                <li>✓ SLA guarantees (99.99% uptime)</li>
                <li>✓ On-premise deployment options</li>
                <li>✓ Custom compliance certifications</li>
            </ul>
            <a href="/contact" class="btn btn-secondary">Contact Sales</a>
        </div>
    </div>
</div>';
}

// Also update the index page pricing references
add_action('init', 'ordernimbus_update_index_pricing');

function ordernimbus_update_index_pricing() {
    if (isset($_GET['update_index_pricing'])) {
        $home_page = get_page_by_path('home');
        if (!$home_page) {
            $home_page = get_option('page_on_front');
            if ($home_page) {
                $home_page = get_post($home_page);
            }
        }
        
        if ($home_page) {
            $content = get_post_field('post_content', $home_page->ID);
            
            // Update any pricing references in home page
            $content = str_replace('$12K/year', '$1,000/month', $content);
            $content = str_replace('$36K/year', '$3,000/month', $content);
            $content = str_replace('$60K+/year', '$5,000+/month', $content);
            
            wp_update_post(array(
                'ID' => $home_page->ID,
                'post_content' => $content
            ));
        }
    }
}
?>