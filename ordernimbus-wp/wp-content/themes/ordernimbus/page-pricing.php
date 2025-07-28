<?php get_header(); ?>

<main id="main-content">
    <!-- Hero Section -->
    <section class="hero" style="padding: 120px 0 60px;">
        <div class="container">
            <h1>Enterprise Pricing</h1>
            <p>Transparent, scalable pricing designed for businesses of all sizes. No hidden fees, no complex implementations.</p>
        </div>
    </section>

    <!-- Pricing Comparison -->
    <section class="content-section">
        <div class="container">
            <div class="section-title">
                <h2>Choose Your Plan</h2>
                <p>All plans include SOC 2 compliance, enterprise security, and our industry-leading forecast accuracy</p>
            </div>
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Professional</h3>
                    <div class="price">$12K<span class="price-period">/year</span></div>
                    <p>Perfect for growing retail businesses</p>
                    <ul style="text-align: left; list-style: none; padding: 0; margin: 2rem 0;">
                        <li>✓ Up to 50 locations</li>
                        <li>✓ Standard integrations (Shopify, Amazon, CSV)</li>
                        <li>✓ 94%+ forecast accuracy</li>
                        <li>✓ Real-time dashboards</li>
                        <li>✓ Email support</li>
                        <li>✓ Basic reporting</li>
                        <li>✓ SOC 2 compliance</li>
                        <li>✓ 3-week implementation</li>
                    </ul>
                    <a href="https://app.ordernimbus.com" class="btn btn-secondary" target="_blank" rel="noopener">Get Started</a>
                </div>
                
                <div class="pricing-card featured">
                    <div class="pricing-badge">Most Popular</div>
                    <h3>Enterprise</h3>
                    <div class="price">$36K<span class="price-period">/year</span></div>
                    <p>For established multi-location retailers</p>
                    <ul style="text-align: left; list-style: none; padding: 0; margin: 2rem 0;">
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
                    <a href="https://app.ordernimbus.com" class="btn btn-primary" target="_blank" rel="noopener">Get Started</a>
                </div>
                
                <div class="pricing-card">
                    <h3>Enterprise Plus</h3>
                    <div class="price">$60K+<span class="price-period">/year</span></div>
                    <p>For large-scale enterprise operations</p>
                    <ul style="text-align: left; list-style: none; padding: 0; margin: 2rem 0;">
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
        </div>
    </section>

    <!-- ROI Calculator -->
    <section class="content-section" style="background: #f8fafc;">
        <div class="container">
            <div class="section-title">
                <h2>Calculate Your ROI</h2>
                <p>See how much you could save with OrderNimbus forecasting accuracy</p>
            </div>
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px;">
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Annual Revenue</label>
                    <input type="number" id="annual-revenue" placeholder="$10,000,000" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Current Excess Inventory %</label>
                    <input type="number" id="excess-inventory" placeholder="18" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Current Stockout Rate %</label>
                    <input type="number" id="stockout-rate" placeholder="23" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <button onclick="calculateROI()" class="btn btn-primary" style="width: 100%;">Calculate Savings</button>
                <div id="roi-results" style="margin-top: 1.5rem; display: none; padding: 1rem; background: #e0f2fe; border-radius: 6px;">
                    <h4>Estimated Annual Savings</h4>
                    <p id="savings-amount"></p>
                    <p id="roi-percentage"></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Implementation Process -->
    <section class="content-section">
        <div class="container">
            <div class="section-title">
                <h2>Implementation Process</h2>
                <p>Get up and running in just 3 weeks with our proven implementation methodology</p>
            </div>
            <div class="row">
                <div class="col-third">
                    <div class="feature-card">
                        <h4>Week 1: Setup & Integration</h4>
                        <ul style="text-align: left; list-style: none; padding: 0;">
                            <li>✓ Account provisioning</li>
                            <li>✓ Data source integration</li>
                            <li>✓ Initial model training</li>
                            <li>✓ Security configuration</li>
                        </ul>
                    </div>
                </div>
                <div class="col-third">
                    <div class="feature-card">
                        <h4>Week 2: Configuration & Testing</h4>
                        <ul style="text-align: left; list-style: none; padding: 0;">
                            <li>✓ Dashboard customization</li>
                            <li>✓ Alert configuration</li>
                            <li>✓ User access setup</li>
                            <li>✓ Accuracy validation</li>
                        </ul>
                    </div>
                </div>
                <div class="col-third">
                    <div class="feature-card">
                        <h4>Week 3: Training & Go-Live</h4>
                        <ul style="text-align: left; list-style: none; padding: 0;">
                            <li>✓ User training sessions</li>
                            <li>✓ Go-live preparation</li>
                            <li>✓ Production deployment</li>
                            <li>✓ Ongoing support setup</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Competitive Comparison -->
    <section class="content-section" style="background: #f8fafc;">
        <div class="container">
            <div class="section-title">
                <h2>How We Compare</h2>
                <p>See why OrderNimbus delivers better value than traditional enterprise solutions</p>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <thead>
                        <tr style="background: #2563eb; color: white;">
                            <th style="padding: 1rem; text-align: left;">Feature</th>
                            <th style="padding: 1rem; text-align: center;">OrderNimbus</th>
                            <th style="padding: 1rem; text-align: center;">Oracle/SAP</th>
                            <th style="padding: 1rem; text-align: center;">Spreadsheets</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 1rem; font-weight: 600;">Implementation Time</td>
                            <td style="padding: 1rem; text-align: center; color: #16a34a;">3 weeks</td>
                            <td style="padding: 1rem; text-align: center; color: #dc2626;">6-12 months</td>
                            <td style="padding: 1rem; text-align: center; color: #ea580c;">Immediate</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 1rem; font-weight: 600;">Annual Cost</td>
                            <td style="padding: 1rem; text-align: center; color: #16a34a;">$12K - $60K</td>
                            <td style="padding: 1rem; text-align: center; color: #dc2626;">$500K+</td>
                            <td style="padding: 1rem; text-align: center; color: #ea580c;">Free*</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 1rem; font-weight: 600;">Forecast Accuracy</td>
                            <td style="padding: 1rem; text-align: center; color: #16a34a;">94%+</td>
                            <td style="padding: 1rem; text-align: center; color: #ea580c;">85-90%</td>
                            <td style="padding: 1rem; text-align: center; color: #dc2626;">60-70%</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 1rem; font-weight: 600;">SOC 2 Compliance</td>
                            <td style="padding: 1rem; text-align: center; color: #16a34a;">✓</td>
                            <td style="padding: 1rem; text-align: center; color: #16a34a;">✓</td>
                            <td style="padding: 1rem; text-align: center; color: #dc2626;">✗</td>
                        </tr>
                        <tr>
                            <td style="padding: 1rem; font-weight: 600;">Modern UX</td>
                            <td style="padding: 1rem; text-align: center; color: #16a34a;">✓</td>
                            <td style="padding: 1rem; text-align: center; color: #dc2626;">✗</td>
                            <td style="padding: 1rem; text-align: center; color: #dc2626;">✗</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
        <div class="container">
            <h2>Ready to Get Started?</h2>
            <p>Join enterprise retailers achieving 94%+ forecast accuracy with transparent pricing</p>
            <div class="hero-buttons">
                <a href="https://app.ordernimbus.com" class="btn btn-primary" target="_blank" rel="noopener">Get Started</a>
                <a href="/contact" class="btn btn-secondary">Contact Sales</a>
            </div>
        </div>
    </section>
</main>

<script>
function calculateROI() {
    const revenue = parseFloat(document.getElementById('annual-revenue').value) || 0;
    const excessInventory = parseFloat(document.getElementById('excess-inventory').value) || 0;
    const stockoutRate = parseFloat(document.getElementById('stockout-rate').value) || 0;
    
    if (revenue > 0) {
        // Calculate savings based on industry averages
        const excessSavings = revenue * (excessInventory / 100) * 0.68; // 68% reduction
        const stockoutSavings = revenue * (stockoutRate / 100) * 0.81; // 81% reduction
        const totalSavings = excessSavings + stockoutSavings;
        const orderNimbusCost = revenue < 50000000 ? 12000 : (revenue < 200000000 ? 36000 : 60000);
        const netSavings = totalSavings - orderNimbusCost;
        const roiPercentage = ((netSavings / orderNimbusCost) * 100).toFixed(0);
        
        document.getElementById('savings-amount').textContent = 
            `Net Annual Savings: $${netSavings.toLocaleString()}`;
        document.getElementById('roi-percentage').textContent = 
            `ROI: ${roiPercentage}%`;
        document.getElementById('roi-results').style.display = 'block';
    }
}
</script>

<?php get_footer(); ?>