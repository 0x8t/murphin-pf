// DOM Elements
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const featuredGrid = document.querySelector('.featured-grid');
const contactForm = document.getElementById('contact-form');
const skillsSection = document.querySelector('.skills');

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
    initializeScrollEffects();
    initializeNavigation();
    initializeContactForm();
    initializeAnimations();
    initializeFeaturedWorksHover();
});

// Handle header styling on scroll
function initializeScrollEffects() {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Handle mobile navigation
function initializeNavigation() {
    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Replace featured works hover logic with grid/accordion logic
if (featuredGrid) {
    const items = featuredGrid.querySelectorAll('.featured-item');
    let lastActiveIndex = 0; // Variable to store the index of the last active item

    const setIndex = (event) => {
        const closest = event.target.closest('.featured-item');
        if (closest) {
            const index = [...items].indexOf(closest);
            lastActiveIndex = index; // Store the current active index

            // Toggle .is-active class on the grid when an item is hovered/clicked
            featuredGrid.classList.add('is-active');

            items.forEach((item, i) => {
                item.dataset.active = (index === i).toString();
                // Toggle .is-hovered class on the currently hovered/clicked item
                item.classList.toggle('is-hovered', index === i);
                // Remove .is-default-open class on hover/click
                item.classList.remove('is-default-open');
            });

            const cols = new Array(items.length)
                .fill()
                .map((_, i) => {
                    return index === i ? '10fr' : '1fr';
                })
                .join(' ');
            featuredGrid.style.setProperty('grid-template-columns', cols);
        }
    };
    featuredGrid.addEventListener('focus', setIndex, true);
    featuredGrid.addEventListener('click', setIndex);
    featuredGrid.addEventListener('pointermove', setIndex);

    // Add event listener for mouseleave to remove classes and reset grid
    featuredGrid.addEventListener('mouseleave', () => {
        featuredGrid.classList.remove('is-active');
        items.forEach((item, i) => {
            item.classList.remove('is-hovered');
            item.classList.remove('is-default-open'); // Ensure default is removed on mouseleave
            item.dataset.active = 'false';
        });
        // Re-apply is-default-open to the last active item after mouseleave
         items.forEach((item, i) => {
            if (i === lastActiveIndex) { // Use lastActiveIndex here
                item.classList.add('is-default-open');
                 item.dataset.active = 'true';
            } else {
                 item.dataset.active = 'false';
            }
         });
         // Recalculate grid columns based on lastActiveIndex
         const cols = new Array(items.length)
                .fill()
                .map((_, i) => {
                    return i === lastActiveIndex ? '10fr' : '1fr'; // Use lastActiveIndex here
                })
                .join(' ');
         featuredGrid.style.setProperty('grid-template-columns', cols);
    });

    const resync = () => {
        const w = Math.max(
            ...[...items].map((i) => {
                return i.offsetWidth;
            })
        );
        featuredGrid.style.setProperty('--article-width', w);
    };
    window.addEventListener('resize', resync);
    resync();
    // Set initial state
    items.forEach((item, i) => {
        item.dataset.active = i === 0 ? 'true' : 'false';
        if (i === 0) {
            item.classList.add('is-default-open');
        }
    });
    featuredGrid.style.setProperty('grid-template-columns', ['10fr'].concat(new Array(items.length - 1).fill('1fr')).join(' '));
}


// Add animations to elements
function initializeAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    // Create a reusable animation observer
    const createAnimationObserver = (selector, staggerDelay = 0) => {
        const elements = document.querySelectorAll(selector);
        
        // Pre-set elements to be hidden initially
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });
        
        // Observer for animation
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Fade in the element
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all elements with a staggered delay if needed
        elements.forEach((el, index) => {
            setTimeout(() => {
                observer.observe(el);
            }, index * staggerDelay);
        });
    };
    
    // Animate all sections
    createAnimationObserver('section', 0);
    
    // Animate categories with staggered delay
    createAnimationObserver('.category', 100);
    
    // Animate skill items with staggered delay
    createAnimationObserver('.skill .software-item, .software-item', 50);
}

// Infinite horizontal scroll for testimonials with pause on hover and seamless loop (scrollLeft version)
(function() {
    const container = document.querySelector('.testimonials-container');
    if (!container) return;
    let isPaused = false;

    // Clone all testimonial items and append them for seamless looping
    const items = Array.from(container.children);
    const originalCount = items.length;
    items.forEach(item => {
        const clone = item.cloneNode(true);
        container.appendChild(clone);
    });

    // Calculate width of original set (including margin)
    function getOriginalWidth() {
        let width = 0;
        for (let i = 0; i < originalCount; i++) {
            const style = getComputedStyle(items[i]);
            width += items[i].offsetWidth + parseFloat(style.marginLeft || 0) + parseFloat(style.marginRight || 0);
        }
        return width;
    }

    let speed = 0.5; // px per frame

    function animate() {
        if (!isPaused) {
            const originalWidth = getOriginalWidth();
            container.scrollLeft += speed;
            if (container.scrollLeft >= originalWidth) {
                container.scrollLeft = 0;
            }
        }
        requestAnimationFrame(animate);
    }

    // Pause on hover
    container.addEventListener('mouseenter', () => { isPaused = true; });
    container.addEventListener('mouseleave', () => { isPaused = false; });

    animate();
})(); 