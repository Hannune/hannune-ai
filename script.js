// Content-driven rendering system
let contentData = null;

// SVG icons for social/action links
const icons = {
    github: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>'
};

// Fetch and initialize content
async function loadContent() {
    try {
        const response = await fetch('content.json');
        contentData = await response.json();
        renderPage();
    } catch (error) {
        console.error('Content load error:', error);
    }
}

// Main render function
function renderPage() {
    if (!contentData) return;

    renderMeta();
    renderNavigation();
    renderHero();
    renderSections();
    renderFooter();
    setupInteractions();
}

// Render meta tags
function renderMeta() {
    if (contentData.site) {
        if (contentData.site.title) {
            document.title = contentData.site.title;
        }
        if (contentData.site.description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = contentData.site.description;
        }
        if (contentData.site.logo_alt) {
            const logoImg = document.getElementById('logo-img');
            if (logoImg) logoImg.alt = contentData.site.logo_alt;
        }
    }
}

// Render navigation from header.nav
function renderNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu || !contentData.header || !contentData.header.nav) return;

    const nav = contentData.header.nav;

    // Render primary nav items
    if (nav.primary && nav.primary.length > 0) {
        nav.primary.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-link';
            a.textContent = item.label;
            a.dataset.key = item.key;
            li.appendChild(a);
            navMenu.appendChild(li);
        });
    }

    // Render action items (right side)
    if (nav.actions && nav.actions.length > 0) {
        const actionsContainer = document.createElement('li');
        actionsContainer.className = 'nav-actions';

        nav.actions.forEach(action => {
            const a = document.createElement('a');
            a.href = action.href;
            a.className = 'nav-action';
            a.dataset.key = action.key;

            // Apply safe defaults for external links
            a.target = action.target || '_blank';
            if (a.target === '_blank') {
                a.rel = action.rel || 'noopener noreferrer';
            }

            // Create action content
            const actionContent = document.createElement('span');
            actionContent.className = 'action-content';

            // Add icon if specified
            if (action.icon && icons[action.icon]) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'action-icon';
                iconSpan.innerHTML = icons[action.icon];
                actionContent.appendChild(iconSpan);
            }

            // Add label
            const labelSpan = document.createElement('span');
            labelSpan.className = 'action-label';
            labelSpan.textContent = action.label;
            actionContent.appendChild(labelSpan);

            // Add sublabel if present
            if (action.sublabel) {
                const sublabelSpan = document.createElement('span');
                sublabelSpan.className = 'action-sublabel';
                sublabelSpan.textContent = action.sublabel;
                actionContent.appendChild(sublabelSpan);
            }

            a.appendChild(actionContent);
            actionsContainer.appendChild(a);
        });

        navMenu.appendChild(actionsContainer);
    }
}

// Render hero section
function renderHero() {
    if (!contentData.hero) return;

    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');

    if (heroTitle && contentData.hero.title) {
        heroTitle.textContent = contentData.hero.title;
    }
    if (heroSubtitle && contentData.hero.subtitle) {
        heroSubtitle.textContent = contentData.hero.subtitle;
    }
}

// Render all sections dynamically
function renderSections() {
    const container = document.getElementById('sections-container');
    if (!container || !contentData.sections) return;

    // Get section order from header.nav.primary
    const sectionOrder = contentData.header?.nav?.primary?.map(item => item.key) || Object.keys(contentData.sections);

    sectionOrder.forEach(sectionKey => {
        const sectionData = contentData.sections[sectionKey];
        if (sectionData) {
            const section = createSection(sectionKey, sectionData);
            container.appendChild(section);
        }
    });
}

// Create a section element
function createSection(id, data) {
    const section = document.createElement('section');
    section.id = id;
    section.className = `section section-${id}`;

    // Add background shapes
    const bg = document.createElement('div');
    bg.className = 'section-background';
    bg.innerHTML = `
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
    `;
    section.appendChild(bg);

    const containerDiv = document.createElement('div');
    containerDiv.className = 'container';

    // Section title
    if (data.title) {
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = data.title;
        containerDiv.appendChild(title);
    }

    // Section content based on type
    if (data.content) {
        const contentDiv = renderSectionContent(id, data.content);
        containerDiv.appendChild(contentDiv);
    }

    section.appendChild(containerDiv);
    return section;
}

// Render section content based on section type
function renderSectionContent(id, content) {
    const div = document.createElement('div');
    div.className = 'section-content';

    switch (id) {
        case 'approach':
            renderApproachContent(div, content);
            break;
        case 'fit':
            renderFitContent(div, content);
            break;
        case 'contact':
            renderContactContent(div, content);
            break;
        default:
            renderGenericContent(div, content);
    }

    return div;
}

