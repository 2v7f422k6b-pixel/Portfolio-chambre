/* Shared window bounds: measure the navigation instead of assuming its height. */
(() => {
  'use strict';
  const root=document.documentElement;
  const bar=document.getElementById('menubar');
  let queued=false;
  function set(name,value){
    const next=Math.round(value)+'px';
    if(root.style.getPropertyValue(name)!==next)root.style.setProperty(name,next);
  }
  function update(){
    queued=false;
    const viewport=window.visualViewport;
    // Pinch zoom should magnify the page, not shrink its windows again.
    const useVisual=viewport&&Math.abs(viewport.scale-1)<.01;
    const visibleTop=useVisual?viewport.offsetTop:0;
    const visibleBottom=useVisual?Math.min(window.innerHeight,visibleTop+viewport.height):window.innerHeight;
    const gap=window.innerWidth<=760?8:12;
    const menuBottom=bar?.getBoundingClientRect().bottom||0;
    set('--nana-window-top-safe',Math.max(menuBottom,visibleTop)+gap);
    set('--nana-window-viewport-bottom',visibleBottom);
  }
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(update);
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  if(bar&&typeof ResizeObserver!=='undefined')new ResizeObserver(schedule).observe(bar);
  update();
})();
