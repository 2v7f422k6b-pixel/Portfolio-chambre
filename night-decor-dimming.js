/* Night dimming without SVG filter references (iPad-safe). */
(() => {
 'use strict';
 const svg=document.getElementById('hotspots');
 if(!svg)return;
 const selectors=[
  ['.poster-artwork, .poster-perspective-artworks image, .poster-tape-layer image',.24],
  ['#nana-wall-mirror image',.60],
  ['#nana-fortune-cookie image',.43]
 ];
 const apply=()=>{
  const night=document.documentElement.dataset.theme==='night';
  for(const [selector,level] of selectors){
   svg.querySelectorAll(selector).forEach(el=>{
    if(el.hasAttribute('filter'))el.removeAttribute('filter');
    if(night)el.style.setProperty('filter','brightness('+level+')');
    else el.style.removeProperty('filter');
   });
  }
 };
 let pending=false;
 const observer=new MutationObserver(()=>{
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;apply()});
 });
 observer.observe(svg,{childList:true,subtree:true});
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 apply();
})();