// Approach section (with subsections)
function renderApproachContent(container, content) {
    const wrapper = document.createElement('div');
    wrapper.className = 'approach-content';

    // Main intro
    if (content.intro) {
        const intro = document.createElement('p');
        intro.className = 'section-intro';
        intro.textContent = content.intro;
        wrapper.appendChild(intro);
    }

    // Render subsections
    if (content.subsections && content.subsections.length > 0) {
        content.subsections.forEach(subsection => {
            const subsectionDiv = document.createElement('div');
            subsectionDiv.className = `subsection subsection-${subsection.key}`;

            // Subsection title
            if (subsection.title) {
                const title = document.createElement('h3');
                title.className = 'subsection-title';
                title.textContent = subsection.title;
                subsectionDiv.appendChild(title);
            }

            // Subsection intro
            if (subsection.intro) {
                const intro = document.createElement('p');
                intro.className = 'subsection-intro';
                intro.textContent = subsection.intro;
                subsectionDiv.appendChild(intro);
            }

            // Points list (identity subsection)
            if (subsection.points && subsection.points.length > 0) {
                const list = document.createElement('ul');
                list.className = 'highlights-list';
                subsection.points.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = point;
                    list.appendChild(li);
                });
                subsectionDiv.appendChild(list);
            }

            // Structure block (identity subsection)
            if (subsection.structure) {
                const structure = document.createElement('div');
                structure.className = 'structure-block';
                if (subsection.structure.heading) {
                    const heading = document.createElement('h4');
                    heading.textContent = subsection.structure.heading;
                    structure.appendChild(heading);
                }
                if (subsection.structure.description) {
                    const desc = document.createElement('p');
                    desc.textContent = subsection.structure.description;
                    structure.appendChild(desc);
                }
                subsectionDiv.appendChild(structure);
            }

            // Patterns grid (how-it-works subsection)
            if (subsection.patterns && subsection.patterns.length > 0) {
                const grid = document.createElement('div');
                grid.className = 'patterns-grid';
                subsection.patterns.forEach(pattern => {
                    const card = createPatternCard(pattern);
                    grid.appendChild(card);
                });
                subsectionDiv.appendChild(grid);
            }

            // Cases grid (decisions subsection)
            if (subsection.cases && subsection.cases.length > 0) {
                const grid = document.createElement('div');
                grid.className = 'decisions-grid';
                subsection.cases.forEach(caseItem => {
                    const card = document.createElement('div');
                    card.className = 'decision-card';

                    if (caseItem.title) {
                        const title = document.createElement('h4');
                        title.className = 'decision-title';
                        title.textContent = caseItem.title;
                        card.appendChild(title);
                    }

                    if (caseItem.description) {
                        const desc = document.createElement('p');
                        desc.className = 'decision-description';
                        desc.textContent = caseItem.description;
                        card.appendChild(desc);
                    }

                    grid.appendChild(card);
                });
                subsectionDiv.appendChild(grid);
            }

            wrapper.appendChild(subsectionDiv);
        });
    }

    container.appendChild(wrapper);
}

// Create a pattern card
function createPatternCard(data) {
    const card = document.createElement('div');
    card.className = 'pattern-card';

    if (data.title) {
        const title = document.createElement('h4');
        title.className = 'pattern-title';
        title.textContent = data.title;
        card.appendChild(title);
    }

    if (data.items && data.items.length > 0) {
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'pattern-items';
        data.items.forEach(item => {
            const tag = document.createElement('span');
            tag.className = 'pattern-tag';
            tag.textContent = item;
            itemsDiv.appendChild(tag);
        });
        card.appendChild(itemsDiv);
    }

    return card;
}

// Fit section
function renderFitContent(container, content) {
    const wrapper = document.createElement('div');
    wrapper.className = 'fit-content';

    if (content.intro) {
        const intro = document.createElement('p');
        intro.className = 'section-intro';
        intro.textContent = content.intro;
        wrapper.appendChild(intro);
    }

    const grid = document.createElement('div');
    grid.className = 'boundaries-grid';

    if (content.fit) {
        const fitCard = document.createElement('div');
        fitCard.className = 'boundary-card boundary-fit';
        if (content.fit.heading) {
            const heading = document.createElement('h3');
            heading.className = 'boundary-heading';
            heading.textContent = content.fit.heading;
            fitCard.appendChild(heading);
        }
        if (content.fit.description) {
            const desc = document.createElement('p');
            desc.className = 'boundary-description';
            desc.textContent = content.fit.description;
            fitCard.appendChild(desc);
        }
        grid.appendChild(fitCard);
    }

    if (content.nonfit) {
        const nonfitCard = document.createElement('div');
        nonfitCard.className = 'boundary-card boundary-nonfit';
        if (content.nonfit.heading) {
            const heading = document.createElement('h3');
            heading.className = 'boundary-heading';
            heading.textContent = content.nonfit.heading;
            nonfitCard.appendChild(heading);
        }
        if (content.nonfit.description) {
            const desc = document.createElement('p');
            desc.className = 'boundary-description';
            desc.textContent = content.nonfit.description;
            nonfitCard.appendChild(desc);
        }
        grid.appendChild(nonfitCard);
    }

    wrapper.appendChild(grid);
    container.appendChild(wrapper);
}

