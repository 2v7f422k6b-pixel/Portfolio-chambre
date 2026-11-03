/* Live iPad clock for Play mode. No changes to the original illustration.
   Open ?ipadClockEdit=1 to drag, rotate, size and tilt the time. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene');
  const hotspots = document.getElementById('hotspots');
  if (!scene || !hotspots || document.getElementById('nana-ipad-clock-layer')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const ROOM_W = 1670, ROOM_H = 942;
  const STORAGE_KEY = 'nana-ipad-clock-placement-v1';
  const editing = new URLSearchParams(location.search).get('ipadClockEdit') === '1';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, String(value)));
    return el;
  };

  // Overlay shares the original 1670 x 942 scene coordinates and follows zoom/scroll.
  const layer = svgEl('svg', {
    id: 'nana-ipad-clock-layer',
    viewBox: '0 0 ' + ROOM_W + ' ' + ROOM_H,
    preserveAspectRatio: 'none',
    'aria-label': 'Heure actuelle sur l’iPad'
  });
  layer.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:7;overflow:visible;pointer-events:none;';
  const group = svgEl('g', { id: 'nana-ipad-clock-transform' });
  const time = svgEl('text', {
    id: 'nana-ipad-time',
    x: 0, y: 0,
    'font-family': '"Nana Trace UI", "Courier New", monospace',
    'font-weight': 400,
    'letter-spacing': '.015em',
    'text-anchor': 'start',
    'paint-order': 'stroke fill',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true'
  });
  const dragArea = svgEl('rect', {
    x: -3, y: -10, width: 42, height: 15,
    fill: 'transparent',
    'pointer-events': editing ? 'all' : 'none'
  });
  dragArea.style.touchAction = 'none';
  if (editing) dragArea.style.cursor = 'grab';
  group.append(time, dragArea);
  layer.append(group);
  scene.appendChild(layer);

  if (!document.getElementById('nana-ipad-clock-style')) {
    const style = document.createElement('style');
    style.id = 'nana-ipad-clock-style';
    style.textContent =
      '#nana-ipad-time{fill:#ff173b;stroke:#fff0f4;stroke-width:.6px;filter:drop-shadow(0 .4px .7px #7b46736b)}' +
      'html[data-theme="night"] #nana-ipad-time{fill:#ffe5f1;stroke:#642c77;stroke-width:.65px}' +
      (editing ? '#nana-ipad-clock-transform rect{stroke:#ff173b;stroke-width:.4;stroke-dasharray:2 2}' : '');
    document.head.appendChild(style);
  }

  function updateTime() {
    const date = new Date();
    time.textContent = String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0');
  }
  updateTime();
  const timer = setInterval(updateTime, 15000);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });

  let position = null;
  let defaults = null;
  let panel = null;

  function render() {
    if (!position) return;
    group.setAttribute('transform',
      'translate(' + position.x + ' ' + position.y + ')' +
      ' rotate(' + position.angle + ') skewX(' + position.skew + ')');
    time.setAttribute('font-size', position.size);
    dragArea.setAttribute('x', -position.size * .23);
    dragArea.setAttribute('y', -position.size * 1.16);
    dragArea.setAttribute('width', position.size * 3.9);
    dragArea.setAttribute('height', position.size * 1.5);
    if (panel) {
      panel.querySelector('[data-ipad-position]').textContent =
        'x ' + position.x.toFixed(1) + ' · y ' + position.y.toFixed(1);
      for (const key of ['size', 'angle', 'skew']) {
        const input = panel.querySelector('[data-ipad-' + key + ']');
        const output = panel.querySelector('[data-ipad-' + key + '-value]');
        input.value = String(position[key]);
        output.textContent = position[key].toFixed(key === 'size' ? 1 : 0) +
          (key === 'size' ? ' px' : '°');
      }
    }
  }

  function save() {
    if (!position) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(position)); } catch (_) {}
  }
  function setSetting(key, value) {
    if (!position || !Number.isFinite(value)) return;
    if (key === 'size') position.size = clamp(value, 4, 60);
    if (key === 'angle') position.angle = clamp(value, -180, 180);
    if (key === 'skew') position.skew = clamp(value, -65, 65);
    render();
    save();
  }

  function buildEditor() {
    panel = document.createElement('aside');
    panel.id = 'nana-ipad-clock-editor';
    panel.setAttribute('aria-label', 'Réglages de l’heure de l’iPad');
    panel.style.cssText =
      'position:fixed;top:66px;right:12px;z-index:9998;' +
      'width:min(272px,calc(100vw - 24px));max-height:calc(100dvh - 88px);' +
      'overflow:auto;box-sizing:border-box;padding:12px;' +
      'background:#fff2fc;color:#ff173b;border:1px solid #ff173b;' +
      'box-shadow:0 3px 12px #6546a644;font:13px Arial,sans-serif;';
    panel.innerHTML =
      '<strong style="font-size:15px">Heure de l’iPad</strong>' +
      '<p style="line-height:1.4;margin:7px 0 12px">Glisse l’heure directement sur l’iPad pour la déplacer.</p>' +
      '<div data-ipad-position style="margin-bottom:10px;font-size:12px"></div>' +
      '<label style="display:block;margin-bottom:12px">Rotation : <output data-ipad-angle-value></output>' +
      '<input data-ipad-angle type="range" min="-180" max="180" step="1" style="display:block;width:100%;accent-color:#ff173b"></label>' +
      '<label style="display:block;margin-bottom:12px">Taille : <output data-ipad-size-value></output>' +
      '<input data-ipad-size type="range" min="4" max="60" step=".5" style="display:block;width:100%;accent-color:#ff173b"></label>' +
      '<label style="display:block;margin-bottom:12px">Perspective : <output data-ipad-skew-value></output>' +
      '<input data-ipad-skew type="range" min="-65" max="65" step="1" style="display:block;width:100%;accent-color:#ff173b"></label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      '<button type="button" data-ipad-copy>Copier les réglages</button>' +
      '<button type="button" data-ipad-reset>Réinitialiser</button></div>' +
      '<small style="display:block;margin-top:9px;line-height:1.3">Réglages conservés sur cet appareil. Copie-les pour les publier pour tous les visiteurs.</small>';
    panel.querySelectorAll('button').forEach(button => {
      button.style.cssText =
        'font:inherit;color:#ff173b;background:white;border:1px solid #ff173b;' +
        'padding:6px 8px;cursor:pointer;';
    });
    document.body.appendChild(panel);
    for (const key of ['angle', 'size', 'skew']) {
      panel.querySelector('[data-ipad-' + key + ']').addEventListener('input', event =>
        setSetting(key, Number(event.target.value)));
    }
    panel.querySelector('[data-ipad-reset]').addEventListener('click', () => {
      position = { ...defaults };
      render();
      save();
    });
    const copyButton = panel.querySelector('[data-ipad-copy]');
    copyButton.addEventListener('click', async () => {
      const copied = JSON.stringify({ ipadClock: true, ...position });
      try {
        await navigator.clipboard.writeText(copied);
        copyButton.textContent = 'Copié ✓';
      } catch (_) {
        window.prompt('Copie les réglages :', copied);
      }
    });
    let active = null;
    function toRoom(event) {
      const rect = layer.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * ROOM_W / rect.width,
        y: (event.clientY - rect.top) * ROOM_H / rect.height
      };
    }
    dragArea.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const p = toRoom(event);
      active = { id: event.pointerId, x: p.x, y: p.y, startX: position.x, startY: position.y };
      dragArea.style.cursor = 'grabbing';
      event.preventDefault();
      event.stopPropagation();
      try { dragArea.setPointerCapture(event.pointerId); } catch (_) {}
    });
    dragArea.addEventListener('pointermove', event => {
      if (!active || active.id !== event.pointerId) return;
      const p = toRoom(event);
      position.x = clamp(active.startX + p.x - active.x, 0, ROOM_W);
      position.y = clamp(active.startY + p.y - active.y, 0, ROOM_H);
      render();
      event.preventDefault();
      event.stopPropagation();
    });
    function finish(event) {
      if (!active || active.id !== event.pointerId) return;
      active = null;
      dragArea.style.cursor = 'grab';
      save();
      event.preventDefault();
      event.stopPropagation();
    }
    dragArea.addEventListener('pointerup', finish);
    dragArea.addEventListener('pointercancel', finish);
  }

  // The existing iPad polygon is traced from the user's transparent IPAD.PNG.
  // Its box gives the clock a responsive placement without manual screen coordinates.
  function initializeFromIpad() {
    if (position) return;
    const ipad = hotspots.querySelector('polygon[data-room-zone-id="ipad"]');
    if (!ipad) return;
    const bounds = ipad.getBBox();
    if (bounds.width < 12 || bounds.height < 8) return;
    defaults = {
      x: +(bounds.x + bounds.width * .67).toFixed(2),
      y: +(bounds.y + bounds.height * .33).toFixed(2),
      size: +clamp(bounds.width * .06, 6, 24).toFixed(2),
      angle: 6,
      skew: -25
    };
    position = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && ['x', 'y', 'size', 'angle', 'skew'].every(k => Number.isFinite(saved[k]))) {
        position = {
          x: clamp(saved.x, 0, ROOM_W),
          y: clamp(saved.y, 0, ROOM_H),
          size: clamp(saved.size, 4, 60),
          angle: clamp(saved.angle, -180, 180),
          skew: clamp(saved.skew, -65, 65)
        };
      }
    } catch (_) {}
    if (editing) buildEditor();
    render();
  }

  window.addEventListener('nana-room-zones-ready', initializeFromIpad);
  initializeFromIpad();
})();