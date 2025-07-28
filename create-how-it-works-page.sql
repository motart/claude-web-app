-- Create How It Works page in WordPress
USE ordernimbus_wp;

-- Insert the page into wp_posts table
INSERT INTO wp_posts (
    ID,
    post_author,
    post_date,
    post_date_gmt,
    post_content,
    post_title,
    post_excerpt,
    post_status,
    comment_status,
    ping_status,
    post_password,
    post_name,
    to_ping,
    pinged,
    post_modified,
    post_modified_gmt,
    post_content_filtered,
    post_parent,
    guid,
    menu_order,
    post_type,
    post_mime_type,
    comment_count
) VALUES (
    NULL,
    1,
    NOW(),
    UTC_TIMESTAMP(),
    'This page uses the custom how-it-works template to display our 3-step process for retailers.',
    'How It Works',
    'Learn how OrderNimbus transforms your retail operations in 3 simple steps',
    'publish',
    'closed',
    'closed',
    '',
    'how-it-works',
    '',
    '',
    NOW(),
    UTC_TIMESTAMP(),
    '',
    0,
    '',
    0,
    'page',
    '',
    0
);

-- Update the GUID with the correct URL format
UPDATE wp_posts 
SET guid = CONCAT('http://ordernimbus.com/?page_id=', LAST_INSERT_ID()) 
WHERE ID = LAST_INSERT_ID();

-- Add page template meta
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
VALUES (LAST_INSERT_ID(), '_wp_page_template', 'page-how-it-works.php');

-- Add SEO meta if needed
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
VALUES (LAST_INSERT_ID(), '_yoast_wpseo_metadesc', 'Discover how OrderNimbus transforms retail operations with AI-powered forecasting. Sign up, connect your systems, and get accurate predictions in 3 simple steps.');

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) 
VALUES (LAST_INSERT_ID(), '_yoast_wpseo_title', 'How It Works - OrderNimbus AI Sales Forecasting');