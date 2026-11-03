/* BRETZEL · Pixel Dissolution
   A reversible pixel erosion travels from the vase across the real illustrated
   room. CSS masks the actual DOM, so posters, lamps and every hotspot are
   dissolved together without redrawing or moving their coordinate system.
   Colored fragments are rendered on a separate, noninteractive canvas. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const viewport = document.getElementById('play-viewport');
  const scene = document.getElementById('play-scene');
  const hotspots = document.getElementById('hotspots');
  if (!app || !viewport || !scene || !hotspots) return;

  const W = 1670;
  const H = 942;
  const COLS = 104;
  const ROWS = 59;
  const CELL = 8; // 16 screen-space illustration pixels per mask tile
  const MASK_W = COLS * CELL;
  const MASK_H = ROWS * CELL;
  const DISSOLVE_MS = 2800;
  const RESTORE_MS = 1600;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const css = document.createElement('style');
  css.id = 'nana-pixel-dissolution-style';
  css.textContent = [
    '#play-viewport.nana-reality-void,html[data-theme="night"] #play-viewport.nana-reality-void {',
    '  background:radial-gradient(ellipse at var(--nana-twist-x,50%) var(--nana-twist-y,50%),#4e205a 0%,#210d37 42%,#10091e 80%) !important;',
    '}',
    '#play-viewport.nana-reality-void::after {',
    '  content:"";position:fixed;inset:var(--menubar,42px) 0 0;z-index:0;pointer-events:none;',
    '  background:repeating-linear-gradient(0deg,transparent 0 34px,rgba(244,167,236,.04) 34px 35px),',
    '    repeating-linear-gradient(90deg,transparent 0 34px,rgba(244,167,236,.04) 34px 35px);',
    '}',
    '#nana-pixel-fragments {position:fixed;inset:0;width:100%;height:100%;z-index:2100;pointer-events:none;display:block;}',
    '#nana-untwist {',
    '  position:fixed;left:50%;top:calc(var(--menubar,42px) + 14px);z-index:3100;',
    '  transform:translateX(-50%);padding:10px 18px;border:2px solid #ff173b;',
    '  border-radius:0;background:#fff2fc;color:#ff173b;cursor:pointer;',
    '  box-shadow:4px 4px 0 #ff173b80;',
    '  font:800 15px/1.15 "Courier New",monospace;letter-spacing:.015em;',
    '  white-space:nowrap;touch-action:manipulation;max-width:calc(100vw - 24px);',
    '}',
    '#nana-untwist:hover {background:#ff173b;color:#fff2fc;}',
    '#nana-untwist:focus-visible {outline:3px solid #6546a6;outline-offset:3px;}',
    '#nana-untwist[hidden],#nana-reality-error[hidden] {display:none!important;}',
    '#nana-reality-error {',
    '  position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2050;',
    '  text-align:center;color:#fff2fc;pointer-events:none;',
    '  font:800 clamp(18px,3.6vw,42px)/1.25 "Courier New",monospace;',
    '  text-shadow:3px 3px 0 #ff173b,0 0 24px #ff173b66;',
    '}',
    '#nana-reality-error small {display:block;font:600 12px/1.4 "Courier New",monospace;',
    '  letter-spacing:.12em;margin-top:12px;text-shadow:none;}',
    '@media(max-width:600px){',
    ' #nana-untwist {top:calc(var(--menubar,40px) + 10px);font-size:12px;padding:8px 11px;}',
    ' #nana-reality-error small {font-size:10px;}',
    '}'
  ].join('\n');
  document.head.appendChild(css);

  const undo = document.createElement('button');
  undo.id = 'nana-untwist';
  undo.type = 'button';
  undo.textContent = '↶ REBUILD REALITY';
  undo.setAttribute('aria-label','Reconstruire la chambre pixel par pixel');
  undo.hidden = true;
  document.body.appendChild(undo);

  const notice = document.createElement('div');
  notice.id = 'nana-reality-error';
  notice.setAttribute('aria-live','polite');
  notice.innerHTML = '404 · REALITY NOT FOUND<small>CLICK REBUILD REALITY TO RECONNECT</small>';
  notice.hidden = true;
  document.body.appendChild(notice);

  const particlesCanvas = document.createElement('canvas');
  particlesCanvas.id = 'nana-pixel-fragments';
  particlesCanvas.setAttribute('aria-hidden','true');
  particlesCanvas.hidden = true;
  particlesCanvas.style.display = 'none';
  document.body.appendChild(particlesCanvas);
  const particlesCtx = particlesCanvas.getContext('2d',{alpha:true});

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = MASK_W;
  maskCanvas.height = MASK_H;
  const maskCtx = maskCanvas.getContext('2d',{alpha:true});
  if(!maskCtx || !particlesCtx) return;

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = COLS;
  sampleCanvas.height = ROWS;
  const sampleCtx = sampleCanvas.getContext('2d',{willReadFrequently:true});

  function noise(n) {
    const t = Math.sin(n * 127.1 + 78.233) * 43758.5453123;
    return t - Math.floor(t);
  }
  const cells = [];
  for (let row=0; row<ROWS; row++) {
    for (let col=0; col<COLS; col++) {
      const id = row*COLS+col;
      cells.push({
        x:(col+.5)/COLS,y:(row+.5)/ROWS,
        col,row,
        jitter:noise(id+5),
        wiggle:noise(id+531),
        direction:noise(id+2017)*Math.PI*2,
        size:.55+noise(id+919)*.75,
        color:'#cf9bdb',
        threshold:0
      });
    }
  }

  let origin = {x:.5,y:.5};
  let progress = 0; // 0 = entire scene, 1 = dissolved
  let animation = null;
  let raf = 0;
  let lastFrame = 0;
  let lastMask = -1;
  let active = false;

  function refreshPalette() {
    if (!sampleCtx) return;
    const base = document.getElementById('room-img');
    const night = document.getElementById('room-night');
    try {
      sampleCtx.clearRect(0,0,COLS,ROWS);
      if (base && base.complete && base.naturalWidth) {
        sampleCtx.drawImage(base,0,0,COLS,ROWS);
      } else {
        sampleCtx.fillStyle='#e9b5ff';
        sampleCtx.fillRect(0,0,COLS,ROWS);
      }
      const opacity = night ? Number(getComputedStyle(night).opacity) : 0;
      if (night && night.complete && night.naturalWidth && opacity>0.1) {
        sampleCtx.globalAlpha = Math.min(1,Math.max(0,opacity));
        sampleCtx.drawImage(night,0,0,COLS,ROWS);
        sampleCtx.globalAlpha = 1;
      }
      const data=sampleCtx.getImageData(0,0,COLS,ROWS).data;
      for(let i=0;i<cells.length;i++) {
        const k=i*4;
        cells[i].color='rgb('+data[k]+','+data[k+1]+','+data[k+2]+')';
      }
    } catch (_) {
      // The mask still dissolves the actual room if pixel-color sampling fails.
      const palette=['#ff173b','#6546a6','#e9b5ff','#ffc5d9','#fff2fc'];
      for(let i=0;i<cells.length;i++)cells[i].color=palette[i%palette.length];
    } finally {
      if(sampleCtx)sampleCtx.globalAlpha=1;
    }
  }

  function configureOrigin(event,target) {
    let x,y;
    const rect=scene.getBoundingClientRect();
    const zone=window.NANA_ROOM_ZONES &&
      window.NANA_ROOM_ZONES.find(item=>item.id==='bretzel');
    if (zone && zone.center) {
      x=zone.center[0]/W;
      y=zone.center[1]/H;
    } else if(target && target.getBBox) {
      const b=target.getBBox();
      x=(b.x+b.width*.5)/W;
      y=(b.y+b.height*.5)/H;
    } else {
      x=(event.clientX-rect.left)/Math.max(1,rect.width);
      y=(event.clientY-rect.top)/Math.max(1,rect.height);
    }
    origin={x:Math.min(1,Math.max(0,x)),y:Math.min(1,Math.max(0,y))};
    viewport.style.setProperty('--nana-twist-x',(origin.x*100).toFixed(1)+'%');
    viewport.style.setProperty('--nana-twist-y',(origin.y*100).toFixed(1)+'%');
    const maxDist=Math.max(
      Math.hypot(origin.x*W,origin.y*H),
      Math.hypot((1-origin.x)*W,origin.y*H),
      Math.hypot(origin.x*W,(1-origin.y)*H),
      Math.hypot((1-origin.x)*W,(1-origin.y)*H)
    );
    for (const cell of cells) {
      const dx=(cell.x-origin.x)*W;
      const dy=(cell.y-origin.y)*H;
      const radial=Math.hypot(dx,dy)/Math.max(1,maxDist);
      const zigzag=.025*Math.sin(cell.row*.65+cell.wiggle*6);
      cell.threshold=Math.max(.002,Math.min(.96, .005+radial*.79+cell.jitter*.15+zigzag));
    }
  }

  function applyMask() {
    if(progress<=.0001) {
      scene.style.removeProperty('mask-image');
      scene.style.removeProperty('-webkit-mask-image');
      scene.style.removeProperty('mask-size');
      scene.style.removeProperty('-webkit-mask-size');
      lastMask=-1;
      return;
    }
    // The image is rasterized at half scene resolution with crisp square cells.
    maskCtx.clearRect(0,0,MASK_W,MASK_H);
    maskCtx.fillStyle='#fff';
    for(const cell of cells) {
      if(progress<cell.threshold) {
        maskCtx.fillRect(cell.col*CELL,cell.row*CELL,CELL,CELL);
      }
    }
    const image='url("'+maskCanvas.toDataURL('image/png')+'")';
    scene.style.setProperty('mask-image',image);
    scene.style.setProperty('-webkit-mask-image',image);
    scene.style.setProperty('mask-size','100% 100%');
    scene.style.setProperty('-webkit-mask-size','100% 100%');
    lastMask=progress;
  }

  function sizeParticlesCanvas(){
    const ratio=Math.min(2,window.devicePixelRatio||1);
    const w=Math.max(1,window.innerWidth);
    const h=Math.max(1,window.innerHeight);
    const nw=Math.round(w*ratio),nh=Math.round(h*ratio);
    if(particlesCanvas.width!==nw || particlesCanvas.height!==nh) {
      particlesCanvas.width=nw;
      particlesCanvas.height=nh;
    }
    particlesCtx.setTransform(ratio,0,0,ratio,0,0);
    return {w,h};
  }
  function renderFragments() {
    const {w,h}=sizeParticlesCanvas();
    particlesCtx.clearRect(0,0,w,h);
    if(progress<.001 || progress>.999) return;
    const rect=scene.getBoundingClientRect();
    const tileW=rect.width/COLS;
    const tileH=rect.height/ROWS;
    const forward=animation ? animation.to===1 : true;
    for(const cell of cells) {
      const delta=forward ? progress-cell.threshold : cell.threshold-progress;
      if(delta<0 || delta>.26) continue;
      const age=delta/.26;
      const eased=1-Math.pow(1-age,2);
      const dx=(cell.x-origin.x);
      const dy=(cell.y-origin.y);
      const len=Math.max(.01,Math.hypot(dx,dy));
      const outward=80+135*cell.size;
      const swing=Math.sin(age*12+cell.wiggle*12)*12;
      const x=rect.left+cell.x*rect.width +
        (dx/len*outward+Math.cos(cell.direction)*50)*eased + swing;
      const y=rect.top+cell.y*rect.height +
        (dy/len*outward+Math.sin(cell.direction)*38)*eased+
        85*age*age;
      const size=(.7+.4*cell.size)*(1-.55*age);
      const alpha=Math.max(0,Math.min(1,(1-age)*1.4));
      particlesCtx.globalAlpha=alpha;
      particlesCtx.fillStyle=cell.color;
      particlesCtx.fillRect(
        Math.round(x-tileW*size*.5),Math.round(y-tileH*size*.5),
        Math.max(2,Math.round(tileW*size)),Math.max(2,Math.round(tileH*size))
      );
      if(cell.wiggle>.93 && age<.5) {
        particlesCtx.globalAlpha=alpha*.65;
        particlesCtx.fillStyle='#fff2fc';
        particlesCtx.fillRect(Math.round(x+tileW),Math.round(y-tileH),Math.max(2,tileW*.28),Math.max(2,tileH*.28));
      }
    }
    particlesCtx.globalAlpha=1;
  }

  function ease(t){return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;}
  function frame(now) {
    raf=0;
    if(!active)return;
    if(now-lastFrame<30) {
      raf=requestAnimationFrame(frame);
      return;
    }
    lastFrame=now;
    if(animation) {
      const t=Math.max(0,Math.min(1,(now-animation.start)/animation.duration));
      progress=animation.from+(animation.to-animation.from)*ease(t);
      if(t>=1){
        progress=animation.to;
        animation=null;
      }
    }
    if(Math.abs(progress-lastMask)>.0002 || progress===0 || progress===1)applyMask();
    renderFragments();
    const ended=!animation;
    if(ended && progress>=.999){
      notice.hidden=false;
      particlesCtx.clearRect(0,0,particlesCanvas.width,particlesCanvas.height);
      particlesCanvas.hidden=true;
      particlesCanvas.style.display='none';
      return;
    }
    if(ended && progress<=.001){
      finish();
      return;
    }
    raf=requestAnimationFrame(frame);
  }

  function finish() {
    active=false;
    progress=0;
    animation=null;
    if(raf)cancelAnimationFrame(raf);
    raf=0;
    applyMask();
    notice.hidden=true;
    undo.hidden=true;
    viewport.classList.remove('nana-reality-void');
    particlesCanvas.hidden=true;
    particlesCanvas.style.display='none';
    particlesCtx.clearRect(0,0,particlesCanvas.width,particlesCanvas.height);
  }

  function animateTo(target){
    if(!active && target===0)return;
    if(reduceMotion.matches){
      active=target===1;
      progress=target;
      if(target===1){
        viewport.classList.add('nana-reality-void');
        undo.hidden=false;
        notice.hidden=false;
        applyMask();
      } else finish();
      return;
    }
    if(target===1 && !active){
      active=true;
      progress=0;
      refreshPalette();
      viewport.classList.add('nana-reality-void');
      undo.hidden=false;
    }
    notice.hidden=true;
    particlesCanvas.hidden=false;
    particlesCanvas.style.display='block';
    if(raf)cancelAnimationFrame(raf);
    animation={
      from:progress,to:target,start:performance.now(),
      duration:Math.max(180,Math.abs(target-progress)*(target===1?DISSOLVE_MS:RESTORE_MS))
    };
    lastFrame=-Infinity;
    raf=requestAnimationFrame(frame);
  }

  hotspots.addEventListener('click',event=>{
    const target=event.target.closest &&
      event.target.closest('polygon[data-open="twist-reality"]');
    if(!target || !app.classList.contains('mode-play'))return;
    event.preventDefault();
    event.stopPropagation();
    if(active)return;
    configureOrigin(event,target);
    animateTo(1);
  },true);

  undo.addEventListener('click',()=>{
    if(!active)return;
    animateTo(0);
  });

  // Escape restores the scene before the site's existing Escape-to-home logic.
  window.addEventListener('keydown',event=>{
    if(!active || event.key!=='Escape')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    animateTo(0);
  },true);

  // Switching modes or leaving the room never traps the visitor in the void.
  new MutationObserver(()=>{
    if(active && !app.classList.contains('mode-play'))finish();
  }).observe(app,{attributes:true,attributeFilter:['class']});
  window.addEventListener('pagehide',finish);
})();