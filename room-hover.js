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
  // The original room PNGs are red line drawings, not filled cutouts.
  // Recolour and slightly thicken the ink itself; never subtract its centre.
  const ink = element('filter', {
    id: 'nana-room-hover-ink', x: '-50%', y: '-50%', width: '200%', height: '200%',
    'color-interpolation-filters': 'sRGB'
  });
  const solidInk = element('feComponentTransfer', {in: 'SourceAlpha', result: 'solid-ink'});
  // The imported pencil strokes are translucent. Strengthen their opacity
  // before thickening so they remain legible against either room theme.
  solidInk.append(element('feFuncA', {type: 'linear', slope: '3', intercept: '0'}));
  ink.append(
    solidInk,
    element('feMorphology', {in: 'solid-ink', operator: 'dilate', radius: '.35', result: 'bold-ink'}),
    element('feFlood', {'flood-color': '#fff', result: 'ink'}),
    element('feComposite', {in: 'ink', in2: 'bold-ink', operator: 'in', result: 'white-ink'}),
    element('feGaussianBlur', {in: 'white-ink', stdDeviation: glow, result: 'glow'})
  );
  const inkMerge = element('feMerge');
  inkMerge.append(element('feMergeNode', {in: 'glow'}), element('feMergeNode', {in: 'white-ink'}));
  ink.append(inkMerge);
  defs.append(ring, stroke, ink);
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
    #hotspots .poster-white-outline {
      fill:none;stroke:#fff;stroke-width:var(--room-hover-width);
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
  function silhouette(image, box = {x: 0, y: 0, width: W, height: H}, {lineArt = false} = {}) {
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
    const pad = 8, w = maxX - minX + 1 + pad * 2, h = maxY - minY + 1 + pad * 2;
    const solid = new Uint8Array(w * h);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      if (raw[(y * canvas.width + x) * 4 + 3] <= 25) continue;
      const i = (y - minY + pad) * w + x - minX + pad;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) solid[i + dy * w + dx] = 1;
    }
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
    for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
      const i = y * w + x;
      let inside = true;
      for (let dy = -2; dy <= 2 && inside; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (outside[i + dy * w + dx]) {inside = false; break;}
      }
      if (inside) {alpha[i] = 255; pixels.fill(255, i * 4, i * 4 + 4);}
    }
    // Hit-testing keeps its filled mask. The visible line-art mask uses only
    // the supplied strokes (including antialiasing), without growing an edge.
    if (lineArt) {
      pixels.fill(0);
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const from = (y * canvas.width + x) * 4;
        const to = ((y - minY + pad) * w + x - minX + pad) * 4;
        pixels[to] = pixels[to + 1] = pixels[to + 2] = 255;
        pixels[to + 3] = raw[from + 3];
      }
    }
    canvas.width = w; canvas.height = h;
    ctx.putImageData(new ImageData(pixels, w, h), 0, 0);
    const x = box.x + minX - pad, y = box.y + minY - pad;
    const outline = element('image', {
      href: canvas.toDataURL(), x, y, width: w, height: h,
      class: 'room-hover-outline', filter: lineArt ? 'url(#nana-room-hover-ink)' : 'url(#nana-room-hover-ring)'
    });
    overlay.append(outline);
    // Release the temporary drawing buffer after encoding the small mask.
    canvas.width = canvas.height = 1;
    const layer = {outline, alpha, x, y, width: w, height: h};
    masks.set(image, layer);
    return layer;
  }
  function contains(layer, x, y) {
    if (!layer) return false;
    x = Math.floor(x - layer.x); y = Math.floor(y - layer.y);
    return x >= 0 && y >= 0 && x < layer.width && y < layer.height && layer.alpha[y * layer.width + x] > 25;
  }
  window.NanaRoomHover = Object.freeze({
    W, H, element, overlay, silhouette, contains,
    maskFor: image => masks.get(image),
    ring: 'url(#nana-room-hover-ring)',
    guide: () => hotspots.matches('.hotspot-guide-on,.hotspot-peek'),
    show: (layer, active) => layer?.outline.classList.toggle('is-active', active)
  });
})();
