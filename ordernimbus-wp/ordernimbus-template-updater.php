<?php
/**
 * Plugin Name: OrderNimbus Template Updater
 * Description: Updates the actual template files with monthly pricing
 * Version: 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'ordernimbus_template_updater_menu');

function ordernimbus_template_updater_menu() {
    add_management_page(
        'Update OrderNimbus Templates',
        'Update Templates',
        'manage_options',
        'ordernimbus-template-updater',
        'ordernimbus_template_updater_page'
    );
}

function ordernimbus_template_updater_page() {
    if (isset($_POST['update_templates'])) {
        ordernimbus_update_templates();
    }
    
    ?>
    <div class="wrap">
        <h1>OrderNimbus Template Updater</h1>
        <p>This will update the actual template files to show monthly pricing.</p>
        
        <form method="post">
            <?php wp_nonce_field('ordernimbus_template_update', 'template_nonce'); ?>
            <p>
                <input type="submit" name="update_templates" class="button button-primary button-large" value="Update Template Files">
            </p>
        </form>
    </div>
    <?php
}

function ordernimbus_update_templates() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['template_nonce'], 'ordernimbus_template_update')) {
        wp_die('Security check failed');
    }
    
    // Check permissions
    if (!current_user_can('manage_options')) {
        wp_die('You do not have permission to update templates');
    }
    
    echo '<div class="notice notice-info"><p>Updating template files...</p></div>';
    
    // Get theme directory
    $theme_dir = get_template_directory();
    $pricing_file = $theme_dir . '/page-pricing.php';
    $index_file = $theme_dir . '/index.php';
    
    // Update pricing template
    if (file_exists($pricing_file)) {
        $content = file_get_contents($pricing_file);
        
        // Update pricing amounts
        $content = str_replace('$12K<span class="price-period">/year</span>', '$1,000<span class="price-period">/month</span>', $content);
        $content = str_replace('$36K<span class="price-period">/year</span>', '$3,000<span class="price-period">/month</span>', $content);
        $content = str_replace('$60K+<span class="price-period">/year</span>', '$5,000+<span class="price-period">/month</span>', $content);
        
        // Update comparison table
        $content = str_replace('Annual Cost', 'Monthly Cost', $content);
        $content = str_replace('$12K - $60K', '$1K - $5K', $content);
        $content = str_replace('$500K+', '$42K+', $content);
        
        // Write updated content
        if (file_put_contents($pricing_file, $content)) {
            echo '<div class="notice notice-success"><p>✅ Updated page-pricing.php</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>❌ Failed to update page-pricing.php</p></div>';
        }
    }
    
    // Update index template if it has pricing references
    if (file_exists($index_file)) {
        $content = file_get_contents($index_file);
        $original_content = $content;
        
        // Update any pricing references in index
        $content = str_replace('$12K/year', '$1,000/month', $content);
        $content = str_replace('$36K/year', '$3,000/month', $content);
        $content = str_replace('$60K+/year', '$5,000+/month', $content);
        $content = str_replace('starting at $12K/year', 'starting at $1,000/month', $content);
        
        if ($content !== $original_content) {
            if (file_put_contents($index_file, $content)) {
                echo '<div class="notice notice-success"><p>✅ Updated index.php</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>❌ Failed to update index.php</p></div>';
            }
        }
    }
    
    // Clear any caches
    if (function_exists('wp_cache_flush')) {
        wp_cache_flush();
    }
    
    // Try to clear object cache
    if (function_exists('wp_cache_delete')) {
        wp_cache_delete('alloptions', 'options');
    }
    
    echo '<div class="notice notice-success"><p><strong>Template Update Complete!</strong></p></div>';
    echo '<p><a href="/pricing" target="_blank" class="button button-secondary">View Updated Pricing Page</a></p>';
    echo '<p><em>If you still see old prices, try hard refresh (Ctrl+F5 or Cmd+Shift+R)</em></p>';
}

// Add a direct action to force template update
add_action('wp_ajax_force_template_update', 'ordernimbus_force_template_update');

function ordernimbus_force_template_update() {
    // Force update without admin interface
    $theme_dir = get_template_directory();
    $pricing_file = $theme_dir . '/page-pricing.php';
    
    if (file_exists($pricing_file)) {
        $content = file_get_contents($pricing_file);
        
        // Multiple replacement patterns to catch all variations
        $replacements = array(
            '$12K<span class="price-period">/year</span>' => '$1,000<span class="price-period">/month</span>',
            '$36K<span class="price-period">/year</span>' => '$3,000<span class="price-period">/month</span>',
            '$60K+<span class="price-period">/year</span>' => '$5,000+<span class="price-period">/month</span>',
            '>$12K<' => '>$1,000<',
            '>$36K<' => '>$3,000<',
            '>$60K+<' => '>$5,000+<',
            '/year' => '/month',
            'Annual Cost' => 'Monthly Cost',
            '$12K - $60K' => '$1K - $5K',
            '$500K+' => '$42K+'
        );
        
        foreach ($replacements as $old => $new) {
            $content = str_replace($old, $new, $content);
        }
        
        file_put_contents($pricing_file, $content);
        
        wp_die('Template updated successfully');
    }
    
    wp_die('Template file not found');
}
?>