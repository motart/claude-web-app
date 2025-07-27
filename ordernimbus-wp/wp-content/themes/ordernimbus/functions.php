<?php
// Theme setup
function ordernimbus_theme_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    add_theme_support('custom-logo');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => 'Primary Menu',
        'footer' => 'Footer Menu',
    ));
}
add_action('after_setup_theme', 'ordernimbus_theme_setup');

// Enqueue styles and scripts
function ordernimbus_scripts() {
    wp_enqueue_style('ordernimbus-style', get_stylesheet_uri(), array(), '1.0.0');
    wp_enqueue_script('ordernimbus-script', get_template_directory_uri() . '/js/main.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'ordernimbus_scripts');

// Register widget areas
function ordernimbus_widgets_init() {
    register_sidebar(array(
        'name' => 'Footer Widget Area',
        'id' => 'footer-widgets',
        'description' => 'Widgets for the footer area',
        'before_widget' => '<div class="footer-widget">',
        'after_widget' => '</div>',
        'before_title' => '<h4>',
        'after_title' => '</h4>',
    ));
}
add_action('widgets_init', 'ordernimbus_widgets_init');

// Custom post types
function ordernimbus_custom_post_types() {
    // Case Studies
    register_post_type('case_study', array(
        'labels' => array(
            'name' => 'Case Studies',
            'singular_name' => 'Case Study',
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-analytics',
    ));
    
    // Team Members
    register_post_type('team_member', array(
        'labels' => array(
            'name' => 'Team Members',
            'singular_name' => 'Team Member',
        ),
        'public' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-groups',
    ));
}
add_action('init', 'ordernimbus_custom_post_types');

// Add custom fields for case studies
function ordernimbus_case_study_metaboxes() {
    add_meta_box(
        'case_study_details',
        'Case Study Details',
        'ordernimbus_case_study_details_callback',
        'case_study',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'ordernimbus_case_study_metaboxes');

function ordernimbus_case_study_details_callback($post) {
    wp_nonce_field('ordernimbus_case_study_nonce', 'case_study_nonce');
    
    $company = get_post_meta($post->ID, '_company_name', true);
    $industry = get_post_meta($post->ID, '_industry', true);
    $roi = get_post_meta($post->ID, '_roi', true);
    $accuracy = get_post_meta($post->ID, '_accuracy_improvement', true);
    
    echo '<table>';
    echo '<tr><td><label for="company_name">Company Name:</label></td>';
    echo '<td><input type="text" name="company_name" value="' . esc_attr($company) . '" /></td></tr>';
    echo '<tr><td><label for="industry">Industry:</label></td>';
    echo '<td><input type="text" name="industry" value="' . esc_attr($industry) . '" /></td></tr>';
    echo '<tr><td><label for="roi">ROI (%):</label></td>';
    echo '<td><input type="text" name="roi" value="' . esc_attr($roi) . '" /></td></tr>';
    echo '<tr><td><label for="accuracy_improvement">Accuracy Improvement (%):</label></td>';
    echo '<td><input type="text" name="accuracy_improvement" value="' . esc_attr($accuracy) . '" /></td></tr>';
    echo '</table>';
}

function ordernimbus_save_case_study_details($post_id) {
    if (!wp_verify_nonce($_POST['case_study_nonce'], 'ordernimbus_case_study_nonce')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    update_post_meta($post_id, '_company_name', sanitize_text_field($_POST['company_name']));
    update_post_meta($post_id, '_industry', sanitize_text_field($_POST['industry']));
    update_post_meta($post_id, '_roi', sanitize_text_field($_POST['roi']));
    update_post_meta($post_id, '_accuracy_improvement', sanitize_text_field($_POST['accuracy_improvement']));
}
add_action('save_post', 'ordernimbus_save_case_study_details');

// Contact form shortcode
function ordernimbus_contact_form_shortcode() {
    ob_start();
    ?>
    <form id="contact-form" class="contact-form" method="post" action="">
        <div class="form-row">
            <div class="form-group">
                <label for="first_name">First Name *</label>
                <input type="text" name="first_name" id="first_name" required>
            </div>
            <div class="form-group">
                <label for="last_name">Last Name *</label>
                <input type="text" name="last_name" id="last_name" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" name="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="company">Company *</label>
                <input type="text" name="company" id="company" required>
            </div>
        </div>
        <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" name="phone" id="phone">
        </div>
        <div class="form-group">
            <label for="message">Message</label>
            <textarea name="message" id="message" rows="5"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
    
    <style>
    .contact-form { max-width: 600px; margin: 0 auto; }
    .form-row { display: flex; gap: 1rem; }
    .form-group { flex: 1; margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
    .form-group input, .form-group textarea { 
        width: 100%; padding: 12px; border: 1px solid #ddd; 
        border-radius: 6px; font-size: 16px; 
    }
    .form-group input:focus, .form-group textarea:focus {
        outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    @media (max-width: 768px) {
        .form-row { flex-direction: column; }
    }
    </style>
    <?php
    return ob_get_clean();
}
add_shortcode('contact_form', 'ordernimbus_contact_form_shortcode');

// Process contact form
function ordernimbus_process_contact_form() {
    if (isset($_POST['first_name']) && isset($_POST['email'])) {
        $first_name = sanitize_text_field($_POST['first_name']);
        $last_name = sanitize_text_field($_POST['last_name']);
        $email = sanitize_email($_POST['email']);
        $company = sanitize_text_field($_POST['company']);
        $phone = sanitize_text_field($_POST['phone']);
        $message = sanitize_textarea_field($_POST['message']);
        
        $to = get_option('admin_email');
        $subject = 'New Contact Form Submission from ' . $company;
        $body = "Name: $first_name $last_name\n";
        $body .= "Email: $email\n";
        $body .= "Company: $company\n";
        $body .= "Phone: $phone\n\n";
        $body .= "Message:\n$message";
        
        $headers = array('Content-Type: text/plain; charset=UTF-8');
        
        wp_mail($to, $subject, $body, $headers);
        
        echo '<div class="form-success">Thank you for your message! We\'ll be in touch soon.</div>';
    }
}
add_action('wp_head', 'ordernimbus_process_contact_form');

// Customizer options
function ordernimbus_customize_register($wp_customize) {
    // Hero section
    $wp_customize->add_section('hero_section', array(
        'title' => 'Hero Section',
        'priority' => 30,
    ));
    
    $wp_customize->add_setting('hero_title', array(
        'default' => 'Enterprise AI-Powered Sales Forecasting',
        'sanitize_callback' => 'sanitize_text_field',
    ));
    
    $wp_customize->add_control('hero_title', array(
        'label' => 'Hero Title',
        'section' => 'hero_section',
        'type' => 'text',
    ));
    
    $wp_customize->add_setting('hero_subtitle', array(
        'default' => 'Transform your retail operations with 94%+ forecast accuracy',
        'sanitize_callback' => 'sanitize_textarea_field',
    ));
    
    $wp_customize->add_control('hero_subtitle', array(
        'label' => 'Hero Subtitle',
        'section' => 'hero_section',
        'type' => 'textarea',
    ));
}
add_action('customize_register', 'ordernimbus_customize_register');
?>