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
  dialog.innerHTML='<button type="button" class="memory-close memory-ui-frame"><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button><div class="memory-open-lid memory-ui-frame"><img src="assets/drawn-ui/fleur.png" alt=""><span></span><img src="assets/drawn-ui/fleur.png" alt=""></div><section class="memory-box-inside memory-ui-frame"><p class="memory-eyebrow"></p><h1 id="memory-title"></h1><div class="memory-items"></div><nav class="memory-pager"><button class="memory-prev memory-ui-frame" type="button"></button><span></span><button class="memory-next memory-ui-frame" type="button"></button></nav><button type="button" class="memory-replay memory-ui-frame"></button></section>';
  document.body.append(dialog);
  let state='idle',run=0,page=0,previousFocus=null;
  const animations=new Set();
  const items=()=>Array.isArray(window.NANA_MEMORY_ITEMS)?window.NANA_MEMORY_ITEMS.filter(x=>['image','audio'].includes(x.type)&&typeof x.src==='string'):[];
  function setState(next){state=next;layer.dataset.state=next;}
  function labels(){
    marble.setAttribute('aria-label',t('Toucher la petite bille','Touch the little marble'));
    find.setAttribute('aria-label',t('Ouvrir la boîte cachée dans le mur','Open the box hidden in the wall'));
    dialog.querySelector('.memory-close').setAttribute('aria-label',t('Refermer la boîte','Close the box'));
    dialog.querySelector('.memory-open-lid span').textContent=t('Les petits trésors de Nana','Nana’s little treasures');
    dialog.querySelector('.memory-eyebrow').textContent=t('Derrière le mur…','Behind the wall…');
    dialog.querySelector('h1').textContent=t('Ma boîte à souvenirs','My memory box');
    dialog.querySelector('.memory-replay').textContent=t('Rejouer la découverte','Replay the discovery');
    dialog.querySelector('.memory-prev').textContent=t('Précédent','Previous');
    dialog.querySelector('.memory-next').textContent=t('Suivant','Next');
    if(state==='revealed')status.textContent=t('Le carreau s’est détaché. Une petite boîte était cachée derrière.','The tile came loose. A little box was hidden behind it.');
    if(dialog.open)renderItem();
  }
  function stopAudio(){dialog.querySelectorAll('audio').forEach(audio=>audio.pause());}
  function renderItem(){
    stopAudio();const list=items(),host=dialog.querySelector('.memory-items');host.replaceChildren();
    page=Math.max(0,Math.min(page,list.length-1));
    if(!list.length){
      const note=document.createElement('p');note.className='memory-empty';
      note.textContent=t('Tu as trouvé ma cachette. Mes souvenirs se glisseront bientôt ici.','You found my hiding place. My memories will find their way here soon.');host.append(note);
    }else{
      const item=list[page],figure=document.createElement('figure'),media=document.createElement(item.type==='audio'?'audio':'img');
      media.src=item.src;
      if(item.type==='image'){media.alt=words(item.alt)||words(item.title);media.draggable=false;}
      else{media.controls=true;media.preload='none';media.setAttribute('aria-label',words(item.title));}
      figure.append(media);
      const caption=document.createElement('figcaption'),title=document.createElement('strong'),text=document.createElement('p');
      title.textContent=words(item.title);text.textContent=words(item.caption);caption.append(title,text);figure.append(caption);host.append(figure);
    }
    const pager=dialog.querySelector('.memory-pager');pager.hidden=list.length<2;
    pager.querySelector('span').textContent=(page+1)+' / '+list.length;
    dialog.querySelector('.memory-prev').disabled=page===0;
    dialog.querySelector('.memory-next').disabled=page>=list.length-1;
  }
  function showBox(){
    if(state!=='revealed')return;
    previousFocus=document.activeElement;page=0;labels();renderItem();
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
