'use strict';

// The site's actual artwork is copied from the user's original files.
// No illustrative assets are generated at runtime.
const ART = [
  ['Bubblegum','bubblegum.jpg'],
  ['Bubbles','soap-bubbles.jpg'],
  ['Butterfly Garden','butterflies-grass.jpg'],
  ['Floral Portrait','flower-portrait.jpg'],
  ['Kitchen','kitchen.jpg'],
  ['Cherry Blossoms','cherry-blossom.jpg'],
  ['Butterfly','butterfly-back.jpg'],
  ['The Lighter','lighter.jpg'],
  ['Close-up','closeup.jpg'],
  ['Sunglasses','sunglasses.jpg'],
  ['Clown','clown.jpg'],
  ['The Pink Castle','pink-castle.jpg'],
  ['Snowy City','snow-city.jpg'],
  ['Still Life','still-life.jpg'],
  ['Motorcycle','motorbike.jpg'],
  ['Studio','synth-portrait.jpg'],
  ['Marseille','marseille.jpg'],
  ['Marseille Emblem','marseille-emblem.jpg'],
  ['Swans and Lotus','swans-lotus.jpg']
].map(([title,filename],index)=>({title,filename,src:'assets/previews/photos/'+filename.replace(/\.jpe?g$/i,'.webp'),index}));
window.portfolioArtworkByFile = filename => ART.find(art => art.filename === String(filename||''));
window.portfolioArtworkIndex = filename => window.portfolioArtworkByFile(filename)?.index ?? -1;
const GABZILLA = [
  {title:'Original illustration',src:'assets/previews/gabzilla/illustration.webp'},
  {title:'Textile composition',src:'assets/previews/gabzilla/composition.webp'},
  {title:'The collaboration',src:'assets/previews/gabzilla/tshirt-porte.webp'}
];
const $ = selector => document.querySelector(selector);
const app=$('#app'),welcome=$('#welcome'),desktop=$('#desktop');
const play=$('#play-viewport'),work=$('#work-desktop');
const shade=$('#window-shade'),win=$('#window'),winContent=$('#window-content'),winTitle=$('#window-title');
const specialShade=$('#special-shade'),specialHost=$('#special-host');
const audio=$('#audio'),player=$('#player');
let currentMode=null, currentWindow=null, currentGallery=null, musicWasStarted=false, toastTimer;
let phoneKeyboardInput=null;

function formatTime(seconds){
 if(!Number.isFinite(seconds)||seconds<0)return '0:00';
 const t=Math.floor(seconds);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
}
function updateClocks(){
 const d=new Date();const hour=String(d.getHours()).padStart(2,'0'),min=String(d.getMinutes()).padStart(2,'0');
 const kittyClock=$('#kitty-time');if(kittyClock)kittyClock.textContent=hour+':'+min;
 const phoneClock=$('#phone-time');if(phoneClock)phoneClock.textContent=hour+':'+min;
}
updateClocks();setInterval(updateClocks,15000);

// Night mode crossfades between the two user-approved bedroom artworks.
// Hotspots and the live clock remain in exactly the same UI coordinates.
const THEME_KEY='nana-portfolio-theme';
let roomThemeTransition=null;
let queuedRoomTheme=null;
function applyTheme(theme){
 const target=theme==='night'?'night':'day';
 const root=document.documentElement;
 if(roomThemeTransition){queuedRoomTheme=target;return;}
 const visible=app?.classList.contains('mode-play');
 if(root.dataset.theme===target||!visible||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   applyThemeInstant(target);return;
 }
 // Capture the whole composed room, rather than fading each nested layer.
 root.classList.add('nana-room-theme-transition');
 try {
   const transition=(document.startViewTransition?document.startViewTransition.bind(document):roomSnapshotTransition)(async()=>{
     applyThemeInstant(target);
     // View Transitions suspend rendering while this callback runs. Waiting for
     // animation frames here can hit the browser timeout and skip the fade.
     // A task lets theme MutationObservers settle without waiting for a paint.
     await new Promise(resolve=>setTimeout(resolve,0));
     const scene=document.getElementById('play-scene');
     if(scene) {
       const images=[...scene.querySelectorAll('img')];
       const urls=new Set([...scene.querySelectorAll('image')].map(el=>el.getAttribute('href')).filter(Boolean));
       for(const url of urls){const image=new Image();image.src=url;images.push(image);}
       await Promise.all(images.map(image=>image.decode?image.decode().catch(()=>{}):Promise.resolve()));
     }
   });
   roomThemeTransition=transition;
   transition.finished.catch(()=>{}).finally(()=>{
     roomThemeTransition=null;root.classList.remove('nana-room-theme-transition');
     const next=queuedRoomTheme;queuedRoomTheme=null;
     if(next&&next!==root.dataset.theme)applyTheme(next);
   });
 } catch(_){
   root.classList.remove('nana-room-theme-transition');roomThemeTransition=null;
   applyThemeInstant(target);
 }
}
function roomSnapshotTransition(update) {
 const scene=document.getElementById('play-scene'),viewport=document.getElementById('play-viewport');
 if(!scene||!viewport){const finished=Promise.resolve().then(update);return {finished};}
 const rect=scene.getBoundingClientRect(),view=viewport.getBoundingClientRect();
 const snapshot=scene.cloneNode(true);
 const originals=[scene,...scene.querySelectorAll('*')],copies=[snapshot,...snapshot.querySelectorAll('*')];
 const properties=['opacity','filter','fill','fill-opacity','stroke','stroke-opacity','stroke-width','color','background-color','background-image','box-shadow','text-shadow','visibility','display','mix-blend-mode','stop-color','stop-opacity'];
 const frozenStyles=originals.map(original=>{
   const style=getComputedStyle(original);
   return properties.map(property=>style.getPropertyValue(property));
 });
 copies.forEach((copy,index)=>{
   properties.forEach((property,p)=>copy.style.setProperty(property,frozenStyles[index][p],'important'));
   copy.style.setProperty('transition','none','important');
   copy.style.setProperty('animation','none','important');
 });
 const layer=document.createElement('div');layer.className='nana-room-theme-snapshot';
 layer.setAttribute('aria-hidden','true');layer.inert=true;
 layer.style.cssText='position:fixed;pointer-events:none;overflow:hidden;z-index:39;left:'+view.left+'px;top:'+view.top+'px;width:'+view.width+'px;height:'+view.height+'px;';
 snapshot.style.setProperty('position','absolute','important');
 snapshot.style.setProperty('left',(rect.left-view.left)+'px','important');
 snapshot.style.setProperty('top',(rect.top-view.top)+'px','important');
 snapshot.style.setProperty('width',scene.offsetWidth+'px','important');
 snapshot.style.setProperty('height',scene.offsetHeight+'px','important');
 snapshot.style.setProperty('margin','0','important');
 snapshot.style.setProperty('transform-origin','0 0','important');
 snapshot.style.setProperty('transform','scale('+(rect.width/scene.offsetWidth)+','+(rect.height/scene.offsetHeight)+')','important');
 layer.appendChild(snapshot);document.body.appendChild(layer);
 const finished=Promise.resolve().then(update).then(()=>{
   const animation=layer.animate([{opacity:1},{opacity:0}],{duration:1800,easing:'cubic-bezier(.42,0,.25,1)',fill:'forwards'});
   return animation.finished;
 }).finally(()=>layer.remove());
 return {finished};
}
function applyThemeInstant(theme){
 const night=theme==='night';
 // The Work wallpaper layers stay mounted in both themes. The theme switch
 // changes only their opacity, not the layout or the scroll position.
 const workArea=document.getElementById('work-desktop');
 const scrollBefore=workArea&&!workArea.hidden?workArea.scrollTop:null;
 document.documentElement.dataset.theme=night?'night':'day';
 const toggle=$('#theme-toggle');
 if(toggle){
  toggle.setAttribute('aria-pressed',String(night));
  toggle.setAttribute('aria-label',night?'Enable day mode':'Enable night mode');
  toggle.title=night?'Switch to Day':'Switch to Night';
  toggle.querySelector('.theme-icon').textContent=night?'☀':'☾';
  toggle.querySelector('.theme-label').textContent=night?'Day':'Night';
 }
 try{localStorage.setItem(THEME_KEY,night?'night':'day')}catch(e){}
 // The previous rectangle-based correction itself caused a scroll jump
 // whenever the folder heading or background recomputed during a theme change.
 if(scrollBefore!==null&&workArea.scrollTop!==scrollBefore)
   workArea.scrollTop=scrollBefore;
}
let savedTheme='day';
try{savedTheme=localStorage.getItem(THEME_KEY)||'day'}catch(e){}
applyTheme(savedTheme);

