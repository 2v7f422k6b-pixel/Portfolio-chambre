(()=>{'use strict';
const storage='nana-ribbon-per-artwork-v2';
const initial={x:-3,y:-3,size:44};
let saved={};try{saved=JSON.parse(localStorage.getItem(storage))||{}}catch{}
let mode='viewer',selected='',dirty=false;
const css=document.createElement('style');
css.textContent='#nana-ribbon-edit{position:fixed;right:14px;bottom:14px;z-index:999998;background:#fff0e9;color:#ff173b;border:2px solid #ff173b;padding:9px 12px;cursor:pointer}#nana-ribbon-panel{position:fixed;right:14px;bottom:60px;z-index:999999;width:min(330px,calc(100vw - 28px));max-height:80dvh;overflow:auto;background:#fff0e9;color:#ff173b;border:2px solid #ff173b;padding:15px;box-shadow:4px 4px 0 #ff173b;font:14px sans-serif}#nana-ribbon-panel[hidden]{display:none}#nana-ribbon-panel label{display:block;margin:10px 0}#nana-ribbon-panel input[type=range],#nana-ribbon-panel select{width:100%;accent-color:#ff173b}#nana-ribbon-panel button{border:2px solid #ff173b;background:white;color:#ff173b;padding:8px;margin:3px;cursor:pointer}#nana-ribbon-panel button[data-save]{background:#ff173b;color:white}#art-tiles .art-tile--for-sale::after,.viewer-layout--for-sale .viewer-artwork-wrap::after{left:var(--ribbon-x,-3%)!important;top:var(--ribbon-y,-3%)!important;width:var(--ribbon-size,44%)!important;height:100%!important;background-size:contain!important}';
document.head.append(css);
function identity(img){return img?.getAttribute('src')||''}
function slot(m,id){return m+'|'+id}
function value(m,id){return saved[slot(m,id)]||initial}
function set(el,v){el.style.setProperty('--ribbon-x',v.x+'%');el.style.setProperty('--ribbon-y',v.y+'%');el.style.setProperty('--ribbon-size',v.size+'%')}
function apply(){document.querySelectorAll('#art-tiles .art-tile--for-sale').forEach(el=>set(el,value('gallery',identity(el.querySelector('img')))));const wrap=document.querySelector('.viewer-layout--for-sale .viewer-artwork-wrap');if(wrap)set(wrap,value('viewer',identity(wrap.querySelector('img'))))}
function persist(){try{localStorage.setItem(storage,JSON.stringify(saved));dirty=false;return true}catch(_){dirty=true;return false}}
window.addEventListener('nana:collect-drafts',event=>{if(dirty)event.detail.settings[storage]=JSON.parse(JSON.stringify(saved));});
window.addEventListener('pagehide',()=>{if(dirty)persist();});
function start(){
const open=document.createElement('button');open.id='nana-ribbon-edit';open.textContent='Placer les rubans';open.setAttribute('aria-hidden','true');open.tabIndex=-1;open.style.setProperty('display','none','important');document.body.append(open);
const panel=document.createElement('section');panel.id='nana-ribbon-panel';panel.hidden=true;panel.innerHTML='<strong>Placement des rubans</strong><p>Chaque illustration conserve ses propres réglages.</p><label>Affichage<select data-mode><option value="viewer">Illustration ouverte</option><option value="gallery">Miniatures</option></select></label><label>Dessin<select data-art></select></label>'+[['x','Horizontal',-100,100],['y','Vertical',-100,100],['size','Taille',5,200]].map(([k,label,min,max])=>'<label>'+label+' : <output data-out="'+k+'"></output><input type="range" data-field="'+k+'" min="'+min+'" max="'+max+'" step="1"></label>').join('')+'<p data-status>Modifications non enregistrées</p><button data-save>Enregistrer les valeurs</button><button data-reset>Réinitialiser ce dessin</button><button data-close>Fermer</button>';document.body.append(panel);
const modeEl=panel.querySelector('[data-mode]'),artEl=panel.querySelector('[data-art]'),status=panel.querySelector('[data-status]');
function artworks(){const found=new Map();document.querySelectorAll('#art-tiles .art-tile--for-sale img,.viewer-thumbnails img,#viewer-image').forEach(img=>{const id=identity(img);if(id)found.set(id,img.alt||id.split('/').pop())});return found}
function choose(){const all=artworks();const viewer=identity(document.querySelector('#viewer-image'));artEl.replaceChildren();for(const [id,title] of all){const option=document.createElement('option');option.value=id;option.textContent=title;artEl.append(option)}selected=all.has(selected)?selected:(all.has(viewer)?viewer:(all.keys().next().value||''));artEl.value=selected;sync()}
function sync(){const v=value(mode,selected);panel.querySelectorAll('[data-field]').forEach(i=>{i.value=v[i.dataset.field];panel.querySelector('[data-out="'+i.dataset.field+'"]').textContent=v[i.dataset.field]+' %'});status.textContent=dirty?'Sauvegarde impossible sur cet appareil : exporte tout depuis l’atelier.':'Sauvegarde automatique · incluse dans l’export global'}
open.onclick=()=>{panel.hidden=false;mode=document.querySelector('.viewer-layout--for-sale')?'viewer':'gallery';modeEl.value=mode;selected=identity(document.querySelector('#viewer-image'));choose()};
modeEl.onchange=()=>{mode=modeEl.value;sync()};
artEl.onchange=()=>{selected=artEl.value;sync()};
panel.querySelectorAll('[data-field]').forEach(i=>i.oninput=()=>{if(!selected)return;const k=slot(mode,selected);saved[k]={...value(mode,selected),[i.dataset.field]:Number(i.value)};dirty=true;persist();sync();apply()});
panel.querySelector('[data-save]').onclick=()=>{persist();sync()};
panel.querySelector('[data-reset]').onclick=()=>{delete saved[slot(mode,selected)];dirty=true;persist();apply();sync()};
panel.querySelector('[data-close]').onclick=()=>{panel.hidden=true};
let pending=false;new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;apply()})}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();