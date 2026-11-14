/* Private diary tab alignment tool. No artwork is moved. */
(()=>{'use strict';
const key='nana-diary-tab-align-v1',count=8;
const defaults=[8.7,18.8,29.8,41.5,51.7,60.4,69.6,80];
let settings;
try{settings=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}
if(!settings||!Array.isArray(settings.x)||settings.x.length!==count)settings={x:[...defaults],y:Array(count).fill(0),size:Array(count).fill(1)};
const journal=()=>document.getElementById('nana-journal');
const tabs=()=>[...document.querySelectorAll('#nana-journal .nj-tabs button')].slice(0,count);
const isAdmin=()=>document.documentElement.classList.contains('nana-admin-session');
const save=()=>{localStorage.setItem(key,JSON.stringify(settings));apply()};
function apply(){
 tabs().forEach((el,i)=>{
  el.style.setProperty('left',settings.x[i]+'%','important');
  el.style.setProperty('--nj-admin-y',(settings.y[i]||0)+'px');
  el.style.setProperty('--nj-admin-scale',settings.size[i]||1);
 });
}
const panel=document.createElement('aside');
panel.id='nj-tab-editor';panel.hidden=true;
panel.innerHTML='<div class="nj-te-head"><strong>Réglage des intercalaires</strong><button type="button" data-te="close" aria-label="Fermer">×</button></div><p>Déplace les textes au doigt. Les dessins ne bougent pas.</p><label>Intercalaire <select id="nj-te-select"></select></label><label>Position horizontale <input id="nj-te-x" type="range" min="0" max="100" step=".1"></label><label>Position verticale <input id="nj-te-y" type="range" min="-40" max="40" step="1"></label><label>Taille <input id="nj-te-size" type="range" min=".65" max="1.5" step=".05"></label><div class="nj-te-actions"><button type="button" data-te="reset">Réinitialiser</button><button type="button" data-te="export">Exporter JSON</button><button type="button" data-te="done">Terminer</button></div><p id="nj-te-status" role="status"></p>';
document.body.append(panel);
const toggle=document.createElement('button');toggle.id='nj-tab-editor-open';toggle.type='button';toggle.textContent='Régler les intercalaires';toggle.hidden=true;document.body.append(toggle);
let selected=0,drag=null;
const sel=panel.querySelector('#nj-te-select'),x=panel.querySelector('#nj-te-x'),y=panel.querySelector('#nj-te-y'),size=panel.querySelector('#nj-te-size');
function refresh(){
 const labels=tabs().map(el=>el.textContent.trim());
 sel.innerHTML=labels.map((label,i)=>'<option value="'+i+'">'+(i+1)+' · '+label+'</option>').join('');
 sel.value=String(selected);x.value=settings.x[selected];y.value=settings.y[selected];size.value=settings.size[selected];
}
function close(){panel.hidden=true;journal()?.classList.remove('nj-tab-editing');}
function open(){if(!isAdmin())return;panel.hidden=false;journal()?.classList.add('nj-tab-editing');refresh();}
toggle.addEventListener('click',open);
panel.addEventListener('click',e=>{
 const action=e.target.closest('[data-te]')?.dataset.te;
 if(action==='close'||action==='done')close();
 if(action==='reset'){settings={x:[...defaults],y:Array(count).fill(0),size:Array(count).fill(1)};save();refresh();}
 if(action==='export'){
  const blob=new Blob([JSON.stringify(settings,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nana-intercalaires-reglages.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  panel.querySelector('#nj-te-status').textContent='Fichier exporté. Envoie-le pour publier les positions.';
 }
});
sel.addEventListener('change',()=>{selected=Number(sel.value);refresh()});
for(const [input,field] of [[x,'x'],[y,'y'],[size,'size']])input.addEventListener('input',()=>{settings[field][selected]=Number(input.value);save()});
document.addEventListener('pointerdown',e=>{
 if(panel.hidden||!isAdmin())return;
 const tab=e.target.closest('#nana-journal .nj-tabs button');if(!tab)return;
 const i=tabs().indexOf(tab);if(i<0)return;
 e.preventDefault();e.stopPropagation();selected=i;refresh();
 const rect=journal().querySelector('.nj-tabs').getBoundingClientRect();
 drag={id:e.pointerId,i,startX:e.clientX,startY:e.clientY,x:settings.x[i],y:settings.y[i],width:rect.width};
 tab.setPointerCapture(e.pointerId);
},true);
document.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 settings.x[drag.i]=Math.max(0,Math.min(100,drag.x+(e.clientX-drag.startX)/drag.width*100));
 settings.y[drag.i]=Math.max(-40,Math.min(40,drag.y+(e.clientY-drag.startY)));
 save();refresh();
},true);
document.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId)drag=null},true);
document.addEventListener('click',e=>{if(!panel.hidden&&e.target.closest('#nana-journal .nj-tabs button')){e.preventDefault();e.stopPropagation()}},true);
const observer=new MutationObserver(()=>{
 const j=journal(),visible=!!j?.open&&j.classList.contains('nj-book-open')&&isAdmin();
 toggle.hidden=!visible;if(!visible)close();
 if(visible)apply();
});
observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
new MutationObserver(()=>{const j=journal();if(j){observer.observe(j,{attributes:true,attributeFilter:['class','open']});apply();}}).observe(document.body,{childList:true,subtree:false});
document.addEventListener('portfolio-language-change',()=>setTimeout(()=>{apply();if(!panel.hidden)refresh()},0));
setInterval(()=>{const j=journal();if(j){toggle.hidden=!(j.open&&j.classList.contains('nj-book-open')&&isAdmin());if(!toggle.hidden)apply()}},900);
})();
