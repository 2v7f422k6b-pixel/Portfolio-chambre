/* Reliable first-click interaction for the Play room.
   Use the visible SVG hotspot geometry, with a small forgiving hit area.
   No asynchronous alpha masks or click interception. */
(() => {
  const scene=document.getElementById('play-scene');
  const svg=document.getElementById('hotspots');
  if(!scene||!svg)return;
  const selector='polygon[data-open],polygon[data-type="poster"],polygon[data-mv-open],polygon[data-cat-pet],polygon[data-vase-petal]';
  // Zones loaded asynchronously (including the vase) must be queried at click time.
  scene.addEventListener('click',event=>{
    if(!event.isTrusted||event.detail===0)return;
    if(event.target.closest?.(selector))return; // native hotspot clicks already work
    if(event.target.closest?.('button,a,input,textarea,select,[role="button"]'))return;
    const x=event.clientX,y=event.clientY;
    const sceneRect=scene.getBoundingClientRect();
    if(x<sceneRect.left||x>sceneRect.right||y<sceneRect.top||y>sceneRect.bottom)return;
    let best=null,bestScore=Infinity;
    for(const el of svg.querySelectorAll(selector)){
      const r=el.getBoundingClientRect();
      if(!r.width||!r.height)continue;
      const dx=Math.max(r.left-x,0,x-r.right);
      const dy=Math.max(r.top-y,0,y-r.bottom);
      const distance=Math.hypot(dx,dy);
      // A forgiving area, scaled with the room, without capturing distant clicks.
      const margin=Math.min(16,Math.max(7,sceneRect.width/110));
      if(distance>margin)continue;
      const score=distance*1000+r.width*r.height/10000;
      if(score<bestScore){best=el;bestScore=score}
    }
    if(best)best.click();
  });
})();
