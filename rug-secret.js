/* Rug secret: lift the illustrated PNG's corner to reveal a tiny hidden key.
   Uses the exact room coordinates; never changes the original artwork. */
(() => {
  'use strict';
  const scene=document.getElementById('play-scene');
  const svg=document.getElementById('hotspots');
  if(!scene||!svg||document.getElementById('nana-rug-secret'))return;
  const NS='http://www.w3.org/2000/svg';
  const el=(tag,attributes={})=>{
    const n=document.createElementNS(NS,tag);
    Object.entries(attributes).forEach(([k,v])=>n.setAttribute(k,String(v)));
    return n;
  };
  const style=document.createElement('style');
  style.id='nana-rug-secret-styles';
  style.textContent=`
    #nana-rug-secret {
      position:absolute; inset:0; width:100%; height:100%;
      z-index:4; overflow:visible; pointer-events:none; line-height:normal;
    }
    #nana-rug-secret .rug-corner-flap {
      transform-origin:980px 576px; transform-box:view-box;
      transform:rotate(0deg) scale(1);
      transition:transform 1.05s cubic-bezier(.24,.8,.25,1);
    }
    #nana-rug-secret .rug-secret-under {
      opacity:0; transform:translate(12px,-5px) scale(.84);
      transform-origin:950px 608px; transform-box:view-box;
      transition:opacity .32s ease,transform .72s cubic-bezier(.2,.75,.2,1);
    }
    #nana-rug-secret .rug-fold-shadow {opacity:0;transition:opacity .5s;}
    #nana-rug-secret.is-open .rug-corner-flap {
      transform:rotate(-31deg) skewY(-8deg) scale(.78,.78);
    }
    #nana-rug-secret.is-open .rug-secret-under {
      opacity:1;transform:translate(0,0) scale(1);
      transition-delay:.25s;
    }
    #nana-rug-secret.is-open .rug-fold-shadow {opacity:1;}
    html[data-theme="night"] #nana-rug-secret .rug-secret-paper {fill:#e9b5ff;}
    @media(prefers-reduced-motion:reduce){
      #nana-rug-secret .rug-corner-flap,
      #nana-rug-secret .rug-secret-under,
      #nana-rug-secret .rug-fold-shadow {transition:none!important;}
    }
  `;
  document.head.appendChild(style);
  const overlay=el('svg',{id:'nana-rug-secret',viewBox:'0 0 1670 942',
    preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});
  const defs=el('defs');
  const clip=el('clipPath',{id:'nana-rug-corner-clip'});
  clip.appendChild(el('path',{d:'M 980 576 Q 943 565 918 561 L 927 637 Q 951 611 980 576 Z'}));
  defs.appendChild(clip);
  overlay.appendChild(defs);

  const shadow=el('path',{class:'rug-fold-shadow',
    d:'M 979 576 Q 946 560 916 561 Q 917 600 927 639 Q 950 619 979 576 Z',
    fill:'#372247','fill-opacity':'.32'});
  overlay.appendChild(shadow);

  const secret=el('g',{class:'rug-secret-under'});
  const paper=el('path',{class:'rug-secret-paper',
    d:'M 925 582 Q 940 579 968 581 L 972 617 Q 955 623 929 620 Z',
    fill:'#fff2fc',stroke:'#ff173b','stroke-width':'1.6'});
  const star=el('path',{d:'M 943 592 l 2.4 5.3 5.8 .8 -4.2 4.1 1 5.8 -5-2.7 -5.1 2.6 1-5.7 -4.1-4.1 5.6-.8 Z',
    fill:'#ff173b'});
  const miniKey=el('path',{d:'M 953 600 C 950 596 953 591 957 591 C 962 591 963 597 958 601 L 954 605 L 959 610 L 955 613 L 951 609 L 947 613 L 944 610 L 951 602',
    fill:'none',stroke:'#ff173b','stroke-width':'2.8','stroke-linejoin':'round','stroke-linecap':'round'});
  const tinyHeart=el('path',{d:'M 955 618 q -4 -4 -7 -1 q -3 4 7 9 q 10 -6 7 -9 q -3 -3 -7 1 Z',
    fill:'#ff173b',transform:'translate(-3 -8) scale(.9)'});
  secret.append(paper,star,miniKey,tinyHeart);
  overlay.appendChild(secret);

  // Duplicate only the true transparent rug texture in the triangular fold;
  // the existing full-room illustration remains the stable base layer.
  const flap=el('g',{class:'rug-corner-flap'});
  flap.appendChild(el('image',{'href':'assets/RUG.PNG',x:0,y:0,width:1670,height:942,
    preserveAspectRatio:'none','clip-path':'url(#nana-rug-corner-clip)'}));
  flap.appendChild(el('path',{d:'M 980 576 Q 943 565 918 561 L 927 637',
    fill:'none',stroke:'#ff173b','stroke-width':'2.1','stroke-linecap':'round',
    'stroke-linejoin':'round'}));
  overlay.appendChild(flap);
  scene.appendChild(overlay);

  let open=false,toastTimer=0;
  const toast=document.getElementById('toast');
  function updateZoneLabel(){
    const zone=window.NANA_ROOM_ZONES?.find(z=>z.id==='tapis');
    if(!zone?.element)return;
    zone.element.setAttribute('aria-label',open?'Rabattre le coin du tapis':'Soulever le coin du tapis');
    zone.element.setAttribute('aria-pressed',String(open));
    zone.element.dataset.open='rug-secret';
    delete zone.element.dataset.zonePending;
  }
  function toggle(){
    open=!open;
    overlay.classList.toggle('is-open',open);
    updateZoneLabel();
    if(open&&toast){
      const isEn=document.documentElement.lang==='en';
      toast.textContent=isEn?'A tiny red key… What could it unlock?':'Une petite clé rouge… Qu’est-ce qu’elle peut bien ouvrir ?';
      toast.hidden=false;
      clearTimeout(toastTimer);
      toastTimer=setTimeout(()=>{toast.hidden=true;},4300);
    }
  }
  svg.addEventListener('click',event=>{
    if(!event.target.closest?.('[data-room-zone-id="tapis"]'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggle();
  },true);
  svg.addEventListener('keydown',event=>{
    if(!['Enter',' '].includes(event.key)||!event.target.closest?.('[data-room-zone-id="tapis"]'))return;
    event.preventDefault();event.stopImmediatePropagation();toggle();
  },true);
  window.addEventListener('nana-room-zones-ready',updateZoneLabel);
  updateZoneLabel();
})();