// Keep the existing iMac zoom; only polish the reverse direction and interruption handling.
let imacZoomAnimation=null,modeTransitionAnimations=[],modeTransitionId=0;
function resetModeTransition(){
 modeTransitionId++;
 for(const animation of modeTransitionAnimations)animation.cancel();
 modeTransitionAnimations=[];
 play.style.zIndex='';play.style.pointerEvents='';
 work.style.zIndex='';work.style.pointerEvents='';
}
function chooseMode(mode,zoom=false){
 const previousMode=currentMode;
 if(imacZoomAnimation){const animation=imacZoomAnimation;imacZoomAnimation=null;animation.cancel()}
 resetModeTransition();
 closeWindow();closeSpecial();
 currentMode=mode;app.className='mode-'+mode;
 welcome.hidden=true;desktop.hidden=false;
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const reverseZoom=zoom && previousMode==='work' && mode==='play' && !reduceMotion;
 play.hidden=mode!=='play';work.hidden=mode!=='work' && !reverseZoom;
 // A previously scrolled desktop must reopen at its fixed initial position.
 if(mode==='work')work.scrollTop=0;
 $('#menu-mode').textContent='Accueil';
 const modeSwitch=$('#switch-mode');if(modeSwitch){modeSwitch.textContent=mode==='play'?'Passer en mode Work':'Passer en mode Play';modeSwitch.setAttribute('aria-label',modeSwitch.textContent);modeSwitch.title=modeSwitch.textContent;}
 if(reverseZoom){
  // Work remains visible underneath while the room smoothly zooms back into place.
  play.style.zIndex='2';work.style.zIndex='1';
  play.style.pointerEvents='auto';work.style.pointerEvents='none';
  const scene=$('#play-scene');
  const roomAnimation=scene.animate([
   {transform:'scale(3.4)',opacity:0,filter:'blur(3px)'},
   {transform:'scale(1.25)',opacity:1,filter:'blur(0)'},
   {transform:'scale(1)',opacity:1,filter:'blur(0)'}
  ],{duration:550,easing:'cubic-bezier(.55,.05,.45,1)'});
  const desktopAnimation=work.animate([{opacity:1},{opacity:0}],
   {duration:550,easing:'ease-in-out',fill:'forwards'});
  modeTransitionAnimations=[roomAnimation,desktopAnimation];
  const transitionId=modeTransitionId;
  Promise.allSettled(modeTransitionAnimations.map(animation=>animation.finished)).then(()=>{
   if(transitionId!==modeTransitionId)return;
   work.hidden=true;
   resetModeTransition();
  });
 }else if(zoom && mode==='work' && !reduceMotion){
  const animation=work.animate([{opacity:0,transform:'scale(.88)'},{opacity:1,transform:'scale(1)'}],
   {duration:600,easing:'cubic-bezier(.15,.7,.25,1)'});
  modeTransitionAnimations=[animation];
 }
 updateClocks();
 // Enter the Work desktop without opening the redundant Projects window.
}
function zoomIntoIMac(){
 if(currentMode!=='play'){chooseMode('work',true);return}
 if(imacZoomAnimation)return;
 const scene=$('#play-scene');
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){chooseMode('work',false);return}
 const anim=scene.animate([
  {transform:'scale(1)',opacity:1,filter:'blur(0)'},
  {transform:'scale(1.25)',opacity:1,filter:'blur(0)'},
  {transform:'scale(3.4)',opacity:.5,filter:'blur(3px)'}
 ],{duration:550,easing:'cubic-bezier(.55,.05,.45,1)',fill:'none'});
 imacZoomAnimation=anim;
 anim.finished.then(()=>{
  if(imacZoomAnimation!==anim)return;
  imacZoomAnimation=null;
  if(currentMode==='play')chooseMode('work',true);
 }).catch(()=>{
  if(imacZoomAnimation===anim)imacZoomAnimation=null;
 });
}
function returnToWelcome(){
 if(imacZoomAnimation){const animation=imacZoomAnimation;imacZoomAnimation=null;animation.cancel()}
 resetModeTransition();
 closeWindow();closeSpecial();audio.pause();player.hidden=true;
 desktop.hidden=true;welcome.hidden=false;app.className='mode-select';currentMode=null;
}
function switchMode(){if(currentMode==='play')zoomIntoIMac();else if(currentMode==='work')chooseMode('play',true);else returnToWelcome()}
function showToast(message){
 const node=$('#toast');clearTimeout(toastTimer);node.textContent=message;node.hidden=false;
 toastTimer=setTimeout(()=>node.hidden=true,3000);
}

