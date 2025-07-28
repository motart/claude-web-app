<?php get_header(); ?>

<main id="main-content">
    <!-- Hero Section -->
    <section class="how-it-works-hero">
        <div class="container">
            <div class="hero-content">
                <h1>How OrderNimbus Works</h1>
                <p class="hero-subtitle">From setup to predictions in 3 simple steps. Our AI-powered platform transforms your business data into actionable inventory insights.</p>
                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-number">94%</span>
                        <span class="stat-label">Forecast Accuracy</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">3 Days</span>
                        <span class="stat-label">Average Setup</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">50+</span>
                        <span class="stat-label">Integrations</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Main Process Steps -->
    <section class="process-steps">
        <div class="container">
            <div class="steps-container">
                <!-- Step 1: Sign Up -->
                <div class="step-card" data-step="1">
                    <div class="step-number">
                        <span>1</span>
                    </div>
                    <div class="step-content">
                        <div class="step-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3>Sign Up & Get Started</h3>
                        <p>Create your OrderNimbus account in minutes. Choose from our flexible pricing plans designed for businesses of all sizes.</p>
                        <ul class="step-features">
                            <li>14-day free trial</li>
                            <li>No setup fees</li>
                            <li>Cancel anytime</li>
                            <li>24/7 onboarding support</li>
                        </ul>
                        <div class="step-cta">
                            <a href="https://app.ordernimbus.com/register" class="btn btn-primary" target="_blank">Start Free Trial</a>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Connect Systems -->
                <div class="step-card" data-step="2">
                    <div class="step-number">
                        <span>2</span>
                    </div>
                    <div class="step-content">
                        <div class="step-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3>Connect Your Systems</h3>
                        <p>Seamlessly integrate with your existing business tools. Our platform connects to 50+ systems with just a few clicks.</p>
                        
                        <!-- Integration Categories -->
                        <div class="integration-categories">
                            <div class="integration-category">
                                <h4>E-commerce Platforms</h4>
                                <div class="integration-logos">
                                    <div class="integration-item">
                                        <img src="<?php echo get_template_directory_uri(); ?>/images/integrations/shopify.svg" alt="Shopify" class="integration-logo-img">
                                        <div class="integration-logo shopify">Shopify</div>
                                    </div>
                                    <div class="integration-item">
                                        <img src="<?php echo get_template_directory_uri(); ?>/images/integrations/amazon.svg" alt="Amazon" class="integration-logo-img">
                                        <div class="integration-logo amazon">Amazon</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo woocommerce">WooCommerce</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo magento">Magento</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo bigcommerce">BigCommerce</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo prestashop">PrestaShop</div>
                                    </div>
                                </div>
                            </div>

                            <div class="integration-category">
                                <h4>ERP & Business Systems</h4>
                                <div class="integration-logos">
                                    <div class="integration-item">
                                        <img src="<?php echo get_template_directory_uri(); ?>/images/integrations/netsuite.svg" alt="NetSuite" class="integration-logo-img">
                                        <div class="integration-logo netsuite">NetSuite</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo sap">SAP</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo oracle">Oracle ERP</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo microsoft">Dynamics 365</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo sage">Sage</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo epicor">Epicor</div>
                                    </div>
                                </div>
                            </div>

                            <div class="integration-category">
                                <h4>Point of Sale (POS)</h4>
                                <div class="integration-logos">
                                    <div class="integration-item">
                                        <div class="integration-logo square">Square</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo clover">Clover</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo lightspeed">Lightspeed</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo toast">Toast</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo revel">Revel</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo vend">Vend</div>
                                    </div>
                                </div>
                            </div>

                            <div class="integration-category">
                                <h4>Accounting & Finance</h4>
                                <div class="integration-logos">
                                    <div class="integration-item">
                                        <img src="<?php echo get_template_directory_uri(); ?>/images/integrations/quickbooks.svg" alt="QuickBooks" class="integration-logo-img">
                                        <div class="integration-logo quickbooks">QuickBooks</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo xero">Xero</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo freshbooks">FreshBooks</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo wave">Wave</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo peachtree">Peachtree</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo zoho">Zoho Books</div>
                                    </div>
                                </div>
                            </div>

                            <div class="integration-category">
                                <h4>Inventory Management</h4>
                                <div class="integration-logos">
                                    <div class="integration-item">
                                        <div class="integration-logo tradegecko">TradeGecko</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo fishbowl">Fishbowl</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo inflow">inFlow</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo ordoro">Ordoro</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo skuvault">SkuVault</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo katana">Katana</div>
                                    </div>
                                </div>
                            </div>

                            <div class="integration-category">
                                <h4>Marketplaces</h4>
                                <div class="integration-logos">
                                    <div class="integration-item">
                                        <div class="integration-logo ebay">eBay</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo etsy">Etsy</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo walmart">Walmart</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo facebook">Facebook Shop</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo google">Google Shopping</div>
                                    </div>
                                    <div class="integration-item">
                                        <div class="integration-logo alibaba">Alibaba</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="step-note">
                            <p><strong>Don't see your system?</strong> We build custom integrations at no extra cost for Enterprise customers.</p>
                        </div>
                    </div>
                </div>

                <!-- Step 3: AI Predictions -->
                <div class="step-card" data-step="3">
                    <div class="step-number">
                        <span>3</span>
                    </div>
                    <div class="step-content">
                        <div class="step-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 19C10.5 19 12 18 12 16.5V7.5C12 6 10.5 5 9 5C7.5 5 6 6 6 7.5V16.5C6 18 7.5 19 9 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15.5 17C16.8807 17 18 15.8807 18 14.5V9.5C18 8.11929 16.8807 7 15.5 7C14.1193 7 13 8.11929 13 9.5V14.5C13 15.8807 14.1193 17 15.5 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M1 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3>Get AI-Powered Insights</h3>
                        <p>Our advanced AI algorithms analyze your data to provide accurate predictions and actionable recommendations.</p>
                        
                        <div class="predictions-grid">
                            <div class="prediction-item">
                                <div class="prediction-icon inventory">📦</div>
                                <h4>Smart Stocking</h4>
                                <p>Know exactly how much inventory to order and when, preventing stockouts and overstock situations.</p>
                            </div>
                            
                            <div class="prediction-item">
                                <div class="prediction-icon marketing">📈</div>
                                <h4>Marketing Optimization</h4>
                                <p>Identify when products need marketing boosts and which channels will deliver the best ROI.</p>
                            </div>
                            
                            <div class="prediction-item">
                                <div class="prediction-icon demand">🎯</div>
                                <h4>Demand Forecasting</h4>
                                <p>Predict customer demand patterns with 94% accuracy using seasonal trends and market signals.</p>
                            </div>
                            
                            <div class="prediction-item">
                                <div class="prediction-icon pricing">💰</div>
                                <h4>Pricing Insights</h4>
                                <p>Optimize pricing strategies based on demand predictions and competitive analysis.</p>
                            </div>
                            
                            <div class="prediction-item">
                                <div class="prediction-icon alerts">🔔</div>
                                <h4>Smart Alerts</h4>
                                <p>Get proactive notifications about inventory risks, trending products, and market opportunities.</p>
                            </div>
                            
                            <div class="prediction-item">
                                <div class="prediction-icon analytics">📊</div>
                                <h4>Performance Analytics</h4>
                                <p>Track forecast accuracy, inventory turnover, and business performance in real-time dashboards.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-preview">
        <div class="container">
            <div class="pricing-header">
                <h2>Reasonable Monthly Pricing</h2>
                <p>Choose the plan that fits your business size. All plans include our core AI forecasting engine.</p>
            </div>
            
            <div class="pricing-cards">
                <div class="pricing-card starter">
                    <div class="pricing-header-card">
                        <h3>Starter</h3>
                        <div class="price">
                            <span class="currency">$</span>
                            <span class="amount">99</span>
                            <span class="period">/month</span>
                        </div>
                        <p class="price-description">Perfect for small retailers</p>
                    </div>
                    <div class="pricing-features">
                        <ul>
                            <li>Up to 1,000 SKUs</li>
                            <li>2 store locations</li>
                            <li>Basic integrations</li>
                            <li>Email support</li>
                            <li>Monthly forecasts</li>
                        </ul>
                    </div>
                    <div class="pricing-cta">
                        <a href="https://app.ordernimbus.com/register?plan=starter" class="btn btn-outline" target="_blank">Start Free Trial</a>
                    </div>
                </div>

                <div class="pricing-card professional featured">
                    <div class="pricing-badge">Most Popular</div>
                    <div class="pricing-header-card">
                        <h3>Professional</h3>
                        <div class="price">
                            <span class="currency">$</span>
                            <span class="amount">299</span>
                            <span class="period">/month</span>
                        </div>
                        <p class="price-description">For growing businesses</p>
                    </div>
                    <div class="pricing-features">
                        <ul>
                            <li>Up to 10,000 SKUs</li>
                            <li>10 store locations</li>
                            <li>All integrations</li>
                            <li>Priority support</li>
                            <li>Weekly forecasts</li>
                            <li>Advanced analytics</li>
                            <li>Custom alerts</li>
                        </ul>
                    </div>
                    <div class="pricing-cta">
                        <a href="https://app.ordernimbus.com/register?plan=professional" class="btn btn-primary" target="_blank">Start Free Trial</a>
                    </div>
                </div>

                <div class="pricing-card enterprise">
                    <div class="pricing-header-card">
                        <h3>Enterprise</h3>
                        <div class="price">
                            <span class="currency">$</span>
                            <span class="amount">999</span>
                            <span class="period">/month</span>
                        </div>
                        <p class="price-description">For large organizations</p>
                    </div>
                    <div class="pricing-features">
                        <ul>
                            <li>Unlimited SKUs</li>
                            <li>Unlimited locations</li>
                            <li>Custom integrations</li>
                            <li>24/7 phone support</li>
                            <li>Daily forecasts</li>
                            <li>White-label options</li>
                            <li>Dedicated CSM</li>
                            <li>SLA guarantee</li>
                        </ul>
                    </div>
                    <div class="pricing-cta">
                        <a href="/contact" class="btn btn-outline">Contact Sales</a>
                    </div>
                </div>
            </div>

            <div class="pricing-note">
                <p>All plans include a 14-day free trial. No setup fees. Cancel anytime.</p>
            </div>
        </div>
    </section>

    <!-- ROI Calculator -->
    <section class="roi-calculator">
        <div class="container">
            <div class="roi-header">
                <h2>Calculate Your ROI</h2>
                <p>See how much OrderNimbus can save your business</p>
            </div>
            
            <div class="calculator-container">
                <div class="calculator-inputs">
                    <div class="input-group">
                        <label for="monthly-revenue">Monthly Revenue</label>
                        <input type="number" id="monthly-revenue" placeholder="100000" value="100000">
                        <span class="input-prefix">$</span>
                    </div>
                    
                    <div class="input-group">
                        <label for="inventory-cost">Monthly Inventory Cost</label>
                        <input type="number" id="inventory-cost" placeholder="30000" value="30000">
                        <span class="input-prefix">$</span>
                    </div>
                    
                    <div class="input-group">
                        <label for="stockout-rate">Current Stockout Rate</label>
                        <input type="number" id="stockout-rate" placeholder="5" value="5">
                        <span class="input-suffix">%</span>
                    </div>
                </div>
                
                <div class="calculator-results">
                    <div class="result-item">
                        <div class="result-label">Monthly Savings</div>
                        <div class="result-value" id="monthly-savings">$4,200</div>
                    </div>
                    
                    <div class="result-item">
                        <div class="result-label">Annual ROI</div>
                        <div class="result-value" id="annual-roi">1,300%</div>
                    </div>
                    
                    <div class="result-item">
                        <div class="result-label">Payback Period</div>
                        <div class="result-value" id="payback-period">3 weeks</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="final-cta">
        <div class="container">
            <div class="cta-content">
                <h2>Ready to Transform Your Inventory Management?</h2>
                <p>Join thousands of retailers using AI to optimize their inventory and boost profits</p>
                <div class="cta-buttons">
                    <a href="https://app.ordernimbus.com/register" class="btn btn-primary btn-large" target="_blank">Start Free Trial</a>
                    <a href="/contact" class="btn btn-secondary btn-large">Talk to Sales</a>
                </div>
                <div class="cta-note">
                    <p>✓ 14-day free trial &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ Setup in 3 days</p>
                </div>
            </div>
        </div>
    </section>
