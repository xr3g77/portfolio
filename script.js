/**
 * Mohammed Alghafli — Portfolio scripts (dependency-free)
 * Nav · Mobile menu · Scroll reveals · KPI counters · Active section · Lightbox
 */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Navbar state + scroll progress (cheap scroll handler) ---- */
  const navbar = document.getElementById('navbar');
  let ticking = false;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const toggle = document.getElementById('menu-toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false); });

  /* ---- Scroll reveal (fail-safe) ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('revealed'));
  } else {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => {
      const sibs = Array.from(el.parentElement.children).filter(c => c.hasAttribute('data-reveal'));
      const i = sibs.indexOf(el);
      if (i > 0 && !reduceMotion) el.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
      obs.observe(el);
    });
    // Safety net: reveal in-view stragglers after load so content can't get stuck hidden
    window.addEventListener('load', () => setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('revealed');
      });
    }, 1200));
  }

  /* ---- KPI counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target; cObs.unobserve(el);
        const target = parseInt(el.dataset.count, 10) || 0;
        if (reduceMotion) { el.textContent = target; return; }
        const dur = 1000, start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cObs.observe(c));
  } else {
    counters.forEach(c => { c.textContent = c.dataset.count; });
  }

  /* ---- Active section in nav ---- */
  const ids = ['about','journey','projects','skills','experience','certs','contact'];
  const map = new Map();
  ids.forEach(id => {
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    const sec = document.getElementById(id);
    if (link && sec) map.set(sec, link);
  });
  if ('IntersectionObserver' in window && map.size) {
    const nObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          map.forEach(l => l.classList.remove('is-current'));
          map.get(entry.target)?.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, sec) => nObs.observe(sec));
  }

  /* ---- Smooth anchor scroll with offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.pageYOffset - 88;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---- Certificate lightbox ---- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  let lastFocus = null;
  const openLb = (src) => {
    lastFocus = document.activeElement;
    lbImg.src = src;
    lb.classList.add('open');
    document.body.classList.add('no-scroll');
    lbClose.focus();
  };
  const closeLb = () => {
    lb.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { lbImg.src = ''; }, 250);
    lastFocus?.focus();
  };
  document.querySelectorAll('[data-cert]').forEach(btn => {
    btn.addEventListener('click', () => openLb(btn.dataset.cert));
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });

  /* ---- Footer year ---- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
