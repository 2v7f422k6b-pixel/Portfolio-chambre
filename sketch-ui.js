/* Hand-traced chrome: soft, deterministic strokes, never applied to artwork. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  // Shared traced outlines for interface chrome, never the illustrated room.
  const targets = [
    ['#dock', 'frame', 31],
    ['.mac-window', 'frame', 57],
    ['#menubar', 'rule', 12],
    ['.window-top', 'rule', 68],
    ['.welcome-panel', 'frame', 71],
    ['.mode-tile', 'frame', 101],
    ['.desktop-folder', 'frame', 127],
    ['.back-room', 'frame', 149],
    ['#dock .dock-app', 'frame', 48],
    ['#window-shade .project-card', 'frame', 161],
    ['#menubar .menu-right > button', 'frame', 173],
    ['#window-shade .art-tile', 'frame', 181],
    ['#window-shade .contact-row', 'frame', 191],
    ['#window-shade .phone-contact-card', 'frame', 199],
    ['#window-shade .pill-link', 'frame', 211],
    ['#window-shade .soft-btn', 'frame', 223],
    ['#window-shade .send-btn', 'frame', 233],
    ['#window-shade .viewer-btn', 'frame', 241],
    ['#window-shade .library-toolbar', 'frame', 251],
    ['#window-shade .about-mark', 'frame', 263],
    ['#window-shade .window-end', 'rule', 271]
  ];
  let serial = 0;
  const redrawn = new WeakMap();

  function rng(initial) {
    let state = initial >>> 0;
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  const round = value => Math.round(value * 10) / 10;

  // Short quadratic sections preserve crisp corners while keeping each
  // horizontal and vertical stroke slightly different, like a stylus trace.
  function makePath(width, height, seed, kind, variation) {
    const random = rng(seed);
    const pad = 1.5;
    const left = pad, top = pad;
    const right = Math.max(left + 4, width - pad);
    const bottom = Math.max(top + 4, height - pad);
    let d = '';
    function edge(x0, y0, x1, y1, horizontal) {
      const span = Math.hypot(x1 - x0, y1 - y0);
      const count = Math.max(2, Math.ceil(span / 36));
      for (let index = 1; index <= count; index++) {
        const a = (index - 1) / count;
        const b = index / count;
        const mid = (a + b) / 2;
        const controlX = x0 + (x1 - x0) * mid
          + (horizontal ? 0 : (random() - .5) * variation * 2.0);
        const controlY = y0 + (y1 - y0) * mid
          + (horizontal ? (random() - .5) * variation * 2.0 : 0);
        const endX = x0 + (x1 - x0) * b
          + (horizontal || index === count ? 0 : (random() - .5) * variation);
        const endY = y0 + (y1 - y0) * b
          + (!horizontal || index === count ? 0 : (random() - .5) * variation);
        d += ' Q ' + round(controlX) + ' ' + round(controlY)
          + ' ' + round(endX) + ' ' + round(endY);
      }
    }
    if (kind === 'rule') {
      const y = Math.max(1, height - 2.6);
      d = 'M ' + round(left) + ' ' + round(y);
      edge(left, y, right, y, true);
      return d;
    }
    d = 'M ' + round(left) + ' ' + round(top);
    edge(left, top, right, top, true);
    edge(right, top, right, bottom, false);
    edge(right, bottom, left, bottom, true);
    edge(left, bottom, left, top, false);
    return d + ' Z';
  }

  function attach(element, kind, seed) {
    if (redrawn.has(element)) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('sketch-ui-svg');
    const ink = document.createElementNS(NS, 'path');
    ink.classList.add('sketch-ui-ink');
    svg.appendChild(ink);
    element.appendChild(svg);
    element.classList.add(kind === 'rule' ? 'sketch-ui-rule' : 'sketch-ui-frame');
    const item = {element, svg, ink, kind, seed, previousWidth:0, previousHeight:0};
    redrawn.set(element, item);
    return item;
  }

  const items = [];
  for (const [selector, kind, base] of targets) {
    document.querySelectorAll(selector).forEach((element, index) => {
      const item = attach(element, kind, base + index * 131 + (++serial * 7));
      if (item) items.push(item);
    });
  }

  function draw(item) {
    const width = item.element.offsetWidth;
    const height = item.element.offsetHeight;
    if (width < 18 || height < 12) return;
    if (width === item.previousWidth && height === item.previousHeight) return;
    item.previousWidth = width;
    item.previousHeight = height;
    item.svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const variation = item.element.id === 'dock' ? .85 : .75;
    item.ink.setAttribute('d', makePath(width, height, item.seed, item.kind, variation));
  }

  for (const item of items) draw(item);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const item = redrawn.get(entry.target);
        if (item) draw(item);
      }
    });
    for (const item of items) observer.observe(item.element);
  } else {
    window.addEventListener('resize', () => items.forEach(draw), {passive:true});
  }
})();