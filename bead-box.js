/* Phone-charm workshop using Léna's original artwork. */
(() => {
'use strict';
const KEY='nana-bead-charm-v1', MAX=20, TYPES=['star','heart','flower'];
const ART={"star":[{"src":"assets/beads/IMG_5133.png","box":[23,39,840,836]},{"src":"assets/beads/IMG_5134.png","box":[76,31,762,808]},{"src":"assets/beads/IMG_5135.png","box":[52,140,813,778]},{"src":"assets/beads/IMG_5136.png","box":[78,52,832,908]}],"flower":[{"src":"assets/beads/IMG_5139.png","box":[109,177,759,752]},{"src":"assets/beads/IMG_5140.png","box":[109,177,759,752]},{"src":"assets/beads/IMG_5141.png","box":[109,177,759,752]},{"src":"assets/beads/IMG_5142.png","box":[107,232,725,651]},{"src":"assets/beads/IMG_5143.png","box":[107,232,725,651]},{"src":"assets/beads/IMG_5144.png","box":[107,232,725,651]}],"heart":[{"src":"assets/beads/IMG_5145.png","box":[109,205,621,687]},{"src":"assets/beads/IMG_5146.png","box":[67,176,714,665]},{"src":"assets/beads/IMG_5147.png","box":[82,138,704,675]},{"src":"assets/beads/IMG_5148.png","box":[109,205,621,687]},{"src":"assets/beads/IMG_5149.png","box":[67,176,714,665]},{"src":"assets/beads/IMG_5150.png","box":[82,138,704,675]}],"rabbit":[{"src":"assets/beads/IMG_5132.png","box":[306,67,461,901]}],"letter":[{"src":"assets/beads/IMG_5211.png","box":[81,148,733,702]},{"src":"assets/beads/IMG_5212.png","box":[78,134,726,703]},{"src":"assets/beads/IMG_5213.png","box":[94,144,714,696]},{"src":"assets/beads/IMG_5214.png","box":[99,147,715,697]}]};
const words={
 fr:{title:'Boîte à perles',intro:'Choisis tes perles, compose ton bijou.',box:'La boîte à perles',yours:'Ton bijou',hint:'Glisse les perles sur le fil. Touche une perle pour la retirer.',names:['Étoiles','Cœurs','Fleurs'],word:'Un prénom, un mot…',thread:'Enfiler',letter:'Lettre',left:'Avant',right:'Après',remove:'Retirer',undo:'Annuler',reset:'Recommencer',save:'Garder mon bijou',swing:'Faire danser',pendant:'Pendentif',empty:'Ton fil attend ses premières perles.',full:'Le fil est plein ! Retire une perle pour en ajouter une autre.',added:'Perle ajoutée',removed:'Perle retirée',saved:'Ton bijou est prêt à être enregistré.',failed:'Le téléchargement a échoué. Réessaie.',count:'perles',selected:'Perle sélectionnée',choose:'Sélectionne une perle sur le bijou.',exporting:'Préparation…',attach:'Accrocher au téléphone',detach:'Décrocher du téléphone',roomCharm:'Modifier le bijou du téléphone',buy:"J’en veux un",buyNote:'Commander mon bijou fait main par Léna'},
 en:{title:'Bead Box',intro:'Pick your beads, make your charm.',box:'The bead box',yours:'Your charm',hint:'Drag beads onto the string. Tap a bead to remove it.',names:['Stars','Hearts','Flowers'],word:'A name, a word…',thread:'Thread',letter:'Letter',left:'Earlier',right:'Later',remove:'Remove',undo:'Undo',reset:'Start again',save:'Keep my charm',swing:'Make it dance',pendant:'Pendant',empty:'Your string is waiting for its first beads.',full:'The string is full! Remove a bead to add another.',added:'Bead added',removed:'Bead removed',saved:'Your charm is ready to save.',failed:'Download failed. Please try again.',count:'beads',selected:'Selected bead',choose:'Select a bead on your charm.',exporting:'Preparing…',attach:'Attach to phone',detach:'Detach from phone',roomCharm:'Edit the phone charm',buy:'I want one',buyNote:'Order my charm, handmade by Léna'}
};

const language=()=>document.documentElement.lang.startsWith('en')?'en':'fr';
const t=()=>words[language()];
const cleanWord=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const randomLetterVariant=()=>Math.floor(Math.random()*ART.letter.length);
let needsLetterMigration=false;
let beads=[],history=[],attached=false,drag=null,suppressClickUntil=0;
try{
 const saved=JSON.parse(localStorage.getItem(KEY));
 if(Array.isArray(saved?.beads)){
  const valid=saved.beads.filter(b=>TYPES.includes(b?.type)||b?.type==='letter').slice(0,MAX);
  const used=new Set();
  beads=valid.map((b,i)=>{
   let slot=Number.isInteger(b.slot)&&b.slot>=0&&b.slot<MAX?b.slot:Math.round(i*(MAX-1)/Math.max(13,valid.length-1));
   if(used.has(slot))slot=Array.from({length:MAX},(_,n)=>n).find(n=>!used.has(n));
   used.add(slot);
   const letter=b.type==='letter';
   const assigned=letter&&b.colorAssigned===true&&Number.isInteger(b.variant);
   if(letter&&!assigned)needsLetterMigration=true;
   const variant=letter?(assigned?Math.abs(b.variant)%ART.letter.length:randomLetterVariant()):(Number.isInteger(b.variant)?Math.abs(b.variant)%ART[b.type].length:0);
   return {type:b.type,variant,letter:cleanWord(b.letter).slice(0,1)||'A',slot,...(letter?{colorAssigned:true}:{})};
  });attached=saved.attached===true;
 }
}catch(_){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({beads,pendant:'rabbit',attached}));}catch(_){}};
if(needsLetterMigration)persist();
function snapshot(){history.push(JSON.stringify({beads,attached}));if(history.length>40)history.shift();}
function bead(type,letter='',variant=0){
 const variants=ART[type];if(!variants)return '';
 const art=variants[Math.abs(variant)%variants.length],size=type==='rabbit'?70:36;
 return `<svg x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" viewBox="${art.box.join(' ')}" preserveAspectRatio="xMidYMid meet" overflow="visible"><image href="${art.src}" width="1000" height="1000"/></svg>${type==='letter'?`<image class="bead-letter" href="assets/drawn-ui/lettre_${cleanWord(letter).slice(0,1)||'A'}.png" x="-11" y="-12" width="22" height="24" preserveAspectRatio="xMidYMid meet" pointer-events="none"/>`:''}`;
}
// Original 1600 × 2400 PNG layers share the same placement, without redrawing.
// Hidden centerline measured from IMG_5260.png. The clasp area above y=1055
// in the source canvas is reserved, so bead slots never touch the strap.
const CHARM_ART={scale:.23,x:-10.575,y:-27.72};
const CHARM_BEAD_SCALE=.62;
const STRING_GUIDE=[[165.38,214.93],[164.56,218.28],[163.76,221.63],[162.61,224.84],[161.92,228.24],[161.23,231.64],[160.15,234.88],[159.39,238.25],[158.35,241.5],[157.54,244.85],[156.64,248.16],[155.74,251.47],[154.92,254.82],[154.1,258.17],[153.42,261.56],[152.49,264.87],[151.66,268.21],[150.88,271.57],[150.2,274.97],[149.5,278.37],[149.04,281.86],[148.39,285.28],[147.9,288.76],[147.66,292.35],[147.2,295.84],[146.98,299.43],[146.74,303.02],[146.51,306.61],[146.51,310.29],[146.51,313.98],[146.51,317.47],[146.74,321.06],[146.98,324.65],[147.31,328.2],[147.66,331.74],[148.13,335.23],[148.79,338.64],[149.04,342.22],[149.73,345.62],[150.2,349.11],[150.66,352.61],[151.11,356.1],[151.57,359.6],[152.26,363.0],[152.95,366.39],[153.64,369.79],[154.35,373.19],[155.17,376.53],[156.15,379.81],[156.96,383.16],[158.11,386.37],[159.39,389.52],[160.71,392.66],[161.92,395.84],[163.76,398.77],[165.38,401.78],[167.22,404.71],[169.03,407.64],[171.14,410.45],[173.1,413.32],[175.05,416.2],[177.17,419.01],[179.61,421.68],[181.9,424.42],[184.41,426.93],[187.28,428.89],[190.29,430.52],[193.53,431.59],[196.93,432.28],[200.33,432.97],[203.92,433.2],[207.32,433.43],[210.81,433.43],[214.12,432.51],[217.32,431.36],[220.21,429.43],[222.16,426.55],[223.31,423.34],[224.48,420.14],[226.08,417.12],[227.24,413.92],[227.7,410.42],[227.94,406.83],[227.94,403.15],[228.16,399.56],[228.16,395.87],[228.4,392.28],[228.62,388.69],[228.87,385.11],[228.86,381.61],[228.15,378.22],[227.17,374.94],[226.1,371.7],[225.18,368.4],[224.26,365.09],[223.8,361.6],[223.1,358.2],[222.64,354.7],[222.18,351.21],[221.94,347.63],[221.5,344.13],[221.04,340.63],[220.58,337.14],[219.88,333.74],[219.42,330.24],[218.96,326.75],[218.74,323.16],[218.28,319.67],[218.04,316.08],[217.65,312.61],[217.58,309.09],[217.36,305.5],[217.12,301.91],[216.66,298.41],[216.2,294.92],[215.98,291.33],[216.2,287.74],[216.2,284.25],[215.98,280.66],[215.74,277.07],[215.06,273.67],[214.6,270.17],[213.9,266.77],[213.22,263.37],[212.76,259.88],[212.52,256.29],[212.06,252.8],[211.83,249.21],[211.14,245.81],[210.21,242.51],[209.3,239.2],[208.61,235.8],[207.92,232.4],[207.43,228.92],[207.0,225.41],[206.78,221.82],[206.12,218.41],[205.62,214.93]];
const STRING_SLOTS=(()=>{
 const distances=[0];
 for(let i=1;i<STRING_GUIDE.length;i++){
  const a=STRING_GUIDE[i-1],b=STRING_GUIDE[i];
  distances.push(distances[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]));
 }
 const length=distances[distances.length-1];
 return Array.from({length:MAX},(_,slot)=>{
  const distance=length*slot/(MAX-1);
  const i=Math.max(1,distances.findIndex(d=>d>=distance));
  const a=STRING_GUIDE[i-1],b=STRING_GUIDE[i];
  const t=(distance-distances[i-1])/(distances[i]-distances[i-1]);
  return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t};
 });
})();
function onString(point){
 // A drop on the strap or its clasp must not snap onto the first bead slot.
 if(point.y<205)return false;
 return STRING_GUIDE.some((b,i)=>{
  if(!i)return false;
  const a=STRING_GUIDE[i-1],dx=b[0]-a[0],dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(point.x-a[0]-t*dx,point.y-a[1]-t*dy)<=25;
 });
}
function slotPoint(slot){return STRING_SLOTS[slot];}
function nearestSlot(point,exclude=-1){
 const used=new Set(beads.filter((_,i)=>i!==exclude).map(b=>b.slot));
 let best=-1,distance=Infinity;
 for(let slot=0;slot<MAX;slot++){if(used.has(slot))continue;const p=slotPoint(slot),d=Math.hypot(p.x-point.x,p.y-point.y);if(d<distance){best=slot;distance=d;}}
 return best;
}
function charmMarkup(interactive=false){
 const nodes=beads.map((b,i)=>{
  const p=slotPoint(b.slot),label=b.type==='letter'?t().letter+' '+b.letter:t().names[TYPES.indexOf(b.type)];
  return `<g transform="translate(${p.x} ${p.y})" ${interactive?`data-bead-index="${i}" role="button" tabindex="0" aria-label="${label} · ${i+1}"`:''}><circle r="15" fill="transparent"/><g transform="scale(${CHARM_BEAD_SCALE})">${bead(b.type,b.letter,b.variant)}</g></g>`;
 }).join('');
 return `<g class="bead-charm-art" transform="translate(${CHARM_ART.x} ${CHARM_ART.y}) scale(${CHARM_ART.scale})" pointer-events="none"><image class="bead-string-art" href="assets/beads/IMG_5260.png" width="1600" height="2400"/><image class="bead-strap-art" href="assets/beads/IMG_5259.png" width="1600" height="2400"/></g>${nodes}<g transform="translate(204.48 465.43)" pointer-events="none">${bead('rabbit')}</g>`;
}
function announce(message){const live=document.querySelector('#bead-status');if(live)live.textContent=message;}
function refresh(message=''){
 updateRoomCharm();const stage=document.querySelector('#bead-charm');if(!stage)return;
 stage.innerHTML=charmMarkup(true);
 document.querySelector('[data-bead-action="undo"]').disabled=!history.length;
 document.querySelector('[data-bead-action="reset"]').disabled=!beads.length;
 document.querySelector('[data-bead-action="shop"]').disabled=!beads.length;
 const attach=document.querySelector('[data-bead-action="attach"]');attach.disabled=!beads.length;attach.textContent=attached?t().detach:t().attach;
 if(message)announce(message);
}
function add(items,point=null){
 if(beads.length+items.length>MAX){announce(t().full);return;}
 snapshot();
 for(const item of items){const slot=point?nearestSlot(point):Array.from({length:MAX},(_,i)=>i).find(i=>!beads.some(b=>b.slot===i));beads.push({...item,...(item.type==='letter'?{variant:randomLetterVariant(),colorAssigned:true}:{}),slot});}
 persist();refresh(t().added);
}
function remove(index){if(!beads[index])return;snapshot();beads.splice(index,1);persist();refresh(t().removed);}
function panel(){const w=t();return `<section id="bead-workshop" data-no-translate aria-label="${w.title}">
 <div class="bead-layout"><div class="bead-supplies">
 <p class="bead-intro">${w.intro}</p>
 <div class="bead-trays">${TYPES.map((type,i)=>`<section class="bead-tray" aria-label="${w.names[i]}"><h3>${w.names[i]}</h3><div class="bead-choices">${ART[type].map((art,variant)=>`<button type="button" class="bead-choice" data-add-bead="${type}" data-variant="${variant}" aria-label="${w.names[i]} ${variant+1}"><svg viewBox="-25 -25 50 50" aria-hidden="true">${bead(type,'',variant)}</svg></button>`).join('')}</div></section>`).join('')}</div>
 <div class="bead-word"><label for="bead-word-input">${w.word}</label><div><input id="bead-word-input" maxlength="20" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" autocapitalize="characters" placeholder="NANA"><button type="button" class="bead-control" data-bead-action="word">${w.thread}</button></div></div>
 </div>
 <div class="bead-making"><h2>${w.yours}</h2><svg id="bead-charm" viewBox="110 0 220 515" role="group" aria-label="${w.yours}"></svg><p class="bead-hint">${w.hint}</p>
 <div class="bead-pendants"><span>${w.pendant}</span><svg width="44" height="55" viewBox="-38 -38 76 76" role="img" aria-label="${language()==='fr'?'Lapin rose':'Pink bunny'}">${bead('rabbit')}</svg><button class="bead-control" type="button" data-bead-action="swing">${w.swing}</button></div></div></div>
 <div class="bead-bottom"><div class="bead-footer"><button class="bead-control bead-attach" type="button" data-bead-action="attach">${w.attach}</button><button class="bead-control" type="button" data-bead-action="undo">${w.undo}</button><button class="bead-control" type="button" data-bead-action="reset">${w.reset}</button></div>
 <div class="bead-purchase"><button class="bead-control bead-attach" type="button" data-bead-action="shop"><svg class="bead-shop-icon" viewBox="167 157 164 194" aria-hidden="true" focusable="false"><image href="assets/dock/IMG_5002.png" width="500" height="500"/></svg><span>${w.buy}</span></button><p class="bead-note">${w.buyNote}</p></div></div><p id="bead-status" role="status" aria-live="polite"></p></section>`;}
