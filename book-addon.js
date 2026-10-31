/* La Princesse Clown — tactile illustrated flipbook. Original PDF is preserved. */
(()=>{
'use strict';
const BASE='assets/books/princesse-clown/', COUNT=18, BYTES=8699536;
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const $=s=>document.querySelector(s);
let pdfUrl=null,pending=null,pdf=null,cache=new Map(),position=0,busy=false,token=0,pageRatio=.72;
const isSmall=()=>matchMedia('(max-width: 700px)').matches;
function status(s,n){const t=$('#book-status'),b=$('#book-meter-fill');if(t)t.textContent=s;if(b)b.style.width=n+'%';}
async function loadPdf(){
 if(pdf)return pdf;
 if(pending)return pending;
 pending=(async()=>{
  if(!pdfUrl){
   const chunks=new Array(COUNT);let next=0,done=0;
   async function worker(){while(next<COUNT){const i=next++;const res=await fetch(BASE+'part-'+String(i).padStart(2,'0')+'.bin');if(!res.ok)throw Error('Impossible de charger le livre.');chunks[i]=await res.arrayBuffer();status('Chargement du livre : '+Math.round(++done/COUNT*100)+' %',done/COUNT*65);}}
   await Promise.all(Array.from({length:4},worker));
   const blob=new Blob(chunks,{type:'application/pdf'});
   if(blob.size!==BYTES)throw Error('Le fichier du livre est incomplet.');
   pdfUrl=URL.createObjectURL(blob);
  }
  status('Préparation des pages…',75);
  if(!window.pdfjsLib){
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=CDN+'pdf.min.js';script.onload=resolve;script.onerror=()=>reject(Error('Lecteur indisponible. Vérifie ta connexion.'));document.head.appendChild(script);
   });
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc=CDN+'pdf.worker.min.js';
  pdf=await window.pdfjsLib.getDocument({url:pdfUrl}).promise;
  const firstPage=await pdf.getPage(1),pageSize=firstPage.getViewport({scale:1});
  pageRatio=pageSize.width/pageSize.height;
  status('Pages prêtes',100);
  return pdf;
 })();
 try{return await pending;}finally{pending=null;}
}
function pagePair(p){
 if(isSmall())return [0,p];
 return p===1?[0,1]:[p,p+1];
}
function limit(p){return Math.max(1,Math.min(pdf?.numPages||66,p));}
function nextPosition(p,dir){if(isSmall())return limit(p+dir);if(dir>0)return p===1?2:Math.min(66,p+2);return p===2?1:Math.max(1,p-2);}
async function imageFor(n){
 if(n<1||n>(pdf?.numPages||66))return null;
 if(cache.has(n))return cache.get(n);
 const promise=(async()=>{
  const page=await pdf.getPage(n),base=page.getViewport({scale:1});
  const scale=Math.min(2.0,1100/base.height);
  const viewport=page.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=Math.round(viewport.width);canvas.height=Math.round(viewport.height);
  await page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport}).promise;
  const src=canvas.toDataURL('image/jpeg',0.91);
  canvas.width=canvas.height=0;return src;
 })();
 cache.set(n,promise);
 if(cache.size>14){const first=cache.keys().next().value;cache.delete(first);}
 try{return await promise;}catch(e){cache.delete(n);throw e;}
}
function fill(side,src,n){
 const el=$('#book-'+side);if(!el)return;
 const image=el.querySelector('img'),blank=!src;
 el.classList.toggle('is-blank',blank);image.hidden=blank;
 if(src)image.src=src;else image.removeAttribute('src');
 el.setAttribute('aria-label',n?'Page '+n:'Intérieur de couverture');
}
function sizeSpread(){
 const book=$('#book-pages'),assembly=$('#book-assembly');if(!book||!assembly)return;
 const controls=assembly.querySelectorAll('.book-side-arrow');
 const controlWidth=[...controls].reduce((sum,b)=>sum+b.getBoundingClientRect().width,0)+32;
 const widthAvailable=Math.max(160,assembly.clientWidth-controlWidth-20);
 const heightAvailable=Math.max(160,assembly.clientHeight-12);
 const ratio=pageRatio*(isSmall()?1:2);
 const height=Math.min(heightAvailable,widthAvailable/ratio);
 book.style.width=Math.floor(height*ratio)+'px';book.style.height=Math.floor(height)+'px';
 book.style.aspectRatio=String(ratio);
}
function updateControls(){
 const total=pdf?.numPages||66;
 const pair=pagePair(position),label=pair.filter(n=>n>0&&n<=total);
 const counter=$('#book-count');if(counter)counter.textContent='Page'+(label.length>1?'s ':' ')+label.join('–')+' / '+total;
 const prev=$('[data-book-prev]'),next=$('[data-book-next]');
 if(prev)prev.disabled=position<=1||busy;
 if(next)next.disabled=position>=total||busy;
}
async function draw(p){
 const id=++token, pair=pagePair(p);
 const [left,right]=await Promise.all(pair.map(imageFor));
 if(id!==token||!$('#book-reader'))return;
 fill('left',left,pair[0]);fill('right',right,pair[1]);
 position=p;updateControls();
 for(const n of [p-2,p-1,p+1,p+2,p+3])imageFor(n).catch(()=>{});
}
async function turn(dir){
 if(busy||!pdf)return;
 const target=nextPosition(position,dir);if(target===position)return;
 busy=true;updateControls();
 let sheet=null;
 try{
  const previous=pagePair(position),future=pagePair(target);
  // Freeze the visible leaves and prepare the destination spread before animating.
  const [previousLeft,previousRight,futureLeft,futureRight]=await Promise.all(
   [previous[0],previous[1],future[0],future[1]].map(imageFor)
  );
  const stage=$('#book-pages');
  if(!stage||!$('#book-reader'))return;
  const goingForward=dir>0;
  const oldSrc=goingForward?previousRight:previousLeft;
  const newSrc=goingForward?futureLeft:futureRight;
  sheet=document.createElement('div');
  sheet.className='book-turn-sheet '+(goingForward?'go-next':'go-prev');
  const face=document.createElement('div');
  face.className='book-turn-face';
  const back=document.createElement('div');
  back.className='book-turn-back';
  // Front = outgoing page, reverse = incoming page. Never swap these for mobile.
  if(oldSrc)face.style.backgroundImage='url("'+oldSrc+'")';
  if(newSrc)back.style.backgroundImage='url("'+newSrc+'")';
  sheet.append(face,back);
  stage.appendChild(sheet);
  // Crucial: keep the stationary page from the OLD spread in place,
  // and reveal only the far page of the NEW spread underneath the leaf.
  // Updating both pages immediately made illustrations jump before the turn.
  if(isSmall()){
   fill('left',null,0);
   fill('right',futureRight,future[1]);
  }else if(goingForward){
   fill('left',previousLeft,previous[0]);
   fill('right',futureRight,future[1]);
  }else{
   fill('left',futureLeft,future[0]);
   fill('right',previousRight,previous[1]);
  }
  // The sheet is attached and painted before the transition begins.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(!sheet.isConnected)return;
  sheet.classList.add('turning');
  await new Promise(resolve=>{
   const complete=e=>{if(e.target===sheet&&e.propertyName==='transform'){sheet.removeEventListener('transitionend',complete);resolve();}};
   sheet.addEventListener('transitionend',complete);
   setTimeout(()=>{sheet.removeEventListener('transitionend',complete);resolve();},1050);
  });
  if(!$('#book-reader'))return;
  // Only now replace the folded leaf with the final, fixed spread.
  fill('left',futureLeft,future[0]);
  fill('right',futureRight,future[1]);
  position=target;
  for(const n of [target-2,target-1,target+1,target+2])imageFor(n).catch(()=>{});
 }catch(err){
  if($('#book-reader')){status(err.message||'Impossible de tourner la page',100);await draw(position);}
 }finally{
  if(sheet)sheet.remove();
  busy=false;updateControls();
 }
}
function openBook(){
 if(typeof window.openWindow!=='function')return;
 window.openWindow('La Princesse Clown',
 '<section id="book-reader" class="book-reader" aria-label="Livre interactif La Princesse Clown">'+
 '<header class="book-reader-header"><div><small>CONTE ILLUSTRÉ · ÉDITION PROVISOIRE</small><h2>La Princesse <em>Clown</em></h2></div>'+
 '<div class="book-reader-actions"><button type="button" data-book-full disabled>↗ PDF original</button><button type="button" data-book-download disabled>↓ Télécharger</button></div></header>'+
 '<div class="book-reader-stage"><div class="book-reader-loader" id="book-loader"><span class="book-flower">❀</span><strong>Ouverture du livre…</strong><span id="book-status">Préparation des 66 pages</span><div class="book-meter"><div id="book-meter-fill"></div></div></div>'+
 '<div class="book-assembly" id="book-assembly" hidden><button class="book-side-arrow" data-book-prev aria-label="Page précédente">‹</button>'+
 '<div class="book-pages" id="book-pages" aria-label="Pages du livre"><div id="book-left" class="book-page book-left"><img alt="Page de gauche du livre"></div><div class="book-spine" aria-hidden="true"></div><div id="book-right" class="book-page book-right"><img alt="Page de droite du livre"></div></div>'+
 '<button class="book-side-arrow" data-book-next aria-label="Page suivante">›</button></div></div>'+
 '<footer class="book-reader-footer"><span>♡ Un conte de Léna de Firmas</span><span id="book-count" aria-live="polite">66 pages</span><span>Glisse ou clique pour tourner les pages</span></footer></section>','book');
 position=1;busy=false;token++;
 loadPdf().then(async()=>{if(!$('#book-reader'))return;await draw(1);if(!$('#book-reader'))return;$('#book-loader').hidden=true;$('#book-assembly').hidden=false;sizeSpread();document.querySelectorAll('#book-reader [data-book-full],#book-reader [data-book-download]').forEach(b=>b.disabled=false);}).catch(err=>{status(err.message||'Erreur de lecture',0);const loader=$('#book-loader');if(loader&&!loader.querySelector('[data-book-retry]'))loader.insertAdjacentHTML('beforeend','<button type="button" data-book-retry>Réessayer</button>');});
}
window.openBook=openBook;
function addFinder(){const grid=$('#window-content .project-grid');if(!grid||grid.querySelector('[data-open="book"]'))return;const b=document.createElement('button');b.type='button';b.className='project-card';b.dataset.open='book';b.innerHTML='<span class="book-finder-cover">♡<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Livre illustré · 66 pages</small>';grid.appendChild(b);}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-book-prev]')){turn(-1);return;}
 if(e.target.closest('[data-book-next]')){turn(1);return;}
 if(e.target.closest('[data-book-retry]')){openBook();return;}
 if(e.target.closest('[data-book-full]')){if(pdfUrl)window.open(pdfUrl,'_blank','noopener');return;}
 if(e.target.closest('[data-book-download]')){if(!pdfUrl)return;const a=document.createElement('a');a.href=pdfUrl;a.download='La_Princesse_Clown_lecture.pdf';document.body.appendChild(a);a.click();a.remove();return;}
 if(e.target.closest('#book-right')&&Date.now()>suppressClickUntil)turn(1);
 if(e.target.closest('#book-left')&&Date.now()>suppressClickUntil)turn(-1);
});
let start=null,suppressClickUntil=0;
document.addEventListener('pointerdown',e=>{if(e.target.closest('#book-pages'))start={x:e.clientX,y:e.clientY};});
document.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)){suppressClickUntil=Date.now()+500;turn(dx<0?1:-1);}});
document.addEventListener('keydown',e=>{if(!$('#book-reader')||!$('#book-assembly')||$('#book-assembly').hidden)return;if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}});
let wasSmall=isSmall();
window.addEventListener('resize',()=>{if(!pdf||!$('#book-reader'))return;sizeSpread();const small=isSmall();if(small!==wasSmall){wasSmall=small;busy=false;draw(small?position:(position<=1?1:position%2===0?position:position-1));}});
document.addEventListener('DOMContentLoaded',()=>{const el=$('#window-content');if(el)new MutationObserver(addFinder).observe(el,{childList:true});});
})();