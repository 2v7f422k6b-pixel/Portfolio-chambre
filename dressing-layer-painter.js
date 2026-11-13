/* Foreground-arm masks in original artwork coordinates. Pencil, mouse and touch. */
(()=>{'use strict';
function cleanMask(raw){if(!Array.isArray(raw))return [];return raw.slice(0,400).flatMap(s=>{
 if(!s||!['hide','show'].includes(s.mode)||!Array.isArray(s.points))return [];
 const points=s.points.slice(0,2048).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)).map(([x,y])=>[Math.round(Math.max(0,Math.min(2048,x))*10)/10,Math.round(Math.max(0,Math.min(3072,y))*10)/10]);
 return points.length?[{mode:s.mode,radius:Number.isFinite(s.radius)?Math.max(4,Math.min(160,s.radius)):40,points}]:[];
});}
function pointToArt(x,y,rect){return [Math.max(0,Math.min(2048,(x-rect.left)/rect.width*2048)),Math.max(0,Math.min(3072,(y-rect.top)/rect.height*3072))];}
function drawCoverage(ctx,strokes){ctx.clearRect(0,0,1024,1536);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=ctx.fillStyle='#000';
 for(const s of cleanMask(strokes)){ctx.globalCompositeOperation=s.mode==='hide'?'source-over':'destination-out';ctx.lineWidth=s.radius;const [x,y]=s.points[0];
  ctx.beginPath();ctx.arc(x/2,y/2,s.radius/2,0,Math.PI*2);ctx.fill();
  if(s.points.length>1){ctx.beginPath();ctx.moveTo(x/2,y/2);for(const p of s.points.slice(1))ctx.lineTo(p[0]/2,p[1]/2);ctx.stroke();}
 }ctx.globalCompositeOperation='source-over';
}
const caches=new WeakMap();
function maskEntries(entries,strokes,canvas){if(!strokes?.length)return entries;
 let cache=caches.get(canvas);if(!cache){cache=new Map();caches.set(canvas,cache);}const key=JSON.stringify(strokes);
 if(!cache.has(key)){const c=canvas();drawCoverage(c.getContext('2d'),strokes);if(cache.size>=2)cache.delete(cache.keys().next().value);cache.set(key,c);}
 const coverage=cache.get(key);
 return entries.map(e=>{if(!e.canvas||!['hands','bag-arm','handle-hand','manual-left','manual-right'].includes(e.part))return e;
  const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(e.canvas,0,0);ctx.globalCompositeOperation='destination-out';ctx.drawImage(coverage,0,0);return {...e,canvas:c};
 });
}
const core={cleanMask,pointToArt,drawCoverage,maskEntries};
if(typeof module!=='undefined'&&module.exports){module.exports=core;return;}
function create(options){
 const {host,getMask,change,allowed,status}=options,t=(fr,en)=>document.documentElement.lang==='en'?en:fr;
 const box=document.createElement('fieldset');box.className='nle-paint-controls';box.innerHTML=`<legend>${t('Retouche au Pencil','Pencil retouch')}</legend><label><input type="checkbox" data-paint-enable> ${t('Dessiner les zones à masquer sur le mannequin','Draw hidden areas on the mannequin')}</label><div data-paint-tools hidden><div class="nle-buttons"><button type="button" class="action" data-paint-tool="hide">${t('Masquer','Hide')}</button><button type="button" class="action" data-paint-tool="show">${t('Rétablir','Restore')}</button><button type="button" class="action" data-paint-tool="pan">${t('Déplacer la vue','Pan view')}</button></div><label>${t('Taille du pinceau','Brush size')}<input type="range" min="4" max="160" step="2" value="40" data-paint-size></label><label>${t('Zoom','Zoom')}<select data-paint-zoom><option value="1">100 %</option><option value="1.5">150 %</option><option value="2">200 %</option><option value="3">300 %</option><option value="4">400 %</option></select></label><label><input type="checkbox" data-paint-pen checked> ${t('Dessiner uniquement au Pencil ou à la souris','Draw only with Pencil or mouse')}</label><div class="nle-buttons"><button type="button" class="action" data-paint-undo>${t('Annuler le dernier trait','Undo last stroke')}</button><button type="button" class="action" data-paint-clear>${t('Effacer les retouches de ce réglage','Clear this adjustment’s retouches')}</button></div><p>${t('Masquer fait repasser le vêtement devant le bras. Rétablir enlève le masque au même endroit. Tes dessins restent intacts. Utilise Déplacer la vue pour naviguer dans le zoom.','Hide reveals clothes behind the foreground arm. Restore removes the mask there. Original drawings stay intact. Use Pan view to move around while zoomed.')}</p><p data-paint-count></p></div>`;
 host.append(box);const $=s=>box.querySelector(s);
 let wrap,overlay,avatar,area,oldStyle,baseWidth,baseHeight,mode='hide',active=null,before=[],pending=false;
 const enabled=()=>!!wrap;
 function size(initial=false){const zoom=Number($('[data-paint-zoom]').value),old=wrap.getBoundingClientRect(),viewport=area.getBoundingClientRect();
  const cx=initial?.5:(viewport.left+area.clientWidth/2-old.left)/(old.width||1),cy=initial?.5:(viewport.top+area.clientHeight/2-old.top)/(old.height||1);
  wrap.style.width=baseWidth*zoom+'px';wrap.style.height=baseHeight*zoom+'px';area.scrollLeft=cx*wrap.offsetWidth-area.clientWidth/2;area.scrollTop=cy*wrap.offsetHeight-area.clientHeight/2;
 }
 function cursor(e){if(!overlay||active||e.pointerType==='touch'&&$('[data-paint-pen]').checked)return;const p=pointToArt(e.clientX,e.clientY,overlay.getBoundingClientRect()),ctx=overlay.getContext('2d');ctx.clearRect(0,0,1024,1536);ctx.strokeStyle='#ff173b';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p[0]/2,p[1]/2,Number($('[data-paint-size]').value)/2,0,Math.PI*2);ctx.stroke();}
 function cancel(){if(!active)return;active=null;change(before);update();}
 function mount(on){if(on===enabled())return;if(!on){cancel();if(wrap){wrap.before(avatar);wrap.remove();avatar.setAttribute('style',oldStyle);document.body.classList.remove('layer-painting');wrap=null;overlay=null;}return;}
  avatar=document.querySelector('#avatar');area=avatar.parentElement;const rect=avatar.getBoundingClientRect();baseWidth=rect.width;baseHeight=rect.height;oldStyle=avatar.getAttribute('style')||'';
  wrap=document.createElement('div');wrap.className='nle-paint-wrap';avatar.before(wrap);wrap.append(avatar);document.body.classList.add('layer-painting');
  avatar.style.setProperty('width','100%','important');avatar.style.setProperty('height','100%','important');avatar.style.setProperty('max-height','none','important');avatar.style.setProperty('max-width','none','important');
  overlay=document.createElement('canvas');overlay.width=1024;overlay.height=1536;overlay.className='nle-paint-overlay';overlay.setAttribute('aria-label',t('Zone de retouche des bras','Arm retouching area'));wrap.append(overlay);size(true);setTool(mode);
  overlay.addEventListener('pointerdown',e=>{if(!allowed()||mode==='pan'||active||e.button!==0||e.pointerType==='touch'&&$('[data-paint-pen]').checked)return;
   e.preventDefault();overlay.getContext('2d').clearRect(0,0,1024,1536);before=cleanMask(getMask());if(before.length>=400){status(t('La limite de traits de ce réglage est atteinte.','This adjustment has reached its stroke limit.'));return;}
   const stroke={mode,radius:Number($('[data-paint-size]').value),points:[pointToArt(e.clientX,e.clientY,overlay.getBoundingClientRect())]};active={id:e.pointerId,stroke};overlay.setPointerCapture(e.pointerId);change([...before,stroke]);update();
  });
  overlay.addEventListener('pointermove',e=>{if(!active||e.pointerId!==active.id){cursor(e);return;}e.preventDefault();const rect=overlay.getBoundingClientRect();
   const coalesced=e.getCoalescedEvents?.();for(const ev of coalesced?.length?coalesced:[e]){const p=pointToArt(ev.clientX,ev.clientY,rect),last=active.stroke.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>=3&&active.stroke.points.length<2048)active.stroke.points.push(p);}
   if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;if(active)change([...before,active.stroke]);});}
  });
  overlay.addEventListener('pointerup',e=>{if(!active||e.pointerId!==active.id)return;const stroke=active.stroke,p=pointToArt(e.clientX,e.clientY,overlay.getBoundingClientRect()),last=stroke.points.at(-1);if(Math.hypot(p[0]-last[0],p[1]-last[1])>=3&&stroke.points.length<2048)stroke.points.push(p);active=null;change([...before,stroke]);overlay.getContext('2d').clearRect(0,0,1024,1536);update();});
  overlay.addEventListener('pointercancel',cancel);overlay.addEventListener('lostpointercapture',()=>{if(active)cancel();});overlay.addEventListener('pointerleave',()=>{if(!active)overlay.getContext('2d').clearRect(0,0,1024,1536);});
 }
 function setTool(tool){mode=tool;if(overlay){overlay.style.pointerEvents=tool==='pan'?'none':'auto';overlay.getContext('2d').clearRect(0,0,1024,1536);}box.querySelectorAll('[data-paint-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paintTool===tool)));}
 function update(){$('[data-paint-count]').textContent=getMask().length+' '+t('trait(s) pour ce réglage','stroke(s) for this adjustment');$('[data-paint-undo]').disabled=!getMask().length;$('[data-paint-clear]').disabled=!getMask().length;}
 $('[data-paint-enable]').onchange=e=>{mount(e.target.checked);$('[data-paint-tools]').hidden=!e.target.checked;update();};
 box.querySelectorAll('[data-paint-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.paintTool));
 $('[data-paint-zoom]').onchange=()=>{if(wrap)size();};
 $('[data-paint-undo]').onclick=()=>{cancel();change(getMask().slice(0,-1));update();};$('[data-paint-clear]').onclick=()=>{cancel();change([]);update();};
 return {update,stop(){cancel();mount(false);$('[data-paint-enable]').checked=false;$('[data-paint-tools]').hidden=true;},element:box};
}
window.NanaLayerPainter={...core,create};
})();
