/* Shira Zimroni Designs — interactions */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Sticky nav style — disabled, nav stays constant
  // const nav = $('#nav');
  // const onScroll = () => { ... };

  // Mobile menu
  const menuBtn = $('#navMenuBtn');
  const drawer = $('#mobileMenu');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.toggle('is-open');
      drawer.setAttribute('aria-hidden', drawer.classList.contains('is-open') ? 'false' : 'true');
    });
    $$('a', drawer).forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }));
  }

  // Scroll-reveal
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  // Footer year
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Inquiry form
  const form = $('#inquiry');
  const success = $('#formSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // simple required-field check
      const required = $$('[required]', form);
      let ok = true;
      required.forEach(field => {
        if (!field.value || (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value))) {
          field.style.borderBottomColor = '#b3563f';
          ok = false;
        } else {
          field.style.borderBottomColor = '';
        }
      });
      if (!ok) return;
      // pretend-submit
      form.querySelectorAll('input,textarea,select,button').forEach(el => el.setAttribute('disabled', ''));
      success.hidden = false;
    });
  }

  // Gallery filters
  const filterBtns = $$('.filter');
  const galleryItems = $$('#galleryGrid .gal');
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach(b => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        galleryItems.forEach(item => {
          const match = cat === 'all' || item.dataset.category === cat;
          item.hidden = !match;
        });
      });
    });
  }
})();
