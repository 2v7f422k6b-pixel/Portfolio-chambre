/* Reorganize existing controls; their handlers and authorization remain owned by the app. */
(() => {
  'use strict';
  const bar=document.getElementById('menubar'), toggle=document.getElementById('mobile-menu-toggle'), panel=document.getElementById('mobile-menu-panel');
  if(!bar||!toggle||!panel)return;
  bar.classList.add('nana-navigation');
  const left=bar.querySelector('.menu-left'), right=bar.querySelector('.menu-right');
  const byId=id=>document.getElementById(id);
  const preferences=['language-toggle','theme-toggle','switch-mode'].map(byId);
  const admin=byId('nana-admin-trigger');
  const creations=document.createElement('button');
  creations.id='menu-creations';creations.type='button';creations.dataset.open='finder';
  const shop=document.createElement('button');
  shop.id='menu-shop';shop.type='button';
  shop.addEventListener('click',()=>window.NanaDeepLinks.open('shop'));
  panel.append(byId('menu-about'),creations,byId('menu-contact'),shop,byId('menu-help'));
  const settings=document.createElement('div');settings.className='nav-preferences';panel.append(settings,admin);
  left.append(toggle);
  bar.insertBefore(byId('nana-journal-trigger'),right);
  right.prepend(byId('menu-search'));
  panel.insertAdjacentHTML('afterbegin','<svg class="nav-ribbon-art" viewBox="0 0 280 400" preserveAspectRatio="none" aria-hidden="true"><path d="M12 7C75 3 204 10 267 6C279 75 265 130 271 203C278 268 265 322 269 378C223 399 180 381 137 387C91 394 43 380 12 389C3 323 16 270 9 201C3 127 16 70 12 7Z"/></svg>');
  [toggle,panel,byId('theme-toggle'),byId('home-menu')].forEach(el=>el.setAttribute('data-no-translate',''));
  let open=false,compact=false;
  const t=(fr,en)=>document.documentElement.lang==='en'?en:fr;
  function label(el,text){el.setAttribute('aria-label',text);el.title=text;}
  function localize(){
    label(toggle,open?t('Fermer le menu','Close menu'):t('Ouvrir le menu','Open menu'));
    panel.setAttribute('aria-label',t('Menu secondaire','Secondary navigation'));
    label(byId('home-menu'),t('Retour à l’accueil','Return home'));
    byId('menu-about').textContent=t('À propos','About');label(byId('menu-about'),t('À propos','About'));
    creations.textContent=t('Mes créations','My creations');label(creations,t('Mes créations','My creations'));
    shop.textContent=t('Boutique','Shop');label(shop,t('Boutique','Shop'));
    byId('menu-contact').textContent='Contact';label(byId('menu-contact'),'Contact');
    byId('menu-help').textContent=t('Aide','Help');
    label(byId('menu-help'),t('Aide','Help'));
    label(byId('switch-mode'),t('Mode Work','Work mode'));
    const night=document.documentElement.dataset.theme==='night';
    const icon=byId('theme-toggle').querySelector('.theme-icon');
    icon.innerHTML='<svg viewBox="0 0 28 28" aria-hidden="true"><path d="'+(night?'M19 9C24 16 17 23 11 19C5 16 8 6 15 7Q17 7 19 9M14 1L14 4M24 5L21 8M27 14L24 14M23 23L21 21M14 27L14 24M4 23L7 21M1 14L4 14M5 4L7 7':'M18 3C7 1 2 13 7 21C13 29 25 23 25 16C16 20 10 10 18 3Z')+'"/></svg>';
    label(byId('theme-toggle'),night?t('Passer en mode jour','Switch to day mode'):t('Passer en mode nuit','Switch to night mode'));
    label(admin,t('Ouvrir le petit atelier de Nana','Open Nana’s little workshop'));
  }
  byId('menu-help').setAttribute('data-no-translate','');
  function setOpen(value,restore=false){
    open=value;panel.hidden=!value;bar.classList.toggle('mobile-menu-open',value);toggle.setAttribute('aria-expanded',String(value));localize();
    if(restore)toggle.focus({preventScroll:true});
  }
  toggle.addEventListener('click',()=>setOpen(!open));
  toggle.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);byId('menu-about').focus();}});
  panel.addEventListener('click',event=>{if(event.target.closest('button'))setOpen(false,true);});
  document.addEventListener('pointerdown',event=>{if(open&&!bar.contains(event.target))setOpen(false);});
  document.addEventListener('focusin',event=>{if(open&&!bar.contains(event.target))setOpen(false);});
  document.addEventListener('keydown',event=>{if(open&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();setOpen(false,true);}},true);
  // Measure the actual bar, including translated labels, instead of device names.
  function fit(){
    const available=bar.clientWidth-24;
    const toolsWidth=44+preferences.reduce((sum,el)=>sum+Math.max(el.offsetWidth,el.id==='switch-mode'?112:el.id==='language-toggle'?72:44),0)+24;
    const required=2*Math.max(148,toolsWidth)+byId('nana-journal-trigger').offsetWidth+24;
    const next=available<required;
    if(next===compact)return;
    const focus=document.activeElement;compact=next;bar.classList.toggle('nav-compact',compact);
    preferences.forEach(el=>(compact?settings:right).append(el));
    if(compact&&preferences.includes(focus))setOpen(true);
    if(focus?.isConnected&&bar.contains(focus))focus.focus({preventScroll:true});
  }
  // Fixed sizing of controls makes the measurement stable after moving them.
  new ResizeObserver(fit).observe(bar);
  document.addEventListener('portfolio-language-change',()=>{localize();fit();});
  document.addEventListener('portfolio-mode-change',localize);
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  setOpen(false);localize();fit();document.fonts.ready.then(fit);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function hint(){if(reduce.matches||open||document.hidden||byId('app').classList.contains('mode-select'))return;toggle.classList.remove('nav-attention');requestAnimationFrame(()=>toggle.classList.add('nav-attention'));}
  let seen=false;try{seen=localStorage.getItem('nana-ribbon-seen-v1')==='1';}catch(_){}
  const modeObserver=new MutationObserver(()=>{if(!seen&&!byId('app').classList.contains('mode-select')){seen=true;hint();try{localStorage.setItem('nana-ribbon-seen-v1','1');}catch(_){}}});
  modeObserver.observe(byId('app'),{attributes:true,attributeFilter:['class']});
  if(!seen&&!byId('app').classList.contains('mode-select')){hint();seen=true;try{localStorage.setItem('nana-ribbon-seen-v1','1');}catch(_){}}
  let idle;function activity(){clearTimeout(idle);idle=setTimeout(hint,180000);}
  ['pointerdown','keydown','pointermove'].forEach(type=>document.addEventListener(type,activity,{passive:true}));activity();
})();
