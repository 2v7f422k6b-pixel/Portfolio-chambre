/* Rug secret, v3. Nana's Procreate corner is aligned to the ORIGINAL 2048 x 1154
   canvas, which has the same aspect ratio as the interactive 1670 x 942 room.
   Do not use an arbitrary placement: the original drawing already has position. */
(() => {
  'use strict';
  const scene=document.getElementById('play-scene');
  const svg=document.getElementById('hotspots');
  if(!scene||!svg||document.getElementById('nana-rug-secret'))return;
  const NS='http://www.w3.org/2000/svg';
  const make=(tag,attrs={})=>{
    const n=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([name,value])=>n.setAttribute(name,String(value)));
    return n;
  };

  // User artwork: exact visible bbox in 2048x1154 canvas x655..840 y1028..1154.
  // The trimmed file has a 4px transparent rim: start x651, y1024.
  // Room coordinates: (651/2048*1670,1024/1154*942), not the old 916,553.
  const nanaFoldImage='data:image/png;base64,'+'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';
  const nanaFoldImageNight='data:image/png;base64,'+'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';
  const DRAWING={x:651/2048*1670,y:1024/1154*942,
                 width:193/2048*1670,height:130/1154*942};

  const style=document.createElement('style');
  style.id='nana-rug-secret-styles';
  style.textContent=`
    #nana-rug-secret{position:absolute;inset:0;width:100%;height:100%;
      z-index:4;overflow:visible;pointer-events:none;line-height:normal}
    #nana-rug-secret .rug-nana-fold{opacity:0;
      transform-box:view-box;transform-origin:625px 859px;
      transform:translate(4px,7px) rotate(7deg) scale(.9);
      transition:opacity .28s ease,transform 1.05s cubic-bezier(.2,.75,.23,1)}
    #nana-rug-secret.is-open .rug-nana-fold{opacity:1;transform:none}
    #nana-rug-secret .rug-fold-night{display:none}
    html[data-theme="night"] #nana-rug-secret .rug-fold-day{display:none}
    html[data-theme="night"] #nana-rug-secret .rug-fold-night{display:block}

    /* A tiny, slightly crooked hand-drawn spider sneaks out as the corner lifts. */
    #nana-rug-secret .rug-spider-run{
      opacity:0;
      transform:translate(610px,900px) scale(.28);
      transform-origin:0 0;
      pointer-events:none;
    }
    #nana-rug-secret.is-open .rug-spider-run{
      animation:nana-spider-dash 2.25s .62s both linear;
    }
    #nana-rug-secret .rug-spider-legs{
      transform-origin:0 0;
    }
    #nana-rug-secret.is-open .rug-spider-legs{
      animation:nana-spider-scuttle .13s .62s 18 alternate ease-in-out;
    }
    #nana-rug-secret .rug-spider-ink{
      stroke:#17345c;
    }
    #nana-rug-secret .rug-spider-body{
      fill:#102847;
      stroke:#274a78;
    }
    html[data-theme="night"] #nana-rug-secret .rug-spider-ink{
      stroke:#050506;
    }
    html[data-theme="night"] #nana-rug-secret .rug-spider-body{
      fill:#09090b;
      stroke:#141418;
    }
    @keyframes nana-spider-dash{
      0%,7%  {opacity:0;transform:translate(610px,900px) rotate(-10deg) scale(.28)}
      13%    {opacity:1;transform:translate(620px,904px) rotate(12deg) scale(.42)}
      25%    {opacity:1;transform:translate(628px,918px) rotate(-10deg) scale(.44)}
      38%    {opacity:1;transform:translate(638px,936px) rotate(11deg) scale(.45)}
      52%    {opacity:1;transform:translate(648px,958px) rotate(-9deg) scale(.44)}
      68%    {opacity:1;transform:translate(660px,986px) rotate(10deg) scale(.43)}
      84%    {opacity:1;transform:translate(673px,1018px) rotate(-8deg) scale(.40)}
      100%   {opacity:0;transform:translate(688px,1060px) rotate(9deg) scale(.36)}
    }
    @keyframes nana-spider-scuttle{
      from{transform:rotate(-8deg) scaleX(.91)}
      to{transform:rotate(8deg) scaleX(1.08)}
    }
    @media(prefers-reduced-motion:reduce){
      #nana-rug-secret .rug-nana-fold{transition:none!important}
      #nana-rug-secret.is-open .rug-spider-run{
        animation:none!important;opacity:1;
        transform:translate(640px,918px) scale(.42)!important;
      }
      #nana-rug-secret .rug-spider-legs{animation:none!important}
    }
  `;
  document.head.appendChild(style);
  const overlay=make('svg',{id:'nana-rug-secret',viewBox:'0 0 1670 942',
    preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});

  const drawing=make('g',{class:'rug-nana-fold'});
  drawing.appendChild(make('image',{
    class:'rug-fold-day',href:nanaFoldImage,x:DRAWING.x,y:DRAWING.y,
    width:DRAWING.width,height:DRAWING.height,
    preserveAspectRatio:'none'
  }));
  drawing.appendChild(make('image',{
    class:'rug-fold-night',href:nanaFoldImageNight,x:DRAWING.x,y:DRAWING.y,
    width:DRAWING.width,height:DRAWING.height,
    preserveAspectRatio:'none'
  }));
  overlay.appendChild(drawing);

  // Drawn in the scene's 1670×942 coordinate system so it follows the rug
  // at every viewport size. The four crooked legs on each side wiggle as it runs.
  const spider=make('g',{class:'rug-spider-run'});
  const legs=make('g',{class:'rug-spider-legs rug-spider-ink',
    fill:'none', 'stroke-width':'1.65',
    'stroke-linejoin':'round', 'stroke-linecap':'round'});
  [
    'M -3 -2 Q -8 -10 -12 -8 Q -15 -7 -15 -11',
    'M -4 -1 Q -10 -5 -15 -3',
    'M -4 2 Q -11 2 -15 7',
    'M -3 3 Q -8 9 -12 12',
    'M 3 -3 Q 8 -10 12 -8 Q 15 -7 15 -11',
    'M 4 -1 Q 11 -6 15 -2',
    'M 4 2 Q 11 2 15 7',
    'M 3 3 Q 8 10 12 12'
  ].forEach(d=>legs.appendChild(make('path',{d})));
  spider.appendChild(legs);
  spider.appendChild(make('ellipse',{class:'rug-spider-body',cx:'-2.2',
    cy:'0',rx:'5.4',ry:'5.1','stroke-width':'1.1'}));
  spider.appendChild(make('ellipse',{class:'rug-spider-body',cx:'4.3',
    cy:'-1.5',rx:'3.1',ry:'3.0','stroke-width':'1'}));
  spider.appendChild(make('circle',{cx:'5.2',cy:'-2.5',r:'.85',fill:'#fff0f3'}));
  // Clip only the spider (not the rug fold) at the room's lower edge,
  // so it vanishes naturally as it scuttles off the bottom of the screen.
  const spiderClip=make('clipPath',{id:'nana-rug-spider-clip',clipPathUnits:'userSpaceOnUse'});
  spiderClip.appendChild(make('rect',{x:0,y:0,width:1670,height:942}));
  const definitions=make('defs');
  definitions.appendChild(spiderClip);
  overlay.appendChild(definitions);
  const spiderViewport=make('g',{'clip-path':'url(#nana-rug-spider-clip)'});
  spiderViewport.appendChild(spider);
  overlay.appendChild(spiderViewport);

  scene.appendChild(overlay);

  let opened=false;
  function updateZoneLabel(){
    const zone=window.NANA_ROOM_ZONES?.find(z=>z.id==='tapis');
    if(!zone?.element)return;
    zone.element.setAttribute('aria-label',opened?'Rabattre le coin du tapis':'Soulever le coin du tapis');
    zone.element.setAttribute('aria-pressed',String(opened));
    zone.element.dataset.open='rug-secret';
    delete zone.element.dataset.zonePending;
  }
  function toggle(){
    opened=!opened;
    overlay.classList.toggle('is-open',opened);
    updateZoneLabel();

  }
  svg.addEventListener('click',event=>{
    if(!event.target.closest?.('[data-room-zone-id="tapis"]'))return;
    event.preventDefault();event.stopImmediatePropagation();toggle();
  },true);
  svg.addEventListener('keydown',event=>{
    if(!['Enter',' '].includes(event.key)
        ||!event.target.closest?.('[data-room-zone-id="tapis"]'))return;
    event.preventDefault();event.stopImmediatePropagation();toggle();
  },true);
  window.addEventListener('nana-room-zones-ready',updateZoneLabel);
  updateZoneLabel();
})();
