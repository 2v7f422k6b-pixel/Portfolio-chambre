/* Poster fitting: respect the hand-drawn frames, their perspective and their click zones.
   Optional calibration UI: open the portfolio with ?posterEdit=1. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg) return;
  const oldArtwork = svg.querySelector('.poster-artworks');
  // These three prints are no longer displayed in the bedroom. The gallery
  // files and original poster numbering remain untouched.
  const removedPosterIds = new Set([3, 9, 16, 18]); // posters 4, 10, 17 and 19
  if (!oldArtwork) return;
  const allPosters = Array.from(svg.querySelectorAll('polygon[data-type="poster"]'));
  const clickable = allPosters.filter(el => !removedPosterIds.has(Number(el.dataset.index)));
  const posterIds = clickable.map(el => Number(el.dataset.index));
  if (clickable.length !== 15) return;
  // Eliminate stale fallback SVG elements as well, including cached HTML.
  allPosters.filter(el => removedPosterIds.has(Number(el.dataset.index))).forEach(el => el.remove());
  oldArtwork.querySelectorAll('image').forEach(image => {
    const match = (image.getAttribute('clip-path') || '').match(/redraw-post-(\d+)/);
    if (match && removedPosterIds.has(Number(match[1]))) image.remove();
  });

  const NS = 'http://www.w3.org/2000/svg';
  const WIDTH = 1670, HEIGHT = 942;
  const KEY = 'nana-poster-alignment-v1';
  const COLLECTION_KEY = 'nana-poster-collection-v1';
  const BASE_COUNT = clickable.length;
  const hiddenPosters = new Set();
  let refreshChooser = () => {};
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
    Object.entries(attributes || {}).forEach(([name, value]) => {
      if(tag==='image'&&name==='href'&&window.NanaResources)window.NanaResources.setSource(el,String(value));
      else el.setAttribute(name,String(value));
    });
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
  // Poster 12 (index 11) uses the castle re-uploaded by the artist.
  const sources = new Map();
  oldArtwork.querySelectorAll('image').forEach(image => {
    const match = (image.getAttribute('clip-path') || '').match(/redraw-post-(\d+)/);
    if (match) sources.set(Number(match[1]), image.getAttribute('data-resource-href')||image.getAttribute('href'));
  });
  const originals = clickable.map((el, index) => {
    const shape = parsePoints(el.getAttribute('points'));
    return { shape, quad: quadFor(shape, posterIds[index]) };
  });
  const current = originals.map(rec => ({
    shape: copyPoints(rec.shape), quad: copyPoints(rec.quad)
  }));
  // Published alignment supplied by the artist on 9 November 2026.
  // Local editor drafts take priority; reset returns to this published layout.
  const firstCalibration = [
    [[[358.4,133.1],[426.4,157.1],[427.4,271.1],[358.4,247.1]],[[358.4,133.1],[426.4,157.1],[427.4,271.1],[409.4,266.1],[404.4,227.1],[385.4,209.1],[358.4,209.1]]], // Poster 1
    [[[342.5,-8.1],[450,28.9],[448,173.3],[341.9,145.5]],null], // Poster 2
    [[[481.8,39.3],[564,72],[565,243],[482.6,224.3]],null], // Poster 3
    null, // Poster 4
    [[[766.4,126.6],[840.8,105.80000000000001],[838.3000000000001,240.3],[768.7,250.2]],null], // Poster 5
    [[[350.6,234],[448.9,249.6],[446,407.5],[350.9,403.3]],null], // Poster 6
    [[[478.1,268.8],[560,282],[560,399],[477.7,394.1]],null], // Poster 7
    [[[595.7,258],[672.3,251.8],[671.7,383.6],[595.6,385.3]],null], // Poster 8
    [[[674.9,275],[769.7,268],[773,389.5],[674.9,394]],null], // Poster 9
    null, // Poster 10
    [[[766.3,286.4],[844.3,280.4],[844.8,414.9],[766.4,416.59999999999997]],null], // Poster 11
    [[[677.7999999999998,352.8],[757.1999999999999,349.59999999999997],[756.4999999999999,472.3999999999999],[676.3999999999999,473.09999999999997]],null], // Poster 12
    [[[681.8000000000001,254.8],[752.7,247.1],[753.5,343.50000000000006],[679.1,347.00000000000006]],null], // Poster 13
    [[[778.8,439.40000000000003],[838.2,438.20000000000005],[836.3,538.7],[779.2,535.4]],null], // Poster 14
    [[[1307,35.1],[1446.1999999999998,6],[1447,135.5],[1309.3,157.1]],null], // Poster 15
    [[[1463,37],[1595,12],[1597,211],[1464,227]],null], // Poster 16
    null, // Poster 17
    [[[599.4,43.3],[721.8,12.5],[724.7,208.4],[599.7,224.4]],null], // Poster 18
    null // Poster 19
  ];
  posterIds.forEach((posterId, index) => {
    const [quad, shape] = firstCalibration[posterId];
    originals[index] = {quad:copyPoints(quad),shape:copyPoints(shape || quad)};
    current[index] = {quad:copyPoints(quad),shape:copyPoints(shape || quad)};
  });
  function validPoints(points, length) {
    return Array.isArray(points) && points.length === length &&
      points.every(p => Array.isArray(p) && p.length === 2 &&
        p.every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 10000));
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // Keep previous layouts from both the 19- and 16-poster editor versions.
    const previousPosterIds = [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15,17];
    if (Array.isArray(saved) && [current.length, 16, 19].includes(saved.length)) {
      current.forEach((_, index) => {
        const originalId = posterIds[index];
        const sourceIndex = saved.length === 19 ? originalId :
          saved.length === 16 ? previousPosterIds.indexOf(originalId) : index;
        const rec = saved[sourceIndex];
        if (rec && validPoints(rec.shape, originals[index].shape.length) &&
          validPoints(rec.quad, 4)) {
          current[index] = { shape: copyPoints(rec.shape), quad: copyPoints(rec.quad) };
        }
      });
    }
  } catch (_) { /* Browsers can disable localStorage. The default fit still works. */ }

  // Additions are independent from the original 15-poster alignment format.
  function addPosterRecord(entry) {
    if(!entry || !Number.isInteger(entry.id) || entry.id<19 || posterIds.includes(entry.id) ||
       !validPoints(entry.shape,4) || !validPoints(entry.quad,4) ||
       typeof entry.src!=='string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(entry.src)) return false;
    const hit=node('polygon',{'data-type':'poster','data-index':entry.id,points:polygon(entry.shape),tabindex:0,'aria-label':'Poster '+(entry.id+1)});
    svg.appendChild(hit);clickable.push(hit);posterIds.push(entry.id);sources.set(entry.id,entry.src);
    originals.push({shape:copyPoints(entry.shape),quad:copyPoints(entry.quad)});
    current.push({shape:copyPoints(entry.shape),quad:copyPoints(entry.quad)});
    return true;
  }
  try {
    const collection=JSON.parse(localStorage.getItem(COLLECTION_KEY)||'null');
    if(collection) {
      for(const id of collection.hidden||[])if(Number.isInteger(id))hiddenPosters.add(id);
      for(const entry of collection.added||[])addPosterRecord(entry);
    }
  } catch (_) {}
  function openAddedPoster(event) {
    const hit=event.target.closest?.('polygon[data-type="poster"]');
    if(editing||!hit||Number(hit.dataset.index)<19)return;
    if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
    event.preventDefault();event.stopImmediatePropagation();
    const src=sources.get(Number(hit.dataset.index));
    if(src && typeof window.openWindow==='function')window.openWindow('Poster','<img src="'+src+'" alt="Poster" style="display:block;max-width:100%;max-height:75dvh;object-fit:contain;margin:auto">');
  }
  svg.addEventListener('click',openAddedPoster,true);
  svg.addEventListener('keydown',openAddedPoster,true);

  const art = node('g', { class: 'poster-perspective-artworks', 'pointer-events': 'none' });
  const tapeLayer = node('g', { class: 'poster-tape-layer', 'pointer-events': 'none' });
  const defs = node('defs');
  // Draw each outline directly after its artwork. Subsequent, foreground posters
  // paint over the earlier outlines instead of showing two borders at overlaps.
  oldArtwork.after(defs, art, tapeLayer);
  const borderStyle = document.createElement('style');
  borderStyle.id = 'poster-handdrawn-outlines-style';
  borderStyle.textContent = [
    '#hotspots .poster-glowy-handline { fill:none; stroke:#ff173b; stroke-width:.85;',
    'stroke-linecap:round; stroke-linejoin:round; pointer-events:none!important;',
    'filter:drop-shadow(0 0 1.15px rgba(255,23,59,.35)); }',
    'html[data-theme="night"] #hotspots .poster-glowy-handline {',
    'stroke:#091329; opacity:1; filter:drop-shadow(0 0 .8px rgba(9,19,41,.18)); }',
  ].join(' ');
  document.head.appendChild(borderStyle);
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


  // Tape placement is keyed by the ORIGINAL poster numbers, so removing
  // a poster never shifts tape to its neighbor. Values: 0=upper-left, 1=upper-right.
  const tapeCorners = {
    1:[0], 2:[0,1], 3:[1], 5:[0], 6:[0,1],
    7:[1], 8:[0], 9:[1], 11:[0,1], 13:[0],
    14:[1], 15:[0,1], 16:[1], 18:[0]
  };
  const tapeArt = [
    { src:'assets/decor/scotch-1.svg', nightSrc:'assets/decor/scotch-1-nuit.svg', width:208, height:77 },
    { src:'assets/decor/scotch-2.svg', nightSrc:'assets/decor/scotch-2-nuit.svg', width:194, height:89 }
  ];
  const isPosterNight = () => document.documentElement.getAttribute('data-theme') === 'night';
  function syncPosterTapeTheme() {
    const night = isPosterNight();
    tapeLayer.querySelectorAll('.poster-handdrawn-tape').forEach(image => {
      const source = image.getAttribute(night ? 'data-night-src' : 'data-day-src');
      if(source){
        if(window.NanaResources)window.NanaResources.setSource(image,source);
        else image.setAttribute('href',source);
      }
    });
  }
  new MutationObserver(syncPosterTapeTheme).observe(document.documentElement, {
    attributes:true, attributeFilter:['data-theme']
  });
  function unit(vector) {
    const length = Math.hypot(vector[0], vector[1]) || 1;
    return vector.map(value => value / length);
  }
  function renderTape(posterNumber, corners) {
    const anchors = tapeCorners[posterNumber];
    if (!anchors || !sources.has(posterNumber - 1)) return;
    const [tl, tr, , bl] = corners;
    const right = unit([tr[0]-tl[0], tr[1]-tl[1]]);
    const down = unit([bl[0]-tl[0], bl[1]-tl[1]]);
    const topLength = Math.hypot(tr[0]-tl[0],tr[1]-tl[1]);
    const height = Math.hypot(bl[0]-tl[0],bl[1]-tl[1]);
    const widthOnWall = Math.min(45,Math.max(19,Math.min(topLength * .37,height * .28)));
    anchors.forEach((corner, position) => {
      const tape = tapeArt[(posterNumber + position) % tapeArt.length];
      const angle = (corner === 0 ? 34 : -34) * Math.PI / 180;
      // Work in the poster's own horizontal/vertical basis to match wall skew.
      const xAxis = [
        Math.cos(angle)*right[0] + Math.sin(angle)*down[0],
        Math.cos(angle)*right[1] + Math.sin(angle)*down[1]
      ];
      const yAxis = [
        -Math.sin(angle)*right[0] + Math.cos(angle)*down[0],
        -Math.sin(angle)*right[1] + Math.cos(angle)*down[1]
      ];
      const center = corner === 0
        ? [tl[0] + .06*topLength*right[0], tl[1] + .06*topLength*right[1]]
        : [tr[0] - .06*topLength*right[0], tr[1] - .06*topLength*right[1]];
      const h = widthOnWall * tape.height / tape.width;
      const a = xAxis[0] * widthOnWall / tape.width;
      const b = xAxis[1] * widthOnWall / tape.width;
      const c = yAxis[0] * h / tape.height;
      const d = yAxis[1] * h / tape.height;
      const e = center[0] - a*tape.width/2 - c*tape.height/2;
      const f = center[1] - b*tape.width/2 - d*tape.height/2;
      tapeLayer.appendChild(node('image',{
        class:'poster-handdrawn-tape', href:isPosterNight() ? tape.nightSrc : tape.src,
        'data-day-src':tape.src, 'data-night-src':tape.nightSrc,
        x:0,y:0,width:tape.width,height:tape.height,
        preserveAspectRatio:'none',
        transform:'matrix(' + [a,b,c,d,e,f].join(' ') + ')',
        'data-poster-tape':posterNumber,'aria-hidden':'true',
        'pointer-events':'none'
      }));
    });
  }

  // A deterministic hand-drawn line follows each actual visible silhouette.
  // The corners stay sharp; small variations along each edge imitate a stylus.
  function wobblyOutline(points, posterId) {
    const fmt = n => Number(n.toFixed(2));
    const path = ['M ' + fmt(points[0][0]) + ' ' + fmt(points[0][1])];
    points.forEach((start, edge) => {
      const end = points[(edge + 1) % points.length];
      const dx = end[0] - start[0], dy = end[1] - start[1];
      const length = Math.hypot(dx, dy);
      const count = Math.max(1, Math.round(length / 19));
      const nx = length ? -dy / length : 0, ny = length ? dx / length : 0;
      const stations = [start];
      for (let i = 1; i < count; i++) {
        const t = i / count;
        const deviation = .83 * Math.sin((posterId + 1) * 11.7 + edge * 4.1 + i * 2.7)
          + .24 * Math.sin((posterId + 1) * 6.3 + edge * 9.2 + i * 4.7);
        stations.push([
          start[0] + dx * t + nx * deviation,
          start[1] + dy * t + ny * deviation
        ]);
      }
      stations.push(end);
      if (stations.length === 2) {
        path.push('L ' + fmt(end[0]) + ' ' + fmt(end[1]));
      } else {
        for (let i = 1; i < stations.length - 1; i++) {
          const p = stations[i], next = stations[i + 1];
          const target = i === stations.length - 2
            ? next : [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2];
          path.push('Q ' + fmt(p[0]) + ' ' + fmt(p[1]) +
            ' ' + fmt(target[0]) + ' ' + fmt(target[1]));
        }
      }
    });
    return path.join(' ') + ' Z';
  }

  let overlay = null;
  let selected = 0;
  let statusLabel = null;
  function render() {
    defs.replaceChildren();
    art.replaceChildren();
    tapeLayer.replaceChildren();
    current.forEach((rec, index) => {
      clickable[index].setAttribute('points', polygon(rec.shape));
      const hidden=hiddenPosters.has(posterIds[index]);
      clickable[index].style.display=hidden?'none':'';
      clickable[index].setAttribute('data-type',hidden?'poster-hidden':'poster');
      if(hidden)return;
      const src = sources.get(posterIds[index]);
      if (!src) return;
      const posterGroup = node('g', {
        'clip-path': clip('poster-fit-outline-' + index, rec.shape)
      });
      triangleImage(src, rec.quad, 0, posterGroup, rec.shape, index);
      triangleImage(src, rec.quad, 1, posterGroup, rec.shape, index);
      art.appendChild(posterGroup);
      art.appendChild(node('path', {
        class: 'poster-glowy-handline',
        'data-poster-outline-index': posterIds[index],
        d: wobblyOutline(rec.shape, posterIds[index]),
        'pointer-events': 'none'
      }));
      art.appendChild(node('path', {
        class: 'poster-white-outline room-hover-outline',
        'data-poster-white-index': posterIds[index],
        d: wobblyOutline(rec.shape, posterIds[index]),
        'pointer-events': 'none'
      }));
      renderTape(posterIds[index] + 1, rec.quad);
    });
    oldArtwork.style.display = 'none';
    if (!editing) return;
    drawHandles();
  }
  function store() {
    try {
      const collection={hidden:[...hiddenPosters],added:current.slice(BASE_COUNT).map((rec,i)=>({
        id:posterIds[BASE_COUNT+i],src:sources.get(posterIds[BASE_COUNT+i]),shape:rec.shape,quad:rec.quad
      }))};
      localStorage.setItem(COLLECTION_KEY,JSON.stringify(collection));
      localStorage.setItem(KEY, JSON.stringify(current.slice(0,BASE_COUNT)));
      return true;
    } catch (_) {
      if(statusLabel)statusLabel.textContent='Sauvegarde impossible : le navigateur manque de place. Exporte les réglages avant de quitter.';
      return false;
    }
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
    refreshChooser();
    drawHandles();
  }
  function drawHandles() {
    if (!overlay) return;
    overlay.replaceChildren();
    // An editor-only transparent pick layer sits ABOVE other interactive room objects.
    current.forEach((entry, index) => {
      if (index === selected || hiddenPosters.has(posterIds[index])) return;
      overlay.appendChild(node('polygon', {
        'data-poster-pick': index,
        points: polygon(entry.shape),
        style: 'fill:rgba(255,23,59,.002)!important;stroke:transparent!important;pointer-events:all!important;cursor:grab;touch-action:none'
      }));
    });
    const rec = current[selected];
    if(!rec || hiddenPosters.has(posterIds[selected]))return;
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
    refreshChooser=()=>{
      chooser.replaceChildren();
      clickable.forEach((_,i)=>{
        const opt=document.createElement('option');opt.value=String(i);
        opt.textContent='Poster '+(posterIds[i]+1)+(hiddenPosters.has(posterIds[i])?' (supprimé)':'')+(sources.has(posterIds[i])?'':' (image manquante)');
        chooser.appendChild(opt);
      });
      chooser.value=String(selected);
      const remove=document.getElementById('poster-delete-selected');
      if(remove)remove.textContent=hiddenPosters.has(posterIds[selected])?'Restaurer ce poster':'Supprimer ce poster';
    };
    refreshChooser();
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
    const upload=document.createElement('input');upload.type='file';upload.accept='image/jpeg,image/png,image/webp';upload.hidden=true;interior.appendChild(upload);
    const addButton=button('Ajouter un poster',()=>upload.click());
    const removeButton=button('Supprimer ce poster',()=>{
      const id=posterIds[selected];
      if(hiddenPosters.has(id))hiddenPosters.delete(id);else hiddenPosters.add(id);
      store();refreshChooser();render();
    });
    removeButton.id='poster-delete-selected';
    upload.addEventListener('change',async()=>{
      const file=upload.files?.[0];if(!file)return;addButton.disabled=true;
      try {
        if(!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choisis une image JPEG, PNG ou WebP.');
        const bitmap=await createImageBitmap(file);const scale=Math.min(1,1024/Math.max(bitmap.width,bitmap.height));
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
        const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
        const ratio=bitmap.height/bitmap.width;bitmap.close();
        const width=110,height=Math.min(220,Math.max(50,width*ratio));
        const shape=[[850,100],[960,100],[960,100+height],[850,100+height]];
        const id=Math.max(18,...posterIds)+1;
        if(!addPosterRecord({id,src:canvas.toDataURL('image/jpeg',.85),shape,quad:shape}))throw new Error('Impossible d’ajouter cette image.');
        selected=current.length-1;refreshChooser();render();select(selected);
        if(store())statusLabel.textContent='Poster ajouté : déplace-le et ajuste ses coins, puis exporte ou publie depuis l’atelier.';
      } catch(error){statusLabel.textContent=error.message||'Ajout impossible.';}
      finally{upload.value='';addButton.disabled=false;}
    });
    button('Enregistrer les modifications',()=>{
      if(store())statusLabel.textContent='Brouillon enregistré. Retourne à l’atelier pour exporter ou publier.';
    });
    button('Réinitialiser ce poster', () => {
      current[selected] = {
        shape: copyPoints(originals[selected].shape),
        quad: copyPoints(originals[selected].quad)
      };
      store(); render();
    });
    button('Tout réinitialiser', () => {
      hiddenPosters.clear();refreshChooser();
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
    const hint=document.createElement('p');hint.textContent='Exporte ou publie depuis l’atelier pour rendre tes ajouts et suppressions visibles par tous.';hint.style.cssText='font-size:12px;margin:8px 0';interior.appendChild(hint);
    panel.style.maxHeight='calc(100dvh - 70px)';panel.style.overflowY='auto';
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
  // Only the active poster becomes white. Since borders sit directly after
  // their own artwork, foreground posters still mask borders behind them.
  let hoveredPoster = null;
  let focusedPoster = null;
  let activePoster = null;
  function showPosterOutline() {
    const next = hoveredPoster !== null ? hoveredPoster : focusedPoster;
    if (activePoster === next) return;
    const previous = art.querySelector('.poster-hover-white');
    if (previous) previous.classList.remove('poster-hover-white');
    activePoster = next;
    if (next !== null) {
      const outline = art.querySelector('[data-poster-white-index="' + next + '"]');
      if (outline) outline.classList.add('poster-hover-white');
    }
  }
  if (!editing) {
    svg.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const polygon = event.target.closest?.('polygon[data-type="poster"]');
      const next = polygon ? Number(polygon.dataset.index) : null;
      if (next !== hoveredPoster) { hoveredPoster = next; showPosterOutline(); }
    }, { passive: true });
    svg.addEventListener('pointerleave', () => {
      hoveredPoster = null;
      showPosterOutline();
    });
    svg.addEventListener('focusin', event => {
      const polygon = event.target.closest?.('polygon[data-type="poster"]');
      focusedPoster = polygon ? Number(polygon.dataset.index) : null;
      showPosterOutline();
    });
    svg.addEventListener('focusout', () => {
      focusedPoster = null;
      showPosterOutline();
    });
  }
  render();
})();