function closeWindow(){
 shade.hidden=true;
 shade.style.pointerEvents='none';
 win.style.pointerEvents='none';
 win.getAnimations().forEach(animation=>animation.cancel());
 currentWindow=null;
 win.classList.remove('expanded');
 winContent.innerHTML='';
}
let polaroidAudio=null;
function closeSpecial(){
 $('#special-close').setAttribute('aria-label','Close');
 specialShade.classList.remove('tamagotchi-open');
 specialShade.classList.remove('polaroids-floating');
 if(polaroidAudio){polaroidAudio.close().catch(()=>{});polaroidAudio=null;}
 specialShade.hidden=true;
 specialShade.style.pointerEvents='none';
 specialHost.innerHTML='';
 phoneKeyboardInput=null;
}
function openWindow(title,html,type='generic'){
 closeWindow();
 closeSpecial();
 currentWindow=type;
 win.dataset.windowType=type;
 winTitle.textContent=title;
 winContent.innerHTML=html;
 if(window.nanaHydrate)window.nanaHydrate(winContent);
 win.setAttribute('aria-modal',String(currentMode!=='work'));
 win.classList.remove('expanded');
 shade.hidden=false;
 // Work Mode behaves like a desktop: folders remain clickable behind the window.
 shade.style.pointerEvents=currentMode==='work'?'none':'auto';
 win.style.pointerEvents='auto';
 $('#window-close').focus({preventScroll:true});
}
function openApp(name,index){
 switch(name){
  case 'work-zoom':zoomIntoIMac();break;
  case 'phone':showPhone();break;
  case 'tamagotchi':showTamagotchi();break;
  case 'latte':showLatte();break;
  case 'polaroids':showPolaroids();break;
  case 'music':showMusic(true);break;
  case 'clock':showToast('Local time: '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));break;
  case 'finder':openFinder();break;
  case 'illustration':openIllustrationProjects();break;
  case 'social':openSocialProjects();break;
  case 'interactive':openInteractiveProjects();break;
  case 'mini-games':openMiniGames();break;
  case 'coloring':window.NanaColoring?.open();break;
  case 'bead-box':window.NanaBeadBox?.open();break;
  case 'mimilab':closeWindow();window.NanaDreamLab?.open();break;
  case 'dressup':openAbout();break;
  case 'photos':openPhotos();break;
  case 'gearnews-series':openGearnewsSeries();break;
  case 'artwork':openGallery('art',index||0);break;
  case 'gabzilla':openGallery('gabzilla',0);break;
  case 'motion':window.openMotion?.();break;
  case 'pages':window.openEditorialPages?.();break;
  case 'about':openWorkAbout();break;
  case 'book':window.openBook?.();break;
   case 'do-nothing':window.NanaDoNothing?.open();break;
  case 'reading-room':
  case 'souvenues':
  case 'word-lab':{
    if(!window.NanaLiterary){showToast('La bibliothèque est momentanément indisponible.');break;}
    const page=window.NanaLiterary.view(name);
    openWindow(page.title,page.html,'literary');
    window.NanaLiterary.activate(name);
    break;
  }
  case 'mail':openMail();break;
  case 'contact':openContacts();break;
  case 'help':openHelp();break;
 }
}

// The illustrated ring light opens Léna's ongoing GearNews reel series.
function openGearnewsSeries(){
 const en=document.documentElement.lang==='en';
 const label=en?'My first steps in music':'Mes premiers pas dans la musique';
 const intro=en?'A GearNews.fr series in progress. New episodes will join this little collection as they come out.':'Une série GearNews.fr en cours. Les prochains épisodes viendront rejoindre cette petite collection.';
 const first=en?'The chords':'Les accords';
 const second=en?'Arpeggios':'Les arpèges';
 const watch=en?'Watch on Instagram':'Voir sur Instagram';
 const more=en?'More episodes to come…':'D’autres épisodes arrivent…';
 const episode=(number,name,shortcode)=>{
  const url='https://www.instagram.com/gearnews.fr/reel/'+shortcode+'/';
  const cover='assets/gearnews-episode-'+Number(number)+'-cover.jpg';
  return `<article class="gearnews-ring-episode">
   <a class="gearnews-ring-preview" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name} — Instagram">
    <img class="gearnews-ring-thumbnail" src="${cover}" alt="${name} — GearNews.fr" loading="lazy" decoding="async">
   </a>
   <div class="gearnews-ring-details">
    <span class="gearnews-ring-number">${number}</span>
    <span class="gearnews-ring-copy"><strong>${name}</strong><a href="${url}" target="_blank" rel="noopener noreferrer">${watch}</a></span>
   </div>
  </article>`;
 };
 openWindow('GearNews.fr',`<section class="gearnews-ring-series" data-no-translate>
  <p class="gearnews-ring-kicker">GEARNEWS.FR · ${en?'ONGOING SERIES':'SÉRIE EN COURS'}</p>
  <h2>${label}</h2>
  <p class="gearnews-ring-intro">${intro}</p>
  <div class="gearnews-ring-episodes">
   ${episode('01',first,'DehTbhQxAUI')}
   ${episode('02',second,'DfPtOh7CYOJ')}
  </div>
  <p class="gearnews-ring-more">${more}</p>
 </section>`,'gearnews-series');}

