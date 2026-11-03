/* Night dimming without SVG filter references (iPad-safe). */
(() => {
 'use strict';
 const svg=document.getElementById('hotspots');
 if(!svg)return;
 const selectors=[
  ['.poster-artwork, .poster-perspective-artworks image, .poster-tape-layer image',.24],
  ['#nana-wall-mirror image',.60],
  ['#nana-fortune-cookie image:not(.nana-fortune-cookie-outline)',.43]
 ];
 const apply=()=>{
  const night=document.documentElement.dataset.theme==='night';
  for(const [selector,level] of selectors){
   svg.querySelectorAll(selector).forEach(el=>{
    if(el.hasAttribute('filter'))el.removeAttribute('filter');
    // SVG image opacity is reliable on iPad; CSS filter on transformed SVG images is not.\n    el.style.removeProperty('filter');\n    if(night)el.style.setProperty('opacity',String(level),'important');\n    else el.style.removeProperty('opacity');
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
