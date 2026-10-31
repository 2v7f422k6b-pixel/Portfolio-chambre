/* La Princesse Clown · 66-page optimized PDF reader, assembled from binary chunks. */
(()=>{
'use strict';
const BASE='assets/books/princesse-clown/';
const COUNT=18;
let pdfUrl=null, pending=null;
const $=s=>document.querySelector(s);
function status(s,n){const t=$('#book-status'),b=$('#book-meter-fill');if(t)t.textContent=s;if(b)b.style.width=n+'%';}
async function load(){
 if(pdfUrl)return pdfUrl;
 if(pending)return pending;
 pending=(async()=>{
  const parts=new Array(COUNT);let next=0,done=0;
  async function worker(){while(next<COUNT){const i=next++;const result=await fetch(BASE+'part-'+String(i).padStart(2,'0')+'.bin');if(!result.ok)throw Error('Impossible de charger le livre.');parts[i]=await result.arrayBuffer();done++;status('Chargement : '+Math.round(done/COUNT*100)+' %',done/COUNT*100);}}
  await Promise.all([worker(),worker(),worker(),worker()]);
  const blob=new Blob(parts,{type:'application/pdf'});
  if(blob.size!==8699536)throw Error('Le fichier est incomplet. Réessaie.');
  pdfUrl=URL.createObjectURL(blob);return pdfUrl;
 })();
 try{return await pending;}finally{pending=null;}
}
function openBook(){
 if(typeof window.openWindow!=='function')return;
 window.openWindow('La Princesse Clown',
 '<section id="book-reader" class="book-reader">'+
 '<header class="book-reader-header"><div><small>ILLUSTRATED STORYBOOK · VERSION PROVISOIRE</small><h2>La Princesse <em>Clown</em></h2><p>66 pages · Conte illustré</p></div>'+
 '<div class="book-reader-actions"><button type="button" data-book-full disabled>↗ Plein écran</button><button type="button" data-book-download disabled>↓ Télécharger</button></div></header>'+
 '<div class="book-reader-stage"><div class="book-reader-loader" id="book-loader"><span class="book-flower">❀</span><strong>Ouverture du livre…</strong><span id="book-status">Préparation des 66 pages</span><div class="book-meter"><div id="book-meter-fill"></div></div></div><iframe id="book-frame" title="Lire les 66 pages de La Princesse Clown" hidden></iframe></div>'+
 '<footer class="book-reader-footer"><span>♡ Illustrations originales</span><span>La Princesse Clown · Lecture intégrale</span></footer></section>', 'book');
 load().then(url=>{if(!$('#book-reader'))return;const frame=$('#book-frame');frame.src=url+'#toolbar=1&navpanes=0&view=FitH';frame.hidden=false;$('#book-loader').hidden=true;document.querySelectorAll('#book-reader [data-book-full],#book-reader [data-book-download]').forEach(b=>b.disabled=false);}).catch(err=>{status(err.message||'Erreur de lecture',0);const loader=$('#book-loader');if(loader&&!loader.querySelector('[data-book-retry]'))loader.insertAdjacentHTML('beforeend','<button type="button" data-book-retry>Réessayer</button>');});
}
window.openBook=openBook;
function addFinder(){const grid=$('#window-content .project-grid');if(!grid||grid.querySelector('[data-open="book"]'))return;const b=document.createElement('button');b.type='button';b.className='project-card';b.dataset.open='book';b.innerHTML='<span class="book-finder-cover">♡<small>La Princesse Clown</small></span><strong>La Princesse Clown</strong><small>Livre illustré · 66 pages</small>';grid.appendChild(b);}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-book-retry]')){openBook();return;}
 if(event.target.closest('[data-book-full]')){if(pdfUrl)window.open(pdfUrl,'_blank','noopener');return;}
 if(event.target.closest('[data-book-download]')){if(!pdfUrl)return;const a=document.createElement('a');a.href=pdfUrl;a.download='La_Princesse_Clown_lecture.pdf';document.body.appendChild(a);a.click();a.remove();}
});
document.addEventListener('DOMContentLoaded',()=>{const el=$('#window-content');if(el)new MutationObserver(addFinder).observe(el,{childList:true});});
})();