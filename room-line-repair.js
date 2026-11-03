/* Remove the isolated bright-red L-shaped stroke from both Play backgrounds.
   The repair is limited to the stroke's own red pixels, so the surrounding
   wall, windows, hanging stars and interactive objects stay untouched. */
(() => {
  const scene = document.getElementById('play-scene');
  if (!scene) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function repairImage(image, night) {
    if (!image.naturalWidth || image.dataset.lineRepairReady === '1') return;
    image.dataset.lineRepairReady = '1';

    const w = image.naturalWidth;
    const h = image.naturalHeight;
    // Coordinates were checked against the real screenshot (not the
    // previously guessed L shape): near the left edge of the garland.
    const x0 = Math.floor(w * 0.540);
    const x1 = Math.ceil(w * 0.611);
    const y0 = Math.floor(h * 0.385);
    const y1 = Math.ceil(h * 0.490);
    const pw = x1 - x0, ph = y1 - y0;

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = w;
    sourceCanvas.height = h;
    const srcContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcContext) return;
    srcContext.drawImage(image, 0, 0);

    let pixels;
    try { pixels = srcContext.getImageData(x0, y0, pw, ph); }
    catch (err) { console.warn('Play room line cleanup: cannot read pixels', err); return; }

    const src = pixels.data;
    const strong = new Uint8Array(pw * ph);
    let count = 0;

    // The unwanted stroke is almost exactly #ff173b. Unlike the pink stars,
    // it is vivid pure red with very little green or blue.
    for (let p = 0; p < strong.length; p++) {
      const o = p * 4;
      const r = src[o], g = src[o + 1], b = src[o + 2];
      if (r > 228 && g < 92 && b < 132 && r > g * 2.4 && r > b * 1.7) {
        strong[p] = 1;
        count++;
      }
    }
    if (count < 12) return;

    // Remove the red antialiasing fringe as well, by growing by one pixel.
    const mask = new Uint8Array(strong.length);
    const selected = [];
    for (let y = 1; y < ph - 1; y++) {
      for (let x = 1; x < pw - 1; x++) {
        const p = y * pw + x;
        let marked = false;
        for (let dy = -1; dy <= 1 && !marked; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (strong[p + dy * pw + dx]) { marked = true; break; }
        if (marked) { mask[p] = 1; selected.push(p); }
      }
    }
    if (!selected.length) return;

    const work = new Float32Array(src.length);
    for (let k = 0; k < src.length; k++) work[k] = src[k];

    // Restore the underlying painted wall from nearby intact pixels.
    for (const p of selected) {
      const x = p % pw, y = Math.floor(p / pw);
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let d = 1; d <= 22; d++) {
          const xx = x + dx * d, yy = y + dy * d;
          if (xx < 0 || yy < 0 || xx >= pw || yy >= ph) break;
          const q = yy * pw + xx;
          if (!mask[q]) {
            const o = q * 4;
            r += src[o]; g += src[o + 1]; b += src[o + 2]; n++;
            break;
          }
        }
      }
      if (n) {
        const o = p * 4;
        work[o] = r / n;
        work[o + 1] = g / n;
        work[o + 2] = b / n;
      }
    }
    for (let pass = 0; pass < 70; pass++) {
      for (const p of selected) {
        const x = p % pw, y = Math.floor(p / pw);
        if (x < 1 || x >= pw - 1 || y < 1 || y >= ph - 1) continue;
        const a = (p - 1) * 4, b = (p + 1) * 4;
        const c = (p - pw) * 4, d = (p + pw) * 4, o = p * 4;
        for (let k = 0; k < 3; k++)
          work[o + k] = (work[a + k] + work[b + k] + work[c + k] + work[d + k]) / 4;
      }
    }

    // Transparent patch: the rest of the picture is literally untouched.
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.className = 'room-line-repair' + (night ? ' room-line-repair-night' : '');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;' +
      'opacity:' + (night ? '0' : '1') + ';';
    const patchCtx = canvas.getContext('2d');
    const patch = patchCtx.createImageData(pw, ph);
    for (const p of selected) {
      const o = p * 4;
      patch.data[o] = clamp(Math.round(work[o]), 0, 255);
      patch.data[o + 1] = clamp(Math.round(work[o + 1]), 0, 255);
      patch.data[o + 2] = clamp(Math.round(work[o + 2]), 0, 255);
      patch.data[o + 3] = 255;
    }
    patchCtx.putImageData(patch, x0, y0);

    if (night) scene.appendChild(canvas);
    else scene.insertBefore(canvas, scene.querySelector('.room-line-repair-night'));

    // Both day and night patches follow the same cross-fade as their image.
    // Otherwise a blue day patch would remain visible on the night wall.
    canvas.style.transition = 'opacity 1.8s cubic-bezier(.42,0,.25,1)';
    const sync = () => {
      const activeNight = document.documentElement.dataset.theme === 'night';
      canvas.style.opacity = (night === activeNight) ? '1' : '0';
    };
    new MutationObserver(sync).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });
    sync();
  }

  for (const [id, night] of [['room-img', false], ['room-night', true]]) {
    const image = document.getElementById(id);
    if (!image) continue;
    if (image.complete && image.naturalWidth) repairImage(image, night);
    else image.addEventListener('load', () => repairImage(image, night), { once: true });
  }
})();
