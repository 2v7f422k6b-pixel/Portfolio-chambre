/* Local, exportable layering calibration. Original drawings and anatomy stay intact. */
(()=>{'use strict';
const KEY='nana-layer-adjustments-v1';
const ORDER=['tops','pants','skirts','dresses','overalls','sheer','sweater','cardigan','vest','jackets','wrap','bags'];
const MODES=['auto','behind','clothes','bag'];
const BAG_MODES=['auto','behind','front','over'];
const clamp=(v,min,max,fallback)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
function side(v){if(!v||!MODES.includes(v.mode)||v.mode==='auto')return null;const from=clamp(v.from,500,2000,1300);return {mode:v.mode,from,to:clamp(v.to,from+20,2400,Math.max(1900,from+20))};}
function clean(v){return {left:side(v?.left),right:side(v?.right),bag:{mode:BAG_MODES.includes(v?.bag?.mode)?v.bag.mode:'auto',dx:clamp(v?.bag?.dx,-500,500,0),dy:clamp(v?.bag?.dy,-700,700,0)}};}
function key(scope,ids){return scope+':'+JSON.stringify([...ids].sort());}
function decode(raw,valid){
 if(!raw||raw.format!=='nana-layer-adjustments'||raw.version!==1||!Array.isArray(raw.records)||raw.records.length>2000)throw Error('format');
 const result=new Map();
 for(const r of raw.records){
  if(!r||!['item','outfit'].includes(r.scope)||!Array.isArray(r.ids)||!r.ids.length||r.ids.length>32||r.ids.some(id=>typeof id!=='string'||!valid(id))||r.scope==='item'&&r.ids.length!==1)throw Error('record');
  const ids=[...new Set(r.ids)].sort(),entry={scope:r.scope,ids,settings:clean(r.settings)};result.set(key(r.scope,ids),entry);
 }return result;
}
function resolve(records,slots){
 let value=clean(null);
 const merge=settings=>{const c=clean(settings);if(c.left)value.left=c.left;if(c.right)value.right=c.right;if(c.bag.mode!=='auto'||c.bag.dx||c.bag.dy)value.bag=c.bag;};
 for(const slot of ORDER){const id=slots[slot];if(id)merge(records.get(key('item',[id]))?.settings);}
 const ids=Object.values(slots).filter(x=>typeof x==='string');merge(records.get(key('outfit',ids))?.settings);
 return value;
}
function position(entries,slots,settings){const v=clean(settings).bag;if(!slots.bags||(!v.dx&&!v.dy))return entries;
 return entries.map(e=>e.id===slots.bags||(slots.bagAccessories&&e.id===slots.bagAccessories)||/IMG_554[45]\.png/.test(e.src||'')?{...e,fit:{sx:1,...e.fit,dx:(e.fit?.dx||0)+v.dx,dy:(e.fit?.dy||0)+v.dy}}:e);
}
function compose(entries,slots,settings,{canvas,arm}){
 const v=clean(settings),handParts=['hands','bag-arm','handle-hand'];let result=entries.map(e=>({...e}));
 const bag=result.filter(e=>e.id===slots.bags||(slots.bagAccessories&&e.id===slots.bagAccessories)||e.part===slots.bags||/IMG_554[45]\.png/.test(e.src||''));
 if(slots.bags&&v.bag.mode!=='auto'){
  const base=bag.find(e=>e.id===slots.bags||e.part===slots.bags||/IMG_5544\.png/.test(e.src||''))?.z??19;
  const target={behind:11.8,front:19,over:22}[v.bag.mode];
  for(const e of bag)e.z+=target-base;
  // Restore arms separately when a bag's order is explicitly controlled.
  result=result.filter(e=>!['bag-arm','handle-hand'].includes(e.part));
  if(v.bag.mode==='front')for(const sideName of ['left','right'])if(!v[sideName])v[sideName]={mode:'bag',from:1300,to:1900};
 }
 for(const [name,x] of [['left',0],['right',512]]){
  const s=v[name];if(!s)continue;
  // Remove only this side from generated foreground overlays. The original
  // body remains behind garments, so "behind" never deletes an arm.
  result=result.map(e=>{if(!handParts.includes(e.part)||!e.canvas)return e;const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(e.canvas,0,0);ctx.clearRect(x,0,512,1536);return {...e,canvas:c};});
  if(s.mode!=='behind'&&arm){const c=canvas(),ctx=c.getContext('2d');ctx.save();ctx.beginPath();ctx.rect(x,s.from/2,512,(s.to-s.from)/2);ctx.clip();ctx.drawImage(arm,0,0,1024,1536);ctx.restore();result.push({canvas:c,z:s.mode==='bag'?21:14,part:'manual-'+name});}
 }
 return result.sort((a,b)=>a.z-b.z);
}
const core={KEY,ORDER,clean,key,decode,resolve,position,compose};
if(typeof module!=='undefined'&&module.exports){module.exports=core;return;}
let api,records=new Map(),drafts=new Map(),panel,button,target,scope,opened=false,compare=false,images=new Map(),revision=0;
const $=s=>panel.querySelector(s),t=(fr,en)=>document.documentElement.lang==='en'?en:fr;
const ids=()=>Object.values(api.slots()).filter(x=>typeof x==='string').sort();
const current=()=>{const sc=scope.value;return {scope:sc,ids:sc==='item'?[target.value]:ids()};};
const currentKey=()=>{const c=current();return key(c.scope,c.ids);};
const activeRecords=()=>{const m=new Map(records);if(opened)for(const [k,v] of drafts)m.set(k,v);return m;};
const effective=s=>compare?clean(null):resolve(activeRecords(),s);
function status(text){$('[role=status]').textContent=text;}
function stored(){return {format:'nana-layer-adjustments',version:1,records:[...records.values()]};}
function persist(next){try{localStorage.setItem(KEY,JSON.stringify({format:'nana-layer-adjustments',version:1,records:[...next.values()]}));records=next;return true;}catch(_){status(t('Enregistrement impossible dans ce navigateur. Tes essais restent visibles : tu peux les exporter.','Could not save in this browser. Your trials remain visible and can be exported.'));return false;}}
function frame(){const c=document.createElement('canvas');c.width=1024;c.height=1536;return c;}
function armRecord(s){const src=s.gloves?api.source(s.gloves):'assets/dressing-lena/IMG_5495.png';if(!images.has(src)){const im=new Image();im.src=src;const r={im,ready:im.decode()};r.ready.catch(()=>{});images.set(src,r);}return images.get(src);}
function guides(){document.querySelectorAll('.nle-guide').forEach(e=>e.remove());if(!opened||!$('[data-guides]').checked||compare)return;
 const v=effective(api.slots()),avatar=document.querySelector('#avatar');
 for(const [name,left] of [['left','0%'],['right','50%']]){const s=v[name];if(!s||s.mode==='behind')continue;
  const guide=document.createElement('div');guide.className='nle-guide';guide.style.cssText=`position:absolute;pointer-events:none;left:${left};width:50%;top:${s.from/3072*100}%;height:${(s.to-s.from)/3072*100}%;border-top:1px dashed #ff173b;border-bottom:1px dashed #ff173b;box-sizing:border-box;z-index:10000`;guide.setAttribute('aria-hidden','true');avatar.append(guide);
 }
}
function preview(){const n=++revision;return Promise.resolve(api.render()).then(()=>{if(n===revision)guides();}).catch(()=>status(t('Une image n’a pas pu être chargée. Réessaie ce réglage.','An image could not load. Please retry.')));}
function controls(){const entry=drafts.get(currentKey())||records.get(currentKey()),v=clean(entry?.settings);
 for(const name of ['left','right']){const value=v[name]||{mode:'auto',from:1300,to:1900};$(`[data-side=${name}]`).value=value.mode;for(const prop of ['from','to']){$(`[data-${name}-${prop}]`).value=value[prop];$(`[data-${name}-${prop}]`).disabled=['auto','behind'].includes(value.mode);$(`[data-${name}-${prop}-value]`).textContent=value[prop];}}
 $('[data-bag-mode]').value=v.bag.mode;for(const axis of ['dx','dy']){$(`[data-bag-${axis}]`).value=v.bag[axis];$(`[data-bag-${axis}-value]`).textContent=v.bag[axis];}
 $('[data-bag]').disabled=!api.slots().bags;target.disabled=scope.value==='outfit';$('[data-context]').textContent=current().ids.map(api.name).join(' + ');
 $('[data-count]').textContent=t(records.size+' réglages enregistrés dans ce navigateur.',records.size+' adjustments saved in this browser.');
}
function readControls(){const v={};for(const name of ['left','right'])v[name]={mode:$(`[data-side=${name}]`).value,from:Number($(`[data-${name}-from]`).value),to:Number($(`[data-${name}-to]`).value)};v.bag={mode:$('[data-bag-mode]').value,dx:Number($('[data-bag-dx]').value),dy:Number($('[data-bag-dy]').value)};return clean(v);}
function edit(){const c=current();drafts.set(currentKey(),{...c,settings:readControls()});compare=false;$('[data-compare]').checked=false;status(t('Essai non enregistré.','Unsaved trial.'));controls();preview();}
function open(on){opened=on;compare=false;document.body.classList.toggle('layer-editing',on);panel.hidden=!on;button.setAttribute('aria-expanded',String(on));$('[data-compare]').checked=false;
 if(on){if(document.body.classList.contains('bag-adjusting'))document.querySelector('#adjust-bag')?.click();const worn=ORDER.map(k=>api.slots()[k]).filter(Boolean);target.replaceChildren();for(const id of worn){const o=document.createElement('option');o.value=id;o.textContent=api.name(id);target.append(o);}if(!worn.length){status(t('Porte d’abord un vêtement ou un sac.','Wear a garment or bag first.'));open(false);return;}target.value=api.slots().wrap||api.slots().jackets||api.slots().dresses||api.slots().skirts||worn[0];controls();status(t('Gauche et droite désignent les côtés de l’image.','Left and right refer to the image.'));}
 else{drafts.clear();document.querySelectorAll('.nle-guide').forEach(e=>e.remove());button.focus({preventScroll:true});}preview();
}
function download(value){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nana-reglages-superpositions.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function init(options){if(api)return;api=options;try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw)records=decode(raw,id=>api.has(id));}catch(_){}
 if(options.previewOnly)return;
 button=document.createElement('button');button.id='adjust-layers';button.type='button';button.className='action';button.textContent=t('Superpositions','Layers');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','layer-adjust-panel');document.querySelector('.actions').prepend(button);
 panel=document.createElement('section');panel.id='layer-adjust-panel';panel.hidden=true;panel.setAttribute('data-no-translate','');panel.setAttribute('aria-label',t('Réglage des superpositions','Layer adjustment'));
 const range=(attr,label,min,max,step,value)=>`<label>${label} <output data-${attr}-value>${value}</output><input type="range" data-${attr} min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
 const arm=name=>`<fieldset><legend>${t(name==='left'?'Bras à gauche de l’image':'Bras à droite de l’image',name==='left'?'Arm on the left':'Arm on the right')}</legend><label>${t('Passage du bras','Arm order')}<select data-side="${name}"><option value="auto">${t('Automatique','Automatic')}</option><option value="behind">${t('Derrière les vêtements','Behind clothes')}</option><option value="clothes">${t('Devant les vêtements, derrière le sac','In front of clothes, behind bag')}</option><option value="bag">${t('Devant le sac aussi','In front of bag too')}</option></select></label>${range(name+'-from',t('Début de la zone visible','Visible area starts'),500,2000,10,1300)}${range(name+'-to',t('Fin de la zone visible','Visible area ends'),520,2400,10,1900)}</fieldset>`;
 panel.innerHTML=`<div class="nle-heading"><strong>${t('Ajuster les superpositions','Adjust layers')}</strong><button class="action" data-close type="button">${t('Fermer','Close')}</button></div><p>${t('Choisis la pièce ou la combinaison à corriger. Le mannequin reste visible pendant tes essais.','Choose the piece or combination to correct. Your mannequin stays visible.')}</p><label>${t('Appliquer à','Apply to')}<select data-scope><option value="item">${t('Cette pièce, avec toutes les tenues','This piece, with any outfit')}</option><option value="outfit">${t('Cette combinaison uniquement','This combination only')}</option></select></label><label>${t('Pièce à régler','Piece to adjust')}<select data-target></select></label><p data-context></p>${arm('left')}${arm('right')}<fieldset data-bag><legend>${t('Sac porté','Worn bag')}</legend><label>${t('Superposition du sac','Bag order')}<select data-bag-mode><option value="auto">${t('Automatique','Automatic')}</option><option value="behind">${t('Derrière le manteau','Behind coat')}</option><option value="front">${t('Devant le vêtement, derrière les bras','In front of clothes, behind arms')}</option><option value="over">${t('Devant les bras','In front of arms')}</option></select></label>${range('bag-dx',t('Déplacer à gauche / droite','Move left / right'),-500,500,5,0)}${range('bag-dy',t('Monter / descendre','Move up / down'),-700,700,5,0)}</fieldset><label><input type="checkbox" data-guides checked> ${t('Afficher les repères de hauteur','Show height guides')}</label><label><input type="checkbox" data-compare> ${t('Comparer sans mes réglages','Compare without my adjustments')}</label><div class="nle-buttons"><button type="button" class="action" data-save>${t('Enregistrer ce réglage','Save adjustment')}</button><button type="button" class="action" data-cancel>${t('Annuler les essais','Discard trials')}</button><button type="button" class="action" data-reset>${t('Remettre en automatique','Reset to automatic')}</button></div><p role="status" aria-live="polite"></p><p data-count></p><p>${t('Enregistre chaque réglage, puis exporte tout en une fois. Les réglages d’une combinaison passent en priorité. Fermer abandonne les essais non enregistrés.','Save each adjustment, then export everything together. Combination settings take priority. Closing discards unsaved trials.')}</p><div class="nle-buttons"><button type="button" class="action" data-export>${t('Exporter tous les réglages','Export all adjustments')}</button><button type="button" class="action" data-import>${t('Importer des réglages','Import adjustments')}</button></div><input type="file" accept="application/json,.json" data-file hidden>`;
 document.querySelector('.wardrobe').append(panel);target=$('[data-target]');scope=$('[data-scope]');button.onclick=()=>open(!opened);$('[data-close]').onclick=()=>open(false);
 for(const select of [target,scope])select.onchange=()=>{controls();preview();};
 panel.querySelectorAll('[data-side],[data-left-from],[data-left-to],[data-right-from],[data-right-to],[data-bag-mode],[data-bag-dx],[data-bag-dy]').forEach(el=>el.addEventListener('input',edit));
 $('[data-guides]').onchange=guides;$('[data-compare]').onchange=e=>{compare=e.target.checked;preview();};
 $('[data-save]').onclick=()=>{const c=current(),k=currentKey(),next=new Map(records);next.set(k,{...c,settings:readControls()});if(persist(next)){drafts.delete(k);controls();status(t('Réglage enregistré. Tu peux passer à une autre pièce.','Saved. You can adjust another piece.'));preview();}};
 $('[data-cancel]').onclick=()=>{drafts.delete(currentKey());compare=false;$('[data-compare]').checked=false;controls();status(t('Essais annulés.','Trials discarded.'));preview();};
 $('[data-reset]').onclick=()=>{const c=current();drafts.set(currentKey(),{...c,settings:clean(null)});controls();compare=false;preview();status(t('Retour à l’automatique en aperçu. Enregistre pour le conserver.','Automatic preview. Save to keep it.'));};
 $('[data-export]').onclick=()=>{let legacyBagAdjustments={};try{legacyBagAdjustments=JSON.parse(localStorage.getItem('nana-bag-adjustments-v1')||'{}');}catch(_){}download({...stored(),records:[...activeRecords().values()],legacyBagAdjustments});status(t('Tous les réglages et les essais en cours ont été exportés.','All saved adjustments and current trials exported.'));};
 $('[data-import]').onclick=()=>$('[data-file]').click();$('[data-file]').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('size');const incoming=decode(JSON.parse(await file.text()),id=>api.has(id)),next=new Map(records);for(const [k,v] of incoming)next.set(k,v);if(persist(next)){drafts.clear();controls();preview();status(t('Réglages importés.','Adjustments imported.'));}}catch(_){status(t('Fichier non reconnu : tes réglages existants sont conservés.','Unrecognized file. Existing adjustments were kept.'));}finally{e.target.value='';}};
 document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape'){e.stopImmediatePropagation();open(false);}},true);
}
window.NanaLayerEditor={init,prepare:(entries,s)=>api?position(entries,s,effective(s)):entries,apply:(entries,s)=>api?compose(entries,s,effective(s),{canvas:frame,arm:armRecord(s).im}):entries,ready:s=>api?armRecord(s).ready:Promise.resolve()};
})();
