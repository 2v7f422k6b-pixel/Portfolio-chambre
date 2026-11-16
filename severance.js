/* A small, local-only refinement game. No animation loop, network or new artwork. */
(() => {
  'use strict';
  const KEY='nana-severance-refinement-v1', codes=['WO','FC','DR','MA'];
  const t=(fr,en)=>document.documentElement.lang.startsWith('en')?en:fr;
  let counts=[0,0,0,0],selected=new Set(),round,root;
  function read(){try{const v=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(v)&&v.length===4&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=3))counts=v;}catch(_){} }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(counts));return true;}catch(_){return false;}}
  function nextRound(){
    const available=codes.map((_,i)=>i).filter(i=>counts[i]<3);
    if(!available.length)return null;
    const category=available[Math.floor(Math.random()*available.length)];
    const row=Math.floor(Math.random()*5),col=Math.floor(Math.random()*7);
    return {category,targets:[row*8+col,row*8+col+1,(row+1)*8+col,(row+1)*8+col+1],digits:Array.from({length:48},()=>Math.floor(Math.random()*10))};
  }
  const names=()=>[t('Chagrin','Woe'),t('Joie','Frolic'),t('Peur','Dread'),t('Colère','Malice')];
  const clues=()=>[t('Ces nombres te rendent triste.','These numbers make you sad.'),t('Ces nombres te donnent envie de rire.','These numbers make you want to laugh.'),t('Ces nombres te font peur.','These numbers scare you.'),t('Ces nombres te mettent en colère.','These numbers make you angry.')];
  let fitObserver;
  function fit(){
    if(!root?.isConnected)return;
    const frame=root.parentElement;
    const width=Math.min(720,frame.clientWidth);
    root.style.width=width+'px';
    const scale=Math.min(1,frame.clientHeight/root.offsetHeight);
    root.style.transform=`scale(${scale})`;
    root.style.left=((frame.clientWidth-width*scale)/2)+'px';
  }
  window.addEventListener('resize',()=>requestAnimationFrame(fit),{passive:true});
  document.fonts?.ready.then(()=>requestAnimationFrame(fit));
  function message(text){root.querySelector('[data-mdr-status]').textContent=text;requestAnimationFrame(fit);}
  function finish(){window.NanaProgress?.feat('severance-refined');}
  function render(){
    if(!root?.isConnected)return;
    const done=counts.reduce((a,b)=>a+b,0),complete=done===12;
    requestAnimationFrame(fit);
    root.innerHTML=`<header class="mdr-heading"><div><p class="mdr-company">LUMON INDUSTRIES</p><h2>Macrodata Refinement</h2></div><div class="mdr-file">${t('Fichier','File')} : MARSEILLE<br><strong>${Math.round(done/12*100)} %</strong></div></header>
    <progress max="12" value="${done}" aria-label="${t('Raffinage du fichier','File refinement')}"></progress>
    ${complete?`<section class="mdr-complete"><p class="mdr-company">100 % · FILE COMPLETE</p><h3>${t('Votre travail est apprécié.','Your work is appreciated.')}</h3><p>${t('Fichier raffiné. La tenue de Helly R. est débloquée dans le dressing.','File refined. Helly R.’s outfit is unlocked in the wardrobe.')}</p><button class="nj-frame" data-mdr-look>${t('Voir la tenue de Helly','See Helly’s outfit')}</button><button class="nj-frame" data-mdr-replay>${t('Raffiner un nouveau fichier','Refine a new file')}</button></section>`:
    `<p class="mdr-instructions">${t('Sélectionne les quatre nombres qui frémissent, puis range-les dans la catégorie qui correspond à la sensation décrite.','Select the four trembling numbers, then choose the category matching the feeling described.')}</p><div class="mdr-grid" role="group" aria-label="${t('Grille de nombres','Number grid')}">${round.digits.map((n,i)=>`<button type="button" data-mdr-number="${i}" class="${round.targets.includes(i)?'mdr-target':''}" aria-pressed="false" aria-label="${n}, ${t('ligne','row')} ${Math.floor(i/8)+1}, ${t('colonne','column')} ${i%8+1}${round.targets.includes(i)?t(', nombre à raffiner',', number to refine'):''}">${n}</button>`).join('')}</div><p class="mdr-clue">${clues()[round.category]}</p><div class="mdr-bins">${codes.map((code,i)=>`<button class="nj-frame" data-mdr-bin="${i}" ${counts[i]===3?'disabled':''}><strong>${code}</strong><span>${names()[i]}</span><small>${counts[i]} / 3</small></button>`).join('')}</div>`}
    <p class="mdr-status" data-mdr-status role="status" aria-live="polite">${complete?'':t('0 / 4 nombres sélectionnés.','0 / 4 numbers selected.')}</p><footer>${t('Adaptation ludique inspirée de Severance · aucun chronomètre.','A playful adaptation inspired by Severance · no timer.')}</footer>`;
  }
  function open(){
    read();selected.clear();round=nextRound();
    window.NanaProgress?.visit('jeu/severance');
    window.openWindow('Lumon — Macrodata Refinement', '<div class="mdr-fit"><section id="nana-mdr" data-no-translate></section></div>','severance');
    root=document.getElementById('nana-mdr');
    fitObserver?.disconnect();
    fitObserver=new ResizeObserver(()=>requestAnimationFrame(fit));
    fitObserver.observe(root.parentElement);
    if(!round)finish();
    render();
    root.addEventListener('click',event=>{
      const number=event.target.closest('[data-mdr-number]');
      if(number){const i=Number(number.dataset.mdrNumber);if(selected.has(i))selected.delete(i);else if(selected.size<4)selected.add(i);else {message(t('Quatre nombres suffisent. Désélectionne un nombre pour le remplacer.','Four numbers are enough. Deselect one to replace it.'));return;}number.setAttribute('aria-pressed',String(selected.has(i)));message(`${selected.size} / 4 ${t('nombres sélectionnés.','numbers selected.')}`);return;}
      const bin=event.target.closest('[data-mdr-bin]');
      if(bin&&round){
        if(selected.size!==4||!round.targets.every(i=>selected.has(i))){message(t('Repère les quatre nombres qui frémissent. Tu peux corriger ta sélection.','Find the four trembling numbers. You can change your selection.'));return;}
        if(Number(bin.dataset.mdrBin)!==round.category){message(t('Pas cette catégorie. Relis la sensation au-dessus des nombres.','Not this category. Read the feeling above the numbers again.'));return;}
        counts[round.category]++;const saved=save();selected.clear();round=nextRound();if(!round)finish();render();
        message(!saved?t('Progression conservée pour cette session seulement.','Progress kept for this session only.'):round?t('Groupe accepté. Un nouveau groupe attend ton attention.','Group accepted. A new group awaits your attention.'):t('Raffinage terminé.','Refinement complete.'));
        root.querySelector(round?'[data-mdr-number].mdr-target':'[data-mdr-look]')?.focus({preventScroll:true});return;
      }
      if(event.target.closest('[data-mdr-replay]')){counts=[0,0,0,0];save();selected.clear();round=nextRound();render();root.querySelector('.mdr-target')?.focus({preventScroll:true});}
      if(event.target.closest('[data-mdr-look]')){window.openAbout('severance');}
    });
  }
  document.addEventListener('portfolio-language-change',()=>{if(root?.isConnected)open();});
  window.NanaSeverance={open};
})();
