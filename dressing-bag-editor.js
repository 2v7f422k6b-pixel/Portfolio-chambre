/* Visual bag calibration. Coordinates are offsets on the original 2048 × 3072 art. */
(()=>{'use strict';
const KEY='nana-bag-adjustments-v1',supported=['bag-brown','bag-crochet'];
const garmentSlots=['tops','sheer','dresses','overalls','sweater','cardigan','vest','jackets','wrap'];
function key(s){return JSON.stringify([s.bags||'',...garmentSlots.map(k=>s[k]||'')]);}
function clean(v){return {dx:Math.max(-400,Math.min(400,Number.isFinite(v?.dx)?v.dx:0)),dy:Math.max(-500,Math.min(500,Number.isFinite(v?.dy)?v.dy:0))};}
function shift(entries,s,v){if(!supported.includes(s.bags))return entries;v=clean(v);return entries.map(e=>{const bag=e.id===s.bags||(s.bags==='bag-brown'&&/IMG_554[45]\.png/.test(e.src||''));if(!bag&&e.id!==s.bagAccessories)return e;return {...e,fit:{sx:1,...e.fit,dx:(e.fit?.dx||0)+v.dx,dy:(e.fit?.dy||0)+v.dy}};});}
function create(api){
 let saved={};try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))saved=raw;}catch(_){}
 const drafts=new Map();let restored=null,opened=false,before=false,panel,button,drag=null;
 const t=(fr,en)=>document.documentElement.lang==='en'?en:fr;
 const current=()=>key(api.slots());
 function value(){const k=current();return clean(drafts.get(k)||(restored?.key===k?restored.value:null)||saved[k]);}
 function refresh(){api.render();api.changed?.();update();}
 function update(){if(!panel)return;const s=api.slots(),ok=supported.includes(s.bags);panel.querySelector('select').value=ok?s.bags:'';panel.querySelector('[data-context]').textContent=ok?api.names(s):t('Choisis un sac pour commencer.','Choose a bag to start.');const v=value();panel.querySelector('output').textContent=`X ${Math.round(v.dx)} · Y ${Math.round(v.dy)}`;panel.querySelector('[data-controls]').disabled=!ok;panel.querySelector('[data-before]').checked=before;button.setAttribute('aria-expanded',String(opened));}
 function edit(v){drafts.set(current(),clean(v));before=false;refresh();}
 function open(on){opened=on;before=false;document.body.classList.toggle('bag-adjusting',on);panel.hidden=!on;if(!on)document.body.classList.remove('bag-ghost');panel.querySelector('[data-ghost]').checked=false;refresh();if(on)panel.scrollIntoView({block:'nearest'});}
 function init(){
 button=document.createElement('button');button.type='button';button.className='action';button.id='adjust-bag';button.textContent=t('Ajuster le sac','Adjust bag');button.setAttribute('aria-controls','bag-adjust-panel');button.setAttribute('aria-expanded','false');document.querySelector('.stage-head').append(button);
 panel=document.createElement('section');panel.id='bag-adjust-panel';panel.hidden=true;panel.setAttribute('data-no-translate','');
 panel.innerHTML=`<h2>${t('Réglage du sac','Bag adjustment')}</h2><label>${t('Sac','Bag')}<select aria-label="${t('Sac à régler','Bag to adjust')}"><option value="">${t('Choisir…','Choose…')}</option><option value="bag-crochet">${t('Sac en crochet','Crochet bag')}</option><option value="bag-brown">${t('Sac coussin','Cushion bag')}</option></select></label><p data-context></p><p>${t('Glisse sur le mannequin, ou utilise les flèches. Change de vêtements pour comparer.','Drag on the mannequin or use the arrows. Change clothes to compare.')}</p><fieldset data-controls><legend>${t('Position','Position')}</legend><div class="bag-arrows"><button type="button" data-move="0,-1" aria-label="${t('Monter','Move up')}">↑</button><button type="button" data-move="-1,0" aria-label="${t('Déplacer à gauche','Move left')}">←</button><button type="button" data-move="0,1" aria-label="${t('Descendre','Move down')}">↓</button><button type="button" data-move="1,0" aria-label="${t('Déplacer à droite','Move right')}">→</button></div><label>${t('Précision','Step')}<select data-step><option value="2">${t('Fine','Fine')}</option><option value="10">${t('Normale','Normal')}</option><option value="30">${t('Grande','Large')}</option></select></label><output></output><label><input type="checkbox" data-ghost> ${t('Voir les superpositions','See the layers')}</label><label><input type="checkbox" data-before> ${t('Comparer avec l’original','Compare with original')}</label><button type="button" data-save>${t('Enregistrer ce réglage','Save adjustment')}</button><button type="button" data-cancel>${t('Annuler les essais','Discard trials')}</button><button type="button" data-reset>${t('Position d’origine','Original position')}</button></fieldset><p>${t('Enregistré pour ce sac et ces vêtements, dans ce navigateur.','Saved for this bag and these clothes, in this browser.')}</p><button type="button" data-export>${t('Exporter les réglages','Export adjustments')}</button><p role="status" data-status></p><button type="button" data-close>${t('Terminer','Done')}</button>`;
 panel.querySelectorAll('[data-move]').forEach(b=>{const [x,y]=b.dataset.move.split(',').map(Number),angle=y<0?0:x>0?90:y>0?180:270;b.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M12 20 L12 4 M5 11 L12 4 L19 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" transform="rotate('+angle+' 12 12)"/></svg>';});
 document.querySelector('.profile').prepend(panel);
 button.onclick=()=>open(!opened);panel.querySelector('[data-close]').onclick=()=>open(false);
 panel.querySelector('select').onchange=e=>{if(supported.includes(e.target.value)){api.selectBag(e.target.value);before=false;update();}};
 panel.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [x,y]=b.dataset.move.split(',').map(Number),step=Number(panel.querySelector('[data-step]').value),v=value();edit({dx:v.dx+x*step,dy:v.dy+y*step});});
 panel.querySelector('[data-ghost]').onchange=e=>document.body.classList.toggle('bag-ghost',e.target.checked);
 panel.querySelector('[data-before]').onchange=e=>{before=e.target.checked;refresh();};
 const status=msg=>panel.querySelector('[data-status]').textContent=msg;
 panel.querySelector('[data-save]').onclick=()=>{const k=current(),next={...saved,[k]:value()};try{localStorage.setItem(KEY,JSON.stringify(next));saved=next;drafts.delete(k);restored=null;before=false;refresh();status(t('Réglage enregistré.','Adjustment saved.'));}catch(_){status(t('Enregistrement impossible. Exporte tes réglages pour les garder.','Could not save. Export your adjustments to keep them.'));}};
 panel.querySelector('[data-cancel]').onclick=()=>{drafts.delete(current());before=false;refresh();};
 panel.querySelector('[data-reset]').onclick=()=>edit({dx:0,dy:0});
 panel.querySelector('[data-export]').onclick=()=>{const adjustments={...saved};for(const [k,v] of drafts)adjustments[k]=v;if(restored)adjustments[restored.key]=clean(restored.value);const blob=new Blob([JSON.stringify({version:1,coordinates:[2048,3072],adjustments},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='reglages-sacs-nana.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status(t('Envoie-moi le fichier pour appliquer ces positions au site.','Send me the file to apply these positions to the site.'));};
 const avatar=document.querySelector('#avatar');
 avatar.addEventListener('pointerdown',e=>{if(!opened||!supported.includes(api.slots().bags)||e.button!==0)return;const r=avatar.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,value:value(),key:current()};avatar.setPointerCapture(e.pointerId);e.preventDefault();});
 avatar.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||drag.key!==current())return;edit({dx:drag.value.dx+(e.clientX-drag.x)*2048/drag.w,dy:drag.value.dy+(e.clientY-drag.y)*3072/drag.h});});
 const end=()=>{drag=null;};avatar.addEventListener('pointerup',end);avatar.addEventListener('pointercancel',end);avatar.addEventListener('lostpointercapture',end);
 update();
 }
 return {init,update,apply:(entries,s)=>shift(entries,s,before?{dx:0,dy:0}:value()),snapshot:()=>({key:current(),value:before?{dx:0,dy:0}:value()}),restore:v=>{restored=v?.key===current()?{key:v.key,value:clean(v.value)}:{key:current(),value:{dx:0,dy:0}};drafts.delete(current());before=false;update();}};
}
window.NanaBagEditor={create,key,clean,shift};
})();
