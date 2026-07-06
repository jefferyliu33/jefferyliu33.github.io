/* Site-wide motion: scroll reveal + page cross-fade.
   Press feedback is CSS-only, see motion.css.
   Bails out entirely for prefers-reduced-motion: reduce. */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- Scroll reveal ----------
     Reveals once per element on first entry into the viewport.
     Elements already on screen at load are left alone, so nothing
     above the fold flickers and the page never starts blank. */
  var candidates = document.querySelectorAll([
    '.detail > figure',
    '.detail > .section-label',
    '.detail > .did-list',
    '.detail > .learned',
    '.detail > .result-line',
    '.detail > .back-link',
    '.grid .card',
    '.contact-row',
    '.cv-actions',
    '.cv-embed-wrap'
  ].join(','));

  if ('IntersectionObserver' in window && candidates.length) {
    var foldLine = window.innerHeight * 0.95;
    var waiting = [];
    Array.prototype.forEach.call(candidates, function (el) {
      if (el.getBoundingClientRect().top > foldLine) {
        el.classList.add('reveal');
        waiting.push(el);
      }
    });

    if (waiting.length) {
      var io = new IntersectionObserver(function (entries) {
        var delay = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          io.unobserve(el);
          el.classList.remove('reveal');
          el.classList.add('reveal-in');
          /* tiny stagger when several elements arrive in the same batch
             (e.g. a row of project cards), capped so it never drags */
          el.style.animationDelay = delay + 'ms';
          delay = Math.min(delay + 40, 120);
          el.addEventListener('animationend', function () {
            el.classList.remove('reveal-in');
            el.style.animationDelay = '';
          }, { once: true });
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      waiting.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Page cross-fade out ----------
     Intercepts plain left-clicks on internal page links, fades the body,
     then navigates. Modified clicks, downloads, new tabs, hash links,
     mailto/tel and external links all pass through untouched. */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (url.pathname === location.pathname && url.hash) return;

    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(function () { location.href = url.href; }, 160);
  });

  /* Restore visibility when a faded-out page is served back from the
     back/forward cache. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('page-exit');
  });
})();
