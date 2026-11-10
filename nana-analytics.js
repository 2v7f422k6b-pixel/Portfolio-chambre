/* Selected aggregate measures. No visitor/session ID or saved measurement history. */
(() => {
  'use strict';
  if (window.NanaAnalytics) return;
  const catalogue=window.NANA_ANALYTICS_CATALOG;
  if(!catalogue)return;
  const KEY='nana-statistics-disabled-v1', flags=['previewReward','posterEdit','lampEdit','starsEdit','cookieEdit','ipadClockEdit','zones','look-preview'];
  const localPreview=()=>flags.some(k=>new URLSearchParams(location.search).has(k));
  // A hidden preview must never borrow the parent's live collector.
  if(localPreview())return;
  try {if(parent!==window&&parent.NanaAnalytics){
    window.NanaAnalytics=parent.NanaAnalytics;
    for(const name of ['pointerdown','keydown','wheel'])document.addEventListener(name,()=>window.NanaAnalytics.touch(),{passive:true});
    window.addEventListener('error',event=>{const kind={IMG:'image',AUDIO:'audio',VIDEO:'video',SCRIPT:'script'}[event.target?.tagName]||(!event.target?.tagName?'script':null);if(kind)window.NanaAnalytics.record('error/'+kind,1,true);},true);
    return;
  }}catch(_){}
  let disabled=false,sent=0,mode=null,activity=null,lastInput=Date.now(),lastTick=Date.now();
  const onceKeys=new Set(), videoControllers=new WeakMap();
  try{disabled=localStorage.getItem(KEY)==='1';}catch(_){}
  function excluded(){let editing=false;try{editing=sessionStorage.getItem('nana-admin-session-v1')==='1';}catch(_){}
    return disabled||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true||editing||localPreview()||window.NanaProgress?.suppressed();}
  function endpoint(){try{const u=new URL(window.NANA_ANALYTICS_ENDPOINT);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash?u.href:null;}catch(_){return null;}}
  const active=()=>!!endpoint()&&!excluded();
  function record(event,value=1,once=false){
    const metric=catalogue.metrics[event];
    if(!metric||!active()||sent>=500||(once&&onceKeys.has(event)))return;
    if(metric.kind==='seconds'){if(!Number.isInteger(value)||value<1||value>1800)return;}else if(value!==1)return;
    onceKeys.add(event);sent++;
    try{fetch(endpoint(),{method:'POST',body:JSON.stringify({event,value}),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,headers:{'Content-Type':'text/plain'},cache:'no-store'}).catch(()=>{});}catch(_){}
  }
  function touch(){lastInput=Date.now();}
  function tick(){const now=Date.now(),delta=Math.max(0,Math.min(1500,now-lastTick));lastTick=now;
    if(!active()){if(mode)mode.ms=0;if(activity)activity.ms=0;return;}
    if(document.hidden||now-lastInput>60000)return;
    if(mode)mode.ms=Math.min(1800000,mode.ms+delta);
    // Notebook/newsletter dialogs cover the workshop: pause its active clock.
    if(activity&&!document.querySelector('dialog[open]'))activity.ms=Math.min(1800000,activity.ms+delta);
  }
  function duration(scope,type){if(scope)record('time/'+type+'/'+scope.id,Math.round(scope.ms/1000));}
  function endActivity(id){if(!activity||(id&&activity.id!==id))return;tick();duration(activity,'activity');
    if(catalogue.endings.includes(activity.id)&&!activity.complete)record('activity/exit/'+activity.id);
    activity=null;
  }
  function startActivity(id){if(!active())return;if(!Object.hasOwn(catalogue.games,id)||activity?.id===id)return;endActivity();touch();activity={id,ms:0,complete:false};record('activity/open/'+id);}
  function complete(id){if(activity?.id!==id||activity.complete)return;activity.complete=true;record('activity/complete/'+id);}
  function setMode(id){if(!active()){mode=null;return;}if(mode?.id===id)return;tick();duration(mode,'mode');mode=['play','work'].includes(id)?{id,ms:0}:null;touch();if(mode)record('mode/'+id);}
  function stop(){mode=null;activity=null;lastTick=Date.now();}
  window.NanaAnalytics={record,touch,startActivity,endActivity,complete,setMode,active,disabled:()=>disabled,
    // Compatibility for old cached pages: unselected legacy names are rejected.
    count:(event,once=true)=>record(event,1,once),
    setDisabled(value){disabled=!!value;stop();try{if(disabled)localStorage.setItem(KEY,'1');else localStorage.removeItem(KEY);}catch(_){}},
    trackVideo(video,id){
      if(!catalogue.metrics['motion/'+id+'/start'])return;
      videoControllers.get(video)?.abort();const controller=new AbortController();videoControllers.set(video,controller);
      const on=(name,fn)=>video.addEventListener(name,fn,{signal:controller.signal});
      let watched=0,previous=0;const reported=new Set();
      const mark=level=>{if(!reported.has(level)){reported.add(level);record('motion/'+id+'/'+level);}};
      on('playing',()=>{previous=video.currentTime;mark('start');});
      on('timeupdate',()=>{const current=video.currentTime,delta=current-previous;previous=current;
        if(!video.paused&&!video.seeking&&!document.hidden&&delta>0&&delta<2)watched+=delta;
        if(Number.isFinite(video.duration)&&video.duration>0){for(const p of [25,50])if(watched>=video.duration*p/100)mark(String(p));
          if(current>=video.duration-.5&&watched>=video.duration*.95)mark('end');}});
      on('seeking',()=>{previous=video.currentTime;});
    }
  };
  for(const name of ['pointerdown','keydown','wheel'])document.addEventListener(name,touch,{passive:true});
  setInterval(tick,1000);
  document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(!document.hidden)touch();});
  window.addEventListener('pagehide',()=>{endActivity();tick();duration(mode,'mode');mode=null;});
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){try{disabled=localStorage.getItem(KEY)==='1';}catch(_){disabled=true;}stop();}});
  // Resource failure category only. Never send URLs, exception messages or stacks.
  window.addEventListener('error',event=>{const tag=event.target?.tagName;const kind={IMG:'image',AUDIO:'audio',VIDEO:'video',SCRIPT:'script'}[tag]||(!tag?'script':null);if(kind)record('error/'+kind,1,true);},true);
  const path=location.pathname.replace(/\/$/,'/index.html');
  const standalone={'latte/index.html':'latte','tamagotchi/index.html':'tamagotchi','coloring-book/index.html':'coloring','about-me.html':'dressing','dreamlab.html':'mimilab'};
  if(!path.endsWith('/confidentialite.html')){
    record('site/open');
    const ua=navigator.userAgent||'';
    const device=/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'tablet':/Mobi|iPhone/i.test(ua)?'mobile':ua?'desktop':'unknown';
    record('device/'+device);
    let source='direct-unknown';try{const ref=new URL(document.referrer);if(ref.origin!==location.origin){source='other';for(const [domain,label] of [['instagram.com','instagram'],['facebook.com','facebook'],['pinterest.com','pinterest'],['pinterest.fr','pinterest'],['google.com','google'],['google.fr','google'],['bing.com','bing'],['linkedin.com','linkedin'],['youtube.com','youtube']])if(ref.hostname===domain||ref.hostname.endsWith('.'+domain)){source=label;break;}}}catch(_){}
    record('source/'+source);
    for(const [file,id] of Object.entries(standalone))if(path.endsWith('/'+file)){startActivity(id);break;}
    if(path.endsWith('/shop.html'))record('shop/open',1,true);
  }
  function mount(){
    const viewport=document.getElementById('play-viewport');let manualUntil=0;
    if(viewport){for(const name of ['pointerdown','touchstart','wheel'])viewport.addEventListener(name,()=>{manualUntil=Date.now()+3000;},{passive:true});
      viewport.addEventListener('scroll',()=>{if(Date.now()>manualUntil||!matchMedia('(max-width:1024px)').matches||document.getElementById('app')?.classList.contains('mode-work'))return;
        const extent=viewport.scrollWidth-viewport.clientWidth;if(extent<=0)return;const x=viewport.scrollLeft/extent;record('room/pan/'+(x<.33?'left':x>.66?'right':'middle'),1,true);},{passive:true});}
    document.addEventListener('click',event=>{const anchor=event.target.closest?.('a');if(!anchor)return;
      if(anchor.closest('.contact-list')||anchor.closest('#phone-page')){
        if(anchor.protocol==='mailto:')record('contact/email');else if(anchor.hostname==='www.instagram.com')record('contact/social');}
      // These explicit attributes are reserved for future real CV/payment links.
      if(anchor.matches('[data-analytics-cv="open"]'))record('cv/open');
      if(anchor.matches('[data-analytics-cv="download"]'))record('cv/download');
      if(anchor.matches('[data-analytics-buy]'))record('shop/buy');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
