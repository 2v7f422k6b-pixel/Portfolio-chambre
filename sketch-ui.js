/* Hand-traced chrome: soft, deterministic strokes, never applied to artwork. */
(() => {
  'use strict';
  if (window.NanaSketchUI) return;
  window.NanaSketchUI = {version:'20261105-all-lines-2'};
  const NS = 'http://www.w3.org/2000/svg';
  const scriptBase = document.currentScript.src;
  // Shared traced outlines for interface chrome, never the illustrated room.
  const targets = [
    ['#work-break-nudge .wb-card', 'frame', 1301],
    ['#work-break-nudge .wb-actions button', 'frame', 1311],
    ['#bead-workshop .bead-control', 'frame', 1201],
    ['#bead-workshop .bead-tray', 'frame', 1202],
    ['#bead-workshop .bead-box-lid', 'frame', 1203],
    ['#bead-workshop .bead-word > div', 'frame', 1204],
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
  // Audited interface components. Read their actual border sides so responsive
  // separators remain on the correct edge. Never traverse artwork or canvases.
  const remaining = [
    '#menubar', '#menubar button:not(.nana-window-close)', '.welcome-foot',
    '.dock-tooltip', '#toast', '#work-desktop .desk-extra',
    '#window-content .search', '#window-content .info-box', '#window-content .empty-state',
    '#window-content .gearnews-ring-episode', '#window-content .gearnews-ring-preview',
    '#window-content .mini-game-placeholder', '#window-content .library-toolbar',
    '.book-reader-header', '.book-reader-footer', '.book-reader-actions button',
    '.book-reader-loader button', '.book-side-arrow', '.book-meter',
    '#pages-library .pages-masthead', '#pages-library .pages-kicker', '#pages-library .pages-feature',
    '#pages-library .pages-footer', '#pages-library .pages-view button',
    '.mv-brand-icon', '.mv-sidebar-foot', '.mv-square', '.mv-feature',
    '.mv-feature-main-art', '.mv-feature-secondary-art', '.mv-primary-action',
    '.mv-bottom-picture', '.mv-now-controls button', '.mv-project-hero', '.mv-project-hero-art',
    '.mv-fav-outline', '.mv-list-header', '.mv-empty', '.mv-lightstage figure', '.mv-light-arrow',
    '.mv-lightcaption', '.mv-mobile-nav', '.mv-mobile-nav button',
    '.motion-reels-center-play', '.motion-reels-loading', '.motion-reels-empty', '.motion-reels-drawer-top button',
    '.lit-reader-index', '.lit-archive-search', '.lit-index-item',
    '#player', '#player .player-buttons button',
    '.phone-bar', '.phone-fields label', '.phone-contact-card', '.phone-compose input',
    '.phone-compose textarea', '.phone-keyrow button',
    '#nana-admin-dialog', '#nana-admin-dialog input:not([type=range]):not([type=file])',
    '#nana-admin-dialog textarea', '#nana-admin-dialog select',
    '#nana-admin-dialog .nana-admin-divider', '#nana-admin-dialog .nana-admin-note',
    '#nana-discovery-dialog .nana-discovery-continue',
    // Dress-up document: panel edges, inventory controls and profile separators.
    '.frame .panel', '.frame .action', '.frame .tab', '.frame .item', '.frame .preset',
    '.frame .identity', '.frame .line', '.frame .meter', '.frame .quest',
    '.frame .stage-foot', '.frame .tabs', '.frame .smallnote', '.frame .toast',
    // Studio controls; the drawn keyboard, pads, faders and waveform are content.
    '.dl-daw .dl-track', '.dl-daw .dl-track-number', '.dl-daw button', '#dl-track-count',
    '.dl-daw .dl-track-head', '.dl-daw .dl-section-head', '.dl-daw .dl-track-list',
    '.dl-back', '.dl-language', '.dl-audio-enable'
  ].join(',');
  targets.push(['.dl-daw','frame',1201]);
  targets.push(['#pages-library .pages-cover-lines','double-frame',1202]);
  targets.push(['#window-content .lit-index-item','frame',1203]);
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
    if (kind.startsWith('edges:')) return kind.slice(6).split(',').map((side,i) =>
      makePath(width,height,seed+i*73,{top:'top-rule',right:'vertical-rule',bottom:'rule',left:'left-rule'}[side],variation,inset)).join(' ');
    const random = rng(seed);
    const pad = Math.min(1.5 + inset, Math.max(.75, (Math.min(width,height)-2)/2));
    const left = pad, top = pad;
    const right = Math.max(left + 1, width - pad);
    const bottom = Math.max(top + 1, height - pad);
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
    if (kind === 'vertical-rule' || kind === 'left-rule') {
      const x = kind === 'left-rule' ? 2 : Math.max(1,width-2.6);
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
    const previous = redrawn.get(element);
    if (previous) {
      // Dynamic button labels and translated content can replace the SVG child.
      if (previous.svg && previous.svg.parentNode !== element) {
        element.appendChild(previous.svg);
        previous.previousWidth=0; draw(previous);
      }
      return;
    }
    const nativeField = element.matches('input,textarea,select');
    const nativeBackground = nativeField ? getComputedStyle(element).backgroundImage : null;
    element.style.setProperty('border-color','transparent','important');
    element.style.setProperty('border-image','none','important');
    element.style.setProperty('outline','none','important');
    element.classList.add('nana-traced-ui');
    if (nativeField) {
      // Native fields cannot render SVG children. Paint the same path behind the
      // text, preserving their dimensions, focus, selection and form behavior.
      element.classList.add('sketch-ui-field');
      const item={element,svg:null,kind,seed,nativeBackground,previousWidth:0,previousHeight:0};
      redrawn.set(element,item);return item;
    }
    const drawnFrame = kind === 'frame' || kind === 'double-frame';
    const svg = drawnFrame ? document.createElement('span') : document.createElementNS(NS, 'svg');
    if(drawnFrame){
      const file=kind==='double-frame'?'cadre_certificat':element.matches('button,a,.soft-btn,.pill-link')?'cadre_bouton':'cadre_fenetre';
      svg.classList.add('lena-drawn-frame');
      svg.style.setProperty('border-image',`url("${new URL('assets/drawn-ui/'+file+'.png',scriptBase).href}") 18 / 10px / 0 stretch`);
    }
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    // Scrollbars reduce the available SVG width. Do not letterbox its viewBox,
    // otherwise a tall scrollable panel gets gaps above and below its outline.
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.classList.add('sketch-ui-svg');
    const ink = document.createElementNS(NS, 'path');
    ink.classList.add('sketch-ui-ink');
    if(!drawnFrame)svg.appendChild(ink);
    const innerInk = kind === 'double-frame' ? document.createElementNS(NS, 'path') : null;
    if (innerInk && !drawnFrame) {
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
    element.classList.add(kind.includes('rule') || kind.startsWith('edges:') ? 'sketch-ui-rule' : 'sketch-ui-frame');
    const item = {element, svg, ink, innerInk, drawnFrame, kind, seed, previousWidth:0, previousHeight:0};
    redrawn.set(element, item);
    return item;
  }

  let items = [];
  const observer = 'ResizeObserver' in window ? new ResizeObserver(entries => {
    for (const entry of entries) { const item = redrawn.get(entry.target); if (item) draw(item); }
  }) : null;
  function scan(){
    items=items.filter(item=>{if(item.element.isConnected)return true;observer?.unobserve(item.element);return false;});
    for(const [selector,kind,base] of targets){
      document.querySelectorAll(selector).forEach((element,index)=>{
        const item=attach(element,kind,base+index*131+(++serial*7));
        if(item){items.push(item);observer?.observe(element);draw(item);}
      });
    }
    document.querySelectorAll(remaining).forEach((element,index)=>{
      if(redrawn.has(element)){attach(element);return;}
      if(element.closest('.nana-window-close,svg,.ml-artboard') || !element.getClientRects().length)return;
      const style=getComputedStyle(element);
      const hasImage=style.borderImageSource!=='none';
      const sides=['top','right','bottom','left'].filter(side=>{
        const suffix=side[0].toUpperCase()+side.slice(1);
        const color=style['border'+suffix+'Color'];
        return parseFloat(style['border'+suffix+'Width'])>0 && style['border'+suffix+'Style']!=='none' &&
          (hasImage || (color!=='transparent' && color!=='rgba(0, 0, 0, 0)'));
      });
      if(!sides.length)return;
      const item=attach(element,sides.length===4?'frame':'edges:'+sides.join(','),1501+index*43);
      if(item){items.push(item);observer?.observe(element);draw(item);}
    });
    document.querySelectorAll('iframe').forEach(connectFrame);
  }
  function draw(item) {
    const width=item.element.offsetWidth,height=item.element.offsetHeight;
    if(width<8||height<4)return;
    if(width===item.previousWidth&&height===item.previousHeight)return;
    item.previousWidth=width;item.previousHeight=height;
    if(item.drawnFrame)return;
    if(!item.svg && item.kind==='frame'){
      item.element.style.setProperty('border-image',`url("${new URL('assets/drawn-ui/cadre_bouton.png',scriptBase).href}") 18 / 10px / 0 stretch`,'important');
      return;
    }
    if(!item.svg){
      const path=makePath(width,height,item.seed,item.kind,1.15);
      const image='<svg xmlns="'+NS+'" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><path d="'+path+'" fill="none" stroke="#ff173b" stroke-width="1.5"/></svg>';
      const background='url("data:image/svg+xml,'+encodeURIComponent(image)+'")';
      item.element.style.setProperty('background-image',background+(item.nativeBackground==='none'?'':','+item.nativeBackground),'important');
      item.element.style.setProperty('background-size','100% 100%','important');
      item.element.style.setProperty('background-origin','border-box','important');
      item.element.style.setProperty('background-clip','border-box','important');
      item.element.style.setProperty('background-repeat','no-repeat','important');
      return;
    }
    item.svg.setAttribute('viewBox','0 0 '+width+' '+height);
    const variation=item.element.closest('#nana-discovery-dialog') ? 1.55 : (item.element.closest('#nana-do-nothing') ? 1.45 : (item.element.closest('#pages-library') ? 0.8 : (item.element.closest('#motion-reels') ? 0.65 : (item.element.closest('.mail-form') ? 0.75 : (item.element.closest('.mv-app') ? 1.25 : (item.element.id==='dock' ? .85 : 1.05))))));
    const outlinePath=makePath(width,height,item.seed,item.kind,variation);
    item.ink.setAttribute('d',outlinePath);
    // Keep the typewriter window and button fills within their actual drawn outline.
    if(item.element.matches('#work-break-nudge .wb-card,#work-break-nudge .wb-actions button')){
      item.element.style.clipPath='path("'+outlinePath+'")';
    }
    if (item.innerInk) item.innerInk.setAttribute('d',makePath(width,height,item.seed+53,'frame',variation*.72,7));
  }
  const frames=new WeakSet();
  function connectFrame(frame){
    if(frames.has(frame)||!/(?:about-me\.html|dreamlab\.html|(?:latte|coloring-book|polaroids)\/index\.html)(?:[?#]|$)/.test(frame.getAttribute('src')||''))return;
    frames.add(frame);
    const install=()=>{
      try{
        const doc=frame.contentDocument;
        if(!doc?.head||doc.URL==='about:blank')return;
        if(!doc.getElementById('nana-complete-lines-style')){
          const css=doc.createElement('link');css.id='nana-complete-lines-style';css.rel='stylesheet';
          css.href=new URL('sketch-lines.css?v=20261105-all-lines-2',scriptBase).href;doc.head.append(css);
        }
        // Latte and coloring already own complete hand-traced drawing engines.
        if(!/(?:about-me\.html|dreamlab\.html|polaroids\/index\.html)(?:[?#]|$)/.test(frame.getAttribute('src')||''))return;
        if(!frame.contentWindow.NanaSketchUI&&!doc.getElementById('nana-complete-lines-script')){
          const script=doc.createElement('script');script.id='nana-complete-lines-script';script.src=scriptBase;doc.head.append(script);
        }
      }catch(_){/* Never style an external video or other cross-origin document. */}
    };
    frame.addEventListener('load',install);install();
  }
  scan();
  // Modal contents are created after page load; trace those when they appear.
  let queued=false;
  const mutation=new MutationObserver(records=>{
    // Our own SVG insertion is not a reason to rescan the whole document.
    if(!records.some(record=>(record.type==='attributes' && (record.attributeName!=='class' || record.target.matches(remaining+',#app,#menubar,#window-shade,#special-shade'))) || [...record.addedNodes].some(node=>node.nodeType===1 && !node.closest?.('svg')) || [...record.removedNodes].some(node=>node.classList?.contains('sketch-ui-svg'))))return;
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;scan();});
  });
  mutation.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open','aria-pressed','class']});
  window.addEventListener('resize',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;scan();});}},{passive:true});
  if(!observer)window.addEventListener('resize',()=>items.forEach(draw),{passive:true});
})();

