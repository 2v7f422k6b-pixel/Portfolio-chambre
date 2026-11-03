/* Hand-drawn phosphorescent wall stars. Decorative only: never blocks poster clicks. */
(() => {
  'use strict';
  const scene = document.getElementById('play-scene');
  if (!scene || document.getElementById('nana-glow-stars-layer')) return;
  const NS = 'http://www.w3.org/2000/svg';
  // Wall-only positions: keep stickers away from Rilakkuma, bed, mirror, window, desk and posters where possible.
  // Stickers only in gaps of the wall, away from furniture and window.
  const stars = [
    [302,166,7,10],[316,210,6,-8],[298,255,7,16],
    [505,222,6,-9],[512,253,7,11],[505,288,6,-17],
    [570,204,7,4],[574,267,6,12],[577,317,7,-9],
    [738,215,6,8],[748,259,7,-15],[751,305,6,14],
    [760,348,7,-6],[760,394,6,17],[767,448,7,-12],
    [1244,112,7,8],[1260,159,6,-14],[1273,205,7,12],
    [1281,256,6,-7],[1290,303,7,16],[1302,351,6,-9],
    [1305,399,7,10],[1305,443,6,-12],
    [1465,65,7,12],[1485,120,6,-8],[1496,173,7,15],
    [1644,79,6,-10],[1646,136,7,8],[1647,190,6,16],
    [1648,250,7,-13],[1647,310,6,9]
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
  layer.style.cssText='position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;pointer-events:none!important;overflow:visible!important;z-index:4!important;transform:none!important;contain:layout style;';
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
    notice.innerHTML='<b>Placement des étoiles</b><p>Glisse une étoile pour la déplacer. Double-tape une étoile pour la supprimer.</p>';
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
    save.onclick=()=>{persist();notice.firstElementChild.textContent='Positions enregistrées !'};
    add.onclick=()=>{const v=[835,470,7,0];stars.push(v);const el=document.createElementNS(NS,'polygon');el.setAttribute('class','nana-phosphor-star');el.style.setProperty('--day-star-color',palette[stars.length%palette.length]);group.appendChild(el);elements.push(el);el.setAttribute('points',points(...v));el.style.setProperty('pointer-events','all','important');el.style.touchAction='none';el.onpointerdown=e=>{const [x,y]=coords(e);v[0]=x;v[1]=y;el.setAttribute('points',points(...v));persist()};persist();};
    copy.onclick=async()=>{
      persist();
      const data=JSON.stringify({stars:stars.map(([x,y,size,angle])=>[Math.round(x*100)/100,Math.round(y*100)/100,size,angle])},null,2);
      try {
        await navigator.clipboard.writeText(data);
        notice.firstElementChild.textContent='Coordonnées copiées !';
      } catch (_) {
        const output=document.createElement('textarea');
        output.value=data;
        output.readOnly=true;
        output.style.cssText='display:block;width:260px;height:110px;margin-top:6px';
        notice.appendChild(output);
        output.focus();output.select();
        notice.firstElementChild.textContent='Sélectionne et copie le texte';
      }
    };
    reset.onclick=()=>{localStorage.removeItem(storageKey);location.reload()};
  }
})();
