/* A tactile, local-only phone-charm workshop. All bead shapes are code-native. */
(() => {
'use strict';
const KEY='nana-bead-charm-v1', MAX=20;
const TYPES=['pink','glass','star','heart','letter','lilac','link'];
const colors={pink:'#f7a6d4',glass:'#a2ddf5',star:'#ffe782',heart:'#ff456c',letter:'#fff3d2',lilac:'#c7a5ed'};
const words={
 fr:{title:'Boîte à perles',intro:'Choisis tes perles, compose ton bijou.',box:'La boîte à perles',yours:'Ton bijou',hint:'Touche une perle du bijou pour la déplacer ou la retirer.',names:['Perle rose','Perle transparente','Étoile','Cœur','Perle lettre','Perle lilas','Maillon pastel'],word:'Un prénom, un mot…',thread:'Enfiler',letter:'Lettre',left:'Avant',right:'Après',remove:'Retirer',undo:'Annuler',reset:'Recommencer',save:'Garder mon bijou',swing:'Faire danser',pendant:'Pendentif',empty:'Ton fil attend ses premières perles.',full:'Le fil est plein ! Retire une perle pour en ajouter une autre.',added:'Perle ajoutée',removed:'Perle retirée',saved:'Ton bijou est prêt à être enregistré.',failed:'Le téléchargement a échoué. Réessaie.',count:'perles',selected:'Perle sélectionnée',local:'Ton bijou est conservé sur cet appareil.',choose:'Sélectionne une perle sur le bijou.',exporting:'Préparation…',attach:'Accrocher au téléphone',detach:'Décrocher du téléphone',roomCharm:'Modifier le bijou du téléphone',buy:'Acheter mon bijou en vrai',buyNote:'Léna réalisera ton bijou avec les perles disponibles dans son atelier. Enregistre ton modèle pour pouvoir le lui transmettre.'},
 en:{title:'Bead Box',intro:'Pick your beads, make your charm.',box:'The bead box',yours:'Your charm',hint:'Tap a bead on your charm to move or remove it.',names:['Pink bead','Transparent bead','Star','Heart','Letter bead','Lilac bead','Pastel link'],word:'A name, a word…',thread:'Thread',letter:'Letter',left:'Earlier',right:'Later',remove:'Remove',undo:'Undo',reset:'Start again',save:'Keep my charm',swing:'Make it dance',pendant:'Pendant',empty:'Your string is waiting for its first beads.',full:'The string is full! Remove a bead to add another.',added:'Bead added',removed:'Bead removed',saved:'Your charm is ready to save.',failed:'Download failed. Please try again.',count:'beads',selected:'Selected bead',local:'Your charm is saved on this device.',choose:'Select a bead on your charm.',exporting:'Preparing…',attach:'Attach to phone',detach:'Detach from phone',roomCharm:'Edit the phone charm',buy:'Buy my real-life charm',buyNote:'Léna will make your charm using the beads available in her studio. Save your design so you can send it to her.'}
};
const language=()=>document.documentElement.lang.startsWith('en')?'en':'fr';
const t=()=>words[language()];
const cleanLetter=value=>(String(value||'A').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,1)||'A');
let beads=[],pendant='heart',selected=-1,history=[],busy=false,attached=false;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(saved?.beads)){beads=saved.beads.filter(b=>TYPES.includes(b?.type)).slice(0,MAX).map(b=>({type:b.type,letter:cleanLetter(b.letter),variant:Number.isInteger(b.variant)?Math.abs(b.variant)%7:0}));pendant=['star','rabbit'].includes(saved.pendant)?saved.pendant:'heart';attached=saved.attached===true;}}catch(_){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({beads,pendant,attached}));}catch(_){}};
function snapshot(){history.push(JSON.stringify({beads,pendant,attached}));if(history.length>40)history.shift();}
const pastels=['#f5b5db','#b7e5e1','#e8df80','#bcdf96','#c5b1e5','#a9cbe9','#f3b59d'];
let shade=0;
function bead(type,letter='A',variant=0){
 const c=['star','link'].includes(type)?pastels[variant%pastels.length]:colors[type]||colors.pink;
 const outline='stroke="#ff3159" stroke-width="1.8" stroke-linejoin="round"';
 let shape;
 if(type==='rabbit')return `<g stroke="#dd9dac" stroke-width=".8" stroke-linejoin="round"><ellipse cy="-30" rx="4" ry="5" fill="none"/><ellipse cx="-8" cy="-19" rx="5" ry="13" transform="rotate(-17 -8 -19)" fill="#f8d7e0"/><ellipse cx="8" cy="-19" rx="5" ry="13" transform="rotate(17 8 -19)" fill="#f8d7e0"/><path d="M-9 -28 -5 -13 M9 -28 5 -13" stroke="#eeb5c9" stroke-width="3"/><ellipse cy="16" rx="10" ry="14" fill="#f8d7e0"/><ellipse cx="-11" cy="12" rx="5" ry="7" fill="#f8d7e0"/><ellipse cx="11" cy="12" rx="5" ry="7" fill="#f8d7e0"/><ellipse cx="-6" cy="29" rx="6" ry="7" fill="#f8d7e0"/><ellipse cx="6" cy="29" rx="6" ry="7" fill="#f8d7e0"/><ellipse cy="-3" rx="15" ry="14" fill="#f8d7e0"/><circle cx="-6" cy="-4" r="3" fill="#262027"/><circle cx="6" cy="-4" r="3" fill="#262027"/><circle cx="-7" cy="-5" r=".9" fill="white"/><circle cx="5" cy="-5" r=".9" fill="white"/><path d="M-2 2 Q0 5 2 2" fill="#d894aa"/></g>`;
 if(type==='link')return `<rect x="-12" y="-21" width="24" height="42" rx="11" fill="none" stroke="${c}" stroke-width="10"/><path d="M-12 6 V-8 Q-12 -20 -2 -21" fill="none" stroke="white" stroke-width="2" opacity=".65"/>`;

 if(type==='heart')shape=`<path d="M0 17 C-5 12 -23 0 -18 -11 C-14 -21 -3 -18 0 -11 C5 -20 18 -19 20 -9 C23 2 7 14 0 17Z" fill="${c}" ${outline}/>`;
 else if(type==='star')shape=`<path d="M0 -22 6 -7 22 -6 10 4 14 20 0 12 -14 20 -10 4 -22 -6 -6 -7Z" fill="${c}" ${outline}/><path d="M0 -14 4 -4 14 -3 6 3 9 13 0 8 -9 13 -6 3 -14 -3 -4 -4Z" fill="${variant%2?'#f6bddf':'#fff0f6'}"/>`;
 else if(type==='letter')shape=`<path d="M-17 -18 Q0 -20 18 -17 L19 17 Q0 20 -18 17Z" fill="${c}" ${outline}/><text x="0" y="8" text-anchor="middle" fill="#f3264f" font-family="Courier New,monospace" font-weight="bold" font-size="25">${cleanLetter(letter)}</text>`;
 else shape=`<path d="M-19 0 C-20 -24 20 -26 20 0 C20 25 -20 24 -19 0Z" fill="${c}" ${outline}/>${type==='glass'?'<path d="M-10 -16 9 16 M-3 -19 16 10" stroke="#fff" stroke-width="3" opacity=".65"/>':''}`;
 return shape+(type==='letter'?'':'<ellipse cx="-6" cy="-10" rx="5" ry="3" fill="white" opacity=".85" transform="rotate(-24 -6 -10)"/><circle cx="0" cy="-14" r="2" fill="#f66d9b" opacity=".6"/>');
}
function charmMarkup(interactive=false){
 const count=Math.max(14,beads.length),step=(Math.PI*2-.65)/(count-1);
 const nodes=beads.map((b,i)=>{
  const angle=-Math.PI/2-.325-step*i;
  const x=220+104*Math.cos(angle),y=260+158*Math.sin(angle);
  const label=t().names[TYPES.indexOf(b.type)]+(b.type==='letter'?' '+b.letter:'')+' '+(i+1);
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" ${interactive?`data-bead-index="${i}" role="button" tabindex="0" aria-label="${label}" aria-pressed="${selected===i}"`:''}><circle r="25" fill="transparent"/>${interactive&&selected===i?'<circle r="25" fill="none" stroke="#ff3159" stroke-width="2" stroke-dasharray="3 4"/>':''}${`<g transform="scale(${Math.min(1,14/Math.max(1,beads.length)).toFixed(3)})">${bead(b.type,b.letter,b.variant)}</g>`}</g>`;
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
 <div class="bead-trays">${TYPES.map((type,i)=>`<button type="button" class="bead-tray" data-add-bead="${type}" aria-label="${w.names[i]}"><svg viewBox="0 0 130 80" aria-hidden="true">${[[30,26,-12],[70,26,8],[105,50,17],[45,60,-9]].map(([x,y,r],n)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(.85)">${bead(type,['N','A','N','A'][n],n)}</g>`).join('')}</svg><span>${w.names[i]}</span></button>`).join('')}</div>
 <div class="bead-word"><label for="bead-word-input">${w.word}</label><div><input id="bead-word-input" maxlength="20" autocomplete="off" autocapitalize="characters" placeholder="NANA" aria-label="${w.word}"><button type="button" class="bead-control" data-bead-action="word">${w.thread}</button></div></div>
 <p class="bead-note">${w.local}<br>${language()==='fr'?'Le lapin rose est un pendentif unique : un seul par création. Les étoiles et maillons alternent les couleurs pastel.':'The pink bunny is a unique pendant: one per creation. Stars and links alternate pastel colours.'}</p></div>
 <div class="bead-making"><div class="bead-stage-heading"><h2>${w.yours}</h2><span id="bead-count"></span></div>
 <svg id="bead-charm" viewBox="0 0 440 515" role="group" aria-label="${w.yours}"></svg>
 <p id="bead-empty">${w.empty}</p><p class="bead-hint">${w.hint}</p>
 <p id="bead-selection"></p><div class="bead-editing">${[['left','← '+w.left],['right',w.right+' →'],['remove',w.remove]].map(([id,label])=>`<button type="button" class="bead-control" data-bead-edit="${id}">${label}</button>`).join('')}</div>
 <div class="bead-pendants"><span>${w.pendant}</span>${['heart','star','rabbit'].map(type=>`<button type="button" class="bead-pendant" data-pendant="${type}" aria-label="${type==='rabbit'?(language()==='fr'?'Lapin rose · un seul par création':'Pink bunny · one per creation'):w.names[type==='heart'?3:2]}"><svg viewBox="-30 -30 60 60" aria-hidden="true">${bead(type)}</svg></button>`).join('')}<button class="bead-control" type="button" data-bead-action="swing">${w.swing}</button></div></div></div>
 <div class="bead-footer"><button class="bead-control bead-attach" type="button" data-bead-action="attach">${w.attach}</button><button class="bead-control" type="button" data-bead-action="undo">${w.undo}</button><button class="bead-control" type="button" data-bead-action="reset">${w.reset}</button><button class="bead-control bead-save" type="button" data-bead-action="save">${w.save}</button></div><div class="bead-purchase"><button class="bead-control bead-attach" type="button" data-bead-action="shop">${w.buy}</button><p class="bead-note">${w.buyNote}</p></div><p id="bead-status" role="status" aria-live="polite"></p></section>`;}
function open(){window.openWindow(t().title,panel(),'bead-box');refresh();}
async function download(){
 if(busy||!beads.length)return;busy=true;refresh(t().exporting);
 let url;
 try{
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
 if(addButton){const value=document.querySelector('#bead-word-input').value;add([{type:addButton.dataset.addBead,letter:cleanLetter(value),variant:shade++%pastels.length}]);}
 else if(item){selected=Number(item.dataset.beadIndex);refresh();}
 else if(edit&&selected>=0){snapshot();const kind=edit.dataset.beadEdit;if(kind==='remove'){beads.splice(selected,1);selected=-1;}else{const to=selected+(kind==='left'?-1:1);if(to>=0&&to<beads.length){[beads[to],beads[selected]]=[beads[selected],beads[to]];selected=to;}}persist();refresh();}
 else if(pend){snapshot();pendant=pend.dataset.pendant;persist();refresh();}
 else if(action){switch(action.dataset.beadAction){
  case 'word':{const value=document.querySelector('#bead-word-input').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(value)add([...value].map(letter=>({type:'letter',letter})));break;}
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
 if(e.target.id==='bead-word-input'&&e.key==='Enter'){e.preventDefault();document.querySelector('[data-bead-action="word"]').click();}
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
 g.innerHTML='<defs><clipPath id="bead-shelf-support-clip"><path d="M-8 -10 H60 V52.2 L-8 33.9Z"/></clipPath></defs><g clip-path="url(#bead-shelf-support-clip)"><g class="bead-shelf-art"><g id="bead-box-shelf-ink"><path d="M.5 11.5 Q5 9 10 5.8 L10.3 41.5 Q5 44 .6 47Z" fill="#f4afce"/><path d="M10 5.8 Q20 8 30 11.5 L51 17 Q51.6 34 51.1 52 L30 46.6 Q20 44.5 10.3 41.5Z" fill="#ffd1e4"/><path d="M.7 19.5 Q5 17 10.1 14 L30 19.4 51.2 25.3" fill="none"/><path d="M27 20.7 34 22.6 34.2 28.6 27.1 26.8Z" fill="#fff2d4"/><path d="M30.4 33.5 C27.5 28 21 29 23 34 C24.4 37 27.4 39.5 30.6 42 C34 40 39.5 38.7 39 35 C38.6 30.5 32.8 29.3 30.4 33.5Z" fill="#ff456c"/><path d="M3.5 9.8 3.8 45.2" fill="none" opacity=".45"/></g></g><use href="#bead-box-shelf-ink" class="bead-shelf-outline" filter="url(#nana-room-hover-ring)" pointer-events="none"/></g>';
 svg.appendChild(g);updateRoomCharm();
 g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
