/* A marble, a loose wall tile, a hidden tin. Original PNGs stay untouched. */
(() => {
  'use strict';
  const scene=document.getElementById('play-scene'),app=document.getElementById('app');
  if(!scene||!app||window.NanaMemoryBox)return;
  // Positions follow Léna’s annotated desk corner and the wall beside the curtain.
  const TILE={x:1162,y:675,size:46};
  const PATH={start:[1250,535],edge:[1213,545],fall:[1200,590],hit:[1186,667],bounce:[1172,660],rest:[1155,731]};
  const point=([x,y])=>({left:(x/1670*100)+'%',top:(y/942*100)+'%'});
  const TILE_REST='translate(-35%,55%) rotate(-12deg) scaleY(.28)';
  const ROUTE='secret/boite-a-souvenirs',reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const t=(fr,en)=>document.documentElement.lang.startsWith('en')?en:fr;
  const words=value=>typeof value==='string'?value:value?.[document.documentElement.lang.startsWith('en')?'en':'fr']||value?.fr||'';
  const notify=()=>document.dispatchEvent(new Event('nana-route-change'));
  const frame='<img class="memory-frame" src="assets/drawn-ui/cadre_bouton.png" alt="" draggable="false">';
  const tin='<span class="memory-tin-body">'+frame+'<span class="memory-tin-label">Nana</span></span><span class="memory-tin-lid">'+frame+'<img class="memory-flower" src="assets/drawn-ui/fleur.png" alt=""></span>';
  const layer=document.createElement('div');layer.id='nana-memory-secret';layer.dataset.state='idle';layer.setAttribute('data-no-translate','');
  layer.innerHTML='<div class="memory-wall"><div class="memory-cavity" aria-hidden="true"></div><button type="button" class="memory-find" hidden>'+tin+'</button><div class="memory-tile" aria-hidden="true"><svg viewBox="'+TILE.x+' '+TILE.y+' '+TILE.size+' '+TILE.size+'" preserveAspectRatio="none"><image class="memory-wall-day" href="assets/chambre%20jour.PNG" width="1670" height="942" preserveAspectRatio="none"/><image class="memory-wall-night" href="assets/chamrbe%20nuit.PNG" width="1670" height="942" preserveAspectRatio="none"/></svg>'+frame+'</div></div><button class="memory-marble" type="button"><svg class="memory-marble-art" viewBox="94 144 714 696" aria-hidden="true"><image href="assets/beads/IMG_5213.png" width="1000" height="1000"/><ellipse cx="295" cy="314" rx="87" ry="33" transform="rotate(-36 295 314)" fill="#fff5e9" opacity=".8"/></svg></button><span class="memory-status" role="status" aria-live="polite"></span>';
  const start=point(PATH.start),wall=point([TILE.x,TILE.y]);
  layer.style.setProperty('--memory-marble-x',start.left);layer.style.setProperty('--memory-marble-y',start.top);
  layer.style.setProperty('--memory-wall-x',wall.left);layer.style.setProperty('--memory-wall-y',wall.top);
  layer.style.setProperty('--memory-wall-size',(TILE.size/1670*100)+'%');
  layer.style.setProperty('--memory-tile-rest',TILE_REST);
  scene.append(layer);
  const marble=layer.querySelector('.memory-marble'),tile=layer.querySelector('.memory-tile'),find=layer.querySelector('.memory-find'),status=layer.querySelector('.memory-status');
  // The shared filter draws only a white ring: keep it behind the original art.
  for(const [host,art] of [[marble,marble.querySelector('svg')],[find,find.querySelector('.memory-tin-body')]]){
    const ring=art.cloneNode(true);ring.classList.add('memory-hover');ring.setAttribute('aria-hidden','true');host.prepend(ring);
  }
  const dialog=document.createElement('dialog');dialog.id='nana-memory-box';dialog.setAttribute('aria-labelledby','memory-title');dialog.setAttribute('data-no-translate','');
  // Rounded tin silhouette, hinge and perspective rim, with slightly uneven UI strokes.
  // Flat colours preserve the room's palette; no photograph or aged-metal texture.
  dialog.innerHTML=`<button type="button" class="memory-close memory-ui-frame"><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button>
    <div class="memory-box-form">
      <svg class="memory-box-shape" viewBox="0 0 700 660" aria-hidden="true" focusable="false">
        <path class="memory-lid-shell" d="M112 284 C108 216 109 133 111 65 Q112 31 147 29 C280 27 418 31 554 29 Q588 30 590 64 C592 141 589 215 589 285 Z"/>
        <path class="memory-lid-inset" d="M134 260 C132 198 135 126 134 73 Q135 53 155 52 C282 54 417 51 545 53 Q567 53 567 75 C566 139 569 201 566 261 C421 259 278 263 134 260 Z"/>
        <path class="memory-front-wall" d="M51 576 L650 577 L647 615 Q645 643 620 645 C439 648 256 643 80 646 Q54 646 52 620 Z"/>
        <path class="memory-tray-rim" d="M116 289 C263 291 440 287 584 290 Q602 290 606 310 L649 578 Q654 605 626 607 C457 610 249 606 75 609 Q47 609 51 580 L93 312 Q97 290 116 289 Z"/>
        <path class="memory-tray-well" d="M128 320 C272 322 430 318 573 321 L611 565 Q614 586 594 587 C431 585 266 590 107 587 Q87 587 91 566 Z"/>
        <path class="memory-tray-floor" d="M139 345 C276 347 424 343 562 346 L594 558 Q598 570 584 571 C433 573 271 569 116 572 Q103 572 107 557 Z"/>
        <path class="memory-rim-line" d="M128 320 Q122 303 116 289 M573 321 Q579 306 584 290 M91 566 L75 609 M611 565 L626 607"/>
        <path class="memory-hinge" d="M204 277 Q217 275 232 278 L233 299 Q217 301 204 298 Z M468 277 Q482 276 495 278 L496 298 Q480 300 468 298 Z"/>
        <path class="memory-rim-line" d="M206 286 Q219 288 231 286 M470 286 Q482 288 494 286"/>
      </svg>
      <div class="memory-lid-copy"><p class="memory-eyebrow"></p><h1 id="memory-title"></h1><img src="assets/drawn-ui/fleur.png" alt=""></div>
      <div class="memory-items"></div>
    </div>
    <div class="memory-box-controls"><button type="button" class="memory-back memory-ui-frame" hidden></button><nav class="memory-pager" hidden><button class="memory-prev memory-ui-frame" type="button"></button><span class="memory-count"></span><button class="memory-next memory-ui-frame" type="button"></button></nav><button type="button" class="memory-replay"></button></div>`;
  document.body.append(dialog);
  let state='idle',run=0,page=-1,previousFocus=null;
  const animations=new Set();
  const items=()=>Array.isArray(window.NANA_MEMORY_ITEMS)?window.NANA_MEMORY_ITEMS.filter(x=>['image','audio'].includes(x.type)&&typeof x.src==='string'):[];
  function setState(next){state=next;layer.dataset.state=next;}
  function labels(){
    marble.setAttribute('aria-label',t('Toucher la petite bille','Touch the little marble'));
    find.setAttribute('aria-label',t('Ouvrir la boîte cachée dans le mur','Open the box hidden in the wall'));
    dialog.querySelector('.memory-close').setAttribute('aria-label',t('Refermer la boîte','Close the box'));
    dialog.querySelector('.memory-eyebrow').textContent=t('Les petits trésors de Nana','Nana’s little treasures');
    dialog.querySelector('h1').textContent=t('Ma boîte à souvenirs','My memory box');
    dialog.querySelector('.memory-replay').textContent=t('Rejouer la découverte','Replay the discovery');
    dialog.querySelector('.memory-back').textContent=t('Reposer dans la boîte','Put back in the box');
    dialog.querySelector('.memory-prev').textContent=t('Précédent','Previous');
    dialog.querySelector('.memory-next').textContent=t('Suivant','Next');
    if(state==='revealed')status.textContent=t('Le carreau s’est détaché. Une petite boîte était cachée derrière.','The tile came loose. A little box was hidden behind it.');
    if(dialog.open)renderItem();
  }
  function stopAudio(){dialog.querySelectorAll('audio').forEach(audio=>audio.pause());}
  function renderItem(){
    stopAudio();const list=items(),host=dialog.querySelector('.memory-items');host.replaceChildren();
    page=Math.max(-1,Math.min(page,list.length-1));
    host.classList.toggle('is-detail',page>=0);
    if(!list.length){
      const note=document.createElement('p');note.className='memory-empty';
      note.textContent=t('Les petits souvenirs arrivent bientôt…','Little memories are on their way…');host.append(note);
    }else if(page<0){
      // Each accessory is a button lying in the tray. Its chosen PNG may keep transparency.
      const places=[[24,27,-9],[72,29,8],[42,67,5],[79,72,-7],[18,76,7],[51,25,-4]];
      const clamp=(n,min,max,fallback)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
      list.forEach((item,index)=>{
        const [x,y,rotation]=places[index%places.length],button=document.createElement('button'),art=document.createElement('img');
        button.type='button';button.className='memory-object';button.dataset.memoryItem=String(index);
        button.setAttribute('aria-label',words(item.title)||t('Souvenir ','Memory ')+(index+1));
        button.style.left=clamp(item.x,12,88,x)+'%';button.style.top=clamp(item.y,15,85,y)+'%';
        button.style.width=clamp(item.width,15,35,28)+'%';button.style.setProperty('--memory-rotation',clamp(item.rotation,-25,25,rotation)+'deg');
        art.src=item.thumbnail||(item.type==='image'?item.src:'assets/drawn-ui/notes_musique.png');art.alt='';art.draggable=false;
        button.append(art);host.append(button);
      });
    }else{
      const item=list[page],figure=document.createElement('figure'),media=document.createElement(item.type==='audio'?'audio':'img');
      media.src=item.src;
      if(item.type==='image'){media.alt=words(item.alt)||words(item.title);media.draggable=false;}
      else{media.controls=true;media.preload='none';media.setAttribute('aria-label',words(item.title));}
      figure.append(media);
      const caption=document.createElement('figcaption'),title=document.createElement('strong'),text=document.createElement('p');
      title.textContent=words(item.title);text.textContent=words(item.caption);caption.append(title,text);figure.append(caption);host.append(figure);
    }
    const pager=dialog.querySelector('.memory-pager');pager.hidden=list.length<2||page<0;
    pager.querySelector('.memory-count').textContent=(page+1)+' / '+list.length;
    dialog.querySelector('.memory-back').hidden=page<0;
    dialog.querySelector('.memory-prev').disabled=page<=0;
    dialog.querySelector('.memory-next').disabled=page>=list.length-1;
  }
  function showBox(){
    if(state!=='revealed')return;
    previousFocus=document.activeElement;page=-1;labels();renderItem();
    if(!dialog.open)dialog.showModal();dialog.querySelector('.memory-close').focus({preventScroll:true});notify();
  }
  async function animate(node,frames,duration){
    if(reduce.matches||typeof node.animate!=='function')return;
    const animation=node.animate(frames,{duration,fill:'forwards',easing:'linear'});animations.add(animation);
    try{await animation.finished;}catch(_){}finally{animations.delete(animation);}
  }
  function cancelAnimations(){for(const animation of animations)animation.cancel();animations.clear();for(const node of [marble,tile])node.getAnimations?.().forEach(a=>a.cancel());}
  function reset(){run++;cancelAnimations();setState('idle');marble.hidden=false;marble.disabled=false;find.hidden=true;status.textContent='';}
  async function discover(openAfter=false){
    if(state==='revealed'){if(openAfter)showBox();return;}
    if(state!=='idle')return;
    const ticket=++run;setState('falling');marble.disabled=true;
    marble.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});notify();
    await animate(marble,[{...point(PATH.start),transform:'translate(-50%,-50%) rotate(0)'},{...point(PATH.edge),offset:.28},{...point(PATH.fall),offset:.62},{...point(PATH.hit),transform:'translate(-50%,-50%) rotate(-220deg)'}],1080);
    if(ticket!==run)return;setState('opening');
    await Promise.all([
      animate(tile,[{transform:'translate(0,0) rotate(0)'},{transform:'translate(-5%,0) rotate(5deg)',offset:.16},{transform:TILE_REST}],740),
      animate(marble,[{...point(PATH.hit),transform:'translate(-50%,-50%) rotate(-220deg)'},{...point(PATH.bounce),offset:.26},{...point(PATH.rest),transform:'translate(-50%,-50%) rotate(-390deg)'}],740)
    ]);
    if(ticket!==run)return;cancelAnimations();setState('revealed');marble.hidden=true;find.hidden=false;
    window.NanaProgress?.feat('secret-memory-box');
    status.textContent=t('Le carreau s’est détaché. Une petite boîte était cachée derrière.','The tile came loose. A little box was hidden behind it.');
    if(openAfter)showBox();else find.focus({preventScroll:true});notify();
  }
  function close(){if(dialog.open)dialog.close();reset();notify();}
  marble.addEventListener('click',event=>{event.stopPropagation();discover();});
  find.addEventListener('click',event=>{event.stopPropagation();showBox();});
  dialog.querySelector('.memory-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.memory-replay').addEventListener('click',()=>{dialog.close();reset();discover();});
  dialog.querySelector('.memory-items').addEventListener('click',event=>{
    const button=event.target.closest('[data-memory-item]');if(!button)return;
    page=Number(button.dataset.memoryItem);renderItem();dialog.querySelector('.memory-back').focus({preventScroll:true});
  });
  dialog.querySelector('.memory-back').addEventListener('click',()=>{const old=page;page=-1;renderItem();dialog.querySelector('[data-memory-item="'+old+'"]')?.focus({preventScroll:true});});
  dialog.querySelector('.memory-prev').addEventListener('click',()=>{page--;renderItem();});
  dialog.querySelector('.memory-next').addEventListener('click',()=>{page++;renderItem();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{stopAudio();if(state==='revealed'&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});notify();});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&state!=='idle'&&!dialog.open){event.preventDefault();event.stopImmediatePropagation();close();marble.focus({preventScroll:true});}},true);
  new MutationObserver(()=>{if(!app.classList.contains('mode-play')||app.classList.contains('nana-reality-active')){if(state!=='idle')close();}}).observe(app,{attributes:true,attributeFilter:['class']});
  // An app opened directly from the room must not leave a late animation
  // stealing focus or claiming that app's URL after the visitor has moved on.
  const otherViews=new MutationObserver(()=>{
    if(state!=='idle'&&document.querySelector('#window-shade:not([hidden]),#special-shade:not([hidden]),#coloring-overlay:not([hidden]),#nana-dreamlab-overlay'))close();
  });
  for(const selector of ['#window-shade','#special-shade','#coloring-overlay']){
    const node=document.querySelector(selector);if(node)otherViews.observe(node,{attributes:true,attributeFilter:['hidden']});
  }
  otherViews.observe(document.body,{childList:true});
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.NanaMemoryBox={open:()=>{discover(true);return true;},close,current:()=>state!=='idle'?ROUTE:null};
  labels();
})();
