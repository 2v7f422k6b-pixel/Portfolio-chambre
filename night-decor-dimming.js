/* SVG-native night dimming, compatible with iPad Chrome/Safari SVG images. */
(() => {
 'use strict';
 const svg=document.getElementById('hotspots');
 if(!svg)return;
 const NS='http://www.w3.org/2000/svg';
 const defs=document.createElementNS(NS,'defs');
 defs.id='nana-night-dim-defs';
 const makeFilter=(id,level)=>{
   const f=document.createElementNS(NS,'filter');
   f.id=id;f.setAttribute('x','-10%');f.setAttribute('y','-10%');
   f.setAttribute('width','120%');f.setAttribute('height','120%');
   f.setAttribute('color-interpolation-filters','sRGB');
   const m=document.createElementNS(NS,'feColorMatrix');
   m.setAttribute('type','matrix');
   m.setAttribute('values',`${level} 0 0 0 0  0 ${level} 0 0 0  0 0 ${level} 0 0  0 0 0 1 0`);
   f.appendChild(m);defs.appendChild(f);
 };
 makeFilter('nana-night-poster',.24);
 makeFilter('nana-night-mirror',.60);
 makeFilter('nana-night-cookie',.43);
 svg.insertBefore(defs,svg.firstChild);
 const selectors=[
   ['.poster-artwork, .poster-perspective-artworks image, .poster-tape-layer image','nana-night-poster'],
   ['#nana-wall-mirror image','nana-night-mirror'],
   ['#nana-fortune-cookie image','nana-night-cookie']
 ];
 let busy=false;
 const apply=()=>{
   const night=document.documentElement.dataset.theme==='night';
   for(const [selector,id] of selectors){
     svg.querySelectorAll(selector).forEach(el=>{
       const value=night?'url(#'+id+')':null;
       if(value && el.getAttribute('filter')!==value)el.setAttribute('filter',value);
       if(!value && el.hasAttribute('filter'))el.removeAttribute('filter');
     });
   }
 };
 const observer=new MutationObserver(()=>{
   if(busy)return;
   busy=true;
   requestAnimationFrame(()=>{busy=false;apply()});
 });
 observer.observe(svg,{childList:true,subtree:true});
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 apply();
})();
