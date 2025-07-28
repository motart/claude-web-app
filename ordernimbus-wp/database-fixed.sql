-- WordPress Database for OrderNimbus
-- Created for All-in-One WP Migration

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Database: `ordernimbus_wp`

-- --------------------------------------------------------

--
-- Table structure for table `wp_options`
--

CREATE TABLE `wp_options` (
  `option_id` bigint(20) UNSIGNED NOT NULL,
  `option_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `option_value` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `autoload` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'yes'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wp_options`
--

INSERT INTO `wp_options` (`option_id`, `option_name`, `option_value`, `autoload`) VALUES
(1, 'siteurl', 'http://52.41.161.0', 'yes'),
(2, 'home', 'http://52.41.161.0', 'yes'),
(3, 'blogname', 'OrderNimbus - Enterprise AI-Powered Sales Forecasting', 'yes'),
(4, 'blogdescription', 'Transform your retail operations with 94%+ forecast accuracy through enterprise-grade AI', 'yes'),
(5, 'users_can_register', '0', 'yes'),
(6, 'admin_email', 'admin@ordernimbus.com', 'yes'),
(7, 'start_of_week', '1', 'yes'),
(8, 'use_balanceTags', '0', 'yes'),
(9, 'use_smilies', '1', 'yes'),
(10, 'require_name_email', '1', 'yes'),
(11, 'comments_notify', '1', 'yes'),
(12, 'posts_per_rss', '10', 'yes'),
(13, 'rss_use_excerpt', '0', 'yes'),
(14, 'mailserver_url', 'mail.example.com', 'yes'),
(15, 'mailserver_login', 'login@example.com', 'yes'),
(16, 'mailserver_pass', 'password', 'yes'),
(17, 'mailserver_port', '110', 'yes'),
(18, 'default_category', '1', 'yes'),
(19, 'default_comment_status', 'open', 'yes'),
(20, 'default_ping_status', 'open', 'yes'),
(21, 'default_pingback_flag', '1', 'yes'),
(22, 'posts_per_page', '10', 'yes'),
(23, 'date_format', 'F j, Y', 'yes'),
(24, 'time_format', 'g:i a', 'yes'),
(25, 'links_updated_date_format', 'F j, Y g:i a', 'yes'),
(26, 'comment_moderation', '0', 'yes'),
(27, 'moderation_notify', '1', 'yes'),
(28, 'permalink_structure', '/%postname%/', 'yes'),
(29, 'rewrite_rules', '', 'yes'),
(30, 'hack_file', '0', 'yes'),
(31, 'blog_charset', 'UTF-8', 'yes'),
(32, 'moderation_keys', '', 'no'),
(33, 'active_plugins', 'a:0:{}', 'yes'),
(34, 'category_base', '', 'yes'),
(35, 'ping_sites', 'http://rpc.pingomatic.com/', 'yes'),
(36, 'comment_max_links', '2', 'yes'),
(37, 'gmt_offset', '0', 'yes'),
(38, 'default_email_category', '1', 'yes'),
(39, 'recently_edited', '', 'no'),
(40, 'template', 'ordernimbus', 'yes'),
(41, 'stylesheet', 'ordernimbus', 'yes'),
(42, 'comment_registration', '0', 'yes'),
(43, 'html_type', 'text/html', 'yes'),
(44, 'use_trackback', '0', 'yes'),
(45, 'default_role', 'subscriber', 'yes'),
(46, 'db_version', '57155', 'yes'),
(47, 'uploads_use_yearmonth_folders', '1', 'yes'),
(48, 'upload_path', '', 'yes'),
(49, 'blog_public', '1', 'yes'),
(50, 'default_link_category', '2', 'yes'),
(51, 'show_on_front', 'page', 'yes'),
(52, 'page_on_front', '5', 'yes'),
(53, 'page_for_posts', '0', 'yes'),
(54, 'tag_base', '', 'yes'),
(55, 'show_avatars', '1', 'yes'),
(56, 'avatar_rating', 'G', 'yes'),
(57, 'upload_url_path', '', 'yes'),
(58, 'thumbnail_size_w', '150', 'yes'),
(59, 'thumbnail_size_h', '150', 'yes'),
(60, 'thumbnail_crop', '1', 'yes'),
(61, 'medium_size_w', '300', 'yes'),
(62, 'medium_size_h', '300', 'yes'),
(63, 'avatar_default', 'mystery', 'yes'),
(64, 'large_size_w', '1024', 'yes'),
(65, 'large_size_h', '1024', 'yes'),
(66, 'image_default_link_type', 'none', 'yes'),
(67, 'image_default_size', '', 'yes'),
(68, 'image_default_align', '', 'yes'),
(69, 'close_comments_for_old_posts', '0', 'yes'),
(70, 'close_comments_days_old', '14', 'yes'),
(71, 'thread_comments', '1', 'yes'),
(72, 'thread_comments_depth', '5', 'yes'),
(73, 'page_comments', '0', 'yes'),
(74, 'comments_per_page', '50', 'yes'),
(75, 'default_comments_page', 'newest', 'yes'),
(76, 'comment_order', 'asc', 'yes'),
(77, 'sticky_posts', 'a:0:{}', 'yes'),
(78, 'widget_categories', 'a:0:{}', 'yes'),
(79, 'widget_text', 'a:0:{}', 'yes'),
(80, 'widget_rss', 'a:0:{}', 'yes'),
(81, 'uninstall_plugins', 'a:0:{}', 'no'),
(82, 'timezone_string', '', 'yes'),
(83, 'page_for_privacy_policy', '3', 'yes'),
(84, 'show_comments_cookies_opt_in', '1', 'yes'),
(85, 'admin_email_lifespan', '1672531200', 'yes'),
(86, 'disallowed_keys', '', 'no'),
(87, 'comment_previously_approved', '1', 'yes'),
(88, 'auto_plugin_theme_update_emails', 'a:0:{}', 'no'),
(89, 'auto_update_core_dev', 'enabled', 'yes'),
(90, 'auto_update_core_minor', 'enabled', 'yes'),
(91, 'auto_update_core_major', 'enabled', 'yes'),
(92, 'wp_force_deactivated_plugins', 'a:0:{}', 'yes'),
(93, 'initial_db_version', '57155', 'yes'),
(94, 'wp_user_roles', 'a:5:{s:13:\"administrator\";a:2:{s:4:\"name\";s:13:\"Administrator\";s:12:\"capabilities\";a:61:{s:13:\"switch_themes\";b:1;s:11:\"edit_themes\";b:1;s:16:\"activate_plugins\";b:1;s:12:\"edit_plugins\";b:1;s:10:\"edit_users\";b:1;s:10:\"edit_files\";b:1;s:14:\"manage_options\";b:1;s:17:\"moderate_comments\";b:1;s:17:\"manage_categories\";b:1;s:12:\"manage_links\";b:1;s:12:\"upload_files\";b:1;s:6:\"import\";b:1;s:15:\"unfiltered_html\";b:1;s:10:\"edit_posts\";b:1;s:17:\"edit_others_posts\";b:1;s:20:\"edit_published_posts\";b:1;s:13:\"publish_posts\";b:1;s:10:\"edit_pages\";b:1;s:4:\"read\";b:1;s:8:\"level_10\";b:1;s:7:\"level_9\";b:1;s:7:\"level_8\";b:1;s:7:\"level_7\";b:1;s:7:\"level_6\";b:1;s:7:\"level_5\";b:1;s:7:\"level_4\";b:1;s:7:\"level_3\";b:1;s:7:\"level_2\";b:1;s:7:\"level_1\";b:1;s:7:\"level_0\";b:1;s:17:\"edit_others_pages\";b:1;s:20:\"edit_published_pages\";b:1;s:13:\"publish_pages\";b:1;s:12:\"delete_pages\";b:1;s:19:\"delete_others_pages\";b:1;s:22:\"delete_published_pages\";b:1;s:12:\"delete_posts\";b:1;s:19:\"delete_others_posts\";b:1;s:22:\"delete_published_posts\";b:1;s:20:\"delete_private_posts\";b:1;s:18:\"edit_private_posts\";b:1;s:18:\"read_private_posts\";b:1;s:20:\"delete_private_pages\";b:1;s:18:\"edit_private_pages\";b:1;s:18:\"read_private_pages\";b:1;s:12:\"delete_users\";b:1;s:12:\"create_users\";b:1;s:17:\"unfiltered_upload\";b:1;s:14:\"edit_dashboard\";b:1;s:14:\"update_plugins\";b:1;s:14:\"delete_plugins\";b:1;s:15:\"install_plugins\";b:1;s:13:\"update_themes\";b:1;s:14:\"install_themes\";b:1;s:11:\"update_core\";b:1;s:10:\"list_users\";b:1;s:12:\"remove_users\";b:1;s:13:\"promote_users\";b:1;s:18:\"edit_theme_options\";b:1;s:13:\"delete_themes\";b:1;s:6:\"export\";b:1;}}s:6:\"editor\";a:2:{s:4:\"name\";s:6:\"Editor\";s:12:\"capabilities\";a:34:{s:17:\"moderate_comments\";b:1;s:17:\"manage_categories\";b:1;s:12:\"manage_links\";b:1;s:12:\"upload_files\";b:1;s:15:\"unfiltered_html\";b:1;s:10:\"edit_posts\";b:1;s:17:\"edit_others_posts\";b:1;s:20:\"edit_published_posts\";b:1;s:13:\"publish_posts\";b:1;s:10:\"edit_pages\";b:1;s:4:\"read\";b:1;s:7:\"level_7\";b:1;s:7:\"level_6\";b:1;s:7:\"level_5\";b:1;s:7:\"level_4\";b:1;s:7:\"level_3\";b:1;s:7:\"level_2\";b:1;s:7:\"level_1\";b:1;s:7:\"level_0\";b:1;s:17:\"edit_others_pages\";b:1;s:20:\"edit_published_pages\";b:1;s:13:\"publish_pages\";b:1;s:12:\"delete_pages\";b:1;s:19:\"delete_others_pages\";b:1;s:22:\"delete_published_pages\";b:1;s:12:\"delete_posts\";b:1;s:19:\"delete_others_posts\";b:1;s:22:\"delete_published_posts\";b:1;s:20:\"delete_private_posts\";b:1;s:18:\"edit_private_posts\";b:1;s:18:\"read_private_posts\";b:1;s:20:\"delete_private_pages\";b:1;s:18:\"edit_private_pages\";b:1;s:18:\"read_private_pages\";b:1;}}s:6:\"author\";a:2:{s:4:\"name\";s:6:\"Author\";s:12:\"capabilities\";a:10:{s:12:\"upload_files\";b:1;s:10:\"edit_posts\";b:1;s:20:\"edit_published_posts\";b:1;s:13:\"publish_posts\";b:1;s:4:\"read\";b:1;s:7:\"level_2\";b:1;s:7:\"level_1\";b:1;s:7:\"level_0\";b:1;s:12:\"delete_posts\";b:1;s:22:\"delete_published_posts\";b:1;}}s:11:\"contributor\";a:2:{s:4:\"name\";s:11:\"Contributor\";s:12:\"capabilities\";a:5:{s:10:\"edit_posts\";b:1;s:4:\"read\";b:1;s:7:\"level_1\";b:1;s:7:\"level_0\";b:1;s:12:\"delete_posts\";b:1;}}s:10:\"subscriber\";a:2:{s:4:\"name\";s:10:\"Subscriber\";s:12:\"capabilities\";a:2:{s:4:\"read\";b:1;s:7:\"level_0\";b:1;}}}', 'yes'),
(95, 'fresh_site', '0', 'yes'),
(96, 'WPLANG', '', 'yes'),
(97, 'new_admin_email', '', 'yes'),
(98, 'current_theme', 'OrderNimbus Theme', 'yes'),
(99, 'theme_mods_ordernimbus', 'a:3:{i:0;b:0;s:18:\"nav_menu_locations\";a:0:{}s:18:\"custom_css_post_id\";i:-1;}', 'yes'),
(100, 'theme_switched', '', 'yes');

-- --------------------------------------------------------

--
-- Table structure for table `wp_posts`
--

CREATE TABLE `wp_posts` (
  `ID` bigint(20) UNSIGNED NOT NULL,
  `post_author` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `post_date` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_date_gmt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_excerpt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'publish',
  `comment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `ping_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `post_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `post_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `to_ping` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `pinged` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_modified` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_modified_gmt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `post_content_filtered` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_parent` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `guid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `menu_order` int(11) NOT NULL DEFAULT 0,
  `post_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'post',
  `post_mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `comment_count` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wp_posts`
--

INSERT INTO `wp_posts` (`ID`, `post_author`, `post_date`, `post_date_gmt`, `post_content`, `post_title`, `post_excerpt`, `post_status`, `comment_status`, `ping_status`, `post_password`, `post_name`, `to_ping`, `pinged`, `post_modified`, `post_modified_gmt`, `post_content_filtered`, `post_parent`, `guid`, `menu_order`, `post_type`, `post_mime_type`, `comment_count`) VALUES
(1, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 'Home', '', 'publish', 'closed', 'closed', '', 'home', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=1', 0, 'page', '', 0),
(2, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>About OrderNimbus</h2>\n<p>OrderNimbus is an enterprise-grade AI forecasting platform that enables retail organizations to achieve 94%+ forecast accuracy through advanced machine learning models. As a SOC 2 Type II compliant solution, we serve enterprise retailers who demand both accuracy and security.</p>\n\n<h3>Our Mission</h3>\n<p>To transform retail operations through enterprise-grade AI forecasting that combines accuracy, security, and scalability.</p>\n\n<h3>Key Differentiators</h3>\n<ul>\n<li><strong>94%+ Forecast Accuracy</strong> vs 71% industry average with manual methods</li>\n<li><strong>SOC 2 Type II Compliance</strong> for enterprise security requirements</li>\n<li><strong>3-Week Implementation</strong> vs 6-12 months for traditional solutions</li>\n<li><strong>Enterprise-Ready Infrastructure</strong> with AWS auto-scaling and 99.9% uptime</li>\n</ul>', 'About Us', 'Learn about OrderNimbus and our mission to transform retail forecasting', 'publish', 'closed', 'closed', '', 'about', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=2', 0, 'page', '', 0),
(3, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>Enterprise Solutions</h2>\n<p>OrderNimbus provides comprehensive AI-powered forecasting solutions designed specifically for enterprise retailers.</p>\n\n<h3>Sales Forecasting</h3>\n<p>Achieve 94%+ accuracy with our ensemble ML models combining LSTM, ARIMA, and Prophet algorithms. Real-time processing with sub-second forecast updates.</p>\n\n<h3>Inventory Optimization</h3>\n<p>Reduce excess inventory by 68% and stockouts by 81% through intelligent demand planning and automated reorder point calculations.</p>\n\n<h3>Multi-Platform Integration</h3>\n<p>Seamlessly connect Shopify, Amazon, BigCommerce, CSV imports, and custom APIs with real-time data synchronization.</p>\n\n<h3>Enterprise Security</h3>\n<p>SOC 2 Type II compliant platform with enterprise-grade security, encryption, and comprehensive audit trails built-in.</p>', 'Solutions', 'Comprehensive AI-powered forecasting solutions for enterprise retailers', 'publish', 'closed', 'closed', '', 'solutions', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=3', 0, 'page', '', 0),
(4, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>Enterprise Pricing</h2>\n<p>Transparent, scalable pricing designed for businesses of all sizes. No hidden fees, no complex implementations.</p>\n\n<h3>Professional - $12K/year</h3>\n<ul>\n<li>Up to 50 locations</li>\n<li>Standard integrations</li>\n<li>Email support</li>\n<li>Basic reporting</li>\n<li>SOC 2 compliance</li>\n</ul>\n\n<h3>Enterprise - $36K/year</h3>\n<ul>\n<li>Up to 200 locations</li>\n<li>Custom integrations</li>\n<li>Priority support</li>\n<li>Advanced analytics</li>\n<li>SSO integration</li>\n</ul>\n\n<h3>Enterprise Plus - $60K+/year</h3>\n<ul>\n<li>Unlimited locations</li>\n<li>Custom model training</li>\n<li>Dedicated customer success</li>\n<li>SLA guarantees</li>\n<li>White-label options</li>\n</ul>\n\n<p><strong>Implementation:</strong> All plans include 3-week implementation and comprehensive training.</p>', 'Pricing', 'Transparent enterprise pricing for AI-powered forecasting solutions', 'publish', 'closed', 'closed', '', 'pricing', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=4', 0, 'page', '', 0),
(5, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>How OrderNimbus Works</h2>\n<p>Transform your forecasting accuracy in three simple steps with our enterprise-grade AI platform.</p>\n\n<h3>1. Connect Your Data</h3>\n<p>Integrate your existing systems in minutes. We support Shopify, Amazon, BigCommerce, CSV files, and custom APIs. Our secure, SOC 2 compliant infrastructure ensures your data remains protected.</p>\n\n<h3>2. AI Learns Your Business</h3>\n<p>Our ensemble ML models analyze your historical data, seasonal patterns, and market trends to create highly accurate forecasts. The system continuously learns and improves accuracy over time.</p>\n\n<h3>3. Get Actionable Insights</h3>\n<p>Receive real-time forecasts, automated alerts, and comprehensive analytics through our intuitive dashboard. Make data-driven inventory decisions with confidence.</p>\n\n<h3>Implementation Process</h3>\n<ul>\n<li><strong>Week 1:</strong> Account setup, data integration, initial model training</li>\n<li><strong>Week 2:</strong> Dashboard configuration, alert setup, accuracy validation</li>\n<li><strong>Week 3:</strong> User training, go-live preparation, production deployment</li>\n</ul>\n\n<h3>Ongoing Support</h3>\n<p>Dedicated customer success, 24/7 technical support, and quarterly business reviews ensure continued success and optimization.</p>', 'How it Works', 'Learn how OrderNimbus transforms your forecasting in just 3 weeks', 'publish', 'closed', 'closed', '', 'how-it-works', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=5', 0, 'page', '', 0),
(6, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>Contact OrderNimbus</h2>\n<p>Ready to transform your retail forecasting? Let''s discuss how we can help your business achieve 94%+ forecast accuracy.</p>\n\n[contact_form]\n\n<h3>Why Choose OrderNimbus?</h3>\n<ul>\n<li><strong>94%+ Forecast Accuracy:</strong> Achieve industry-leading accuracy with our ensemble ML models</li>\n<li><strong>3-Week Implementation:</strong> Go live quickly with our modern, cloud-native platform</li>\n<li><strong>SOC 2 Compliant:</strong> Enterprise-grade security and compliance built-in</li>\n<li><strong>Clear ROI:</strong> Average 340% ROI in the first year</li>\n</ul>\n\n<h3>Contact Information</h3>\n<p><strong>Sales:</strong> sales@ordernimbus.com | +1 (555) 123-4567<br>\n<strong>Support:</strong> support@ordernimbus.com<br>\n<strong>Partners:</strong> partners@ordernimbus.com</p>\n\n<h3>Frequently Asked Questions</h3>\n<p><strong>How quickly can we get started?</strong><br>\nMost customers are live within 3 weeks of contract signing, including data integration and user training.</p>\n\n<p><strong>What platforms do you integrate with?</strong><br>\nWe support Shopify, Amazon, BigCommerce, CSV imports, and custom APIs. Additional integrations available upon request.</p>\n\n<p><strong>What kind of ROI can we expect?</strong><br>\nOur customers typically see 340% ROI in the first year through reduced excess inventory and improved stockout prevention.</p>', 'Contact', 'Get in touch with OrderNimbus to start your forecasting transformation', 'publish', 'closed', 'closed', '', 'contact', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=6', 0, 'page', '', 0),
(7, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>Privacy Policy</h2>\n<p><strong>Last updated:</strong> January 27, 2025</p>\n\n<h3>Information We Collect</h3>\n<p>OrderNimbus collects information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>\n\n<h3>How We Use Your Information</h3>\n<p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>\n\n<h3>Data Security</h3>\n<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We are SOC 2 Type II certified.</p>\n\n<h3>Data Retention</h3>\n<p>We retain your information for as long as necessary to provide our services and comply with legal obligations.</p>\n\n<h3>Contact Us</h3>\n<p>If you have questions about this Privacy Policy, please contact us at privacy@ordernimbus.com.</p>', 'Privacy Policy', 'OrderNimbus Privacy Policy and data protection information', 'publish', 'closed', 'closed', '', 'privacy', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=7', 0, 'page', '', 0),
(8, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>Terms of Service</h2>\n<p><strong>Last updated:</strong> January 27, 2025</p>\n\n<h3>Acceptance of Terms</h3>\n<p>By accessing and using OrderNimbus services, you accept and agree to be bound by the terms and provision of this agreement.</p>\n\n<h3>Use License</h3>\n<p>Permission is granted to temporarily use OrderNimbus services for commercial forecasting and analytics purposes in accordance with your subscription plan.</p>\n\n<h3>Service Availability</h3>\n<p>We strive to maintain 99.9% uptime for our Enterprise customers with appropriate SLA guarantees.</p>\n\n<h3>Data Protection</h3>\n<p>Your data is protected by enterprise-grade security measures and SOC 2 Type II compliance standards.</p>\n\n<h3>Contact Information</h3>\n<p>Questions about the Terms of Service should be sent to legal@ordernimbus.com.</p>', 'Terms of Service', 'OrderNimbus Terms of Service and usage agreements', 'publish', 'closed', 'closed', '', 'terms', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?page_id=8', 0, 'page', '', 0),
(9, 1, '2025-01-27 12:00:00', '2025-01-27 12:00:00', '<h2>MidAtlantic Home Goods Case Study</h2>\n<p><strong>Company:</strong> MidAtlantic Home Goods<br>\n<strong>Industry:</strong> Home & Garden Retail<br>\n<strong>Locations:</strong> 47 stores</p>\n\n<h3>The Challenge</h3>\n<ul>\n<li>$2.1M excess inventory sitting 18+ months</li>\n<li>23% stockout rate on bestsellers</li>\n<li>40+ hours weekly manual forecasting per location</li>\n<li>Reactive inventory decisions based on gut feelings</li>\n</ul>\n\n<h3>OrderNimbus Implementation</h3>\n<p>3-week implementation including data integration from their legacy ERP system, custom dashboard configuration, and comprehensive team training.</p>\n\n<h3>Results After 6 Months</h3>\n<ul>\n<li><strong>68% reduction</strong> in excess inventory ($1.4M recovered)</li>\n<li><strong>81% reduction</strong> in stockouts</li>\n<li><strong>95% reduction</strong> in manual forecasting time (2 hours vs 40 hours weekly)</li>\n<li><strong>340% ROI</strong> in first year</li>\n<li><strong>94.7% forecast accuracy</strong> achieved</li>\n</ul>\n\n<h3>Customer Quote</h3>\n<blockquote>\n<p>"We now make inventory decisions based on data, not gut feelings. OrderNimbus has transformed our operations and given us confidence in our forecasting decisions."</p>\n<p><strong>- Sarah Chen, COO, MidAtlantic Home Goods</strong></p>\n</blockquote>', 'Customer Success: MidAtlantic Home Goods', 'How MidAtlantic Home Goods achieved 340% ROI with OrderNimbus', 'publish', 'open', 'open', '', 'midatlantic-case-study', '', '', '2025-01-27 12:00:00', '2025-01-27 12:00:00', '', 0, 'http://52.41.161.0/?p=9', 0, 'case_study', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `wp_users`
--

CREATE TABLE `wp_users` (
  `ID` bigint(20) UNSIGNED NOT NULL,
  `user_login` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_pass` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_nicename` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_url` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_registered` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `user_activation_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_status` int(11) NOT NULL DEFAULT 0,
  `display_name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wp_users`
--

INSERT INTO `wp_users` (`ID`, `user_login`, `user_pass`, `user_nicename`, `user_email`, `user_url`, `user_registered`, `user_activation_key`, `user_status`, `display_name`) VALUES
(1, 'admin', '$P$BvN1xlPZ7U6t8K4H2M3D5F6G7h8I9j0K', 'admin', 'admin@ordernimbus.com', 'http://52.41.161.0', '2025-01-27 12:00:00', '', 0, 'OrderNimbus Admin');

-- --------------------------------------------------------

--
-- Table structure for table `wp_usermeta`
--

CREATE TABLE `wp_usermeta` (
  `umeta_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `meta_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_value` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wp_usermeta`
--

INSERT INTO `wp_usermeta` (`umeta_id`, `user_id`, `meta_key`, `meta_value`) VALUES
(1, 1, 'nickname', 'admin'),
(2, 1, 'first_name', 'OrderNimbus'),
(3, 1, 'last_name', 'Admin'),
(4, 1, 'description', 'Site Administrator'),
(5, 1, 'rich_editing', 'true'),
(6, 1, 'syntax_highlighting', 'true'),
(7, 1, 'comment_shortcuts', 'false'),
(8, 1, 'admin_color', 'fresh'),
(9, 1, 'use_ssl', '0'),
(10, 1, 'show_admin_bar_front', 'true'),
(11, 1, 'locale', ''),
(12, 1, 'wp_capabilities', 'a:1:{s:13:\"administrator\";b:1;}'),
(13, 1, 'wp_user_level', '10'),
(14, 1, 'dismissed_wp_pointers', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `wp_options`
--
ALTER TABLE `wp_options`
  ADD PRIMARY KEY (`option_id`),
  ADD UNIQUE KEY `option_name` (`option_name`),
  ADD KEY `autoload` (`autoload`);

--
-- Indexes for table `wp_posts`
--
ALTER TABLE `wp_posts`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `post_name` (`post_name`(191)),
  ADD KEY `type_status_date` (`post_type`,`post_status`,`post_date`,`ID`),
  ADD KEY `post_parent` (`post_parent`),
  ADD KEY `post_author` (`post_author`);

--
-- Indexes for table `wp_users`
--
ALTER TABLE `wp_users`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `user_login_key` (`user_login`),
  ADD KEY `user_nicename` (`user_nicename`),
  ADD KEY `user_email` (`user_email`);

--
-- Indexes for table `wp_usermeta`
--
ALTER TABLE `wp_usermeta`
  ADD PRIMARY KEY (`umeta_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `meta_key` (`meta_key`(191));

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `wp_options`
--
ALTER TABLE `wp_options`
  MODIFY `option_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `wp_posts`
--
ALTER TABLE `wp_posts`
  MODIFY `ID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `wp_users`
--
ALTER TABLE `wp_users`
  MODIFY `ID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wp_usermeta`
--
ALTER TABLE `wp_usermeta`
  MODIFY `umeta_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

COMMIT;