function openFinder(){
 const cards=`<div class="project-grid atelier-project-grid">
   <button class="project-card" data-open="illustration"><span class="project-preview"><img src="assets/project-thumb-illustrations.webp" alt="Illustration d’une femme aux cheveux violets et son pistolet à bulles" loading="lazy"></span><strong>Illustrations</strong><small>Drawings, visual storytelling & collaborations</small></button>
   <button class="project-card" data-open="motion"><span class="project-preview"><img src="assets/project-thumb-animations.webp" alt="Animation en trois panneaux avec fleurs, nuages et basket orange" loading="lazy"></span><strong>Animations</strong><small>Swipe through original animations</small></button>
   <button class="project-card" data-open="social"><span class="project-icon">✧</span><strong>Social Media</strong><small>Creative communication & community management</small></button>
   <button class="project-card" data-open="pages"><span class="project-icon">✎</span><strong>Editorial</strong><small>Articles, music & culture</small></button>
   <button class="project-card" data-open="interactive"><span class="project-icon">✦</span><strong>Interactive</strong><small>Illustrated stories and playful web experiments</small></button>
   <button class="project-card" data-open="mini-games"><span class="project-icon">✦</span><strong>Mini Games</strong><small>Music, coloring, poetry & little games</small></button>
   <button class="project-card" data-open="book"><span class="book-finder-cover">✧<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Interactive illustrated book · 74 pages</small></button>
  </div>`;
 openWindow('MY PROJECTS',`<h2 class="nana-script-heading"><span class="nana-hand nana-hand--little-bit" data-nana-script="little-bit">A little bit of everything I create.</span></h2><p class="section-lead">Browse my illustrated, animated, written projects and more</p>${cards}`,'finder');
}
function openIllustrationProjects(){
 openWindow('ILLUSTRATIONS',`<div class="eyebrow">PROJECTS / ILLUSTRATIONS</div><h2>Illustrations</h2><p class="section-lead">Illustrated stories, artworks and visual collaborations.</p><div class="project-grid">
 <button class="project-card" data-open="photos"><span class="project-preview"><img src="assets/previews/photos/swans-lotus.webp" alt="Swans and lotus flowers illustration"></span><strong>Original illustrations</strong><small>Explore the gallery</small></button>
 <button class="project-card" data-open="gabzilla"><span class="project-preview"><img src="assets/previews/gabzilla/illustration.webp" alt="GABZILLA textile collaboration"></span><strong>GABZILLA</strong><small>Illustration · Textile collaboration</small></button>
 <button class="project-card" data-open="book"><span class="book-finder-cover">✧<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Illustrated book · 74 pages</small></button>
 </div>`,'illustration');
}
function openSocialProjects(){
 openWindow('SOCIAL MEDIA',`<div class="eyebrow">PROJECTS / SOCIAL MEDIA</div><h2>Social media & community</h2><p class="section-lead">Creative content, storytelling and community building for music and artistic projects.</p>
 <div class="info-list">
 <div class="info-box"><small>01 / SYNTHS & MUSICAL EXPRESSION</small><strong>Expressive E</strong><p>Social media content, community management and product storytelling.</p></div>
 <div class="info-box"><small>02 / MUSIC</small><strong>Tomasz Bura Group</strong><p>Communication and community management for a jazz project.</p></div>
 <div class="info-box"><small>03 / MEDITATION & MUSIC</small><strong>Zorza</strong><p>Content creation and creative communication for a meditation project.</p></div>
 </div>`,'social');
}
function openMiniGames(){
 const fr=!document.documentElement.lang.toLowerCase().startsWith('en');
 const games=[["bead-box","Boîte à perles","Bead Box","Compose ton bijou de téléphone avec des perles, des lettres et des petits pendentifs.","Make a phone charm with beads, letters and tiny pendants."],["mimilab","Mimilab 3","Mimilab 3","Joue, compose et télécharge ta musique avec le clavier et le mini DAW.","Play, compose and download your music with the keyboard and mini DAW."],["coloring","Coloriage","Coloring Book","Colorie cinq de mes dessins au pinceau ou au pot de peinture.","Color five of my drawings using the paint bucket and freehand brush."],["tamagotchi","Tamagotchi","Tamagotchi","Prends soin d’un petit compagnon numérique.","Take care of a tiny digital companion."],["latte","Atelier latte","Latte Lab","Prépare ton café et dessine un cœur dans la mousse.","Make your own tiny coffee and finish it with a foam heart."],["do-nothing","Le club du rien","Do Nothing Club","Offre-toi une minute de pause. Le monde peut attendre.","Take a minute to rest. The world can wait."],["word-lab","Le Laboratoire des mots","Word Lab","Assemble des mots et télécharge ton poème.","Arrange words and download your poem."]];
 openWindow(fr?'MINI-JEUX':'MINI GAMES',`<section class="mini-games-section" aria-labelledby="mini-games-heading">
  <div class="eyebrow">${fr?'MODE WORK / MINI-JEUX':'WORK MODE / MINI GAMES'}</div>
  <h2 id="mini-games-heading">${fr?'Mini-jeux':'Mini Games'}</h2>
  <p class="mini-games-intro">${fr?'Des petits jeux pour créer, explorer et faire une pause. Clique sur une carte pour commencer.':'Little games to create, explore and take a break. Click a card to start.'}</p>
  <div class="mini-game-grid">${games.map(([id,nameFr,nameEn,descriptionFr,descriptionEn])=>`
    <button class="mini-game-card" type="button" data-open="${id}">
      <span class="mini-game-preview mini-game-placeholder">${fr?'Illustration à venir':'Illustration incoming'}</span>
      <span class="mini-game-name">${fr?nameFr:nameEn}</span>
      <span class="mini-game-description">${fr?descriptionFr:descriptionEn}</span>
      <span class="mini-game-cta">${fr?'Jouer':'Play'}</span>
    </button>`).join('')}</div>
 </section>`,'mini-games');
}
function openInteractiveProjects(){
 openWindow('INTERACTIVE',`<div class="eyebrow">PROJECTS / INTERACTIVE</div><h2>Little worlds to explore</h2><p class="section-lead">Interactive storytelling, games and playful experiments.</p>
 <div class="project-grid">
 <button class="project-card" data-open="book"><span class="book-finder-cover">✧<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Turn the pages of the illustrated book</small></button>
 <button class="project-card" data-open="mini-games"><span class="project-icon">✦</span><strong>Mini Games</strong><small>Explore all the mini games</small></button>
 <button class="project-card" data-open="polaroids"><span class="project-icon">▧</span><strong>My Polaroids</strong><small>Move, turn and explore my instant photographs</small></button>
 <button class="project-card" data-mode="play"><span class="project-icon">⌂</span><strong>Explore the room</strong><small>Return to Play Mode</small></button>
 </div>`,'interactive');
}
function safePresentationImage(value){
 if(typeof value!=='string')return '';
 const path=value.trim();
 if(!path || /^(?:javascript|data):/i.test(path))return '';
 try{
  const url=new URL(path,location.href);
  if(url.origin!==location.origin)return '';
  return url.href;
 }catch{return ''}
}
function openWorkAbout(){
 const en=document.documentElement.lang==='en';
 const t=(fr,english)=>en?english:fr;
 const rule='<svg class="nana-card-rule" viewBox="0 0 400 5" preserveAspectRatio="none" aria-hidden="true"><path d="M1 3 Q48 1 96 3 T194 2 T298 3 T399 2" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
 openWindow(t('À propos','About me'),`<style>
 html body #window-shade #window:has(.nana-profile-card){width:min(460px,94vw)!important;height:auto!important;min-height:0!important;background:transparent!important;border:0!important;border-image:none!important;box-shadow:none!important;overflow:visible!important}
 html body #window-shade #window:has(.nana-profile-card)::before,html body #window-shade #window:has(.nana-profile-card)::after,html body #window-shade #window:has(.nana-profile-card)>.sketch-ui-svg{display:none!important}
 html body #window-shade #window:has(.nana-profile-card)>.window-top{position:relative!important;display:block!important;height:39px!important;min-height:39px!important;margin:0 0 6px!important;padding:0!important;background:transparent!important;border:0!important;border-image:none!important;box-shadow:none!important}
 html body #window-shade #window:has(.nana-profile-card)>.window-top>.nana-window-heart,html body #window-shade #window:has(.nana-profile-card)>.window-top>.sketch-ui-svg{display:none!important}
 html body #window-shade #window:has(.nana-profile-card) #window-title{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important}
 html body #window-shade #window:has(.nana-profile-card) #window-close{position:absolute!important;top:0!important;right:0!important;width:38px!important;height:38px!important;min-width:38px!important;padding:5px!important;margin:0!important;background:#fff!important;border:2px solid #ff173b!important;border-image:url('assets/drawn-ui/cadre_bouton.png') 20 / 3px / 0 stretch!important;border-radius:3px 5px 2px 4px!important;box-shadow:none!important;display:flex!important;align-items:center!important;justify-content:center!important}
 html body #window-shade #window:has(.nana-profile-card) #window-close img{width:28px!important;height:28px!important;object-fit:contain!important}
 html body #window-shade #window:has(.nana-profile-card) #window-content{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;overflow:visible!important}
 html body #window-shade #window:has(.nana-profile-card) #window-content>.sketch-ui-svg{display:none!important}

 html body #window .nana-profile-card{position:relative;width:min(440px,calc((100dvh - 160px)*.716),100%);aspect-ratio:63/88;box-sizing:border-box;margin:0 auto;padding:4.8% 5.5% 7%;display:flex;flex-direction:column;container-type:inline-size;color:#cf123a;background:#ffd4e4!important;border-radius:24px!important;overflow:hidden;font-family:inherit}
 html body #window .nana-profile-card::before{content:none!important}
 .nana-profile-card>.card-outline{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3}
 .nana-profile-card .card-edition{font-size:2.6cqw;font-weight:700;line-height:1.1}
 .nana-profile-card header{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 1cqw}
 html body #window .nana-profile-card h2{font-size:7.8cqw!important;font-weight:bold;line-height:1.05;margin:0!important}
 .nana-profile-card .card-hp{display:flex;align-items:center;gap:1.5cqw;font-size:5.5cqw;font-weight:bold;white-space:nowrap}
 .nana-profile-card .card-recharge{text-align:right;font-size:2.5cqw;line-height:1.1;margin:-.4cqw 0 1.8cqw}
 html body #window .nana-profile-art{flex:0 0 32%;position:relative;width:100%;background:radial-gradient(ellipse at 50% 30%,#fff4e8 0%,#ffc0db 55%,#eaa3cc 100%)!important;overflow:hidden;border-radius:0!important}
 .nana-profile-art img{position:absolute;width:130%;height:auto;max-width:none;left:-15%;top:-12%;object-fit:contain}
 .nana-profile-art .card-art-frame{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
 .nana-profile-card .card-location{background:#ff9dba!important;font-weight:bold;font-style:italic;text-align:center;font-size:2.55cqw;line-height:1.3;padding:.7cqw 1cqw;margin:1cqw 0 1.5cqw}
 .nana-profile-card .card-attack{display:grid;grid-template-columns:13% minmax(0,1fr) auto;gap:2cqw;align-items:center;flex:1;padding:1.5cqw 0;margin:0}
 html body #window .nana-profile-card h3{font-size:4.5cqw!important;line-height:1.05;margin:0 0 1cqw!important;font-weight:bold}
 html body #window .nana-profile-card p{font-size:3cqw;line-height:1.25;margin:0}
 .nana-profile-card .card-damage{font-size:7cqw;font-weight:normal}
 .nana-profile-card .card-section-label{display:none}
 .nana-card-rule{display:block;width:100%;height:4px;flex:0 0 4px;pointer-events:none}
 .nana-profile-card .card-energy{display:inline-flex;align-items:center;justify-content:center;width:5.6cqw;height:5.6cqw;flex:0 0 auto;border-radius:48% 52% 46% 54%!important;background:#fff4e8!important;border:1px solid #cf123a}
 .nana-profile-card .card-energy img{position:static;width:75%;height:75%;object-fit:contain}
 .nana-profile-card .card-cost{display:flex;flex-wrap:wrap;gap:.6cqw;justify-content:center;align-items:center}
 .nana-profile-card .card-matchups{display:grid;grid-template-columns:1fr 1.7fr 1fr;gap:2cqw;padding:1.5cqw 0;margin:0;text-align:center}
 .nana-profile-card .card-matchups dt{font-size:3cqw;font-weight:bold;margin:0 0 .5cqw}
 .nana-profile-card .card-matchups dd{font-size:2.9cqw;line-height:1.2;margin:0}
 .nana-profile-card .card-matchups strong{display:inline;font-size:3.5cqw;margin-left:1cqw}
 html body #window .nana-profile-card .card-anecdote{font-size:2.9cqw;font-weight:bold;font-style:italic;line-height:1.25;padding:1.6cqw 2cqw;background:#ffe5ed!important;border-radius:2px 4px 2px 3px!important}
 .nana-profile-card footer{flex:0 0 auto;display:flex;justify-content:space-between;gap:2cqw;font-size:2.2cqw;line-height:1.2;padding-top:1.3cqw}
</style><article class="nana-profile-card" data-no-translate aria-label="${t('Carte de personnage de Léna','Léna’s character card')}">
 <svg class="card-outline" viewBox="0 0 630 880" preserveAspectRatio="none" aria-hidden="true"><path d="M44 16 Q310 13 586 17 Q615 18 615 46 L613 835 Q613 864 584 865 Q310 869 45 864 Q15 864 16 835 L15 46 Q14 17 44 16Z" fill="none" stroke="#f58bb0" stroke-width="28"/><path d="M48 31 Q310 28 582 32 Q598 32 598 48 L597 830 Q597 847 581 848 Q310 852 48 847 Q32 847 32 831 L32 48 Q32 31 48 31Z" fill="none" stroke="#cf123a" stroke-width="1.7"/></svg>
 <div class="card-edition">${t('Personnage de base','Basic character')}</div>
 <header><h2>Léna</h2><span class="card-hp">40 ${t('PV','HP')}<span class="card-energy" aria-hidden="true"><img src="assets/drawn-ui/etoile_pleine.png" alt=""></span></span></header>
 <div class="card-recharge">${t('rechargeable au café','coffee-rechargeable')}</div>
 <div class="nana-profile-art" role="img" aria-label="${t('Personnage illustré de Léna','Illustrated character of Léna')}">
 <img src="assets/dressing-lena/lena-original.png" alt="">
 <img src="assets/dressing-lena/Illustration_sans_titre-6.png" alt="">
 <img src="assets/dressing-lena/Illustration_sans_titre-7.png" alt="">
 <img src="assets/dressing-lena/Illustration_sans_titre-8.png" alt="">
 <svg class="card-art-frame" viewBox="0 0 400 250" preserveAspectRatio="none" aria-hidden="true"><path d="M5 5 Q190 3 395 5 L394 245 Q190 247 5 244Z" fill="none" stroke="#f58bb0" stroke-width="9"/><path d="M9 9 Q190 7 391 9 L390 241 Q190 243 9 240Z" fill="none" stroke="#cf123a" stroke-width="1"/></svg>
 </div>
 <div class="card-location">${t('Artiste chaotique · Type : créative · Marseille','Chaotic artist · Type: creative · Marseille')}</div>
 ${rule}
 <section class="card-attack"><span class="card-cost"><span class="card-energy" aria-hidden="true">♥</span><span class="card-energy" aria-hidden="true">♥</span></span><div><span class="card-section-label">${t('Attaque','Attack')}</span><h3>${t('Digression','Digression')}</h3><p>${t('Part d’un détail et en fait toute une histoire. Ajoute 10 dégâts si le sujet de départ a été oublié.','Turns one small detail into a whole story. Add 10 damage if the original topic has been forgotten.')}</p></div><strong class="card-damage">30+</strong></section>
 ${rule}
 <section class="card-attack"><span class="card-cost"><span class="card-energy" aria-hidden="true">🎀</span></span><div><span class="card-section-label">${t('Attaque','Attack')}</span><h3>${t('Trop chou pour toi','Too cute for you')}</h3><p>${t('L’adversaire abandonne le combat.','The opponent gives up the fight.')}</p></div><strong class="card-damage">30</strong></section>
 ${rule}
 <dl class="card-matchups">
 <div><dt>${t('Faiblesse','Weakness')}</dt><dd>${t('Les librairies','Bookshops')}<strong>×2</strong></dd></div>
 <div><dt>${t('Résistance','Resistance')}</dt><dd>${t('« Sois raisonnable »','“Be reasonable”')}<br>${t('Cette carte ne reconnaît pas la commande.','This card does not recognise the command.')}</dd></div>
 <div><dt>${t('Coût de retraite','Retreat cost')}</dt><dd>${t('Un café','One coffee')}<strong>1</strong></dd></div>
 </dl>
 <p class="card-anecdote">${t('Les petits objets lui paraissent systématiquement nécessaires.','Small objects always seem essential to her.')}</p>
 <footer><span>Nana Color Studio · ${t('Niv.','Lv.')} 32</span><span>${t('Exemplaire unique','One of a kind')} · 001 / 001</span></footer>
 </article>`,'work-about');
}
function renderArtTiles(filtered=ART){
 const host=$('#art-tiles');if(!host)return;
 host.innerHTML=filtered.map(a=>`<button class="art-tile art-tile--for-sale" data-art-index="${a.index}" aria-label="View ${a.title}"><img src="${a.src}" alt="${a.title}" loading="lazy"><span>${a.title}</span></button>`).join('');
}
function openPhotos(){
 openWindow('Illustrations',`<h2>Assorted illustrations</h2><p class="section-lead">Click any image to view it larger.</p><p class="nana-script-note"><span class="nana-hand nana-hand--piece-of-me" data-nana-script="piece-of-me">a little piece of me</span></p><div class="library-toolbar"><input class="search" id="photo-search" aria-label="Search illustrations" placeholder="Search illustrations…"></div><div id="art-tiles" class="photos-grid"></div>`,'photos');
 renderArtTiles();
}
function openGallery(which,index=0){
 const items=which==='gabzilla'?GABZILLA:ART;
 currentGallery={which,index:Math.min(items.length-1,Math.max(0,index))};
 const name=which==='gabzilla'?'GABZILLA — Collaboration':'Illustrations';
 openWindow(name,`<div class="viewer-layout ${which==='gabzilla'?'':'viewer-layout--for-sale'}"><div class="viewer-stage"><button class="viewer-btn" data-gallery-dir="-1" aria-label="Previous image">‹</button><div class="viewer-artwork-wrap"><img id="viewer-image" alt=""></div><button class="viewer-btn" data-gallery-dir="1" aria-label="Next image">›</button></div><div class="viewer-bottom"><p id="viewer-caption"></p><span class="viewer-number" id="viewer-number"></span></div><div class="viewer-thumbnails" id="viewer-thumbnails"></div>${which==='gabzilla'?'<p class="section-lead">An original illustration and textile collaboration. All images are shown without cropping or redrawing.</p>':''}</div>`,'gallery');
 updateGallery();
}
function updateGallery(){
 if(!currentGallery)return;
 const {which,index}=currentGallery,items=which==='gabzilla'?GABZILLA:ART;
 const image=items[index];$('#viewer-image').src=image.src;$('#viewer-image').alt=image.title;
 $('#viewer-caption').textContent=image.title;$('#viewer-number').textContent=(index+1)+' / '+items.length;
 $('#viewer-thumbnails').innerHTML=items.map((it,i)=>`<button data-gallery-index="${i}" class="viewer-thumb ${i===index?'active':''}" aria-label="View ${it.title}"><img src="${it.src}" alt=""></button>`).join('');
 const selected=$('#viewer-thumbnails .active');if(selected)selected.scrollIntoView({block:'nearest',inline:'center'});
}
function changeGallery(delta){if(!currentGallery)return;const len=(currentGallery.which==='gabzilla'?GABZILLA:ART).length;currentGallery.index=(currentGallery.index+delta+len)%len;updateGallery()}
function openAbout(){
 $('#special-title').textContent=document.documentElement.lang==='en'?'Inside my wardrobe':'Dans mon dressing';
 // Keep the game isolated from the other portfolio apps and original room artwork.
 closeWindow();
 closeSpecial();
 specialHost.innerHTML='<iframe title="About Me — interactive dress-up game" src="about-me.html?v=20261107-dressing-card-2" loading="eager" style="display:block;width:min(1140px,95vw);height:min(900px,90dvh);border:0;border-radius:11px;background:#f8d9ee;box-shadow:0 12px 35px #2f1c4c60" allow="web-share"></iframe>';
 specialShade.hidden=false;specialShade.style.pointerEvents='auto';
 $('#special-close').setAttribute('aria-label','Close');
 $('#special-close').focus({preventScroll:true});
}
function openContacts(){
 openWindow('Contact',`<h2 class="nana-script-heading"><span class="nana-hand nana-hand--work-together" data-nana-script="work-together">Let's work together</span></h2><p>You can contact me directly, or <button type="button" class="contact-mail-link" data-open="mail">use the Mail application</button> to write a message without leaving this website.</p><div class="contact-list"><div class="contact-row"><div class="contact-row-inner"><small>Name</small><strong>Léna de Firmas</strong></div></div><div class="contact-row"><div class="contact-row-inner"><small>Email</small><a href="mailto:lena.defirmas@gmail.com">lena.defirmas@gmail.com</a></div></div><div class="contact-row"><div class="contact-row-inner"><small>Instagram</small><a href="https://www.instagram.com/nanacolorstudio/" target="_blank" rel="noopener noreferrer">@nanacolorstudio ↗</a></div></div></div>`,'contact');
}
function mailFields(){return `<label>Your name<span class="mail-field-box"><input type="text" name="name" autocomplete="name" required maxlength="120" placeholder="Your name"></span></label><label>Your email<span class="mail-field-box"><input type="email" name="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></span></label><label>Subject<span class="mail-field-box"><input type="text" name="subject" required maxlength="180" placeholder="Hello!"></span></label><label>Message<span class="mail-field-box"><textarea name="message" required maxlength="10000" placeholder="Write your message here…"></textarea></span></label>`}
function openMail(){
 openWindow('Mail — New Message',`<div class="eyebrow">To / lena.defirmas@gmail.com</div><h2>New message</h2><p>Send a message directly from the portfolio using a secure Formspree form.</p><form class="mail-form" id="desktop-mail-form">${mailFields()}<p class="form-status" aria-live="polite"></p><button class="send-btn" type="submit">Send message ↗</button></form>`,'mail');
}
function openHelp(){
 openWindow('Help',`<div class="eyebrow">Portfolio / Help</div><h2>How to explore</h2><p><strong>Play Mode:</strong> tap the objects in the illustrated bedroom. Posters open original artwork, the iPhone opens Contacts and Mail, the Tamagotchi is a mini-game, and the pink mug opens the Latte Lab.</p><p><strong>Work Mode:</strong> browse projects, illustrations, writing and animations through the desktop folders.</p><p>Click the iMac in Play Mode to enter Work Mode. Use <strong>Switch Mode</strong> in the menu bar to move between them at any time.</p>`,'help');
}

