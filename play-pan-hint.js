'use strict';

/* A first-visit touch tour reveals the room's width, then the existing
   navigation hint explains how to explore. The tour is remembered locally;
   the hint can still appear when returning to Play. Neither blocks input. */
(() => {
  const app = document.getElementById('app');
  const viewport = document.getElementById('play-viewport');
  const scene = document.getElementById('play-scene');
  if (!app || !viewport || !scene) return;

  const style = document.createElement('style');
  style.id = 'nana-play-pan-hint-styles';
  style.textContent = `
    #app.mode-play #play-viewport::before {content:none!important;display:none!important;}
    #nana-play-pan-hint {
      position:fixed; inset:var(--menubar,40px) 0 0; z-index:110;
      display:grid;place-items:center;pointer-events:none;background:transparent!important;
    }
    #nana-play-pan-hint .pan-hint-visual {
      position:relative;width:158px;height:158px;border-radius:50%;
      background:transparent;border:0;box-shadow:none;
      backdrop-filter:none;-webkit-backdrop-filter:none;
      animation:nana-pan-fade 5.8s ease-in-out both;
    }
    #nana-play-pan-hint .pan-hint-directions {display:block;width:100%;height:100%;filter:brightness(0) invert(1);}

    /* The hand belongs to touch devices only and emerges from the viewport edge. */
    #nana-play-pan-hint .pan-hint-hand-photo {display:none;}
    #nana-play-pan-hint .pan-hint-visual {z-index:2;}
    #nana-play-pan-hint.touch-hint .pan-hint-hand-photo {
      display:block;position:absolute;left:50%;bottom:-88px;
      width:auto;height:calc(50% + 88px);max-width:none;max-height:none;
      object-fit:contain;z-index:1;pointer-events:none;
      filter:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;
      animation:nana-touch-hand-swipe 3.4s ease-in-out infinite;
    }
    #nana-play-pan-hint.touch-hint .pan-hint-label {
      display:block;top:auto;bottom:calc(100% + 16px);
      font-size:clamp(16px,4vw,20px);border:0;
    }
    #nana-play-pan-hint.touch-hint .pan-hint-visual{
      animation:nana-pan-fade-touch 5.8s ease-in-out both;
    }
    @keyframes nana-pan-fade-touch {
      0%{opacity:0;transform:translateY(0) scale(.96);}
      10%{opacity:1;transform:translateY(0) scale(1);}
      82%{opacity:1;transform:translateY(0) scale(1);}
      100%{opacity:0;transform:translateY(0) scale(1);}
    }
    @keyframes nana-touch-hand-swipe{
      0%,8%,100%{transform:translateX(-50%) translate(0,0);}
      27%{transform:translateX(-50%) translate(-14px,0);}
      43%{transform:translateX(-50%) translate(14px,0);}
      60%{transform:translateX(-50%) translate(0,0);}
      77%{transform:translateX(-50%) translate(0,-18px);}
      92%{transform:translateX(-50%) translate(0,12px);}
    }
    @media(min-width:700px) and (orientation:landscape) {
      #nana-play-pan-hint.touch-hint .pan-hint-hand-photo {
        height:calc(50% + 88px);max-width:none;
      }
    }
    @media(prefers-reduced-motion:reduce) {
      #nana-play-pan-hint.touch-hint .pan-hint-hand-photo {
        animation:none;transform:translateX(-50%);
      }
      #nana-play-pan-hint.touch-hint .pan-hint-visual {
        animation:none;transform:translateY(0);
      }
    }

    #nana-play-pan-hint .pan-hint-label {
      position:absolute;top:calc(100% + 10px);left:50%;transform:translateX(-50%);
      padding:5px 10px;white-space:nowrap;text-align:center;
      color:#ff173b;background:rgba(255,250,255,.75);
      border:1px solid rgba(255,23,59,.24);
      border-radius:9px 12px 8px 11px / 10px 8px 11px 9px;
      font-family:"Nana Trace UI",Arial,sans-serif;font-size:14px;
      line-height:1.15;letter-spacing:.01em;text-shadow:none;
    }
    #nana-play-pan-hint .pan-hint-finger {
      position:absolute;top:50%;left:50%;width:64px;height:64px;
      overflow:visible;filter:drop-shadow(0 1px 3px rgba(255,23,59,.3));
      animation:nana-pan-finger-swipe 3.1s ease-in-out infinite;
    }
    @keyframes nana-pan-finger-swipe {
      0%,10%,100% {transform:translate(-50%,-50%) translate(0,0) rotate(-7deg);}
      27% {transform:translate(-50%,-50%) translate(-20px,0) rotate(-7deg);}
      42% {transform:translate(-50%,-50%) translate(20px,0) rotate(-7deg);}
      60% {transform:translate(-50%,-50%) translate(0,0) rotate(-7deg);}
      76% {transform:translate(-50%,-50%) translate(0,-18px) rotate(-7deg);}
      92% {transform:translate(-50%,-50%) translate(0,17px) rotate(-7deg);}
    }
    @keyframes nana-pan-fade {
      0% {opacity:0;transform:translateY(-68px) scale(.95);}
      10% {opacity:1;transform:translateY(-68px) scale(1);}
      82% {opacity:1;transform:translateY(-68px) scale(1);}
      100% {opacity:0;transform:translateY(-68px) scale(1);}
    }
    html[data-theme="night"] #nana-play-pan-hint .pan-hint-visual {
      background:transparent;border:0;box-shadow:none;
    }
    @media(max-width:480px) {
      #nana-play-pan-hint .pan-hint-visual{width:150px;height:150px;}
    }
    @media(prefers-reduced-motion:reduce) {
      #nana-play-pan-hint .pan-hint-visual{animation:none!important;transform:translateY(-68px);}
      #nana-play-pan-hint .pan-hint-finger{animation:none!important;transform:translate(-50%,-50%);}
    }
  `;
  document.head.appendChild(style);

  function isTabletOrPhone() {
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod|Android/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function updateHintLabel() {
    if (!hint) return;
    const label = hint.querySelector('.pan-hint-label');
    if (!label) return;
    const isEnglish = document.documentElement.lang === 'en';
    const isTouch = isTabletOrPhone() || window.matchMedia('(pointer:coarse)').matches;
    label.textContent = isTouch
      ? (isEnglish ? 'Swipe to explore' : 'Fais glisser pour explorer')
      : (isEnglish ? 'Scroll to explore' : 'Fais défiler pour explorer');
  }

  let hint = null;
  let timer = null;
  let shownThisEntry = false;
  let wasInPlay = app.classList.contains('mode-play');
  let frame = 0;
  const tourKey = 'nana-room-tour-seen-v1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let tourSeen = false;
  try { tourSeen = localStorage.getItem(tourKey) === '1'; } catch (_) {}
  let tour = null;
  let tourFrame = 0;

  function rememberTour() {
    tourSeen = true;
    try { localStorage.setItem(tourKey, '1'); } catch (_) {}
  }

  function roomIsVisible() {
    if (!app.classList.contains('mode-play') || viewport.hidden || document.hidden) return false;
    const route = window.NanaDeepLinks?.current();
    if (route && !/^(room|chambre|play)$/.test(route)) return false;
    return !document.querySelector('#window-shade:not([hidden]), #special-shade:not([hidden]), dialog[open]');
  }

  function stopTour() {
    if (!tour) return;
    tour = null;
    cancelAnimationFrame(tourFrame);
    shownThisEntry = true;
    for (const type of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
      document.removeEventListener(type, interruptTour, true);
    }
    window.removeEventListener('resize', interruptTour);
    document.removeEventListener('visibilitychange', interruptTour);
    reducedMotion.removeEventListener?.('change', interruptTour);
  }

  function interruptTour() {
    if (!tour) return;
    // Input while the picture is loading also counts as taking control.
    rememberTour();
    stopTour();
  }

  async function startTour() {
    const current = {};
    tour = current;
    for (const type of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
      document.addEventListener(type, interruptTour, {capture:true, passive:true});
    }
    window.addEventListener('resize', interruptTour, {passive:true});
    document.addEventListener('visibilitychange', interruptTour);
    reducedMotion.addEventListener?.('change', interruptTour);

    // Never spend the introduction panning across an unloaded room.
    const night = document.documentElement.dataset.theme === 'night';
    const images = ['room-img', night ? 'room-night' : 'room-img', night ? 'marseille-night' : 'marseille-day']
      .map(id => document.getElementById(id)).filter(Boolean);
    await Promise.all([
      ...images.map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve()),
      ...(scene.getAnimations?.() || []).map(animation => animation.finished.catch(() => {}))
    ]);
    if (tour !== current) return;
    if (!roomIsVisible() || reducedMotion.matches) { stopTour(); return; }

    const startX = viewport.scrollLeft;
    const endX = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    if (endX <= 12 || images.some(img => !img.complete || !img.naturalWidth)) {
      stopTour();
      shownThisEntry = false;
      showHint();
      return;
    }
    rememberTour();
    let started;
    const ease = t => (1 - Math.cos(Math.PI * t)) / 2;
    function step(now) {
      if (tour !== current) return;
      if (!roomIsVisible()) { stopTour(); return; }
      if (started === undefined) started = now;
      const elapsed = now - started;
      // The room slides right-to-left, pauses at its far edge, then comes home.
      if (elapsed < 2400) viewport.scrollLeft = startX + (endX - startX) * ease(elapsed / 2400);
      else if (elapsed < 2560) viewport.scrollLeft = endX;
      else viewport.scrollLeft = endX + (startX - endX) * ease(Math.min(1, (elapsed - 2560) / 700));
      if (elapsed < 3260) tourFrame = requestAnimationFrame(step);
      else {
        stopTour();
        shownThisEntry = false;
        // Let the final programmatic scroll event settle before the hint listens.
        scheduleCheck();
      }
    }
    tourFrame = requestAnimationFrame(step);
  }

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
      '<div class="pan-hint-visual">' +
      '<svg class="pan-hint-directions" viewBox="0 0 168 168" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<g opacity="1"><image href="assets/drawn-ui/aide_deplacement_haut.png" x="67" y="10" width="34" height="45"/><image href="assets/drawn-ui/aide_deplacement_bas.png" x="67" y="113" width="34" height="45"/><image href="assets/drawn-ui/aide_deplacement_gauche.png" x="10" y="67" width="45" height="34"/><image href="assets/drawn-ui/aide_deplacement_droite.png" x="113" y="67" width="45" height="34"/></g>' +
      '</svg>' +
      '<span class="pan-hint-label" data-no-translate></span>' +
      '</div>' +
      '<img class="pan-hint-hand-photo" src="assets/play-swipe-hand-original.webp" alt="" aria-hidden="true" draggable="false">';
    if (isTabletOrPhone()) hint.classList.add('touch-hint');
    document.body.appendChild(hint);
    updateHintLabel();
    timer = setTimeout(removeHint, 5800);
    viewport.addEventListener('scroll', removeHint, {passive:true});
    document.addEventListener('wheel', removeHint, {passive:true});
    document.addEventListener('touchstart', removeHint, {passive:true});
    document.addEventListener('pointerdown', removeHint, {passive:true});
  }

  function check() {
    if (shownThisEntry || hint || tour || !roomIsVisible()) return;
    // Use layout sizes, not temporary iMac zoom transforms.
    const overflowsX = scene.offsetWidth - viewport.clientWidth > 12;
    const overflowsY = scene.offsetHeight - viewport.clientHeight > 12;
    if (overflowsX && isTabletOrPhone() && !tourSeen && !reducedMotion.matches) startTour();
    else if (overflowsX || overflowsY) showHint();
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
      stopTour();
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
  document.addEventListener('portfolio-language-change', updateHintLabel);
  onModeChange();
})();
