/* Global top-bar search: live Nana Studio catalog and direct navigation. */
(()=>{
function init(){
 const toggle=document.getElementById('menu-search'),panel=document.getElementById('global-search-popover'),input=document.getElementById('global-search-input'),results=document.getElementById('global-search-results');
 if(!toggle||!panel||!input||!results)return;
 const defaults=[
 {title:'Illustration',category:'Illustration',open:'photos'},
 {title:'Animation',category:'Animation',open:'motion'},
 {title:'Music & Visuals',category:'Music',open:'music'},
 {title:'Writing & Editorial',category:'Editorial',open:'pages'},
 {title:'Mini Games',category:'Interactive',open:'mini-games'},
 {title:'La Princesse Clown',category:'Book',open:'book'},
 {title:'Coloring Book',category:'Game',open:'coloring'},
 {title:'Dress-up',category:'Game',open:'dressup'},
 {title:'Latte Lab',category:'Game',open:'latte'},
 {title:'Tamagotchi',category:'Game',open:'tamagotchi'},
 {title:'My Polaroids',category:'Photos',open:'polaroids'},
 {title:'About',category:'About',open:'about'},
 {title:'Contact',category:'Contact',open:'contact'},
 {title:'GABZILLA',category:'Illustration',open:'gabzilla'}
 ];
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function hide(){panel.hidden=true;toggle.setAttribute('aria-expanded','false')}
 function openItem(item){
  hide();
  if(item.category==='Animation' && item.video && typeof window.openMotionAt==='function'){window.openMotionAt(item.project);return}
  if(item.project && /\.(?:jpe?g|png|webp)$/i.test(item.project) && typeof window.portfolioArtworkIndex==='function'){
   const index=window.portfolioArtworkIndex(item.project);
   if(index>=0 && typeof window.openApp==='function'){window.openApp('artwork',index);return}
  }
  if(typeof window.openApp==='function'){window.openApp(item.open||'finder');return}
  document.querySelector('[data-open="'+(item.open||'finder')+'"]')?.click();
 }
 function render(){
  results.replaceChildren();const q=normalize(input.value.trim());if(!q)return;
  const catalog=[...defaults,...(window.portfolioCatalog||[])];
  const seen=new Set();
  const matches=catalog.filter(item=>{
   const key=item.project||item.title;if(seen.has(key))return false;seen.add(key);
   return normalize([item.title,item.category,item.project,...(item.tags||[])].join(' ')).includes(q);
  });
  if(!matches.length){results.textContent='Aucun résultat.';return}
  for(const item of matches){
   const button=document.createElement('button');button.type='button';button.textContent=item.title+(item.category?' · '+item.category:'');
   button.addEventListener('click',()=>openItem(item));results.append(button);
  }
 }
 toggle.addEventListener('click',e=>{e.stopPropagation();panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){input.focus();render()}});
 input.addEventListener('input',render);
 document.addEventListener('portfolio-tags-updated',render);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
 document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!toggle.contains(e.target))hide()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
