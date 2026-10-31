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
].map(([title,filename],index)=>({title,src:'assets/photos/'+filename,index}));
const GABZILLA = [
  {title:'Original illustration',src:'assets/gabzilla/illustration.jpeg'},
  {title:'Textile composition',src:'assets/gabzilla/composition.jpeg'},
  {title:'The collaboration',src:'assets/gabzilla/tshirt-porte.jpeg'}
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
 $('#kitty-time').textContent=hour+':'+min;
 const phoneClock=$('#phone-time');if(phoneClock)phoneClock.textContent=hour+':'+min;
}
updateClocks();setInterval(updateClocks,15000);

// Night mode crossfades between the two user-approved bedroom artworks.
// Hotspots and the live clock remain in exactly the same UI coordinates.
const THEME_KEY='nana-portfolio-theme';
function applyTheme(theme){
 const night=theme==='night';
 document.documentElement.dataset.theme=night?'night':'day';
 const toggle=$('#theme-toggle');
 if(toggle){
  toggle.setAttribute('aria-pressed',String(night));
  toggle.setAttribute('aria-label',night?'Enable day mode':'Enable night mode');
  toggle.title=night?'Switch to Day Mode':'Switch to Night Mode';
  toggle.querySelector('.theme-icon').textContent=night?'☀':'☾';
  toggle.querySelector('.theme-label').textContent=night?'Day Mode':'Night Mode';
 }
 try{localStorage.setItem(THEME_KEY,night?'night':'day')}catch(e){}
}
let savedTheme='day';
try{savedTheme=localStorage.getItem(THEME_KEY)||'day'}catch(e){}
applyTheme(savedTheme);

function chooseMode(mode,zoom=false){
 closeWindow();closeSpecial();
 currentMode=mode;app.className='mode-'+mode;
 welcome.hidden=true;desktop.hidden=false;
 play.hidden=mode!=='play';work.hidden=mode!=='work';
 $('#menu-mode').textContent=mode==='play'?'Play Mode':'Work Mode';
 $('#dock-finder').title='Finder';
 if(zoom){
  work.animate([{opacity:0,transform:'scale(.88)'},{opacity:1,transform:'scale(1)'}],{duration:600,easing:'cubic-bezier(.15,.7,.25,1)'});
 }
 updateClocks();
 if(mode==='work')openFinder();
}
function zoomIntoIMac(){
 if(currentMode!=='play'){chooseMode('work',true);return}
 const scene=$('#play-scene');
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){chooseMode('work',false);return}
 const anim=scene.animate([
  {transform:'scale(1)',opacity:1,filter:'blur(0)'},
  {transform:'scale(1.25)',opacity:1,filter:'blur(0)'},
  {transform:'scale(3.4)',opacity:.5,filter:'blur(3px)'}
 ],{duration:550,easing:'cubic-bezier(.55,.05,.45,1)',fill:'none'});
 anim.finished.then(()=>chooseMode('work',true)).catch(()=>chooseMode('work',true));
}
function returnToWelcome(){
 closeWindow();closeSpecial();audio.pause();player.hidden=true;
 desktop.hidden=true;welcome.hidden=false;app.className='mode-select';currentMode=null;
}
function switchMode(){if(currentMode)chooseMode(currentMode==='play'?'work':'play',true);else returnToWelcome()}
function showToast(message){
 const node=$('#toast');clearTimeout(toastTimer);node.textContent=message;node.hidden=false;
 toastTimer=setTimeout(()=>node.hidden=true,3000);
}

