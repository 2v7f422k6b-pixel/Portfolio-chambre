/* A slow, clickable flight: no timers run while the visitor is away. */
(() => {
  'use strict';
  const butterfly=document.getElementById('paprika-butterfly');
  if(!butterfly)return;
  // Measure only when the room changes size, including rotation and returning to Play.
  const scene=butterfly.parentElement;
  const resize=()=>{
    butterfly.style.setProperty('--flight-x',`${scene.clientWidth/100}px`);
    butterfly.style.setProperty('--flight-y',`${scene.clientHeight/100}px`);
  };
  if(window.ResizeObserver)new ResizeObserver(resize).observe(scene);
  else window.addEventListener('resize',resize,{passive:true});
  resize();
  let releaseTimer;
  const localize=()=>butterfly.setAttribute('aria-label',document.documentElement.lang.startsWith('en')
    ?'Butterfly — discover the Paprika outfit':'Papillon — découvrir la tenue Paprika');
  const visibility=()=>butterfly.classList.toggle('is-idle',document.hidden);
  butterfly.addEventListener('pointerdown',()=>{
    clearTimeout(releaseTimer);butterfly.classList.add('is-paused');
  });
  const release=()=>{
    clearTimeout(releaseTimer);
    releaseTimer=setTimeout(()=>butterfly.classList.remove('is-paused'),900);
  };
  butterfly.addEventListener('pointerup',release);
  butterfly.addEventListener('pointercancel',release);
  butterfly.addEventListener('blur',release);
  butterfly.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    window.NanaProgress?.visit('objet/papillon-paprika');
    window.NanaProgress?.feat('paprika-butterfly');
  });
  document.addEventListener('visibilitychange',visibility);
  document.addEventListener('portfolio-language-change',localize);
  localize();visibility();
})();
