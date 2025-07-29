<?php get_header(); ?>

<main id="main-content">
    <!-- Hero Section -->
    <section class="hero" style="padding: 120px 0 60px;">
        <div class="container">
            <h1>Contact OrderNimbus</h1>
            <p>Ready to transform your retail forecasting? Let's discuss how we can help your business achieve 94%+ forecast accuracy.</p>
        </div>
    </section>

    <!-- Contact Form Section -->
    <section class="content-section">
        <div class="container">
            <div class="row">
                <div class="col-half">
                    <h2>Get Started Today</h2>
                    <p>Schedule a personalized demo and see how OrderNimbus can transform your forecasting accuracy.</p>
                    
                    <?php 
                    if (isset($_GET['contact_sent']) && $_GET['contact_sent'] == '1') {
                        echo '<div class="form-success">
                            <strong>Thank you!</strong> Your demo request has been submitted. We\'ll contact you within 24 hours to schedule your personalized demo.
                        </div>';
                    }
                    ?>
                    
                    <form id="contact-form" class="contact-form" method="post" action="">
                        <?php wp_nonce_field('contact_form_nonce', 'contact_nonce'); ?>
                        
                        <div class="form-group">
                            <label for="contact_name">Full Name *</label>
                            <input type="text" id="contact_name" name="contact_name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contact_email">Work Email *</label>
                            <input type="email" id="contact_email" name="contact_email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contact_company">Company Name *</label>
                            <input type="text" id="contact_company" name="contact_company" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="contact_phone">Phone Number</label>
                            <input type="tel" id="contact_phone" name="contact_phone">
                        </div>
                        
                        <div class="form-group">
                            <label for="contact_company_size">Company Size *</label>
                            <select id="contact_company_size" name="contact_company_size" required>
                                <option value="">Select company size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="500+">500+ employees</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="contact_message">Tell us about your forecasting challenges *</label>
                            <textarea id="contact_message" name="contact_message" rows="4" required placeholder="Describe your current forecasting process, challenges, and goals..."></textarea>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="contact_newsletter" value="1">
                                <span class="checkmark"></span>
                                Subscribe to OrderNimbus updates and industry insights
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full">
                            Schedule Demo
                        </button>
                        
                        <p class="form-privacy">
                            By submitting this form, you agree to our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.
                        </p>
                    </form>
                </div>
                <div class="col-half">
                    <h2>Why Choose OrderNimbus?</h2>
                    <div style="margin-bottom: 2rem;">
                        <h4>🎯 94%+ Forecast Accuracy</h4>
                        <p>Achieve industry-leading accuracy with our ensemble ML models</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>⚡ 3-Week Implementation</h4>
                        <p>Go live quickly with our modern, cloud-native platform</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>🔒 SOC 2 Compliant</h4>
                        <p>Enterprise-grade security and compliance built-in</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>💰 Clear ROI</h4>
                        <p>Average 340% ROI in the first year</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Information -->
    <section class="content-section" style="background: #f8fafc;">
        <div class="container">
            <div class="row">
                <div class="col-third">
                    <div class="feature-card">
                        <h3>Sales Inquiries</h3>
                        <p>Ready to see OrderNimbus in action?</p>
                        <p><strong>Email:</strong> sales@ordernimbus.com<br>
                        <strong>Phone:</strong> +1 (555) 123-4567</p>
                    </div>
                </div>
                <div class="col-third">
                    <div class="feature-card">
                        <h3>Technical Support</h3>
                        <p>Need help with your implementation?</p>
                        <p><strong>Email:</strong> support@ordernimbus.com<br>
                        <strong>Portal:</strong> support.ordernimbus.com</p>
                    </div>
                </div>
                <div class="col-third">
                    <div class="feature-card">
                        <h3>Partnership</h3>
                        <p>Interested in becoming a partner?</p>
                        <p><strong>Email:</strong> partners@ordernimbus.com<br>
                        <strong>Program:</strong> Partner Portal</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Interactive Video Demo Section -->
    <section class="video-demo-section">
        <div class="video-demo-content">
            <h2 class="video-demo-title">🎥 See OrderNimbus in Action</h2>
            <p class="video-demo-subtitle">Watch our interactive demo to see how enterprise retailers achieve 94%+ forecast accuracy and 340% ROI in their first year</p>
            
            <div class="video-container">
                <div class="video-placeholder">
                    <button class="play-button" aria-label="Play OrderNimbus Demo Video">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <div class="video-overlay-text">
                        <h3>OrderNimbus Demo</h3>
                        <p>3 minutes • See live forecasting in action</p>
                    </div>
                </div>
                <div class="video-player"></div>
            </div>
            
            <div class="video-stats">
                <div class="video-stat">
                    <div class="video-stat-number">94%</div>
                    <div class="video-stat-label">Forecast Accuracy</div>
                </div>
                <div class="video-stat">
                    <div class="video-stat-number">340%</div>
                    <div class="video-stat-label">Average ROI</div>
                </div>
                <div class="video-stat">
                    <div class="video-stat-number">3</div>
                    <div class="video-stat-label">Weeks to Deploy</div>
                </div>
                <div class="video-stat">
                    <div class="video-stat-number">24/7</div>
                    <div class="video-stat-label">Support</div>
                </div>
            </div>
            
            <div class="demo-cta-buttons">
                <button class="btn-watch-demo" onclick="document.querySelector('.video-placeholder').click()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    Watch Interactive Demo
                </button>
                <a href="#contact-form" class="btn-schedule-demo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    Schedule Live Demo
                </a>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="content-section" style="background: #f8fafc;">
        <div class="container">
            <div class="section-title">
                <h2>Frequently Asked Questions</h2>
            </div>
            <div class="row">
                <div class="col-half">
                    <div style="margin-bottom: 2rem;">
                        <h4>How quickly can we get started?</h4>
                        <p>Most customers are live within 3 weeks of contract signing, including data integration and user training.</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>What platforms do you integrate with?</h4>
                        <p>We support Shopify, Amazon, BigCommerce, CSV imports, and custom APIs. Additional integrations available upon request.</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>Is OrderNimbus SOC 2 compliant?</h4>
                        <p>Yes, we are SOC 2 Type II certified with enterprise-grade security, encryption, and audit trails.</p>
                    </div>
                </div>
                <div class="col-half">
                    <div style="margin-bottom: 2rem;">
                        <h4>What kind of ROI can we expect?</h4>
                        <p>Our customers typically see 340% ROI in the first year through reduced excess inventory and improved stockout prevention.</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>Do you offer custom implementations?</h4>
                        <p>Yes, our Enterprise Plus tier includes custom model training, dedicated support, and white-label options.</p>
                    </div>
                    <div style="margin-bottom: 2rem;">
                        <h4>What support is included?</h4>
                        <p>All plans include implementation support, user training, and ongoing technical support with SLA guarantees for Enterprise customers.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
        <div class="container">
            <h2>Ready to Get Started?</h2>
            <p>Join enterprise retailers achieving 94%+ forecast accuracy</p>
            <a href="#contact-form" class="btn btn-primary">Schedule Demo</a>
        </div>
    </section>
</main>

<?php get_footer(); ?>