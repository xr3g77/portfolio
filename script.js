/**
 * Mohammed Alghafli — Portfolio Scripts (v2)
 * Aurora parallax · Scroll progress · Reveals · Counters · Nav · Filtering · Magnetic · Modal
 */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Brand icons (github/linkedin were dropped from lucide) — inject inline SVG */
    const BRAND_SVG = {
        github: '<svg class="lucide brand-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.465-2.381 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.221 0 4.609-2.807 5.624-5.479 5.921.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
        linkedin: '<svg class="lucide brand-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>'
    };
    const renderBrandIcons = () => {
        document.querySelectorAll('i[data-lucide="github"], i[data-lucide="linkedin"]').forEach(el => {
            const svg = BRAND_SVG[el.getAttribute('data-lucide')];
            if (svg) el.outerHTML = svg;
        });
    };

    /* Swap brand icons first, then let lucide render the rest (avoids warnings) */
    renderBrandIcons();
    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.6 } });

    /* ---------------------------------------------------------------
       1. Navbar scroll state + scroll progress (single rAF loop)
       --------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const progress = document.getElementById('scroll-progress');
    const docEl = document.documentElement;
    let ticking = false;

    // Cheap scroll handler: navbar state + progress bar only (no layout/paint of blurred layers)
    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 24);
        const docH = docEl.scrollHeight - window.innerHeight;
        if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
        ticking = false;
    };
    const requestScroll = () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } };
    window.addEventListener('scroll', requestScroll, { passive: true });
    onScroll();

    /* Pointer parallax — moves the whole aurora as ONE compositor layer (desktop only) */
    if (!reduceMotion && finePointer) {
        const aurora = document.querySelector('.aurora');
        if (aurora) {
            aurora.style.willChange = 'transform';
            let px = 0, py = 0, pending = false;
            const apply = () => { aurora.style.transform = `translate3d(${px}px, ${py}px, 0)`; pending = false; };
            window.addEventListener('mousemove', (e) => {
                px = (e.clientX / window.innerWidth - 0.5) * 18;
                py = (e.clientY / window.innerHeight - 0.5) * 18;
                if (!pending) { pending = true; requestAnimationFrame(apply); }
            }, { passive: true });
        }
    }

    /* ---------------------------------------------------------------
       2. Mobile menu toggle
       --------------------------------------------------------------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    const setMenu = (open) => {
        navLinks.classList.toggle('active', open);
        mobileToggle.setAttribute('aria-expanded', String(open));
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', open ? 'x' : 'menu');
            if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.6 } });
        }
    };
    mobileToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) setMenu(false);
    });

    /* ---------------------------------------------------------------
       3. Project filtering
       --------------------------------------------------------------- */
    const filterBar = document.getElementById('filter-bar');
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const emptyMsg = document.getElementById('filter-empty');

    if (filterBar) {
        filterBar.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;

            filterBar.querySelectorAll('.filter-chip').forEach(c => {
                const active = c === chip;
                c.classList.toggle('is-active', active);
                c.setAttribute('aria-selected', String(active));
            });

            const filter = chip.dataset.filter;
            let shown = 0;
            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-hidden', !match);
                if (match) shown++;
            });
            if (emptyMsg) emptyMsg.hidden = shown !== 0;
        });
    }

    /* ---------------------------------------------------------------
       4. Scroll reveal (staggered per group)
       --------------------------------------------------------------- */
    const revealEls = document.querySelectorAll('[data-reveal]');
    const revealAll = () => revealEls.forEach(el => el.classList.add('revealed'));

    if (!('IntersectionObserver' in window)) {
        revealAll();
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => {
            const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute('data-reveal'));
            const index = siblings.indexOf(el);
            if (index > 0 && !reduceMotion) el.style.transitionDelay = `${Math.min(index * 80, 420)}ms`;
            revealObserver.observe(el);
        });

        // Safety net: if anything is still hidden well after load (e.g. observer
        // never fired), reveal it so content can never get stuck invisible.
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => {
                    const r = el.getBoundingClientRect();
                    if (r.top < window.innerHeight) el.classList.add('revealed');
                });
            }, 1200);
        });
    }

    /* ---------------------------------------------------------------
       5. Animated counters
       --------------------------------------------------------------- */
    const counters = document.querySelectorAll('.stat-num[data-count]');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            countObserver.unobserve(el);
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            if (reduceMotion) { el.textContent = target + suffix; return; }
            const duration = 1100;
            const start = performance.now();
            const step = (now) => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    counters.forEach(c => countObserver.observe(c));

    /* ---------------------------------------------------------------
       6. Magnetic buttons (fine pointer only)
       --------------------------------------------------------------- */
    if (!reduceMotion && finePointer) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* ---------------------------------------------------------------
       7. Active section highlight in nav
       --------------------------------------------------------------- */
    const sections = ['work', 'about', 'skills', 'experience', 'certs'];
    const navMap = new Map();
    sections.forEach(id => {
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        const sec = document.getElementById(id);
        if (link && sec) navMap.set(sec, link);
    });
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navMap.forEach(l => l.classList.remove('is-current'));
                const link = navMap.get(entry.target);
                if (link) link.classList.add('is-current');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navMap.forEach((_, sec) => navObserver.observe(sec));

    /* ---------------------------------------------------------------
       8. Smooth anchor scroll with nav offset
       --------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 96;
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    });

    /* ---------------------------------------------------------------
       9. Certificate modal
       --------------------------------------------------------------- */
    const modal = document.getElementById('certModal');
    const modalImg = document.getElementById('modalImg');
    let lastFocus = null;

    window.openModal = function (src) {
        lastFocus = document.activeElement;
        modalImg.src = src;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    };
    window.closeModal = function () {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        setTimeout(() => { modalImg.src = ''; }, 280);
        if (lastFocus) lastFocus.focus();
    };
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    /* ---------------------------------------------------------------
       10. Footer year
       --------------------------------------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
