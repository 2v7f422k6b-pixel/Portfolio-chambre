/* A visitor's notebook: real progress, Léna's stickers and optional collectible titles. */
(() => {
  'use strict';
  const progress=window.NanaProgress, trigger=document.getElementById('nana-journal-trigger');
  if(!progress||!trigger)return;
  const tabs=[['stickers','Badges','Badges'],['souvenirs','Souvenirs','Keepsakes'],['looks','Looks','Looks']];
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
  let active='stickers', page=0, previousFocus, toastTimer;
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
  const deliveredKey='nana-mokona-badges-v1';
  const delivered=new Set();
  function restoreDelivered(){
    try{
      const saved=JSON.parse(localStorage.getItem(deliveredKey));
      if(Array.isArray(saved)){for(const id of saved)delivered.add(id);}
      else if(localStorage.getItem('nana-mokona-discovered-v1')==='1'){
        for(const id of progress.earnedBadgeIds())delivered.add(id);
        saveDelivered();
      }
    }catch{}
  }
  function saveDelivered(){
    try{localStorage.setItem(deliveredKey,JSON.stringify([...delivered]));}catch{}
  }
  function giveBadge(id){
    restoreDelivered();
    delivered.add(id);
    saveDelivered();
    render();
  }
  restoreDelivered();
  document.addEventListener('mokona-first-badge',()=>giveBadge('glance'));
  window.addEventListener('storage',e=>{if(e.key===deliveredKey){restoreDelivered();render();}});
  const badgeDrawing=badge=>window.NanaBadgeArt(badge).outerHTML;
  const ranks={
    landscapes:['Voyageuse','Traveller'],
    gashapon:['Collectionneuse','Collector'],
    glance:['Petite âme curieuse','Curious soul'],
    'five-minutes':['En visite prolongée','Staying a little longer'],
    'at-home':['Comme chez toi','Right at home'],
    resident:['Squatteur','Squatter'],
    'spare-key':['Gardienne des clés','Keeper of the keys']
  };
  let currentMilestone=null,milestoneFocus=null;
  function renderMilestone(){
    if(!currentMilestone)return;
    const badge=currentMilestone,rank=ranks[badge.id];
    milestone.innerHTML='<button type="button" class="nj-milestone-close" data-milestone-close aria-label="'+t('Fermer','Close')+'"><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button><p class="nj-milestone-eyebrow">'+t('Mokona t’offre un badge !','Mokona has a badge for you!')+'</p><div class="nj-milestone-art">'+badgeDrawing(badge)+'</div><p class="nj-milestone-intro">'+t('Tu es maintenant…','You are now…')+'</p><h2 id="nj-milestone-title">'+h(t(...rank))+'</h2>'+(name(badge.name)===t(...rank)?'':'<p class="nj-milestone-name">'+h(name(badge.name))+'</p>')+'<p id="nj-milestone-rule">'+h(name(badge.rule))+'</p>'+(badge.id==='glance'?'<p class="nj-milestone-guide">'+t('Chaque découverte fait avancer ton exploration. Retrouve tes récompenses dans Mon carnet.','Every discovery moves your exploration forward. Find your rewards in My notebook.')+'</p>':'')+'<div class="nj-milestone-actions">'+button(t('Continuer à explorer','Keep exploring'),'data-milestone-close')+button(t('Mes badges','My badges'),'data-milestone-collection')+'</div>';
  }
  function pendingBadge(collectionOnly=false){
    restoreDelivered();
    if(progress.suppressed())return null;
    const earned=progress.earnedBadgeIds();
    return earned.map(id=>progress.stickers.find(b=>b.id===id)).find(b=>b && !delivered.has(b.id) &&
      (!collectionOnly || b.percent===undefined));
  }
  function offerBadge(){
    restoreDelivered();
    const id=progress.earnedBadgeIds().find(id=>!delivered.has(id));
    if(!id || currentMilestone || progress.suppressed())return false;
    currentMilestone=progress.stickers.find(b=>b.id===id);
    milestoneFocus=document.activeElement;
    notice.hidden=true;clearTimeout(toastTimer);renderMilestone();milestone.showModal();
    giveBadge(id);
    milestone.querySelector('[data-milestone-close]').focus({preventScroll:true});
    return true;
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

  function ratio(){const r=progress.snapshot().room;return{...r,count:r.discovered.filter(x=>r.required.includes(x)).length,total:r.required.length};}
  function heading(title,subtitle){return '<div class="nj-section-title"><h2>'+h(title)+'</h2><p>'+h(subtitle)+'</p></div>';}
  function routeButton(route,label){return button(h(label),'data-nj-route="'+h(route)+'"');}
  function paginate(items,render,{size=small.matches?2:4,cls='nj-grid'}={}){
    const pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
    pageTotal=pages;
    return '<div class="'+cls+'">'+items.slice(page*size,(page+1)*size).map(render).join('')+'</div>';
  }
  function badgeSlot(badge){
    if(!delivered.has(badge.id))return '<span class="nj-pin-empty" aria-hidden="true"></span>';
    return '<details class="nj-pin"><summary aria-label="'+h(name(badge.name))+'">'+badgeDrawing(badge)+'</summary><p><strong>'+h(name(badge.name))+'</strong><br>'+h(name(badge.rule))+'</p></details>';
  }
  function stickersPage(){
    const room=ratio(),pct=room.total?Math.round(100*room.count/room.total):0;
    const levels=progress.stickers.filter(b=>Number.isFinite(b.percent));
    const collections=progress.stickers.filter(b=>!Number.isFinite(b.percent));
    return '<section class="nj-pin-page">'+heading(t('Mes badges','My badges'),'')+
      '<div class="nj-pins">'+levels.map(badgeSlot).join('')+'</div><p>'+pct+' % '+t('de la chambre explorée','of the room explored')+'</p></section>'+
      '<section class="nj-pin-page nj-right-page">'+heading(t('Collections','Collections'),'')+
      '<div class="nj-pins">'+collections.map(badgeSlot).join('')+'</div></section>';
  }
  function gift(){
    if(!progress.fullRoom()&&!progress.snapshot().room.celebrated)return '';
    return '<article class="nj-gift"><h3>'+t('Ton cadeau de visite','Your visit gift')+'</h3><p>'+
      t('−10 % chez Nana’s Little Shop','10% off at Nana’s Little Shop')+'</p><div class="nj-coupon"><code>MERCI10</code>'+
      button(t('Copier le code','Copy code'),'data-nj-copy')+'</div>'+routeButton('shop',t('La boutique','The shop'))+'</article>';
  }
  let keepsakeFilter='all',selectedKeepsake=null;
  const kindLabel=kind=>kind==='card'?t('Carte à collectionner','Collectible card'):kind==='poem'?t('Poème','Poem'):kind==='book'?t('Livre favori','Favourite book'):t('Texte favori','Favourite text');
  function keepsakesPage(){
    const all=window.NanaKeepsakes?.list()||[],selected=all.find(x=>x.id===selectedKeepsake);
    if(selected?.kind==='poem')return heading(t('Un poème à garder','A poem to keep'),selected.title)+
      '<article class="nj-poem-sheet"><p class="nj-poem-body" tabindex="0">'+h(selected.body)+'</p></article><div class="nj-keepsake-actions">'+button(t('Copier le poème','Copy poem'),'data-nj-poem-copy')+button(t('Enregistrer en image','Save as image'),'data-nj-poem-download')+button(t('Retour aux souvenirs','Back to keepsakes'),'data-nj-keepsake-back')+'</div>';
    selectedKeepsake=null;
    const filtered=all.filter(x=>keepsakeFilter==='all'||(keepsakeFilter==='poems'?x.kind==='poem':x.kind!=='poem'));
    const draft=window.NanaKeepsakes?.draft(),draftCount=Array.isArray(draft?.poem)?draft.poem.length:0;
    const beadCount=window.NanaBeadSouvenir?.count()||0;
    const filters='<nav class="nj-keepsake-filters" aria-label="'+t('Filtrer les souvenirs','Filter keepsakes')+'">'+[['all',t('Tout','All')],['poems',t('Mes poèmes','My poems')],['favourites',t('Mes favoris','My favourites')]].map(([id,label])=>button(label,'data-nj-keepsake-filter="'+id+'" aria-pressed="'+(keepsakeFilter===id)+'"')).join('')+'</nav>';
    const works=filtered.length?paginate(filtered,item=>'<article class="nj-keepsake nj-frame"><small>'+h(kindLabel(item.kind))+'</small>'+(item.kind==='card'?img('assets/dressing-lena/lena-card-illustration-v2.jpeg','nj-keepsake-card-art'):'')+'<h3>'+h(item.kind==='card'?t('La carte de Léna','Léna’s card'):item.title)+'</h3>'+(item.author?'<p>'+h(item.author)+'</p>':'')+(item.kind==='poem'?'<p class="nj-keepsake-excerpt">'+h(item.body.slice(0,140))+(item.body.length>140?'…':'')+'</p>'+button(t('Relire','Read again'),'data-nj-keepsake="'+h(item.id)+'"'):routeButton(item.route,item.kind==='card'?t('Revoir la carte','View the card'):t('Ouvrir la fiche','Open the page')))+'</article>',{size:small.matches?2:4,cls:'nj-grid nj-keepsakes-grid'}):'<div class="nj-keepsake-empty"><p>'+t('Tes petits souvenirs trouveront leur place ici.','Your little keepsakes will find a home here.')+'</p><p>'+t('Garde un poème dans le laboratoire des mots, ou ajoute un livre et un texte des Souvenues à tes favoris.','Keep a poem from the word lab, or save a book or a Souvenues text to your favourites.')+'</p>'+routeButton('jeu/word-lab',t('Composer un poème','Make a poem'))+' '+routeButton('objet/reading-room',t('Choisir un livre','Choose a book'))+'</div>';
    const inProgress=keepsakeFilter==='all'?'<div class="nj-keepsake-current">'+(draftCount?'<article><p>'+t('Ton poème en cours','Your poem in progress')+'</p>'+routeButton('jeu/word-lab',t('Reprendre mon brouillon','Continue my draft'))+'</article>':'')+(beadCount?'<article class="nj-current-charm">'+window.NanaBeadSouvenir.preview()+'<div><p>'+t('Ton bijou en cours','Your charm in progress')+'</p>'+routeButton('jeu/bead-box',t('Retrouver mon bijou','Revisit my charm'))+'</div></article>':'')+'</div>':'';
    return heading(t('Mes petits souvenirs','My little keepsakes'),t('Tes créations et tes lectures à retrouver.','Your creations and saved reading.'))+filters+works+inProgress+(keepsakeFilter==='all' && page===0?gift():'')+'<p class="nj-bottom-note">'+t('Conservés sur ce navigateur. Les poèmes déjà téléchargés avant cette nouveauté ne peuvent pas être récupérés automatiquement.','Saved in this browser. Poems downloaded before this feature cannot be recovered automatically.')+'</p>';
  }
  const looks=window.NanaJournalLooks.create({dialog,content,t,h,button,heading,paginate,render,navigate});
  const pages={stickers:stickersPage,souvenirs:keepsakesPage,looks:looks.page};
  const latestIcon=document.createElement('span');
  latestIcon.className='nj-latest-badge';
  trigger.querySelector('.nj-trigger-count').after(latestIcon);
  function updateTrigger(){
    const latest=progress.earnedBadgeIds().filter(id=>id!=='glance'||delivered.has(id)).reverse()
      .find(id=>progress.stickers.some(b=>b.id===id && Number.isFinite(b.percent)));
    const badge=progress.stickers.find(b=>b.id===latest);
    if(latestIcon.dataset.id!==(latest||'')){
      latestIcon.replaceChildren();
      if(badge)latestIcon.append(window.NanaBadgeArt(badge));
      latestIcon.dataset.id=latest||'';
    }
    latestIcon.hidden=!badge;
    const badgeLabel=badge?' · '+name(badge.name):'';
const r=ratio(),pct=r.total?Math.round(r.count/r.total*100):0;trigger.querySelector('.nj-trigger-count').textContent='('+pct+' %)';trigger.querySelector('.nj-trigger-label').textContent=t('Carnet','Notebook');trigger.setAttribute('aria-label',t('Mon carnet de découvertes. Chambre explorée à ','My discovery notebook. Room explored: ')+pct+' %.'+badgeLabel);trigger.title=t('Mon carnet de découvertes','My discovery notebook')+badgeLabel;}
  function paperLayout(html){
    const source=document.createElement('div');source.innerHTML=html;
    const left=document.createElement('section'),right=document.createElement('section');
    left.className='nj-leaf nj-leaf-left';right.className='nj-leaf nj-leaf-right';
    const makeInside=leaf=>{const inner=document.createElement('div');inner.className='nj-leaf-inner';leaf.append(inner);return inner;};
    const a=makeInside(left),b=makeInside(right);
    // Keep both pages on every screen: the Procreate spread is one indivisible canvas.
    for(const node of [...source.children]){
      if(node.matches('.nj-grid,.nj-sticker-grid,.nj-titles')){
        const first=node.cloneNode(false),second=node.cloneNode(false),items=[...node.children],split=Math.ceil(items.length/2);
        items.forEach((item,i)=>(i<split?first:second).append(item));a.append(first);b.append(second);
      }else if(node.matches('.nj-section-title,.nj-wardrobe-summary,.nj-keepsake-filters,.nj-hero'))a.append(node);
      else if(node.matches('.nj-right-page,.nj-gift,.nj-keepsake-current,.nj-bottom-note,.nj-keepsake-actions,.nj-poem-sheet,.nl-look-details'))b.append(node);
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
    const tabLabel=tabs.find(([id])=>id===active).slice(1);
    dialog.querySelector('.nj-tabs').innerHTML=tabs.map(([id,fr,en])=>'<button type="button" data-nj-tab="'+id+'" aria-current="'+(active===id?'page':'false')+'">'+h(t(fr,en))+'</button>').join('');
    dialog.classList.toggle('nj-looks-open',active==='looks');
    pageTotal=1;paperLayout(pages[active]());if(active==='looks')looks.hydrate();
    const index=tabs.findIndex(x=>x[0]===active);
    pager.innerHTML=button(img('assets/drawn-ui/fleche_gauche.png'),'data-nj-turn="-1" aria-label="'+t('Page précédente','Previous page')+'" '+(index===0&&page===0?'disabled':''))+'<span>'+h(t(...tabLabel))+(pageTotal>1?' · '+(page+1)+' / '+pageTotal:'')+'</span>'+button(img('assets/drawn-ui/fleche_droite.png'),'data-nj-turn="1" aria-label="'+t('Page suivante','Next page')+'" '+(index===tabs.length-1&&page===pageTotal-1?'disabled':''));
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
    change();
    if(!bookOpened||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    // The turning leaf is artwork only. Never clone old HTML, tabs or interactive content.
    const sheet=document.createElement('div');sheet.className='nj-turn-sheet nj-art-turn'+(direction<0?' nj-turn-back':'');sheet.inert=true;sheet.setAttribute('aria-hidden','true');
    const front=document.createElement('div');front.className='nj-turn-front';
    const back=document.createElement('div');back.className='nj-turn-reverse';
    sheet.append(front,back);dialog.querySelector('.nj-main').append(sheet);turning=true;
    const animation=sheet.animate([{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:'rotateY('+(-85*direction)+'deg)',filter:'brightness(.86)',offset:.53},{transform:'rotateY('+(-179*direction)+'deg)',filter:'brightness(.96)'}],{duration:680,easing:'cubic-bezier(.3,.08,.25,1)',fill:'forwards'});
    animation.finished.catch(()=>{}).finally(()=>{sheet.remove();turning=false;});
  }
  function open(tab='stickers'){
    const legacy={chambre:'stickers',titres:'stickers',cadeaux:'souvenirs',secrets:'souvenirs',jeux:'souvenirs',dressing:'looks'};
    if(Object.hasOwn(legacy,tab))tab=legacy[tab];
    if(!Object.hasOwn(pages,tab))return false;
    keepsakeFilter='all';
    active=tab;page=0;selectedKeepsake=null;looks.reset();
    const wasOpen=dialog.open;
    if(!wasOpen){previousFocus=document.activeElement;dialog.showModal();window.NanaAnalytics?.record('journal/open');}
    notice.hidden=true;render();
    if(!wasOpen)fold();else if(bookOpened)dialog.querySelector('[data-nj-tab="'+active+'"]').focus({preventScroll:true});
    return true;
  }
  function close(){if(dialog.open)dialog.close();}
  function navigate(route){window.NanaDeepLinks.open(route);}
  function goTab(tab){
    const direction=tabs.findIndex(x=>x[0]===tab)>=tabs.findIndex(x=>x[0]===active)?1:-1;
    turnPage(()=>{active=tab;page=0;selectedKeepsake=null;looks.reset();render();window.NanaDeepLinks?.sync();dialog.querySelector('[data-nj-tab="'+tab+'"]').focus({preventScroll:true});},direction);
  }
  trigger.addEventListener('click',()=>navigate('carnet/stickers'));
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
      }else{await window.NanaImageSave.textImage(poem.body,t('mon-poeme.png','my-poem.png'));}
    }
    else if(target.dataset.njRoute)navigate(target.dataset.njRoute);
    else if(target.dataset.njOutfit)navigate('jeu/dressing/tenue/'+target.dataset.njOutfit);
    else if(target.dataset.njTitle)progress.selectTitle(progress.snapshot().title===target.dataset.njTitle?null:target.dataset.njTitle);
    else if(target.dataset.njPage){page+=Number(target.dataset.njPage);render();pager.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
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
    if(currentMilestone){notice.hidden=true;return;}
    added=added.filter(id=>!id.startsWith('sticker:'));
    if(!added.length||dialog.open||document.querySelector('dialog[open]'))return;
    if(added.includes('gift:merci10')){notice.hidden=true;clearTimeout(toastTimer);return;}
    const outfit=added.find(x=>x.startsWith('outfit:')),title=added.find(x=>x.startsWith('title:')),badge=added.find(x=>x.startsWith('sticker:'));
    const destination=outfit?'jeu/dressing/tenue/'+outfit.slice(7):'carnet/'+(badge?'stickers':title?'titres':'stickers');
    notice.querySelector('[role=status]').textContent=outfit?t('Une nouvelle tenue t’attend dans le dressing.','A new look is waiting in your wardrobe.'):badge?t('Tu as gagné un nouveau badge d’exploration.','You earned a new exploration badge.'):t('Ton carnet s’est enrichi d’une découverte.','A new discovery in your notebook.');
    if(added.includes('outfit:nana-osaki') && added.includes('outfit:hachi'))
      notice.querySelector('[role=status]').textContent=t('Deux tenues débloquées : Hachi et Nana Osaki.','Two looks unlocked: Hachi and Nana Osaki.');
    const btn=notice.querySelector('button');btn.textContent=t('Voir','See');btn.dataset.njNotice=destination;
    notice.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.hidden=true,8000);
  });
  notice.querySelector('button').addEventListener('click',event=>{notice.hidden=true;navigate(event.currentTarget.dataset.njNotice);});
  document.addEventListener('portfolio-language-change',()=>{notice.hidden=true;render();if(currentMilestone){renderMilestone();milestone.querySelector('[data-milestone-close]').focus({preventScroll:true});}});
  document.addEventListener('nana-looks-change',()=>{if(dialog.open&&active==='looks'&&!dialog.querySelector('.nl-rename'))render();});
  document.addEventListener('nana-keepsakes-change',()=>{if(dialog.open&&active==='souvenirs')render();});
  small.addEventListener('change',()=>{page=0;render();});
  const recordNight=()=>{if(document.documentElement.dataset.theme==='night')progress.visit('night');};
  // Theme transitions may apply their new state asynchronously. Observe the actual theme.
  new MutationObserver(recordNight).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  recordNight();
  function remindOutfit(id){
    const outfit=progress.outfits.find(item=>item.id===id);
    if(!outfit||!progress.unlockedOutfit(id)||progress.suppressed()||dialog.open||document.querySelector('dialog[open]'))return;
    notice.querySelector('[role=status]').textContent=name(outfit.name)+t(' t’attend dans le dressing.',' is waiting in your wardrobe.');
    const btn=notice.querySelector('button');btn.textContent=t('Essayer la tenue','Try it on');btn.dataset.njNotice='jeu/dressing/tenue/'+id;
    notice.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>notice.hidden=true,6500);
  }
  window.NanaJournal={open,close,offerBadge,pendingBadge,giveBadge,remindOutfit,current:()=>dialog.open?'carnet/'+active:null};
  updateTrigger();
})();









