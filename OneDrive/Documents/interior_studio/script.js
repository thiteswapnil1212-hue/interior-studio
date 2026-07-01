
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        let target = null;
        try {
            target = document.querySelector(href);
        } catch {
            return;
        }
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting && !entry.target.classList.contains('animate')) {
            
            if (prefersReducedMotion) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'none';
                return;
            }

            
            const element = entry.target;
            let animationClass = 'fade-in-up';

            
            if (element.classList.contains('hero')) {
                animationClass = 'scale-in';
            } else if (element.classList.contains('about-content')) {
                animationClass = 'fade-in-left';
            } else if (element.classList.contains('gallery')) {
                animationClass = 'fade-in-right';
            } else if (element.classList.contains('contact-info')) {
                animationClass = 'fade-in-left';
            } else if (element.classList.contains('contact-form')) {
                animationClass = 'fade-in-right';
            } else if (element.classList.contains('service-card') || element.classList.contains('product-card') || element.classList.contains('gallery-item') || element.classList.contains('feature-card')) {
                
                const siblings = Array.from(element.parentElement.children);
                const itemIndex = siblings.indexOf(element);
                animationClass = 'slide-in-up';
                element.style.animationDelay = `${Math.min(itemIndex * 0.1, 0.5)}s`; // Cap delay at 0.5s
            }

            // Add a small delay for better visual effect
            setTimeout(() => {
                element.classList.add(animationClass);
                element.classList.add('animate');
            }, 100);
        }
    });
}, observerOptions);

// Observe all major sections and elements
document.querySelectorAll('section:not(.hero), .service-card, .product-card, .gallery-item, .feature-card, .contact-info, .contact-form, .about-content').forEach(element => {
    observer.observe(element);
});

// Testimonials Slider
class TestimonialsSlider {
    constructor() {
        this.slider = document.querySelector('.testimonials-slider');
        if (!this.slider) return;

        this.slides = this.slider.querySelectorAll('.testimonial-card');
        this.dots = this.slider.querySelectorAll('.dot');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds

        this.init();
    }

    init() {
        // Show first slide
        this.showSlide(0);

        // Add click events to dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Start autoplay
        this.startAutoPlay();

        // Pause autoplay on hover
        this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current slide and activate dot
        this.slides[index].classList.add('active');
        this.dots[index].classList.add('active');
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.showSlide(this.currentSlide);
        this.resetAutoPlay();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(this.currentSlide);
    }

    startAutoPlay() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// Initialize testimonials slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsSlider();
});

// Enquiry/contact forms
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-enquiry-form]');
    if (!forms.length) return;

    forms.forEach((form) => {
        const successEl = form.querySelector('.form-success');
        let hideTimer = null;

        const hideSuccess = () => {
            if (!successEl) return;
            successEl.hidden = true;
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
        };

        form.addEventListener('input', hideSuccess);

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            form.reset();

            if (successEl) {
                successEl.hidden = false;
                hideTimer = setTimeout(() => {
                    successEl.hidden = true;
                }, 6000);
            }
        });
    });
});

// Add loading animation for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });

        // For images that are already loaded
        if (img.complete) {
            img.classList.add('loaded');
        }
    });
});

// Three.js hero background
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    const heroCanvasHost = document.getElementById('hero-3d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hero || !heroCanvasHost || typeof THREE === 'undefined' || reduceMotion) {
        return;
    }

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    const camera = new THREE.PerspectiveCamera(55, hero.clientWidth / hero.clientHeight, 0.1, 50);
    camera.position.z = 8;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(hero.clientWidth, hero.clientHeight);
    renderer.setClearColor(0x000000, 0.2);
    heroCanvasHost.appendChild(renderer.domElement);

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x8a6f1d,
        emissiveIntensity: 0.15
    });

    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.4, 0.35, 220, 30), goldMat);
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.15,
        wireframe: true,
        opacity: 0.35,
        transparent: true
    }));
    orb.position.set(0, 0, -0.6);
    scene.add(knot);
    scene.add(orb);

    const ambient = new THREE.AmbientLight(0xd4af37, 0.55);
    const keyLight = new THREE.PointLight(0xf5d68f, 1.15, 25);
    keyLight.position.set(4, 3, 6);
    const rimLight = new THREE.PointLight(0xb8860b, 0.8, 25);
    rimLight.position.set(-4, -2, -4);
    scene.add(ambient, keyLight, rimLight);

    let frameId;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        knot.rotation.x += 0.002;
        knot.rotation.y += 0.003;
        orb.rotation.x -= 0.0015;
        orb.rotation.y += 0.0025;
        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up if needed (single-page usage so minimal)
});

// 3D tilt hover for service cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card');
    if (!cards.length) return;

    const maxTilt = 6; // degrees
    cards.forEach(card => {
        let rafId = null;
        let current = { x: 0, y: 0 };

        const updateTransform = () => {
            card.style.transform = `translateY(-10px) rotateX(${current.y}deg) rotateY(${current.x}deg)`;
            rafId = null;
        };

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const relY = (e.clientY - rect.top) / rect.height;
            current.x = (relX - 0.5) * maxTilt * 2;
            current.y = -(relY - 0.5) * maxTilt * 2;
            if (!rafId) rafId = requestAnimationFrame(updateTransform);
        });

        card.addEventListener('mouseleave', () => {
            current = { x: 0, y: 0 };
            if (!rafId) rafId = requestAnimationFrame(updateTransform);
        });
    });
});
// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.backgroundPosition = `center ${rate}px`;
    }
});

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in-up');
    }

    // Add animation delays to service and product cards
    const serviceCards = document.querySelectorAll('.service-card');
    const productCards = document.querySelectorAll('.product-card');

    serviceCards.forEach((card, index) => {
        card.classList.add(`animate-delay-${(index % 6) + 1}`);
    });

    productCards.forEach((card, index) => {
        card.classList.add(`animate-delay-${(index % 6) + 1}`);
    });
});

// Lazy loading for images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));
