/* Hand-traced chrome: soft, deterministic strokes, never applied to artwork. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  // Shared traced outlines for interface chrome, never the illustrated room.
  const targets = [
    ['#nana-admin-dialog .nana-photo-editor', 'frame', 1101],
    ['#nana-admin-dialog .nana-photo-editor label', 'frame', 1102],
    ['#nana-admin-dialog .nana-admin-action', 'frame', 1103],
    // Dock uses a clean, rounded translucent background without traced outlines.
    ['.mac-window', 'frame', 57],
    ['.nana-window-bar', 'rule', 68],
    ['#special-window:not(:has(.phone-device)):not(:has(.tama-frame)):not(:has(iframe[src*="polaroids"]))', 'frame', 69],
    ['#nana-dreamlab-window', 'frame', 70],
    ['.welcome-top', 'rule', 69],
    ['.tile-art', 'frame', 72],
    ['#window-shade .project-card .project-icon', 'frame', 73],
    ['#window-shade .project-card .project-preview', 'frame', 74],
    ['.welcome-panel', 'frame', 71],
    ['.mode-tile', 'frame', 101],
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
    ['#window-shade .mail-form .mail-field-box', 'frame', 234],
    ['#window-shade .viewer-btn', 'frame', 241],
    ['#window-shade .library-toolbar', 'frame', 251],
    ['#window-shade .about-mark', 'frame', 263],
    ['#window-shade .window-end', 'rule', 271],
    // Reuse the site's actual hand-traced borders on the congratulations popup.
    // Rectilinear corners and gently trembling sides, not CSS rounded rectangles.
    ['#nana-discovery-dialog', 'frame', 1031],
    ['#nana-discovery-dialog .nana-discovery-reward', 'frame', 1041],
    ['#nana-discovery-dialog .nana-discovery-coupon code', 'frame', 1061],
    ['#nana-discovery-dialog .nana-discovery-coupon button', 'frame', 1071],
    ['#nana-discovery-dialog .nana-discovery-shop', 'frame', 1081],
    ['#window-shade .viewer-stage', 'frame', 281],
    ['#window-shade .viewer-thumb', 'frame', 291],
    ['#window-shade .motion-reels-outline', 'frame', 301],
    ['#window-shade .motion-reels-actions button', 'frame', 311],
    ['#window-shade .motion-reels-header', 'rule', 312],
    ['#window-shade .motion-reels-footer', 'top-rule', 313],
    ['#window-shade .motion-reels-drawer-top', 'rule', 314],
    ['#window-shade .motion-reels-action-separator', 'rule', 315],
    ['#window-shade .motion-reels-screen', 'frame', 316],
    ['#window-shade .motion-reels-drawer', 'frame', 341],
    ['#window-shade .motion-reels-list button', 'frame', 351],
    // Editorial library: only the real UI surfaces, with one outline each.
    ['#pages-library .pages-intro', 'rule', 801],
    ['#pages-library .pages-controls', 'rule', 811],
    ['#pages-library .pages-tab', 'frame', 821],
    ['#pages-library .pages-search', 'frame', 831],
    ['#pages-library .pages-view', 'frame', 841],
    ['#pages-library .pages-view button:first-child', 'vertical-rule', 851],
    ['#pages-library .pages-shelf', 'rule', 861],
    ['#pages-library .pages-shelf-total', 'frame', 871],
    ['#pages-library .pages-cover', 'frame', 881],
    ['#pages-library .pages-item-foot', 'top-rule', 891],
    ['#pages-library .pages-grid-list .pages-item', 'rule', 901],
    ['#window-shade .project-card', 'frame', 361],
    ['#window-shade .project-icon', 'frame', 371],
    ['#window-shade .viewer-thumbnails', 'rule', 381],
    ['#global-search-popover', 'frame', 391],
    ['#global-search-input', 'frame', 401],
    ['#work-search-input', 'frame', 411],
    ['#window-shade .mv-search-wrap', 'frame', 601],
    ['#window-shade .mv-cover-art', 'frame', 611],
    ['#window-shade .mv-work-frame', 'frame', 621],
    ['#window-shade .mv-nav-link.is-active', 'frame', 631],
    ['#window-shade .mv-section-heading', 'rule', 641],
    ['#window-shade .mv-fav-button', 'frame', 651],
    ['#window-shade .mv-header', 'rule', 661],
    ['#window-shade .mv-sidebar', 'vertical-rule', 681],
    ['#window-shade .mv-now-viewing', 'top-rule', 691],
    ['#window-shade .mv-sidebar-divider', 'rule', 671],
    ['#window-shade .lit-card', 'frame', 711],
    ['#window-shade .lit-button', 'frame', 721],
    ['#window-shade .lit-word', 'frame', 731],
    ['#window-shade .mini-game-card', 'frame', 421],
    ['#window-shade .mini-game-cta', 'frame', 431],
    // Rilakkuma: gently traced interactive controls and a double certificate frame.
    ['#nana-do-nothing .nothing-progress-track', 'frame', 951],
    ['#nana-do-nothing .nothing-button', 'frame', 961],
    ['#nana-do-nothing .nothing-certificate', 'double-frame', 971],
    ['#window-shade .atelier-about-copy .info-box', 'frame', 541],
    // Coloring modal in the main document; the iframe handles its own drawn controls.
    ['.coloring-overlay .coloring-panel', 'frame', 981],
    ['.mv-lightbox', 'frame', 991]
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
  function makePath(width, height, seed, kind, variation, inset = 0) {
    const random = rng(seed);
    const pad = 1.5 + inset;
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
    if (kind === 'vertical-rule') {
      const x = Math.max(1,width-2.6);
      d = 'M ' + round(x) + ' ' + round(top);
      edge(x,top,x,bottom,false);
      return d;
    }
    if (kind === 'top-rule') {
      const y = 2;
      d = 'M ' + round(left) + ' ' + round(y);
      edge(left, y, right, y, true);
      return d;
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
    const innerInk = kind === 'double-frame' ? document.createElementNS(NS, 'path') : null;
    if (innerInk) {
      innerInk.classList.add('sketch-ui-ink', 'sketch-ui-inner');
      svg.appendChild(innerInk);
    }
    // Decorative SVG must not participate as a flex/grid child.
    svg.style.position='absolute';
    svg.style.inset='0';
    svg.style.pointerEvents='none';
    svg.style.display='block';
    element.appendChild(svg);
    if(getComputedStyle(element).position==='static')element.style.position='relative';
    element.classList.add(kind === 'rule' || kind === 'top-rule' || kind === 'vertical-rule' ? 'sketch-ui-rule' : 'sketch-ui-frame');
    const item = {element, svg, ink, innerInk, kind, seed, previousWidth:0, previousHeight:0};
    redrawn.set(element, item);
    return item;
  }

  const items = [];
  const observer = 'ResizeObserver' in window ? new ResizeObserver(entries => {
    for (const entry of entries) { const item = redrawn.get(entry.target); if (item) draw(item); }
  }) : null;
  function scan(){
    for(const [selector,kind,base] of targets){
      document.querySelectorAll(selector).forEach((element,index)=>{
        const item=attach(element,kind,base+index*131+(++serial*7));
        if(item){items.push(item);observer?.observe(element);draw(item);}
      });
    }
  }
  function draw(item) {
    const width=item.element.offsetWidth,height=item.element.offsetHeight;
    if(width<18||height<12)return;
    if(width===item.previousWidth&&height===item.previousHeight)return;
    item.previousWidth=width;item.previousHeight=height;
    item.svg.setAttribute('viewBox','0 0 '+width+' '+height);
    const variation=item.element.closest('#nana-discovery-dialog') ? 1.55 : (item.element.closest('#nana-do-nothing') ? 1.45 : (item.element.closest('#pages-library') ? 0.8 : (item.element.closest('#motion-reels') ? 0.65 : (item.element.closest('.mail-form') ? 0.75 : (item.element.closest('.mv-app') ? 1.25 : (item.element.id==='dock' ? .85 : 1.05))))));
    item.ink.setAttribute('d',makePath(width,height,item.seed,item.kind,variation));
    if (item.innerInk) item.innerInk.setAttribute('d',makePath(width,height,item.seed+53,'frame',variation*.72,7));
  }
  scan();
  // Modal contents are created after page load; trace those when they appear.
  let queued=false;
  const mutation=new MutationObserver(records=>{
    // Our own SVG insertion is not a reason to rescan the whole document.
    if(!records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1 && !node.classList?.contains('sketch-ui-svg'))))return;
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;scan();});
  });
  mutation.observe(document.body,{childList:true,subtree:true});
  if(!observer)window.addEventListener('resize',()=>items.forEach(draw),{passive:true});
})();

