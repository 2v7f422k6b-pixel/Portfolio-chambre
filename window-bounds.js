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

/* Pinch embedded windows independently of the room. The iframe keeps its
   layout size; only its painted content is magnified, below the close bar. */
(() => {
  'use strict';
  const host=document.getElementById('special-host');
  if(!host)return;
  const installed=new WeakSet();
  function attach(frame){
    let doc;
    try{doc=frame.contentDocument;if(!doc?.body)return;}catch(_){return;}
    if(installed.has(doc))return;
    installed.add(doc);
    let scale=1,x=0,y=0,gesture=null,moved=false;
    const point=t=>({x:t.screenX,y:t.screenY});
    const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
    function paint(){
      x=Math.min(0,Math.max(frame.offsetWidth*(1-scale),x));
      y=Math.min(0,Math.max(frame.offsetHeight*(1-scale),y));
      frame.style.transformOrigin='0 0';
      frame.style.transform=scale===1?'':`translate(${x}px,${y}px) scale(${scale})`;
      host.style.overflow=scale===1?'':'hidden';
    }
    function begin(e){      if(e.touches.length===1)moved=false;
      if(e.touches.length===2){
        const a=point(e.touches[0]),b=point(e.touches[1]);
        // client coordinates are in the untransformed iframe's coordinate space.
        const cx=(e.touches[0].clientX+e.touches[1].clientX)/2;
        const cy=(e.touches[0].clientY+e.touches[1].clientY)/2;
        gesture={kind:'pinch',distance:distance(a,b),mid:midpoint(a,b),scale,x,y,cx,cy};
        moved=true;e.preventDefault();e.stopImmediatePropagation();
      }else if(e.touches.length===1&&scale>1){
        gesture={kind:'pan',point:point(e.touches[0]),x,y};
        moved=false;
      }
    }
    function move(e){
      if(!gesture)return;
      if(e.touches.length===2&&gesture.kind==='pinch'){
        const a=point(e.touches[0]),b=point(e.touches[1]),mid=midpoint(a,b);
        scale=Math.max(1,Math.min(3,gesture.scale*distance(a,b)/Math.max(1,gesture.distance)));
        x=gesture.x+mid.x-gesture.mid.x-gesture.cx*(scale-gesture.scale);
        y=gesture.y+mid.y-gesture.mid.y-gesture.cy*(scale-gesture.scale);
      }else if(e.touches.length===1&&gesture.kind==='pan'){
        const p=point(e.touches[0]),dx=p.x-gesture.point.x,dy=p.y-gesture.point.y;
        if(Math.hypot(dx,dy)<5&&!moved)return;
        x=gesture.x+dx;y=gesture.y+dy;moved=true;
      }else return;
      e.preventDefault();e.stopImmediatePropagation();paint();
    }
    function end(e){
      if(moved){e.preventDefault();e.stopImmediatePropagation();}
      gesture=null;
      if(e.touches.length)begin(e);
    }
    const options={capture:true,passive:false};
    doc.addEventListener('touchstart',begin,options);
    doc.addEventListener('touchmove',move,options);
    doc.addEventListener('touchend',end,options);
    doc.addEventListener('touchcancel',()=>{gesture=null;moved=false;},options);
    doc.addEventListener('click',e=>{
      if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false;}
    },true);
  }
  function scan(){
    for(const frame of host.querySelectorAll('iframe')){
      if(!frame.dataset.nanaPinchReady){
        frame.dataset.nanaPinchReady='1';
        frame.addEventListener('load',()=>attach(frame));
      }
      attach(frame);
    }
    if(!host.querySelector('iframe'))host.style.removeProperty('overflow');
  }
  new MutationObserver(scan).observe(host,{childList:true});
  scan();
})();
