/* Poster fitting: respect the hand-drawn frames, their perspective and their click zones.
   Optional calibration UI: open the portfolio with ?posterEdit=1. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg) return;
  const oldArtwork = svg.querySelector('.poster-artworks');
  // These three prints are no longer displayed in the bedroom. The gallery
  // files and original poster numbering remain untouched.
  const removedPosterIds = new Set([3, 16, 18]); // posters 4, 17 and 19
  if (!oldArtwork) return;
  const allPosters = Array.from(svg.querySelectorAll('polygon[data-type="poster"]'));
  const clickable = allPosters.filter(el => !removedPosterIds.has(Number(el.dataset.index)));
  const posterIds = clickable.map(el => Number(el.dataset.index));
  if (clickable.length !== 16) return;
  // Eliminate stale fallback SVG elements as well, including cached HTML.
  allPosters.filter(el => removedPosterIds.has(Number(el.dataset.index))).forEach(el => el.remove());
  oldArtwork.querySelectorAll('image').forEach(image => {
    const match = (image.getAttribute('clip-path') || '').match(/redraw-post-(\\d+)/);
    if (match && removedPosterIds.has(Number(match[1]))) image.remove();
  });

  const NS = 'http://www.w3.org/2000/svg';
  const WIDTH = 1670, HEIGHT = 942;
  const KEY = 'nana-poster-alignment-v1';
  const editing = new URLSearchParams(location.search).get('posterEdit') === '1';

  if (editing) {
    document.documentElement.classList.add('poster-edit-mode');
    const style = document.createElement('style');
    style.id = 'poster-edit-viewport-fit';
    style.textContent = [
      'html.poster-edit-mode #play-viewport{display:flex!important;align-items:center!important;justify-content:center!important;overflow:auto!important}',
      'html.poster-edit-mode #play-scene{width:min(100vw,calc((100dvh - var(--menubar))*1670/942))!important;aspect-ratio:1670/942!important;height:auto!important;margin:auto!important;flex:0 0 auto!important}',
      'html.poster-edit-mode #room-img,html.poster-edit-mode #room-night{object-fit:contain!important}',
      'html.poster-edit-mode #hotspots polygon[data-type="poster"]{pointer-events:none!important}'
    ].join('\n');
    document.head.appendChild(style);
  }


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
    return { shape, quad: quadFor(shape, posterIds[index]) };
  });
  const current = originals.map(rec => ({
    shape: copyPoints(rec.shape), quad: copyPoints(rec.quad)
  }));
  // First alignment supplied by the user. Local browser positions take priority.
  const firstCalibration = [[[[228,5],[296,29],[297,143],[228,119]],[[228,5],[296,29],[297,143],[279,138],[274,99],[255,81],[228,81]]],[[[331,0],[437,31],[438,237],[331,211]],null],[[[491,39],[564,72],[565,243],[491,224]],null],[[[1436.4,237.5],[1559.4,205.5],[1560.4,402.5],[1436.4,421.5]],null],[[[703.7,123],[774.8,128.3],[775.2,239.6],[706,246.6]],null],[[[352,255],[428,274],[428,408],[350,403]],null],[[[477.8,258.9],[560,282],[560,399],[477.7,394.1]],null],[[[595.7,258],[672.3,251.8],[671.7,383.6],[595.6,385.3]],null],[[[674.9,275],[769.7,268],[773,389.5],[674.9,394]],null],[[[773.2,217.4],[846.9,211.3],[846.9,297.1],[778.8,303.6]],null],[[[762.9,334],[840.9,328],[841.4,462.5],[764.8,464.2]],null],[[[361,434],[411,437],[411,506],[361,506]],null],[[[680.1,403.6],[738.6,399.5],[739.8,476],[681.5,476.3]],null],[[[785.8,479.3],[845.2,478.1],[843.3,578.6],[785.6,579.2]],null],[[[1307,35.1],[1425,10.1],[1426,201.1],[1307,216.1]],null],[[[1463,37],[1595,12],[1597,211],[1464,227]],null],[[[1354.6,247],[1425.6,237],[1428.6,372],[1354.6,383]],[[1354.6,247],[1425.6,237],[1428.6,345],[1364.6,350],[1361.6,372],[1354.6,373]]],[[[610.4,121.2],[717.8,108.1],[717.2,265],[610.3,272.2]],null],[[[1466.1,265],[1608.1,252],[1609.1,434],[1466.1,449]],[[1466.1,265],[1608.1,252],[1609.1,369],[1593.1,385],[1609.1,402],[1609.1,434],[1556.1,434],[1559.1,343],[1466.1,349]]]];
  posterIds.forEach((posterId, index) => {
    const [quad, shape] = firstCalibration[posterId];
    current[index] = {quad:copyPoints(quad),shape:copyPoints(shape || quad)};
  });
  function validPoints(points, length) {
    return Array.isArray(points) && points.length === length &&
      points.every(p => Array.isArray(p) && p.length === 2 &&
        p.every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 10000));
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(saved) && (saved.length === current.length || saved.length === 19)) {
      current.forEach((_, index) => {
        const sourceIndex = saved.length === 19 ? posterIds[index] : index;
        const rec = saved[sourceIndex];
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
      const src = sources.get(posterIds[index]);
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
      'Poster ' + (posterIds[index] + 1) + (sources.has(posterIds[index]) ? ' · déplacer ou ajuster les coins' : ' · image manquante');
    drawHandles();
  }
  function drawHandles() {
    if (!overlay) return;
    overlay.replaceChildren();
    // An editor-only transparent pick layer sits ABOVE other interactive room objects.
    current.forEach((entry, index) => {
      if (index === selected) return;
      overlay.appendChild(node('polygon', {
        'data-poster-pick': index,
        points: polygon(entry.shape),
        style: 'fill:rgba(255,23,59,.002)!important;stroke:transparent!important;pointer-events:all!important;cursor:grab;touch-action:none'
      }));
    });
    const rec = current[selected];
    overlay.appendChild(node('polygon', {
      'data-poster-pick': selected,
      points: polygon(rec.shape),
      style: 'fill:rgba(255,23,59,.09)!important;stroke:#ff173b!important;stroke-width:3;pointer-events:all!important;cursor:grab;touch-action:none'
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
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;touch-action:none;cursor:move;user-select:none';
    const heading = document.createElement('strong');
    heading.textContent = 'Replacer les posters';
    heading.title = 'Glisser ici pour déplacer la boîte';
    heading.style.cssText = 'flex:1;min-width:0';
    header.appendChild(heading);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = '− Réduire';
    toggle.setAttribute('aria-expanded','true');
    toggle.style.cssText = 'border:1px solid #ff173b;background:white;color:#ff173b;padding:4px 6px;font-size:12px;white-space:nowrap;cursor:pointer';
    header.appendChild(toggle);
    panel.appendChild(header);
    const interior = document.createElement('div');
    panel.appendChild(interior);
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded',String(expanded));
      toggle.textContent = expanded ? '− Réduire' : '+ Ouvrir';
      interior.hidden = !expanded;
    });
    // Move controls are explicit as well as draggable: dragging alone is not
    // reliable on every browser/iPad, and the box used to obscure left posters.
    const controlsBar = document.createElement('div');
    controlsBar.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap';
    const dragGrip = document.createElement('button');
    dragGrip.type = 'button';
    dragGrip.textContent = '✥ Déplacer la boîte';
    dragGrip.title = 'Garde appuyé et fais glisser';
    dragGrip.style.cssText =
      'flex:1;min-width:135px;border:1px solid #ff173b;color:#ff173b;' +
      'background:#fff;padding:7px 8px;font-size:12px;cursor:move;' +
      'touch-action:none;user-select:none;-webkit-user-select:none';
    controlsBar.appendChild(dragGrip);
    const moveSide = document.createElement('button');
    moveSide.type = 'button';
    moveSide.textContent = '→ À droite';
    moveSide.title = 'Placer la boîte sur le côté opposé';
    moveSide.style.cssText =
      'border:1px solid #ff173b;color:#ff173b;background:#fff;' +
      'padding:7px 8px;font-size:12px;cursor:pointer';
    controlsBar.appendChild(moveSide);
    panel.insertBefore(controlsBar, interior);

    const panelPositionKey = 'nana-poster-box-position-v2';
    function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
    function setPanelPosition(left, top) {
      // Use the viewport size instead of layout width, so the whole panel stays reachable.
      const width = panel.getBoundingClientRect().width || 320;
      const height = panel.getBoundingClientRect().height || 180;
      panel.style.setProperty('left', clamp(left, 0, Math.max(0, innerWidth - width - 4)) + 'px', 'important');
      panel.style.setProperty('top', clamp(top, 0, Math.max(0, innerHeight - Math.min(48, height))) + 'px', 'important');
      panel.style.setProperty('right', 'auto', 'important');
      panel.style.setProperty('bottom', 'auto', 'important');
      const isRight = panel.getBoundingClientRect().left > innerWidth / 2 - width / 2;
      moveSide.textContent = isRight ? '← À gauche' : '→ À droite';
    }
    function persistPanelPosition() {
      try {
        const rect = panel.getBoundingClientRect();
        localStorage.setItem(panelPositionKey, JSON.stringify([rect.left, rect.top]));
      } catch (_) { /* Some browsers disable local storage. */ }
    }
    function positionPanelOnSide(right) {
      setPanelPosition(right ? innerWidth - panel.offsetWidth - 12 : 12, 54);
      persistPanelPosition();
    }
    moveSide.addEventListener('click', () => {
      const rect = panel.getBoundingClientRect();
      positionPanelOnSide(rect.left + rect.width / 2 <= innerWidth / 2);
    });
    let panelDrag = null;
    function beginPanelDrag(event) {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest('button') && event.target !== dragGrip) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = panel.getBoundingClientRect();
      panelDrag = { id:event.pointerId, x:event.clientX, y:event.clientY, left:rect.left, top:rect.top };
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch (_) {}
      dragGrip.style.background = '#ffe1ed';
    }
    function movePanelWithPointer(event) {
      if (!panelDrag || event.pointerId !== panelDrag.id) return;
      event.preventDefault();
      setPanelPosition(
        panelDrag.left + event.clientX - panelDrag.x,
        panelDrag.top + event.clientY - panelDrag.y
      );
    }
    function endPanelDrag(event) {
      if (!panelDrag || (event.pointerId !== undefined && event.pointerId !== panelDrag.id)) return;
      panelDrag = null;
      dragGrip.style.background = '#fff';
      persistPanelPosition();
    }
    // The entire header can be grabbed, and there is also a clearly labelled grip.
    header.addEventListener('pointerdown', beginPanelDrag);
    dragGrip.addEventListener('pointerdown', beginPanelDrag);
    window.addEventListener('pointermove', movePanelWithPointer, { passive:false, capture:true });
    window.addEventListener('pointerup', endPanelDrag, true);
    window.addEventListener('pointercancel', endPanelDrag, true);
    window.addEventListener('blur', () => endPanelDrag({}));
    // Also permit keyboard control for the grip.
    dragGrip.addEventListener('keydown', event => {
      const deltas = { ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20] };
      const d = deltas[event.key];
      if (!d) return;
      event.preventDefault();
      const rect = panel.getBoundingClientRect();
      setPanelPosition(rect.left+d[0],rect.top+d[1]);
      persistPanelPosition();
    });
    const chooser = document.createElement('select');
    chooser.id = 'poster-edit-select';
    chooser.setAttribute('aria-label', 'Choisir un poster');
    chooser.style.cssText = 'width:100%;color:#7e1b35;background:white;padding:5px;border:1px solid #ff173b;';
    clickable.forEach((_, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = 'Poster ' + (posterIds[i] + 1) + (sources.get(posterIds[i]) ? '' : ' (image manquante)');
      chooser.appendChild(opt);
    });
    chooser.addEventListener('change', () => select(Number(chooser.value)));
    interior.appendChild(chooser);
    statusLabel = document.createElement('p');
    statusLabel.style.cssText = 'margin:8px 0;font-size:12px';
    interior.appendChild(statusLabel);
    const help = document.createElement('p');
    help.textContent = 'En mode Play : glisse l’affiche pour la déplacer. Glisse les ronds pour ajuster ses coins.';
    help.style.cssText = 'margin:8px 0;font-size:12px';
    interior.appendChild(help);
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
        poster: posterIds[i] + 1, image: sources.get(posterIds[i]) || null,
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
        interior.appendChild(area);
        area.focus(); area.select();
        statusLabel.textContent = 'Copie le texte ci-dessous pour me l’envoyer.';
      }
    });
    interior.appendChild(controls);
    document.body.appendChild(panel);
    try {
      const restored = JSON.parse(localStorage.getItem(panelPositionKey) || 'null');
      if (Array.isArray(restored) && restored.length === 2 && restored.every(Number.isFinite)) {
        setPanelPosition(restored[0], restored[1]);
      }
    } catch (_) {}


    overlay = node('g', { id: 'poster-fit-edit-handles' });
    svg.appendChild(overlay);
    overlay.style.touchAction = 'none';
    let drag = null;
    svg.addEventListener('pointerdown', event => {
      const handle = event.target.closest('[data-poster-handle]');
      const poster = event.target.closest('polygon[data-type="poster"]');
      const picked = event.target.closest('[data-poster-pick]');
      if (!handle && !poster && !picked) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (poster || picked) select(poster ? posterIds.indexOf(Number(poster.dataset.index)) : Number(picked.getAttribute('data-poster-pick')));
      const corner = handle ? Number(handle.getAttribute('data-poster-handle')) : null;
      const start = position(event);
      drag = {
        index: selected, corner, start,
        oldShape: copyPoints(current[selected].shape),
        oldQuad: copyPoints(current[selected].quad)
      };
    }, true);
    svg.addEventListener('click', event => {
      if (event.target.closest('polygon[data-type="poster"],[data-poster-pick],[data-poster-handle]')) {
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