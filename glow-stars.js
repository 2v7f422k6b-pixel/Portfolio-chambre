/* Hand-drawn phosphorescent wall stars. Decorative only: never blocks poster clicks. */
(() => {
  'use strict';
  const svg = document.getElementById('hotspots');
  if (!svg || document.getElementById('nana-glow-stars')) return;
  const NS = 'http://www.w3.org/2000/svg';
  const stars = [
    [322,175,11,-12],[381,107,8,17],[452,181,13,7],[523,83,9,-16],
    [599,158,12,13],[678,98,8,-8],[736,184,11,18],[332,310,9,5],
    [403,275,12,-16],[470,362,8,22],[547,304,10,-12],[617,388,13,11],
    [695,323,9,-19],[759,385,11,7],[346,485,8,10],[429,450,10,-7],
    [562,489,9,16],[641,519,11,-12],[732,464,8,19],
    [1265,125,11,-12],[1321,79,8,20],[1390,142,12,8],[1473,88,9,-16],
    [1552,146,11,17],[1627,96,8,-8],[1250,267,9,15],[1328,300,13,-11],
    [1410,255,8,19],[1490,338,11,-7],[1572,286,9,15],[1640,365,12,-12],
    [1291,428,8,11],[1372,408,10,-17],[1505,465,8,9],[1603,435,11,-12]
  ];
  const group = document.createElementNS(NS,'g');
  group.id='nana-glow-stars';
  group.setAttribute('aria-hidden','true');
  group.setAttribute('pointer-events','none');
  group.style.pointerEvents='none';
  const points=(x,y,r,rotation)=>{
    const coords=[];
    for(let i=0;i<10;i++){
      const a=(i*36-90+rotation)*Math.PI/180;
      const radius=i%2 ? r*.46 : r;
      coords.push((x+Math.cos(a)*radius).toFixed(2)+','+(y+Math.sin(a)*radius).toFixed(2));
    }
    return coords.join(' ');
  };
  stars.forEach(([x,y,r,angle],i)=>{
    const star=document.createElementNS(NS,'polygon');
    star.setAttribute('points',points(x,y,r,angle));
    star.setAttribute('class','nana-phosphor-star');
    star.style.setProperty('--twinkle-delay',(i%9)*-.7+'s');
    star.setAttribute('pointer-events','none');
    group.appendChild(star);
  });
  // Append last for physical stickers to sit on top of posters, without stealing taps.
  svg.appendChild(group);
  const style=document.createElement('style');
  style.id='nana-glow-stars-style';
  style.textContent=`
    #nana-glow-stars, #nana-glow-stars * {pointer-events:none!important;cursor:inherit!important}
    #nana-glow-stars .nana-phosphor-star {
      fill:#cde6a4;stroke:#a7c78b;stroke-width:.7;
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
})();
