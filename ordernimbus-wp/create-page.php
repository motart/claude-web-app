<?php
// Create How It Works page in WordPress
require_once('wp-config.php');
require_once('wp-includes/wp-db.php');

// Create the page
$page_data = array(
    'post_title' => 'How It Works',
    'post_content' => 'This page uses the custom how-it-works template to display our 3-step process for retailers.',
    'post_status' => 'publish',
    'post_type' => 'page',
    'post_name' => 'how-it-works',
    'post_excerpt' => 'Learn how OrderNimbus transforms your retail operations in 3 simple steps',
    'meta_input' => array(
        '_wp_page_template' => 'page-how-it-works.php'
    )
);

// Check if page already exists
$existing_page = get_page_by_path('how-it-works');

if (!$existing_page) {
    $page_id = wp_insert_post($page_data);
    
    if ($page_id) {
        echo "How It Works page created successfully with ID: $page_id\n";
        
        // Update page template
        update_post_meta($page_id, '_wp_page_template', 'page-how-it-works.php');
        
        echo "Page template set to: page-how-it-works.php\n";
    } else {
        echo "Failed to create page\n";
    }
} else {
    echo "How It Works page already exists with ID: " . $existing_page->ID . "\n";
    
    // Update the template anyway
    update_post_meta($existing_page->ID, '_wp_page_template', 'page-how-it-works.php');
    echo "Template updated for existing page\n";
}
?>