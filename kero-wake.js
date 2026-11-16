/* Three artist-drawn poses, shared between day and night. No continuous animation. */
(() => {
  'use strict';
  const poses=document.getElementById('kero-poses');
  if(!poses)return;
  const frames=Object.fromEntries(['day','night'].map(mode=>[mode,['asleep','waking','awake'].map(state=>'assets/kero/'+state+'-'+mode+'.png')]));
  const cache=new Map();
  let revision=0,busy=false,resetTimer;
  const theme=()=>document.documentElement.dataset.theme==='night'?'night':'day';
  function preload(src){
    if(cache.has(src))return cache.get(src);
    const ready=new Promise(resolve=>{
      const image=new Image();let settled=false;
      const done=ok=>{if(settled)return;settled=true;clearTimeout(timeout);resolve(ok);};
      const timeout=setTimeout(()=>done(false),3000);
      image.onload=()=>{if(image.decode)image.decode().then(()=>done(true),()=>done(true));else done(true);};
      image.onerror=()=>done(false);image.src=src;
    });cache.set(src,ready);ready.then(ok=>{if(!ok)cache.delete(src);});return ready;
  }
  const ready=()=>Promise.all(frames[theme()].slice(1).map(preload));
  const show=state=>{poses.dataset.keroState=state;};
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function discover(){window.NanaProgress?.feat('kero-awake');}
  async function activate(){
    if(busy)return;
    busy=true;const token=++revision;clearTimeout(resetTimer);
    const loaded=await ready();
    if(token!==revision||document.hidden){busy=false;return;}
    if(loaded.every(Boolean)){
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!reduced){show('waking');await wait(180);if(token!==revision||document.hidden){busy=false;return;}}
      show('awake');
    }
    discover();busy=false;
    resetTimer=setTimeout(()=>{if(token===revision)show('asleep');},2200);
  }
  window.NanaKeroWake={activate};
  // Load alternate poses when Kero is about to be used, not during room startup.
  document.getElementById('hotspots')?.addEventListener('pointerover',e=>{
    if(e.target.closest?.('[data-room-zone-id="kero"]'))void ready();
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){++revision;busy=false;clearTimeout(resetTimer);show('asleep');}
  });
})();