// Contact section
function renderContactContent(container, content) {
    const wrapper = document.createElement('div');
    wrapper.className = 'contact-content';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'contact-info';

    if (content.intro) {
        const intro = document.createElement('p');
        intro.className = 'contact-intro';
        intro.textContent = content.intro;
        infoDiv.appendChild(intro);
    }

    // Social links from header actions
    if (contentData.header?.nav?.actions) {
        const socialDiv = document.createElement('div');
        socialDiv.className = 'social-links';
        contentData.header.nav.actions.forEach(action => {
            if (action.href) {
                const link = document.createElement('a');
                link.className = 'social-link';
                link.href = action.href;
                link.target = action.target || '_blank';
                if (link.target === '_blank') {
                    link.rel = action.rel || 'noopener noreferrer';
                }
                link.innerHTML = icons[action.icon] || action.label.substring(0, 2).toUpperCase();
                if (action.sublabel) link.title = action.sublabel;
                socialDiv.appendChild(link);
            }
        });
        infoDiv.appendChild(socialDiv);
    }

    wrapper.appendChild(infoDiv);

    // Contact form
    const form = createContactForm(content.formspree_id);
    wrapper.appendChild(form);

    container.appendChild(wrapper);
}

// Create contact form
function createContactForm(formspreeId) {
    const form = document.createElement('form');
    form.className = 'contact-form';
    form.id = 'contact-form';

    const formContent = contentData.form || {};

    // Name field
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'name';
    nameInput.required = true;
    if (formContent.name_placeholder) nameInput.placeholder = formContent.name_placeholder;
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    // Email field
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.required = true;
    if (formContent.email_placeholder) emailInput.placeholder = formContent.email_placeholder;
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    // Message field
    const messageGroup = document.createElement('div');
    messageGroup.className = 'form-group';
    const messageInput = document.createElement('textarea');
    messageInput.name = 'message';
    messageInput.rows = 5;
    messageInput.required = true;
    if (formContent.message_placeholder) messageInput.placeholder = formContent.message_placeholder;
    messageGroup.appendChild(messageInput);
    form.appendChild(messageGroup);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    if (formContent.submit_button) submitBtn.textContent = formContent.submit_button;
    form.appendChild(submitBtn);

    // Status message
    const statusDiv = document.createElement('div');
    statusDiv.className = 'form-status';
    form.appendChild(statusDiv);

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        handleFormSubmit(form, formspreeId, statusDiv);
    });

    return form;
}

// Handle form submission
async function handleFormSubmit(form, formspreeId, statusDiv) {
    const formContent = contentData.form || {};

    if (!formspreeId) {
        statusDiv.className = 'form-status error';
        statusDiv.textContent = formContent.config_error || '';
        statusDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            statusDiv.className = 'form-status success';
            statusDiv.textContent = formContent.success_message || '';
            form.reset();
        } else {
            statusDiv.className = 'form-status error';
            statusDiv.textContent = formContent.error_message || '';
        }
    } catch (error) {
        statusDiv.className = 'form-status error';
        statusDiv.textContent = formContent.network_error || '';
    }

    statusDiv.style.display = 'block';
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Generic content renderer
function renderGenericContent(container, content) {
    if (content.intro) {
        const intro = document.createElement('p');
        intro.className = 'section-intro';
        intro.textContent = content.intro;
        container.appendChild(intro);
    }
}

// Render footer
function renderFooter() {
    const yearSpan = document.getElementById('footer-year');
    const textSpan = document.getElementById('footer-text');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    if (textSpan && contentData.footer && contentData.footer.text) {
        textSpan.textContent = contentData.footer.text;
    }
}

// Setup all interactions
function setupInteractions() {
    setupMobileMenu();
    setupCustomCursor();
    setupNavbarScroll();
    setupParallax();
}

// Mobile menu toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('.nav-link, .nav-action').forEach(link => {
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

    if (!cursorDot || !cursorOutline) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
        document.body.classList.add('cursor-active');
    });

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
    const setupMagnetic = () => {
        const elements = document.querySelectorAll('.btn, .nav-link, .nav-action, .social-link, .pattern-card, .decision-card, .boundary-card');
        elements.forEach(elem => {
            elem.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
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
                elem.style.transform = `translate(${deltaX * maxMove}px, ${deltaY * maxMove}px)`;
            });
        });
    };

    setTimeout(setupMagnetic, 100);

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    document.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
}

// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        navbar.style.boxShadow = currentScroll <= 0
            ? '0 2px 10px rgba(0, 0, 0, 0.1)'
            : '0 2px 20px rgba(0, 0, 0, 0.2)';
    });
}

// Parallax effect
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

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', loadContent);
