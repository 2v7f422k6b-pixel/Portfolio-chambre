/* A visitor's notebook: real progress, Léna's stickers and optional collectible titles. */
(() => {
  'use strict';
  const progress=window.NanaProgress, trigger=document.getElementById('nana-journal-trigger');
  if(!progress||!trigger)return;
  const tabs=[['chambre','Ma chambre','My room'],['secrets','Mes secrets','My secrets'],['jeux','Mes jeux','My games'],['dressing','Mon dressing','My wardrobe'],['stickers','Mes stickers','My stickers'],['titres','Mes titres','My titles'],['cadeaux','Mes cadeaux','My gifts']];
  const english=()=>document.documentElement.lang.startsWith('en');
  const t=(fr,en)=>english()?en:fr;
  const name=value=>value[english()?'en':'fr'];
  const h=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const img=(src,cls='')=>typeof src==='object'?'<svg class="nj-art '+cls+'" viewBox="'+src.box.join(' ')+'" aria-hidden="true" focusable="false"><image href="'+h(src.src)+'" width="'+src.width+'" height="'+src.height+'"/></svg>':'<img class="'+cls+'" src="'+h(src)+'" alt="" draggable="false">';
  const button=(text,attrs='',cls='')=>'<button type="button" class="nj-button '+cls+'" '+attrs+'>'+text+'</button>';
  const star='assets/drawn-ui/etoile_pleine.png';
  let active='chambre', page=0, previousFocus, wardrobe=null, wardrobeError=false, wardrobeLoading=false, toastTimer;
  const small=matchMedia('(max-width:600px)');
  const dialog=document.createElement('dialog');
  dialog.id='nana-journal';dialog.className='nj-frame';dialog.setAttribute('data-no-translate','');
  dialog.setAttribute('aria-labelledby','nj-title');
  dialog.innerHTML='<div class="nj-shell"><header class="nj-header nj-rule"><span class="nj-file">'+img(star)+' carnet.exe</span><button class="nj-close nj-button" type="button" data-nj-close><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button></header><div class="nj-layout"><aside class="nj-sidebar"><div class="nj-heading"><p class="nj-eyebrow"></p><h1 id="nj-title"></h1><p class="nj-selected-title"></p></div><nav class="nj-tabs" aria-label="Carnet"></nav><div class="nj-local-note"></div></aside><section class="nj-main" aria-live="off"><div class="nj-content"></div><nav class="nj-pager" aria-label="Pages"></nav></section></div></div>';
  document.body.append(dialog);
  const content=dialog.querySelector('.nj-content'), pager=dialog.querySelector('.nj-pager');
  const notice=document.createElement('div');notice.id='nana-journal-notice';notice.className='nj-frame';notice.hidden=true;notice.setAttribute('data-no-translate','');
  notice.innerHTML='<span role="status" aria-live="polite"></span><button type="button" data-nj-notice></button>';
  document.body.append(notice);
  function ratio(){const r=progress.snapshot().room;return{...r,count:r.discovered.filter(x=>r.required.includes(x)).length,total:r.required.length};}
  function meter(count,total,label){const percent=total?Math.min(100,Math.round(count/total*100)):0;return '<div class="nj-progress" role="progressbar" aria-label="'+h(label)+'" aria-valuemin="0" aria-valuemax="'+Math.max(total,1)+'" aria-valuenow="'+count+'"><span style="width:'+percent+'%"></span></div>';}
  function heading(title,subtitle){return '<div class="nj-section-title"><h2>'+h(title)+'</h2><p>'+h(subtitle)+'</p></div>';}
  function routeButton(route,label){return button(h(label),'data-nj-route="'+h(route)+'"');}
  function paginate(items,render,{size=small.matches?4:6,cls='nj-grid'}={}){
    const pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
    pager.innerHTML=pages>1?button(img('assets/drawn-ui/fleche_gauche.png'),'data-nj-page="-1" aria-label="'+t('Page précédente','Previous page')+'" '+(page===0?'disabled':''))+'<span>'+t('Page ','Page ')+(page+1)+' / '+pages+'</span>'+button(img('assets/drawn-ui/fleche_droite.png'),'data-nj-page="1" aria-label="'+t('Page suivante','Next page')+'" '+(page===pages-1?'disabled':'')):'';
    return '<div class="'+cls+'">'+items.slice(page*size,(page+1)*size).map(render).join('')+'</div>';
  }
  function roomPage(){
    const r=ratio(),pct=r.total?Math.round(r.count/r.total*100):0;
    const found=progress.secrets.filter(x=>progress.hasFeat(x.id)).length;
    const summary=[['secrets',found,progress.secrets.length,t('secrets trouvés','secrets found')],['jeux',progress.games.filter(x=>progress.hasVisit(x.route)).length,progress.games.length,t('jeux découverts','games discovered')],['stickers',progress.stickers.filter(x=>x.earned()).length,progress.stickers.length,t('stickers collés','stickers collected')],['titres',progress.titles.filter(x=>x.earned()).length,progress.titles.length,t('titres gagnés','titles earned')]];
    return heading(t('Bienvenue dans ton petit carnet','Welcome to your little notebook'),t('Chaque détour laisse un souvenir.','Every little detour leaves a memory.'))+
      '<div class="nj-hero nj-frame"><div><p>'+t('La chambre explorée','Room explored')+'</p><strong>'+pct+'<small> %</small></strong><p>'+r.count+' / '+r.total+' '+t('objets découverts','objects discovered')+'</p></div>'+img(star,'nj-hero-star')+meter(r.count,r.total,t('Exploration de la chambre','Room exploration'))+'</div>'+
      '<div class="nj-stats">'+summary.map(([tab,n,total,label])=>'<button type="button" class="nj-stat nj-frame" data-nj-tab="'+tab+'"><strong>'+n+' <small>/ '+total+'</small></strong><span>'+label+'</span></button>').join('')+'</div>'+
      '<p class="nj-bottom-note">'+(progress.snapshot().persistent?t('Tes découvertes restent ici quand tu reviens sur ce navigateur.','Your discoveries stay here when you return in this browser.'):t('Ton navigateur ne permet pas la sauvegarde : tes découvertes restent disponibles pendant cette visite.','Your browser cannot save progress: your discoveries are available for this visit.'))+'</p>';
  }
  function secretsPage(){const count=progress.secrets.filter(x=>progress.hasFeat(x.id)).length;return heading(t('Les secrets de la chambre','The room’s secrets'),count+' / '+progress.secrets.length+' '+t('petites surprises trouvées','little surprises found'))+paginate(progress.secrets,(secret)=>{
    const found=progress.hasFeat(secret.id),number=progress.secrets.indexOf(secret)+1;
    return '<article class="nj-card nj-frame '+(found?'':'nj-locked')+'">'+(found?img(secret.image):'<span class="nj-mystery">?</span>')+'<h3>'+h(found?name(secret.name):t('Secret n° ','Secret no. ')+number)+'</h3><p>'+t(found?'Découvert':'Encore bien caché',found?'Discovered':'Still well hidden')+'</p>'+(found?routeButton(secret.route,t('Revoir','Revisit')):'')+'</article>';
  },{size:4});}
  function gamesPage(){const found=progress.games.filter(x=>progress.hasVisit(x.route)).length;return heading(t('À quoi on joue ?','What shall we play?'),found+' / '+progress.games.length+' '+t('jeux découverts','games discovered'))+paginate(progress.games,game=>{
    const unlocked=progress.hasVisit(game.route);
    return '<article class="nj-card nj-frame '+(unlocked?'':'nj-locked')+'">'+img(game.image)+'<h3>'+h(name(game.name))+'</h3><p>'+t(unlocked?'Dans ta collection':'À découvrir dans la chambre',unlocked?'In your collection':'Find it in the room')+'</p>'+(unlocked?routeButton(game.route,t('Jouer','Play')):'')+'</article>';
  });}
  async function loadWardrobe(){
    if(wardrobe||wardrobeLoading)return;wardrobeLoading=true;wardrobeError=false;
    try{
      const response=await fetch('about-me.html?v=20261108-journal-1');
      if(!response.ok)throw new Error('wardrobe');
      const source=new DOMParser().parseFromString(await response.text(),'text/html');
      const data=JSON.parse(source.getElementById('assets').textContent);
      if(!data.items||!data.sprites)throw new Error('wardrobe');wardrobe=data;
    }catch(_){wardrobeError=true;}finally{wardrobeLoading=false;if(dialog.open&&active==='dressing')render();}
  }
  function dressingPage(){
    const unlocked=progress.outfits.filter(x=>progress.unlockedOutfit(x.id)).length;
    const total=wardrobe?Object.keys(wardrobe.items).length:null,locked=progress.unlockedOutfit('clown')?0:progress.outfits.find(x=>x.id==='clown').pieces.length;
    const inventory=total===null?(wardrobeError?t('Le dressing n’a pas pu être chargé.','The wardrobe could not be loaded.'):t('Ouverture du dressing…','Opening the wardrobe…')):(total-locked)+' / '+total+' '+t('pièces accessibles','pieces available');
    return heading(t('Des tenues à découvrir','Looks to discover'),inventory)+
      '<div class="nj-wardrobe-summary"><p>'+unlocked+' / '+progress.outfits.length+' '+t('tenues bonus débloquées','bonus looks unlocked')+'</p>'+routeButton('jeu/dressing',t('Ouvrir le dressing','Open the wardrobe'))+(wardrobeError?button(t('Réessayer','Try again'),'data-nj-retry'):'')+'</div>'+
      paginate(progress.outfits,outfit=>{
        const earned=progress.unlockedOutfit(outfit.id);
        return '<article class="nj-card nj-outfit nj-frame '+(earned?'':'nj-locked')+'">'+img(outfit.image)+'<div><h3>'+h(name(outfit.name))+'</h3><p>'+h(earned?t('Tenue débloquée','Look unlocked'):name(outfit.rule))+'</p>'+(earned||progress.isCreator()?button(h(earned?t('Essayer','Try on'):t('Aperçu créatrice','Creator preview')),'data-nj-outfit="'+outfit.id+'"'):'')+'</div></article>';
      },{size:4})+(progress.isCreator()?'<p class="nj-bottom-note">'+t('Aperçu créatrice : les essais ne modifient pas ta progression.','Creator preview: trying things does not change your progress.')+'</p>':'');
  }
  function stickersPage(){const count=progress.stickers.filter(x=>x.earned()).length;return heading(t('Mon album de petits trésors','My album of little treasures'),count+' / '+progress.stickers.length+' '+t('stickers à collectionner','collectible stickers'))+paginate(progress.stickers,(sticker)=>{
    const earned=sticker.earned(),number=progress.stickers.indexOf(sticker)+1;
    return '<article class="nj-sticker '+(earned?'is-earned':'nj-locked')+'" style="--tilt:'+([-5,3,-2,4,-3,2][number%6])+'deg"><div class="nj-sticker-art">'+img(sticker.image)+'</div><p>'+h(earned?name(sticker.name):t('À découvrir','To discover'))+'</p><small>'+String(number).padStart(2,'0')+'</small></article>';
  },{cls:'nj-sticker-grid'});}
  function titlesPage(){const selected=progress.snapshot().title;return heading(t('Un titre qui te ressemble','A title that feels like you'),t('Collectionne-les et choisis celui que tu portes.','Collect them and choose the one you wear.'))+paginate(progress.titles,title=>{
    const earned=title.earned(),chosen=selected===title.id;
    return '<article class="nj-title-card nj-frame '+(earned?'':'nj-locked')+'">'+img(star)+'<div><h3>'+h(name(title.name))+'</h3><p>'+h(name(title.rule))+'</p></div>'+(earned?button(t(chosen?'Porté':'Porter ce titre',chosen?'Wearing':'Wear this title'),'data-nj-title="'+title.id+'" aria-pressed="'+chosen+'"'):'<span class="nj-status">'+t('À gagner','To earn')+'</span>')+'</article>';
  },{cls:'nj-titles',size:small.matches?3:4});}
  function giftsPage(){const r=ratio(),won=progress.fullRoom()||r.celebrated;return heading(t('Tes petits cadeaux','Your little gifts'),t('Des souvenirs à garder et une attention pour la boutique.','Little memories and a treat for the shop.'))+
    '<article class="nj-gift nj-frame">'+img(star)+'<p>'+t('La chambre n’a plus de secrets pour toi','The room has no more secrets for you')+'</p><strong>−10 %</strong><p>'+t('sur ton prochain achat chez Nana’s Little Shop','on your next purchase at Nana’s Little Shop')+'</p>'+
    (won?'<div class="nj-coupon"><code>MERCI10</code>'+button(t('Copier le code','Copy code'),'data-nj-copy')+'</div>'+routeButton('shop',t('Découvrir la boutique','Visit the shop')):
      '<p>'+t('Explore tous les objets de la chambre pour ouvrir ce cadeau.','Explore every object in the room to open this gift.')+'</p>'+meter(r.count,r.total,t('Progression vers le cadeau','Progress towards the gift'))+'<small>'+r.count+' / '+r.total+' '+t('objets découverts','objects discovered')+'</small>')+
    '</article><p class="nj-bottom-note">'+t('Les tenues bonus et les stickers gagnés restent dans leurs collections.','Your bonus looks and stickers stay in their collections.')+'</p>';
  }
  const pages={chambre:roomPage,secrets:secretsPage,jeux:gamesPage,dressing:dressingPage,stickers:stickersPage,titres:titlesPage,cadeaux:giftsPage};
  function updateTrigger(){const r=ratio(),pct=r.total?Math.round(r.count/r.total*100):0;trigger.querySelector('.nj-trigger-count').textContent=pct+' %';trigger.querySelector('.nj-trigger-label').textContent=t('Mon carnet','My notebook');trigger.setAttribute('aria-label',t('Mon carnet de découvertes. Chambre explorée à ','My discovery notebook. Room explored: ')+pct+' %.');trigger.title=t('Mon carnet de découvertes','My discovery notebook');}
  function render(){
    updateTrigger();if(!dialog.open)return;
    const focusKey=document.activeElement?.dataset?.njTitle;
    dialog.querySelector('#nj-title').textContent=t('Mes découvertes','My discoveries');
    dialog.querySelector('.nj-eyebrow').textContent=t('Nana’s little world','Nana’s little world');
    const title=progress.titles.find(x=>x.id===progress.snapshot().title&&x.earned());
    dialog.querySelector('.nj-selected-title').textContent=title?name(title.name):t('Une visite, mille petits détours.','One visit, a thousand little detours.');
    dialog.querySelector('.nj-tabs').setAttribute('aria-label',t('Rubriques du carnet','Notebook sections'));
    pager.setAttribute('aria-label',t('Pages','Pages'));
    dialog.querySelector('.nj-local-note').textContent=t('Ton petit monde se souvient de toi.','Your little world remembers you.');
    dialog.querySelector('.nj-close').setAttribute('aria-label',t('Fermer le carnet','Close notebook'));
    dialog.querySelector('.nj-tabs').innerHTML=tabs.map(([id,fr,en])=>'<button type="button" data-nj-tab="'+id+'" aria-current="'+(active===id?'page':'false')+'">'+h(t(fr,en))+'</button>').join('');
    pager.innerHTML='';content.innerHTML=pages[active]();
    if(focusKey)dialog.querySelector('[data-nj-title="'+focusKey+'"]')?.focus({preventScroll:true});
  }
  function open(tab='chambre'){
    if(!pages[tab])return false;
    active=tab;page=0;
    if(!dialog.open){previousFocus=document.activeElement;dialog.showModal();}
    notice.hidden=true;render();if(active==='dressing')loadWardrobe();
    dialog.querySelector('.nj-close').focus({preventScroll:true});return true;
  }
  function close(){if(dialog.open)dialog.close();}
  function navigate(route){window.NanaDeepLinks.open(route);}
  function goTab(tab){active=tab;page=0;render();if(tab==='dressing')loadWardrobe();window.NanaDeepLinks?.sync();dialog.querySelector('[data-nj-tab="'+tab+'"]')?.focus({preventScroll:true});}
  trigger.addEventListener('click',()=>navigate('carnet/chambre'));
  dialog.addEventListener('click',async event=>{
    const target=event.target.closest('button');if(!target)return;
    if(target.hasAttribute('data-nj-close'))close();
    else if(target.dataset.njTab)goTab(target.dataset.njTab);
    else if(target.dataset.njRoute)navigate(target.dataset.njRoute);
    else if(target.dataset.njOutfit)navigate('jeu/dressing/tenue/'+target.dataset.njOutfit);
    else if(target.dataset.njTitle)progress.selectTitle(progress.snapshot().title===target.dataset.njTitle?null:target.dataset.njTitle);
    else if(target.dataset.njPage){page+=Number(target.dataset.njPage);render();pager.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
    else if(target.hasAttribute('data-nj-retry'))loadWardrobe();
    else if(target.hasAttribute('data-nj-copy')){
      try {await navigator.clipboard.writeText('MERCI10');target.textContent=t('Copié !','Copied!');}
      catch(_){const range=document.createRange();range.selectNodeContents(dialog.querySelector('.nj-coupon code'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);target.textContent=t('Sélectionné : copie le code','Selected: copy the code');}
    }
  });
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('close',()=>{window.NanaDeepLinks?.sync();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
  // Keep Escape scoped to the notebook; underlying room shortcuts must not close other views.
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}});
  progress.subscribe(({added})=>{
    render();if(!added.length||dialog.open||document.querySelector('dialog[open]'))return;
    const outfit=added.find(x=>x.startsWith('outfit:')),title=added.find(x=>x.startsWith('title:'));
    const destination=outfit?'dressing':title?'titres':'stickers';
    notice.querySelector('[role=status]').textContent=outfit?t('Une nouvelle tenue t’attend dans le dressing.','A new look is waiting in your wardrobe.'):t('Ton carnet s’est enrichi d’une découverte.','A new discovery in your notebook.');
    const btn=notice.querySelector('button');btn.textContent=t('Voir','See');btn.dataset.njNotice=destination;
    notice.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.hidden=true,4200);
  });
  notice.querySelector('button').addEventListener('click',event=>navigate('carnet/'+event.currentTarget.dataset.njNotice));
  document.addEventListener('portfolio-language-change',()=>{notice.hidden=true;render();});
  small.addEventListener('change',()=>{page=0;render();});
  const recordNight=()=>{if(document.documentElement.dataset.theme==='night')progress.visit('night');};
  // Theme transitions may apply their new state asynchronously. Observe the actual theme.
  new MutationObserver(recordNight).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  recordNight();
  window.NanaJournal={open,close,current:()=>dialog.open?'carnet/'+active:null};
  updateTrigger();
})();
