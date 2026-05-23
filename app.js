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

  // Lightbox
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCaption = $('#lbCaption');
  const lbCount = $('#lbCount');
  if (lb && galleryItems.length) {
    let idx = 0;
    const visible = () => galleryItems.filter(it => !it.hidden);
    const show = (list, i) => {
      idx = (i + list.length) % list.length;
      const item = list[idx];
      const img = item.querySelector('.gal__img');
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
      const capEl = item.querySelector('.gal__caption');
      lbCaption.textContent = capEl ? capEl.textContent : '';
      lbCount.textContent = `${idx + 1} / ${list.length}`;
    };
    const open = (i) => {
      const list = visible();
      if (!list.length) return;
      show(list, list.indexOf(galleryItems[i]) >= 0 ? list.indexOf(galleryItems[i]) : 0);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    const step = (n) => {
      const list = visible();
      if (!list.length) return;
      show(list, idx + n);
    };
    galleryItems.forEach((item, i) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        open(i);
      });
    });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => step(-1));
    $('#lbNext').addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    // Touch swipe
    let touchStartX = 0;
    lb.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
  }
})();
