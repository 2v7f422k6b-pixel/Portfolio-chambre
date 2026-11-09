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
  // Keep the original ID for existing links; display the re-uploaded artwork.
  ['The Pink Castle','pink-castle.jpg','assets/previews/photos/IMG_1458.webp'],
  ['Snowy City','snow-city.jpg'],
  ['Still Life','still-life.jpg'],
  ['Motorcycle','motorbike.jpg'],
  ['Studio','synth-portrait.jpg'],
  ['Marseille','marseille.jpg'],
  ['Marseille Emblem','marseille-emblem.jpg'],
  ['Swans and Lotus','swans-lotus.jpg']
].map(([title,filename,preview],index)=>({title,filename,src:preview||'assets/previews/photos/'+filename.replace(/\.jpe?g$/i,'.webp'),index}));
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
 const games=[["bead-box","Boîte à perles","Bead Box","Compose ton bijou de téléphone avec des perles, des lettres et des petits pendentifs.","Make a phone charm with beads, letters and tiny pendants."],["mimilab","Mimilab 3","Mimilab 3","Joue, compose et télécharge ta musique avec le clavier et le mini DAW.","Play, compose and download your music with the keyboard and mini DAW."],["coloring","Coloriage","Coloring Book","Colorie cinq de mes dessins au pinceau ou au pot de peinture.","Color five of my drawings using the paint bucket and freehand brush."],["tamagotchi","Tamagotchi","Tamagotchi","Prends un moment pour prendre soin de toi.","Take a little time to care for yourself."],["latte","Atelier latte","Latte Lab","Prépare ton café et dessine un cœur dans la mousse.","Make your own tiny coffee and finish it with a foam heart."],["do-nothing","Le club du rien","Do Nothing Club","Offre-toi une minute de pause. Le monde peut attendre.","Take a minute to rest. The world can wait."],["word-lab","Le Laboratoire des mots","Word Lab","Assemble des mots et télécharge ton poème.","Arrange words and download your poem."]];
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
 const cardRules=[
 'M1 4 L19 3.6 L43 4.2 L72 3.8 L98 4.5 L124 4.1 L159 4.4 L187 3.7 L213 4 L246 3.5 L274 4.2 L309 3.9 L338 4.4 L365 3.8 L399 4',
 'M1 3.6 L28 4.1 L57 3.7 L84 4.2 L119 3.8 L151 4.5 L178 4.1 L207 4.4 L237 3.9 L268 4.3 L298 3.6 L329 4 L361 3.7 L399 4.2',
 'M1 4.3 L23 3.9 L51 4.5 L88 4.1 L114 3.7 L144 4.2 L176 3.8 L203 4.3 L233 4 L261 4.5 L291 4.1 L323 3.8 L352 4.3 L378 3.7 L399 4'];
 let cardRuleIndex=0;
 const rule=()=>'<svg class="nana-card-rule" viewBox="0 0 400 8" preserveAspectRatio="none" aria-hidden="true"><path d="'+cardRules[cardRuleIndex++]+'" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/></svg>';
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

 html body #window .nana-profile-card{position:relative;width:min(440px,calc((100dvh - 160px)*.63),100%);aspect-ratio:63/100;box-sizing:border-box;margin:0 auto;padding:7.5% 8% 7.5%;display:flex;flex-direction:column;container-type:inline-size;color:#cf123a;background:#ffd4e4!important;border-radius:5% / 3.15%!important;overflow:hidden;isolation:isolate;font-family:inherit}
 html body #window .nana-profile-card::before{content:none!important}
 .nana-profile-card>.card-outline{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3}
 .nana-profile-card .card-edition{font-size:2.6cqw;font-weight:700;line-height:1.1}
 .nana-profile-card header{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 1cqw}
 html body #window .nana-profile-card h2{font-size:7.8cqw!important;font-weight:bold;line-height:1.05;margin:0!important}
 .nana-profile-card .card-hp{display:flex;align-items:center;gap:1.5cqw;font-size:5.5cqw;font-weight:bold;white-space:nowrap}
 .nana-profile-card .card-recharge{text-align:right;font-size:2.5cqw;line-height:1.1;margin:-.4cqw 0 1.8cqw}
 html body #window .nana-profile-art{flex:0 0 auto;aspect-ratio:1536/1151;position:relative;width:100%;background:#c4b4ef!important;overflow:visible;border-radius:0!important}
 .nana-profile-art img{display:block;position:static;width:100%;height:auto;max-width:100%;object-fit:contain}
 .nana-profile-art .card-art-frame{position:absolute;inset:-2%;width:104%;height:104%;pointer-events:none}
 .nana-profile-card .card-location{background:#ffc4d8!important;font-weight:bold;font-style:italic;text-align:center;font-size:2.55cqw;line-height:1.3;padding:.7cqw 1cqw;margin:1cqw 0 1.5cqw}
 .nana-profile-card .card-attack{display:grid;grid-template-columns:18% minmax(0,1fr) auto;gap:2cqw;align-items:center;flex:1;padding:1.5cqw 0;margin:0}
 html body #window .nana-profile-card h3{font-size:4.5cqw!important;line-height:1.05;margin:0 0 1cqw!important;font-weight:bold}
 html body #window .nana-profile-card p{font-size:3cqw;line-height:1.25;margin:0}
 .nana-profile-card .card-damage{font-size:7cqw;font-weight:normal}
 .nana-profile-card .card-section-label{display:none}
 .nana-card-rule{display:block;width:100%;height:4px;flex:0 0 4px;pointer-events:none}
 .nana-profile-card .card-energy{display:inline-flex;align-items:center;justify-content:center;width:6.6cqw;height:6.6cqw;flex:0 0 auto;border-radius:0!important;padding:1px;background:linear-gradient(#fff4e8,#fff4e8) content-box!important;border:3px solid transparent!important;border-image:url("assets/drawn-ui/cadre_bouton.png") 12 / 3px / 0 stretch!important;box-sizing:border-box}
 .nana-profile-card .card-energy img{position:static;width:75%;height:75%;object-fit:contain}
 .nana-profile-card .card-cost{display:flex;flex-wrap:nowrap;gap:.6cqw;justify-content:center;align-items:center}
 .nana-profile-card .card-matchups{display:grid;grid-template-columns:1fr 1.7fr 1fr;gap:2cqw;padding:1.5cqw 0;margin:0;text-align:center}
 .nana-profile-card .card-matchups dt{font-size:3cqw;font-weight:bold;margin:0 0 .5cqw}
 .nana-profile-card .card-matchups dd{font-size:2.9cqw;line-height:1.2;margin:0}
 .nana-profile-card .card-matchups strong{display:inline;font-size:3.5cqw;margin-left:1cqw}
 html body #window .nana-profile-card .card-anecdote{font-size:2.9cqw;font-weight:bold;font-style:italic;line-height:1.25;padding:1.6cqw 2cqw;background:#ffe5ed!important;border-radius:2px 4px 2px 3px!important}
 .nana-profile-card footer{flex:0 0 auto;display:flex;justify-content:space-between;gap:2cqw;font-size:2.2cqw;line-height:1.2;padding-top:1.3cqw}
.nana-profile-card::after{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;background:linear-gradient(115deg,transparent 8%,rgba(98,211,255,.5) 23%,rgba(255,235,143,.45) 32%,rgba(255,255,255,.8) 37%,rgba(255,126,219,.48) 43%,rgba(150,130,255,.5) 51%,rgba(121,255,212,.4) 59%,transparent 73%);background-size:280% 100%;mix-blend-mode:overlay;opacity:.78;animation:nana-card-foil 10s ease-in-out infinite}
 @keyframes nana-card-foil{0%,100%{background-position:100% 50%}50%{background-position:0% 50%}}
 @media(prefers-reduced-motion:reduce){.nana-profile-card::after{animation:none;background-position:50% 50%}}
</style><article class="nana-profile-card" data-no-translate aria-label="${t('Carte de personnage de Léna','Léna’s character card')}">
 <svg class="card-outline" viewBox="0 0 630 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M34 15 Q170 13 315 15 T596 15 Q615 15 615 34 Q613 270 615 500 T615 966 Q615 985 596 985 Q460 987 315 985 T34 985 Q15 985 15 966 Q17 730 15 500 T15 34 Q15 15 34 15Z" fill="none" stroke="#f58bb0" stroke-width="24"/><path d="M35 28 Q170 26 315 28 T595 28 Q602 28 602 36 Q600 270 602 500 T602 964 Q602 972 594 972 Q460 974 315 972 T36 972 Q28 972 28 964 Q30 730 28 500 T28 36 Q28 28 35 28Z" fill="none" stroke="#cf123a" stroke-width="1.7"/></svg>
 <div class="card-edition">${t('Édition limitée','Limited edition')}</div>
 <header><h2>Léna</h2><span class="card-hp">40 ${t('PV','HP')}<span class="card-energy" aria-hidden="true"><img src="assets/drawn-ui/etoile_pleine.png" alt=""></span></span></header>
 <div class="card-recharge">${t('rechargeable au café','coffee-rechargeable')}</div>
 <div class="nana-profile-art" role="img" aria-label="${t('Personnage illustré de Léna','Illustrated character of Léna')}">
 <img src="assets/dressing-lena/lena-card-illustration-v2.jpeg" alt="">
 <svg class="card-art-frame" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H400V300H0Z M7 7 Q100 5 200 7 T393 7 Q395 75 393 150 T393 293 Q300 295 200 293 T7 293 Q5 225 7 150 T7 7Z" fill="#ffd4e4" fill-rule="evenodd"/><path d="M7 7 Q100 5 200 7 T393 7 Q395 75 393 150 T393 293 Q300 295 200 293 T7 293 Q5 225 7 150 T7 7Z" fill="none" stroke="#cf123a" stroke-width="1.4"/></svg>
 </div>
 <div class="card-location">${t('Type : créative · Habitat : canapé','Type: creative · Habitat: sofa')}</div>
 ${rule()}
 <section class="card-attack"><span class="card-cost"><span class="card-energy" aria-hidden="true"><img src="assets/heart-lena.svg" alt=""></span><span class="card-energy" aria-hidden="true"><img src="assets/heart-lena.svg" alt=""></span></span><div><span class="card-section-label">${t('Attaque','Attack')}</span><h3>${t('Tunnel','Tunnel')}</h3><p>${t('Part d’un détail et en fait toute une histoire.<br>Ajoute 10 dégâts si le sujet de départ a été oublié.','Turns one small detail into a whole story.<br>Add 10 damage if the original topic has been forgotten.')}</p></div><strong class="card-damage">30+</strong></section>
 ${rule()}
 <section class="card-attack"><span class="card-cost"><span class="card-energy" aria-hidden="true"><img src="assets/drawn-ui/IMG_5523.png" alt=""></span></span><div><span class="card-section-label">${t('Attaque','Attack')}</span><h3>${t('Trop chou pour toi','Too cute for you')}</h3><p>${t('L’adversaire abandonne le combat.','The opponent gives up the fight.')}</p></div><strong class="card-damage">30</strong></section>
 ${rule()}
 <dl class="card-matchups">
 <div><dt>${t('Faiblesse','Weakness')}</dt><dd>${t('Les librairies','Bookshops')}<strong>×2</strong></dd></div>
 <div><dt>${t('Résistance','Resistance')}</dt><dd>${t('« Sois raisonnable »','“Be reasonable”')}<br>${t('Cette carte ne reconnaît pas<br>la commande.','This card does not recognise<br>the command.')}</dd></div>
 <div><dt>${t('Coût de retraite','Retreat cost')}</dt><dd>${t('Une sieste','One nap')}<strong>1</strong></dd></div>
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
function openAbout(outfit){
 $('#special-title').textContent=document.documentElement.lang==='en'?'Inside my wardrobe':'Dans mon dressing';
 // Keep the game isolated from the other portfolio apps and original room artwork.
 closeWindow();
 closeSpecial();
 specialHost.innerHTML='<iframe title="About Me — interactive dress-up game" src="about-me.html?v=20261109-exploration-patches'+(window.NanaProgress?.outfits.some(x=>x.id===outfit)?'&amp;outfit='+encodeURIComponent(outfit):'')+'" loading="eager" style="display:block;width:min(1140px,95vw);height:min(900px,90dvh);border:0;border-radius:11px;background:#f8d9ee;box-shadow:0 12px 35px #2f1c4c60" allow="web-share"></iframe>';
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
function helpContent(){
 const en=document.documentElement.lang==='en';
 const t=(fr,english)=>en?english:fr;
 const section=(title,body,expanded=false)=>`<details${expanded?' open':''}><summary><strong>${title}</strong></summary>${body}</details>`;
 return `<div data-no-translate class="help-guide">
 <div class="eyebrow">${t('Le petit guide de la chambre','A little room guide')}</div>
 <h2>${t('Entre, tu peux juste regarder.','Come in. You can just look around.')}</h2>
 <p>${t('C’est un portfolio dans une chambre : les objets ouvrent mes créations, des petits jeux ou des surprises. Tu peux tout explorer, ou aller directement à mes projets. Rien n’est obligatoire.','This is a portfolio inside a bedroom: objects open my work, little games or surprises. Explore freely or go straight to my projects. Everything is optional.')}</p>
 <p><button class="soft-btn" type="button" data-help-action="work">${t('Voir mes projets · Work','See my projects · Work')}</button> <button class="soft-btn" type="button" data-help-action="zones">${t('Repérer les objets cliquables','Find clickable objects')}</button></p>
 ${section(t('1 · Se déplacer et cliquer','1 · Move around and click'),`<p>${t('Sur téléphone ou tablette, fais glisser la chambre à gauche et à droite pour voir les autres coins. Sur ordinateur, survole les objets : un contour blanc signale ceux que tu peux ouvrir. Touche ou clique pour découvrir ce qu’ils cachent.','On a phone or tablet, swipe the room left and right to see its other corners. On a computer, hover over objects: a white outline shows what you can open. Tap or click to discover what is inside.')}</p><p>${t('Le bouton « Voir les zones » révèle les éléments cliquables. Tu peux ensuite masquer ces repères. La croix d’une fenêtre la ferme pour revenir à ta visite.','The “Show hotspots” button reveals clickable objects. You can hide these hints again. Close a window with its cross to return to your visit.')}</p>`,true)}
 ${section(t('2 · Play ou Work ?','2 · Play or Work?'),`<p><strong>Play</strong> — ${t('La chambre à explorer à ton rythme, avec ses illustrations, ses objets et ses mini-jeux.','Explore the room at your own pace, with its artwork, objects and mini-games.')}</p><p><strong>Work</strong> — ${t('Mes projets rangés dans des dossiers sur un bureau, pour accéder plus directement à mon travail. Clique sur l’iMac dans la chambre ou sur « Passer en mode Work » dans le menu. Tu peux revenir en Play à tout moment.','My projects organised in desktop folders for more direct access to my work. Click the iMac in the room or “Switch to Work Mode” in the menu. You can return to Play at any time.')}</p>`)}
 ${section(t('3 · Les mini-jeux','3 · Mini-games'),`<p>${t('La tasse ouvre l’atelier latte, le miroir le dressing, le Mimilab un atelier musical… Chaque activité explique ses commandes à l’ouverture. Tu peux essayer, quitter et continuer ta visite sans devoir tout terminer.','The mug opens the latte café, the mirror opens the wardrobe, and Mimilab opens a music studio… Each activity introduces its controls when opened. Try one, leave, and carry on exploring without having to finish everything.')}</p>`)}
 ${section(t('4 · Les écussons et les récompenses','4 · Patches and rewards'),`<p>${t('Les écussons marquent ta découverte de la chambre : un premier objet, puis 25 %, 50 %, 75 % et 100 % des zones explorées. Le pourcentage compte les endroits découverts, pas les jeux terminés.','Patches mark your exploration of the room: your first object, then 25%, 50%, 75% and 100% of its spots explored. This percentage counts places discovered, not games completed.')}</p><p>${t('Certaines découvertes ou actions débloquent aussi des vêtements, des accessoires ou des titres. Retrouve ta progression et les conditions de déblocage dans « Mon carnet ». Les écussons gagnés sont aussi disponibles dans le dressing.','Some discoveries or actions also unlock clothes, accessories or titles. Find your progress and unlock conditions in “My notebook”. Earned patches are also available in the wardrobe.')}</p><p><button class="soft-btn" type="button" data-help-action="notebook">${t('Ouvrir mon carnet','Open my notebook')}</button></p>`)}
 ${section(t('5 · Est-ce que ma progression est gardée ?','5 · Is my progress saved?'),`<p>${t('Tes découvertes et récompenses sont enregistrées dans ce navigateur, si le stockage est autorisé. Retrouve-les en revenant avec le même appareil et le même navigateur. Elles ne se synchronisent pas entre appareils ; effacer les données du site peut les supprimer.','Your discoveries and rewards are saved in this browser when storage is allowed. Return on the same device and browser to find them again. They do not sync between devices; clearing site data may remove them.')}</p>`)}
 <p><a href="#/liens">${t('Tous les liens du portfolio · accès direct','All portfolio links · direct access')}</a></p>
 </div>`;
}
function openHelp(){
 openWindow(document.documentElement.lang==='en'?'Help':'Aide',helpContent(),'help');
}
document.addEventListener('portfolio-language-change',()=>{
 if(currentWindow==='help'&&!shade.hidden){
  const opened=[...winContent.querySelectorAll('details')].map(el=>el.open);
  winTitle.textContent=document.documentElement.lang==='en'?'Help':'Aide';
  winContent.innerHTML=helpContent();
  winContent.querySelectorAll('details').forEach((el,i)=>el.open=opened[i]??el.open);
  window.nanaHydrate?.(winContent);
 }
});
document.addEventListener('click',event=>{
 const action=event.target.closest('[data-help-action]')?.dataset.helpAction;
 if(!action)return;
 if(action==='work'){chooseMode('work');return;}
 if(action==='notebook'){closeWindow();window.NanaJournal?.open();return;}
 if(action==='zones'){
  chooseMode('play');
  const guide=document.getElementById('hotspot-guide');
  if(guide&&guide.getAttribute('aria-pressed')!=='true')guide.click();
  guide?.focus({preventScroll:true});
 }
});

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
 specialHost.innerHTML='<iframe class="tama-frame" style="color-scheme:light;aspect-ratio:987/1295;width:min(540px,94vw,calc(80dvh * 987 / 1295))" title="Interactive Tamagotchi" src="tamagotchi/index.html?v=20261108-journal-1" allow="autoplay"></iframe>';
}
function showLatte(){
  $('#special-title').textContent='Latte Lab';
  closeSpecial();closeWindow();specialShade.hidden=false;specialShade.style.pointerEvents='auto';
  specialHost.innerHTML='<iframe class="latte-frame" title="Interactive Latte Lab game" src="latte/index.html?v=20261108-journal-1"></iframe>';
  $('#special-close').setAttribute('aria-label','Close');
}
function showPolaroids(){
 $('#special-title').textContent='My Polaroids';
 closeWindow();closeSpecial();
 specialShade.classList.add('polaroids-floating');
 try {const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){polaroidAudio=new Audio();polaroidAudio.resume().catch(()=>{});}}catch(_){}
 specialHost.innerHTML='<iframe title="Léna — interactive Polaroid gallery" src="polaroids/index.html?v=20261108-accessory-rewards" allow="autoplay" loading="eager" style="display:block;width:100vw;height:100dvh;border:0;background:transparent;box-shadow:none"></iframe>';
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


/* A single optional comic bubble points newcomers to Help without opening a dialog. */
(() => {
 'use strict';
 const help=document.getElementById('menu-help');
 if(!help)return;
 const key='nana-help-first-visit-v1';
 let dismissed=false;
 try{dismissed=localStorage.getItem(key)==='seen';}catch(_){}
 const style=document.createElement('style');
 style.textContent=`
 #nana-help-bubble{position:fixed;z-index:1300;width:min(230px,calc(100vw - 20px));height:82px;box-sizing:border-box;padding:23px 32px 13px 14px;color:#ff173b;font-family:"Nana Trace UI",sans-serif;}
 #nana-help-bubble[hidden]{display:none!important}
 #nana-help-bubble svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
 #nana-help-bubble path{fill:#fff2fc;stroke:#ff173b;stroke-width:1.8;stroke-linejoin:round}
 html[data-theme="night"] #nana-help-bubble path{fill:#e9b5ff}
 #nana-help-bubble button{position:relative;border:0;background:none;color:inherit;font:inherit;cursor:pointer;padding:0}
 #nana-help-bubble [data-first-help]{display:block;width:100%;height:100%;font-size:16px;line-height:1.3;text-align:center}
 #nana-help-bubble [data-first-dismiss]{position:absolute;right:8px;top:20px;width:24px;height:24px;padding:5px}
 #nana-help-bubble [data-first-dismiss] img{width:100%;height:100%;object-fit:contain}
 #nana-help-bubble button:focus-visible{outline:2px dotted currentColor;outline-offset:3px}
 `;
 document.head.append(style);
 const bubble=document.createElement('aside');
 bubble.id='nana-help-bubble';bubble.hidden=true;bubble.setAttribute('data-no-translate','');
 bubble.innerHTML='<svg viewBox="0 0 230 82" preserveAspectRatio="none" aria-hidden="true"><path/></svg><button type="button" data-first-help></button><button type="button" data-first-dismiss><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button>';
 document.body.append(bubble);
 const t=(fr,en)=>document.documentElement.lang==='en'?en:fr;
 function localize(){
  bubble.setAttribute('aria-label',t('Un petit coup de main','A little help'));
  bubble.querySelector('[data-first-help]').textContent=t('Première visite ?','First visit?');
  bubble.querySelector('[data-first-help]').setAttribute('aria-label',t('Première visite ? Ouvrir le guide','First visit? Open the guide'));
  bubble.querySelector('[data-first-dismiss]').setAttribute('aria-label',t('Masquer cette bulle','Dismiss this hint'));
  const caption=document.querySelector('.work-choice .tile-desc');
  if(caption){caption.setAttribute('data-no-translate','');caption.textContent=t('Accéder directement à mes projets','Go straight to my projects');}
 }
 function position(){
  if(bubble.hidden)return;
  const rect=help.getBoundingClientRect(),width=bubble.getBoundingClientRect().width;
  const left=Math.min(Math.max(10,rect.left-14),Math.max(10,innerWidth-width-10));
  bubble.style.left=left+'px';bubble.style.top=(rect.bottom+4)+'px';
  const tip=Math.max(18,Math.min(204,(rect.left+rect.width/2-left)*230/width));
  bubble.querySelector('path').setAttribute('d',`M 13 16 Q 7 17 7 26 L 6 65 Q 7 76 19 75 Q 116 78 213 75 Q 225 75 224 63 L 225 28 Q 225 17 214 17 L ${tip+16} 17 L ${tip} 2 L ${tip+3} 17 Q 60 15 13 16 Z`);
 }
 function dismiss(){dismissed=true;bubble.hidden=true;try{localStorage.setItem(key,'seen');}catch(_){}}
 function update(){
  const busy=!!document.querySelector('dialog[open],#window-shade:not([hidden]),#special-shade:not([hidden])');
  bubble.hidden=dismissed||!currentMode||busy||document.getElementById('desktop').hidden;
  if(!bubble.hidden){try{localStorage.setItem(key,'seen');}catch(_){}position();}
 }
 bubble.querySelector('[data-first-help]').addEventListener('click',()=>{dismiss();help.click();});
 bubble.querySelector('[data-first-dismiss]').addEventListener('click',dismiss);
 help.addEventListener('click',dismiss);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!bubble.hidden)dismiss();});
 document.addEventListener('portfolio-language-change',()=>{localize();position();});
 document.addEventListener('toggle',update,true);
 const observer=new MutationObserver(update);
 for(const element of [app,shade,specialShade,desktop])observer.observe(element,{attributes:true,attributeFilter:['class','hidden']});
 addEventListener('resize',position);
 addEventListener('storage',event=>{if(event.key===key&&event.newValue==='seen')dismiss();});
 localize();update();
})();

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
 if(location.hash.startsWith('#/') || new URLSearchParams(location.search).get('typewriterTest') === '1' || !previous || !['play','work'].includes(previous.mode))return;
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





