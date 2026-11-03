/* Fortune cookie on the glass coffee table.
   User-supplied transparent illustration; no redraw and no distortion.
   Calibrate by dragging the cookie at ?cookieEdit=1; copy the saved coordinates. */
(() => {
  'use strict';
  const svg = document.getElementById('hotspots');
  const viewport = document.getElementById('play-viewport');
  if (!svg || !viewport || document.getElementById('nana-fortune-cookie')) return;

  const NS='http://www.w3.org/2000/svg';
  const ROOM_W=1670, ROOM_H=942, IMG_RATIO=300/283;
  const key='nana-fortune-cookie-position-v2';
  const editor=new URLSearchParams(location.search).get('cookieEdit')==='1';
  const defaults={x:841.88,y:763.25,width:36,angle:-21};
  const position={...defaults};

  try {
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    if(saved && ['x','y','width'].every(k=>Number.isFinite(saved[k])))
      Object.assign(position,{x:saved.x,y:saved.y,width:saved.width,
        angle:Number.isFinite(saved.angle)?clamp(saved.angle,-30,30):0});
  } catch (_) {}

  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function save(){try{localStorage.setItem(key,JSON.stringify(position));}catch(_){}}
  function element(tag,attrs={}) {
    const el=document.createElementNS(NS,tag);
    for(const [name,value] of Object.entries(attrs))el.setAttribute(name,String(value));
    return el;
  }

  const group=element('g',{id:'nana-fortune-cookie'});
  const image=element('image',{
    href:'assets/fortune-cookie.png',
    'aria-hidden':'true',
    'pointer-events':'none',
    preserveAspectRatio:'xMidYMid meet'
  });
  const hit=element('polygon',{
    'data-open':'fortune-cookie',
    'aria-label':editor?'Déplacer le fortune cookie sur la table':'Ouvrir un fortune cookie',
    tabindex:'0',
    role:'button',
    fill:'rgba(255,255,255,0.001)',
    stroke:'none',
    'pointer-events':'all'
  });
  hit.style.cursor=editor?'grab':'pointer';
  hit.style.touchAction=editor?'none':'manipulation';
  group.append(image,hit);
  svg.appendChild(group);

  function render(){
    position.width=clamp(position.width,20,220);
    position.angle=clamp(position.angle,-30,30);
    const height=position.width*IMG_RATIO;
    position.x=clamp(position.x,0,ROOM_W-position.width);
    position.y=clamp(position.y,0,ROOM_H-height);
    group.setAttribute('transform',`rotate(${position.angle} ${position.x+position.width/2} ${position.y+height/2})`);
    image.setAttribute('x',position.x);
    image.setAttribute('y',position.y);
    image.setAttribute('width',position.width);
    image.setAttribute('height',height);
    hit.setAttribute('points',[
      [position.x,position.y],
      [position.x+position.width,position.y],
      [position.x+position.width,position.y+height],
      [position.x,position.y+height]
    ].map(point=>point.join(',')).join(' '));
    if(editor)updateEditor();
  }

  // A preview oracle until the full fortune-cookie game is illustrated.
  const fortunes=[
    'Quelque chose de joli se cache dans un détail.',
    'Aujourd’hui, suis une idée un peu bizarre.',
    'Une rencontre inattendue apportera une histoire.',
    'Tu trouveras peut-être la réponse dans un livre.',
    'Le hasard a de très bonnes manières.',
    'Une petite création vaut mieux qu’une grande hésitation.',
    'Les étoiles ont oublié de te prévenir : tout peut changer.',
    'Tu as le droit de recommencer la page.',
    'Ton prochain détour pourrait bien être le bon.',
    'Ce soir, laisse une place à l’imprévu.'
  ];
  function fortune(){
    const toast=document.getElementById('toast');
    if(!toast)return;
    const phrase=fortunes[Math.floor(Math.random()*fortunes.length)];
    toast.textContent='🥠 '+phrase;
    toast.hidden=false;
    clearTimeout(fortune.timer);
    fortune.timer=setTimeout(()=>{toast.hidden=true;},5200);
  }

  let panel=null, text=null, sizeInput=null, sizeLabel=null, angleInput=null, angleLabel=null;
  function updateEditor(){
    if(text)text.textContent='x : '+Math.round(position.x)+' · y : '+Math.round(position.y);
    if(sizeInput)sizeInput.value=String(Math.round(position.width));
    if(sizeLabel)sizeLabel.textContent=Math.round(position.width)+' px';
    if(angleInput)angleInput.value=String(position.angle);
    if(angleLabel)angleLabel.textContent=position.angle+'°';
  }
  function resizeCookie(width){
    width=clamp(width,20,220);
    const previous=position.width;
    position.x+=(previous-width)/2;
    position.y+=(previous-width)*IMG_RATIO/2;
    position.width=width;
    render();
    save();
  }
  function rotateCookie(angle){
    position.angle=clamp(Math.round(angle),-30,30);
    render();
    save();
  }
  function screenToRoom(event){
    const rect=svg.getBoundingClientRect();
    return {
      x:(event.clientX-rect.left)*ROOM_W/rect.width,
      y:(event.clientY-rect.top)*ROOM_H/rect.height
    };
  }
  let active=null,suppressClick=false;
  if(editor){
    panel=document.createElement('div');
    panel.id='fortune-cookie-editor';
    // A small, collapsible palette at the top, never over the bottom dock.
    panel.innerHTML=`
      <div data-cookie-header style="display:flex;align-items:center;justify-content:space-between;gap:9px">
        <strong>🥠 Fortune cookie</strong>
        <button type="button" data-cookie-toggle aria-expanded="false" aria-controls="fortune-cookie-controls" title="Afficher ou masquer les réglages">Réglages +</button>
      </div>
      <div id="fortune-cookie-controls" style="display:none;margin-top:10px">
        <label for="fortune-cookie-size">Taille du cookie : <output data-cookie-size-label>73 px</output></label>
        <div style="display:flex;align-items:center;gap:5px;margin:7px 0 9px">
          <button type="button" data-cookie-smaller aria-label="Réduire le cookie">−</button>
          <input id="fortune-cookie-size" type="range" min="20" max="220" step="1" value="73" style="min-width:0;flex:1;accent-color:#ff173b" />
          <button type="button" data-cookie-larger aria-label="Agrandir le cookie">+</button>
        </div>
        <label for="fortune-cookie-angle">Rotation : <output data-cookie-angle-label>0°</output></label>
        <div style="display:flex;align-items:center;gap:5px;margin:7px 0 9px">
          <button type="button" data-cookie-counterclockwise aria-label="Tourner de 1 degré vers la gauche">↶</button>
          <input id="fortune-cookie-angle" type="range" min="-30" max="30" step="1" value="0" style="min-width:0;flex:1;accent-color:#ff173b" />
          <button type="button" data-cookie-clockwise aria-label="Tourner de 1 degré vers la droite">↷</button>
        </div>
        <p style="margin:0 0 9px;font-size:12px;line-height:1.35">Glisse le cookie sur la table. Sa taille, sa rotation et sa position sont enregistrées automatiquement.</p>
        <div data-cookie-coords style="font-size:12px;margin-bottom:8px"></div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button type="button" data-cookie-copy>Copier la position</button>
          <button type="button" data-cookie-reset>Réinitialiser</button>
        </div>
      </div>`;
    panel.style.cssText='position:fixed;right:12px;top:clamp(64px,9vh,94px);bottom:auto;z-index:9998;width:min(265px,calc(100vw - 24px));max-height:calc(100vh - 110px);overflow:auto;padding:9px 10px;background:#fff2fc;color:#ff173b;border:1px solid #ff173b;font:13px Arial,sans-serif;box-shadow:0 2px 9px #6546a644;';
    panel.querySelectorAll('button').forEach(b=>b.style.cssText='font:inherit;color:#ff173b;background:#fff;border:1px solid #ff173b;padding:5px 7px;cursor:pointer');
    text=panel.querySelector('[data-cookie-coords]');
    sizeInput=panel.querySelector('#fortune-cookie-size');
    sizeLabel=panel.querySelector('[data-cookie-size-label]');
    angleInput=panel.querySelector('#fortune-cookie-angle');
    angleLabel=panel.querySelector('[data-cookie-angle-label]');
    // Appending to body avoids positioning inside a transformed/zoomed viewport.
    document.body.appendChild(panel);
    const controls=panel.querySelector('#fortune-cookie-controls');
    const toggle=panel.querySelector('[data-cookie-toggle]');
    toggle.addEventListener('click',()=>{
      const open=controls.style.display==='none';
      controls.style.display=open?'block':'none';
      toggle.setAttribute('aria-expanded',String(open));
      toggle.textContent=open?'Réduire −':'Réglages +';
    });
    sizeInput.addEventListener('input',()=>resizeCookie(Number(sizeInput.value)));
    panel.querySelector('[data-cookie-smaller]').addEventListener('click',()=>resizeCookie(position.width-5));
    panel.querySelector('[data-cookie-larger]').addEventListener('click',()=>resizeCookie(position.width+5));
    angleInput.addEventListener('input',()=>rotateCookie(Number(angleInput.value)));
    panel.querySelector('[data-cookie-counterclockwise]').addEventListener('click',()=>rotateCookie(position.angle-1));
    panel.querySelector('[data-cookie-clockwise]').addEventListener('click',()=>rotateCookie(position.angle+1));
    const copy=panel.querySelector('[data-cookie-copy]');
    copy.addEventListener('click',()=>{
      const value=JSON.stringify({cookie:'table',x:+position.x.toFixed(2),y:+position.y.toFixed(2),width:+position.width.toFixed(2),angle:position.angle});
      if(navigator.clipboard?.writeText){
        navigator.clipboard.writeText(value).then(()=>{copy.textContent='Position copiée ✓';})
          .catch(()=>{window.prompt('Copie la position :',value);});
      }else window.prompt('Copie la position :',value);
    });
    panel.querySelector('[data-cookie-reset]').addEventListener('click',()=>{
      Object.assign(position,defaults);save();render();
    });

    hit.addEventListener('pointerdown',event=>{
      if(event.button!==0 && event.pointerType==='mouse')return;
      event.preventDefault();event.stopPropagation();
      const p=screenToRoom(event);
      active={pointerId:event.pointerId,x:p.x,y:p.y,initialX:position.x,initialY:position.y,moved:false};
      hit.style.cursor='grabbing';
      try{hit.setPointerCapture(event.pointerId);}catch(_){}
    });
    hit.addEventListener('pointermove',event=>{
      if(!active || active.pointerId!==event.pointerId)return;
      const p=screenToRoom(event);
      const dx=p.x-active.x,dy=p.y-active.y;
      if(Math.abs(dx)+Math.abs(dy)>2)active.moved=true;
      position.x=active.initialX+dx;
      position.y=active.initialY+dy;
      render();
      event.preventDefault();event.stopPropagation();
    });
    const release=event=>{
      if(!active || active.pointerId!==event.pointerId)return;
      suppressClick=active.moved;
      active=null;hit.style.cursor='grab';save();
      event.preventDefault();event.stopPropagation();
    };
    hit.addEventListener('pointerup',release);
    hit.addEventListener('pointercancel',release);
    // Fine adjustments when the cookie is focused.
    hit.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const n=event.shiftKey?10:1;
      position.x+=(event.key==='ArrowLeft'?-n:event.key==='ArrowRight'?n:0);
      position.y+=(event.key==='ArrowUp'?-n:event.key==='ArrowDown'?n:0);
      render();save();
    });
  }
  hit.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    if(editor){suppressClick=false;return;}
    fortune();
  });
  render();
  window.NANA_FORTUNE_COOKIE={
    position,
    setPosition(next){if(next&&Number.isFinite(next.x)&&Number.isFinite(next.y)&&Number.isFinite(next.width)){Object.assign(position,{x:next.x,y:next.y,width:next.width,angle:Number.isFinite(next.angle)?next.angle:position.angle});render();save();}}
  };
})();