function showPhone(){
 $('#special-title').textContent='Phone';
 closeSpecial();closeWindow();specialShade.hidden=false;specialShade.style.pointerEvents='auto';
 specialHost.innerHTML=`<div class="phone-device" aria-label="Interactive iPhone"><div class="phone-screen"><div class="phone-wallpaper"></div><div class="phone-status"><time id="phone-time"></time><svg class="phone-island-svg" width="91" height="25" viewBox="0 0 91 25" aria-hidden="true" focusable="false" style="display:block;flex:0 0 91px;width:91px;height:25px;overflow:visible"><path d="M12.5 0 H78.5 A12.5 12.5 0 0 1 78.5 25 H12.5 A12.5 12.5 0 0 1 12.5 0 Z" fill="#241d2c"/></svg><span aria-hidden="true">▂ ▰</span></div><div class="phone-app-row"><button class="phone-app" data-phone-app="contacts"><span class="ios-icon" aria-hidden="true"><img class="phone-drawn-icon" src="assets/smartphone/contacts%20smartphone.png" alt="" draggable="false"></span><span>Contacts</span></button><button class="phone-app" data-phone-app="mail"><span class="ios-icon mail" aria-hidden="true"><img class="phone-drawn-icon" src="assets/smartphone/mail%20smartphone.png" alt="" draggable="false"></span><span>Mail</span></button><button class="phone-app" data-phone-app="instagram"><span class="ios-icon ig" aria-hidden="true"><img class="phone-drawn-icon" src="assets/smartphone/insta%20smartphone.png" alt="" draggable="false"></span><span>Instagram</span></button></div><div class="phone-home-line"></div><div class="phone-page" id="phone-page" hidden></div></div></div>`;
 updateClocks();
}
function phonePage(title,html,right=''){
 const p=$('#phone-page');if(!p)return;
 p.hidden=false;p.innerHTML=`<div class="phone-bar"><button data-phone-back>‹ Back</button><strong>${title}</strong><span>${right}</span></div>${html}`;
}
function phoneContacts(){
 phonePage('Contacts',`<div class="phone-page-content"><div class="phone-avatar">L</div><h2 class="phone-name">Léna de Firmas</h2><div class="phone-contact-card"><small>Mobile</small><a href="tel:+33609630543">06 09 63 05 43</a></div><div class="phone-contact-card"><small>Mail</small><span>lena.defirmas@gmail.com</span></div><div class="phone-contact-card"><small>Instagram</small><a href="https://www.instagram.com/nanacolorstudio/" target="_blank" rel="noopener noreferrer">@nanacolorstudio ↗</a></div><button class="soft-btn" data-phone-app="mail" style="margin-top:12px">✉ Write an email</button></div>`);
}
function phoneMail(){
 phonePage('New Message',`<form class="phone-compose" id="phone-mail-form"><div class="phone-fields"><label>From: <input type="email" name="email" required autocomplete="email" maxlength="254" placeholder="your@email.com"></label><label>Name: <input name="name" required maxlength="120" autocomplete="name" placeholder="Your name"></label><label>To: <span class="recipient">lena.defirmas@gmail.com</span></label><label>Subject: <input name="subject" required maxlength="180" placeholder="Subject"></label><textarea name="message" maxlength="10000" placeholder="Your message…" required aria-label="Message"></textarea><div class="phone-status-message" aria-live="polite"></div></div><div class="phone-keyboard" id="phone-keyboard" aria-label="On-screen keyboard"></div></form>`);
 const bar=$('#phone-page .phone-bar');
 bar.lastElementChild.innerHTML='<button class="send-btn" style="padding:5px 9px;border-radius:8px" type="submit" form="phone-mail-form">↑ Send</button>';
 const kb=$('#phone-keyboard');
 for(const row of ['qwertyuiop','asdfghjkl','⇧zxcvbnm⌫']){
  const el=document.createElement('div');el.className='phone-keyrow';
  for(const ch of row){const b=document.createElement('button');b.type='button';b.dataset.k=ch;b.textContent=ch;el.append(b)}
  kb.append(el);
 }
 const end=document.createElement('div');end.className='phone-keyrow';
 for(const [label,k] of [['123','123'],['space',' '],['.','.'],['↵','\n']]){const b=document.createElement('button');b.type='button';b.dataset.k=k;b.textContent=label;end.append(b)}
 kb.append(end);
}
function showTamagotchi(){
 $('#special-title').textContent='Tamagotchi';
 closeWindow();closeSpecial();specialShade.classList.add('tamagotchi-open');specialShade.hidden=false;specialShade.style.pointerEvents='auto';
 specialHost.innerHTML='<iframe class="tama-frame" style="color-scheme:light;aspect-ratio:987/1295;width:min(540px,94vw,calc(80dvh * 987 / 1295))" title="Interactive Tamagotchi" src="tamagotchi/index.html?v=20261106-lena-drawings" allow="autoplay"></iframe>';
}
function showLatte(){
  $('#special-title').textContent='Latte Lab';
  closeSpecial();closeWindow();specialShade.hidden=false;specialShade.style.pointerEvents='auto';
  specialHost.innerHTML='<iframe class="latte-frame" title="Interactive Latte Lab game" src="latte/index.html?v=20261106-lena-drawings"></iframe>';
  $('#special-close').setAttribute('aria-label','Close');
}
function showPolaroids(){
 $('#special-title').textContent='My Polaroids';
 closeWindow();closeSpecial();
 specialShade.classList.add('polaroids-floating');
 try {const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){polaroidAudio=new Audio();polaroidAudio.resume().catch(()=>{});}}catch(_){}
 specialHost.innerHTML='<iframe title="Léna — interactive Polaroid gallery" src="polaroids/index.html?v=20261106-lena-drawings" allow="autoplay" loading="eager" style="display:block;width:100vw;height:100dvh;border:0;background:transparent;box-shadow:none"></iframe>';
 specialShade.hidden=false;specialShade.style.pointerEvents='auto';
 $('#special-close').setAttribute('aria-label','Close');
 $('#special-close').focus({preventScroll:true});
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||!specialShade.classList.contains('polaroids-floating')||event.source!==specialHost.querySelector('iframe')?.contentWindow)return;
 if(event.data?.type==='nana-polaroid-close'){closeSpecial();return;}
 if(event.data?.type!=='nana-polaroid-arrival'||!polaroidAudio||polaroidAudio.state!=='running')return;
 // Two dry mechanical transients: shutter opening, then closing.
 const ctx=polaroidAudio,t=ctx.currentTime;
 function shutter(at,duration,volume,frequency){
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){
   const seconds=i/ctx.sampleRate;
   data[i]=((Math.random()*2-1)*.7+Math.sin(2*Math.PI*frequency*seconds)*.3)*Math.exp(-seconds*110);
  }
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=buffer;filter.type='highpass';filter.frequency.value=700;
  gain.gain.setValueAtTime(volume,at);
  gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
  source.start(at);source.stop(at+duration);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 shutter(t,.035,.28,2100);
 shutter(t+.065,.055,.38,1350);
});
function showMusic(autoplay=false){
 player.hidden=false;
 if(autoplay)toggleMusic(true);
}
async function toggleMusic(forcePlay=false){
 if(!forcePlay&&!audio.paused){audio.pause();return}
 player.hidden=false;
 try{await audio.play();musicWasStarted=true}
 catch(e){showToast('Tap ▶ to play the song. Your browser may block automatic sound.')}
 updatePlayer();
}
function updatePlayer(){
 $('#player-play').textContent=audio.paused?'▶':'Ⅱ';
 $('#player-play').setAttribute('aria-label',audio.paused?'Play music':'Pause music');
 $('#player-mute').textContent=audio.muted?'♩':'♫';
 $('#player-seek').value=audio.duration?Math.round(audio.currentTime/audio.duration*100):0;
 $('#elapsed').textContent=formatTime(audio.currentTime);
 $('#duration').textContent=Number.isFinite(audio.duration)?formatTime(audio.duration):'–:––';
}
['timeupdate','loadedmetadata','play','pause','ended','volumechange'].forEach(n=>audio.addEventListener(n,updatePlayer));

