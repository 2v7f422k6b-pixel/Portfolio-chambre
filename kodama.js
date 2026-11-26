/* Local sprite motion and first-priority touch handling: no room hotspot receives a sprite tap. */
(() => {
  'use strict';
  window.NanaResources?.enqueue?.('play',()=>window.NanaResources.revealDeferred(document.getElementById('kodama-layer')));
  const root=document.getElementById('kodama-spirits');
  if(!root)return;
  const spirits=[...root.querySelectorAll('.kodama')],progress=window.NanaProgress;
  const dog=document.getElementById('preacher-dog-sprite');
  let elapsed=0,last=performance.now(),departure=null,returnAt=null,returnEnds=null;
  const waitingForMokona=()=>document.getElementById("play-scene")?.classList.contains("mokona-first");
  const active=()=>!waitingForMokona()&&!document.hidden&&document.getElementById('app')?.classList.contains('mode-play')
    &&!document.getElementById('play-viewport')?.hidden&&(!location.hash||/^#\/(?:room)?$/.test(location.hash));

  const localize=()=>spirits.forEach((spirit,i)=>{
    const found=progress?.hasFeat('kodama-'+(i+1));
    spirit.setAttribute('aria-label',document.documentElement.lang.startsWith('en')
      ?`Kodama ${i+1} of 5${found?' — already found':''}`:`Kodama ${i+1} sur 5${found?' — déjà trouvé':''}`);
  });
  const shown=new WeakMap(),motions=new WeakMap();
  const show=(spirit,visible)=>{
    if(shown.get(spirit)===visible)return;shown.set(spirit,visible);
    spirit.classList.toggle('is-visible',visible);spirit.setAttribute('aria-hidden',String(!visible));
    spirit.disabled=!visible;spirit.setAttribute('tabindex',visible?'0':'-1');
  };
  const wiggle=spirit=>{
    const head=spirit.querySelector('.kodama-head');if(!head?.animate)return;
    motions.get(head)?.cancel();
    const gentle=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const angles=gentle?[0,90,0]:[0,-35,175,175,140,185,0];
    motions.set(head,head.animate(angles.map(angle=>({transform:`translate3d(0,0,0) rotate(${angle}deg)`})),
      {duration:gentle?420:900,easing:'ease-in-out'}));
  };
  for(const spirit of spirits){
    spirit.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')wiggle(spirit);});
    spirit.addEventListener('focus',()=>wiggle(spirit));
  }
  const targetFor=event=>{
    if(waitingForMokona())return null;
    const direct=event.target.closest?.('.room-sprite-hit');if(direct)return direct;
    // iPad may report the underlying SVG when a tap falls just beside a small head.
    if(!active()||event.target.closest?.('dialog,#menubar,#dock,#window-shade,#special-shade'))return null;
    const point=event.changedTouches?.[0]||event;
    if(!Number.isFinite(point.clientX)||!Number.isFinite(point.clientY))return null;
    return spirits.find(spirit=>{
      if(!shown.get(spirit))return false;
      const r=spirit.getBoundingClientRect(),pad=Math.max(0,(44-r.width)/2);
      return point.clientX>=r.left-pad&&point.clientX<=r.right+pad&&point.clientY>=r.top-8&&point.clientY<=r.bottom+8;
    });
  };
  const stop=event=>{event.preventDefault();event.stopImmediatePropagation();};
  function activate(target){
    if(!active())return;
    const index=spirits.indexOf(target);
    if(index>=0){
      if(!shown.get(target))return;
      wiggle(target);progress?.feat('kodama-'+(index+1));localize();
    }else if(target===dog){progress?.visit('objet/preacher-dog');progress?.feat('preacher-dog');}
  }
  // Window capture runs before all document/scene alpha-hit and hotspot handlers,
  // including the synthetic click Safari sends after a touch.
  let lastTap=null,lastTapAt=-Infinity;
  const tap=event=>{const target=targetFor(event);if(!target)return;stop(event);
    const now=performance.now();if(target===lastTap&&now-lastTapAt<650)return;
    lastTap=target;lastTapAt=now;activate(target);
  };
  for(const type of ['pointerdown','touchstart'])window.addEventListener(type,event=>{if(targetFor(event))event.stopImmediatePropagation();},true);
  window.addEventListener('pointerup',tap,true);
  window.addEventListener('touchend',tap,true);
  window.addEventListener('click',tap,true);
  window.addEventListener('keydown',event=>{
    const target=targetFor(event);if(!target||!['Enter',' '].includes(event.key))return;
    stop(event);if(!event.repeat)activate(target);
  },true);
  function tick(){
    const now=performance.now(),delta=Math.min(now-last,1000);last=now;if(!active())return;elapsed+=delta;
    if(departure===null)departure=59000;
    if(departure!==null&&elapsed>=departure){
      if(returnAt===null)returnAt=departure+120000;
      if(elapsed>=returnAt&&returnEnds===null)returnEnds=elapsed+20000;
      if(returnEnds!==null&&elapsed>=returnEnds){returnAt=elapsed+120000;returnEnds=null;}
    }
    spirits.forEach((spirit,i)=>show(spirit,elapsed>=15000+i*6000&&(departure===null||elapsed<departure||returnEnds!==null)));
  }
  const visibility=()=>{last=performance.now();dog?.classList.toggle('is-idle',document.hidden);};
  progress?.subscribe(localize);document.addEventListener('portfolio-language-change',localize);
  document.addEventListener('visibilitychange',visibility);localize();visibility();setInterval(tick,250);
})();
