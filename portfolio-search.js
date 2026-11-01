/* Search panel for Work desktop. */
(()=>{
 function setup(){
  const desktop=document.getElementById('work-desktop');
  const grid=desktop?.querySelector('.folder-grid');
  if(!grid || document.getElementById('work-search'))return;
  const wrapper=document.createElement('div');wrapper.id='work-search';
  const label=document.createElement('label');label.htmlFor='work-search-input';label.textContent='Search my work';
  const input=document.createElement('input');input.id='work-search-input';input.type='search';input.placeholder='Search projects, illustrations, animations…';input.autocomplete='off';
  const results=document.createElement('div');results.id='work-search-results';results.hidden=true;
  wrapper.append(label,input,results);grid.before(wrapper);
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  input.addEventListener('input',()=>{
   const q=normalize(input.value.trim());results.replaceChildren();results.hidden=!q;
   if(!q)return;
   const matches=(window.portfolioCatalog||[]).filter(item=>normalize([item.title,item.category,item.project,...item.tags].join(' ')).includes(q));
   if(!matches.length){results.textContent='No matching projects yet.';return}
   for(const item of matches){
    const button=document.createElement('button');button.type='button';button.className='work-search-hit';button.textContent=item.title+' · '+item.category+(item.tags?.length?' · #'+item.tags.join(' #'):'');
    button.addEventListener('click',()=>{
     // Open the destination directly: some items (especially tagged artworks)
     // have no matching folder button, and hidden dock buttons cannot be clicked.
     if(item.project && /\\.(?:jpe?g|png|webp)$/i.test(item.project)){
       const artIndex=window.portfolioArtworkIndex?.(item.project);
       if(Number.isInteger(artIndex) && typeof window.openApp==='function'){
         window.openApp('artwork',artIndex);
         return;
       }
     }
     if(typeof window.openApp==='function'){
       window.openApp(item.open||'finder');
       return;
     }
     const target=document.querySelector('[data-open="'+(item.open||'finder')+'"]');
     if(target)target.click();
    });
    results.append(button);
   }
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
