/* Nana Color Studio — lightweight artwork interaction deterrents.
   This does NOT prevent screenshots, network downloads or access to public GitHub files.
   Never store sale-ready high-resolution artwork in a public repository. */
(()=>{'use strict';
const artworkPath=/\/assets\/(?:photos|uploads)\/[^?#]+\.(?:png|jpe?g|webp)$/i;
function artworkTarget(node){
  if(!(node instanceof Element))return null;
  const el=node.closest('img,svg image,a');
  if(!el)return null;
  const source=el.getAttribute('src')||el.getAttribute('href')||el.getAttribute('xlink:href')||'';
  try{return artworkPath.test(new URL(source,document.baseURI).pathname)?el:null}catch{return null}
}
document.addEventListener('contextmenu',e=>{if(artworkTarget(e.target))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(artworkTarget(e.target))e.preventDefault()});
const style=document.createElement('style');
style.textContent='img[src*="assets/photos/"],img[src*="assets/uploads/"],svg image[href*="assets/photos/"],svg image[href*="assets/uploads/"]{-webkit-user-drag:none;user-select:none;-webkit-user-select:none}';
document.head.appendChild(style);
})();