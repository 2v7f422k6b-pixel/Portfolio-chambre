/* Shared white room outlines. All measurements use the 1670 × 942 artwork grid.
   Keep feedback separate from the drawings and their day/night colour filters. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene');
  const hotspots = document.getElementById('hotspots');
  if (!scene || !hotspots) return;
  const W = 1670, H = 942, width = 2, glow = 2.4, duration = 150;
  const NS = 'http://www.w3.org/2000/svg';
  function element(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
  }
  const overlay = element('svg', {
    id: 'pixel-outline-overlay', viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: 'none', 'aria-hidden': 'true', 'pointer-events': 'none'
  });
  Object.assign(overlay.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', overflow: 'visible', zIndex: '999'
  });
  const defs = element('defs');
  // One ring filter for raster silhouettes, rotated cookie and perspective decor.
  const ring = element('filter', {
    id: 'nana-room-hover-ring', x: '-50%', y: '-50%', width: '200%', height: '200%',
    'color-interpolation-filters': 'sRGB'
  });
  ring.append(
    element('feMorphology', {in: 'SourceAlpha', operator: 'dilate', radius: width, result: 'outer'}),
    element('feComposite', {in: 'outer', in2: 'SourceAlpha', operator: 'out', result: 'edge'}),
    element('feFlood', {'flood-color': '#fff', result: 'ink'}),
    element('feComposite', {in: 'ink', in2: 'edge', operator: 'in', result: 'white-edge'}),
    element('feGaussianBlur', {in: 'white-edge', stdDeviation: glow, result: 'glow'})
  );
  const merge = element('feMerge');
  merge.append(element('feMergeNode', {in: 'glow'}), element('feMergeNode', {in: 'white-edge'}));
  ring.append(merge);
  const stroke = element('filter', {
    id: 'nana-room-hover-stroke', x: '-50%', y: '-50%', width: '200%', height: '200%',
    'color-interpolation-filters': 'sRGB'
  });
  stroke.append(element('feGaussianBlur', {in: 'SourceGraphic', stdDeviation: glow, result: 'glow'}));
  const strokeMerge = element('feMerge');
  strokeMerge.append(element('feMergeNode', {in: 'glow'}), element('feMergeNode', {in: 'SourceGraphic'}));
  stroke.append(strokeMerge);
  const occluder = element('filter', {id:'nana-room-occluder', x:'-50%', y:'-50%', width:'200%', height:'200%'});
  occluder.append(element('feMorphology',{in:'SourceAlpha',operator:'dilate',radius:4,result:'solid'}),
    element('feFlood',{'flood-color':'black',result:'black'}),
    element('feComposite',{in:'black',in2:'solid',operator:'in'}));
  defs.append(ring, stroke, occluder);
  overlay.append(defs);
  scene.append(overlay);
  scene.style.setProperty('--room-hover-width', width);
  scene.style.setProperty('--room-hover-duration', duration + 'ms');
  const style = document.createElement('style');
  style.textContent = `
    #play-scene .room-hover-outline {
      pointer-events:none!important;
      transition:opacity var(--room-hover-duration) ease!important;
    }
    #pixel-outline-overlay > .room-hover-outline {opacity:0;}
    #pixel-outline-overlay > .room-hover-outline.is-active {opacity:1;}
    /* Keep the feedback fully white; dim artwork only, never its parent. */
    html[data-theme="night"] #play-scene #hotspots .poster-perspective-artworks {opacity:1!important;}
    html[data-theme="night"] #play-scene #hotspots .poster-perspective-artworks > g,
    html[data-theme="night"] #play-scene #hotspots .poster-perspective-artworks > .poster-glowy-handline {opacity:.8!important;}
    #hotspots .poster-white-outline {
      fill:none;stroke:#fff;stroke-width:2.6;
      stroke-linecap:round;stroke-linejoin:round;opacity:0;
      filter:url(#nana-room-hover-stroke);
    }
    #hotspots .poster-white-outline.poster-hover-white,
    #hotspots.hotspot-guide-on .poster-white-outline,
    #hotspots.hotspot-peek .poster-white-outline {opacity:1;}
    html.poster-edit-mode #hotspots .poster-white-outline {opacity:0;}
    #nana-shop-bag:focus-visible {outline:none!important;}
    @media(prefers-reduced-motion:reduce) {
      #play-scene .room-hover-outline {transition:none!important;}
    }
  `;
  document.head.append(style);

  /* Close tiny gaps in line art and fill its silhouette. Crop before processing:
     avoid retaining thirty full-room canvases and re-reading pixels on hover. */
  const masks = new WeakMap();
  // Two sliding windows keep gap closing linear in the number of pixels,
  // including drawings interrupted by foreground objects or the room edge.
  function expandMask(source, w, h, radius) {
    const rows = new Uint8Array(w * h), expanded = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      let count = 0;
      for (let x = 0; x <= radius && x < w; x++) count += !!source[y * w + x];
      for (let x = 0; x < w; x++) {
        rows[y * w + x] = count > 0;
        if (x >= radius) count -= !!source[y * w + x - radius];
        if (x + radius + 1 < w) count += !!source[y * w + x + radius + 1];
      }
    }
    for (let x = 0; x < w; x++) {
      let count = 0;
      for (let y = 0; y <= radius && y < h; y++) count += rows[y * w + x];
      for (let y = 0; y < h; y++) {
        expanded[y * w + x] = count > 0;
        if (y >= radius) count -= rows[(y - radius) * w + x];
        if (y + radius + 1 < h) count += rows[(y + radius + 1) * w + x];
      }
    }
    return expanded;
  }
  function silhouette(image, box = {x: 0, y: 0, width: W, height: H}, {lineArt = false, gapRadius = 2} = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(box.width); canvas.height = Math.ceil(box.height);
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const raw = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      if (raw[(y * canvas.width + x) * 4 + 3] > 25) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
    if (maxX < 0) return null;
    const pad = Math.max(8, gapRadius + 4), w = maxX - minX + 1 + pad * 2, h = maxY - minY + 1 + pad * 2;
    const sourceMask = new Uint8Array(w * h);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      if (raw[(y * canvas.width + x) * 4 + 3] <= 25) continue;
      const i = (y - minY + pad) * w + x - minX + pad;
      sourceMask[i] = 1;
    }
    const closedSource = sourceMask.slice();
    // A drawing cut by the room canvas (notably the guitar) has no ink along
    // that cut. Seal it for filling, but never add this artificial edge to ink.
    function sealCut(start, step, length) {
      let first = -1, last = -1;
      for (let n = 0; n < length; n++) if (sourceMask[start + n * step]) {
        if (first < 0) first = n;
        last = n;
      }
      for (let n = first; n >= 0 && n <= last; n++) closedSource[start + n * step] = 1;
    }
    if (minX === 0) sealCut(pad * w + pad, w, maxY - minY + 1);
    if (maxX === canvas.width - 1) sealCut(pad * w + w - pad - 1, w, maxY - minY + 1);
    if (minY === 0) sealCut(pad * w + pad, 1, maxX - minX + 1);
    if (maxY === canvas.height - 1) sealCut((h - pad - 1) * w + pad, 1, maxX - minX + 1);
    const solid = expandMask(closedSource, w, h, gapRadius);
    const outside = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let head = 0, tail = 0;
    function seed(i) { if (!solid[i] && !outside[i]) {outside[i] = 1; queue[tail++] = i;} }
    for (let x = 0; x < w; x++) {seed(x); seed((h - 1) * w + x);}
    for (let y = 0; y < h; y++) {seed(y * w); seed(y * w + w - 1);}
    while (head < tail) {
      const i = queue[head++], x = i % w;
      if (x > 0) seed(i - 1); if (x < w - 1) seed(i + 1);
      if (i >= w) seed(i - w); if (i < w * (h - 1)) seed(i + w);
    }
    const alpha = new Uint8Array(w * h), pixels = new Uint8ClampedArray(w * h * 4);
    // Undo the gap-closing expansion so the common ring starts at the drawing.
    const empty = expandMask(outside, w, h, gapRadius);
    for (let i = 0; i < alpha.length; i++) {
      if (!empty[i]) {alpha[i] = 255; pixels.fill(255, i * 4, i * 4 + 4);}
    }
    canvas.width = w; canvas.height = h;
    ctx.putImageData(new ImageData(pixels, w, h), 0, 0);
    const filledHref = canvas.toDataURL();
    // Subtract the entire filled interior, including eyes, clothes and strings.
    // On interrupted line drawings, keep only edges near the original strokes:
    // closing the mask must not invent visible lines across foreground objects.
    if (lineArt) {
      const outer = expandMask(alpha, w, h, width);
      const supported = expandMask(sourceMask, w, h, width + 1);
      pixels.fill(0);
      for (let i = 0; i < alpha.length; i++) {
        if (outer[i] && !alpha[i] && supported[i]) pixels.fill(255, i * 4, i * 4 + 4);
      }
      ctx.putImageData(new ImageData(pixels, w, h), 0, 0);
    }
    const x = box.x + minX - pad, y = box.y + minY - pad;
    const outline = element('image', {
      href: lineArt ? canvas.toDataURL() : filledHref, x, y, width: w, height: h,
      class: 'room-hover-outline', filter: lineArt ? 'url(#nana-room-hover-stroke)' : 'url(#nana-room-hover-ring)'
    });
    overlay.append(outline);
    // Release the temporary drawing buffer after encoding the small mask.
    canvas.width = canvas.height = 1;
    const layer = {outline, filledHref, alpha, x, y, width: w, height: h};
    masks.set(image, layer);
    return layer;
  }
  function contains(layer, x, y) {
    if (!layer) return false;
    x = Math.floor(x - layer.x); y = Math.floor(y - layer.y);
    return x >= 0 && y >= 0 && x < layer.width && y < layer.height && layer.alpha[y * layer.width + x] > 25;
  }
  let maskId = 0;
  function occlude(target, foreground) {
    const id = 'nana-room-occlusion-' + (++maskId);
    const mask = element('mask',{id,maskUnits:'userSpaceOnUse',x:0,y:0,width:W,height:H,'mask-type':'luminance'});
    mask.append(element('rect',{x:0,y:0,width:W,height:H,fill:'white'}));
    foreground.setAttribute('filter','url(#nana-room-occluder)');
    mask.append(foreground); defs.append(mask);
    target.setAttribute('mask',`url(#${id})`);
    return foreground;
  }
  window.NanaRoomHover = Object.freeze({
    W, H, element, overlay, silhouette, contains, occlude,
    maskFor: image => masks.get(image),
    ring: 'url(#nana-room-hover-ring)',
    guide: () => hotspots.matches('.hotspot-guide-on,.hotspot-peek'),
    show: (layer, active) => layer?.outline.classList.toggle('is-active', active)
  });
})();
