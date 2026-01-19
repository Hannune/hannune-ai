// Load content from JSON
let contentData = null;

// Fetch and parse content.json
async function loadContent() {
    try {
        const response = await fetch('content.json');
        contentData = await response.json();
        populateContent();
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Populate page with content
function populateContent() {
    if (!contentData) return;

    // Update meta tags
    document.title = contentData.site.title;
    document.querySelector('meta[name="description"]').content = contentData.site.description;

    // Hero section
    const hero = contentData.hero.en;
    document.querySelector('.hero-title').textContent = hero.title;
    document.querySelector('.hero-subtitle').textContent = hero.subtitle;

    // About section
    const about = contentData.about.en;
    document.querySelector('.about-intro').textContent = about.intro;

    const highlightsList = document.querySelector('.highlights-list');
    about.highlights.forEach(highlight => {
        const li = document.createElement('li');
        li.textContent = highlight;
        highlightsList.appendChild(li);
    });

    document.querySelector('.education-degree').textContent = about.education.degree;
    document.querySelector('.education-field').textContent = about.education.field;

    // Skills section
    const skillsGrid = document.getElementById('skills-grid');
    Object.values(contentData.skills).forEach(skill => {
        const card = document.createElement('div');
        card.className = 'skill-card';

        // Add image if available
        if (skill.image) {
            const img = document.createElement('img');
            img.className = 'skill-image';
            img.src = skill.image;
            img.alt = skill.title;
            card.appendChild(img);
        }

        const content = document.createElement('div');
        content.className = 'skill-content';

        const title = document.createElement('h3');
        title.className = 'skill-title';
        title.textContent = skill.title;

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'skill-items';

        skill.items.forEach(item => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = item;
            itemsContainer.appendChild(tag);
        });

        content.appendChild(title);
        content.appendChild(itemsContainer);
        card.appendChild(content);
        skillsGrid.appendChild(card);
    });

    // Projects section
    const projectsGrid = document.getElementById('projects-grid');
    contentData.projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';

        const img = document.createElement('img');
        img.className = 'project-image';
        img.src = project.image;
        img.alt = project.title.en;

        const content = document.createElement('div');
        content.className = 'project-content';

        const title = document.createElement('h3');
        title.className = 'project-title';
        title.textContent = project.title.en;

        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = project.description.en;

        const tech = document.createElement('p');
        tech.className = 'project-tech';
        tech.textContent = `Tech: ${project.tech}`;

        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(tech);

        if (project.url) {
            const link = document.createElement('a');
            link.className = 'project-link';
            link.href = project.url;
            link.target = '_blank';
            link.textContent = 'View Project →';
            content.appendChild(link);
        }

        card.appendChild(img);
        card.appendChild(content);
        projectsGrid.appendChild(card);
    });

    // Services section
    const servicesGrid = document.getElementById('services-grid');
    contentData.services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';

        const title = document.createElement('h3');
        title.className = 'service-title';
        title.textContent = service.title.en;

        const description = document.createElement('p');
        description.className = 'service-description';
        description.textContent = service.description.en;

        card.appendChild(title);
        card.appendChild(description);

        if (service.tech) {
            const tech = document.createElement('p');
            tech.className = 'service-tech';
            tech.textContent = `Tech: ${service.tech}`;
            card.appendChild(tech);
        }

        if (service.url) {
            const link = document.createElement('a');
            link.className = 'service-link';
            link.href = service.url;
            link.target = '_blank';
            link.textContent = 'Learn More →';
            card.appendChild(link);
        }

        servicesGrid.appendChild(card);
    });

    // Social links with SVG icons
    const socialLinks = document.getElementById('social-links');
    const socialIcons = {
        github: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
        twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        velog: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 0C1.338 0 0 1.338 0 3v18c0 1.662 1.338 3 3 3h18c1.662 0 3-1.338 3-3V3c0-1.662-1.338-3-3-3H3zm6.883 6.25l3.062 9.875h.113l2.975-9.875h2.392L14.514 18h-3.028L7.375 6.25h2.508z"/></svg>',
        devto: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z"/></svg>'
    };

    Object.entries(contentData.social).forEach(([platform, url]) => {
        if (url) {
            const link = document.createElement('a');
            link.className = 'social-link';
            link.href = url;
            link.target = '_blank';
            link.innerHTML = socialIcons[platform] || platform.substring(0, 2).toUpperCase();
            link.title = platform.charAt(0).toUpperCase() + platform.slice(1);
            socialLinks.appendChild(link);
        }
    });

    // Contact intro
    if (contentData.contact.intro) {
        document.querySelector('.contact-intro').textContent = contentData.contact.intro;
    }

    // Footer
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('footer-name').textContent = 'Taeho Kim';

    // Setup contact form
    setupContactForm();
}

// Contact form setup
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const formspreeId = contentData.contact.formspree_id;

    if (formspreeId && formspreeId !== 'YOUR_FORM_ID') {
        form.action = `https://formspree.io/f/${formspreeId}`;
        form.method = 'POST';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formStatus = document.querySelector('.form-status');
        const formData = new FormData(form);

        if (!formspreeId || formspreeId === 'YOUR_FORM_ID') {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please configure Formspree ID in content.json';
            return;
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Message sent successfully!';
                form.reset();
            } else {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Failed to send message. Please try again.';
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Network error. Please try again.';
        }

        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Custom cursor
function setupCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

        // Show cursors on first movement
        document.body.classList.add('cursor-active');
    });

    // Smooth follow for outline
    function animateOutline() {
        const dx = mouseX - outlineX;
        const dy = mouseY - outlineY;

        outlineX += dx * 0.15;
        outlineY += dy * 0.15;

        cursorOutline.style.transform = `translate(${outlineX - 20}px, ${outlineY - 20}px)`;

        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Magnetic effect for interactive elements
    const magneticElements = document.querySelectorAll('.btn, .nav-link, .social-link, .project-card, .service-card, .skill-card');

    magneticElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });

        elem.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
            elem.style.transform = '';
        });

        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            const maxMove = 10;
            const moveX = deltaX * maxMove;
            const moveY = deltaY * maxMove;

            elem.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
    });

    document.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-active');
    });
}


// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
        }

        lastScroll = currentScroll;
    });
}

// Parallax effect for hero background shapes
function setupParallax() {
    const shapes = document.querySelectorAll('.floating-shape');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    setupMobileMenu();
    setupCustomCursor();
    setupNavbarScroll();
    setupParallax();

});
