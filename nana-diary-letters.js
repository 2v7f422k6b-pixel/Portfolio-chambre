/* Cut-paper headings for Nana's diary. Original artwork: 13x8 atlas, four variants per A-Z. */
(()=>{'use strict';
const atlas='assets/diary/diary-letters-atlas.png';
const image=new Image();
image.onload=()=>{if(image.naturalWidth<100)return;activate();};
image.src=atlas;
function activate(){
 const journal=document.getElementById('nana-journal');if(!journal)return;
 const render=()=>{
  journal.querySelectorAll('.nj-section-title h2:not([data-cut-paper])').forEach(el=>{
   const title=el.textContent.trim();if(!title)return;
   el.dataset.cutPaper='true';el.setAttribute('aria-label',title);
   const wrap=document.createElement('span');wrap.className='nj-cut-title';wrap.setAttribute('aria-hidden','true');
   [...title.normalize('NFD').replace(/[\u0300-\u036f]/g,'')].forEach((letter,i)=>{
    if(letter===' '){const space=document.createElement('span');space.className='nj-cut-space';wrap.append(space);return;}
    const index=letter.toUpperCase().charCodeAt(0)-65;
    if(index<0||index>25){const plain=document.createElement('span');plain.textContent=letter;wrap.append(plain);return;}
    const variant=(i*7+index)%4,cell=index*4+variant,col=cell%13,row=Math.floor(cell/13);
    const tile=document.createElement('span');tile.className='nj-cut-letter';
    tile.style.backgroundPosition=(col*100/12)+'% '+(row*100/7)+'%';
    tile.style.transform='rotate('+(((i*11)%9)-4)+'deg)';
    wrap.append(tile);
   });
   el.textContent='';el.append(wrap);
  });
 };
 new MutationObserver(()=>{if(!journal.open)return;render();}).observe(journal,{childList:true,subtree:true});
 render();
}
})();