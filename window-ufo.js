/* Pause the rare passage while the visitor is away, in Work, or inside another page. */
(() => {
  'use strict';
  const ufo=document.getElementById('window-ufo'),app=document.getElementById('app');
  if(!ufo||!app)return;
  if(new URLSearchParams(location.search).get('ufoPreview')==='1')ufo.dataset.preview='true';
  const pause=()=>ufo.classList.toggle('is-idle',document.hidden||!app.classList.contains('mode-play')
    ||(!!location.hash&&!/^#\/(?:room)?$/.test(location.hash)));
  document.addEventListener('visibilitychange',pause);
  window.addEventListener('hashchange',pause);
  new MutationObserver(pause).observe(app,{attributes:true,attributeFilter:['class']});
  pause();
})();

