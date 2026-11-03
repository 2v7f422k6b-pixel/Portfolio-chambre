/* Play room zone registry: one entry per illustrated PNG object.
   Adds missing interactive regions without altering existing click destinations.
   The silhouettes are derived from the transparent PNG layers at runtime. */
(() => {
  const svg = document.getElementById('hotspots');
  if (!svg) return;
  const zones = [
    ['imac','iMac','IMAC.PNG','[data-open="work-zoom"]'],
    ['gabzilla','T-shirt Gabzilla','TSHIRT GABZILLA.PNG','[data-open="gabzilla"]'],
    ['marshall','Enceinte Marshall','MARSHALL.PNG','[data-open="music"]'],
    ['cds','CD sur l’étagère','CDS.PNG','[data-mv-open]'],
    ['iphone','Smartphone','IPHONE.PNG','[data-open="phone"]'],
    ['tamagotchi','Tamagotchi','TAMAGOTCHI.PNG','[data-open="tamagotchi"]'],
    ['latte','Mug latte','MUG LATTE.PNG','[data-open="latte"]'],
    ['book','Livre La Princesse Clown','TALE.PNG','[data-open="book"]'],
    ['rilakkuma','Rilakkuma','RILAKKUMA.PNG','[data-open="about"]'],
    ['guitare','Guitare','GUITARE.PNG','[data-open="contact"]'],
    ['ring-light','Ring light','RING LIGHT.PNG','[aria-label="Open Photos via the ring light"]'],
    ['chat','Chat','CAT.PNG','[data-cat-pet]'],
    ['instax','Instax','INSTAX.PNG','[data-open="polaroids"]'],
    ['vase','Vase','VASE.PNG',null],
    ['guirlande','Lampe étoiles','STARS LAMP.PNG',null],
    ['jelly','Jelly lamp','JELLY LAMP.PNG',null],
    ['crayons-1','Crayons 1','CRAYONS 1.PNG',null],
    ['crayons-2','Crayons 2','CRAYONS 2.PNG',null],
    ['crayons-3','Crayons 3','CRAYONS 3.PNG',null],
    ['livres-1','Livres 1','BOOKS 1.PNG',null,'reading-room'],
    ['livres-2','Livres 2','BOOKS 2.PNG',null,'souvenues'],
    ['livres-3','Livres 3','BOOKS 3.PNG',null,'word-lab'],
    ['lampe-bureau','Lampe de bureau','OFFICE LAMP.PNG',null],
    ['ipad','iPad','IPAD.PNG',null],
    ['tapis','Tapis','RUG.PNG',null],
    ['miffy','Miffy clown','MIFFY.PNG',null],
    ['bambi-lampe','Lampe Bambi','BAMBI LAMP.PNG',null],
    ['sonny-angel','Sonny Angel','SONNY ANGEL.PNG',null],
    ['bretzel','Vase bretzel','BRETZEL.PNG',null]
  ].map(([id,label,file,selector,destination],i) => ({
    id,label,file,selector,destination,number:16+i,
    element: selector ? svg.querySelector('polygon'+selector) : null,
    center: null
  }));
  window.NANA_ROOM_ZONES = zones;
  for (const zone of zones) {
    if (zone.element) zone.element.dataset.roomZoneId = zone.id;
  }
  const W=1670, H=942, NS='http://www.w3.org/2000/svg';
  const firstPoster=svg.querySelector('polygon[data-type="poster"]');
  const toast=document.getElementById('toast');
  let toastTimer;

  // New zones are intentionally unassigned until their destination is approved.
  svg.addEventListener('click',event=>{
    const target=event.target.closest?.('polygon[data-zone-pending]');
    if(!target) return;
    event.preventDefault();
    event.stopPropagation();
    const zone=zones.find(z=>z.id===target.dataset.roomZoneId);
    if(!zone || !toast) return;
    toast.textContent='Zone '+zone.number+' · '+zone.label+' — destination à définir';
    toast.hidden=false;
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{toast.hidden=true;},3000);
  },true);

  function boundsFromAlpha(img){
    const canvas=document.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return null;
    try {
      ctx.drawImage(img,0,0,W,H);
      const raw=ctx.getImageData(0,0,W,H).data;
      const rows=[];
      let minX=W,minY=H,maxX=-1,maxY=-1;
      // Regular row samples preserve the irregular illustrated silhouette.
      for(let y=0;y<H;y+=3){
        let left=W,right=-1;
        for(let x=0;x<W;x+=3){
          if(raw[(y*W+x)*4+3]>35){
            if(x<left)left=x;
            if(x>right)right=x;
          }
        }
        if(right>=0){
          rows.push({y,left,right});
          if(left<minX)minX=left;
          if(right>maxX)maxX=right;
          if(y<minY)minY=y;
          if(y>maxY)maxY=y;
        }
      }
      if(!rows.length)return null;
      const jump=Math.max(1,Math.ceil(rows.length/32));
      const selected=rows.filter((row,i)=>i%jump===0||i===rows.length-1);
      const clamp=(v,limit)=>Math.max(0,Math.min(v,limit));
      const left=selected.map(r=>[clamp(r.left-3,W),clamp(r.y-3,H)]);
      const right=selected.slice().reverse().map(r=>[clamp(r.right+6,W),clamp(r.y+6,H)]);
      return {
        points:[...left,...right].map(p=>p.join(',')).join(' '),
        center:[(minX+maxX)/2,(minY+maxY)/2]
      };
    }catch(_){return null;}
  }
  function broadcast(){window.dispatchEvent(new Event('nana-room-zones-ready'));}
  function loadZone(zone){
    const img=new Image();img.decoding='async';
    img.onload=()=>{
      const hit=boundsFromAlpha(img);
      if(!hit)return;
      zone.center=hit.center;
      if(!zone.element){
        const poly=document.createElementNS(NS,'polygon');
        poly.setAttribute('points',hit.points);
        poly.setAttribute('aria-label',zone.destination ? zone.label+' — ouvrir '+({ 'reading-room':'La libraire vous conseille',souvenues:'Les Souvenues','word-lab':'Le laboratoire des mots'}[zone.destination]||zone.label) : zone.label+' — destination à définir');
        poly.setAttribute('tabindex','0');
        poly.dataset.roomZoneId=zone.id;
        if(zone.destination)poly.dataset.open=zone.destination;
        else poly.dataset.zonePending='';
        // Keep existing buttons/posters on top; these are additions only.
        if(firstPoster)svg.insertBefore(poly,firstPoster);
        else svg.appendChild(poly);
        zone.element=poly;
      }
      broadcast();
    };
    img.onerror=()=>{console.warn('Missing room object zone:',zone.file);};
    img.src='assets/'+encodeURIComponent(zone.file);
  }
  // Small asynchronous batches help iPad browsers under load.
  // Existing SVG hotspots already have geometry: only decode the 16 missing objects.
  const missing=zones.filter(zone=>!zone.element);
  let i=0;
  function batch(){
    const end=Math.min(i+2,missing.length);
    for(;i<end;i++)loadZone(missing[i]);
    if(i<missing.length)setTimeout(batch,140);
  }
  batch();
  broadcast();
})();