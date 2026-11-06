/* Original artist PNGs; mount only once both layers are available. */
(()=>{
'use strict';
const rack=document.getElementById('postcard-shop-preview');
if(!rack)return;
// Rear structure first; front retaining bars last.
const sources=['assets/IMG_5108.png','assets/IMG_5109.png'];
Promise.all(sources.map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=src;}))).then(()=>{
const NS='http://www.w3.org/2000/svg';
const svg=document.createElementNS(NS,'svg');
svg.setAttribute('viewBox','0 0 1600 2400');svg.setAttribute('aria-hidden','true');
const node=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
svg.append(node('image',{href:sources[0],width:1600,height:2400}));
const cards=node('g',{'class':'original-rack-cards'});
['bubblegum','butterflies-grass','kitchen','cherry-blossom','clown','marseille-emblem'].forEach((name,i)=>{
const x=i%2?875:205,y=390+Math.floor(i/2)*585;
cards.append(node('rect',{x,y,width:510,height:540,fill:'#fff7e7'}));
cards.append(node('image',{href:'assets/previews/photos/'+name+'.webp',x:x+15,y:y+15,width:480,height:510,preserveAspectRatio:'xMidYMid meet'}));
});
svg.append(cards,node('image',{href:sources[1],width:1600,height:2400}));
const title=node('text',{x:800,y:142,'text-anchor':'middle',fill:'#ff173b','font-size':76,'font-family':'Nana Trace UI, cursive'});
const first=node('tspan',{x:800,dy:0});first.textContent='Nana’s';
const second=node('tspan',{x:800,dy:88});second.textContent='Little Shop';
title.append(first,second);svg.append(title);
rack.replaceChildren(svg);
const style=document.createElement('style');style.textContent='.original-rack-cards{transform-origin:800px 1300px;transition:transform .45s ease}#postcard-shop-preview:hover .original-rack-cards{transform:translateY(-18px)}@media(prefers-reduced-motion:reduce){.original-rack-cards{transition:none}}';
document.head.append(style);
}).catch(()=>{/* Keep the previous concept until the original PNGs are uploaded. */});
})();