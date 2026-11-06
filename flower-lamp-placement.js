/* Interactive illustrated smiley flower wall lamp, with four-corner perspective calibration.
   Works in the same 1670 x 942 room coordinates as the poster editor.
   The user's flower lamp artwork stays in its separate transparent image asset. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg || document.getElementById('nana-wall-lamp')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 256, H = 246;
  const roomW = 1670, roomH = 942;
  const key = 'nana-wall-lamp-perspective-v1';
  // The lamp has its OWN editor URL, independent of the poster and mirror editor.
  const editing = new URLSearchParams(location.search).get('lampEdit') === '1';
  if (editing) document.documentElement.classList.add('lamp-edit-mode');
  // Artist-approved permanent placement, in the 1670 × 942 bedroom coordinate system.
  const defaultQuad = [[679.1610611167739,189.70320567843726],[754.0449185287739,177.702325716768],[756.5410471091737,254.8932494609382],[681.0331575520739,262.71496665513723]];

  const fromRect = (x, y, width) => {
    const height = width * H / W;
    return [[x,y],[x+width,y],[x+width,y+height],[x,y+height]];
  };
  const copy = points => points.map(p => [p[0], p[1]]);
  const valid = points =>
    Array.isArray(points) && points.length === 4 &&
    points.every(p => Array.isArray(p) && p.length === 2 &&
      p.every(n => Number.isFinite(n) && Math.abs(n) < 10000));

  const state = { quad: copy(defaultQuad) };
  try {
    // Later adjustments in the same browser take precedence over the approved default.
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && valid(saved.quad)) state.quad = copy(saved.quad);
  } catch (_) { /* Private browsing may restrict storage. */ }
  const store = () => {
    try { localStorage.setItem(key,JSON.stringify({quad:state.quad})); } catch (_) {}
  };
  function make(tag,attrs) {
    const el = document.createElementNS(NS,tag);
    for (const [k,v] of Object.entries(attrs || {})) el.setAttribute(k,String(v));
    return el;
  }
  function pointsToString(points) { return points.map(p=>p.join(',')).join(' '); }
  function center(points) {
    return [
      points.reduce((sum,p)=>sum+p[0],0)/4,
      points.reduce((sum,p)=>sum+p[1],0)/4
    ];
  }
  // Bilinear positioning for the click region. The artwork itself is split
  // into two affine triangles to respect the four independently moved corners.
  function interp(p,u,v) {
    const weights = [(1-u)*(1-v),u*(1-v),u*v,(1-u)*v];
    return [
      p.reduce((sum,point,i)=>sum+point[0]*weights[i],0),
      p.reduce((sum,point,i)=>sum+point[1]*weights[i],0)
    ];
  }

  const group = make('g',{id:'nana-wall-lamp','data-wall-decoration':'flower-lamp'});
  const defs = make('defs');
  const visual = make('g',{'pointer-events':'none',class:'nana-wall-lamp-visual'});
  const triangles = [0,1].map(index => {
    const id = 'nana-wall-lamp-triangle-' + index;
    const clipPath = make('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
    const area = make('polygon');
    clipPath.appendChild(area);
    defs.appendChild(clipPath);
    const clipped = make('g',{'clip-path':'url(#'+id+')'});
    const image = make('image',{
      href:'assets/decor/smiley-flower-lamp.svg',
      x:0,y:0,width:W,height:H,
      preserveAspectRatio:'none',
      'aria-hidden':'true','pointer-events':'none'
    });
    clipped.appendChild(image);
    visual.appendChild(clipped);
    return {area,image};
  });
  const hit = make('path',{
    id:'wall-lamp-hit',
    role:'button',tabindex:0,
    'aria-label':'Allumer ou éteindre la lampe et basculer Jour / Nuit',
    fill:'transparent',stroke:'transparent',
    'pointer-events':'all'
  });
  hit.style.cssText='cursor:pointer;touch-action:none';
  const editorLayer = make('g',{id:'nana-wall-lamp-editor'});
  editorLayer.style.pointerEvents='none';
  const guide = make('polygon',{
    fill:'none',stroke:'#ff173b','stroke-width':2.5,
    'vector-effect':'non-scaling-stroke','stroke-dasharray':'7 5',
    'pointer-events':'none'
  });
  // Transparent editor-only drag surface, above all other wall zones.
  // A visible central grip provides a reliable alternative to grabbing the artwork.
  const dragSurface = make('polygon',{
    id:'wall-lamp-drag-surface',
    'data-lamp-drag':'true',
    fill:'rgba(255,255,255,0.002)',
    stroke:'none',
    'pointer-events':'all',
    'aria-label':'Déplacer la lampe fleur'
  });
  dragSurface.style.cssText='cursor:move;touch-action:none;pointer-events:all!important;fill:rgba(255,255,255,.002)!important';
  const dragGrip = make('circle',{
    id:'wall-lamp-center-grip',
    'data-lamp-drag':'true',
    r:13,
    fill:'#fff4fa',stroke:'#ff173b','stroke-width':3,
    'vector-effect':'non-scaling-stroke',
    'pointer-events':'all',
    'aria-label':'Déplacer la lampe entière'
  });
  dragGrip.style.cssText='cursor:move;touch-action:none;pointer-events:all!important';
  const handles = [0,1,2,3].map(index => {
    const handle=make('circle',{
      'data-lamp-corner':index,
      r:10,fill:'#fff4fa',stroke:'#ff173b',
      'stroke-width':3,'vector-effect':'non-scaling-stroke',
      'pointer-events':'all',
      'aria-label':'Coin '+(index+1)+' de la lampe'
    });
    handle.style.cssText='cursor:crosshair;touch-action:none;pointer-events:all';
    return handle;
  });
  if (editing) editorLayer.append(dragSurface,guide,dragGrip,...handles);
  group.append(defs,visual,hit,editorLayer);
  // The mirror is the final SVG layer so it remains clickable above room hotspots.
  svg.appendChild(group);
  const style=document.createElement('style');
  style.id='wall-lamp-perspective-style';
  style.textContent=[
    // No rectangular/dashed SVG hitbox on hover, click or focus.
    '#wall-lamp-hit,#wall-lamp-hit:hover,#wall-lamp-hit:focus,#wall-lamp-hit:focus-visible,#wall-lamp-hit:active{outline:none;box-shadow:none;stroke:transparent;stroke-width:0;stroke-dasharray:none}',
    'html.lamp-edit-mode #wall-lamp-hit{stroke:#ff173b;stroke-width:2;stroke-dasharray:5 5;cursor:move}',
    'html[data-theme="night"] #nana-wall-lamp .nana-wall-lamp-visual{filter:drop-shadow(0 0 8px rgba(255,244,171,.85)) drop-shadow(0 0 20px rgba(255,211,93,.55))}'
  ].join('\n');
  document.head.appendChild(style);

  function render() {
    const p=state.quad;
    const first=[p[0],p[1],p[3]];
    const second=[p[1],p[2],p[3]];
    // Overlap the shared diagonal slightly to close the antialiasing seam.
    const center=first.reduce((c,p)=>[c[0]+p[0]/3,c[1]+p[1]/3],[0,0]);
    const overlap=first.map(p=>{const dx=p[0]-center[0],dy=p[1]-center[1],d=Math.hypot(dx,dy)||1;return [p[0]+dx/d*.6,p[1]+dy/d*.6];});
    triangles[0].area.setAttribute('points',pointsToString(overlap));
    triangles[1].area.setAttribute('points',pointsToString(second));
    const a0=(p[1][0]-p[0][0])/W, b0=(p[1][1]-p[0][1])/W;
    const c0=(p[3][0]-p[0][0])/H, d0=(p[3][1]-p[0][1])/H;
    triangles[0].image.setAttribute('transform',
      'matrix('+[a0,b0,c0,d0,p[0][0],p[0][1]].join(' ')+')');
    const a1=(p[2][0]-p[3][0])/W, b1=(p[2][1]-p[3][1])/W;
    const c1=(p[2][0]-p[1][0])/H, d1=(p[2][1]-p[1][1])/H;
    triangles[1].image.setAttribute('transform',
      'matrix('+[a1,b1,c1,d1,p[1][0]-a1*W,p[1][1]-b1*W].join(' ')+')');
    // The hit area follows the transformed oval, not a rectangular box.
    const oval=[];
    for(let i=0;i<40;i++){
      const angle=i*2*Math.PI/40;
      oval.push(interp(p,.5+.47*Math.cos(angle),.5+.47*Math.sin(angle)));
    }
    hit.setAttribute('d','M '+oval.map(point=>point.join(' ')).join(' L ')+' Z');
    if(editing){
      dragSurface.setAttribute('points',pointsToString(p));
      guide.setAttribute('points',pointsToString(p));
      const mid=center(p);
      dragGrip.setAttribute('cx',mid[0]);
      dragGrip.setAttribute('cy',mid[1]);
      handles.forEach((handle,index)=>{
        handle.setAttribute('cx',p[index][0]);
        handle.setAttribute('cy',p[index][1]);
      });
    }
  }
  render();

  // Trigger the original site theme button: both artwork and interface stay in sync.
  hit.addEventListener('click',event=>{
    if(editing) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const themeButton=document.getElementById('theme-toggle');
    if(themeButton) themeButton.click();
  },true);

  hit.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ') && !editing){
      event.preventDefault();
      hit.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    }
  });
  if (!editing) return;

  // In lamp-edit mode, neither click nor drag should toggle the theme.
  group.addEventListener('click',event=>{
    if(event.target===hit || event.target.closest('[data-lamp-corner],[data-lamp-drag]')){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  let drag=null;
  group.addEventListener('pointerdown',event=>{
    const cornerEl=event.target.closest('[data-lamp-corner]');
    const dragEl=event.target.closest('[data-lamp-drag]');
    if(event.target!==hit && !cornerEl && !dragEl) return;
    if(event.pointerType==='mouse' && event.button!==0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rect=svg.getBoundingClientRect();
    drag={
      id:event.pointerId,
      corner:cornerEl ? Number(cornerEl.getAttribute('data-lamp-corner')) : null,
      client:[event.clientX,event.clientY],
      quad:copy(state.quad),
      scale:[roomW/rect.width,roomH/rect.height]
    };
    try {event.target.setPointerCapture(event.pointerId)} catch (_) {}
  },true);
  window.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.id) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const dx=(event.clientX-drag.client[0])*drag.scale[0];
    const dy=(event.clientY-drag.client[1])*drag.scale[1];
    if(drag.corner===null){
      state.quad=drag.quad.map(p=>[p[0]+dx,p[1]+dy]);
    } else {
      state.quad=copy(drag.quad);
      state.quad[drag.corner]=[
        drag.quad[drag.corner][0]+dx,
        drag.quad[drag.corner][1]+dy
      ];
    }
    render();
  },true);
  function stopDrag(event) {
    if(!drag || (event.pointerId!==undefined && event.pointerId!==drag.id)) return;
    drag=null;store();
  }
  window.addEventListener('pointerup',stopDrag,true);
  window.addEventListener('pointercancel',stopDrag,true);
  window.addEventListener('blur',()=>stopDrag({}));

  // A dedicated panel means the lamp link never opens the mirror/poster editor.
  const panel=document.createElement('section');
  panel.id='wall-lamp-editor-panel';
  panel.setAttribute('aria-label','Réglage de la lampe fleur');
  panel.style.cssText =
    'position:fixed;z-index:100010;top:56px;left:12px;' +
    'width:min(310px,calc(100vw - 30px));max-height:calc(100dvh - 78px);' +
    'overflow:auto;box-sizing:border-box;background:#fff4fa;color:#ff173b;' +
    'border:2px solid #ff173b;padding:12px;' +
    'box-shadow:3px 3px 0 #ff173b;font:14px/1.4 system-ui,sans-serif';

  const bar=document.createElement('div');
  bar.style.cssText='display:flex;align-items:center;gap:6px;margin-bottom:10px';
  const title=document.createElement('strong');
  title.textContent='LAMPE FLEUR — Réglage';
  title.style.flex='1';
  bar.appendChild(title);
  const side=document.createElement('button');
  side.type='button';
  side.textContent='→ À droite';
  side.style.cssText='border:1px solid #ff173b;color:#ff173b;background:#fff;padding:5px 7px;cursor:pointer;font:12px system-ui,sans-serif';
  side.addEventListener('click',()=>{
    const rect=panel.getBoundingClientRect();
    const right=rect.left + rect.width/2 <= innerWidth/2;
    const left=right ? innerWidth-rect.width-12 : 12;
    panel.style.setProperty('left',Math.max(0,left)+'px','important');
    side.textContent=right?'← À gauche':'→ À droite';
  });
  bar.appendChild(side);
  panel.appendChild(bar);
  document.body.appendChild(panel);

  {
    const section=document.createElement('div');
    section.id='wall-lamp-editor-controls';
    section.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #ff173b;font:12px/1.4 system-ui,sans-serif';
    const label=document.createElement('div');
    label.textContent='Pour déplacer toute la lampe, glisse le rond central ou la fleur. Les quatre ronds aux angles règlent sa perspective.';
    label.style.marginBottom='6px';
    section.append(label);
    const controls=document.createElement('div');
    controls.style.cssText='display:flex;flex-wrap:wrap;gap:6px';
    function button(text,fn){
      const b=document.createElement('button');b.type='button';b.textContent=text;
      b.style.cssText='border:1px solid #ff173b;color:#ff173b;background:white;padding:5px 8px;cursor:pointer;font:12px system-ui,sans-serif';
      b.addEventListener('click',fn);controls.appendChild(b);
    }
    function scale(factor) {
      const p=state.quad;
      const horizontal=(Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]) +
        Math.hypot(p[2][0]-p[3][0],p[2][1]-p[3][1]))/2;
      if(horizontal*factor<55 || horizontal*factor>340) return;
      const mid=center(p);
      state.quad=p.map(point=>[
        mid[0]+(point[0]-mid[0])*factor,
        mid[1]+(point[1]-mid[1])*factor
      ]);
      render();store();
    }
    // Arrow buttons also allow positioning on touch devices where drag may be difficult.
    function nudge(dx,dy) {
      state.quad=state.quad.map(point=>[point[0]+dx,point[1]+dy]);
      render();store();
    }
    button('←',()=>nudge(-12,0));
    button('↑',()=>nudge(0,-12));
    button('↓',()=>nudge(0,12));
    button('→',()=>nudge(12,0));
    button('− Petit',()=>scale(.91));
    button('+ Grand',()=>scale(1.1));
    button('Redresser',()=>{
      const p=state.quad;
      const minX=Math.min(...p.map(x=>x[0])),maxX=Math.max(...p.map(x=>x[0]));
      const minY=Math.min(...p.map(x=>x[1])),maxY=Math.max(...p.map(x=>x[1]));
      state.quad=[[minX,minY],[maxX,minY],[maxX,maxY],[minX,maxY]];
      render();store();
    });
    button('Réinitialiser',()=>{
      state.quad=copy(defaultQuad);
      render();store();
    });
    button('Copier les coins',()=>{
      const data=JSON.stringify({lamp:'wall',corners:state.quad},null,2);
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(data).then(()=>{
          label.textContent='Coins de la lampe copiés. Tu peux me les envoyer ici.';
        }).catch(()=>window.prompt('Copie les coins de la lampe :',data));
      } else window.prompt('Copie les coins de la lampe :',data);
    });
    section.append(controls);
    panel.appendChild(section);
  }
  // Open the bedroom automatically from this dedicated calibration link.
  // No change to the normal portfolio landing page.
  const enterPlay=document.querySelector('#welcome [data-mode="play"]');
  if (enterPlay && !document.getElementById('app')?.classList.contains('mode-play')) {
    enterPlay.click();
  }
})();
