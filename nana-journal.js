/* A visitor's notebook: real progress, Léna's stickers and optional collectible titles. */
(() => {
  'use strict';
  const progress=window.NanaProgress, trigger=document.getElementById('nana-journal-trigger');
  if(!progress||!trigger)return;
  const tabs=[['chambre','Ma chambre','My room'],['secrets','Mes secrets','My secrets'],['jeux','Mes jeux','My games'],['souvenirs','Mes souvenirs','My keepsakes'],['dressing','Mon dressing','My wardrobe'],['looks','Mes looks','My looks'],['stickers','Mes écussons','My patches'],['cadeaux','Mes cadeaux','My gifts']];
  const english=()=>document.documentElement.lang.startsWith('en');
  const t=(fr,en)=>english()?en:fr;
  const name=value=>value[english()?'en':'fr'];
  const h=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let artSequence=0;
  const img=(src,cls='')=>{
    if(typeof src!=='object')return '<img class="'+cls+'" src="'+h(src)+'" alt="" draggable="false">';
    const [x,y,width,height]=src.box,id='nj-art-crop-'+(++artSequence);
    return '<svg class="nj-art '+cls+'" viewBox="'+src.box.join(' ')+'" aria-hidden="true" focusable="false"><defs><clipPath id="'+id+'"><rect x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'"/></clipPath></defs><image href="'+h(src.src)+'" width="'+src.width+'" height="'+src.height+'" clip-path="url(#'+id+')"/></svg>';
  };
  const button=(text,attrs='',cls='')=>'<button type="button" class="nj-button '+cls+'" '+attrs+'>'+text+'</button>';
  const star='assets/drawn-ui/etoile_pleine.png';
  let active='chambre', page=0, previousFocus, wardrobe=null, wardrobeError=false, wardrobeLoading=false, toastTimer;
  const small=matchMedia('(max-width:760px)');
  let bookOpened=false,pageTotal=1,turning=false;
  const dialog=document.createElement('dialog');
  dialog.id='nana-journal';dialog.className='nj-notebook';dialog.setAttribute('data-no-translate','');
  dialog.setAttribute('aria-labelledby','nj-title');
  dialog.innerHTML='<h1 id="nj-title" class="nj-sr-only"></h1><button class="nj-close" type="button" data-nj-close><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button><button type="button" class="nj-cover" data-nj-open-cover aria-expanded="false"><span class="nj-cover-grain" aria-hidden="true"></span><span class="nj-cover-elastic" aria-hidden="true"></span><span class="nj-cover-stamp">NANA COLOR STUDIO</span><span class="nj-cover-label"></span><span class="nj-cover-star">'+img(star)+'</span><span class="nj-cover-note"></span><span class="nj-cover-invitation"></span></button><div class="nj-shell" inert><nav class="nj-tabs" aria-label="Carnet"></nav><section class="nj-main" aria-live="off"><div class="nj-content"></div></section><footer class="nj-book-footer"><button type="button" data-nj-cover-close></button><nav class="nj-pager" aria-label="Pages"></nav></footer><span class="nj-ribbon" aria-hidden="true"></span></div>';

  document.body.append(dialog);
  const content=dialog.querySelector('.nj-content'), pager=dialog.querySelector('.nj-pager');
  const notice=document.createElement('div');notice.id='nana-journal-notice';notice.className='nj-frame';notice.hidden=true;notice.setAttribute('data-no-translate','');
  notice.innerHTML='<span role="status" aria-live="polite"></span><button type="button" data-nj-notice></button>';
  document.body.append(notice);
  // Milestones celebrate exploration first; defer them while a game or another dialog is open.
  const milestone=document.createElement('dialog');
  milestone.id='nana-milestone';milestone.setAttribute('data-no-translate','');
  milestone.setAttribute('aria-labelledby','nj-milestone-title');
  milestone.setAttribute('aria-describedby','nj-milestone-rule');
  document.body.append(milestone);
  const milestoneQueue=[], queuedBadges=new Set();
  const ranks={
    glance:['Petite âme curieuse','Curious soul'],
    'five-minutes':['En visite prolongée','Staying a little longer'],
    'at-home':['Comme chez toi','Right at home'],
    resident:['Locataire honoraire','Honorary resident'],
    'spare-key':['Gardienne des clés','Keeper of the keys']
  };
  let currentMilestone=null,milestoneFocus=null;
  function renderMilestone(){
    if(!currentMilestone)return;
    const badge=currentMilestone,rank=ranks[badge.id];
    milestone.innerHTML='<button type="button" class="nj-milestone-close" data-milestone-close aria-label="'+t('Fermer','Close')+'"><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button><p class="nj-milestone-eyebrow">'+t('Nouveau palier !','New milestone!')+'</p><div class="nj-milestone-art">'+img(badge.image)+'</div><p class="nj-milestone-intro">'+t('Tu es maintenant…','You are now…')+'</p><h2 id="nj-milestone-title">'+h(t(...rank))+'</h2><p class="nj-milestone-name">'+h(name(badge.name))+'</p><p id="nj-milestone-rule">'+h(name(badge.rule))+'</p>'+(badge.id==='glance'?'<p class="nj-milestone-guide">'+t('Chaque découverte fait avancer ton exploration. Retrouve tes récompenses dans Mon carnet.','Every discovery moves your exploration forward. Find your rewards in My notebook.')+'</p>':'')+'<div class="nj-milestone-actions">'+button(t('Continuer à explorer','Keep exploring'),'data-milestone-close')+button(t('Mes écussons','My patches'),'data-milestone-collection')+'</div>';
  }
  function showNextMilestone(){
    if(currentMilestone||!milestoneQueue.length||progress.suppressed()||document.hidden)return;
    if(document.querySelector('dialog[open],#window-shade:not([hidden]),#special-shade:not([hidden]),#nana-discovery-overlay:not([hidden])'))return;
    currentMilestone=milestoneQueue.shift();milestoneFocus=document.activeElement;
    notice.hidden=true;clearTimeout(toastTimer);renderMilestone();milestone.showModal();
    milestone.querySelector('[data-milestone-close]').focus({preventScroll:true});
  }
  milestone.addEventListener('click',event=>{
    if(event.target.closest('[data-milestone-collection]')){milestone.close();navigate('carnet/stickers');}
    else if(event.target.closest('[data-milestone-close]'))milestone.close();
  });
  milestone.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();milestone.close();}});
  milestone.addEventListener('cancel',event=>{event.preventDefault();milestone.close();});
  milestone.addEventListener('close',()=>{
    currentMilestone=null;
    if(milestoneFocus?.isConnected)milestoneFocus.focus({preventScroll:true});
  });
  // A queued award survives a temporary game overlay and never interrupts it.
  setInterval(showNextMilestone,600);
  function ratio(){const r=progress.snapshot().room;return{...r,count:r.discovered.filter(x=>r.required.includes(x)).length,total:r.required.length};}
  function meter(count,total,label){const percent=total?Math.min(100,Math.round(count/total*100)):0;return '<div class="nj-progress" role="progressbar" aria-label="'+h(label)+'" aria-valuemin="0" aria-valuemax="'+Math.max(total,1)+'" aria-valuenow="'+count+'"><span style="width:'+percent+'%"></span></div>';}
  function heading(title,subtitle){return '<div class="nj-section-title"><h2>'+h(title)+'</h2><p>'+h(subtitle)+'</p></div>';}
  function routeButton(route,label){return button(h(label),'data-nj-route="'+h(route)+'"');}
  function paginate(items,render,{size=small.matches?2:4,cls='nj-grid'}={}){
    const pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
    pageTotal=pages;
    return '<div class="'+cls+'">'+items.slice(page*size,(page+1)*size).map(render).join('')+'</div>';
  }
  function roomPage(){
    const r=ratio(),pct=r.total?Math.round(r.count/r.total*100):0;
    const found=progress.secrets.filter(x=>progress.hasFeat(x.id)).length;
    const summary=[['secrets',found,progress.secrets.length,t('secrets trouvés','secrets found')],['jeux',progress.games.filter(x=>progress.hasVisit(x.route)).length,progress.games.length,t('jeux découverts','games discovered')],['stickers',progress.stickers.filter(x=>x.earned()).length,progress.stickers.length,t('écussons gagnés','patches earned')]];
    return heading(t('Bienvenue dans ton petit carnet','Welcome to your little notebook'),t('Chaque détour laisse un souvenir.','Every little detour leaves a memory.'))+
      '<div class="nj-hero nj-frame"><div><p>'+t('La chambre explorée','Room explored')+'</p><strong>'+pct+'<small> %</small></strong><p>'+r.count+' / '+r.total+' '+t('objets découverts','objects discovered')+'</p></div>'+img(star,'nj-hero-star')+meter(r.count,r.total,t('Exploration de la chambre','Room exploration'))+'</div>'+
      '<div class="nj-stats">'+summary.map(([tab,n,total,label])=>'<button type="button" class="nj-stat nj-frame" data-nj-tab="'+tab+'"><strong>'+n+' <small>/ '+total+'</small></strong><span>'+label+'</span></button>').join('')+'</div>'+
      '<p class="nj-bottom-note">'+(progress.snapshot().persistent?t('Tes découvertes restent ici quand tu reviens sur ce navigateur.','Your discoveries stay here when you return in this browser.'):t('Ton navigateur ne permet pas la sauvegarde : tes découvertes restent disponibles pendant cette visite.','Your browser cannot save progress: your discoveries are available for this visit.'))+'</p>';
  }
  function secretsPage(){const count=progress.secrets.filter(x=>progress.hasFeat(x.id)).length;return heading(t('Les secrets de la chambre','The room’s secrets'),count+' / '+progress.secrets.length+' '+t('petites surprises trouvées','little surprises found'))+paginate(progress.secrets,(secret)=>{
    const found=progress.hasFeat(secret.id),number=progress.secrets.indexOf(secret)+1,coming=secret.available===false;
    return '<article class="nj-card nj-frame '+(found?'':'nj-locked')+'">'+(found?img(secret.image):'<span class="nj-mystery">?</span>')+'<h3>'+h(found?name(secret.name):t('Secret n° ','Secret no. ')+number)+'</h3><p>'+t(found?'Découvert':coming?'À venir':'Encore bien caché',found?'Discovered':coming?'Coming soon':'Still well hidden')+'</p>'+(found?routeButton(secret.route,t('Revoir','Revisit')):'')+'</article>';
  },{size:small.matches?2:4});}
  function gamesPage(){const found=progress.games.filter(x=>progress.hasVisit(x.route)).length;return heading(t('À quoi on joue ?','What shall we play?'),found+' / '+progress.games.length+' '+t('jeux découverts','games discovered'))+paginate(progress.games,game=>{
    const unlocked=progress.hasVisit(game.route);
    return '<article class="nj-card nj-frame '+(unlocked?'':'nj-locked')+'">'+img(game.image)+'<h3>'+h(name(game.name))+'</h3><p>'+t(unlocked?'Dans ta collection':'À découvrir dans la chambre',unlocked?'In your collection':'Find it in the room')+'</p>'+(unlocked?routeButton(game.route,t('Jouer','Play')):'')+'</article>';
  });}
  async function loadWardrobe(){
    if(wardrobe||wardrobeLoading)return;wardrobeLoading=true;wardrobeError=false;
    try{
      const response=await fetch('about-me.html?v=20261109-exploration-patches');
      if(!response.ok)throw new Error('wardrobe');
      const source=new DOMParser().parseFromString(await response.text(),'text/html');
      const data=JSON.parse(source.getElementById('assets').textContent);
      if(!data.items||!data.sprites)throw new Error('wardrobe');wardrobe=data;
    }catch(_){wardrobeError=true;}finally{wardrobeLoading=false;if(dialog.open&&active==='dressing')render();}
  }
  function dressingPage(){
    const unlocked=progress.outfits.filter(x=>progress.unlockedOutfit(x.id)).length;
    const total=wardrobe?Object.keys(wardrobe.items).length:null,locked=new Set(progress.outfits.filter(x=>!progress.unlockedOutfit(x.id)).flatMap(x=>x.pieces||[])).size;
    const inventory=total===null?(wardrobeError?t('Le dressing n’a pas pu être chargé.','The wardrobe could not be loaded.'):t('Ouverture du dressing…','Opening the wardrobe…')):(total-locked)+' / '+total+' '+t('pièces accessibles','pieces available');
    return heading(t('Des tenues à découvrir','Looks to discover'),inventory)+
      '<div class="nj-wardrobe-summary"><p>'+unlocked+' / '+progress.outfits.length+' '+t('tenues bonus débloquées','bonus looks unlocked')+'</p>'+routeButton('jeu/dressing',t('Ouvrir le dressing','Open the wardrobe'))+' '+routeButton('carnet/looks',t('Mes looks sauvegardés','My saved looks')+' · '+(window.NanaLooks?.list().length||0))+(wardrobeError?button(t('Réessayer','Try again'),'data-nj-retry'):'')+'</div>'+
      paginate(progress.outfits,outfit=>{
        const earned=progress.unlockedOutfit(outfit.id);
        return '<article class="nj-card nj-outfit nj-frame '+(earned?'':'nj-locked')+'">'+img(outfit.image)+'<div><h3>'+h(name(outfit.name))+'</h3><p>'+h(earned?t('Tenue débloquée','Look unlocked'):name(outfit.rule))+'</p>'+(earned||progress.isCreator()?button(h(earned?t('Essayer','Try on'):t('Aperçu créatrice','Creator preview')),'data-nj-outfit="'+outfit.id+'"'):'')+'</div></article>';
      },{size:small.matches?2:4})+(progress.isCreator()?'<p class="nj-bottom-note">'+t('Aperçu créatrice : les essais ne modifient pas ta progression.','Creator preview: trying things does not change your progress.')+'</p>':'');
  }
  function stickersPage(){const count=progress.stickers.filter(x=>x.earned()).length;return heading(t('Mes écussons d’exploration','My exploration patches'),count+' / '+progress.stickers.length+' '+t('écussons débloqués','patches unlocked'))+paginate(progress.stickers,(sticker)=>{
    const earned=sticker.earned(),number=progress.stickers.indexOf(sticker)+1;
    return '<article class="nj-sticker '+(earned?'is-earned':'nj-locked')+'" style="--tilt:'+([-5,3,-2,4,-3,2][number%6])+'deg"><div class="nj-sticker-art">'+img(sticker.image)+'</div><p>'+h(name(sticker.name))+'</p><small>'+h(name(sticker.rule))+'</small></article>';
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
  let keepsakeFilter='all',selectedKeepsake=null;
  const kindLabel=kind=>kind==='poem'?t('Poème','Poem'):kind==='book'?t('Livre favori','Favourite book'):t('Texte favori','Favourite text');
  function keepsakesPage(){
    const all=window.NanaKeepsakes?.list()||[],selected=all.find(x=>x.id===selectedKeepsake);
    if(selected?.kind==='poem')return heading(t('Un poème à garder','A poem to keep'),selected.title)+
      '<article class="nj-poem-sheet"><p class="nj-poem-body" tabindex="0">'+h(selected.body)+'</p></article><div class="nj-keepsake-actions">'+button(t('Copier le poème','Copy poem'),'data-nj-poem-copy')+button(t('Télécharger en texte','Download as text'),'data-nj-poem-download')+button(t('Retour aux souvenirs','Back to keepsakes'),'data-nj-keepsake-back')+'</div>';
    selectedKeepsake=null;
    const filtered=all.filter(x=>keepsakeFilter==='all'||(keepsakeFilter==='poems'?x.kind==='poem':x.kind!=='poem'));
    const draft=window.NanaKeepsakes?.draft(),draftCount=Array.isArray(draft?.poem)?draft.poem.length:0;
    const beadCount=window.NanaBeadSouvenir?.count()||0;
    const filters='<nav class="nj-keepsake-filters" aria-label="'+t('Filtrer les souvenirs','Filter keepsakes')+'">'+[['all',t('Tout','All')],['poems',t('Mes poèmes','My poems')],['favourites',t('Mes favoris','My favourites')]].map(([id,label])=>button(label,'data-nj-keepsake-filter="'+id+'" aria-pressed="'+(keepsakeFilter===id)+'"')).join('')+'</nav>';
    const works=filtered.length?paginate(filtered,item=>'<article class="nj-keepsake nj-frame"><small>'+h(kindLabel(item.kind))+'</small><h3>'+h(item.title)+'</h3>'+(item.author?'<p>'+h(item.author)+'</p>':'')+(item.kind==='poem'?'<p class="nj-keepsake-excerpt">'+h(item.body.slice(0,140))+(item.body.length>140?'…':'')+'</p>'+button(t('Relire','Read again'),'data-nj-keepsake="'+h(item.id)+'"'):routeButton(item.route,t('Ouvrir la fiche','Open the page')))+'</article>',{size:small.matches?2:4,cls:'nj-grid nj-keepsakes-grid'}):'<div class="nj-keepsake-empty"><p>'+t('Tes petits souvenirs trouveront leur place ici.','Your little keepsakes will find a home here.')+'</p><p>'+t('Garde un poème dans le laboratoire des mots, ou ajoute un livre et un texte des Souvenues à tes favoris.','Keep a poem from the word lab, or save a book or a Souvenues text to your favourites.')+'</p>'+routeButton('jeu/word-lab',t('Composer un poème','Make a poem'))+' '+routeButton('objet/reading-room',t('Choisir un livre','Choose a book'))+'</div>';
    const inProgress=keepsakeFilter==='all'?'<div class="nj-keepsake-current">'+(draftCount?'<article><p>'+t('Ton poème en cours','Your poem in progress')+'</p>'+routeButton('jeu/word-lab',t('Reprendre mon brouillon','Continue my draft'))+'</article>':'')+(beadCount?'<article class="nj-current-charm">'+window.NanaBeadSouvenir.preview()+'<div><p>'+t('Ton bijou en cours','Your charm in progress')+'</p>'+routeButton('jeu/bead-box',t('Retrouver mon bijou','Revisit my charm'))+'</div></article>':'')+'</div>':'';
    return heading(t('Mes petits souvenirs','My little keepsakes'),t('Tes créations et tes lectures à retrouver.','Your creations and saved reading.'))+filters+works+inProgress+'<p class="nj-bottom-note">'+t('Conservés sur ce navigateur. Les poèmes déjà téléchargés avant cette nouveauté ne peuvent pas être récupérés automatiquement.','Saved in this browser. Poems downloaded before this feature cannot be recovered automatically.')+'</p>';
  }
  const looks=window.NanaJournalLooks.create({dialog,content,t,h,button,heading,paginate,render,navigate});
  const pages={looks:looks.page,souvenirs:keepsakesPage,chambre:roomPage,secrets:secretsPage,jeux:gamesPage,dressing:dressingPage,stickers:stickersPage,titres:titlesPage,cadeaux:giftsPage};
  function updateTrigger(){const r=ratio(),pct=r.total?Math.round(r.count/r.total*100):0;trigger.querySelector('.nj-trigger-count').textContent='('+pct+' %)';trigger.querySelector('.nj-trigger-label').textContent=t('Carnet','Notebook');trigger.setAttribute('aria-label',t('Mon carnet de découvertes. Chambre explorée à ','My discovery notebook. Room explored: ')+pct+' %.');trigger.title=t('Mon carnet de découvertes','My discovery notebook');}
  function paperLayout(html){
    const source=document.createElement('div');source.innerHTML=html;
    const left=document.createElement('section'),right=document.createElement('section');
    left.className='nj-leaf nj-leaf-left';right.className='nj-leaf nj-leaf-right';
    const makeInside=leaf=>{const inner=document.createElement('div');inner.className='nj-leaf-inner';leaf.append(inner);return inner;};
    const a=makeInside(left),b=makeInside(right);
    if(small.matches){a.append(...source.childNodes);content.replaceChildren(left);return;}
    for(const node of [...source.children]){
      if(node.matches('.nj-grid,.nj-sticker-grid,.nj-titles')){
        const first=node.cloneNode(false),second=node.cloneNode(false),items=[...node.children],split=Math.ceil(items.length/2);
        items.forEach((item,i)=>(i<split?first:second).append(item));a.append(first);b.append(second);
      }else if(node.matches('.nj-section-title,.nj-wardrobe-summary,.nj-keepsake-filters,.nj-hero'))a.append(node);
      else if(node.matches('.nj-stats,.nj-gift,.nj-keepsake-current,.nj-bottom-note,.nj-keepsake-actions,.nj-poem-sheet,.nl-look-details'))b.append(node);
      else a.append(node);
    }
    if(!b.children.length)b.innerHTML='<div class="nj-paper-memento">'+img(star)+'<p>'+t('La suite reste à écrire…','More little stories to come…')+'</p></div>';
    content.replaceChildren(left,right);
  }
  function render(){
    updateTrigger();if(!dialog.open)return;
    if(bookOpened)window.NanaAnalytics?.record('journal/tab/'+active,1,true);
    dialog.querySelector('#nj-title').textContent=t('Mon carnet de découvertes','My discovery notebook');
    dialog.querySelector('.nj-cover-label').innerHTML=t('mon petit<br>carnet','my little<br>notebook');
    dialog.querySelector('.nj-cover-note').textContent=t('des découvertes, des mots, des petits riens.','discoveries, words, little things.');
    dialog.querySelector('.nj-cover-invitation').textContent=t('ouvrir le carnet','open the notebook');
    dialog.querySelector('[data-nj-open-cover]').setAttribute('aria-label',t('Ouvrir mon carnet','Open my notebook'));
    dialog.querySelector('[data-nj-cover-close]').textContent=t('couverture','cover');
    dialog.querySelector('.nj-tabs').setAttribute('aria-label',t('Marque-pages du carnet','Notebook bookmarks'));
    pager.setAttribute('aria-label',t('Feuilleter le carnet','Turn the pages'));
    dialog.querySelector('.nj-close').setAttribute('aria-label',t('Fermer le carnet','Close notebook'));
    const labels={looks:['Mes looks','My looks'],chambre:['Découvertes','Discoveries'],secrets:['Secrets','Secrets'],jeux:['Jeux','Games'],souvenirs:['Souvenirs','Keepsakes'],dressing:['Dressing','Wardrobe'],stickers:['Écussons','Patches'],cadeaux:['Cadeaux','Gifts']};
    dialog.querySelector('.nj-tabs').innerHTML=tabs.map(([id,fr,en],i)=>'<button type="button" style="--tab:'+i+'" data-nj-tab="'+id+'" aria-label="'+h(t(fr,en))+'" aria-current="'+(active===id?'page':'false')+'">'+h(t(...labels[id]))+'</button>').join('');
    dialog.classList.toggle('nj-looks-open',active==='looks');
    pageTotal=1;paperLayout(pages[active]());if(active==='looks')looks.hydrate();
    const index=tabs.findIndex(x=>x[0]===active);
    pager.innerHTML=button(img('assets/drawn-ui/fleche_gauche.png'),'data-nj-turn="-1" aria-label="'+t('Page précédente','Previous page')+'" '+(index===0&&page===0?'disabled':''))+'<span>'+h(t(...labels[active]))+(pageTotal>1?' · '+(page+1)+' / '+pageTotal:'')+'</span>'+button(img('assets/drawn-ui/fleche_droite.png'),'data-nj-turn="1" aria-label="'+t('Page suivante','Next page')+'" '+(index===tabs.length-1&&page===pageTotal-1?'disabled':''));
  }
  function unfold(){
    window.NanaAnalytics?.record('journal/tab/'+active,1,true);
    bookOpened=true;dialog.classList.add('nj-book-open');dialog.querySelector('.nj-shell').inert=false;
    const cover=dialog.querySelector('.nj-cover');cover.inert=true;cover.setAttribute('aria-expanded','true');
    dialog.querySelector('[data-nj-tab="'+active+'"]').focus({preventScroll:true});
  }
  function fold(){
    bookOpened=false;dialog.classList.remove('nj-book-open');dialog.querySelector('.nj-shell').inert=true;
    const cover=dialog.querySelector('.nj-cover');cover.inert=false;cover.setAttribute('aria-expanded','false');cover.focus({preventScroll:true});
  }
  function turnPage(change,direction=1){
    if(turning)return;
    const old=content.querySelector(small.matches?'.nj-leaf':direction>0?'.nj-leaf-right':'.nj-leaf-left')?.cloneNode(true);
    change();
    if(!bookOpened||!old||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const sheet=document.createElement('div');sheet.className='nj-turn-sheet'+(direction<0?' nj-turn-back':'');sheet.inert=true;sheet.setAttribute('aria-hidden','true');
    old.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));old.className='nj-turn-front';
    const back=document.createElement('div');back.className='nj-turn-reverse';sheet.append(old,back);dialog.querySelector('.nj-main').append(sheet);turning=true;
    const animation=sheet.animate([{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:'rotateY('+(-85*direction)+'deg)',filter:'brightness(.86)',offset:.53},{transform:'rotateY('+(-179*direction)+'deg)',filter:'brightness(.96)'}],{duration:680,easing:'cubic-bezier(.3,.08,.25,1)',fill:'forwards'});
    animation.finished.catch(()=>{}).finally(()=>{sheet.remove();turning=false;});
  }
  function open(tab='chambre'){
    if(tab==='titres')tab='stickers';
    if(!pages[tab])return false;
    active=tab;page=0;selectedKeepsake=null;looks.reset();
    const wasOpen=dialog.open;
    if(!wasOpen){previousFocus=document.activeElement;dialog.showModal();window.NanaAnalytics?.record('journal/open');}
    notice.hidden=true;render();if(active==='dressing')loadWardrobe();
    if(!wasOpen)fold();else if(bookOpened)dialog.querySelector('[data-nj-tab="'+active+'"]').focus({preventScroll:true});
    return true;
  }
  function close(){if(dialog.open)dialog.close();}
  function navigate(route){window.NanaDeepLinks.open(route);}
  function goTab(tab){
    const direction=tabs.findIndex(x=>x[0]===tab)>=tabs.findIndex(x=>x[0]===active)?1:-1;
    turnPage(()=>{active=tab;page=0;selectedKeepsake=null;looks.reset();render();if(tab==='dressing')loadWardrobe();window.NanaDeepLinks?.sync();dialog.querySelector('[data-nj-tab="'+tab+'"]').focus({preventScroll:true});},direction);
  }
  trigger.addEventListener('click',()=>navigate('carnet/chambre'));
  dialog.addEventListener('click',async event=>{
    const target=event.target.closest('button');if(!target)return;
    if(looks.handle(target))return;
    if(target.hasAttribute('data-nj-open-cover'))unfold();
    else if(target.hasAttribute('data-nj-cover-close'))fold();
    else if(target.dataset.njTurn){
      const delta=Number(target.dataset.njTurn),index=tabs.findIndex(x=>x[0]===active);
      if(page+delta>=0&&page+delta<pageTotal)turnPage(()=>{page+=delta;selectedKeepsake=null;looks.reset();render();pager.querySelector('[data-nj-turn="'+delta+'"]').focus({preventScroll:true});},delta);
      else if(tabs[index+delta])goTab(tabs[index+delta][0]);
    }
    else if(target.hasAttribute('data-nj-close'))close();
    else if(target.dataset.njTab)goTab(target.dataset.njTab);
    else if(target.dataset.njKeepsakeFilter){turnPage(()=>{keepsakeFilter=target.dataset.njKeepsakeFilter;selectedKeepsake=null;page=0;render();dialog.querySelector('[data-nj-keepsake-filter="'+keepsakeFilter+'"]').focus({preventScroll:true});});}
    else if(target.dataset.njKeepsake){turnPage(()=>{selectedKeepsake=target.dataset.njKeepsake;render();dialog.querySelector('.nj-poem-body')?.focus({preventScroll:true});});}
    else if(target.hasAttribute('data-nj-keepsake-back')){selectedKeepsake=null;render();}
    else if(target.hasAttribute('data-nj-poem-copy')||target.hasAttribute('data-nj-poem-download')){
      const poem=window.NanaKeepsakes?.list().find(x=>x.id===selectedKeepsake);if(!poem)return;
      if(target.hasAttribute('data-nj-poem-copy')){
        try{await navigator.clipboard.writeText(poem.body);target.textContent=t('Copié !','Copied!');}
        catch(_){const range=document.createRange();range.selectNodeContents(dialog.querySelector('.nj-poem-body'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);target.textContent=t('Sélectionné : copie le texte','Selected: copy the text');}
      }else{const url=URL.createObjectURL(new Blob([poem.body],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=t('mon-poeme.txt','my-poem.txt');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
    }
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
    added=added.filter(id=>!id.startsWith('title:'));
    render();
    for(const id of added.filter(x=>x.startsWith('sticker:'))){
      const badge=progress.stickers.find(x=>'sticker:'+x.id===id);
      if(badge&&!queuedBadges.has(id)){queuedBadges.add(id);milestoneQueue.push(badge);}
    }
    if(milestoneQueue.length||currentMilestone){notice.hidden=true;clearTimeout(toastTimer);return;}
    if(!added.length||dialog.open||document.querySelector('dialog[open]'))return;
    if(added.includes('gift:merci10')){notice.hidden=true;clearTimeout(toastTimer);return;}
    const outfit=added.find(x=>x.startsWith('outfit:')),title=added.find(x=>x.startsWith('title:')),badge=added.find(x=>x.startsWith('sticker:'));
    const destination=outfit?'dressing':badge?'stickers':title?'titres':'stickers';
    notice.querySelector('[role=status]').textContent=outfit?t('Une nouvelle tenue t’attend dans le dressing.','A new look is waiting in your wardrobe.'):badge?t('Tu as gagné un nouvel écusson d’exploration.','You earned a new exploration patch.'):t('Ton carnet s’est enrichi d’une découverte.','A new discovery in your notebook.');
    const btn=notice.querySelector('button');btn.textContent=t('Voir','See');btn.dataset.njNotice=destination;
    notice.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.hidden=true,4200);
  });
  notice.querySelector('button').addEventListener('click',event=>navigate('carnet/'+event.currentTarget.dataset.njNotice));
  document.addEventListener('portfolio-language-change',()=>{notice.hidden=true;render();if(currentMilestone){renderMilestone();milestone.querySelector('[data-milestone-close]').focus({preventScroll:true});}});
  document.addEventListener('nana-looks-change',()=>{if(dialog.open&&active==='looks'&&!dialog.querySelector('.nl-rename'))render();});
  document.addEventListener('nana-keepsakes-change',()=>{if(dialog.open&&active==='souvenirs')render();});
  small.addEventListener('change',()=>{page=0;render();});
  const recordNight=()=>{if(document.documentElement.dataset.theme==='night')progress.visit('night');};
  // Theme transitions may apply their new state asynchronously. Observe the actual theme.
  new MutationObserver(recordNight).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  recordNight();
  window.NanaJournal={open,close,current:()=>dialog.open?'carnet/'+active:null};
  updateTrigger();
})();






