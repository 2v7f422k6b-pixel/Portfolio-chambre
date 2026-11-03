'use strict';

/* Non-blocking, four-direction Play Mode navigation hint.
   Appears whenever the visitor ENTERS Play Mode and the illustration
   extends beyond the available viewport. No session storage: returning
   to Play should allow the hint to appear again. */
(() => {
  const app = document.getElementById('app');
  const viewport = document.getElementById('play-viewport');
  const scene = document.getElementById('play-scene');
  if (!app || !viewport || !scene) return;

  const style = document.createElement('style');
  style.id = 'nana-play-pan-hint-styles';
  style.textContent = [
    '/* Suppress the older fixed mobile swipe label. */',
    '#app.mode-play #play-viewport::before{content:none!important;display:none!important;}',
    '#nana-play-pan-hint{position:fixed;inset:var(--menubar,40px) 0 0;z-index:110;display:grid;place-items:center;pointer-events:none;background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}',
    '#nana-play-pan-hint .pan-hint-arrows{position:relative;width:112px;height:112px;border-radius:50%;background:rgba(255,247,252,.12);animation:nana-pan-appear 4.4s ease-in-out both;}',
    '#nana-play-pan-hint .pan-hint-arrow{position:absolute;display:block;width:32px;height:32px;line-height:32px;text-align:center;color:#ff173b;font-family:Arial,sans-serif;font-size:31px;font-weight:500;text-shadow:0 0 7px rgba(255,242,252,.65);animation:nana-pan-nudge 1.2s ease-in-out infinite alternate;}',
    '#nana-play-pan-hint .pan-hint-up{top:2px;left:40px;--tx:0px;--ty:-4px;}',
    '#nana-play-pan-hint .pan-hint-down{bottom:2px;left:40px;--tx:0px;--ty:4px;}',
    '#nana-play-pan-hint .pan-hint-left{left:2px;top:40px;--tx:-4px;--ty:0px;}',
    '#nana-play-pan-hint .pan-hint-right{right:2px;top:40px;--tx:4px;--ty:0px;}',
    '@keyframes nana-pan-nudge{from{transform:translate(0,0);opacity:.8}to{transform:translate(var(--tx),var(--ty));opacity:1}}',
    '@keyframes nana-pan-appear{0%{opacity:0;transform:scale(.96)}10%{opacity:1;transform:scale(1)}77%{opacity:1}100%{opacity:0}}',
    'html[data-theme="night"] #nana-play-pan-hint .pan-hint-arrows{background:rgba(233,181,255,.08);}',
    'html[data-theme="night"] #nana-play-pan-hint .pan-hint-arrow{color:#ff173b;}',
    '@media(prefers-reduced-motion:reduce){#nana-play-pan-hint .pan-hint-arrows,#nana-play-pan-hint .pan-hint-arrow{animation:none!important;}}'
  ].join('\n');
  document.head.appendChild(style);

  let hint = null;
  let timer = null;
  let shownThisEntry = false;
  let wasInPlay = app.classList.contains('mode-play');
  let frame = 0;

  function removeHint() {
    if (!hint) return;
    hint.remove();
    hint = null;
    clearTimeout(timer);
    viewport.removeEventListener('scroll', removeHint);
    document.removeEventListener('wheel', removeHint);
    document.removeEventListener('touchstart', removeHint);
    document.removeEventListener('pointerdown', removeHint);
  }

  function showHint() {
    if (hint || shownThisEntry) return;
    shownThisEntry = true;
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
    timer = setTimeout(removeHint, 4400);
    viewport.addEventListener('scroll', removeHint, {passive:true});
    document.addEventListener('wheel', removeHint, {passive:true});
    document.addEventListener('touchstart', removeHint, {passive:true});
    document.addEventListener('pointerdown', removeHint, {passive:true});
  }

  function check() {
    if (shownThisEntry || hint || !app.classList.contains('mode-play') || viewport.hidden) return;
    // Use layout sizes, not temporary iMac zoom transforms.
    const overflowsX = scene.offsetWidth - viewport.clientWidth > 12;
    const overflowsY = scene.offsetHeight - viewport.clientHeight > 12;
    if (overflowsX || overflowsY) showHint();
  }

  function scheduleCheck() {
    if (shownThisEntry) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(check);
    });
  }

  function onModeChange() {
    const inPlay = app.classList.contains('mode-play');
    if (!inPlay) {
      wasInPlay = false;
      shownThisEntry = false;
      cancelAnimationFrame(frame);
      removeHint();
    } else {
      if (!wasInPlay) shownThisEntry = false;
      wasInPlay = true;
      scheduleCheck();
    }
  }

  new MutationObserver(onModeChange).observe(app, {
    attributes: true,
    attributeFilter: ['class']
  });
  window.addEventListener('resize', scheduleCheck, {passive:true});
  onModeChange();
})();
