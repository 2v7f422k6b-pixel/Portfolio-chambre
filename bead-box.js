/* A tactile, local-only phone-charm workshop. Original PNG artwork drawn by Léna. */
(() => {
'use strict';
const KEY='nana-bead-charm-v1', MAX=20;
const TYPES=['star','heart','flower'];
const ART={"star":[{"src":"assets/beads/IMG_5133.png","box":[23,39,840,836]},{"src":"assets/beads/IMG_5134.png","box":[76,31,762,808]},{"src":"assets/beads/IMG_5135.png","box":[52,140,813,778]},{"src":"assets/beads/IMG_5136.png","box":[78,52,832,908]}],"flower":[{"src":"assets/beads/IMG_5139.png","box":[109,177,759,752]},{"src":"assets/beads/IMG_5140.png","box":[109,177,759,752]},{"src":"assets/beads/IMG_5141.png","box":[109,177,759,752]},{"src":"assets/beads/IMG_5142.png","box":[107,232,725,651]},{"src":"assets/beads/IMG_5143.png","box":[107,232,725,651]},{"src":"assets/beads/IMG_5144.png","box":[107,232,725,651]}],"heart":[{"src":"assets/beads/IMG_5145.png","box":[109,205,621,687]},{"src":"assets/beads/IMG_5146.png","box":[67,176,714,665]},{"src":"assets/beads/IMG_5147.png","box":[82,138,704,675]},{"src":"assets/beads/IMG_5148.png","box":[109,205,621,687]},{"src":"assets/beads/IMG_5149.png","box":[67,176,714,665]},{"src":"assets/beads/IMG_5150.png","box":[82,138,704,675]}],"rabbit":[{"src":"assets/beads/IMG_5132.png","box":[306,67,461,901]}]};
const embeddedArt=new Map();
const words={
 fr:{title:'Boîte à perles',intro:'Choisis tes perles, compose ton bijou.',box:'La boîte à perles',yours:'Ton bijou',hint:'Touche une perle du bijou pour la déplacer ou la retirer.',names:['Étoile','Cœur','Fleur'],word:'Un prénom, un mot…',thread:'Enfiler',letter:'Lettre',left:'Avant',right:'Après',remove:'Retirer',undo:'Annuler',reset:'Recommencer',save:'Garder mon bijou',swing:'Faire danser',pendant:'Pendentif',empty:'Ton fil attend ses premières perles.',full:'Le fil est plein ! Retire une perle pour en ajouter une autre.',added:'Perle ajoutée',removed:'Perle retirée',saved:'Ton bijou est prêt à être enregistré.',failed:'Le téléchargement a échoué. Réessaie.',count:'perles',selected:'Perle sélectionnée',local:'Ton bijou est conservé sur cet appareil.',choose:'Sélectionne une perle sur le bijou.',exporting:'Préparation…',attach:'Accrocher au téléphone',detach:'Décrocher du téléphone',roomCharm:'Modifier le bijou du téléphone',buy:'Je veux le même !',buyNote:'Commander mon bijou fait main par Léna'},
 en:{title:'Bead Box',intro:'Pick your beads, make your charm.',box:'The bead box',yours:'Your charm',hint:'Tap a bead on your charm to move or remove it.',names:['Star','Heart','Flower'],word:'A name, a word…',thread:'Thread',letter:'Letter',left:'Earlier',right:'Later',remove:'Remove',undo:'Undo',reset:'Start again',save:'Keep my charm',swing:'Make it dance',pendant:'Pendant',empty:'Your string is waiting for its first beads.',full:'The string is full! Remove a bead to add another.',added:'Bead added',removed:'Bead removed',saved:'Your charm is ready to save.',failed:'Download failed. Please try again.',count:'beads',selected:'Selected bead',local:'Your charm is saved on this device.',choose:'Select a bead on your charm.',exporting:'Preparing…',attach:'Attach to phone',detach:'Detach from phone',roomCharm:'Edit the phone charm',buy:'I want one too!',buyNote:'Order my charm, handmade by Léna'}
};
const language=()=>document.documentElement.lang.startsWith('en')?'en':'fr';
const t=()=>words[language()];
let beads=[],pendant='heart',selected=-1,history=[],busy=false,attached=false;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(saved?.beads)){beads=saved.beads.filter(b=>TYPES.includes(b?.type)).slice(0,MAX).map(b=>({type:b.type,variant:Number.isInteger(b.variant)?Math.abs(b.variant)%ART[b.type].length:0}));pendant=['star','rabbit'].includes(saved.pendant)?saved.pendant:'heart';attached=saved.attached===true;}}catch(_){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({beads,pendant,attached}));}catch(_){}};
function snapshot(){history.push(JSON.stringify({beads,pendant,attached}));if(history.length>40)history.shift();}
function bead(type,unused='',variant=0){
 const variants=ART[type];if(!variants)return '';
 const art=variants[Math.abs(variant)%variants.length],size=type==='rabbit'?70:44;
 const href=embeddedArt.get(art.src)||art.src;
 return `<svg x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" viewBox="${art.box.join(' ')}" preserveAspectRatio="xMidYMid meet" overflow="visible"><image href="${href}" width="1000" height="1000"/></svg>`;
}
function charmMarkup(interactive=false){
 const count=Math.max(14,beads.length),step=(Math.PI*2-.65)/(count-1);
 const nodes=beads.map((b,i)=>{
  const angle=-Math.PI/2-.325-step*i;
  const x=220+104*Math.cos(angle),y=260+158*Math.sin(angle);
  const label=t().names[TYPES.indexOf(b.type)]+' '+(i+1);
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" ${interactive?`data-bead-index="${i}" role="button" tabindex="0" aria-label="${label}" aria-pressed="${selected===i}"`:''}><circle r="25" fill="transparent"/>${interactive&&selected===i?'<circle r="25" fill="none" stroke="#ff3159" stroke-width="2" stroke-dasharray="3 4"/>':''}${`<g transform="scale(${Math.min(1,14/Math.max(1,beads.length)).toFixed(3)})">${bead(b.type,'',b.variant)}</g>`}</g>`;
 }).join('');
 return `<path d="M220 105 C160 25 215 7 238 35 C258 63 229 94 220 105 M220 104 C70 100 65 412 220 423 C375 412 370 100 220 104" fill="none" stroke="#ff79bc" stroke-width="5" stroke-linecap="round"/><path d="M221 104 C175 35 214 22 231 39" fill="none" stroke="#ffe4f0" stroke-width="2"/><circle cx="220" cy="105" r="9" fill="#f8b2d4" stroke="#ff3159" stroke-width="2"/>${nodes}<path d="M216 424 Q208 440 220 444 Q232 440 224 424" fill="none" stroke="#ff3159" stroke-width="3"/><g transform="translate(220 465) scale(${pendant==='rabbit'?1:1.25})">${bead(pendant)}</g>`;
}
function announce(message){const live=document.querySelector('#bead-status');if(live)live.textContent=message;}
function refresh(message=''){
 updateRoomCharm();
 const stage=document.querySelector('#bead-charm');if(!stage)return;
 stage.innerHTML=charmMarkup(true);
 document.querySelector('#bead-count').textContent=`${beads.length} / ${MAX} ${t().count}`;
 document.querySelector('#bead-empty').hidden=beads.length>0;
 document.querySelectorAll('[data-bead-edit]').forEach(b=>b.disabled=selected<0);
 document.querySelector('[data-bead-edit="left"]').disabled=selected<=0;
 document.querySelector('[data-bead-edit="right"]').disabled=selected<0||selected>=beads.length-1;
 document.querySelector('[data-bead-action="undo"]').disabled=!history.length;
 document.querySelector('[data-bead-action="reset"]').disabled=!beads.length;
 document.querySelector('[data-bead-action="save"]').disabled=!beads.length||busy;
 document.querySelector('[data-bead-action="shop"]').disabled=!beads.length;
 const attachButton=document.querySelector('[data-bead-action="attach"]');attachButton.disabled=!beads.length;attachButton.textContent=attached?t().detach:t().attach;
 document.querySelector('#bead-selection').textContent=selected<0?t().choose:`${t().selected} : ${selected+1}`;
 document.querySelectorAll('[data-pendant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pendant===pendant)));
 if(message)announce(message);
}
function add(items){
 if(beads.length+items.length>MAX){announce(t().full);return;}
 snapshot();beads.push(...items);selected=-1;persist();refresh(t().added);
}
function panel(){const w=t();return `<section id="bead-workshop" data-no-translate aria-label="${w.title}">
 <p class="bead-intro">${w.intro}</p>
 <div class="bead-layout"><div class="bead-supplies"><h2>${w.box}</h2>
 <div class="bead-box-lid" aria-hidden="true"><svg width="38" height="42" viewBox="-25 -25 50 50">${bead('heart')}</svg><svg width="38" height="42" viewBox="-25 -25 50 50">${bead('star')}</svg><svg width="38" height="42" viewBox="-25 -25 50 50">${bead('heart')}</svg></div>
 <div class="bead-trays">${TYPES.map((type,i)=>ART[type].map((art,variant)=>`<button type="button" class="bead-tray" data-add-bead="${type}" data-variant="${variant}" aria-label="${w.names[i]} ${variant+1}"><svg viewBox="-30 -30 60 60" aria-hidden="true">${bead(type,'',variant)}</svg><span>${w.names[i]} ${variant+1}</span></button>`).join('')).join('')}</div>
 <p class="bead-note">${w.local}<br>${language()==='fr'?'Le lapin rose est un pendentif unique : un seul par création. Toutes les perles sont dessinées par Léna.':'The pink bunny is a unique pendant: one per creation. All beads are drawn by Léna.'}</p></div>
 <div class="bead-making"><div class="bead-stage-heading"><h2>${w.yours}</h2><span id="bead-count"></span></div>
 <svg id="bead-charm" viewBox="0 0 440 515" role="group" aria-label="${w.yours}"></svg>
 <p id="bead-empty">${w.empty}</p><p class="bead-hint">${w.hint}</p>
 <p id="bead-selection"></p><div class="bead-editing">${[['left','← '+w.left],['right',w.right+' →'],['remove',w.remove]].map(([id,label])=>`<button type="button" class="bead-control" data-bead-edit="${id}">${label}</button>`).join('')}</div>
 <div class="bead-pendants"><span>${w.pendant}</span>${['heart','star','rabbit'].map(type=>`<button type="button" class="bead-pendant" data-pendant="${type}" aria-label="${type==='rabbit'?(language()==='fr'?'Lapin rose · un seul par création':'Pink bunny · one per creation'):w.names[TYPES.indexOf(type)]}"><svg viewBox="-38 -38 76 76" aria-hidden="true">${bead(type)}</svg></button>`).join('')}<button class="bead-control" type="button" data-bead-action="swing">${w.swing}</button></div></div></div>
 <div class="bead-footer"><button class="bead-control bead-attach" type="button" data-bead-action="attach">${w.attach}</button><button class="bead-control" type="button" data-bead-action="undo">${w.undo}</button><button class="bead-control" type="button" data-bead-action="reset">${w.reset}</button><button class="bead-control bead-save" type="button" data-bead-action="save">${w.save}</button></div><div class="bead-purchase"><button class="bead-control bead-attach" type="button" data-bead-action="shop">${w.buy}</button><p class="bead-note">${w.buyNote}</p></div><p id="bead-status" role="status" aria-live="polite"></p></section>`;}
function open(){window.openWindow(t().title,panel(),'bead-box');refresh();}
async function download(){
 if(busy||!beads.length)return;busy=true;refresh(t().exporting);
 let url;
 try{
  const sources=[...new Set([...beads.map(b=>ART[b.type][b.variant%ART[b.type].length].src),ART[pendant][0].src])];
  await Promise.all(sources.map(async src=>{
   if(embeddedArt.has(src))return;
   const response=await fetch(src);if(!response.ok)throw Error('Artwork download');
   const blob=await response.blob();
   const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
   embeddedArt.set(src,data);
  }));
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200" viewBox="0 0 440 528"><rect width="440" height="528" fill="#fff8e9"/>${charmMarkup()}<text x="220" y="520" text-anchor="middle" font-family="monospace" font-size="9" fill="#f3264f">Nana Color Studio</text></svg>`;
  url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1200;canvas.getContext('2d').drawImage(image,0,0,1000,1200);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG export');
  const png=URL.createObjectURL(blob),a=document.createElement('a');a.href=png;a.download='nana-mon-bijou.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(png),30000);announce(t().saved);
 }catch(_){announce(t().failed);}finally{if(url)URL.revokeObjectURL(url);busy=false;refresh();}
}
document.addEventListener('click',e=>{
 const root=e.target.closest('#bead-workshop');if(!root)return;
 const addButton=e.target.closest('[data-add-bead]'),item=e.target.closest('[data-bead-index]'),edit=e.target.closest('[data-bead-edit]'),pend=e.target.closest('[data-pendant]'),action=e.target.closest('[data-bead-action]');
 if(addButton){add([{type:addButton.dataset.addBead,variant:Number(addButton.dataset.variant)}]);}
 else if(item){selected=Number(item.dataset.beadIndex);refresh();}
 else if(edit&&selected>=0){snapshot();const kind=edit.dataset.beadEdit;if(kind==='remove'){beads.splice(selected,1);selected=-1;}else{const to=selected+(kind==='left'?-1:1);if(to>=0&&to<beads.length){[beads[to],beads[selected]]=[beads[selected],beads[to]];selected=to;}}persist();refresh();}
 else if(pend){snapshot();pendant=pend.dataset.pendant;persist();refresh();}
 else if(action){switch(action.dataset.beadAction){
  case 'undo':if(history.length){const prev=JSON.parse(history.pop());beads=prev.beads;pendant=prev.pendant;attached=prev.attached;selected=-1;persist();refresh();}break;
  case 'reset':snapshot();beads=[];attached=false;selected=-1;persist();refresh();break;
  case 'save':download();break;
  case 'shop':persist();document.getElementById('nana-shop-bag')?.click();break;
  case 'attach':snapshot();attached=!attached;persist();refresh();if(attached)document.querySelector('#window-close').click();break;
  case 'swing':{const s=document.querySelector('#bead-charm');s.classList.remove('bead-swing');void s.getBoundingClientRect();s.classList.add('bead-swing');break;}
 }}
});
document.addEventListener('keydown',e=>{
 const item=e.target.closest('[data-bead-index]');if(item&&['Enter',' '].includes(e.key)){e.preventDefault();item.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
document.addEventListener('portfolio-language-change',()=>{
 const shelf=document.querySelector('#nana-bead-box-shelf');if(shelf)shelf.setAttribute('aria-label',t().title);
 updateRoomCharm();if(document.querySelector('#bead-workshop'))open();
});
window.NanaBeadBox={open};
function updateRoomCharm(){
 const svg=document.querySelector('#hotspots');if(!svg)return;
 let charm=document.querySelector('#nana-phone-charm');
 if(!charm){charm=document.createElementNS('http://www.w3.org/2000/svg','g');charm.id='nana-phone-charm';charm.setAttribute('data-open','bead-box');charm.setAttribute('role','button');charm.setAttribute('tabindex','0');charm.setAttribute('transform','translate(1153 805) rotate(8) scale(.16) translate(-220 -24)');svg.appendChild(charm);charm.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});}
 charm.setAttribute('aria-label',t().roomCharm);
 charm.style.display=attached&&beads.length?'':'none';
 charm.innerHTML=attached&&beads.length?'<rect x="70" y="0" width="300" height="515" fill="transparent" pointer-events="all"/>'+charmMarkup():'';
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
