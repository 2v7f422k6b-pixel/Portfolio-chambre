/* Mount the original-resolution cutouts together after their artwork is ready. */
(async () => {
  'use strict';
  const scene = document.getElementById('play-scene');
  const hotspots = document.getElementById('hotspots');
  if (!scene || !hotspots) return;
  const folder = 'assets/room-redraw/';
  function loadImage(file) {
    const image = new Image();
    image.src = folder + file;
    return image.decode().then(() => image);
  }
  const response = await fetch(folder + 'objets.svg?v=20261118-interactions');
  if (!response.ok) throw new Error('Room drawing unavailable');
  const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') throw new Error('Invalid room drawing');
  const [underlay] = await Promise.all([
    loadImage('fond-mouvements.webp'), loadImage('objets-jour.webp'), loadImage('kero-visages.webp')
  ]);
  underlay.id = 'room-v2-underlay';
  underlay.dataset.roomV2Layer = '';
  underlay.alt = '';
  underlay.draggable = false;
  scene.append(underlay, svg);
  hotspots.dataset.roomV2Layer = '';

  const labels = [...svg.querySelectorAll('[data-label-en]')];
  for (const item of labels) item.dataset.labelFr = item.getAttribute('aria-label');
  function setLabels() {
    const english = document.documentElement.lang === 'en';
    for (const item of labels) item.setAttribute('aria-label', english ? item.dataset.labelEn : item.dataset.labelFr);
  }
  setLabels();
  document.addEventListener('portfolio-language-change', setLabels);

  const hands = Object.fromEntries(Array.from(svg.querySelectorAll('[data-hand]'), el => [el.dataset.hand, el]));
  const ipad = svg.querySelector('.v2-ipad-time');
  function showTime() {
    const now = new Date();
    const s = now.getSeconds(), m = now.getMinutes() + s / 60;
    hands.hour.setAttribute('transform', `rotate(${(now.getHours() % 12 + m / 60) * 30 + 110} 490 692)`);
    hands.minute.setAttribute('transform', `rotate(${m * 6 - 107} 490 692)`);
    hands.second.setAttribute('transform', `translate(-1 -5) rotate(${s * 6 + 133} 491 697)`);
    ipad.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }
  let clock;
  function syncClock() {
    clearInterval(clock);
    if (!document.hidden) {
      showTime();
      clock = setInterval(showTime, 1000);
    }
  }
  document.addEventListener('visibilitychange', syncClock);
  window.addEventListener('pageshow', syncClock);
  window.addEventListener('pagehide', () => clearInterval(clock));
  syncClock();

  function activate(event) {
    const item = event.target.closest('[data-object], [data-open]');
    if (!item || (event.type === 'keydown' && !['Enter', ' '].includes(event.key))) return;
    // App links use the same delegated click as the desktop and the journal.
    if (item.hasAttribute('data-open')) {
      if (event.type === 'keydown') {
        event.preventDefault();
        if (!event.repeat) item.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (item.dataset.object === 'kero') {
      window.NanaProgress?.visit('objet/kero');
      window.NanaKeroWake?.activate(item);
    }
    if (item.dataset.object === 'plant') window.NanaProgress?.visit('objet/plante-fleur');
    if (item.dataset.object === 'dog') {
      window.NanaProgress?.visit('objet/preacher-dog');
      window.NanaProgress?.feat('preacher-dog');
    }
    if (item.dataset.object === 'bell') {
      document.getElementById('nana-kikujiro-chime')?.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    }
  }
  svg.addEventListener('click', activate);
  svg.addEventListener('keydown', activate);
})().catch(error => console.error('Chambre V2', error));
