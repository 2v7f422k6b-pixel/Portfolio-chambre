/* Five woodland visitors. Their visit advances only while the room is open. */
(() => {
  'use strict';
  const root=document.getElementById('kodama-spirits');
  if(!root)return;
  const spirits=[...root.querySelectorAll('.kodama')],progress=window.NanaProgress;
  let elapsed=0,last=performance.now(),departure=null,returnAt=null,returnEnds=null;
  const active=()=>!document.hidden&&document.getElementById('app')?.classList.contains('mode-play')
    &&!!document.getElementById('play-viewport')?.getClientRects().length
    &&(!location.hash||/^#\/(?:room)?$/.test(location.hash));
  const complete=()=>progress?.hasFeat('mononoke-kodama');
  const localize=()=>spirits.forEach((spirit,i)=>{
    const found=progress?.hasFeat('kodama-'+(i+1));
    spirit.querySelector('polygon').setAttribute('aria-label',document.documentElement.lang.startsWith('en')
      ?`Kodama ${i+1} of 5${found?' — already found':''}`:`Kodama ${i+1} sur 5${found?' — déjà trouvé':''}`);
  });
  const show=(spirit,visible)=>{
    spirit.classList.toggle('is-visible',visible);spirit.setAttribute('aria-hidden',String(!visible));
    spirit.querySelector('polygon').setAttribute('tabindex',visible?'0':'-1');
  };
  const wiggle=spirit=>{
    spirit.classList.remove('is-wiggling');void spirit.getBoundingClientRect();spirit.classList.add('is-wiggling');
  };
  spirits.forEach((spirit,i)=>{
    const button=spirit.querySelector('polygon');
    button.addEventListener('pointerenter',()=>wiggle(spirit));
    button.addEventListener('focus',()=>wiggle(spirit));
    button.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();if(!spirit.classList.contains('is-visible'))return;
      wiggle(spirit);progress?.feat('kodama-'+(i+1));localize();
    });
    button.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();button.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    });
  });
  function tick(){
    const now=performance.now(),delta=Math.min(now-last,1000);last=now;if(!active())return;elapsed+=delta;
    if(complete()&&departure===null)departure=Math.max(elapsed,39000)+10000;
    if(departure!==null&&elapsed>=departure){
      if(returnAt===null)returnAt=departure+120000;
      if(elapsed>=returnAt&&returnEnds===null)returnEnds=elapsed+35000;
      if(returnEnds!==null&&elapsed>=returnEnds){returnAt=elapsed+120000;returnEnds=null;}
    }
    spirits.forEach((spirit,i)=>show(spirit,elapsed>=15000+i*6000&&(departure===null||elapsed<departure||returnEnds!==null)));
  }
  progress?.subscribe(localize);document.addEventListener('portfolio-language-change',localize);
  document.addEventListener('visibilitychange',()=>{last=performance.now();});localize();setInterval(tick,250);
})();
