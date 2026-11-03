/* Bretzel vase — Twist Reality. Decorative distortion, reversible at any time.
   Preserve the illustration and SVG hotspot geometry as one transformed scene. */
(() => {
  'use strict';
  const app=document.getElementById('app');
  const play=document.getElementById('play-viewport');
  const svg=document.getElementById('hotspots');
  if(!app||!play||!svg)return;

  const style=document.createElement('style');
  style.id='nana-twist-reality-style';
  style.textContent=`
    #play-scene { transition:transform .75s cubic-bezier(.25,.8,.25,1); transform-origin:center center; }
    #play-viewport.nana-twisted #play-scene {
      transform:rotate(-2.1deg) skew(-1.3deg,.7deg) scale(.985);
    }
    #app.nana-reality-twisted #dock button:nth-child(odd) {
      transform:translateY(-7px) rotate(-9deg);
      transition:transform .6s cubic-bezier(.24,1.2,.37,1);
    }
    #app.nana-reality-twisted #dock button:nth-child(even) {
      transform:translateY(4px) rotate(7deg);
      transition:transform .6s cubic-bezier(.24,1.2,.37,1);
    }
    #app.nana-reality-twisted #menubar nav > button:nth-of-type(odd) {
      transform:rotate(-4deg) translateY(2px);
    }
    #app.nana-reality-twisted #menubar nav > button:nth-of-type(even) {
      transform:rotate(3deg) translateY(-2px);
    }
    #nana-untwist {
      position:fixed;top:calc(var(--menubar, 42px) + 12px);left:50%;
      transform:translateX(-50%) rotate(2deg);z-index:3000;
      border:2px solid #ff173b;border-radius:0;
      background:#fff2fc;color:#ff173b;
      padding:9px 16px;box-shadow:4px 4px 0 rgba(101,70,166,.55);
      font:700 15px/1.15 var(--nana-font, "Comic Sans MS", cursive);
      cursor:pointer;white-space:nowrap;touch-action:manipulation;
    }
    #nana-untwist:hover {background:#ff173b;color:#fff2fc;}
    #nana-untwist:focus-visible {outline:3px solid #6546a6;outline-offset:3px;}
    html[data-theme="night"] #nana-untwist {background:#e9b5ff;color:#ff173b;}
    html[data-theme="night"] #nana-untwist:hover {background:#ff173b;color:#fff2fc;}
    #nana-untwist[hidden] {display:none!important;}
    @media(max-width:600px) {
      #nana-untwist {font-size:12px;padding:7px 10px;top:calc(var(--menubar, 40px) + 8px);}
    }
    @media(prefers-reduced-motion:reduce) {
      #play-scene,#app.nana-reality-twisted #dock button {transition:none!important;}
    }
  `;
  document.head.appendChild(style);

  const resetButton=document.createElement('button');
  resetButton.type='button';
  resetButton.id='nana-untwist';
  resetButton.textContent='↶ Untwist reality';
  resetButton.setAttribute('aria-label','Remettre la chambre et les boutons en place');
  resetButton.hidden=true;
  document.body.appendChild(resetButton);

  let twisted=false;
  function setTwist(enabled) {
    twisted=!!enabled;
    play.classList.toggle('nana-twisted',twisted);
    app.classList.toggle('nana-reality-twisted',twisted);
    resetButton.hidden=!twisted;
  }
  resetButton.addEventListener('click',()=>setTwist(false));
  svg.addEventListener('click',event=>{
    const target=event.target.closest?.('polygon[data-open="twist-reality"]');
    if(!target)return;
    event.preventDefault();
    event.stopPropagation();
    if(!app.classList.contains('mode-play'))return;
    setTwist(!twisted);
  },true);

  // Escape undoes the prank rather than leaving Play Mode.
  window.addEventListener('keydown',event=>{
    if(!twisted||event.key!=='Escape')return;
    event.preventDefault();event.stopPropagation();
    setTwist(false);
  },true);

  // Work Mode, home and mode changes always return to a normal room.
  new MutationObserver(()=>{
    if(twisted && (!app.classList.contains('mode-play') ||
      !app.classList.contains('nana-reality-twisted')))setTwist(false);
  }).observe(app,{attributes:true,attributeFilter:['class']});
})();
