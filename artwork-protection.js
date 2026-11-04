/* Nana Color Studio — artwork reuse deterrents.
   This is NOT DRM: browsers, extensions, direct URLs and screenshots can still copy
   anything served publicly. Never publish sale-ready masters on GitHub Pages. */
(() => {
  'use strict';

  const artworkPath = /\/assets\/(?:photos|uploads|previews\/(?:photos|uploads))\/[^?#]+\.(?:png|jpe?g|webp)$/i;
  const isImage = element => element instanceof Element && element.matches('img, svg image');

  function isPortfolioArtwork(element) {
    if (!isImage(element)) return false;
    const source = element.getAttribute('src') ||
      element.getAttribute('href') ||
      element.getAttribute('xlink:href') || '';
    if (!source) return false;
    try {
      return artworkPath.test(new URL(source, document.baseURI).pathname);
    } catch {
      return false;
    }
  }

  function mark(element) {
    if (!isPortfolioArtwork(element)) return;
    // Extra image-level hints for Pinterest-compatible widgets and extensions.
    // The page-wide <meta name="pinterest" content="nopin"> is authoritative.
    element.setAttribute('nopin', 'nopin');
    element.setAttribute('data-pin-nopin', 'true');
    element.setAttribute('draggable', 'false');
  }

  function scan(root) {
    if (!(root instanceof Element)) return;
    if (isImage(root)) mark(root);
    root.querySelectorAll('img, svg image').forEach(mark);
  }

  document.addEventListener('contextmenu', event => {
    const element = event.target instanceof Element
      ? event.target.closest('img, svg image') : null;
    if (isPortfolioArtwork(element)) event.preventDefault();
  });
  document.addEventListener('dragstart', event => {
    const element = event.target instanceof Element
      ? event.target.closest('img, svg image') : null;
    if (isPortfolioArtwork(element)) event.preventDefault();
  });

  const style = document.createElement('style');
  style.textContent = [
    'img[src*="assets/photos/"],img[src*="assets/uploads/"],',
    'img[src*="assets/previews/"],svg image[href*="assets/photos/"],',
    'svg image[href*="assets/uploads/"],svg image[href*="assets/previews/"]',
    '{-webkit-user-drag:none;user-select:none;-webkit-user-select:none}'
  ].join('');
  document.head.appendChild(style);

  scan(document.documentElement);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        mark(record.target);
      } else {
        for (const node of record.addedNodes) scan(node);
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src', 'href', 'xlink:href']
  });
})();
