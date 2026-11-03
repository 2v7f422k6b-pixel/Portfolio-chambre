/* BRETZEL · FLOATING PIXEL REALITY
   The room does not dissolve into nothing: it becomes a living cloud of
   small colored pixels sampled from the original artwork. All interactive
   room zones are invisible and inert until the visitor rebuilds the room. */
(() => {
  'use strict';
  const app=document.getElementById('app');
  const viewport=document.getElementById('play-viewport');
  const scene=document.getElementById('play-scene');
  const hotspots=document.getElementById('hotspots');
  if(!app||!viewport||!scene||!hotspots)return;

  const W=1670,H=942;
  const COLS=210,ROWS=118; // Small pixels, about half the size of the previous version
  const REDUCE=window.matchMedia('(prefers-reduced-motion: reduce)');
  const INTRO_MS=1650,RESTORE_MS=1450;
  const style=document.createElement('style');
  style.id='nana-floating-pixels-css';
  style.textContent=[
    '#play-viewport.nana-pixel-chaos,html[data-theme="night"] #play-viewport.nana-pixel-chaos {',
    '  background:radial-gradient(ellipse at 50% 45%,#6546a6 0%,#38235a 58%,#1c1236 100%) !important;',
    '}',
    '#play-viewport.nana-pixel-chaos #play-scene {background:transparent!important;}',
    '#play-viewport.nana-pixel-chaos #play-scene > :not(#nana-pixel-field) {',
    '  visibility:hidden!important;pointer-events:none!important;',
    '}',
    '#play-viewport.nana-pixel-chaos #hotspots,',
    '#play-viewport.nana-pixel-chaos #hotspots *,',
    '#play-viewport.nana-pixel-chaos #pixel-outline-overlay,',
    '#play-viewport.nana-pixel-chaos #hotspot-numbers,',
    '#play-viewport.nana-pixel-chaos #hotspot-guide,',
    '#play-viewport.nana-pixel-chaos #hotspot-number-control {',
    '  visibility:hidden!important;pointer-events:none!important;opacity:0!important;',
    '}',
    '#app.nana-reality-active #dock {opacity:0!important;pointer-events:none!important;}',
    '#nana-pixel-field {',
    '  position:absolute;inset:0;width:100%;height:100%;z-index:2200;',
    '  display:block;pointer-events:none!important;image-rendering:pixelated;',
    '}',
    '#nana-pixel-field[hidden],#nana-untwist[hidden] {display:none!important;}',
    '#nana-untwist {',
    '  position:fixed;top:calc(var(--menubar,42px) + 13px);left:50%;z-index:3500;',
    '  transform:translateX(-50%);border:2px solid #ff173b;border-radius:0;',
    '  background:#fff2fc;color:#ff173b;box-shadow:4px 4px 0 #ff173b77;',
    '  padding:9px 15px;font:800 14px/1.2 "Courier New",monospace;',
    '  letter-spacing:.015em;white-space:nowrap;max-width:calc(100vw - 20px);',
    '  cursor:pointer;touch-action:manipulation;',
    '}',
    '#nana-untwist:hover {background:#ff173b;color:#fff2fc;}',
    '#nana-untwist:focus-visible {outline:3px solid #6546a6;outline-offset:3px;}',
    '@media(max-width:600px){#nana-untwist {top:calc(var(--menubar,40px) + 8px);',
    '  font-size:11px;padding:7px 9px;}}'
  ].join('\n');
  document.head.appendChild(style);

  const field=document.createElement('canvas');
  field.id='nana-pixel-field';
  field.setAttribute('aria-hidden','true');
  field.hidden=true;
  scene.appendChild(field);
  const ctx=field.getContext('2d',{alpha:true});
  const sampler=document.createElement('canvas');
  sampler.width=COLS;
  sampler.height=ROWS;
  const sctx=sampler.getContext('2d',{willReadFrequently:true});
  if(!ctx||!sctx)return;

  const undo=document.createElement('button');
  undo.id='nana-untwist';
  undo.type='button';
  undo.textContent='↶ REBUILD REALITY';
  undo.setAttribute('aria-label','Reconstituer la chambre avec les pixels');
  undo.hidden=true;
  document.body.appendChild(undo);

  // Load existing framed poster artwork, so its actual colors join the pixel cloud.
  const posterCache=new Map();
  function loadPoster(src){
    if(!src||posterCache.has(src))return;
    const image=new Image();
    image.decoding='async';
    posterCache.set(src,image);
    image.src=src;
  }
  hotspots.querySelectorAll('image.poster-artwork').forEach(el=>
    loadPoster(el.getAttribute('href')||el.getAttribute('xlink:href'))
  );

  function posterComposite(){
    const xScale=COLS/W,yScale=ROWS/H;
    hotspots.querySelectorAll('image.poster-artwork').forEach(el=>{
      const href=el.getAttribute('href')||el.getAttribute('xlink:href');
      const image=posterCache.get(href);
      if(!image||!image.complete||!image.naturalWidth)return;
      const x=Number(el.getAttribute('x'))*xScale;
      const y=Number(el.getAttribute('y'))*yScale;
      const width=Number(el.getAttribute('width'))*xScale;
      const height=Number(el.getAttribute('height'))*yScale;
      if(!width||!height)return;
      const clip=el.getAttribute('clip-path')||'';
      const clipId=/url\(#([^)]+)\)/.exec(clip)?.[1];
      const polygon=clipId && document.getElementById(clipId)?.querySelector('polygon');
      sctx.save();
      if(polygon){
        const pts=(polygon.getAttribute('points')||'').trim().split(/\s+/);
        let first=true;
        sctx.beginPath();
        for(const p of pts){
          const [px,py]=p.split(',').map(Number);
          if(!Number.isFinite(px)||!Number.isFinite(py))continue;
          if(first){sctx.moveTo(px*xScale,py*yScale);first=false;}
          else sctx.lineTo(px*xScale,py*yScale);
        }
        sctx.closePath();
        sctx.clip();
      }
      const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
      const drawWidth=image.naturalWidth*scale;
      const drawHeight=image.naturalHeight*scale;
      sctx.drawImage(image,x+(width-drawWidth)/2,y+(height-drawHeight)/2,drawWidth,drawHeight);
      sctx.restore();
    });
  }

  function noise(seed){
    const n=Math.sin(seed*127.1+78.233)*43758.5453;
    return n-Math.floor(n);
  }
  const pixels=[];
  for(let row=0;row<ROWS;row++){
    for(let col=0;col<COLS;col++){
      const id=row*COLS+col;
      pixels.push({
        x:(col+.5)/COLS,
        y:(row+.5)/ROWS,
        phase:noise(id+31)*Math.PI*2,
        drift:noise(id+131),
        offsetX:noise(id+313)-.5,
        offsetY:noise(id+671)-.5,
        frequency:.55+noise(id+1131),
        size:.65+noise(id+2101)*.33,
        color:'#e9b5ff'
      });
    }
  }
  function sampleColors(){
    const day=document.getElementById('room-img');
    const night=document.getElementById('room-night');
    sctx.clearRect(0,0,COLS,ROWS);
    try{
      if(day?.complete&&day.naturalWidth)sctx.drawImage(day,0,0,COLS,ROWS);
      else {sctx.fillStyle='#e9b5ff';sctx.fillRect(0,0,COLS,ROWS);}
      if(night?.complete&&night.naturalWidth){
        const opacity=parseFloat(getComputedStyle(night).opacity);
        if(opacity>.05){
          sctx.save();
          sctx.globalAlpha=Math.min(1,Math.max(0,opacity));
          sctx.drawImage(night,0,0,COLS,ROWS);
          sctx.restore();
        }
      }
      posterComposite();
      const rgba=sctx.getImageData(0,0,COLS,ROWS).data;
      for(let i=0;i<pixels.length;i++){
        const k=i*4;
        pixels[i].color='rgb('+rgba[k]+','+rgba[k+1]+','+rgba[k+2]+')';
      }
    }catch(e){
      // If sampling is blocked, the visual effect still functions in the site's palette.
      const colors=['#ff173b','#e9b5ff','#fff2fc','#6546a6','#e5a4e3','#ffb5cf'];
      pixels.forEach((p,i)=>p.color=colors[i%colors.length]);
    }
  }

  let active=false,animation=null,frameId=0,lastPaint=-Infinity;
  let mix=0,origin={x:.5,y:.5};
  function locateOrigin(e,target){
    const zone=window.NANA_ROOM_ZONES?.find(item=>item.id==='bretzel');
    if(zone?.center){
      origin={x:zone.center[0]/W,y:zone.center[1]/H};
    }else if(target?.getBBox){
      const rect=target.getBBox();
      origin={x:(rect.x+rect.width/2)/W,y:(rect.y+rect.height/2)/H};
    }else{
      const bounds=scene.getBoundingClientRect();
      origin={
        x:(e.clientX-bounds.left)/Math.max(1,bounds.width),
        y:(e.clientY-bounds.top)/Math.max(1,bounds.height)
      };
    }
    origin.x=Math.max(0,Math.min(1,origin.x));
    origin.y=Math.max(0,Math.min(1,origin.y));
  }
  function resizeField(){
    const width=scene.clientWidth||1670,height=scene.clientHeight||942;
    const ratio=Math.min(1.5,window.devicePixelRatio||1);
    const pw=Math.round(width*ratio),ph=Math.round(height*ratio);
    if(field.width!==pw||field.height!==ph){
      field.width=pw;field.height=ph;
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);
    return {width,height};
  }
  function wrap(value){return value-Math.floor(value);}
  function ease(t){return t*t*(3-2*t);}
  function render(now){
    const {width,height}=resizeField();
    ctx.clearRect(0,0,width,height);
    const t=now*.001;
    const gridW=width/COLS;
    const gridH=height/ROWS;
    const magnitude=Math.max(0,Math.min(1,mix));
    ctx.globalAlpha=.96;
    for(const p of pixels){
      // Each color tile starts exactly where it belongs to the real illustration.
      // Mixed state: separate orbits, opposing currents, and gentle random drift.
      const dx=(p.x-origin.x)*1.6,dy=p.y-origin.y;
      const r=Math.hypot(dx,dy);
      const angle=magnitude*(1.95+.36*Math.sin(t*.37+r*7)) * Math.exp(-r*.6);
      const rotatedX=dx*Math.cos(angle)-dy*Math.sin(angle);
      const rotatedY=dx*Math.sin(angle)+dy*Math.cos(angle);
      const currentX=.13*Math.sin(rotatedY*17+t*.78+p.phase*.28)
         +.063*Math.sin(rotatedX*29-t*.53+p.phase);
      const currentY=.12*Math.cos(rotatedX*19-t*.7+p.phase*.21)
         +.068*Math.sin(rotatedY*26+t*.59+p.phase);
      const floatingX=.045*Math.sin(t*p.frequency*.59+p.phase)
         +t*.0019*p.offsetX;
      const floatingY=.045*Math.cos(t*p.frequency*.63+p.phase)
         +t*.0016*p.offsetY;
      const x=wrap(p.x+magnitude*((rotatedX-dx)/1.6+currentX
        +p.offsetX*.26+floatingX));
      const y=wrap(p.y+magnitude*(rotatedY-dy+currentY
        +p.offsetY*.25+floatingY));
      const pixelSize=Math.max(1.4,Math.min(gridW,gridH)*p.size);
      ctx.fillStyle=p.color;
      ctx.fillRect(
        Math.round(x*width-pixelSize/2),
        Math.round(y*height-pixelSize/2),
        pixelSize,pixelSize
      );
    }
    ctx.globalAlpha=1;
  }

  function paint(now){
    frameId=0;
    if(!active)return;
    // Keep the suspended pixel cloud alive; it never fades away or ends on a void.
    if(!REDUCE.matches&&now-lastPaint<29){
      frameId=requestAnimationFrame(paint);
      return;
    }
    lastPaint=now;
    if(animation){
      const amount=Math.min(1,Math.max(0,(now-animation.start)/animation.duration));
      mix=animation.from+(animation.to-animation.from)*ease(amount);
      if(amount>=1){
        mix=animation.to;
        animation=null;
      }
    }
    render(now);
    if(!animation&&mix<=0){
      reset();
      return;
    }
    if(!REDUCE.matches)frameId=requestAnimationFrame(paint);
  }
  function startFrame(){
    if(frameId)cancelAnimationFrame(frameId);
    lastPaint=-Infinity;
    frameId=requestAnimationFrame(paint);
  }
  function reset(){
    active=false;
    animation=null;
    mix=0;
    if(frameId)cancelAnimationFrame(frameId);
    frameId=0;
    app.classList.remove('nana-reality-active');
    viewport.classList.remove('nana-pixel-chaos');
    field.hidden=true;
    undo.hidden=true;
    ctx.clearRect(0,0,field.width,field.height);
  }
  function dissolve(e,target){
    if(active)return;
    locateOrigin(e,target);
    sampleColors();
    active=true;
    mix=REDUCE.matches?1:0;
    animation=REDUCE.matches?null:{
      from:0,to:1,start:performance.now(),duration:INTRO_MS
    };
    // The SVG polygons, outlines, and their click targets disappear immediately.
    app.classList.add('nana-reality-active');
    viewport.classList.add('nana-pixel-chaos');
    field.hidden=false;
    undo.hidden=false;
    startFrame();
  }
  function rebuild(){
    if(!active)return;
    if(REDUCE.matches){reset();return;}
    animation={
      from:mix,to:0,start:performance.now(),
      duration:Math.max(250,RESTORE_MS*mix)
    };
    startFrame();
  }

  hotspots.addEventListener('click',e=>{
    const target=e.target.closest?.('polygon[data-open="twist-reality"]');
    if(!target||!app.classList.contains('mode-play'))return;
    e.preventDefault();e.stopImmediatePropagation();
    dissolve(e,target);
  },true);
  undo.addEventListener('click',rebuild);
  window.addEventListener('keydown',e=>{
    if(!active||e.key!=='Escape')return;
    e.preventDefault();e.stopImmediatePropagation();
    rebuild();
  },true);
  new MutationObserver(()=>{
    if(active&&!app.classList.contains('mode-play'))reset();
  }).observe(app,{attributes:true,attributeFilter:['class']});
  window.addEventListener('pagehide',reset);
})();
