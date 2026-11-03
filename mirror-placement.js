/* Interactive illustrated wall mirror, with four-corner perspective calibration.
   Works in the same 1670 x 942 room coordinates as the poster editor.
   The user's mirror artwork stays in its separate SVG asset. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg || document.getElementById('nana-wall-mirror')) return;

  const NS = 'http://www.w3.org/2000/svg';
  const W = 550, H = 542;
  const roomW = 1670, roomH = 942;
  const key = 'nana-wall-mirror-perspective-v1';
  const editing = new URLSearchParams(location.search).get('posterEdit') === '1';
  // Coordinates approved by the artist, in the 1670 × 942 room grid.
  const defaultQuad = [[1322.9421302303758,212.60360032394615],[1434.095914604014,201.2034456191082],[1438.4527009202245,315.53787883400656],[1322.9421302303758,325.7088107239462]];

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

  const group = make('g',{id:'nana-wall-mirror','data-wall-decoration':'mirror'});
  const defs = make('defs');
  const visual = make('g',{'pointer-events':'none'});
  const triangles = [0,1].map(index => {
    const id = 'nana-wall-mirror-triangle-' + index;
    const clipPath = make('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
    const area = make('polygon');
    clipPath.appendChild(area);
    defs.appendChild(clipPath);
    const clipped = make('g',{'clip-path':'url(#'+id+')'});
    const image = make('image',{
      href:'assets/decor/mirror.svg',
      x:0,y:0,width:W,height:H,
      preserveAspectRatio:'none',
      'aria-hidden':'true','pointer-events':'none'
    });
    clipped.appendChild(image);
    visual.appendChild(clipped);
    return {area,image};
  });
  const hit = make('path',{
    id:'wall-mirror-hit',
    'data-open':'dressup',
    role:'button',tabindex:0,
    'aria-label':'Ouvrir About me et le jeu d’habillage',
    fill:'transparent',stroke:'transparent',
    'pointer-events':'all'
  });
  hit.style.cssText='cursor:pointer;touch-action:none';
  const editorLayer = make('g',{id:'nana-wall-mirror-editor'});
  editorLayer.style.pointerEvents='none';
  const guide = make('polygon',{
    fill:'none',stroke:'#ff173b','stroke-width':2.5,
    'vector-effect':'non-scaling-stroke','stroke-dasharray':'7 5',
    'pointer-events':'none'
  });
  const handles = [0,1,2,3].map(index => {
    const handle=make('circle',{
      'data-mirror-corner':index,
      r:10,fill:'#fff4fa',stroke:'#ff173b',
      'stroke-width':3,'vector-effect':'non-scaling-stroke',
      'pointer-events':'all',
      'aria-label':'Coin '+(index+1)+' du miroir'
    });
    handle.style.cssText='cursor:crosshair;touch-action:none;pointer-events:all';
    return handle;
  });
  if (editing) editorLayer.append(guide,...handles);
  group.append(defs,visual,hit,editorLayer);
  // The mirror is the final SVG layer so it remains clickable above room hotspots.
  svg.appendChild(group);
  const style=document.createElement('style');
  style.id='wall-mirror-perspective-style';
  style.textContent=[
    '#wall-mirror-hit:focus-visible{outline:none;stroke:#ff173b;stroke-width:4;stroke-dasharray:7 5}',
    '@media (hover:hover){#wall-mirror-hit:hover{stroke:#ff173b;stroke-width:2;stroke-dasharray:6 5}}',
    'html.poster-edit-mode #wall-mirror-hit{stroke:#ff173b;stroke-width:2;stroke-dasharray:5 5;cursor:move}'
  ].join('\n');
  document.head.appendChild(style);

  function render() {
    const p=state.quad;
    const first=[p[0],p[1],p[3]];
    const second=[p[1],p[2],p[3]];
    triangles[0].area.setAttribute('points',pointsToString(first));
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
      guide.setAttribute('points',pointsToString(p));
      handles.forEach((handle,index)=>{
        handle.setAttribute('cx',p[index][0]);
        handle.setAttribute('cy',p[index][1]);
      });
    }
  }
  render();

  hit.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ') && !editing){
      event.preventDefault();
      hit.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    }
  });
  if (!editing) return;

  // In edit mode moving the mirror must not trigger the dress-up interaction.
  group.addEventListener('click',event=>{
    if(event.target===hit || event.target.closest('[data-mirror-corner]')){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  let drag=null;
  group.addEventListener('pointerdown',event=>{
    const cornerEl=event.target.closest('[data-mirror-corner]');
    if(event.target!==hit && !cornerEl) return;
    if(event.pointerType==='mouse' && event.button!==0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rect=svg.getBoundingClientRect();
    drag={
      id:event.pointerId,
      corner:cornerEl ? Number(cornerEl.getAttribute('data-mirror-corner')) : null,
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

  const panel=document.getElementById('poster-edit-panel');
  if (panel) {
    const section=document.createElement('div');
    section.id='wall-mirror-editor-controls';
    section.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #ff173b;font:12px/1.4 system-ui,sans-serif';
    const label=document.createElement('div');
    label.textContent='Miroir : glisse le centre pour déplacer ; tire les 4 ronds pour la perspective.';
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
      const data=JSON.stringify({mirror:'wall',corners:state.quad},null,2);
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(data).then(()=>{
          label.textContent='Coins du miroir copiés. Tu peux me les envoyer ici.';
        }).catch(()=>window.prompt('Copie les coins du miroir :',data));
      } else window.prompt('Copie les coins du miroir :',data);
    });
    section.append(controls);
    panel.appendChild(section);
  }
})();