function open(){cancelDrag();window.openWindow(t().title,panel(),'bead-box');refresh();}
function stagePoint(x,y){
 const stage=document.querySelector('#bead-charm'),matrix=stage?.getScreenCTM();if(!matrix)return null;
 const p=new DOMPoint(x,y).matrixTransform(matrix.inverse());
 return onString(p)?p:null;
}
function cancelDrag(){if(!drag)return;drag.ghost?.remove();try{drag.source.releasePointerCapture(drag.id);}catch(_){}drag=null;document.querySelector('#bead-charm')?.classList.remove('bead-drop-ready');}
document.addEventListener('pointerdown',e=>{
 const source=e.target.closest('#bead-workshop [data-add-bead],#bead-workshop [data-bead-index]');
 if(!source||!e.isPrimary||e.button!==0)return;
 const index=source.hasAttribute('data-bead-index')?Number(source.dataset.beadIndex):-1;
 drag={source,id:e.pointerId,index,item:index>=0?{...beads[index]}:{type:source.dataset.addBead,variant:Number(source.dataset.variant)},x:e.clientX,y:e.clientY,moved:false};
 source.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;
 e.preventDefault();
 if(!drag.moved){drag.moved=true;drag.ghost=document.createElement('div');drag.ghost.className='bead-drag-ghost';drag.ghost.setAttribute('aria-hidden','true');drag.ghost.innerHTML=`<svg viewBox="-25 -25 50 50">${bead(drag.item.type,drag.item.letter,drag.item.variant)}</svg>`;document.body.appendChild(drag.ghost);}
 drag.ghost.style.transform=`translate(${e.clientX-27}px,${e.clientY-27}px)`;
 document.querySelector('#bead-charm')?.classList.toggle('bead-drop-ready',Boolean(stagePoint(e.clientX,e.clientY)));
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const current=drag,point=stagePoint(e.clientX,e.clientY),target=document.elementFromPoint(e.clientX,e.clientY);cancelDrag();
 if(!current.moved)return;
 suppressClickUntil=Date.now()+500;e.preventDefault();
 if(point){
  if(current.index<0)add([current.item],point);
  else{const slot=nearestSlot(point,current.index);if(slot>=0&&slot!==beads[current.index].slot){snapshot();beads[current.index].slot=slot;persist();refresh();}}
 }else if(current.index>=0&&target?.closest('.bead-supplies'))remove(current.index);
});
document.addEventListener('pointercancel',cancelDrag);
window.addEventListener('blur',cancelDrag);
document.addEventListener('click',e=>{
 if(!e.target.closest('#bead-workshop'))return;
 if(Date.now()<suppressClickUntil){e.preventDefault();return;}
 const choice=e.target.closest('[data-add-bead]'),item=e.target.closest('[data-bead-index]'),action=e.target.closest('[data-bead-action]');
 if(choice)add([{type:choice.dataset.addBead,variant:Number(choice.dataset.variant)}]);
 else if(item)remove(Number(item.dataset.beadIndex));
 else if(action)switch(action.dataset.beadAction){
  case 'word':{const value=cleanWord(document.querySelector('#bead-word-input').value);if(value){add([...value].map(letter=>({type:'letter',letter})));document.querySelector('#bead-word-input').blur();}break;}
  case 'undo':if(history.length){const prev=JSON.parse(history.pop());beads=prev.beads;attached=prev.attached;persist();refresh();}break;
  case 'reset':snapshot();beads=[];attached=false;persist();refresh();break;
  case 'shop':persist();if(window.NanaDeepLinks)window.NanaDeepLinks.open('shop/bijou-personnalise');else document.getElementById('nana-shop-bag')?.click();break;
  case 'attach':snapshot();attached=!attached;persist();refresh();if(attached)document.querySelector('#window-close')?.click();break;
  case 'swing':{const stage=document.querySelector('#bead-charm');stage.classList.remove('bead-swing');void stage.getBoundingClientRect();stage.classList.add('bead-swing');break;}
 }
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')cancelDrag();
 if(e.target.id==='bead-word-input'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-bead-action="word"]').click();}
 const item=e.target.closest('[data-bead-index]');if(!item)return;
 const i=Number(item.dataset.beadIndex);
 if(['Enter',' ','Delete','Backspace'].includes(e.key)){e.preventDefault();remove(i);}
 if(['ArrowLeft','ArrowRight'].includes(e.key)){
  e.preventDefault();const direction=e.key==='ArrowLeft'?-1:1;
  for(let slot=beads[i].slot+direction;slot>=0&&slot<MAX;slot+=direction){if(beads.some(b=>b.slot===slot))continue;snapshot();beads[i].slot=slot;persist();refresh();document.querySelector(`[data-bead-index="${i}"]`)?.focus();break;}
 }
});
document.addEventListener('portfolio-language-change',()=>{
 document.querySelector('#nana-bead-box-shelf')?.setAttribute('aria-label',t().title);
 updateRoomCharm();if(document.querySelector('#bead-workshop'))open();
});
// iOS pans the visual viewport when its keyboard opens. Anchor this window
// to that visible area and reveal the input using the inner scroll pane only.
let keyboardBaseHeight=0,keyboardFrame=0;
function syncBeadKeyboard(){
 keyboardFrame=0;
 const shade=document.getElementById('window-shade');
 const input=document.getElementById('bead-word-input');
 const viewport=window.visualViewport;
 const focused=input&&document.activeElement===input;
 const visibleHeight=viewport?.height||window.innerHeight;
 const zoomed=viewport&&Math.abs(viewport.scale-1)>.01;
 const keyboardOpen=focused&&!zoomed&&keyboardBaseHeight-visibleHeight>100;
 shade?.classList.toggle('bead-keyboard-open',Boolean(keyboardOpen));
 if(!keyboardOpen)return;
 const top=viewport?.offsetTop||0;
 const menuBottom=document.getElementById('menubar')?.getBoundingClientRect().bottom||0;
 const safeTop=Math.max(top,menuBottom)+8;
 shade.style.setProperty('--bead-keyboard-top',safeTop+'px');
 shade.style.setProperty('--bead-keyboard-height',Math.max(120,top+visibleHeight-safeTop-8)+'px');
 const pane=document.getElementById('window-content');
 if(!pane)return;
 const bounds=pane.getBoundingClientRect(),field=input.getBoundingClientRect();
 if(field.bottom>bounds.bottom-12)pane.scrollTop+=field.bottom-bounds.bottom+12;
 else if(field.top<bounds.top+12)pane.scrollTop-=bounds.top+12-field.top;
}
function scheduleBeadKeyboard(){if(!keyboardFrame)keyboardFrame=requestAnimationFrame(syncBeadKeyboard);}
document.addEventListener('focusin',e=>{
 if(e.target.id!=='bead-word-input')return;
 keyboardBaseHeight=Math.max(window.innerHeight,document.documentElement.clientHeight,window.visualViewport?.height||0);
 scheduleBeadKeyboard();
});
document.addEventListener('focusout',e=>{if(e.target.id==='bead-word-input')scheduleBeadKeyboard();});
window.visualViewport?.addEventListener('resize',scheduleBeadKeyboard,{passive:true});
window.visualViewport?.addEventListener('scroll',scheduleBeadKeyboard,{passive:true});
window.addEventListener('resize',scheduleBeadKeyboard,{passive:true});
window.NanaBeadBox={open};
function updateRoomCharm(){
 const svg=document.querySelector('#hotspots');if(!svg)return;
 let charm=document.querySelector('#nana-phone-charm');
 if(!charm){charm=document.createElementNS('http://www.w3.org/2000/svg','g');charm.id='nana-phone-charm';charm.setAttribute('data-open','bead-box');charm.setAttribute('role','button');charm.setAttribute('tabindex','0');charm.setAttribute('transform','translate(1153 805) rotate(8) scale(.16) translate(-272 -12)');svg.appendChild(charm);charm.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});}
 charm.setAttribute('aria-label',t().roomCharm);charm.style.display=attached&&beads.length?'':'none';charm.innerHTML=attached&&beads.length?'<rect x="70" y="0" width="300" height="515" fill="transparent" pointer-events="all"/>'+charmMarkup():'';
}
function mount(){
 const svg=document.querySelector('#hotspots');if(!svg)return;
 const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.id='nana-bead-box-shelf';g.setAttribute('transform','translate(278 112)');g.setAttribute('data-open','bead-box');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label',t().title);
 g.innerHTML='<defs><clipPath id="bead-shelf-support-clip"><path d="M-8 -10 H60 V55.2 L-8 36.9Z"/></clipPath><filter id="bead-box-night-colors" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 .034 0 0 .008 0 .66 0 0 .008 0 .7 0 0 .208 0 0 0 1 0"/></filter></defs><g clip-path="url(#bead-shelf-support-clip)"><g class="bead-shelf-art"><image id="bead-box-shelf-ink" href="assets/IMG_5128.png" x="-2" y="3.2" width="58" height="58"/></g><use href="#bead-box-shelf-ink" class="bead-shelf-outline" filter="url(#nana-room-hover-ring)" pointer-events="none"/></g>';
 svg.appendChild(g);updateRoomCharm();
 g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

