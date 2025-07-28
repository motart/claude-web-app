<footer class="site-footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-section">
                <h4>OrderNimbus</h4>
                <p>Enterprise AI-powered sales forecasting platform for retail organizations.</p>
                <p>SOC 2 Type II Compliant</p>
            </div>
            <div class="footer-section">
                <h4>Solutions</h4>
                <ul>
                    <li><a href="/sales-forecasting">Sales Forecasting</a></li>
                    <li><a href="/inventory-optimization">Inventory Optimization</a></li>
                    <li><a href="/demand-planning">Demand Planning</a></li>
                    <li><a href="/integrations">Platform Integrations</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Company</h4>
                <ul>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/careers">Careers</a></li>
                    <li><a href="/customers">Customer Stories</a></li>
                    <li><a href="/blog">Blog</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Support</h4>
                <ul>
                    <li><a href="/contact">Contact Us</a></li>
                    <li><a href="/documentation">Documentation</a></li>
                    <li><a href="/security">Security</a></li>
                    <li><a href="/compliance">Compliance</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <?php echo date('Y'); ?> OrderNimbus. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
        </div>
    </div>
</footer>

<!-- Floating CTA Button -->
<div class="floating-cta" id="floating-cta">
    <a href="https://app.ordernimbus.com" class="floating-btn" target="_blank" rel="noopener">
        <span class="floating-btn-text">Get Started</span>
        <span class="floating-btn-icon">→</span>
    </a>
</div>

<script>
// Show/hide floating CTA based on scroll position
window.addEventListener('scroll', function() {
    const floatingCta = document.getElementById('floating-cta');
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > heroBottom) {
            floatingCta.classList.add('visible');
        } else {
            floatingCta.classList.remove('visible');
        }
    }
});
</script>

<?php wp_footer(); ?>
</body>
</html>