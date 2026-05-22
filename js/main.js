/* =====================================================
   SHIRA KOHN ZIMRONI — main.js
   ===================================================== */

// ---- Footer year ----
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Nav: scroll-aware background ----
const nav = document.getElementById('nav');
function updateNav() {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ---- Nav: mobile burger ----
const burger  = document.getElementById('navBurger');
const navMenu = document.getElementById('navMenu');

burger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close mobile nav when any link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  });
});

// ---- Scroll-fade animations ----
const fadeEls = document.querySelectorAll('[data-fade]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  fadeEls.forEach(el => io.observe(el));
} else {
  // Fallback: show everything immediately
  fadeEls.forEach(el => el.classList.add('is-visible'));
}

// ---- Portfolio filter ----
const filterBtns = document.querySelectorAll('.filter-btn');
const pItems     = document.querySelectorAll('.p-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('filter-btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('filter-btn--active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    pItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('is-hidden', !show);
    });
  });
});

// ---- Contact form (Formspree async submit) ----
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const msgOk     = document.getElementById('formSuccess');
const msgErr    = document.getElementById('formError');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      }
    });
    if (!valid) return;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    msgOk.hidden = true;
    msgErr.hidden = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        msgOk.hidden = false;
        msgOk.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error('server');
      }
    } catch {
      msgErr.hidden = false;
      msgErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// ---- Smooth scroll offset for fixed nav ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
