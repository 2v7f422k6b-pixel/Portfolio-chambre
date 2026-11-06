/* Poster compatibility only. Mirror and cookie own their opaque night shading;
   do not reset their filters/opacity when unrelated SVG children change. */
(() => {
 'use strict';
 const svg=document.getElementById('hotspots');
 if(!svg)return;
 const selectors=[
  ['.poster-artwork, .poster-perspective-artworks image, .poster-tape-layer image', 1]
 ];
 const apply=()=>{
  const night=document.documentElement.dataset.theme==='night';
  for(const [selector,level] of selectors){
   svg.querySelectorAll(selector).forEach(el=>{
    if(el.hasAttribute('filter'))el.removeAttribute('filter');
    // SVG image opacity is reliable on iPad; CSS filter on transformed SVG images is not.
    el.style.removeProperty('filter');
    if(night)el.style.setProperty('opacity',String(level),'important');
    else el.style.removeProperty('opacity');
   });
  }
 };
 let pending=false;
 const observer=new MutationObserver(()=>{
  if(pending)return;
  pending=true;
  queueMicrotask(()=>{pending=false;apply()});
 });
 observer.observe(svg,{childList:true,subtree:true});
 observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 apply();
})();

