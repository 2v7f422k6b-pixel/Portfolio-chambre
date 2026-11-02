/* Poster fitting: respect the hand-drawn frames, their perspective and their click zones.
   Optional calibration UI: open the portfolio with ?posterEdit=1. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg) return;
  const oldArtwork = svg.querySelector('.poster-artworks');
  const clickable = Array.from(svg.querySelectorAll('polygon[data-type="poster"]'));
  if (!oldArtwork || clickable.length !== 19) return;

  const NS = 'http://www.w3.org/2000/svg';
  const WIDTH = 1670, HEIGHT = 942;
  const KEY = 'nana-poster-alignment-v1';
  const editing = new URLSearchParams(location.search).get('posterEdit') === '1';

  function node(tag, attributes) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attributes || {}).forEach(([name, value]) => el.setAttribute(name, String(value)));
    return el;
  }
  function parsePoints(str) {
    return (str || '').trim().split(/\s+/).map(pair => pair.split(',').map(Number));
  }
  function copyPoints(points) {
    return points.map(p => [p[0], p[1]]);
  }
  function quadFor(points, index) {
    if (points.length === 4) return copyPoints(points);
    // Irregular silhouettes are partially occluded by room objects.
    // These four corners describe the whole underlying paper, not its visible cut-out.
    if (index === 0) return [[228, 5], [296, 29], [297, 143], [228, 119]];
    if (index === 16) return [[1355, 247], [1426, 237], [1429, 372], [1355, 383]];
    if (index === 18) return [[1466, 265], [1608, 252], [1609, 434], [1466, 449]];
    return copyPoints(points.slice(0, 4));
  }

  // Read the actual image-to-poster assignments from the existing HTML.
  // In particular, poster 12 (index 11) has no source: never substitute another drawing.
  const sources = new Map();
  oldArtwork.querySelectorAll('image').forEach(image => {
    const match = (image.getAttribute('clip-path') || '').match(/redraw-post-(\d+)/);
    if (match) sources.set(Number(match[1]), image.getAttribute('href'));
  });
  const originals = clickable.map((el, index) => {
    const shape = parsePoints(el.getAttribute('points'));
    return { shape, quad: quadFor(shape, index) };
  });
  const current = originals.map(rec => ({
    shape: copyPoints(rec.shape), quad: copyPoints(rec.quad)
  }));
  function validPoints(points, length) {
    return Array.isArray(points) && points.length === length &&
      points.every(p => Array.isArray(p) && p.length === 2 &&
        p.every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 10000));
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(saved) && saved.length === current.length) {
      saved.forEach((rec, index) => {
        if (rec && validPoints(rec.shape, originals[index].shape.length) &&
          validPoints(rec.quad, 4)) {
          current[index] = { shape: copyPoints(rec.shape), quad: copyPoints(rec.quad) };
        }
      });
    }
  } catch (_) { /* Browsers can disable localStorage. The default fit still works. */ }

  const art = node('g', { class: 'poster-perspective-artworks', 'pointer-events': 'none' });
  const defs = node('defs');
  oldArtwork.after(defs, art);
  // The static layer remains as a progressive-enhancement fallback until rendering succeeds.
  function polygon(points) { return points.map(p => p.join(',')).join(' '); }
  function clip(id, points) {
    const cp = node('clipPath', { id, clipPathUnits: 'userSpaceOnUse' });
    cp.appendChild(node('polygon', { points: polygon(points) }));
    defs.appendChild(cp);
    return 'url(#' + id + ')';
  }
  function triangleImage(src, dest, which, group, region, index) {
    const t = which === 0 ? [dest[0], dest[1], dest[3]] : [dest[1], dest[2], dest[3]];
    const triangleId = 'poster-fit-triangle-' + index + '-' + which;
    const wrapper = node('g', { 'clip-path': clip(triangleId, t) });
    const a = which === 0 ? dest[1][0] - dest[0][0] : dest[2][0] - dest[3][0];
    const b = which === 0 ? dest[1][1] - dest[0][1] : dest[2][1] - dest[3][1];
    const c = which === 0 ? dest[3][0] - dest[0][0] : dest[2][0] - dest[1][0];
    const d = which === 0 ? dest[3][1] - dest[0][1] : dest[2][1] - dest[1][1];
    const e = which === 0 ? dest[0][0] : dest[1][0] - a;
    const f = which === 0 ? dest[0][1] : dest[1][1] - b;
    wrapper.appendChild(node('image', {
      class: 'poster-artwork', href: src, x: 0, y: 0, width: 1, height: 1,
      preserveAspectRatio: 'none',
      transform: 'matrix(' + [a, b, c, d, e, f].join(' ') + ')',
      'aria-hidden': 'true'
    }));
    group.appendChild(wrapper);
  }

  let overlay = null;
  let selected = 0;
  let statusLabel = null;
  function render() {
    defs.replaceChildren();
    art.replaceChildren();
    current.forEach((rec, index) => {
      clickable[index].setAttribute('points', polygon(rec.shape));
      const src = sources.get(index);
      if (!src) return;
      const posterGroup = node('g', {
        'clip-path': clip('poster-fit-outline-' + index, rec.shape)
      });
      triangleImage(src, rec.quad, 0, posterGroup, rec.shape, index);
      triangleImage(src, rec.quad, 1, posterGroup, rec.shape, index);
      art.appendChild(posterGroup);
    });
    oldArtwork.style.display = 'none';
    if (!editing) return;
    drawHandles();
  }
  function store() {
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (_) {}
  }
  function position(event) {
    const rect = svg.getBoundingClientRect();
    return [
      (event.clientX - rect.left) * WIDTH / rect.width,
      (event.clientY - rect.top) * HEIGHT / rect.height
    ];
  }
  function select(index) {
    selected = index;
    const list = document.getElementById('poster-edit-select');
    if (list) list.value = String(index);
    if (statusLabel) statusLabel.textContent =
      'Poster ' + (index + 1) + (sources.has(index) ? ' · déplacer ou ajuster les coins' : ' · image manquante');
    drawHandles();
  }
  function drawHandles() {
    if (!overlay) return;
    overlay.replaceChildren();
    const rec = current[selected];
    overlay.appendChild(node('polygon', {
      points: polygon(rec.shape), fill: 'rgba(255,23,59,.10)',
      stroke: '#ff173b', 'stroke-width': 3,
      'vector-effect': 'non-scaling-stroke',
      'stroke-dasharray': '6 3', 'pointer-events': 'none'
    }));
    if (rec.shape.length === 4) {
      rec.quad.forEach((p, index) => {
        const handle = node('circle', {
          cx: p[0], cy: p[1], r: 9, fill: '#fff4fa', stroke: '#ff173b',
          'stroke-width': 3, 'vector-effect': 'non-scaling-stroke',
          'data-poster-handle': index,
          style: 'cursor:grab;touch-action:none;pointer-events:all'
        });
        overlay.appendChild(handle);
      });
    }
  }

  if (editing) {
    // Keep touch and Pencil drags on posters from triggering page gestures.
    svg.style.touchAction = 'none';
    const panel = document.createElement('section');
    panel.id = 'poster-edit-panel';
    panel.setAttribute('aria-label', 'Réglage des affiches');
    panel.style.cssText =
      'position:fixed;z-index:99999;top:54px;left:12px;max-width:min(360px,calc(100vw - 24px));' +
      'background:#fff4fa;color:#ff173b;border:2px solid #ff173b;padding:12px;' +
      'box-shadow:3px 3px 0 #ff173b;font:14px/1.35 system-ui,sans-serif';
    const heading = document.createElement('strong');
    heading.textContent = 'Replacer les posters';
    heading.style.display = 'block';
    heading.style.marginBottom = '8px';
    panel.appendChild(heading);
    const chooser = document.createElement('select');
    chooser.id = 'poster-edit-select';
    chooser.setAttribute('aria-label', 'Choisir un poster');
    chooser.style.cssText = 'width:100%;color:#7e1b35;background:white;padding:5px;border:1px solid #ff173b;';
    clickable.forEach((_, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = 'Poster ' + (i + 1) + (sources.get(i) ? '' : ' (image manquante)');
      chooser.appendChild(opt);
    });
    chooser.addEventListener('change', () => select(Number(chooser.value)));
    panel.appendChild(chooser);
    statusLabel = document.createElement('p');
    statusLabel.style.cssText = 'margin:8px 0;font-size:12px';
    panel.appendChild(statusLabel);
    const help = document.createElement('p');
    help.textContent = 'En mode Play : glisse l’affiche pour la déplacer. Glisse les ronds pour ajuster ses coins.';
    help.style.cssText = 'margin:8px 0;font-size:12px';
    panel.appendChild(help);
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    function button(label, callback) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText =
        'border:1px solid #ff173b;color:#ff173b;background:white;padding:6px 8px;font-size:12px;';
      b.addEventListener('click', callback);
      controls.appendChild(b);
      return b;
    }
    button('Réinitialiser ce poster', () => {
      current[selected] = {
        shape: copyPoints(originals[selected].shape),
        quad: copyPoints(originals[selected].quad)
      };
      store(); render();
    });
    button('Tout réinitialiser', () => {
      originals.forEach((rec, i) => {
        current[i] = { shape: copyPoints(rec.shape), quad: copyPoints(rec.quad) };
      });
      store(); render();
    });
    button('Copier les positions', async () => {
      const payload = current.map((rec, i) => ({
        poster: i + 1, image: sources.get(i) || null,
        corners: rec.quad, visibleShape: rec.shape
      }));
      const json = JSON.stringify(payload, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        statusLabel.textContent = 'Positions copiées ! Tu peux me les envoyer ici.';
      } catch (_) {
        const area = document.createElement('textarea');
        area.value = json;
        area.style.cssText = 'display:block;width:100%;height:95px;max-width:310px;margin-top:8px;';
        panel.appendChild(area);
        area.focus(); area.select();
        statusLabel.textContent = 'Copie le texte ci-dessous pour me l’envoyer.';
      }
    });
    panel.appendChild(controls);
    document.body.appendChild(panel);

    overlay = node('g', { id: 'poster-fit-edit-handles' });
    svg.appendChild(overlay);
    let drag = null;
    svg.addEventListener('pointerdown', event => {
      const handle = event.target.closest('[data-poster-handle]');
      const poster = event.target.closest('polygon[data-type="poster"]');
      if (!handle && !poster) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (poster) select(Number(poster.dataset.index));
      const corner = handle ? Number(handle.getAttribute('data-poster-handle')) : null;
      const start = position(event);
      drag = {
        index: selected, corner, start,
        oldShape: copyPoints(current[selected].shape),
        oldQuad: copyPoints(current[selected].quad)
      };
    }, true);
    svg.addEventListener('click', event => {
      if (event.target.closest('polygon[data-type="poster"],[data-poster-handle]')) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
    }, true);
    window.addEventListener('pointermove', event => {
      if (!drag) return;
      event.preventDefault();
      const point = position(event);
      const dx = Math.round((point[0] - drag.start[0]) * 10) / 10;
      const dy = Math.round((point[1] - drag.start[1]) * 10) / 10;
      if (drag.corner === null) {
        current[drag.index].shape = drag.oldShape.map(p => [p[0] + dx, p[1] + dy]);
        current[drag.index].quad = drag.oldQuad.map(p => [p[0] + dx, p[1] + dy]);
      } else {
        current[drag.index].quad[drag.corner] = [
          drag.oldQuad[drag.corner][0] + dx,
          drag.oldQuad[drag.corner][1] + dy
        ];
        // Ordinary four-corner posters: the clickable area follows the artwork.
        if (drag.oldShape.length === 4)
          current[drag.index].shape = copyPoints(current[drag.index].quad);
      }
      render();
    }, { passive: false });
    const finish = () => { if (drag) { drag = null; store(); } };
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    select(0);
  }
  render();
})();