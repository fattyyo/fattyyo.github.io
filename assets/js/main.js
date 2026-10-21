/* =====================================================================
   main.js — 主題切換、選單、進場、閱讀進度、目錄高亮
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 深淺色 ---------- */
  const isDark = () => root.dataset.theme === 'dark' ||
    (root.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('.theme-toggle')?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (_) {}
  });

  /* ---------- 選單：同時只開一個下拉，點外面或按 Esc 關掉 ---------- */
  const subs = $$('.nav-sub');
  subs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) subs.forEach((o) => { if (o !== d) o.open = false; });
  }));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-sub')) subs.forEach((d) => { d.open = false; });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = subs.find((d) => d.open);
    if (open) { open.open = false; $('summary', open).focus(); }
    const drawer = $('.nav-drawer');
    if (drawer?.open) { drawer.open = false; $('summary', drawer).focus(); }
  });
  /* 手機選單打開時鎖住背景捲動；桌機寬度時 drawer 永遠展開 */
  const drawer = $('.nav-drawer');
  const mq = matchMedia('(max-width: 860px)');
  const syncDrawer = () => { if (drawer) drawer.open = !mq.matches; };
  syncDrawer();
  mq.addEventListener('change', syncDrawer);
  drawer?.addEventListener('toggle', () => {
    document.body.style.overflow = drawer.open && mq.matches ? 'hidden' : '';
  });

  /* ---------- 進場 ---------- */
  root.classList.add('js');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal, .stamps').forEach((n) => io.observe(n));
    /* 印章一個一個蓋下去 */
    $$('.stamps .stamp').forEach((s, i) => s.style.setProperty('--sd', `${i * 45}ms`));
  } else {
    $$('.reveal, .stamps').forEach((n) => n.classList.add('in'));
  }

  /* ---------- 閱讀進度與目錄高亮 ---------- */
  const bar = $('.progress');
  const prose = $('.prose');
  const tocLinks = $$('.toc a');
  const heads = tocLinks.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
  if (bar && prose) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = prose.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / r.height));
      bar.style.setProperty('--p', p.toFixed(4));
      let cur = -1;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) cur = i; });
      const id = cur >= 0 ? heads[cur].id : null;
      tocLinks.forEach((a) => a.classList.toggle('active', decodeURIComponent(a.hash.slice(1)) === id));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
})();
