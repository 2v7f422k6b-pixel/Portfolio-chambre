/* Hand-traced chrome: soft, deterministic strokes, never applied to artwork. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  // Shared traced outlines for interface chrome, never the illustrated room.
  const targets = [
    ['#dock', 'frame', 31],
    ['.mac-window', 'frame', 57],
    ['.window-top', 'rule', 68],
    ['.welcome-top', 'rule', 69],
    ['.tile-art', 'frame', 72],
    ['#window-shade .project-card .project-icon', 'frame', 73],
    ['#window-shade .traffic button', 'frame', 75],
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
    ['#window-shade .viewer-btn', 'frame', 241],
    ['#window-shade .library-toolbar', 'frame', 251],
    ['#window-shade .about-mark', 'frame', 263],
    ['#window-shade .window-end', 'rule', 271],
    ['#window-shade .viewer-stage', 'frame', 281],
    ['#window-shade .viewer-thumb', 'frame', 291],
    ['#window-shade .motion-reels-outline', 'frame', 301],
    ['#window-shade .motion-reels-actions button', 'frame', 311],
    ['#window-shade .motion-reels-drawer', 'frame', 341],
    ['#window-shade .motion-reels-list button', 'frame', 351],
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
    ['#window-shade .mini-game-card', 'frame', 421],
    ['#window-shade .mini-game-cta', 'frame', 431],
    ['#window-shade .pages-tab', 'frame', 441],
    ['#window-shade .pages-search', 'frame', 451],
    ['#window-shade .pages-item', 'frame', 461],
    ['#window-shade .pages-cover', 'frame', 471],
    ['#window-shade .pages-feature', 'frame', 481],
    ['#window-shade .atelier-about-copy .info-box', 'frame', 541]
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
    // Decorative SVG must not participate as a flex/grid child.
    svg.style.position='absolute';
    svg.style.inset='0';
    svg.style.pointerEvents='none';
    svg.style.display='block';
    element.appendChild(svg);
    if(getComputedStyle(element).position==='static')element.style.position='relative';
    element.classList.add(kind === 'rule' || kind === 'top-rule' || kind === 'vertical-rule' ? 'sketch-ui-rule' : 'sketch-ui-frame');
    const item = {element, svg, ink, kind, seed, previousWidth:0, previousHeight:0};
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
    const variation=item.element.closest('.mv-app') ? 1.25 : (item.element.id==='dock' ? .85 : 1.05);
    item.ink.setAttribute('d',makePath(width,height,item.seed,item.kind,variation));
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
