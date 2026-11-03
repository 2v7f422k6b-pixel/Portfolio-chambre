'use strict';

/* A one-time, bilingual Play Mode hint only when the room is larger than
   the visible viewport. Kept separate from the room/hotspot layout. */
(() => {
  const app = document.getElementById('app');
  const viewport = document.getElementById('play-viewport');
  const scene = document.getElementById('play-scene');
  if (!app || !viewport || !scene) return;

  const STORAGE_KEY = 'nana-play-pan-hint-seen-v1';
  let hasShown = false;
  try { hasShown = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}

  const style = document.createElement('style');
  style.id = 'nana-play-pan-hint-styles';
  style.textContent = [
    '#nana-play-pan-hint{position:fixed;inset:0;z-index:110;display:grid;place-items:center;padding:20px;background:rgba(38,19,55,.27);backdrop-filter:blur(2px);}',
    '#nana-play-pan-hint .pan-hint-card{position:relative;box-sizing:border-box;width:min(410px,100%);padding:28px 29px 25px;background:#fff2fc;border:2px solid #ff173b;border-radius:12px 8px 14px 9px / 9px 13px 8px 12px;box-shadow:0 0 15px rgba(255,23,59,.17),5px 6px 0 rgba(255,23,59,.09);transform:rotate(-.35deg);color:#ff173b;font-family:"Nana Trace UI",Arial,sans-serif;text-align:center;line-height:1.4;}',
    '#nana-play-pan-hint .pan-hint-title{margin:0 15px 12px;font-size:clamp(22px,4vw,29px);font-weight:700;line-height:1.2;}',
    '#nana-play-pan-hint .pan-hint-text{margin:0 0 23px;font-size:clamp(15px,2.7vw,18px);line-height:1.45;}',
    '#nana-play-pan-hint button{font:inherit;color:#ff173b;cursor:pointer;}',
    '#nana-play-pan-hint .pan-hint-dismiss{min-width:112px;padding:9px 19px;background:transparent;border:2px solid #ff173b;border-radius:8px 12px 9px 13px / 12px 8px 12px 9px;font-size:17px;}',
    '#nana-play-pan-hint .pan-hint-dismiss:hover,#nana-play-pan-hint .pan-hint-dismiss:focus-visible{background:rgba(255,23,59,.1);}',
    '#nana-play-pan-hint .pan-hint-close{position:absolute;top:7px;right:10px;padding:2px 7px;border:0;background:transparent;font-size:23px;line-height:1;}',
    '#nana-play-pan-hint button:focus-visible{outline:2px dashed #ff173b;outline-offset:4px;}',
    'html[data-theme="night"] #nana-play-pan-hint .pan-hint-card{background:#e9b5ff;}',
    '@media(max-width:500px){#nana-play-pan-hint .pan-hint-card{padding:26px 21px 22px;}}'
  ].join('\n');
  document.head.appendChild(style);

  let overlay = null;
  function labels() {
    return document.documentElement.lang === 'en'
      ? { title: "Psst… there's more to explore!",
          body: 'Swipe or scroll in any direction to explore the whole room.',
          dismiss: 'Got it!',
          close: 'Close' }
      : { title: 'Psst… il reste des choses à découvrir !',
          body: "Fais défiler l'écran dans toutes les directions pour explorer toute la chambre.",
          dismiss: 'Compris !',
          close: 'Fermer' };
  }
  function updateLanguage() {
    if (!overlay) return;
    const copy = labels();
    overlay.querySelector('.pan-hint-title').textContent = copy.title;
    overlay.querySelector('.pan-hint-text').textContent = copy.body;
    overlay.querySelector('.pan-hint-dismiss').textContent = copy.dismiss;
    overlay.querySelector('.pan-hint-close').setAttribute('aria-label', copy.close);
  }
  function dismiss() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.removeEventListener('keydown', onKeyDown);
    document.getElementById('home-menu')?.focus({ preventScroll: true });
  }
  function onKeyDown(event) {
    if (event.key === 'Escape') dismiss();
  }
  function show() {
    if (overlay) return;
    hasShown = true;
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    overlay = document.createElement('div');
    overlay.id = 'nana-play-pan-hint';
    overlay.setAttribute('data-no-translate', '');
    overlay.innerHTML = '<section class="pan-hint-card" role="dialog" aria-modal="true" aria-labelledby="pan-hint-heading" aria-describedby="pan-hint-description">' +
      '<button class="pan-hint-close" type="button" aria-label="Close">×</button>' +
      '<h2 class="pan-hint-title" id="pan-hint-heading"></h2>' +
      '<p class="pan-hint-text" id="pan-hint-description"></p>' +
      '<button class="pan-hint-dismiss" type="button"></button></section>';
    document.body.appendChild(overlay);
    updateLanguage();
    overlay.querySelectorAll('button').forEach(button => button.addEventListener('click', dismiss));
    overlay.addEventListener('click', event => { if (event.target === overlay) dismiss(); });
    document.addEventListener('keydown', onKeyDown);
    overlay.querySelector('.pan-hint-dismiss').focus({ preventScroll: true });
  }
  function check() {
    if (hasShown || overlay || !app.classList.contains('mode-play') || viewport.hidden) return;
    // Compare the actual scene dimensions, ignoring temporary zoom transforms.
    const horizontalOverflow = scene.offsetWidth - viewport.clientWidth;
    const verticalOverflow = scene.offsetHeight - viewport.clientHeight;
    if (horizontalOverflow > 12 || verticalOverflow > 12) show();
  }
  let frame = 0;
  function scheduleCheck() {
    if (hasShown) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(check);
    });
  }

  new MutationObserver(scheduleCheck).observe(app, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', scheduleCheck, { passive: true });
  document.addEventListener('portfolio-language-change', updateLanguage);
  scheduleCheck();
})();
