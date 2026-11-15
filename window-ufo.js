/* A curious night visitor; all timings count only time actually spent in the room. */
(() => {
  'use strict';
  const ufo=document.getElementById('window-ufo'),app=document.getElementById('app');
  if(!ufo||!app)return;
  const button=ufo.querySelector('.ufo-hit');
  const preview=new URLSearchParams(location.search).get('ufoPreview')==='1';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let phase='waiting',elapsed=0,last=performance.now(),first=true;
  const active=()=>!document.hidden&&document.documentElement.dataset.theme==='night'
    &&app.classList.contains('mode-play')&&!document.getElementById('play-viewport')?.hidden
    &&(!location.hash||/^#\/(?:room)?$/.test(location.hash));
  const change=next=>{
    phase=next;elapsed=0;ufo.dataset.phase=next;
    const visible=next==='arriving'||next==='observing';
    button.setAttribute('tabindex',visible?'0':'-1');
    ufo.setAttribute('aria-hidden',String(next==='waiting'));
  };
  const sync=()=>{ufo.classList.toggle('is-idle',!active());last=performance.now();};
  function tick(){
    const now=performance.now(),delta=Math.min(now-last,1000);last=now;if(!active())return;elapsed+=delta;
    if(phase==='waiting'&&elapsed>=(preview?500:first?18000:90000)){first=false;change(reduced.matches?'observing':'arriving');}
    else if(phase==='arriving'&&elapsed>=1200)change('observing');
    else if(phase==='observing'&&elapsed>=12000)change('leaving');
    else if(phase==='leaving'&&elapsed>=(reduced.matches?200:450))change('waiting');
  }
  const flee=event=>{
    event.preventDefault();event.stopPropagation();
    if(!active()||!['arriving','observing'].includes(phase))return;
    // Keep this discovery for the planned UFO outfit, without awarding it in previews.
    if(!preview)window.NanaProgress?.feat('ufo-encounter');
    change('leaving');
  };
  button.addEventListener('click',flee);
  button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')flee(event);});
  const localize=()=>button.setAttribute('aria-label',document.documentElement.lang.startsWith('en')?'Curious flying saucer — send it fleeing':'Soucoupe curieuse — la faire fuir');
  document.addEventListener('portfolio-language-change',localize);
  document.addEventListener('visibilitychange',sync);window.addEventListener('hashchange',sync);
  new MutationObserver(sync).observe(app,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>{if(document.documentElement.dataset.theme!=='night')change('waiting');sync();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  localize();sync();
  if(preview&&document.documentElement.dataset.theme!=='night')document.getElementById('theme-toggle')?.click();
  setInterval(tick,100);
})();

