<?php
/**
 * Plugin Name: OrderNimbus Pricing Override
 * Description: Forces monthly pricing display without modifying template files
 * Version: 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'ordernimbus_pricing_override_menu');

function ordernimbus_pricing_override_menu() {
    add_management_page(
        'Override Pricing Display',
        'Override Pricing',
        'manage_options',
        'ordernimbus-pricing-override',
        'ordernimbus_pricing_override_page'
    );
}

function ordernimbus_pricing_override_page() {
    if (isset($_POST['activate_override'])) {
        update_option('ordernimbus_pricing_override', 'monthly');
        echo '<div class="notice notice-success"><p><strong>Success!</strong> Monthly pricing override activated.</p></div>';
    }
    
    if (isset($_POST['deactivate_override'])) {
        delete_option('ordernimbus_pricing_override');
        echo '<div class="notice notice-success"><p>Pricing override deactivated.</p></div>';
    }
    
    $current_override = get_option('ordernimbus_pricing_override', 'none');
    
    ?>
    <div class="wrap">
        <h1>OrderNimbus Pricing Override</h1>
        <p>This will force monthly pricing to display on all pages without modifying template files.</p>
        
        <p><strong>Current Status:</strong> 
            <?php echo $current_override === 'monthly' ? '<span style="color: green;">Monthly Pricing Active</span>' : '<span style="color: red;">Override Inactive</span>'; ?>
        </p>
        
        <form method="post" style="margin: 20px 0;">
            <?php wp_nonce_field('ordernimbus_pricing_override', 'pricing_nonce'); ?>
            <?php if ($current_override !== 'monthly'): ?>
                <input type="submit" name="activate_override" class="button button-primary button-large" value="Activate Monthly Pricing">
            <?php else: ?>
                <input type="submit" name="deactivate_override" class="button button-secondary" value="Deactivate Override">
            <?php endif; ?>
        </form>
        
        <div style="background: #f0f0f1; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <h3>What this does:</h3>
            <ul>
                <li>✅ Replaces all yearly prices with monthly prices</li>
                <li>✅ Updates price periods from "/year" to "/month"</li>
                <li>✅ Works immediately without file permissions</li>
                <li>✅ Can be easily reversed</li>
            </ul>
        </div>
    </div>
    <?php
}

// Hook into page content output to replace pricing
add_filter('the_content', 'ordernimbus_override_pricing_content');
add_action('wp_head', 'ordernimbus_pricing_override_js');

function ordernimbus_override_pricing_content($content) {
    // Only override if setting is active
    if (get_option('ordernimbus_pricing_override') !== 'monthly') {
        return $content;
    }
    
    // Replace pricing in content
    $replacements = array(
        '$12K' => '$1,000',
        '$36K' => '$3,000', 
        '$60K+' => '$5,000+',
        '$12k' => '$1,000',
        '$36k' => '$3,000',
        '$60k+' => '$5,000+',
        '/year' => '/month',
        'per year' => 'per month',
        'annually' => 'monthly',
        'Annual Cost' => 'Monthly Cost',
        '$12K - $60K' => '$1K - $5K',
        '$500K+' => '$42K+'
    );
    
    foreach ($replacements as $old => $new) {
        $content = str_replace($old, $new, $content);
    }
    
    return $content;
}

function ordernimbus_pricing_override_js() {
    // Only add JS if setting is active
    if (get_option('ordernimbus_pricing_override') !== 'monthly') {
        return;
    }
    
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // Force replace pricing text in the DOM
        function replacePricing() {
            var replacements = {
                '$12K': '$1,000',
                '$36K': '$3,000',
                '$60K+': '$5,000+',
                '$12k': '$1,000',
                '$36k': '$3,000', 
                '$60k+': '$5,000+',
                '/year': '/month',
                'per year': 'per month',
                'annually': 'monthly',
                'Annual Cost': 'Monthly Cost',
                '$12K - $60K': '$1K - $5K',
                '$500K+': '$42K+'
            };
            
            // Get all text nodes
            var walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            var textNodes = [];
            var node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            
            // Replace text in all nodes
            textNodes.forEach(function(textNode) {
                var content = textNode.textContent;
                var originalContent = content;
                
                for (var old in replacements) {
                    content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacements[old]);
                }
                
                if (content !== originalContent) {
                    textNode.textContent = content;
                }
            });
            
            // Also replace in price elements specifically
            var priceElements = document.querySelectorAll('.price, [class*="price"], [id*="price"]');
            priceElements.forEach(function(element) {
                var html = element.innerHTML;
                var originalHtml = html;
                
                for (var old in replacements) {
                    html = html.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacements[old]);
                }
                
                if (html !== originalHtml) {
                    element.innerHTML = html;
                }
            });
        }
        
        // Run immediately
        replacePricing();
        
        // Run again after a short delay to catch any dynamically loaded content
        setTimeout(replacePricing, 1000);
        setTimeout(replacePricing, 3000);
    });
    </script>
    <style>
    /* Hide original pricing during replacement to prevent flicker */
    .price:contains('$12K'), .price:contains('$36K'), .price:contains('$60K') {
        opacity: 0;
        transition: opacity 0.3s;
    }
    </style>
    <?php
}

// Add a notice on pricing pages
add_action('wp_footer', 'ordernimbus_pricing_notice');

function ordernimbus_pricing_notice() {
    if (get_option('ordernimbus_pricing_override') === 'monthly' && (is_page('pricing') || is_front_page())) {
        echo '<div id="pricing-override-notice" style="position: fixed; bottom: 10px; right: 10px; background: #4CAF50; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 9999;">Monthly Pricing Active</div>';
        echo '<script>setTimeout(function(){document.getElementById("pricing-override-notice").style.display="none";}, 3000);</script>';
    }
}
?>