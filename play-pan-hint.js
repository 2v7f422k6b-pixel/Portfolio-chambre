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
    #nana-play-pan-hint .pan-hint-directions {display:block;width:100%;height:100%;}

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
    #nana-play-pan-hint.touch-hint .pan-hint-label{display:none;}
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
    const isTouch = window.matchMedia('(pointer:coarse)').matches;
    label.textContent = isTouch
      ? (isEnglish ? 'Swipe to explore' : 'Glisse pour explorer')
      : (isEnglish ? 'Scroll to explore' : 'Fais défiler pour explorer');
  }

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
      '<div class="pan-hint-visual">' +
      '<svg class="pan-hint-directions" viewBox="0 0 168 168" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
      '<g opacity="0.58"><image href="assets/drawn-ui/aide_deplacement_haut.png" x="67" y="10" width="34" height="45"/><image href="assets/drawn-ui/aide_deplacement_bas.png" x="67" y="113" width="34" height="45"/><image href="assets/drawn-ui/aide_deplacement_gauche.png" x="10" y="67" width="45" height="34"/><image href="assets/drawn-ui/aide_deplacement_droite.png" x="113" y="67" width="45" height="34"/></g>' +
      '<g fill="none" opacity="0.67" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M84 50 V18 M68 34 L84 18 L100 34"/><path d="M84 118 V150 M68 134 L84 150 L100 134"/><path d="M50 84 H18 M34 68 L18 84 L34 100"/><path d="M118 84 H150 M134 68 L150 84 L134 100"/></g>' +
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
  document.addEventListener('portfolio-language-change', updateHintLabel);
  onModeChange();
})();
