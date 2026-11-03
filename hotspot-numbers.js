/* Review-only numbered hotspots: add ?zones=1 to the portfolio URL.
   Read-only labels: no changes to artwork, geometry, routes or click handlers. */
(() => {
  if (new URLSearchParams(window.location.search).get('zones') !== '1') return;

  const scene = document.getElementById('play-scene');
  const svg = document.getElementById('hotspots');
  if (!scene || !svg) return;

  const W = 1670, H = 942;
  const stage = document.createElement('div');
  stage.id = 'hotspot-numbers';
  stage.setAttribute('aria-hidden', 'true');
  scene.appendChild(stage);

  const style = document.createElement('style');
  style.id = 'hotspot-numbers-style';
  style.textContent = `
    #hotspot-numbers {
      position: absolute; inset: 0; z-index: 1001;
      pointer-events: none; overflow: visible;
    }
    #hotspot-numbers .number-label {
      position: absolute; display: grid; place-items: center;
      min-width: 26px; height: 26px; padding: 0 4px;
      box-sizing: border-box; transform: translate(-50%, -50%);
      border: 2px solid #ff173b; border-radius: 0;
      background: #fff2fc; color: #ff173b;
      font: 800 14px/1 Arial, Helvetica, sans-serif;
      box-shadow: 2px 2px 0 rgba(101,70,166,.45);
      pointer-events: none; user-select: none;
      text-shadow: none; white-space: nowrap;
    }
    #hotspot-number-control {
      position: fixed; z-index: 1003;
      top: calc(var(--menubar, 42px) + 53px); right: 14px;
      color: #ff173b; background: #fff2fc;
      border: 2px solid #ff173b; border-radius: 0;
      box-shadow: 2px 2px 0 rgba(101,70,166,.45);
      font: 700 12px/1.2 Arial, Helvetica, sans-serif;
      padding: 8px 10px; cursor: pointer;
    }
    #play-viewport[hidden] #hotspot-number-control { display: none; }
    html[data-theme="night"] #hotspot-numbers .number-label,
    html[data-theme="night"] #hotspot-number-control {
      background: #e9b5ff; color: #ff173b;
    }
    @media (max-width: 550px) {
      #hotspot-numbers .number-label { min-width: 23px; height: 23px; font-size: 12px; }
      #hotspot-number-control { right: 8px; padding: 7px 8px; font-size: 11px; }
    }
  `;
  document.head.appendChild(style);

  const control = document.createElement('button');
  control.id = 'hotspot-number-control';
  control.type = 'button';
  control.textContent = 'Masquer les numéros';
  control.setAttribute('aria-pressed', 'true');
  document.getElementById('play-viewport').appendChild(control);
  control.addEventListener('click', () => {
    const visible = control.getAttribute('aria-pressed') !== 'true';
    control.setAttribute('aria-pressed', String(visible));
    control.textContent = visible ? 'Masquer les numéros' : 'Afficher les numéros';
    stage.hidden = !visible;
  });

  function center(points) {
    const pairs = (points || '').trim().split(/\s+/)
      .map(pair => pair.split(',').map(Number))
      .filter(pair => pair.length === 2 && pair.every(Number.isFinite));
    if (!pairs.length) return [W / 2, H / 2];
    const xs = pairs.map(p => p[0]), ys = pairs.map(p => p[1]);
    return [(Math.min(...xs) + Math.max(...xs)) / 2,
            (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  function entries() {
    const posters=[...svg.querySelectorAll('polygon[data-type="poster"]')]
      .sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index));
    const items=posters.map((el,i)=>({
      el,number:i+1,id:'poster-'+el.dataset.index,
      name:'Affiche '+(Number(el.dataset.index)+1),type:'poster',
      action:'gallery',center:null
    }));
    const zones=window.NANA_ROOM_ZONES || [];
    for(const zone of zones){
      if(!zone.element)continue;
      items.push({
        el:zone.element,number:zone.number,id:zone.id,
        name:zone.label,type:'object',
        action:zone.element.dataset.open || (zone.element.hasAttribute('data-mv-open')?'music-visuals':
          zone.element.hasAttribute('data-cat-pet')?'pet-cat':'to-define'),
        center:zone.center
      });
    }
    const flowers=svg.querySelector('polygon[aria-label="Browse illustrations by the flowers"]');
    if(flowers)items.push({
      el:flowers,number:45,id:'fleurs',name:'Fleurs (galerie)',type:'object',
      action:'photos',center:null
    });
    return items;
  }
  let labels = new Map();
  function redraw() {
    const targets=entries();
    const current=new Set(targets.map(t=>t.el));
    for(const [el,label] of labels){
      if(!current.has(el)){label.remove();labels.delete(el);}
    }
    for(const target of targets){
      let label=labels.get(target.el);
      if(!label){
        label=document.createElement('span');
        label.className='number-label';
        stage.appendChild(label);
        labels.set(target.el,label);
      }
      label.textContent=String(target.number);
      label.setAttribute('title',target.number+' · '+target.name);
      const [x,y]=target.center || center(target.el.getAttribute('points'));
      label.style.left=(x/W*100)+'%';
      label.style.top=(y/H*100)+'%';
    }
    window.hotspotNumberGuide=targets.map(({number,id,name,type,action})=>({number,id,name,type,action}));
  }
  window.addEventListener('nana-room-zones-ready',redraw);
  redraw();
  // Poster positions can be recalibrated; labels must follow without changing the hotspots.
  const observer = new MutationObserver(redraw);
  observer.observe(svg, { subtree: true, childList: true, attributes: true, attributeFilter: ['points'] });
  window.addEventListener('resize', redraw, { passive: true });
})();
