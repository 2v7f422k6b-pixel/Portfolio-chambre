'use strict';

/* A subtle, non-blocking four-direction hint on entering Play Mode.
   Only appears when the scene overflows the available viewport. */
(() => {
  const app = document.getElementById('app');
  const viewport = document.getElementById('play-viewport');
  const scene = document.getElementById('play-scene');
  if (!app || !viewport || !scene) return;

  const STORAGE_KEY = 'nana-play-pan-hint-seen-v2';
  let hasShown = false;
  try { hasShown = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}

  const style = document.createElement('style');
  style.id = 'nana-play-pan-hint-styles';
  style.textContent = [
    '/* Remove the old mobile swipe label: the arrows are the entire hint. */',
    '#app.mode-play #play-viewport::before {content:none!important;display:none!important;}',
    '#nana-play-pan-hint{position:fixed;inset:0;z-index:110;display:grid;place-items:center;pointer-events:none;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}',
    '#nana-play-pan-hint .pan-hint-arrows{position:relative;width:96px;height:96px;border-radius:50%;background:rgba(255,247,252,.10);backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px);animation:nana-pan-appear 2.8s ease-in-out both;}',
    '#nana-play-pan-hint .pan-hint-arrow{position:absolute;display:block;width:28px;height:28px;line-height:28px;text-align:center;color:rgba(255,23,59,.85);font-family:Arial,sans-serif;font-size:26px;font-weight:400;text-shadow:0 0 5px rgba(255,242,252,.4);animation:nana-pan-nudge 1.2s ease-in-out infinite alternate;}',
    '#nana-play-pan-hint .pan-hint-up{top:4px;left:34px;--tx:0px;--ty:-4px;}',
    '#nana-play-pan-hint .pan-hint-down{bottom:4px;left:34px;--tx:0px;--ty:4px;}',
    '#nana-play-pan-hint .pan-hint-left{left:4px;top:34px;--tx:-4px;--ty:0px;}',
    '#nana-play-pan-hint .pan-hint-right{right:4px;top:34px;--tx:4px;--ty:0px;}',
    '@keyframes nana-pan-nudge{from{transform:translate(0,0);opacity:.66}to{transform:translate(var(--tx),var(--ty));opacity:1}}',
    '@keyframes nana-pan-appear{0%{opacity:0;transform:scale(.95)}12%{opacity:1;transform:scale(1)}72%{opacity:1}100%{opacity:0}}',
    'html[data-theme="night"] #nana-play-pan-hint .pan-hint-arrows{background:rgba(255,255,255,.05);}',
    'html[data-theme="night"] #nana-play-pan-hint .pan-hint-arrow{color:rgba(255,194,232,.9);}',
    '@media(prefers-reduced-motion:reduce){#nana-play-pan-hint .pan-hint-arrows,#nana-play-pan-hint .pan-hint-arrow{animation:none!important;}}'
  ].join('\n');
  document.head.appendChild(style);

  let hint = null;
  let timeoutId = null;
  function removeHint() {
    if (!hint) return;
    hint.remove();
    hint = null;
    clearTimeout(timeoutId);
    viewport.removeEventListener('scroll', removeHint);
    document.removeEventListener('wheel', removeHint);
    document.removeEventListener('touchstart', removeHint);
    document.removeEventListener('pointerdown', removeHint);
  }

  function showHint() {
    if (hint || hasShown) return;
    hasShown = true;
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
    hint = document.createElement('div');
    hint.id = 'nana-play-pan-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML =
      '<div class="pan-hint-arrows">' +
      '<span class="pan-hint-arrow pan-hint-up">↑</span>' +
      '<span class="pan-hint-arrow pan-hint-down">↓</span>' +
      '<span class="pan-hint-arrow pan-hint-left">←</span>' +
      '<span class="pan-hint-arrow pan-hint-right">→</span>' +
      '</div>';
    document.body.appendChild(hint);
    timeoutId = setTimeout(removeHint, 2800);
    viewport.addEventListener('scroll', removeHint, {passive:true});
    document.addEventListener('wheel', removeHint, {passive:true});
    document.addEventListener('touchstart', removeHint, {passive:true});
    document.addEventListener('pointerdown', removeHint, {passive:true});
  }

  function check() {
    if (hasShown || hint || !app.classList.contains('mode-play') || viewport.hidden) return;
    // Layout size rather than transforms: the iMac zoom should not trigger the hint.
    const horizontalOverflow = scene.offsetWidth - viewport.clientWidth;
    const verticalOverflow = scene.offsetHeight - viewport.clientHeight;
    if (horizontalOverflow > 12 || verticalOverflow > 12) showHint();
  }

  let frame = 0;
  function scheduleCheck() {
    if (hasShown) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(check);
    });
  }

  new MutationObserver(() => {
    if (!app.classList.contains('mode-play')) removeHint();
    else scheduleCheck();
  }).observe(app, {attributes:true,attributeFilter:['class']});
  window.addEventListener('resize', scheduleCheck, {passive:true});
  scheduleCheck();
})();