</main>

<script>
// ROI Calculator
document.addEventListener('DOMContentLoaded', function() {
    const monthlyRevenueInput = document.getElementById('monthly-revenue');
    const inventoryCostInput = document.getElementById('inventory-cost');
    const stockoutRateInput = document.getElementById('stockout-rate');
    
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const annualRoiEl = document.getElementById('annual-roi');
    const paybackPeriodEl = document.getElementById('payback-period');
    
    function calculateROI() {
        const monthlyRevenue = parseFloat(monthlyRevenueInput.value) || 0;
        const inventoryCost = parseFloat(inventoryCostInput.value) || 0;
        const stockoutRate = parseFloat(stockoutRateInput.value) || 0;
        
        // Conservative savings calculations
        const stockoutSavings = monthlyRevenue * (stockoutRate / 100) * 0.7; // Reduce 70% of stockouts
        const inventorySavings = inventoryCost * 0.15; // 15% inventory cost reduction
        const efficiencySavings = monthlyRevenue * 0.02; // 2% efficiency gain
        
        const monthlySavings = stockoutSavings + inventorySavings + efficiencySavings;
        const annualSavings = monthlySavings * 12;
        const annualCost = 299 * 12; // Professional plan
        const roi = ((annualSavings - annualCost) / annualCost) * 100;
        const paybackMonths = Math.ceil(annualCost / monthlySavings);
        
        // Update display
        monthlySavingsEl.textContent = '$' + Math.round(monthlySavings).toLocaleString();
        annualRoiEl.textContent = Math.round(roi).toLocaleString() + '%';
        
        if (paybackMonths <= 1) {
            paybackPeriodEl.textContent = '< 1 month';
        } else if (paybackMonths < 12) {
            paybackPeriodEl.textContent = paybackMonths + ' months';
        } else {
            paybackPeriodEl.textContent = Math.round(paybackMonths / 12) + ' years';
        }
    }
    
    // Add event listeners
    monthlyRevenueInput.addEventListener('input', calculateROI);
    inventoryCostInput.addEventListener('input', calculateROI);
    stockoutRateInput.addEventListener('input', calculateROI);
    
    // Initial calculation
    calculateROI();
});

// Animate steps on scroll
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.step-card').forEach(card => {
    observer.observe(card);
});
</script>

<?php get_footer(); ?>