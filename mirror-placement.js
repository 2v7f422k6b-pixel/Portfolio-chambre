/* Illustrated interactive wall mirror. Preserve room SVG proportions and click behavior.
   Position can be adjusted in ?posterEdit=1 without modifying the source illustration. */
(function () {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg || document.getElementById('nana-wall-mirror')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const key = 'nana-wall-mirror-position-v1';
  const editing = new URLSearchParams(location.search).get('posterEdit') === '1';
  const defaultState = { x: 1450, y: 284, width: 150 };
  const ratio = 542 / 550;
  const state = { ...defaultState };

  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && ['x','y','width'].every(k => Number.isFinite(saved[k]))) {
      state.x = saved.x;
      state.y = saved.y;
      state.width = Math.min(340,Math.max(55,saved.width));
    }
  } catch (_) {}
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {}
  }
  function make(tag, attrs) {
    const el = document.createElementNS(NS,tag);
    for(const [k,v] of Object.entries(attrs||{})) el.setAttribute(k,String(v));
    return el;
  }
  const group = make('g', {id:'nana-wall-mirror','data-wall-decoration':'mirror'});
  const artwork = make('image', {
    id:'wall-mirror-image',
    href:'assets/decor/mirror.svg',
    x:state.x, y:state.y,
    width:state.width, height:state.width * ratio,
    preserveAspectRatio:'none',
    'aria-hidden':'true',
    'pointer-events':'none'
  });
  const hit = make('ellipse', {
    id:'wall-mirror-hit',
    'data-open':'dressup',
    role:'button', tabindex:0,
    'aria-label':'Ouvrir About me et le jeu d’habillage',
    fill:'transparent',
    stroke:'transparent',
    'pointer-events':'all'
  });
  hit.style.cssText = 'cursor:pointer;touch-action:none';
  group.append(artwork,hit);
  // Last in the SVG: selectable even when unrelated hotspots overlap its area.
  svg.appendChild(group);

  const style = document.createElement('style');
  style.id='wall-mirror-style';
  style.textContent = [
    '#wall-mirror-hit:focus-visible{outline:none;stroke:#ff173b;stroke-width:4;stroke-dasharray:7 5}',
    '@media (hover:hover){#wall-mirror-hit:hover{stroke:#ff173b;stroke-width:2;stroke-dasharray:6 5}}',
    'html.poster-edit-mode #wall-mirror-hit{stroke:#ff173b;stroke-width:3;stroke-dasharray:6 4;cursor:move}'
  ].join('\n');
  document.head.appendChild(style);

  function render() {
    const height = state.width * ratio;
    artwork.setAttribute('x',state.x);
    artwork.setAttribute('y',state.y);
    artwork.setAttribute('width',state.width);
    artwork.setAttribute('height',height);
    hit.setAttribute('cx',state.x + state.width / 2);
    hit.setAttribute('cy',state.y + height / 2);
    hit.setAttribute('rx',state.width * .47);
    hit.setAttribute('ry',height * .47);
  }
  render();
  hit.addEventListener('keydown', e => {
    if (e.key==='Enter' || e.key===' ') {
      e.preventDefault();
      if (!editing) hit.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    }
  });
  if (!editing) return;

  // In calibration mode, clicking/dragging the mirror must NOT open About me.
  hit.addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
  },true);
  let drag = null;
  hit.addEventListener('pointerdown',event=>{
    if (event.button!==0 && event.pointerType==='mouse') return;
    event.preventDefault();
    event.stopPropagation();
    const rect=svg.getBoundingClientRect();
    drag={
      pointerId:event.pointerId,
      startX:event.clientX,startY:event.clientY,
      x:state.x,y:state.y,
      scaleX:1670/rect.width,scaleY:942/rect.height
    };
    try {hit.setPointerCapture(event.pointerId)} catch (_) {}
  },true);
  hit.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.pointerId) return;
    event.preventDefault();event.stopPropagation();
    state.x= Math.round((drag.x+(event.clientX-drag.startX)*drag.scaleX)*10)/10;
    state.y= Math.round((drag.y+(event.clientY-drag.startY)*drag.scaleY)*10)/10;
    render();
  },true);
  const end=event=>{
    if (!drag || event.pointerId!==drag.pointerId) return;
    event.stopPropagation();drag=null;save();
  };
  hit.addEventListener('pointerup',end,true);
  hit.addEventListener('pointercancel',end,true);

  const panel=document.getElementById('poster-edit-panel');
  if (panel) {
    const section=document.createElement('div');
    section.id='wall-mirror-editor-controls';
    section.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #ff173b;font:12px/1.4 system-ui,sans-serif;';
    const label=document.createElement('div');
    label.textContent='Miroir : glisse directement sur le mur pour le placer.';
    label.style.marginBottom='6px';
    section.append(label);
    const controls=document.createElement('div');
    controls.style.cssText='display:flex;flex-wrap:wrap;gap:6px';
    function button(text,fn){
      const b=document.createElement('button');b.type='button';b.textContent=text;
      b.style.cssText='border:1px solid #ff173b;color:#ff173b;background:white;padding:5px 8px;cursor:pointer;font:12px system-ui,sans-serif';
      b.addEventListener('click',fn);controls.appendChild(b);
    }
    button('− Petit',()=>{state.width=Math.max(55,state.width-12);render();save()});
    button('+ Grand',()=>{state.width=Math.min(340,state.width+12);render();save()});
    button('Réinitialiser',()=>{Object.assign(state,defaultState);render();save()});
    section.append(controls);
    panel.appendChild(section);
  }
})();