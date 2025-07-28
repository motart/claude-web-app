/**
 * OrderNimbus Theme Main JavaScript
 */

jQuery(document).ready(function($) {
    
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 100
            }, 1000);
        }
    });
    
    // Mobile menu toggle
    $('.mobile-menu-toggle').on('click', function() {
        $('.nav-menu').toggleClass('mobile-active');
        $(this).toggleClass('active');
    });
    
    // Contact form handling
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        var submitBtn = $(this).find('button[type="submit"]');
        var originalText = submitBtn.text();
        
        submitBtn.text('Sending...').prop('disabled', true);
        
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: formData,
            success: function(response) {
                $('.form-success, .form-error').remove();
                $('#contact-form').after('<div class="form-success">Thank you for your message! We\'ll be in touch soon.</div>');
                $('#contact-form')[0].reset();
            },
            error: function() {
                $('.form-success, .form-error').remove();
                $('#contact-form').after('<div class="form-error">Sorry, there was an error sending your message. Please try again.</div>');
            },
            complete: function() {
                submitBtn.text(originalText).prop('disabled', false);
            }
        });
    });
    
    // Scroll animations
    function animateOnScroll() {
        $('.animate-on-scroll').each(function() {
            var elementTop = $(this).offset().top;
            var elementBottom = elementTop + $(this).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            
            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('animated');
            }
        });
    }
    
    $(window).on('scroll', function() {
        animateOnScroll();
    });
    
    // Initial animation check
    animateOnScroll();
    
    // Stats counter animation
    function animateStats() {
        $('.stat-number').each(function() {
            var $this = $(this);
            var target = parseInt($this.data('target') || $this.text().replace(/[^\d]/g, ''));
            var current = 0;
            var increment = target / 100;
            var suffix = $this.text().replace(/[\d]/g, '');
            
            var timer = setInterval(function() {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                $this.text(Math.floor(current) + suffix);
            }, 20);
        });
    }
    
    // Trigger stats animation when section is visible
    $(window).on('scroll', function() {
        $('.stats-section').each(function() {
            if ($(this).hasClass('animated') && !$(this).hasClass('stats-counted')) {
                $(this).addClass('stats-counted');
                animateStats();
            }
        });
    });
    
});