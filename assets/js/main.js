/* ============================================================
   ETHIROLI — main.js
   Separated JS from inline scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ----------------------------------------------------------
       1. PRELOADER
       ---------------------------------------------------------- */
    const preloader = document.getElementById('preloader');

    window.addEventListener('load', () => {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });


    /* ----------------------------------------------------------
       2. NAVBAR — Glassmorphism on Scroll
       ---------------------------------------------------------- */
    const mainNav = document.querySelector('.main-nav');
    let lastScrollY = 0;

    if (mainNav) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }

            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                mainNav.style.transform = 'translateY(-100%)';
            } else {
                mainNav.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    }


    /* ----------------------------------------------------------
       3. HAMBURGER — Mobile Nav Toggle
       ---------------------------------------------------------- */
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('active');
            
            // Update ARIA for accessibility
            const isExpanded = hamburger.classList.contains('open');
            hamburger.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ----------------------------------------------------------
       4. MARQUEE ANIMATION
       ---------------------------------------------------------- */
    const track = document.querySelector(".et-marquee-track");
    const container = document.querySelector(".et-services-marquee");
    
    if (track && container) {
        // Duplicate content for seamless infinite loop
        track.innerHTML += track.innerHTML;
        
        let position = 0;
        let speed = 2; 
        let paused = false;
        
        container.addEventListener("mouseenter", () => paused = true);
        container.addEventListener("mouseleave", () => paused = false);
        
        function animate() {
            if (!paused) {
                position -= speed;
                
                // Reset when half scrolled
                if (Math.abs(position) >= track.scrollWidth / 2) {
                    position = 0;
                }
                
                track.style.transform = `translateX(${position}px)`;
            }
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    /* ----------------------------------------------------------
       5. SERVICES SLIDER
       ---------------------------------------------------------- */
    const servicesSlider = document.querySelector('.et-services-slider');
    const servicesSlides = document.querySelectorAll('.et-services-slide');
    const servicesPrevBtn = document.querySelector('.et-services-nav-prev');
    const servicesNextBtn = document.querySelector('.et-services-nav-next');
    const servicesDots = document.querySelectorAll('.et-services-dot');

    if (servicesSlider && servicesSlides.length) {
        const originalSlides = Array.from(servicesSlides);
        const logicalCount = originalSlides.length;
        const servicesTrack = document.createElement('div');
        servicesTrack.className = 'et-services-track';

        const buildSlideSet = (slides, isClone) => {
            slides.forEach((slide) => {
                const node = isClone ? slide.cloneNode(true) : slide;
                if (isClone) node.setAttribute('aria-hidden', 'true');
                servicesTrack.appendChild(node);
            });
        };

        // Prefix clones + originals + suffix clones for seamless infinite loop.
        buildSlideSet(originalSlides, true);
        buildSlideSet(originalSlides, false);
        buildSlideSet(originalSlides, true);
        servicesSlider.appendChild(servicesTrack);

        let currentPosition = logicalCount; // Start on first real slide (middle set)
        let autoSlideTimer = null;
        const autoSlideDelay = 2000;

        const getVisibleSlides = () => {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        };

        const getLogicalIndex = () => ((currentPosition - logicalCount) % logicalCount + logicalCount) % logicalCount;

        const updateDots = () => {
            const logicalIndex = getLogicalIndex();
            servicesDots.forEach((dot, idx) => {
                const isVisible = idx < logicalCount;
                dot.style.display = isVisible ? 'inline-flex' : 'none';
                if (!isVisible) return;
                dot.setAttribute('data-slide', String(idx));
                const isActive = idx === logicalIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        };

        const getStepDistance = () => {
            const trackSlides = servicesTrack.children;
            if (trackSlides.length < 2) return trackSlides[0].getBoundingClientRect().width;
            const firstRect = trackSlides[0].getBoundingClientRect();
            const secondRect = trackSlides[1].getBoundingClientRect();
            return secondRect.left - firstRect.left;
        };

        const setTrackPosition = (position, smooth = true) => {
            currentPosition = position;
            const stepDistance = getStepDistance();
            servicesTrack.style.transition = smooth
                ? 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
                : 'none';
            servicesTrack.style.transform = `translateX(${-currentPosition * stepDistance}px)`;
            updateDots();
        };

        const moveBy = (delta) => {
            setTrackPosition(currentPosition + delta, true);
        };

        const updateViewportState = () => {
            servicesSlider.style.setProperty('--visible-slides', String(getVisibleSlides()));
            setTrackPosition(currentPosition, false);
        };

        const stopAutoSlide = () => {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        };

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideTimer = setInterval(() => {
                moveBy(1);
            }, autoSlideDelay);
        };

        const resetAutoSlide = () => {
            startAutoSlide();
        };

        servicesPrevBtn?.addEventListener('click', () => {
            moveBy(-1);
            resetAutoSlide();
        });

        servicesNextBtn?.addEventListener('click', () => {
            moveBy(1);
            resetAutoSlide();
        });

        servicesDots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const target = Number(dot.getAttribute('data-slide'));
                if (Number.isNaN(target)) return;
                setTrackPosition(logicalCount + target, true);
                resetAutoSlide();
            });
        });

        const sliderWrapper = document.querySelector('.et-services-slider-wrapper');
        sliderWrapper?.addEventListener('mouseenter', stopAutoSlide);
        sliderWrapper?.addEventListener('mouseleave', startAutoSlide);
        sliderWrapper?.addEventListener('focusin', stopAutoSlide);
        sliderWrapper?.addEventListener('focusout', startAutoSlide);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        });

        servicesTrack.addEventListener('transitionend', () => {
            if (currentPosition >= logicalCount * 2) {
                setTrackPosition(logicalCount, false);
            } else if (currentPosition < logicalCount) {
                setTrackPosition((logicalCount * 2) - 1, false);
            }
        });

        window.addEventListener('resize', () => {
            updateViewportState();
        }, { passive: true });

        updateViewportState();
        setTrackPosition(logicalCount, false);
        startAutoSlide();
    }

    /* ----------------------------------------------------------
       6. SCROLL TO TOP
       ---------------------------------------------------------- */
    const scrollBtn = document.getElementById("scrollToTopBtn");
    
    if (scrollBtn) {
        // Show button after scrolling 150px
        window.addEventListener("scroll", function () {
            if (window.scrollY > 150) {
                scrollBtn.classList.add("show");
            } else {
                scrollBtn.classList.remove("show");
            }
        });
        
        // Smooth scroll to top
        scrollBtn.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /* ----------------------------------------------------------
       7. GLOBAL SCROLL REVEAL
       ---------------------------------------------------------- */
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (revealElements.length) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        revealElements.forEach((element) => {
            const delay = Number(element.getAttribute('data-delay')) || 0;
            element.style.setProperty('--reveal-delay', `${delay}ms`);
        });

        if (prefersReducedMotion) {
            revealElements.forEach((element) => element.classList.add('is-revealed'));
        } else if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -10% 0px'
            });

            revealElements.forEach((element) => observer.observe(element));
        } else {
            revealElements.forEach((element) => element.classList.add('is-revealed'));
        }
    }
    
    /* ----------------------------------------------------------
       8. TESTIMONIAL SLIDER
       ---------------------------------------------------------- */
    // --- FIX START: Removed nested DOMContentLoaded ---
    
    // Check if the slider element exists on this page
    const cardWrapper = document.getElementById('cardWrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (cardWrapper && prevBtn && nextBtn) {
        const testimonials = [
            {
                text: "Fast communication, excellent design quality, and reliable service. They understood our vision and turned it into something amazing.",
                name: "Tina Brown",
                role: "CEO, ethiroli",
                rating: "★★★★★",
                image: "https://picsum.photos/seed/tina/100/100"
            },
            {
                text: "The team at Nexella is incredibly professional. They delivered our digital marketing campaign ahead of schedule with results that exceeded our expectations.",
                name: "David Smith",
                role: "CEO, Nexella",
                rating: "★★★★★",
                image: "https://picsum.photos/seed/david/100/100"
            },
            {
                text: "Creative, responsive, and data-driven. Our conversion rates have doubled since we started working with them. Highly recommended!",
                name: "Sarah Jenkins",
                role: "Director, Solaris",
                rating: "★★★★☆",
                image: "https://picsum.photos/seed/sarah/100/100"
            }
        ];

        // DOM Elements
        const tText = document.getElementById('tText');
        const tName = document.getElementById('tName');
        const tRole = document.getElementById('tRole');
        const tImage = document.getElementById('tImage');
        const tRating = document.getElementById('tRating');
        const progressBar = document.getElementById('progressBar');

        let currentIndex = 0;
        let isAnimating = false;
        let autoPlayInterval;
        let progressInterval;
        const autoPlayDuration = 5000; // 5 seconds

        // Function to update the card content with animation
        function updateTestimonial(index) {
            if (isAnimating) return;
            isAnimating = true;

            const data = testimonials[index];

            // 1. Animate Out (Slide Up and Fade)
            cardWrapper.classList.add('slide-out-up');
            cardWrapper.classList.remove('slide-in-up');

            // 2. Wait for animation to finish, then swap content
            setTimeout(() => {
                tText.textContent = data.text;
                tName.textContent = data.name;
                tRole.textContent = data.role;
                tImage.src = data.image;
                tRating.textContent = data.rating;

                // 3. Animate In (Slide Up from bottom)
                cardWrapper.classList.remove('slide-out-up');
                cardWrapper.classList.add('slide-in-up');

                isAnimating = false;
                resetProgressBar();
            }, 500); // 0.5s matches the CSS transition duration
        }

        // Navigation Functions
        function nextSlide() {
            currentIndex = (currentIndex + 1) % testimonials.length;
            updateTestimonial(currentIndex);
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            updateTestimonial(currentIndex);
        }

        // Event Listeners
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
        // Initialize
        // startAutoPlay();
    }
    // --- FIX END ---

    /* ----------------------------------------------------------
       9. ACTIVITIES COUNT-UP
       ---------------------------------------------------------- */
    const activitiesGrid = document.querySelector('.et-activities-impact-grid');

    if (activitiesGrid) {
        const counters = activitiesGrid.querySelectorAll('[data-target]');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const setFinalValues = () => {
            counters.forEach(counter => {
                const target = Number(counter.getAttribute('data-target')) || 0;
                counter.textContent = String(target);
            });
        };

        const runCountUp = () => {
            counters.forEach(counter => {
                const target = Number(counter.getAttribute('data-target')) || 0;
                const duration = 1200;
                const startTime = performance.now();

                const tick = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                    const value = Math.round(target * eased);
                    counter.textContent = String(value);

                    if (progress < 1) {
                        requestAnimationFrame(tick);
                    }
                };

                requestAnimationFrame(tick);
            });
        };

        if (prefersReducedMotion) {
            setFinalValues();
        } else if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        runCountUp();
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.35 });

            observer.observe(activitiesGrid);
        } else {
            runCountUp();
        }
    }

            // 1. Intersection Observer for Staggered Animation
            const cards = document.querySelectorAll('.et-card');
            
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.15
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Stagger delay: 100ms per card
                        setTimeout(() => {
                            entry.target.classList.add('is-visible');
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            cards.forEach(card => {
                observer.observe(card);
            });
        document.getElementById('year').textContent = new Date().getFullYear();
            
        });

