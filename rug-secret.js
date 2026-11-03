/* Rug secret, v2. Nana's Procreate corner is aligned to the ORIGINAL 2048 x 1154
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
  const DRAWING={x:651/2048*1670,y:1024/1154*942,
                 width:193/2048*1670,height:130/1154*942};

  const style=document.createElement('style');
  style.id='nana-rug-secret-styles';
  style.textContent=`
    #nana-rug-secret{position:absolute;inset:0;width:100%;height:100%;
      z-index:4;overflow:visible;pointer-events:none;line-height:normal}
    #nana-rug-secret .rug-reveal-floor{opacity:0;transition:opacity .5s ease}
    #nana-rug-secret .rug-nana-fold{opacity:0;
      transform-box:view-box;transform-origin:625px 859px;
      transform:translate(4px,7px) rotate(7deg) scale(.9);
      transition:opacity .28s ease,transform 1.05s cubic-bezier(.2,.75,.23,1)}
    #nana-rug-secret .rug-secret-under{opacity:0;
      transform-box:view-box;transform-origin:650px 900px;
      transform:scale(.8);transition:opacity .3s ease,transform .6s ease}
    #nana-rug-secret.is-open .rug-reveal-floor{opacity:1}
    #nana-rug-secret.is-open .rug-nana-fold{opacity:1;transform:none}
    #nana-rug-secret.is-open .rug-secret-under{opacity:1;transform:none;
      transition-delay:.55s}
    html[data-theme="night"] #nana-rug-secret .rug-reveal-floor{filter:brightness(.78)}
    html[data-theme="night"] #nana-rug-secret .rug-nana-fold{filter:brightness(.78)}
    @media(prefers-reduced-motion:reduce){
      #nana-rug-secret .rug-reveal-floor,
      #nana-rug-secret .rug-nana-fold,
      #nana-rug-secret .rug-secret-under{transition:none!important}}
  `;
  document.head.appendChild(style);
  const overlay=make('svg',{id:'nana-rug-secret',viewBox:'0 0 1670 942',
    preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});

  // The corner now sits at the LEFT, FRONT edge of the green rug, alongside
  // the bed/table rather than floating on the wall beneath the window.
  // These coordinates follow the original red outline in Nana's drawing.
  const floor=make('path',{class:'rug-reveal-floor',
    d:'M 625 860 Q 652 868 680 908 Q 647 928 617 942 L 618 871 Z',
    fill:'#f7d6e3'});
  overlay.appendChild(floor);

  const drawing=make('g',{class:'rug-nana-fold'});
  drawing.appendChild(make('image',{
    href:nanaFoldImage,x:DRAWING.x,y:DRAWING.y,
    width:DRAWING.width,height:DRAWING.height,
    preserveAspectRatio:'none'
  }));
  overlay.appendChild(drawing);

  // Keep the original little red key as the secret revealed by this corner.
  const secret=make('g',{class:'rug-secret-under'});
  secret.appendChild(make('path',{d:'M 635 889 Q 647 885 660 890 L 662 913 Q 650 917 636 913 Z',
    fill:'#fff2fc',stroke:'#ff173b','stroke-width':'1.8'}));
  secret.appendChild(make('path',{d:'M 644 902 A 4 4 0 1 1 651 903 L 649 908 L 654 911 L 651 915 L 647 912 L 644 915 L 641 912 L 645 908 L 646 905',
    fill:'none',stroke:'#ff173b','stroke-width':'2.2','stroke-linejoin':'round',
    'stroke-linecap':'round'}));
  overlay.appendChild(secret);
  scene.appendChild(overlay);

  let opened=false,toastTimer;
  const toast=document.getElementById('toast');
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
    if(opened&&toast){
      toast.textContent=document.documentElement.lang==='en'
        ?'A tiny red key… What could it unlock?'
        :'Une petite clé rouge… Qu’est-ce qu’elle peut bien ouvrir ?';
      toast.hidden=false;
      clearTimeout(toastTimer);
      toastTimer=setTimeout(()=>{toast.hidden=true;},4300);
    }
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
