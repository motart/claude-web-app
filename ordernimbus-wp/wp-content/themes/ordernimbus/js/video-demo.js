/**
 * Interactive Video Demo Component
 * Handles video loading, playing, and analytics tracking
 */

class VideoDemo {
    constructor(container) {
        this.container = container;
        this.videoId = 'ordernimbus-demo-video';
        this.videoUrl = null; // Will be set when video is uploaded
        this.isLoaded = false;
        this.analytics = {
            played: false,
            completionPercentage: 0,
            playTime: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.preloadVideoMetadata();
    }
    
    setupEventListeners() {
        const playButton = this.container.querySelector('.play-button');
        const videoPlaceholder = this.container.querySelector('.video-placeholder');
        
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.playVideo();
            });
            
            // Keyboard accessibility
            playButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.playVideo();
                }
            });
        }
        
        if (videoPlaceholder) {
            videoPlaceholder.addEventListener('click', () => {
                this.playVideo();
            });
        }
    }
    
    preloadVideoMetadata() {
        // For now, we'll simulate video metadata
        // In production, this would check if the video file exists
        this.videoUrl = '/wp-content/uploads/ordernimbus-demo.mp4';
        this.isLoaded = true;
    }
    
    async playVideo() {
        const placeholder = this.container.querySelector('.video-placeholder');
        const playerContainer = this.container.querySelector('.video-player');
        
        if (!this.isLoaded) {
            this.showLoadingState();
            return;
        }
        
        try {
            // Hide placeholder and show video player
            placeholder.style.display = 'none';
            playerContainer.style.display = 'block';
            playerContainer.classList.add('active');
            
            // Create video element or iframe depending on video type
            this.createVideoPlayer(playerContainer);
            
            // Track analytics
            this.trackVideoPlay();
            
        } catch (error) {
            console.error('Error loading video:', error);
            this.showErrorState();
        }
    }
    
    createVideoPlayer(container) {
        // Clear existing content
        container.innerHTML = '';
        
        // Check if we have a local video file or need to embed from a service
        if (this.videoUrl && this.videoUrl.includes('.mp4')) {
            // Local video file
            const video = document.createElement('video');
            video.src = this.videoUrl;
            video.controls = true;
            video.autoplay = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.borderRadius = '12px';
            
            // Add event listeners for analytics
            video.addEventListener('play', () => this.trackVideoPlay());
            video.addEventListener('pause', () => this.trackVideoPause());
            video.addEventListener('ended', () => this.trackVideoComplete());
            video.addEventListener('timeupdate', () => this.trackVideoProgress(video));
            
            container.appendChild(video);
        } else {
            // Fallback: Show demo images or placeholder
            this.createDemoCarousel(container);
        }
    }
    
    createDemoCarousel(container) {
        // Create an interactive demo carousel if video is not available
        const carousel = document.createElement('div');
        carousel.className = 'demo-carousel';
        carousel.innerHTML = `
            <div class="demo-slides">
                <div class="demo-slide active">
                    <div class="demo-screenshot">
                        <div class="mock-dashboard">
                            <h3>Dashboard Overview</h3>
                            <div class="mock-chart"></div>
                            <div class="mock-metrics">
                                <div class="metric">$11M+ Revenue</div>
                                <div class="metric">65K+ Orders</div>
                                <div class="metric">94% Accuracy</div>
                            </div>
                        </div>
                    </div>
                    <div class="demo-description">
                        <h4>Real-time Dashboard</h4>
                        <p>Monitor your business performance with live metrics and AI-powered insights.</p>
                    </div>
                </div>
                
                <div class="demo-slide">
                    <div class="demo-screenshot">
                        <div class="mock-forecast">
                            <h3>AI Forecasting</h3>
                            <div class="mock-forecast-chart"></div>
                            <div class="forecast-accuracy">94% Accuracy</div>
                        </div>
                    </div>
                    <div class="demo-description">
                        <h4>ML-Powered Forecasts</h4>
                        <p>Generate accurate forecasts using ensemble machine learning models.</p>
                    </div>
                </div>
                
                <div class="demo-slide">
                    <div class="demo-screenshot">
                        <div class="mock-integration">
                            <h3>Easy Integration</h3>
                            <div class="integration-icons">
                                <div class="integration-icon">Shopify</div>
                                <div class="integration-icon">Amazon</div>
                                <div class="integration-icon">CSV</div>
                            </div>
                        </div>
                    </div>
                    <div class="demo-description">
                        <h4>Seamless Integrations</h4>
                        <p>Connect your existing sales channels in minutes, not months.</p>
                    </div>
                </div>
            </div>
            
            <div class="demo-controls">
                <button class="demo-prev">‹ Previous</button>
                <div class="demo-indicators">
                    <button class="indicator active" data-slide="0"></button>
                    <button class="indicator" data-slide="1"></button>
                    <button class="indicator" data-slide="2"></button>
                </div>
                <button class="demo-next">Next ›</button>
            </div>
            
            <div class="demo-cta">
                <p>Want to see the full platform?</p>
                <button class="btn btn-primary schedule-live-demo">Schedule Live Demo</button>
            </div>
        `;
        
        container.appendChild(carousel);
        this.initCarouselControls(carousel);
        this.trackDemoView();
    }
    
    initCarouselControls(carousel) {
        const slides = carousel.querySelectorAll('.demo-slide');
        const indicators = carousel.querySelectorAll('.indicator');
        const prevBtn = carousel.querySelector('.demo-prev');
        const nextBtn = carousel.querySelector('.demo-next');
        const scheduleBtn = carousel.querySelector('.schedule-live-demo');
        
        let currentSlide = 0;
        
        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
            currentSlide = index;
        };
        
        prevBtn.addEventListener('click', () => {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
            showSlide(currentSlide);
        });
        
        nextBtn.addEventListener('click', () => {
            currentSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
            showSlide(currentSlide);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        scheduleBtn.addEventListener('click', () => {
            this.trackCTAClick('schedule-live-demo');
            // Scroll to contact form
            const contactForm = document.querySelector('#contact-form, .contact-form');
            if (contactForm) {
                contactForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Auto-advance slides
        setInterval(() => {
            currentSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
            showSlide(currentSlide);
        }, 5000);
    }
    
    showLoadingState() {
        const placeholder = this.container.querySelector('.video-placeholder');
        placeholder.classList.add('loading');
        placeholder.innerHTML = `
            <div class="loading-spinner"></div>
            <div style="margin-top: 100px; text-align: center;">
                <p>Loading demo video...</p>
            </div>
        `;
    }
    
    showErrorState() {
        const placeholder = this.container.querySelector('.video-placeholder');
        placeholder.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>Demo Currently Unavailable</h3>
                <p>We're updating our demo video. Please schedule a live demo instead!</p>
                <button class="btn btn-primary" onclick="document.querySelector('#contact-form').scrollIntoView({behavior: 'smooth'})">
                    Schedule Live Demo
                </button>
            </div>
        `;
    }
    
    // Analytics tracking methods
    trackVideoPlay() {
        this.analytics.played = true;
        this.sendAnalytics('video_play', { video_id: this.videoId });
    }
    
    trackVideoPause() {
        this.sendAnalytics('video_pause', { 
            video_id: this.videoId,
            play_time: this.analytics.playTime
        });
    }
    
    trackVideoComplete() {
        this.analytics.completionPercentage = 100;
        this.sendAnalytics('video_complete', { video_id: this.videoId });
    }
    
    trackVideoProgress(video) {
        const progress = (video.currentTime / video.duration) * 100;
        this.analytics.completionPercentage = Math.max(this.analytics.completionPercentage, progress);
        this.analytics.playTime = video.currentTime;
        
        // Track milestone events
        if (progress >= 25 && !this.analytics.quarter) {
            this.analytics.quarter = true;
            this.sendAnalytics('video_25_percent', { video_id: this.videoId });
        }
        if (progress >= 50 && !this.analytics.half) {
            this.analytics.half = true;
            this.sendAnalytics('video_50_percent', { video_id: this.videoId });
        }
        if (progress >= 75 && !this.analytics.threequarter) {
            this.analytics.threequarter = true;
            this.sendAnalytics('video_75_percent', { video_id: this.videoId });
        }
    }
    
    trackDemoView() {
        this.sendAnalytics('demo_carousel_view', { video_id: this.videoId });
    }
    
    trackCTAClick(buttonType) {
        this.sendAnalytics('demo_cta_click', { 
            button_type: buttonType,
            video_id: this.videoId 
        });
    }
    
    sendAnalytics(event, data) {
        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
        
        // Send to custom analytics endpoint if needed
        if (window.orderNimbusAnalytics) {
            window.orderNimbusAnalytics.track(event, data);
        }
        
        console.log('Analytics:', event, data);
    }
}

// Initialize video demo when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const videoContainers = document.querySelectorAll('.video-container');
    
    videoContainers.forEach(container => {
        new VideoDemo(container);
    });
});

// CSS for demo carousel (injected via JavaScript)
const carouselStyles = `
<style>
.demo-carousel {
    background: #1e293b;
    border-radius: 12px;
    overflow: hidden;
    color: white;
}

.demo-slides {
    position: relative;
    height: 400px;
}

.demo-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    display: flex;
    align-items: center;
    padding: 2rem;
}

.demo-slide.active {
    opacity: 1;
}

.demo-screenshot {
    flex: 1;
    margin-right: 2rem;
}

.demo-description {
    flex: 1;
}

.mock-dashboard, .mock-forecast, .mock-integration {
    background: #334155;
    padding: 1.5rem;
    border-radius: 8px;
    height: 200px;
}

.mock-chart, .mock-forecast-chart {
    height: 80px;
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    border-radius: 4px;
    margin: 1rem 0;
}

.mock-metrics {
    display: flex;
    gap: 1rem;
}

.metric {
    background: #475569;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.forecast-accuracy {
    background: #059669;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
}

.integration-icons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.integration-icon {
    background: #475569;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    flex: 1;
}

.demo-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: #0f172a;
}

.demo-prev, .demo-next {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.demo-indicators {
    display: flex;
    gap: 0.5rem;
}

.indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: #64748b;
    cursor: pointer;
}

.indicator.active {
    background: #3b82f6;
}

.demo-cta {
    text-align: center;
    padding: 1.5rem;
    background: #1e293b;
    border-top: 1px solid #334155;
}

.schedule-live-demo {
    background: #059669;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
}

@media (max-width: 768px) {
    .demo-slide {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
    }
    
    .demo-screenshot {
        margin-right: 0;
        margin-bottom: 1rem;
    }
}
</style>
`;

// Inject carousel styles
document.head.insertAdjacentHTML('beforeend', carouselStyles);