/* Stable, bidirectional URLs for the room, its windows and individual works.
   Hash routes work on GitHub Pages without server rewrites. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const slug = value => String(value || '').replace(/\.[^.]+$/, '');
  const enc = encodeURIComponent;
  const apps = {
    finder:['fenetre/projets','Projets'], illustration:['fenetre/illustration','Projets d’illustration'],
    social:['fenetre/social','Social media'], interactive:['fenetre/interactive','Projets interactifs'],
    photos:['illustrations','Illustrations'], motion:['animations','Animations'], pages:['fenetre/articles','Articles'],
    about:['fenetre/a-propos','À propos'], contact:['fenetre/contact','Contact'], mail:['fenetre/mail','Mail'],
    help:['fenetre/aide','Aide'], phone:['objet/phone','Smartphone'], music:['objet/music','Enceinte Marshall'],
    polaroids:['photos','Polaroïds'], book:['livre/la-princesse-clown','La Princesse Clown'],
    'mini-games':['jeux','Mini-jeux'], dressup:['jeu/dressing','Dressing'],
    tamagotchi:['jeu/tamagotchi','Tamagotchi'], latte:['jeu/latte','Latte'],
    'do-nothing':['jeu/do-nothing','Do Nothing Club'], mimilab:['jeu/mimilab','Mimilab'],
    coloring:['jeu/coloring','Coloriage'], 'bead-box':['jeu/bead-box','Boîte à perles'],
    'fortune-cookie':['jeu/fortune-cookie','Fortune cookie'],
    'reading-room':['fenetre/bibliotheque','Bibliothèque'], souvenues:['fenetre/souvenues','Souvenues'],
    'word-lab':['jeu/word-lab','Atelier de mots'], 'work-zoom':['work','Bureau'],
    'gearnews-series':['fenetre/gearnews','Série GearNews'],
    gabzilla:['projet/gabzilla','GABZILLA']
  };
  const types = {finder:'finder',illustration:'illustration',social:'social',interactive:'interactive',
    photos:'photos',motion:'motion',pages:'pages',about:'about',contact:'contact',mail:'mail',help:'help',
    book:'book','mini-games':'mini-games','bead-box':'bead-box','do-nothing':'do-nothing',
    'music-visual-design':'music-visuals'};
  const extraObjects = {
    miroir:['[data-open="dressup"]','Miroir'], fleurs:['#hotspots [data-open="photos"]','Fleurs'],
    'lampe-fleur':['#wall-lamp-hit','Lampe fleur'],
    'fortune-cookie':['[data-open="fortune-cookie"]','Fortune cookie'],
    postit:['[data-object="postit"]','Post-it'], corbeille:['[data-object="trash"]','Corbeille']
  };
  let ready=false, navigating=false, queued=false, pending=null, interaction=null, active=null;
  let appliedHash=null, hadOverlay=false, routeGeneration=0;
  const mode = () => $('#app')?.classList.contains('mode-work')?'work':$('#app')?.classList.contains('mode-play')?'room':'accueil';
  const visible = id => {const el=document.getElementById(id);return !!el&&!el.hidden;};
  const hasOverlay = () => ['window-shade','special-shade','coloring-overlay','work-break-nudge','nana-dreamlab-overlay'].some(visible)||!!$('.desk-panel:not([hidden])');
  const routeFor = name => apps[name]?.[0] || (name==='music-visuals'?'musique/home':null);
  function parse(){
    try{return location.hash.replace(/^#\/?/,'').split('/').map(decodeURIComponent).join('/');}
    catch(_){return null;}
  }
  function write(route,replace=false){
    if(route===null)return;
    const hash='#/'+route;
    if(location.hash!==hash)history[replace?'replaceState':'pushState']({nanaRoute:route},'',location.pathname+location.search+hash);
    appliedHash=location.hash;active=route;
  }
  function record(route){
    if(!ready||navigating||!route)return;
    pending=interaction||route;
    if(queued)return;
    queued=true;
    queueMicrotask(()=>{queued=false;if(pending&&!navigating){write(pending);hadOverlay=hasOverlay();}pending=null;});
  }
  function galleryRoute(which,index){
    const item=(which==='gabzilla'?GABZILLA:ART)[index];
    return item?(which==='gabzilla'?'projet/gabzilla/':'illu/')+enc(slug(which==='gabzilla'?item.src.split('/').pop():item.filename)):null;
  }
  function recordApp(name,index){record(name==='artwork'?galleryRoute('art',index||0):routeFor(name));}
  function recordWindow(type){if(types[type])record(routeFor(types[type]));}
  function closeAll(){
    window.closeWindow?.();window.closeSpecial?.();window.NanaDreamLab?.close();window.NanaColoring?.close();window.NanaTypewriter?.close();
    const panel=$('.desk-panel');if(panel)panel.hidden=true;
    const player=$('#player');if(player){player.hidden=true;$('#audio')?.pause();}
  }
  function click(el){
    if(!el)return false;
    // SVG hotspots do not implement HTMLElement.click().
    el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    return true;
  }
  function openApp(name){
    if(name==='fortune-cookie')return click($('[data-open="fortune-cookie"]'));
    if(!apps[name])return false;
    window.openApp(name);return true;
  }
  function objectElement(id){
    const zone=window.NANA_ROOM_ZONES?.find(z=>z.id===id);
    return zone?.element || (extraObjects[id]&&$(extraObjects[id][0]));
  }
  function openObject(id){
    const el=objectElement(id);if(!el)return false;
    el.scrollIntoView({block:'nearest',inline:'center'});
    // Linking a lamp locates it; opening a URL must not toggle the saved theme.
    if(el.dataset.open==='toggle-theme'||id==='lampe-fleur'){el.focus({preventScroll:true});return true;}
    return click(el);
  }
  function entries(){
    const list=[['room','La chambre'],['work','Le bureau'],...Object.values(apps),['objet/machine-a-ecrire','Machine à écrire'],['liens','Tous les liens']];
    for(const a of ART)list.push([galleryRoute('art',a.index),a.title]);
    GABZILLA.forEach((a,i)=>list.push([galleryRoute('gabzilla',i),'GABZILLA — '+a.title]));
    for(const z of window.NANA_ROOM_ZONES||[])list.push(['objet/'+z.id,z.label]);
    for(const [id,[,title]] of Object.entries(extraObjects))list.push(['objet/'+id,title]);
    for(const a of window.NanaMotionItems||[])list.push(['animation/'+enc(a.file),a.title]);
    for(const a of window.NanaMusicVisuals?.artists||[])list.push(['musique/artiste/'+a.id,a.title]);
    for(const a of window.NanaMusicVisuals?.items||[])list.push(['musique/illustration/'+enc(a.id),a.title]);
    for(const item of window.NanaLiterary?.links||[])list.push([item.route,item.title]);
    list.push(['shop','Boutique']);
    return [...new Map(list.map(([route,title])=>[route,{route,title}])).values()];
  }
  function openIndex(){
    window.openWindow('Liens directs','<p>Ouvre un élément puis copie son adresse pour le partager. / Open an item and copy its address to share it.</p><div id="nana-link-index"></div>','links');
    const host=$('#nana-link-index');
    for(const item of entries()){
      const p=document.createElement('p'),a=document.createElement('a');
      a.href='#/'+item.route;a.textContent=item.title;p.append(a);host.append(p);
    }
  }
  function perform(route){
    if(!route||route==='accueil'){window.returnToWelcome();return true;}
    if(route==='room'||route==='play'){window.chooseMode('play',false);return true;}
    if(route==='work'){window.chooseMode('work',false);return true;}
    if(route==='liens'){openIndex();return true;}
    if(route==='shop'||route.startsWith('shop/')){
      const url=new URL('shop.html',location.href);if(route.slice(5))url.searchParams.set('product',route.slice(5));
      location.assign(url.href);return true;
    }
    if(route==='objet/machine-a-ecrire'||route==='objet/typewriter'){window.NanaTypewriter?.open();return true;}
    const named=Object.entries(apps).find(([,a])=>a[0]===route);
    if(named)return openApp(named[0]);
    if(/^livre\/la-princesse-clown\/page\/[1-9]\d*$/.test(route)){window.openBook(Number(route.split('/').pop()));return true;}
    if(route.startsWith('photo/')){
      window.openApp('polaroids');const frame=$('#special-host iframe');
      const url=new URL(frame.src);url.searchParams.set('photo',route.slice(6));frame.src=url.href;return true;
    }
    if(route.startsWith('illu/')){
      const id=route.slice(5),index=/^\d+$/.test(id)?Number(id):ART.findIndex(a=>slug(a.filename)===id||a.filename===id);
      if(!ART[index])return false;window.openGallery('art',index);return true;
    }
    if(route.startsWith('projet/gabzilla/')){
      const index=GABZILLA.findIndex(a=>slug(a.src.split('/').pop())===route.slice(16));
      if(index<0)return false;window.openGallery('gabzilla',index);return true;
    }
    if(route.startsWith('animation/')){
      const id=route.slice(10),item=window.NanaMotionItems?.find(a=>a.file===id||slug(a.file)===id);
      if(!item)return false;window.openMotionAt(item.file);return true;
    }
    if(route.startsWith('bibliotheque/')||route.startsWith('souvenues/'))return window.NanaLiterary?.openLink(route)||false;
    if(route.startsWith('musique/')){
      const [,section,...rest]=route.split('/'),id=rest.join('/'),api=window.NanaMusicVisuals;
      if(!api)return false;
      if(section==='artiste'&&!api.artists.some(a=>a.id===id))return false;
      if(section==='illustration'&&!api.items.some(a=>a.id===id))return false;
      if(!['artiste','illustration','home','artists','covers','packaging','visuals','favorites'].includes(section))return false;
      api.open(section,id);return true;
    }
    if(route.startsWith('objet/')){
      const id=route.slice(6);
      if(objectElement(id))return openObject(id);
      if(id==='music-visuals'){window.NanaMusicVisuals?.open();return true;}
      if(id==='dressing')return openApp('dressup');
      return openApp(id);
    }
    if(route.startsWith('jeu/'))return openApp(route.slice(4)==='dressing'?'dressup':route.slice(4));
    if(route.startsWith('telephone/')){openApp('phone');return click($('[data-phone-app="'+(route==='telephone/mail'?'mail':'contacts')+'"]'));}
    return false;
  }
  function navigate(force=false){
    if(!ready||(!force&&appliedHash===location.hash))return;
    const generation=++routeGeneration,route=parse();
    pending=null;interaction=null;navigating=true;
    closeAll();
    const workRoute=route==='work'||/^fenetre\//.test(route||'')||['objet/machine-a-ecrire','objet/typewriter','objet/postit','objet/corbeille'].includes(route);
    window.chooseMode(workRoute?'work':'play',false);
    let opened=false;
    try{opened=route!==null&&perform(route);}finally{navigating=false;}
    active=route;appliedHash=location.hash;hadOverlay=hasOverlay();
    if(!opened&&route?.startsWith('objet/')&&window.NANA_ROOM_ZONES?.some(z=>z.id===route.slice(6)&&!z.element)){
      // Alpha-derived room hit areas arrive asynchronously with their images.
      const retry=()=>{
        if(generation!==routeGeneration){window.removeEventListener('nana-room-zones-ready',retry);return;}
        if(!objectElement(route.slice(6)))return;
        window.removeEventListener('nana-room-zones-ready',retry);navigate(true);
      };
      window.addEventListener('nana-room-zones-ready',retry);return;
    }
    if(!opened){write('room',true);window.showToast?.(document.documentElement.lang==='en'?'This link is unavailable. Explore the room.':'Ce lien n’est pas disponible. Tu peux explorer la chambre.');}
  }
  // Window capture also sees handlers which stop propagation inside a game.
  window.addEventListener('click',event=>{
    if(!ready||navigating)return;
    const el=event.target.closest?.('[data-room-zone-id],#nana-wall-mirror,#nana-wall-lamp,[data-object]');
    const id=el?.dataset.roomZoneId||(el?.id==='nana-wall-mirror'?'miroir':el?.id==='nana-wall-lamp'?'lampe-fleur':el?.dataset.object==='trash'?'corbeille':el?.dataset.object);
    interaction=id?'objet/'+id:null;
    if(interaction)record(interaction);
    else {
      const target=event.target.closest?.('[data-open]');if(target)recordApp(target.dataset.open);
      const phone=event.target.closest?.('[data-phone-app]');if(phone&&['mail','contacts'].includes(phone.dataset.phoneApp))record('telephone/'+phone.dataset.phoneApp);
      if(event.target.closest?.('[data-phone-back]'))record('objet/phone');
    }
    queueMicrotask(()=>{interaction=null;});
  },true);
  const syncClosed=()=>{
    if(!ready||navigating)return;
    const overlay=hasOverlay();
    if(hadOverlay&&!overlay)record(mode());
    hadOverlay=overlay;
  };
  document.addEventListener('nana-dreamlab-open',()=>{record('jeu/mimilab');hadOverlay=true;});
  document.addEventListener('nana-dreamlab-close',syncClosed);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==$('#special-host iframe')?.contentWindow||!$('#special-shade')?.classList.contains('polaroids-floating'))return;
    if(event.data?.type==='nana-photo-route'&&typeof event.data.id==='string')record(event.data.id?'photo/'+enc(event.data.id):'photos');
  });
  window.addEventListener('hashchange',()=>navigate());
  window.addEventListener('popstate',()=>navigate());
  function init(){
    ready=true;
    const observer=new MutationObserver(syncClosed);
    for(const id of ['window-shade','special-shade','coloring-overlay','work-break-nudge']){
      const el=document.getElementById(id);if(el)observer.observe(el,{attributes:true,attributeFilter:['hidden']});
    }
    const panel=$('.desk-panel');if(panel)observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
    const coloring=$('#coloring-overlay');if(coloring)new MutationObserver(()=>{if(!coloring.hidden){if(!active?.startsWith('objet/')||objectElement(active.slice(6))?.dataset.open!=='coloring')record('jeu/coloring');hadOverlay=true;}}).observe(coloring,{attributes:true,attributeFilter:['hidden']});
    if(location.hash)navigate(true);
    else if(new URLSearchParams(location.search).has('typewriterTest')){write('objet/machine-a-ecrire',true);navigate(true);}
    else {active=mode();hadOverlay=hasOverlay();}
  }
  window.NanaDeepLinks={record,recordApp,recordWindow,recordGallery:(which,index)=>record(galleryRoute(which,index)),
    open(route){write(String(route).replace(/^#?\/?/,''));navigate(true);},current:parse,entries,
    copy:()=>navigator.clipboard?.writeText(location.href)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