function closeWindow(){shade.hidden=true;currentWindow=null;win.classList.remove('expanded');winContent.innerHTML=''}
function closeSpecial(){specialShade.hidden=true;specialHost.innerHTML='';phoneKeyboardInput=null}
function openWindow(title,html,type='generic'){
 closeSpecial();currentWindow=type;winTitle.textContent=title;winContent.innerHTML=html;
 if(window.nanaHydrate)window.nanaHydrate(winContent);
 win.setAttribute('aria-modal',String(currentMode!=='work'));
 win.classList.remove('expanded');shade.hidden=false;
 $('#window-close').focus({preventScroll:true});
}
function openApp(name,index){
 switch(name){
  case 'work-zoom':zoomIntoIMac();break;
  case 'phone':showPhone();break;
  case 'tamagotchi':showTamagotchi();break;
  case 'music':showMusic(true);break;
  case 'clock':showToast('The Hello Kitty clock shows your local time: '+$('#kitty-time').textContent);break;
  case 'finder':openFinder();break;
  case 'illustration':openIllustrationProjects();break;
  case 'social':openSocialProjects();break;
  case 'interactive':openInteractiveProjects();break;
  case 'dressup':openAbout();break;
  case 'photos':openPhotos();break;
  case 'artwork':openGallery('art',index||0);break;
  case 'gabzilla':openGallery('gabzilla',0);break;
  case 'motion':openMotion();break;
  case 'pages':openPages();break;
  case 'about':currentMode==='work'?openWorkAbout():openAbout();break;
  case 'book':openBook();break;
  case 'mail':openMail();break;
  case 'contact':openContacts();break;
  case 'help':openHelp();break;
 }
}

