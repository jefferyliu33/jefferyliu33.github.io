/* Shared behaviour for the board-layout project pages:
   - reduced-motion handling for autoplaying clips
   - click-to-enlarge lightbox for any image with class "shot"
   The lightbox markup is built here, so pages only need the images. */
(function () {
  'use strict';

  /* Reduced motion: clips start paused (controls still let people play them). */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.removeAttribute('autoplay');
      v.pause();
    });
  }

  var shots = Array.prototype.slice.call(document.querySelectorAll('.page .shot'));
  if (!shots.length) return;

  var dlg = document.createElement('dialog');
  if (typeof dlg.showModal !== 'function') return;
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Image viewer');
  dlg.innerHTML =
    '<p class="lb-count" aria-live="polite"></p>' +
    '<button class="lb-btn lb-close" type="button">Close [Esc]</button>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous image">&larr;</button>' +
    '<figure class="lb-figure"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Next image">&rarr;</button>';
  document.body.appendChild(dlg);

  var big = dlg.querySelector('.lb-img');
  var cap = dlg.querySelector('.lb-cap');
  var count = dlg.querySelector('.lb-count');
  var idx = 0;

  function show(i) {
    idx = (i + shots.length) % shots.length;
    var im = shots[idx];
    /* the lightbox shows the full image, including any part the page crops */
    big.src = im.getAttribute('data-full') || im.currentSrc || im.src;
    big.alt = im.alt;
    var fc = im.closest('figure') && im.closest('figure').querySelector('figcaption');
    var text = '';
    if (fc) {
      var copy = fc.cloneNode(true);
      var label = copy.querySelector('.cap-label');
      if (label) label.remove();
      text = copy.textContent.trim();
    }
    cap.textContent = text;
    count.textContent = (idx + 1) + ' / ' + shots.length;
  }
  function open(i) { show(i); dlg.showModal(); }

  shots.forEach(function (im, i) {
    im.tabIndex = 0;
    im.setAttribute('role', 'button');
    im.addEventListener('click', function () { open(i); });
    im.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  dlg.addEventListener('close', function () { shots[idx].focus({ preventScroll: true }); });
})();