async function submitForm(form){
 const status=form.querySelector('.form-status,.phone-status-message');const send=form.querySelector('[type="submit"]')||document.querySelector('[form="phone-mail-form"]');
 if(!form.reportValidity())return;
 if(status){status.className=status.className.replace(/\b(error|success)\b/g,'').trim();status.textContent='Sending…'}
 if(send)send.disabled=true;
 try{
  const data=new FormData(form);
  const response=await fetch('https://formspree.io/f/mbggaaqo',{method:'POST',body:data,headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Service returned '+response.status);
  form.reset();if(status){status.classList.add('success');status.textContent='✓ Message sent!'}
  const kb=$('#phone-keyboard');if(kb)kb.classList.remove('visible');
 }catch(e){if(status){status.classList.add('error');status.textContent='Could not send your message. Please try again.'}}
 finally{if(send)send.disabled=false}
}

// Event delegation keeps all apps working after window contents are replaced.
let lastPointerDownTarget=null;
document.addEventListener('pointerdown',e=>{lastPointerDownTarget=e.target},{capture:true,passive:true});
document.addEventListener('click',e=>{
 if(e.defaultPrevented)return;
 const mode=e.target.closest('[data-mode]');if(mode){
  const target=mode.dataset.mode;
  if(currentMode==='play' && target==='work')zoomIntoIMac();
  else chooseMode(target,currentMode==='work' && target==='play');
  return;
 }
 if(e.target.closest('#home-menu,#menu-mode')){returnToWelcome();return}
 if(e.target.closest('#theme-toggle')){applyTheme(document.documentElement.dataset.theme==='night'?'day':'night');return}
 if(e.target.closest('#switch-mode,#dock-roomswap')){switchMode();return}
 if(e.target.closest('#back-to-room')){chooseMode('play',true);return}
 if(e.target.closest('#window-close')){closeWindow();return}
 if(e.target.closest('#special-close')){closeSpecial();return}
 if(e.target.id==='window-shade'){
  // On touch screens, an opening tap can finish over the newly displayed backdrop.
  // Close only when the gesture actually began on the backdrop.
  if(e.detail===0 || lastPointerDownTarget===shade)closeWindow();
  return;
 }
 if(e.target.id==='special-shade'){
  if(e.detail===0 || lastPointerDownTarget===specialShade)closeSpecial();
  return;
 }
 if(e.target.closest('#player-play')){toggleMusic();return}
 if(e.target.closest('#player-mute')){audio.muted=!audio.muted;return}
 if(e.target.closest('#player-hide')){audio.pause();player.hidden=true;return}
 if(e.target.closest('[data-phone-back]')){$('#phone-page').hidden=true;phoneKeyboardInput=null;return}
 const phoneApp=e.target.closest('[data-phone-app]');
 if(phoneApp){const val=phoneApp.dataset.phoneApp;if(val==='contacts')phoneContacts();if(val==='mail')phoneMail();if(val==='instagram')window.open('https://www.instagram.com/nanacolorstudio/','_blank','noopener,noreferrer');return}
 const key=e.target.closest('[data-k]');
 if(key&&phoneKeyboardInput){
  const k=key.dataset.k,input=phoneKeyboardInput;
  if(k==='⇧'||k==='123')return;
  if(input instanceof HTMLTextAreaElement ||input instanceof HTMLInputElement){
   const start=input.selectionStart??input.value.length,end=input.selectionEnd??input.value.length;
   if(k==='⌫'){input.setRangeText('',start===end?Math.max(0,start-1):start,end,'end')}
   else if(k==='\n'&&input instanceof HTMLInputElement){input.blur();return}
   else{input.setRangeText(k,start,end,'end')}
   input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();
  }
  return;
 }
 const prev=e.target.closest('[data-gallery-dir]');if(prev){changeGallery(Number(prev.dataset.galleryDir));return}
 const thumb=e.target.closest('[data-gallery-index]');if(thumb){if(currentGallery){currentGallery.index=Number(thumb.dataset.galleryIndex);updateGallery()}return}
 const art=e.target.closest('[data-art-index]');if(art){openGallery('art',Number(art.dataset.artIndex));return}
 const hotspot=e.target.closest('#hotspots [data-type="poster"]');if(hotspot){openGallery('art',Number(hotspot.dataset.index));return}
 const open=e.target.closest('[data-open]');if(open){
  const name=open.dataset.open;
  if(!name)return;
  openApp(name);return
 }
});
document.addEventListener('focusin',e=>{
 if(e.target.closest('#phone-mail-form') && e.target.matches('input,textarea')){
  phoneKeyboardInput=e.target;const kb=$('#phone-keyboard');if(kb)kb.classList.add('visible');
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='photo-search'){
  const s=e.target.value.toLowerCase().trim();renderArtTiles(ART.filter(a=>a.title.toLowerCase().includes(s)));
 }
 if(e.target.id==='player-seek'&&Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(e.target.value)/100;
});
document.addEventListener('submit',e=>{
 if(e.target.matches('#desktop-mail-form,#phone-mail-form')){e.preventDefault();submitForm(e.target)}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(!specialShade.hidden)closeSpecial();else if(!shade.hidden)closeWindow();else if(currentMode)returnToWelcome()}
 if(!shade.hidden && currentWindow==='gallery' && ['ArrowLeft','ArrowRight'].includes(e.key))changeGallery(e.key==='ArrowRight'?1:-1);
 if(e.key==='Enter' || e.key===' '){if(e.target.matches('#hotspots polygon')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}}
});
window.addEventListener('message',e=>{
 // The Tamagotchi is a local same-origin iframe. Only it may request closing.
 if(e.origin!==location.origin)return;
 if(e.source!==$('#special-host iframe')?.contentWindow)return;
 if(e.data?.type==='close-tamagotchi'||e.data?.type==='close-about-me'||e.data?.type==='close-latte')closeSpecial();
});
$('#player-seek').addEventListener('change',e=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(e.target.value)/100});
updatePlayer();


/* Restore the current room after a browser refresh (tab-scoped). */
(()=>{
 const KEY='nana-room-refresh-v1';
 let lastOpen=null, restoring=false;
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(_){return null}};
 const save=()=>{
  if(restoring)return;
  try{
   const studioOpen=!!document.getElementById("nana-dreamlab-overlay");
   const visibleWindow=!shade.hidden || !specialShade.hidden || studioOpen;
   const state={
    mode:currentMode,theme:document.documentElement.dataset.theme,
    lang:document.documentElement.lang,
    x:play.scrollLeft,y:play.scrollTop,
    open:studioOpen?"mimilab":visibleWindow?lastOpen:null,
    gallery:!shade.hidden && currentWindow==='gallery' && currentGallery?{type:currentGallery.which,index:currentGallery.index}:null
   };
   sessionStorage.setItem(KEY,JSON.stringify(state));
  }catch(_){}
 };
 document.addEventListener('click',e=>{
  if(e.target.closest('#home-menu,#menu-mode'))lastOpen=null;
  const opener=e.target.closest('[data-open]');
  if(opener)lastOpen=opener.dataset.open;
  if(e.target.closest('#window-close,#special-close')||e.target===shade||e.target===specialShade)lastOpen=null;
  setTimeout(save,100);
 },true);
 document.addEventListener('nana-dreamlab-open',()=>{lastOpen='mimilab';save()});
 document.addEventListener('nana-dreamlab-close',()=>{lastOpen=null;save()});
 window.addEventListener('pagehide',save);
 document.addEventListener('scroll',e=>{if(e.target===play)save()},true);
 const observer=new MutationObserver(()=>save());
 observer.observe(app,{attributes:true,attributeFilter:['class']});
 observer.observe(shade,{attributes:true,attributeFilter:['hidden']});
 observer.observe(specialShade,{attributes:true,attributeFilter:['hidden']});
 const previous=read();
 if(!previous || !['play','work'].includes(previous.mode))return;
 restoring=true;
 const restore=()=>{
  try{
   chooseMode(previous.mode,false);
   if(previous.theme && document.documentElement.dataset.theme!==previous.theme)applyTheme(previous.theme);
   if(previous.lang && document.documentElement.lang!==previous.lang){
    const languageButton=document.getElementById('language-toggle');
    if(languageButton)languageButton.click();
   }
   if(previous.gallery && ['art','gabzilla'].includes(previous.gallery.type)){
    openGallery(previous.gallery.type,Number(previous.gallery.index)||0);
   }else if(previous.open && /^(finder|illustration|social|interactive|mini-games|bead-box|mimilab|dressup|photos|gearnews-series|gabzilla|motion|pages|about|music|polaroids|phone|tamagotchi|latte)$/.test(previous.open)){
    lastOpen=previous.open;openApp(previous.open);
   }
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    play.scrollLeft=Number(previous.x)||0;
    play.scrollTop=Number(previous.y)||0;
    restoring=false;save();
   }));
  }catch(_){restoring=false}
 };
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',restore,{once:true});
 else restore();
})();