function openFinder(){
 const cards=`<div class="project-grid atelier-project-grid">
   <button class="project-card" data-open="illustration"><img src="assets/photos/swans-lotus.jpg" alt="Original illustration with swans and lotus flowers"><strong>Illustration</strong><small>Drawings, visual storytelling & collaborations</small></button>
   <button class="project-card" data-open="motion"><span class="project-icon">✧</span><strong>Motion</strong><small>Animation & moving images</small></button>
   <button class="project-card" data-open="social"><span class="project-icon">♡</span><strong>Social Media</strong><small>Creative communication & community management</small></button>
   <button class="project-card" data-open="pages"><span class="project-icon">✎</span><strong>Editorial</strong><small>Articles, music & culture</small></button>
   <button class="project-card" data-open="interactive"><span class="project-icon">♥</span><strong>Interactive</strong><small>Illustrated stories, a dress-up game & this website</small></button>
   <button class="project-card" data-open="book"><span class="book-finder-cover">♡<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Interactive illustrated book · 66 pages</small></button>
  </div>`;
 openWindow('LÉNA ♡ PROJECTS',`<div class="eyebrow">♥ WORK MODE / PROJECTS</div><h2 class="nana-script-heading"><span class="nana-hand nana-hand--little-bit" data-nana-script="little-bit">A little bit of everything I create.</span></h2><p class="section-lead">Choose a category to explore my illustrated, moving and written worlds.</p>${cards}`,'finder');
}
function openIllustrationProjects(){
 openWindow('ILLUSTRATION',`<div class="eyebrow">♥ PROJECTS / ILLUSTRATION</div><h2>Illustration</h2><p class="section-lead">Illustrated stories, artworks and visual collaborations.</p><div class="project-grid">
 <button class="project-card" data-open="photos"><img src="assets/photos/swans-lotus.jpg" alt="Swans and lotus flowers illustration"><strong>Original illustrations</strong><small>Explore the gallery</small></button>
 <button class="project-card" data-open="gabzilla"><img src="assets/gabzilla/illustration.jpeg" alt="GABZILLA textile collaboration"><strong>GABZILLA</strong><small>Illustration · Textile collaboration</small></button>
 <button class="project-card" data-open="book"><span class="book-finder-cover">♡<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Illustrated book · 66 pages</small></button>
 </div>`,'illustration');
}
function openSocialProjects(){
 openWindow('SOCIAL MEDIA',`<div class="eyebrow">♥ PROJECTS / SOCIAL MEDIA</div><h2>Social media & community</h2><p class="section-lead">Creative content, storytelling and community building for music and artistic projects.</p>
 <div class="info-list">
 <div class="info-box"><small>01 / SYNTHS & MUSICAL EXPRESSION</small><strong>Expressive E</strong><p>Social media content, community management and product storytelling.</p></div>
 <div class="info-box"><small>02 / MUSIC</small><strong>Tomasz Bura Group</strong><p>Communication and community management for a jazz project.</p></div>
 <div class="info-box"><small>03 / MEDITATION & MUSIC</small><strong>Zorza</strong><p>Content creation and creative communication for a meditation project.</p></div>
 </div>`,'social');
}
function openInteractiveProjects(){
 openWindow('INTERACTIVE',`<div class="eyebrow">♥ PROJECTS / INTERACTIVE</div><h2>Little worlds to explore</h2><p class="section-lead">Interactive storytelling, games and playful experiments.</p>
 <div class="project-grid">
 <button class="project-card" data-open="book"><span class="book-finder-cover">♡<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Turn the pages of the illustrated book</small></button>
 <button class="project-card" data-open="dressup"><span class="project-icon">♥</span><strong>Dress-up game</strong><small>Try the interactive character wardrobe</small></button>
 <button class="project-card" data-mode="play"><span class="project-icon">⌂</span><strong>Explore the room</strong><small>Return to Play Mode</small></button>
 </div>`,'interactive');
}
function openWorkAbout(){
 openWindow('LÉNA ♡ ABOUT',`<div class="eyebrow">♥ PROFILE / ABOUT ME</div><div class="atelier-about-layout">
 <div class="atelier-about-portrait" aria-label="Decorative illustration placeholder"><span aria-hidden="true">♥</span><strong>LÉNA</strong><small>ILLUSTRATION · IDEAS · STORIES</small></div>
 <div class="atelier-about-copy"><h2 class="nana-script-heading"><span class="nana-hand nana-hand--hello-lena" data-nana-script="hello-lena">Hello, I'm Léna ♡</span></h2><p>I'm a freelance illustrator, social media manager and writer. I move between visual storytelling, music, moving images and editorial projects.</p>
 <div class="info-list"><div class="info-box"><small>SKILLS</small><strong>Illustration · Animation · Content creation · Writing</strong></div>
 <div class="info-box"><small>TOOLS</small><strong>Procreate · Procreate Dreams · Video editing</strong></div>
 <div class="info-box"><small>LET'S TALK</small><button type="button" class="soft-btn" data-open="contact">Get in touch ♡</button></div></div><p class="nana-script-note"><span class="nana-hand nana-hand--with-love" data-nana-script="with-love">with love, Léna ♡</span></p></div></div>`,'work-about');
}
function renderArtTiles(filtered=ART){
 const host=$('#art-tiles');if(!host)return;
 host.innerHTML=filtered.map(a=>`<button class="art-tile" data-art-index="${a.index}" aria-label="View ${a.title}"><img src="${a.src}" alt="${a.title}" loading="lazy"><span>${a.title}</span></button>`).join('');
 const count=$('#photos-count');if(count)count.textContent=filtered.length+' works';
}
function openPhotos(){
 openWindow('Photos',`<div class="eyebrow">Illustration / Archive</div><h2>Original illustrations</h2><p class="section-lead">A selection of 19 illustrations, displayed from the original files. Click any image to view it larger.</p><p class="nana-script-note"><span class="nana-hand nana-hand--piece-of-me" data-nana-script="piece-of-me">a little piece of me</span></p><div class="library-toolbar"><input class="search" id="photo-search" aria-label="Search illustrations" placeholder="Search illustrations…"><span class="count" id="photos-count"></span></div><div id="art-tiles" class="photos-grid"></div>`,'photos');
 renderArtTiles();
}
function openGallery(which,index=0){
 const items=which==='gabzilla'?GABZILLA:ART;
 currentGallery={which,index:Math.min(items.length-1,Math.max(0,index))};
 const name=which==='gabzilla'?'GABZILLA — Collaboration':'Photos — Illustration';
 openWindow(name,`<div class="viewer-layout"><div class="viewer-stage"><button class="viewer-btn" data-gallery-dir="-1" aria-label="Previous image">‹</button><img id="viewer-image" alt=""><button class="viewer-btn" data-gallery-dir="1" aria-label="Next image">›</button></div><div class="viewer-bottom"><p id="viewer-caption"></p><span class="viewer-number" id="viewer-number"></span></div><div class="viewer-thumbnails" id="viewer-thumbnails"></div>${which==='gabzilla'?'<p class="section-lead">An original illustration and textile collaboration. All images are shown without cropping or redrawing.</p>':''}</div>`,'gallery');
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
function openMotion(){
 openWindow('Motion',`<div class="eyebrow">Motion / Video</div><h2>Motion</h2><p class="section-lead">Animation, moving image and editorial video — kept separate so each type of work has room to breathe.</p><div class="info-list"><div class="info-box"><small>01 / Animation</small><strong>2D animation & loops</strong></div><div class="info-box"><small>02 / Editorial video</small><strong>Reels & features</strong></div></div><div class="empty-state"><span class="empty-icon">▷</span><h3>Video library coming soon</h3><p>No video files have been added yet. When the original videos are available, they can play here, directly in the portfolio, without a YouTube embed.</p></div>`,'motion');
}
function openPages(){
 openWindow('Pages',`<div class="eyebrow">Pages / Writing</div><h2>Pages</h2><p class="section-lead">Articles, music journalism and personal writing.</p><div class="info-list"><div class="info-box"><small>Editorial writing</small><strong>Gearnews.fr</strong></div><div class="info-box"><small>Stories</small><strong>Personal writing</strong></div></div><div class="empty-state"><span class="empty-icon">▤</span><h3>Article library in preparation</h3><p>Full texts will be added here only when supplied or approved for republication. In the meantime, the original publications can be explored on Gearnews.</p><a class="pill-link" href="https://www.gearnews.fr/" rel="noopener noreferrer" target="_blank">Visit Gearnews.fr ↗</a></div>`,'pages');
}
function openAbout(){
 // Keep the game isolated from the other portfolio apps and original room artwork.
 closeWindow();
 closeSpecial();
 specialHost.innerHTML='<iframe title="About Me — interactive dress-up game" src="about-me.html?v=10" loading="eager" style="display:block;width:min(1140px,95vw);height:min(900px,90dvh);border:0;border-radius:11px;background:#f8d9ee;box-shadow:0 12px 35px #2f1c4c60" allow="none"></iframe>';
 specialShade.hidden=false;
 $('#special-close').setAttribute('aria-label','Close About Me');
 $('#special-close').focus({preventScroll:true});
}
function openBook(){
 openWindow('Clown Princess',`<div class="eyebrow">Writing / Illustrated book</div><h2>Clown Princess</h2><p>An illustrated storytelling project.</p><div class="empty-state"><span class="empty-icon">♡</span><h3>The illustrated book is being prepared</h3><p>The finished reading version will be added here once the original pages are ready. No text or artwork has been invented for this preview.</p></div>`,'book');
}
function openContacts(){
 openWindow('Contacts',`<div class="eyebrow">Contact / Let's talk</div><h2 class="nana-script-heading"><span class="nana-hand nana-hand--work-together" data-nana-script="work-together">Let's work together</span></h2><p>You can contact me directly, or use the Mail application to write a message without leaving this website.</p><div class="contact-list"><div class="contact-row"><small>Name</small><strong>Léna de Firmas</strong></div><div class="contact-row"><small>Email</small><a href="mailto:lena.defirmas@gmail.com">lena.defirmas@gmail.com</a></div><div class="contact-row"><small>Instagram</small><a href="https://www.instagram.com/nanacolorstudio/" target="_blank" rel="noopener noreferrer">@nanacolorstudio ↗</a></div></div><button class="soft-btn" data-open="mail">✉ Write an email</button>`,'contact');
}
function mailFields(){return `<label>Your name<input type="text" name="name" autocomplete="name" required maxlength="120" placeholder="Your name"></label><label>Your email<input type="email" name="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label>Subject<input type="text" name="subject" required maxlength="180" placeholder="Hello!"></label><label>Message<textarea name="message" required maxlength="10000" placeholder="Write your message here…"></textarea></label>`}
function openMail(){
 openWindow('Mail — New Message',`<div class="eyebrow">To / lena.defirmas@gmail.com</div><h2>New message</h2><p>Send a message directly from the portfolio using a secure Formspree form.</p><form class="mail-form" id="desktop-mail-form">${mailFields()}<p class="form-status" aria-live="polite"></p><button class="send-btn" type="submit">Send message ↗</button></form>`,'mail');
}
function openHelp(){
 openWindow('Help',`<div class="eyebrow">Portfolio / Help</div><h2>How to explore</h2><p><strong>Play Mode:</strong> tap the objects in the illustrated bedroom. Posters open original artwork, the iPhone opens Contacts and Mail, and the Tamagotchi is a mini-game.</p><p><strong>Work Mode:</strong> browse projects, illustrations, writing and motion through the desktop folders.</p><p>Click the iMac in Play Mode to enter Work Mode. Use <strong>Switch Mode</strong> in the menu bar to move between them at any time.</p>`,'help');
}

function showPhone(){
 closeWindow();specialShade.hidden=false;
 specialHost.innerHTML=`<div class="phone-device" aria-label="Interactive iPhone"><div class="phone-screen"><div class="phone-wallpaper"></div><div class="phone-status"><time id="phone-time"></time><span class="phone-island" aria-hidden="true"></span><span aria-hidden="true">▂ ▰</span></div><div class="phone-app-row"><button class="phone-app" data-phone-app="contacts"><span class="ios-icon" aria-hidden="true">♙</span><span>Contacts</span></button><button class="phone-app" data-phone-app="mail"><span class="ios-icon mail" aria-hidden="true">✉</span><span>Mail</span></button><button class="phone-app" data-phone-app="instagram"><span class="ios-icon ig" aria-hidden="true">◎</span><span>Instagram</span></button></div><div class="phone-home-line"></div><div class="phone-page" id="phone-page" hidden></div></div></div>`;
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
 const form=$('#phone-mail-form');const bar=$('#phone-page .phone-bar');
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
 closeWindow();specialShade.hidden=false;
 specialHost.innerHTML='<iframe class="tama-frame" title="Interactive Tamagotchi" src="tamagotchi/index.html" allow="autoplay"></iframe>';
}
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
document.addEventListener('click',e=>{
 const mode=e.target.closest('[data-mode]');if(mode){chooseMode(mode.dataset.mode);return}
 if(e.target.closest('#home-menu,#menu-mode')){returnToWelcome();return}
 if(e.target.closest('#theme-toggle')){applyTheme(document.documentElement.dataset.theme==='night'?'day':'night');return}
 if(e.target.closest('#switch-mode,#dock-roomswap')){switchMode();return}
 if(e.target.closest('#back-to-room')){chooseMode('play',true);return}
 if(e.target.closest('#window-close,#window-minimize')){closeWindow();return}
 if(e.target.closest('#window-maximize')){win.classList.toggle('expanded');return}
 if(e.target.closest('#special-close')){closeSpecial();return}
 if(e.target.id==='window-shade'){closeWindow();return}
 if(e.target.id==='special-shade'){closeSpecial();return}
 if(e.target.closest('#player-play')){toggleMusic();return}
 if(e.target.closest('#player-mute')){audio.muted=!audio.muted;return}
 if(e.target.closest('#player-hide')){player.hidden=true;return}
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
 const open=e.target.closest('[data-open]');if(open){const name=open.dataset.open;openApp(name);return}
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
 if(e.data?.type==='close-tamagotchi'||e.data?.type==='close-about-me')closeSpecial();
});
$('#player-seek').addEventListener('change',e=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(e.target.value)/100});
updatePlayer();
