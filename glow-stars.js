/* Hand-drawn phosphorescent wall stars. Decorative only: never blocks poster clicks. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene');
  if (!scene || document.getElementById('nana-glow-stars-layer')) return;
  const NS = 'http://www.w3.org/2000/svg';
  // Approved wall-star layout (62 positions), shared by all visitors.
  const stars = [
  [
    319.4,
    68.78,
    7,
    10
  ],
  [
    316,
    210,
    6,
    -8
  ],
  [
    325.81,
    344.23,
    7,
    16
  ],
  [
    460.55,
    216.15,
    6,
    -9
  ],
  [
    476.79,
    245.4,
    7,
    11
  ],
  [
    513.85,
    263.55,
    6,
    -17
  ],
  [
    555.2,
    195,
    7,
    4
  ],
  [
    611.08,
    223.56,
    6,
    12
  ],
  [
    630.77,
    240.83,
    7,
    -9
  ],
  [
    736.82,
    169.58,
    6,
    8
  ],
  [
    842.08,
    281.34,
    7,
    -15
  ],
  [
    792.34,
    297.02,
    6,
    14
  ],
  [
    819.39,
    267.8,
    7,
    -6
  ],
  [
    827.68,
    307.51,
    6,
    17
  ],
  [
    752.51,
    411.77,
    7,
    -12
  ],
  [
    1481.49,
    245.29,
    7,
    8
  ],
  [
    1491.07,
    277.63,
    6,
    -14
  ],
  [
    1539.05,
    294.57,
    7,
    12
  ],
  [
    1558.34,
    260.84,
    6,
    -7
  ],
  [
    1580.54,
    233.13,
    7,
    16
  ],
  [
    1317.08,
    314.45,
    6,
    -9
  ],
  [
    1335.68,
    348.62,
    7,
    10
  ],
  [
    1313.61,
    385.27,
    6,
    -12
  ],
  [
    1454.44,
    86.34,
    7,
    12
  ],
  [
    1445.47,
    142.4,
    6,
    -8
  ],
  [
    1523.17,
    247.18,
    7,
    15
  ],
  [
    1635.43,
    103.18,
    6,
    -10
  ],
  [
    1620.3,
    135.05,
    7,
    8
  ],
  [
    1629.37,
    191.64,
    6,
    16
  ],
  [
    1618.28,
    253.92,
    7,
    -13
  ],
  [
    1608.31,
    302.09,
    6,
    9
  ],
  [
    748.93,
    153.5,
    7,
    0
  ],
  [
    766.74,
    328.27,
    7,
    0
  ],
  [
    767.59,
    108.22,
    7,
    0
  ],
  [
    738.42,
    97.36,
    7,
    0
  ],
  [
    729.33,
    490.46,
    7,
    0
  ],
  [
    763.75,
    485.19,
    7,
    0
  ],
  [
    821.79,
    454.9,
    7,
    0
  ],
  [
    797.91,
    91.1,
    7,
    0
  ],
  [
    794.79,
    51.65,
    7,
    0
  ],
  [
    736.88,
    54.22,
    7,
    0
  ],
  [
    766.93,
    73.12,
    7,
    0
  ],
  [
    820.15,
    66.5,
    7,
    0
  ],
  [
    835,
    93.7,
    7,
    0
  ],
  [
    763.97,
    27.43,
    7,
    0
  ],
  [
    827.97,
    24.8,
    7,
    0
  ],
  [
    707.49,
    77.96,
    7,
    0
  ],
  [
    712.37,
    133.34,
    7,
    0
  ],
  [
    655.15,
    225.22,
    7,
    0
  ],
  [
    453.48,
    387.98,
    7,
    0
  ],
  [
    463.8,
    341.29,
    7,
    0
  ],
  [
    446.23,
    304.71,
    7,
    0
  ],
  [
    472.78,
    137.48,
    7,
    0
  ],
  [
    471.23,
    41.65,
    7,
    0
  ],
  [
    450.26,
    103.22,
    7,
    0
  ],
  [
    484.51,
    78.31,
    7,
    0
  ],
  [
    316.66,
    103.1,
    7,
    0
  ],
  [
    623.8,
    37.17,
    7,
    0
  ],
  [
    673.06,
    33.24,
    7,
    0
  ],
  [
    1445.33,
    305.42,
    7,
    0
  ],
  [
    666.13,
    392.01,
    7,
    0
  ],
  [
    790.82,
    272.85,
    7,
    0
  ],
  [
    716.46,
    43.46,
    7,
    0
  ],
  [
    717.46,
    160.44,
    7,
    0
  ],
  [
    462.08,
    168.04,
    7,
    0
  ],
  [
    329.27,
    370.67,
    7,
    0
  ],
  [
    299.02,
    347.09,
    7,
    0
  ],
  [
    358.28,
    435.58,
    7,
    0
  ],
  [
    405.48,
    435.75,
    7,
    0
  ],
  [
    363.48,
    454.94,
    7,
    0
  ],
  [
    435.6,
    436.72,
    7,
    0
  ],
  [
    194.46,
    317.52,
    7,
    0
  ],
  [
    191.94,
    346.19,
    7,
    0
  ],
  [
    162.42,
    175.09,
    7,
    0
  ],
  [
    197.62,
    187.26,
    7,
    0
  ],
  [
    161.7,
    190.77,
    7,
    0
  ],
  [
    227.41,
    190.06,
    7,
    0
  ],
  [
    147.75,
    21.37,
    7,
    0
  ],
  [
    112.74,
    15.08,
    7,
    0
  ],
  [
    309.69,
    18.37,
    7,
    0
  ],
  [
    144.16,
    480.21,
    7,
    0
  ],
  [
    163.91,
    453.53,
    7,
    0
  ],
  [
    204.74,
    449.64,
    7,
    0
  ],
  [
    183.1,
    493.58,
    7,
    0
  ],
  [
    127.62,
    434.01,
    7,
    0
  ],
  [
    112.96,
    501.08,
    7,
    0
  ],
  [
    537.88,
    410.72,
    7,
    0
  ],
  [
    1636.46,
    286.79,
    7,
    0
  ],
  [
    1599.78,
    270.97,
    7,
    0
  ],
  [
    1616.52,
    213.3,
    7,
    0
  ],
  [
    1615.16,
    160.92,
    7,
    0
  ],
  [
    1619.83,
    78.83,
    7,
    0
  ],
  [
    1651.67,
    136.19,
    7,
    0
  ],
  [
    1439.86,
    104.14,
    7,
    0
  ],
  [
    1434.73,
    32.72,
    7,
    0
  ],
  [
    1308.87,
    243.67,
    7,
    0
  ],
  [
    1300.36,
    281.17,
    7,
    0
  ],
  [
    1339.87,
    377.53,
    7,
    0
  ],
  [
    1335.26,
    411.73,
    7,
    0
  ]
];
  const edit = new URLSearchParams(location.search).get('starsEdit') === '1';
  const storageKey='nana-wall-stars-layout-v1';
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
    if(Array.isArray(saved) && saved.length && saved.every(v=>Array.isArray(v)&&v.length===4&&v.every(Number.isFinite))) stars.splice(0,stars.length,...saved);
  } catch (_) {}
  const layer = document.createElementNS(NS,'svg');
  layer.id = 'nana-glow-stars-layer';
  layer.setAttribute('viewBox','0 0 1670 942');
  layer.setAttribute('preserveAspectRatio','none');
  layer.setAttribute('aria-hidden','true');
  layer.setAttribute('pointer-events',edit?'auto':'none');
  const group = document.createElementNS(NS,'g');
  group.id='nana-glow-stars';
  group.setAttribute('aria-hidden','true');
  group.setAttribute('pointer-events',edit?'auto':'none');
  group.style.pointerEvents=edit?'auto':'none';
  const points=(x,y,r,rotation)=>{
    const coords=[];
    for(let i=0;i<10;i++){
      const a=(i*36-90+rotation)*Math.PI/180;
      const radius=i%2 ? r*.46 : r;
      coords.push((x+Math.cos(a)*radius).toFixed(2)+','+(y+Math.sin(a)*radius).toFixed(2));
    }
    return coords.join(' ');
  };
  const palette=['#ff9acb','#ffe58b','#a6e4ff','#d4a7ff','#b9e6a0','#ffb99d'];
  const elements=[];
  stars.forEach(([x,y,r,angle],i)=>{
    const star=document.createElementNS(NS,'polygon');
    star.setAttribute('points',points(x,y,r,angle));
    star.setAttribute('class','nana-phosphor-star');
    star.style.setProperty('--twinkle-delay',(i%9)*-.7+'s');
    star.style.setProperty('--day-star-color',palette[i%palette.length]);
    star.setAttribute('pointer-events',edit?'all':'none');
    group.appendChild(star);
    elements.push(star);
  });
  // Append last for physical stickers to sit on top of posters, without stealing taps.
  layer.appendChild(group);
  scene.appendChild(layer);
  // Keep the decoration out of document flow and independent of the poster SVG.
  layer.style.cssText='position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;pointer-events:none!important;overflow:visible!important;z-index:7!important;transform:none!important;contain:layout style;';
  const style=document.createElement('style');
  style.id='nana-glow-stars-style';
  style.textContent=`
    html:not(.nana-stars-edit) #nana-glow-stars, html:not(.nana-stars-edit) #nana-glow-stars * {pointer-events:none!important;cursor:inherit!important}
    #nana-glow-stars .nana-phosphor-star {
      fill:var(--day-star-color);stroke:var(--day-star-color);stroke-width:.7;
      opacity:.48;filter:none;
      transition:fill 1.1s,opacity 1.1s,filter 1.1s;
    }
    html[data-theme="night"] #nana-glow-stars .nana-phosphor-star {
      fill:#dfffaa;stroke:#e8ffc2;opacity:.9;
      filter:drop-shadow(0 0 3px #e4ffac) drop-shadow(0 0 7px #b9f579);
      animation:nana-phosphor-breathe 6.8s ease-in-out infinite;
      animation-delay:var(--twinkle-delay);
    }
    @keyframes nana-phosphor-breathe {
      0%,100%{opacity:.75}50%{opacity:.98}
    }
    @media(prefers-reduced-motion:reduce){
      html[data-theme="night"] #nana-glow-stars .nana-phosphor-star{animation:none}
    }
  `;
  document.head.appendChild(style);
  if(edit){
    document.documentElement.classList.add('nana-stars-edit');
    layer.style.setProperty('pointer-events','auto','important');
    group.style.setProperty('pointer-events','auto','important');
    const notice=document.createElement('div');
    notice.style.cssText='position:fixed;top:175px;left:12px;z-index:99999;background:#fff2fc;color:#ff173b;border:2px solid #ff173b;padding:10px;font:14px sans-serif;max-width:270px';
    notice.innerHTML='<div id="nana-stars-drag-handle" style="padding:7px 8px;margin:-5px -5px 8px;background:#ff173b;color:white;cursor:move;touch-action:none;user-select:none;font-weight:bold">⠿ Placement des étoiles · déplacer</div><p>Glisse une étoile pour la déplacer. Double-tape une étoile pour la supprimer.</p>';
    const handle=notice.querySelector('#nana-stars-drag-handle');
    let moving=null;
    handle.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      const rect=notice.getBoundingClientRect();
      moving={id:e.pointerId,dx:e.clientX-rect.left,dy:e.clientY-rect.top};
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener('pointermove',e=>{
      if(!moving||moving.id!==e.pointerId)return;
      const x=Math.max(0,Math.min(window.innerWidth-notice.offsetWidth,e.clientX-moving.dx));
      const y=Math.max(0,Math.min(window.innerHeight-notice.offsetHeight,e.clientY-moving.dy));
      notice.style.left=x+'px';notice.style.top=y+'px';
      e.preventDefault();
    });
    const stopMoving=e=>{if(moving&&moving.id===e.pointerId)moving=null;};
    handle.addEventListener('pointerup',stopMoving);
    handle.addEventListener('pointercancel',stopMoving);
    const save=document.createElement('button');save.textContent='Enregistrer';
    const add=document.createElement('button');add.textContent='+ Étoile';
    const reset=document.createElement('button');reset.textContent='Réinitialiser';
    const copy=document.createElement('button');copy.textContent='Copier les coordonnées';
    [save,add,copy,reset].forEach(b=>{b.style.cssText='margin:4px;padding:5px;background:white;border:1px solid #ff173b;color:#ff173b';notice.appendChild(b)});
    document.body.appendChild(notice);
    const persist=()=>{localStorage.setItem(storageKey,JSON.stringify(stars));};
    const refresh=()=>{elements.forEach((el,i)=>{if(!el)return;const v=stars[i];el.setAttribute('points',points(...v));el.style.display=v[2]>0?'':'none';});};
    const coords=e=>{const rect=layer.getBoundingClientRect();return [(e.clientX-rect.left)*1670/rect.width,(e.clientY-rect.top)*942/rect.height];};
    let active=-1;
    elements.forEach((el,i)=>{
      el.style.setProperty('pointer-events','all','important');el.style.touchAction='none';el.style.cursor='grab';
      el.addEventListener('pointerdown',e=>{active=i;el.setPointerCapture(e.pointerId);e.preventDefault()});
      el.addEventListener('pointermove',e=>{if(active!==i)return;const [x,y]=coords(e);stars[i][0]=Math.max(0,Math.min(1670,x));stars[i][1]=Math.max(0,Math.min(942,y));refresh();e.preventDefault()});
      el.addEventListener('pointerup',()=>{active=-1;persist()});
      el.addEventListener('dblclick',()=>{stars[i][2]=0;refresh();persist()});
    });
    save.onclick=()=>{persist();notice.querySelector('p').textContent='Positions enregistrées !'};
    const addStarAt=(x,y)=>{
      // Place each new star at a different visible location, then make it draggable.
      const count=stars.length;
      const v=[Math.max(0,Math.min(1670,x)),Math.max(0,Math.min(942,y)),7,0];
      stars.push(v);
      const el=document.createElementNS(NS,'polygon');
      el.setAttribute('class','nana-phosphor-star');
      el.style.setProperty('--day-star-color',palette[count%palette.length]);
      el.setAttribute('points',points(...v));
      el.style.setProperty('pointer-events','all','important');
      el.style.touchAction='none';
      el.style.cursor='grab';
      group.appendChild(el);
      elements.push(el);
      const index=stars.length-1;
      let dragging=false;
      el.addEventListener('pointerdown',e=>{
        dragging=true;
        el.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      el.addEventListener('pointermove',e=>{
        if(!dragging)return;
        const [x,y]=coords(e);
        stars[index][0]=Math.max(0,Math.min(1670,x));
        stars[index][1]=Math.max(0,Math.min(942,y));
        el.setAttribute('points',points(...stars[index]));
        e.preventDefault();
      });
      const finish=()=>{if(dragging){dragging=false;persist();}};
      el.addEventListener('pointerup',finish);
      el.addEventListener('pointercancel',finish);
      el.addEventListener('dblclick',()=>{stars[index][2]=0;el.style.display='none';persist()});
      persist();
      notice.querySelector('p').textContent='Étoile ajoutée !';
    };
    add.onclick=()=>{notice.querySelector('p').textContent='Touche un emplacement libre de la chambre';};
    layer.addEventListener('pointerdown',e=>{
      if(e.target.closest('.nana-phosphor-star'))return;
      const [x,y]=coords(e);
      addStarAt(x,y);
      e.preventDefault();
    });
    copy.onclick=async()=>{
      persist();
      const data=JSON.stringify({stars:stars.map(([x,y,size,angle])=>[Math.round(x*100)/100,Math.round(y*100)/100,size,angle])},null,2);
      try {
        await navigator.clipboard.writeText(data);
        notice.querySelector('p').textContent='Coordonnées copiées !';
      } catch (_) {
        const output=document.createElement('textarea');
        output.value=data;
        output.readOnly=true;
        output.style.cssText='display:block;width:260px;height:110px;margin-top:6px';
        notice.appendChild(output);
        output.focus();output.select();
        notice.querySelector('p').textContent='Sélectionne et copie le texte';
      }
    };
    reset.onclick=()=>{localStorage.removeItem(storageKey);location.reload()};
  }
})();
