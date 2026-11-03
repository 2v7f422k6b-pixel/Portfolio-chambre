/* Surgical cleanup of the stray red L-shaped line in both Play backgrounds.
   Uses a transparent repaired-pixel overlay; original artworks stay untouched. */
(() => {
  const scene = document.getElementById('play-scene');
  if (!scene) return;

  const tracks = [
    [0.541, 0.500, 0.589, 0.525],
    [0.541, 0.500, 0.548, 0.583]
  ];
  const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

  function repairImage(img, isNight) {
    if (!img.naturalWidth || img.dataset.lineRepairReady === '1') return;
    img.dataset.lineRepairReady = '1';
    const w = img.naturalWidth, h = img.naturalHeight;
    const radius = Math.max(3, Math.round(w * 0.0035));
    const lines = tracks.map(([x1, y1, x2, y2]) =>
      [x1 * w, y1 * h, x2 * w, y2 * h]);
    const x0 = clamp(Math.floor(Math.min(...lines.flatMap(l => [l[0], l[2]])) - radius - 4), 0, w);
    const y0 = clamp(Math.floor(Math.min(...lines.flatMap(l => [l[1], l[3]])) - radius - 4), 0, h);
    const x1 = clamp(Math.ceil(Math.max(...lines.flatMap(l => [l[0], l[2]])) + radius + 4), 0, w);
    const y1 = clamp(Math.ceil(Math.max(...lines.flatMap(l => [l[1], l[3]])) + radius + 4), 0, h);
    const pw = x1 - x0, ph = y1 - y0;
    if (pw <= 0 || ph <= 0) return;

    const scratch = document.createElement('canvas');
    scratch.width = w; scratch.height = h;
    const ctx = scratch.getContext('2d', {willReadFrequently: true});
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    let pixels;
    try { pixels = ctx.getImageData(x0, y0, pw, ph); }
    catch { return; }
    const mask = new Uint8Array(pw * ph);
    const distances = new Float32Array(pw * ph);
    const selected = [];
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        const px = x + x0, py = y + y0;
        let dist = Infinity;
        for (const [ax, ay, bx, by] of lines) {
          const vx = bx - ax, vy = by - ay;
          const t = clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy), 0, 1);
          dist = Math.min(dist, Math.hypot(px - ax - t * vx, py - ay - t * vy));
        }
        const p = y * pw + x;
        distances[p] = dist;
        if (dist < radius) { mask[p] = 1; selected.push(p); }
      }
    }
    const src = pixels.data;
    const work = new Float32Array(src.length);
    for (let k = 0; k < src.length; k++) work[k] = src[k];
    // Seed each removed pixel with a blend of the surrounding undamaged wall.
    for (const p of selected) {
      const x = p % pw, y = (p / pw) | 0;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        for (let d = 1; d < radius * 4; d++) {
          const xx = x + dx * d, yy = y + dy * d;
          if (xx < 0 || yy < 0 || xx >= pw || yy >= ph) break;
          const q = yy * pw + xx;
          if (!mask[q]) {
            r += src[q * 4]; g += src[q * 4 + 1]; b += src[q * 4 + 2]; n++;
            break;
          }
        }
      }
      if (n) {
        work[p * 4] = r / n; work[p * 4 + 1] = g / n; work[p * 4 + 2] = b / n;
      }
    }
    // Relax across the narrow removed stroke to avoid a visible flat-color patch.
    for (let pass = 0; pass < 70; pass++) {
      for (const p of selected) {
        const x = p % pw, y = (p / pw) | 0;
        if (x < 1 || x >= pw - 1 || y < 1 || y >= ph - 1) continue;
        const a = (p - 1) * 4, b = (p + 1) * 4;
        const c = (p - pw) * 4, d = (p + pw) * 4, o = p * 4;
        for (let k = 0; k < 3; k++)
          work[o + k] = (work[a + k] + work[b + k] + work[c + k] + work[d + k]) / 4;
      }
    }
    const overlay = document.createElement('canvas');
    overlay.width = w; overlay.height = h;
    overlay.className = 'room-line-repair' + (isNight ? ' room-line-repair-night' : '');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;' +
      'opacity:' + (isNight ? '0' : '1') + ';';
    const out = overlay.getContext('2d').createImageData(pw, ph);
    for (const p of selected) {
      const off = p * 4;
      out.data[off] = work[off];
      out.data[off + 1] = work[off + 1];
      out.data[off + 2] = work[off + 2];
      out.data[off + 3] = Math.round(255 * clamp(radius - distances[p], 0, 1));
    }
    overlay.getContext('2d').putImageData(out, x0, y0);
    // Keep the night repair above the day repair even if files load out of order.
    if (isNight) scene.appendChild(overlay);
    else scene.insertBefore(overlay, scene.querySelector('.room-line-repair-night'));
    if (isNight) {
      overlay.style.transition = 'opacity 1.8s cubic-bezier(.42,0,.25,1)';
      const sync = () => {
        overlay.style.opacity = document.documentElement.dataset.theme === 'night' ? '1' : '0';
      };
      new MutationObserver(sync).observe(document.documentElement, {
        attributes: true, attributeFilter: ['data-theme']
      });
      sync();
    }
  }

  for (const [id, night] of [['room-img', false], ['room-night', true]]) {
    const img = document.getElementById(id);
    if (!img) continue;
    if (img.complete && img.naturalWidth) repairImage(img, night);
    else img.addEventListener('load', () => repairImage(img, night), {once: true});
  }
})();
