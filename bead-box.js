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
 return `<svg x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" viewBox="${art.box.join(' ')}" preserveAspectRatio="xMidYMid meet" overflow="visible"><image href="${art.src}" width="1000" height="1000"/></svg>${type==='letter'?`<text class="bead-letter" x="0" y="0" text-anchor="start" fill="#ff173b" font-family="Nana Trace UI,Arial,sans-serif" font-size="24" pointer-events="none">${cleanWord(letter).slice(0,1)||'A'}</text>`:''}`;
}
// SVG getBBox includes font line metrics in browsers. Canvas gives the actual
// glyph ink bounds; combine these with the tightly cropped bead artwork.
let letterMetrics;
function centerLetters(root){
 for(const text of root?.querySelectorAll?.('text.bead-letter')||[]){
  text.setAttribute('x','0');text.setAttribute('y','0');
  letterMetrics??=document.createElement?.('canvas')?.getContext?.('2d');
  if(letterMetrics){
   letterMetrics.font='24px "Nana Trace UI",Arial,sans-serif';
   letterMetrics.textAlign='left';letterMetrics.textBaseline='alphabetic';
   const m=letterMetrics.measureText(text.textContent);
   if([m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent].every(Number.isFinite)){
    text.setAttribute('x',String((m.actualBoundingBoxLeft-m.actualBoundingBoxRight)/2));
    text.setAttribute('y',String((m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2));
    continue;
   }
  }
  const box=text.getBBox();
  if(box.width>0&&box.height>0){text.setAttribute('x',String(-box.x-box.width/2));text.setAttribute('y',String(-box.y-box.height/2));}
 }
}
document.fonts?.ready.then(()=>centerLetters(document));
// The drawn string and bead positions share one asymmetric curve. A future
// hand-drawn string can replace these control points without changing saved slots.
const STRING_START=[220,105];
const STRING_CURVES=[
 [185,104,160,126,143,155],
 [125,186,129,207,117,239],
 [103,271,111,309,130,341],
 [151,377,176,420,220,422],
 [258,425,290,395,311,359],
 [335,320,338,279,328,241],
 [318,207,327,183,300,149],
 [280,124,250,105,220,105]
];
const STRING_PATH=`M${STRING_START.join(' ')} `+STRING_CURVES.map(c=>'C'+c.join(' ')).join(' ');
const STRING_SLOTS=(()=>{
 const points=[{x:STRING_START[0],y:STRING_START[1],distance:0}];
 let start=STRING_START;
 for(const [x1,y1,x2,y2,x3,y3] of STRING_CURVES){
  for(let step=1;step<=32;step++){
   const t=step/32,u=1-t;
   const x=u*u*u*start[0]+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3;
   const y=u*u*u*start[1]+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3;
   const previous=points[points.length-1];
   points.push({x,y,distance:previous.distance+Math.hypot(x-previous.x,y-previous.y)});
  }
  start=[x3,y3];
 }
 const total=points[points.length-1].distance;
 return Array.from({length:MAX},(_,slot)=>{
  const distance=total*(.045+.91*slot/(MAX-1));
  const i=points.findIndex(p=>p.distance>=distance),a=points[i-1],b=points[i];
  const t=(distance-a.distance)/(b.distance-a.distance);
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
 });
})();
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
  return `<g transform="translate(${p.x} ${p.y})" ${interactive?`data-bead-index="${i}" role="button" tabindex="0" aria-label="${label} · ${i+1}"`:''}><circle r="23" fill="transparent"/>${bead(b.type,b.letter,b.variant)}</g>`;
 }).join('');
 return `<path d="M220 105 C209 87 195 66 197 45 C198 25 211 21 225 28 C244 37 248 53 240 72 C235 85 226 96 220 105" fill="none" stroke="#ff79bc" stroke-width="4.5" stroke-linecap="round"/><path class="bead-string" d="${STRING_PATH}" fill="none" stroke="#ff79bc" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="220" cy="105" r="9" fill="#f8b2d4" stroke="#ff173b" stroke-width="2"/>${nodes}<path d="M216 422 C211 429 211 439 219 442 C228 443 230 431 224 423" fill="none" stroke="#ff173b" stroke-width="3"/><g transform="translate(220 465)">${bead('rabbit')}</g>`;
}
function announce(message){const live=document.querySelector('#bead-status');if(live)live.textContent=message;}
function refresh(message=''){
 updateRoomCharm();const stage=document.querySelector('#bead-charm');if(!stage)return;
 stage.innerHTML=charmMarkup(true);centerLetters(stage);
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
 <div class="bead-making"><h2>${w.yours}</h2><svg id="bead-charm" viewBox="0 0 440 515" role="group" aria-label="${w.yours}"></svg><p class="bead-hint">${w.hint}</p>
 <div class="bead-pendants"><span>${w.pendant}</span><svg width="44" height="55" viewBox="-38 -38 76 76" role="img" aria-label="${language()==='fr'?'Lapin rose':'Pink bunny'}">${bead('rabbit')}</svg><button class="bead-control" type="button" data-bead-action="swing">${w.swing}</button></div></div></div>
 <div class="bead-bottom"><div class="bead-footer"><button class="bead-control bead-attach" type="button" data-bead-action="attach">${w.attach}</button><button class="bead-control" type="button" data-bead-action="undo">${w.undo}</button><button class="bead-control" type="button" data-bead-action="reset">${w.reset}</button></div>
 <div class="bead-purchase"><button class="bead-control bead-attach" type="button" data-bead-action="shop"><svg class="bead-shop-icon" viewBox="167 157 164 194" aria-hidden="true" focusable="false"><image href="assets/dock/IMG_5002.png" width="500" height="500"/></svg><span>${w.buy}</span></button><p class="bead-note">${w.buyNote}</p></div></div><p id="bead-status" role="status" aria-live="polite"></p></section>`;}
function open(){cancelDrag();window.openWindow(t().title,panel(),'bead-box');refresh();}
function stagePoint(x,y){
 const stage=document.querySelector('#bead-charm'),matrix=stage?.getScreenCTM();if(!matrix)return null;
 const p=new DOMPoint(x,y).matrixTransform(matrix.inverse());
 return p.x>=40&&p.x<=400&&p.y>=75&&p.y<=440?p:null;
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
 if(!drag.moved){drag.moved=true;drag.ghost=document.createElement('div');drag.ghost.className='bead-drag-ghost';drag.ghost.setAttribute('aria-hidden','true');drag.ghost.innerHTML=`<svg viewBox="-25 -25 50 50">${bead(drag.item.type,drag.item.letter,drag.item.variant)}</svg>`;document.body.appendChild(drag.ghost);centerLetters(drag.ghost);}
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
  case 'shop':persist();document.getElementById('nana-shop-bag')?.click();break;
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
 if(!charm){charm=document.createElementNS('http://www.w3.org/2000/svg','g');charm.id='nana-phone-charm';charm.setAttribute('data-open','bead-box');charm.setAttribute('role','button');charm.setAttribute('tabindex','0');charm.setAttribute('transform','translate(1153 805) rotate(8) scale(.16) translate(-220 -24)');svg.appendChild(charm);charm.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});}
 charm.setAttribute('aria-label',t().roomCharm);charm.style.display=attached&&beads.length?'':'none';charm.innerHTML=attached&&beads.length?'<rect x="70" y="0" width="300" height="515" fill="transparent" pointer-events="all"/>'+charmMarkup():'';centerLetters(charm);
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

