/* A replayable mechanical animation; prizes can be connected when chosen. */
(() => {
  'use strict';
  const button=document.getElementById('room-gachapon');
  if(!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let timer=null;
  function finish(){clearTimeout(timer);timer=null;button.classList.remove('is-turning');button.classList.add('has-capsule');button.removeAttribute('aria-busy');}
  button.addEventListener('click',event=>{
    event.stopPropagation();
    if(timer!==null)return;
    button.classList.remove('has-capsule');
    if(reduced.matches){finish();return;}
    button.classList.add('is-turning');button.setAttribute('aria-busy','true');
    timer=setTimeout(finish,1400);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer!==null)finish();});
  window.addEventListener('hashchange',()=>{if(timer!==null)finish();});
  reduced.addEventListener?.('change',()=>{if(reduced.matches&&timer!==null)finish();});
})();
