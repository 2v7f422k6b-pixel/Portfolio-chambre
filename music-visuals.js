/* Nana / Portfolio — Music & Visual Design
 * A self-contained addition. Existing Play Mode, Motion, Tamagotchi and music are untouched.
 * Every work below points to an unaltered original supplied by the artist.
 */
(() => {
  'use strict';
  const BASE = 'assets/music-visuals/';
  const ARTISTS = [
    {
      id:'pyrene', name:'Pyrène', project:'Au Revoir', kind:'Illustration & cover',
      theme:'coral', introduction:'Une identité illustrée autour du voyage, de la couleur et du mouvement.',
      works:[
        ['Au Revoir — Cover','pyrene-au-revoir-cover.jpeg','cover'],
        ['Au Revoir — Caravane','pyrene-au-revoir-caravane.jpeg','visual'],
        ['Au Revoir — Oiseaux et ville','pyrene-au-revoir-oiseaux-ville.jpeg','visual']
      ]
    },
    {
      id:'polars', name:'Polars', project:'Illustrations pour Polars',kind:'Music visuals',theme:'violet',
      introduction:'Portraits et illustrations réalisées pour le chanteur Polars.',
      works:[
        ['Personnage au casque','polars-personnage-casque.jpeg','visual'],
        ['Portrait à cagoule','polars-portrait-cagoule.jpeg','visual'],
        ['Ma tête','polars-ma-tete.jpeg','visual'],
        ['Chapeau rose','polars-chapeau-rose.jpeg','visual'],
        ['Duo rose et rouge','polars-duo-rose-rouge.jpeg','visual']
      ]
    },
    {
      id:'naud',name:'NAUD',project:'Handmade in Marseille & illustrations',kind:'Cassette & music visuals',theme:'yellow',
      introduction:'Direction graphique de cassette et illustrations musicales pour NAUD.',
      works:[
        ['Handmade in Marseille — Jaquette de cassette','naud-handmade-in-marseille-cassette.jpeg','packaging'],
        ['Essier on Stage','naud-essier-on-stage.jpeg','visual'],
        ['Studio musical violet','naud-studio-violet.jpeg','visual'],
        ['Scène à la guillotine','naud-scene-guillotine.jpeg','visual']
      ]
    },
    {
      id:'baje-nunca',name:'Baje Nunca',project:'Piscine et pelote',kind:'Illustration musicale',theme:'aqua',
      introduction:'Illustration pour le musicien Baje Nunca.',
      works:[['Piscine et pelote','baje-nunca-piscine-pelote.jpeg','visual']]
    },
    {
      id:'charlie',name:'Charlie',project:'Réel',kind:'Packaging CD',theme:'night',
      introduction:'Création graphique pour le projet Réel, en collaboration avec Malva.',
      credit:'Collaboration avec Malva',
      works:[['Réel — Packaging CD','charlie-reel-cd-packaging-malva.jpeg','packaging']]
    }
  ].map(a=>({...a,works:a.works.map(([title,file,category],i)=>({title,src:BASE+file,category,index:i,artistId:a.id}))}));
  const ALL_WORKS = ARTISTS.flatMap(a=>a.works);
  const $ = selector => document.querySelector(selector);
  const escapeHTML = value => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let page='home', activeArtist='pyrene', currentWork=0, category='all', query='', lightbox=null;
  const FAV_KEY='nana-music-visuals-favorites';
  let favorites=[];
  try { const parsed=JSON.parse(localStorage.getItem(FAV_KEY)||'[]');if(Array.isArray(parsed))favorites=parsed.filter(id=>ARTISTS.some(a=>a.id===id)); } catch(_) {}
  const artist=id=>ARTISTS.find(a=>a.id===id)||ARTISTS[0];
  const allWorkIndex=work=>ALL_WORKS.findIndex(w=>w.src===work.src);
  const cover=a=>a.works[0];
  const workImage=(w,cls='',lazy=true)=>`<img class="${cls}" src="${w.src}" alt="${escapeHTML(w.title)}" ${lazy?'loading="lazy"':''} draggable="false">`;
  const navs=[['home','⌂','Home'],['artists','♧','Artists'],['covers','▧','Covers'],['packaging','▣','Packaging'],['visuals','✿','Music visuals'],['favorites','✦','Favorites']];

  // Entry points use their own data attribute: app.js never intercepts them.
  function installEntryPoints(){
    const grid=$('#work-desktop .folder-grid');
    if(grid&&!grid.querySelector('[data-mv-open]')){
      const button=document.createElement('button');
      button.className='desktop-folder mv-desktop-folder';
      button.type='button';button.setAttribute('data-mv-open','');
      button.setAttribute('aria-label','Open Music & Visual Design');
      button.innerHTML='<span class="folder-tile mv-folder-color">♫</span><span>Music & Visuals</span>';
      const pages=grid.querySelector('[data-open="pages"]');
      if(pages)grid.insertBefore(button,pages);else grid.append(button);
    }
  }
  function installFinderCard(){
    const grid=$('#window-content .project-grid');
    if(!grid||!grid.closest('#window-content')||grid.querySelector('[data-mv-open]'))return;
    const button=document.createElement('button');
    button.type='button';button.className='project-card mv-finder-card';
    button.setAttribute('data-mv-open','');
    button.innerHTML=`${workImage(cover(ARTISTS[0]),'',true)}<strong>Music & Visual Design</strong><small>5 artists · 14 original artworks</small>`;
    grid.appendChild(button);
  }
  function openMusicVisuals(){
    if(typeof window.openWindow!=='function')return;
    page='home';activeArtist='pyrene';query='';category='all';lightbox=null;currentWork=0;
    window.openWindow('Music & Visual Design',`<div id="mv-root" class="mv-app" aria-label="Music & Visual Design">
      <aside class="mv-sidebar" aria-label="Music & Visual Design navigation">
        <div class="mv-brand"><span class="mv-brand-icon">♫</span><span>MUSIC<br><b>& VISUAL DESIGN</b></span></div>
        <p class="mv-side-eyebrow">YOUR LIBRARY</p>
        <div class="mv-nav-list">${navs.map(([id,icon,label])=>`<button type="button" class="mv-nav-link" data-mv-page="${id}" aria-label="${label}"><span class="mv-nav-icon">${icon}</span><span>${label}</span></button>`).join('')}</div>
        <div class="mv-sidebar-divider"></div>
        <p class="mv-side-eyebrow">ARTISTS</p>
        <div class="mv-side-artists">${ARTISTS.map(a=>`<button type="button" data-mv-artist="${a.id}">${escapeHTML(a.name)}</button>`).join('')}</div>
        <div class="mv-sidebar-foot">NANA / PORTFOLIO <span>✦</span></div>
      </aside>
      <section class="mv-main" aria-label="Visual gallery">
        <header class="mv-header"><div class="mv-breadcrumb"><span class="mv-square">✳</span><span id="mv-breadcrumb">Home / Featured artists</span></div><label class="mv-search-wrap"><span aria-hidden="true">⌕</span><input id="mv-search" type="search" placeholder="Search artists & artworks" autocomplete="off" aria-label="Search artists and artworks"></label></header>
        <nav class="mv-mobile-nav" aria-label="Gallery sections">${navs.map(([id,,label])=>`<button type="button" data-mv-page="${id}">${label}</button>`).join('')}</nav>
        <div class="mv-scroll" id="mv-content" tabindex="-1"></div>
        <footer class="mv-now-viewing" id="mv-now-viewing" aria-label="Artwork navigation"></footer>
      </section>
      <div id="mv-lightbox-host"></div>
    </div>`, 'music-visual-design');
    render();
  }
  function updateNav(){
    document.querySelectorAll('#mv-root [data-mv-page]').forEach(button=>{
      const selected=button.dataset.mvPage===page;
      button.classList.toggle('is-active',selected);
      if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    const c=$('#mv-breadcrumb');if(c)c.textContent=page==='home'?'Home / Featured artists':page==='artist'?'Artists / '+artist(activeArtist).name:({'artists':'Artists','covers':'Covers','packaging':'Packaging','visuals':'Music visuals','favorites':'Favorites'}[page]||'Collection');
  }
  function artistCard(a){
    return `<article class="mv-artist-card"><button type="button" class="mv-card-open" data-mv-artist="${a.id}" aria-label="View ${escapeHTML(a.name)}">
      <div class="mv-cover-art mv-tint-${a.theme}">${workImage(cover(a),'mv-art-img')}</div>
      <span class="mv-card-title">${escapeHTML(a.name)}</span><span class="mv-card-sub">${a.works.length} ${a.works.length===1?'visual':'visuals'}</span></button>
      <button type="button" class="mv-fav-button" data-mv-favorite="${a.id}" aria-label="${favorites.includes(a.id)?'Remove':'Add'} ${escapeHTML(a.name)} ${favorites.includes(a.id)?'from':'to'} favorites" aria-pressed="${favorites.includes(a.id)}">${favorites.includes(a.id)?'✦':'✦'}</button>
    </article>`;
  }
  function artworkCard(w){
    const a=artist(w.artistId);
    return `<button type="button" class="mv-work-card" data-mv-work="${allWorkIndex(w)}" aria-label="Enlarge ${escapeHTML(w.title)}">
      <span class="mv-work-frame mv-tint-${a.theme}">${workImage(w,'mv-art-img')}</span>
      <span class="mv-work-name">${escapeHTML(w.title)}</span>
      <span class="mv-work-by">${escapeHTML(a.name)} · ${w.category==='packaging'?'Packaging':w.category==='cover'?'Cover':'Illustration'}</span>
    </button>`;
  }
  function homeHTML(){
    const feature=ARTISTS[0];
    return `<div class="mv-home">
      <section class="mv-feature" aria-label="Featured project">
       <div class="mv-feature-covers"><div class="mv-feature-main-art">${workImage(cover(feature),'',false)}</div><div class="mv-feature-secondary-art">${workImage(feature.works[1],'',false)}</div></div>
       <div class="mv-feature-copy"><span class="mv-feature-kicker">✦ ARTIST SPOTLIGHT</span><h2>Pyrène</h2><strong>Au Revoir</strong><p>Un univers illustré autour du voyage, de la couleur et du mouvement.</p><button type="button" data-mv-artist="pyrene" class="mv-primary-action">Explore the project <span>↗</span></button></div>
       <div class="mv-feature-decoration" aria-hidden="true">✳</div>
      </section>
      <section class="mv-section"><div class="mv-section-heading"><h3>All artists <span>✿</span></h3><span>5 collaborations & projects</span></div><div class="mv-artist-grid">${ARTISTS.map(artistCard).join('')}</div></section>
      <section class="mv-section mv-recent"><div class="mv-section-heading"><h3>Selected visuals</h3><button type="button" class="mv-text-action" data-mv-page="visuals">View all ↗</button></div><div class="mv-strip">${[ARTISTS[0].works[1],ARTISTS[1].works[4],ARTISTS[2].works[1],ARTISTS[3].works[0],ARTISTS[4].works[0]].map(w=>artworkCard(w)).join('')}</div></section>
    </div>`;
  }
  function artistHTML(a){
    return `<div class="mv-project-page"><button class="mv-back" type="button" data-mv-page="artists">← All artists</button>
      <section class="mv-project-hero mv-tint-${a.theme}"><div class="mv-project-hero-art">${workImage(cover(a),'',false)}</div>
        <div class="mv-project-copy"><span class="mv-project-eyebrow">ARTIST / ${a.works.length} ${a.works.length===1?'WORK':'WORKS'}</span><h2>${escapeHTML(a.name)}</h2><h3>${escapeHTML(a.project)}</h3><p>${escapeHTML(a.introduction)}</p>${a.credit?`<p class="mv-credit">${escapeHTML(a.credit)}</p>`:''}
        <button type="button" class="mv-primary-action" data-mv-work="${allWorkIndex(cover(a))}">View artwork <span>↗</span></button><button type="button" class="mv-fav-outline" data-mv-favorite="${a.id}" aria-pressed="${favorites.includes(a.id)}">${favorites.includes(a.id)?'✦ Saved':'✦ Save artist'}</button>
        </div></section>
      <section class="mv-section"><div class="mv-section-heading"><h3>Works by ${escapeHTML(a.name)}</h3><span>${a.works.length} original ${a.works.length===1?'image':'images'}</span></div><div class="mv-work-grid">${a.works.map(artworkCard).join('')}</div></section>
    </div>`;
  }
  function listingHTML(){
    let heading='All artists', intro='Explore the complete music & visual design collection.';
    let works=[];
    if(page==='artists')works=ARTISTS;
    else if(page==='favorites'){heading='Favorites';intro='The artists you saved on this device.';works=ARTISTS.filter(a=>favorites.includes(a.id));}
    else{
      heading=page==='covers'?'Covers':page==='packaging'?'Packaging':page==='search'?'Search the archive':'Music visuals';
      intro=page==='covers'?'Cover artworks in the collection.':page==='packaging'?'Cassette and CD design projects.':page==='search'?'Find a work or artist in the visual archive.':'Original illustrations created for musicians.';
      works=ALL_WORKS.filter(w=>page==='covers'?w.category==='cover':page==='packaging'?w.category==='packaging':true);
    }
    const q=query.trim().toLocaleLowerCase();
    if(q){if(page==='artists'||page==='favorites')works=works.filter(a=>a.name.toLocaleLowerCase().includes(q)||a.project.toLocaleLowerCase().includes(q));
      else works=works.filter(w=>w.title.toLocaleLowerCase().includes(q)||artist(w.artistId).name.toLocaleLowerCase().includes(q));}
    const isArtistList=page==='artists'||page==='favorites';
    return `<div class="mv-list-page"><div class="mv-list-header"><span class="mv-feature-kicker">NANA / PORTFOLIO</span><h2>${heading}</h2><p>${intro}</p></div>
     ${works.length?`<div class="${isArtistList?'mv-artist-grid':'mv-work-grid'}">${works.map(isArtistList?artistCard:artworkCard).join('')}</div>`:
     `<div class="mv-empty"><span>✦</span><h3>No results yet</h3><p>${page==='favorites'?'Save an artist using the heart icon to see them here.':'Try another search or explore a different section.'}</p><button type="button" data-mv-page="home" class="mv-primary-action">Back home ↗</button></div>`}</div>`;
  }
  function render(keepScroll=false){
    const host=$('#mv-content');if(!host)return;
    const prior=host.scrollTop;
    host.innerHTML=page==='home'?homeHTML():page==='artist'?artistHTML(artist(activeArtist)):listingHTML();
    if(keepScroll)host.scrollTop=prior;else host.scrollTop=0;
    updateNav();updateNowViewing();
    const search=$('#mv-search');if(search&&search.value!==query)search.value=query;
  }
  function updateNowViewing(){
    const host=$('#mv-now-viewing');if(!host)return;
    const w=ALL_WORKS[currentWork]||ALL_WORKS[0];const a=artist(w.artistId);
    host.innerHTML=`<div class="mv-now-intro"><span class="mv-bottom-picture">${workImage(w,'')}</span><div><strong>${escapeHTML(w.title)}</strong><small>${escapeHTML(a.name)} · Artwork preview</small></div></div>
      <div class="mv-now-controls"><button type="button" data-mv-prev aria-label="Previous artwork">‹</button><span>${String(currentWork+1).padStart(2,'0')} / ${ALL_WORKS.length}</span><button type="button" data-mv-next aria-label="Next artwork">›</button></div><span class="mv-now-label">VISUAL ARCHIVE · NO AUDIO</span>`;
  }
  function pickWork(index,showLightbox=true){
    if(!Number.isInteger(index)||index<0||index>=ALL_WORKS.length)return;
    currentWork=index;updateNowViewing();if(showLightbox){lightbox=index;renderLightbox();}
  }
  function renderLightbox(){
    const host=$('#mv-lightbox-host');if(!host)return;
    if(lightbox===null){host.innerHTML='';return;}
    const w=ALL_WORKS[lightbox],a=artist(w.artistId);
    host.innerHTML=`<div class="mv-lightbox" role="dialog" aria-modal="true" aria-label="Artwork viewer">
      <div class="mv-lightbar"><span>▧ &nbsp; Image viewer</span><button type="button" data-mv-close-lightbox aria-label="Close enlarged image">✕</button></div>
      <div class="mv-lightstage"><button type="button" data-mv-light-prev class="mv-light-arrow" aria-label="Previous image">‹</button><figure>${workImage(w,'',false)}</figure><button type="button" data-mv-light-next class="mv-light-arrow" aria-label="Next image">›</button></div>
      <div class="mv-lightcaption"><div><strong>${escapeHTML(w.title)}</strong><span>${escapeHTML(a.name)}${a.credit?' · '+escapeHTML(a.credit):''}</span></div><div class="mv-lightcount">${lightbox+1} / ${ALL_WORKS.length}</div></div>
    </div>`;
    host.querySelector('[data-mv-close-lightbox]')?.focus({preventScroll:true});
  }
  function changeArtwork(delta,zoomOnly=false){
    if(lightbox!==null){lightbox=(lightbox+delta+ALL_WORKS.length)%ALL_WORKS.length;currentWork=lightbox;renderLightbox();updateNowViewing();}
    else{currentWork=(currentWork+delta+ALL_WORKS.length)%ALL_WORKS.length;updateNowViewing();if(zoomOnly)pickWork(currentWork);}
  }
  function toggleFavorite(id){
    favorites=favorites.includes(id)?favorites.filter(v=>v!==id):[...favorites,id];
    try{localStorage.setItem(FAV_KEY,JSON.stringify(favorites));}catch(_){}
    render(true);
  }
  // All controls in this module are functional, with no pretend audio player.
  document.addEventListener('click',event=>{
    const open=event.target.closest('[data-mv-open]');if(open){event.preventDefault();openMusicVisuals();return;}
    if(!$('#mv-root'))return;
    let target=event.target.closest('[data-mv-artist]');if(target){page='artist';activeArtist=target.dataset.mvArtist;query='';currentWork=allWorkIndex(cover(artist(activeArtist)));render();return;}
    target=event.target.closest('[data-mv-page]');if(target){page=target.dataset.mvPage;query='';render();return;}
    target=event.target.closest('[data-mv-favorite]');if(target){toggleFavorite(target.dataset.mvFavorite);return;}
    target=event.target.closest('[data-mv-work]');if(target){pickWork(Number(target.dataset.mvWork));return;}
    if(event.target.closest('[data-mv-close-lightbox]')){lightbox=null;renderLightbox();return;}
    if(event.target.closest('[data-mv-light-prev],[data-mv-prev]')){changeArtwork(-1,event.target.closest('[data-mv-prev]')!==null);return;}
    if(event.target.closest('[data-mv-light-next],[data-mv-next]')){changeArtwork(1,event.target.closest('[data-mv-next]')!==null);return;}
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='mv-search'){
      query=event.target.value;
      page=query.trim()?'search':'home';
      render();
    }
  });
  document.addEventListener('keydown',event=>{
    if(lightbox===null||!$('#mv-root'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();lightbox=null;renderLightbox();}
    if(event.key==='ArrowRight'){event.preventDefault();changeArtwork(1);}
    if(event.key==='ArrowLeft'){event.preventDefault();changeArtwork(-1);}
  },true);
  document.addEventListener('DOMContentLoaded',()=>{
    installEntryPoints();
    const content=$('#window-content');
    if(content){new MutationObserver(()=>{if(content.querySelector('.project-grid'))installFinderCard();}).observe(content,{childList:true,subtree:true});}
  });
})();
