/* Rug secret: the lifted corner uses Nana's hand-drawn PNG, trimmed without altering
   the source bedroom image. Floor restoration is visible only during the lift. */
(() => {
  'use strict';
  const scene=document.getElementById('play-scene');
  const svg=document.getElementById('hotspots');
  if(!scene||!svg||document.getElementById('nana-rug-secret'))return;
  // Compact alpha-preserving version of the corner sketch supplied on 2026-11-03.
  const nanaFoldImage='data:image/png;base64,'+'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';
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
      transform:rotate(0deg) scale(1); opacity:1;
      transition:transform 1.05s cubic-bezier(.24,.8,.25,1),opacity .22s ease;
    }
    #nana-rug-secret .rug-reveal-floor {
      opacity:0; transition:opacity .38s ease;
    }
    #nana-rug-secret .rug-floor-night {opacity:0;}
    html[data-theme="night"] #nana-rug-secret .rug-floor-day {opacity:0;}
    html[data-theme="night"] #nana-rug-secret .rug-floor-night {opacity:1;}
    #nana-rug-secret .rug-nana-fold {
      opacity:0; transform-origin:968px 571px; transform-box:view-box;
      transform:translate(-7px,8px) rotate(-9deg) scale(.89);
      transition:transform 1.05s cubic-bezier(.22,.77,.24,1), opacity .35s ease;
    }
    html[data-theme="night"] #nana-rug-secret .rug-nana-fold {
      filter:brightness(.7) saturate(.9);
    }
    #nana-rug-secret .rug-secret-under {
      opacity:0; transform:translate(12px,-5px) scale(.84);
      transform-origin:950px 608px; transform-box:view-box;
      transition:opacity .32s ease,transform .72s cubic-bezier(.2,.75,.2,1);
    }
    #nana-rug-secret .rug-fold-shadow {opacity:0;transition:opacity .5s;}
    #nana-rug-secret.is-open .rug-corner-flap {
      transform:rotate(-31deg) skewY(-8deg) scale(.78,.78);
      opacity:0;
    }
    #nana-rug-secret.is-open .rug-reveal-floor {opacity:1;}
    #nana-rug-secret.is-open .rug-nana-fold {
      opacity:1; transform:translate(0,0) rotate(0deg) scale(1);
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
      #nana-rug-secret .rug-fold-shadow,
      #nana-rug-secret .rug-reveal-floor,
      #nana-rug-secret .rug-nana-fold {transition:none!important;}
    }
  `;
  document.head.appendChild(style);
  const overlay=el('svg',{id:'nana-rug-secret',viewBox:'0 0 1670 942',
    preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});
  const defs=el('defs');
  const clip=el('clipPath',{id:'nana-rug-corner-clip'});
  clip.appendChild(el('path',{d:'M 980 576 Q 943 565 918 561 L 927 637 Q 951 611 980 576 Z'}));
  defs.appendChild(clip);
  // A tiny piece of neighboring parquet covers the printed rug underneath the
  // moving corner, so no doubled red contour remains when the corner is up.
  const floorClip=el('clipPath',{id:'nana-rug-floor-clip'});
  floorClip.appendChild(el('path',{d:'M 980 576 Q 945 563 917 559 L 927 639 Q 950 613 980 576 Z'}));
  defs.appendChild(floorClip);
  overlay.appendChild(defs);
  const floor=el('g',{class:'rug-reveal-floor','clip-path':'url(#nana-rug-floor-clip)'});
  floor.appendChild(el('image',{class:'rug-floor-day',href:'assets/background%20day.png',x:-85,y:0,width:1670,height:942,preserveAspectRatio:'none'}));
  floor.appendChild(el('image',{class:'rug-floor-night',href:'assets/background%20night.png',x:-85,y:0,width:1670,height:942,preserveAspectRatio:'none'}));
  overlay.appendChild(floor);

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
  // Move the secret into the uncovered opening beside the pink painted flap.
  const hiddenNote=el('g',{transform:'translate(23 -3)'});
  hiddenNote.append(paper,star,miniKey,tinyHeart);
  secret.appendChild(hiddenNote);
  overlay.appendChild(secret);

  // Duplicate only the true transparent rug texture in the triangular fold;
  // the existing full-room illustration remains the stable base layer.
  const flap=el('g',{class:'rug-corner-flap'});
  flap.appendChild(el('image',{'href':'assets/RUG.PNG',x:0,y:0,width:1670,height:942,
    preserveAspectRatio:'none','clip-path':'url(#nana-rug-corner-clip)'}));
  // No extra outline: this stroke was drawn over the wall beneath the window
  // even when the rug was closed. The illustrated rug already has its own lines.
  overlay.appendChild(flap);
  // The supplied sketch is already drawn in its raised state: use it only for
  // the lifted position; the original rug remains perfectly unchanged at rest.
  const nanaFold=el('g',{class:'rug-nana-fold'});
  nanaFold.appendChild(el('image',{href:nanaFoldImage,x:916,y:553,width:105,height:76,preserveAspectRatio:'none'}));
  overlay.appendChild(nanaFold);
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
