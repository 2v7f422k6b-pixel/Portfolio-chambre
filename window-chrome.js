/* One window header: the artist's heart, a translated name.exe, and her PNG close icon.
   Existing close buttons are moved, never cloned, so their cleanup/focus handlers survive. */
(() => {
  'use strict';
  const base = document.currentScript.src;
  const heartURL = new URL('assets/heart-lena.svg', base).href;
  const closeURL = new URL('assets/portfolio-ux/IMG_5035.png', base).href;
  const cssURL = new URL('window-chrome.css?v=20261105-unified-1', base).href;
  const decorated = new WeakSet();
  const frames = new WeakSet();

  function image(doc, src, className) {
    const img = doc.createElement('img');
    img.src = src; img.alt = ''; img.className = className;
    img.setAttribute('aria-hidden', 'true'); img.draggable = false;
    return img;
  }
  function decorate(bar, title, close) {
    if (!bar || !title || !close || decorated.has(bar)) return;
    decorated.add(bar);
    const doc = bar.ownerDocument;
    bar.classList.add('nana-window-bar');
    title.classList.add('nana-window-title');
    close.classList.add('nana-window-close');
    close.type = 'button';
    close.replaceChildren(image(doc, closeURL, 'nana-close-art'));
    // Keep a suffix separate from translated names, including legacy .exe titles.
    const suffix = () => {
      const next = /\.exe\s*$/i.test(title.textContent) ? '' : '.exe';
      if (title.dataset.extension !== next) title.dataset.extension = next;
    };
    new MutationObserver(suffix).observe(title, {subtree:true, childList:true, characterData:true});
    suffix();
    // Preserve a tracing already attached by sketch-ui.js.
    const trace = bar.querySelector(':scope > .sketch-ui-svg');
    bar.replaceChildren(image(doc, heartURL, 'nana-window-heart'), title, close);
    if (trace) bar.append(trace);
  }
  function addBar(panel, close, name) {
    if (!panel || !close || close.closest('.nana-window-bar')) return;
    const bar = panel.ownerDocument.createElement('div');
    const title = panel.ownerDocument.createElement('span');
    title.textContent = name;
    panel.prepend(bar);
    decorate(bar, title, close);
  }
  function scan() {
    decorate(document.querySelector('.window-top'), document.getElementById('window-title'), document.getElementById('window-close'));
    decorate(document.getElementById('special-titlebar'), document.getElementById('special-title'), document.getElementById('special-close'));
    decorate(document.querySelector('.coloring-panel-head'), document.getElementById('coloring-title'), document.getElementById('coloring-close'));
    const studio = document.getElementById('nana-dreamlab-topbar');
    decorate(studio, studio?.querySelector('span'), document.getElementById('nana-dreamlab-close'));
    const admin = document.querySelector('.nana-admin-top');
    decorate(admin, admin?.querySelector('h2'), admin?.querySelector('.nana-admin-close'));
    document.querySelectorAll('.mv-lightbar').forEach(bar => {
      if (!decorated.has(bar)) bar.querySelector('span').textContent = 'Image viewer';
      decorate(bar, bar.querySelector('span'), bar.querySelector('button'));
    });
    addBar(document.getElementById('player'), document.getElementById('player-hide'), 'Music');
    addBar(document.getElementById('nana-discovery-dialog'), document.querySelector('.nana-discovery-close'), 'Exploration');
    addBar(document.querySelector('#work-break-nudge .wb-card'), document.querySelector('.wb-close'), 'Break');
    document.querySelectorAll('#special-host > iframe').forEach(connectFrame);
  }
  function connectFrame(frame) {
    if (frames.has(frame)) return;
    frames.add(frame);
    const install = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc?.head || !doc.body) return;
        if (!doc.getElementById('nana-embedded-chrome')) {
          const css = doc.createElement('link'); css.id = 'nana-embedded-chrome';
          css.rel = 'stylesheet'; css.href = cssURL; doc.head.append(css);
        }
        if (frame.classList.contains('latte-frame')) doc.documentElement.classList.add('nana-embedded-latte');
        if (/(?:^|\/)about-me\.html(?:[?#]|$)/.test(frame.getAttribute('src') || '')) {
          doc.documentElement.classList.add('nana-embedded-dressup');
          const actions = doc.querySelector('.top .actions');
          if (actions) { actions.setAttribute('role', 'toolbar'); actions.setAttribute('aria-label', 'Tenue'); }
        }
        // The illustrated device remains intact; its surrounding window owns closure.
        if (frame.classList.contains('tama-frame')) doc.documentElement.classList.add('nana-embedded-tamagotchi');
        const viewer = doc.querySelector('#viewer .viewer-bar');
        decorate(viewer, doc.getElementById('viewer-label'), doc.getElementById('viewer-close'));
        if (viewer && !doc.getElementById('nana-embedded-trace')) {
          const trace = doc.createElement('script'); trace.id = 'nana-embedded-trace';
          trace.src = new URL('sketch-ui.js?v=20261105-all-lines-1', base).href;
          doc.head.append(trace);
        }
      } catch (_) { /* Cross-origin media never receives DOM modifications. */ }
    };
    frame.addEventListener('load', install);
    install();
  }
  window.NanaWindowChrome = {decorate};
  scan();
  const observer = new MutationObserver(records => {
    if (!records.some(r => [...r.addedNodes].some(n => n.nodeType === 1 && !n.closest?.('.nana-window-bar') && !n.classList?.contains('sketch-ui-svg')))) return;
    scan();
  });
  observer.observe(document.body, {childList:true, subtree:true});
})();
