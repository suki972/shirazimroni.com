/* Shira Zimroni Designs — interactions */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Keep --nav-h in sync with the actual rendered nav height so anything
  // pinned below the nav (the hero on home) starts flush with no gap.
  const nav = $('.nav');
  if (nav) {
    const setNavHeight = () => {
      const h = Math.round(nav.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    };
    setNavHeight();
    window.addEventListener('resize', setNavHeight);
    if ('ResizeObserver' in window) {
      new ResizeObserver(setNavHeight).observe(nav);
    }
  }

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

  // Hash-link scrolling: accounts for sticky nav height and masonry reflow
  // (lazy images push sections down after the browser's initial jump)
  const navH = () => nav ? Math.round(nav.getBoundingClientRect().height) : 70;

  function scrollToTarget(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    const getTop = () => target.getBoundingClientRect().top + window.scrollY - navH();
    window.scrollTo({ top: getTop(), behavior: 'smooth' });
    // Re-settle after masonry may have reflowed from lazy images loading
    setTimeout(() => window.scrollTo({ top: getTop(), behavior: 'smooth' }), 450);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const hash = a.getAttribute('href');
    if (!hash || hash === '#') return;
    a.addEventListener('click', e => {
      e.preventDefault();
      if (hash === '#top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      scrollToTarget(hash);
    });
  });

  // On page load with a hash in the URL, re-scroll after images settle
  if (location.hash && location.hash.length > 1) {
    window.addEventListener('load', () => {
      scrollToTarget(location.hash);
      setTimeout(() => scrollToTarget(location.hash), 250);
    });
  }

  // Inquiry form
  const W3F_KEY = '0656a103-74c2-4774-bdc5-b97f849976c5'; // web3forms.com → delivers to shirazimroni@gmail.com
  const form = $('#inquiry');
  const success = $('#formSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
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

      const submitBtn = form.querySelector('[type=submit]');
      const data = new FormData(form);
      form.querySelectorAll('input,textarea,select,button').forEach(el => el.setAttribute('disabled', ''));
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: W3F_KEY,
          subject: 'New project inquiry — shirazimroni.com',
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone') || '(not provided)',
          project_type: data.get('project_type'),
          message: data.get('message'),
          botcheck: ''
        })
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            success.hidden = false;
          } else {
            form.querySelectorAll('input,textarea,select,button').forEach(el => el.removeAttribute('disabled'));
            if (submitBtn) submitBtn.textContent = 'Something went wrong — please try again';
          }
        })
        .catch(() => {
          form.querySelectorAll('input,textarea,select,button').forEach(el => el.removeAttribute('disabled'));
          if (submitBtn) submitBtn.textContent = 'Something went wrong — please try again';
        });
    });
  }

  // Gallery filters
  const filterBtns = $$('.filter');
  const galleryItems = $$('#galleryGrid .gal');
  const grid = $('#galleryGrid');

  // ---- Masonry: absolute shortest-column packing (no gaps, no crop) ----
  function colCountFor(width) {
    if (width <= 560) return 1;
    if (width <= 980) return 2;
    return 3;
  }
  function layoutMasonry() {
    if (!grid) return;
    grid.classList.add('is-masonry');
    const gapStr = getComputedStyle(grid).getPropertyValue('--gal-gap');
    const gap = parseFloat(gapStr) || 16;
    const total = grid.clientWidth;
    const cols = colCountFor(window.innerWidth);
    const colW = (total - gap * (cols - 1)) / cols;
    const colH = new Array(cols).fill(0);

    galleryItems.forEach(item => {
      if (item.hidden) return;
      const w = colW;
      item.style.width = w + 'px';

      // height from the image's natural aspect (stable before/after load)
      const img = item.querySelector('.gal__img');
      let h;
      if (img && img.naturalWidth) {
        h = w * (img.naturalHeight / img.naturalWidth);
      } else {
        h = item.offsetHeight || w; // fallback until loaded
      }

      // shortest column
      let c = 0;
      for (let i = 1; i < cols; i++) if (colH[i] < colH[c] - 0.5) c = i;
      const x = c * (colW + gap);
      const y = colH[c];
      item.style.left = Math.round(x) + 'px';
      item.style.top = Math.round(y) + 'px';
      colH[c] = y + h + gap;
    });

    grid.style.height = (Math.max(...colH, 0) - gap) + 'px';
  }

  let rafPending = false;
  function scheduleLayout() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; layoutMasonry(); });
  }

  if (grid && galleryItems.length) {
    // relayout as each image's dimensions become known
    galleryItems.forEach(item => {
      const img = item.querySelector('.gal__img');
      if (img && !img.complete) {
        img.addEventListener('load', scheduleLayout, { once: true });
        img.addEventListener('error', scheduleLayout, { once: true });
      }
    });
    layoutMasonry();
    // a couple of follow-up passes catch late layout/font shifts
    window.addEventListener('load', scheduleLayout);
    setTimeout(scheduleLayout, 250);
    setTimeout(scheduleLayout, 1000);
    let rT;
    window.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(layoutMasonry, 120);
    });
  }

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
        layoutMasonry();
      });
    });
  }

  // ---- Before / After compare slider ----
  function attachCompareDrag(el, onTap) {
    if (!el) return;
    const update = (clientX) => {
      const r = el.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(1.5, Math.min(98.5, pct));
      el.style.setProperty('--pos', pct + '%');
    };
    let dragging = false, moved = false, startX = 0, pid = null;
    el.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false; startX = e.clientX; pid = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 4) {
        moved = true;
        el.classList.add('is-touched');
        update(e.clientX);
      }
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(pid); } catch (_) {}
      if (!moved && typeof onTap === 'function') onTap(e);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { dragging = false; });
  }

  const compareLb = $('#compareLb');
  const clbBa = $('#clbBa');
  const clbAfter = $('#clbAfter');
  const clbBefore = $('#clbBefore');
  const clbCap = $('#clbCap');
  function openCompare(tile) {
    if (!compareLb) return;
    clbAfter.src = tile.dataset.after || '';
    clbBefore.src = tile.dataset.before || '';
    clbCap.textContent = tile.dataset.caption || '';
    clbBa.style.setProperty('--pos', '33.33%');
    // size the stage to the after image's aspect ratio
    const ar = tile.dataset.aspect || '1400/933';
    const parts = ar.split('/').map(Number);
    if (parts.length === 2 && parts[0] && parts[1]) {
      clbBa.style.aspectRatio = parts[0] + ' / ' + parts[1];
      clbBa.style.width = 'min(92vw, calc(84vh * ' + parts[0] + ' / ' + parts[1] + '))';
    }
    compareLb.classList.add('is-open');
    compareLb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCompare() {
    if (!compareLb) return;
    compareLb.classList.remove('is-open');
    compareLb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $$('#galleryGrid .gal--compare').forEach(tile => {
    attachCompareDrag(tile, () => openCompare(tile));
  });
  if (compareLb && clbBa) {
    attachCompareDrag(clbBa, null);
    const clbClose = $('#clbClose');
    if (clbClose) clbClose.addEventListener('click', closeCompare);
    compareLb.addEventListener('click', (e) => { if (e.target === compareLb) closeCompare(); });
    document.addEventListener('keydown', (e) => {
      if (compareLb.classList.contains('is-open') && e.key === 'Escape') closeCompare();
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
      if (item.classList.contains('gal--compare')) return; // handled by compare overlay
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
