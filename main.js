/* ===== Shri Pauhari Baba Temple – shared script (navbar, animations, smooth scrolling) ===== */
(() => {
  'use strict';
  const NAV = [['Home', 'index.html'], ['About', 'about.html'], ['Contribute', 'contribute.html'], ['Gallery', 'gallery.html'], ['Contact', 'contact.html']];
  const ALIAS = { 'volunteer.html': 'contribute.html', '': 'index.html' };
  let page = decodeURIComponent(location.pathname.split('/').pop());
  page = ALIAS[page] || page;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = id => document.getElementById(id);

  /* ---------- Navbar links (current page highlighted) ---------- */
  const here = n => n[1] === page;
  const dl = $('links'), ml = $('mlinks');
  if (dl) dl.innerHTML = NAV.map(n => `<li><a href="${n[1]}" ${here(n) ? 'aria-current="page"' : ''} class="rounded-full px-4 py-2 transition hover:bg-white/10 ${here(n) ? 'bg-white/15' : 'opacity-80'}">${n[0]}</a></li>`).join('');
  if (ml) ml.innerHTML = NAV.map(n => `<li class="border-t border-white/10"><a href="${n[1]}" ${here(n) ? 'aria-current="page"' : ''} class="block py-4 font-display text-xl font-semibold ${here(n) ? 'text-sun' : ''}">${n[0]}</a></li>`).join('');

  /* ---------- Burger <-> X menu ---------- */
  const btn = $('menuBtn'), menu = $('menu');
  const wrap = btn && btn.closest('.fixed');
  const pill = btn && btn.closest('[class*="rounded-[28px]"]');
  if (pill) pill.classList.add('nav-pill');
  if (wrap) wrap.classList.add('nav-in');
  const setMenu = open => {
    if (!btn || !menu) return;
    menu.classList.toggle('hidden', !open);
    if (open) { menu.classList.remove('menu-in'); void menu.offsetWidth; menu.classList.add('menu-in'); }
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (btn && menu) {
    btn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', e => { if (!menu.classList.contains('hidden') && wrap && !wrap.contains(e.target)) setMenu(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth >= 1024) setMenu(false); });
  }

  /* ---------- Scroll progress bar + navbar shadow ---------- */
  const bar = document.createElement('div'); bar.id = 'sp'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
      if (pill) pill.classList.toggle('scrolled', scrollY > 24);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Footer year ---------- */
  document.querySelectorAll('#yr').forEach(e => { e.textContent = new Date().getFullYear(); });

  /* ---------- Smooth page-to-page fade ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const raw = a.getAttribute('href');
    if (/^(mailto|tel|javascript):/i.test(raw)) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return; /* same page: native smooth anchor scroll */
    if (reduce) return;
    e.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(() => { location.href = u.href; }, 240);
    setTimeout(() => document.documentElement.classList.remove('leaving'), 3000);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('leaving'); });

  /* ---------- Reveal on scroll ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const SEL = 'h1,h2,h3,h4,p,ul,ol,dl,figure,form,table,details,blockquote,iframe,a.group,article,.reveal,div.rounded-3xl,div.rounded-2xl,section img';
    const SKIP = '.rise,.rv,#slides,#navwrap,[role=dialog],[role=tablist],#lb,#videoModal,[data-no-reveal],.fixed';
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    const seen = new Map();
    document.querySelectorAll(SEL).forEach(el => {
      if (el.closest(SKIP) || el.closest('header')) return;
      if (el.parentElement && el.parentElement.closest('[data-rv]')) return;
      el.dataset.rv = '1';
      const n = seen.get(el.parentElement) || 0; seen.set(el.parentElement, n + 1);
      el.style.setProperty('--d', Math.min(n, 5) * 80 + 'ms');
      el.classList.add('rv'); io.observe(el);
    });
  }
})();