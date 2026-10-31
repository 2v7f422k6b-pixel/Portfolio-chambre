/* Coloring Book for Play Mode. This feature is independent of existing windows. */
(function(){
"use strict";
const root=document.getElementById("app"),dock=document.getElementById("dock");
if(!root||!dock)return;
const style=document.createElement("style");style.id="coloring-book-styles";
style.textContent=[
'#app.mode-work #dock .coloring-dock-button{display:none!important}',
'#dock .coloring-dock-button .dock-app{color:#f20b35}',
'.coloring-overlay{position:fixed;inset:0;z-index:2050;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,3,14,.78)}',
'.coloring-overlay[hidden]{display:none!important}',
'.coloring-panel{width:min(1170px,100%);height:min(820px,calc(100dvh - 32px));display:flex;flex-direction:column;min-height:0;border:2px solid #f20b35;border-radius:0;background:#fff;box-shadow:0 0 19px rgba(242,11,53,.66),8px 8px 0 rgba(242,11,53,.22);overflow:hidden}',
'.coloring-panel-head{height:49px;flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:2px solid #f20b35;background:#fff8fa;padding:5px 12px;color:#f20b35;font:19px Nana,"Courier New",monospace}',
'.coloring-panel-head button{width:36px;height:34px;border:2px solid #f20b35;border-radius:0;color:#f20b35;background:white;box-shadow:0 0 8px rgba(242,11,53,.4);cursor:pointer;font:23px/1 Nana,"Courier New",monospace}',
'.coloring-panel-head button:hover,.coloring-panel-head button:focus-visible{color:#fff;background:#f20b35}',
'.coloring-panel iframe{width:100%;height:100%;flex:1;min-height:0;border:0;background:white}',
'@media(max-width:600px){.coloring-overlay{padding:5px}.coloring-panel{width:100%;height:calc(100dvh - 10px)}.coloring-panel-head{height:42px;font-size:16px;padding:4px 8px}}'
].join("\n");
document.head.append(style);
const btn=document.createElement("button");btn.className="coloring-dock-button";btn.type="button";btn.dataset.open="coloring";btn.title="Coloring Book";btn.setAttribute("aria-label","Open Coloring Book");
btn.innerHTML='<span class="dock-app coloring">✎</span><span class="dock-tooltip">Coloring Book</span>';
const pages=dock.querySelector('[data-open="pages"]');
if(pages)pages.insertAdjacentElement("afterend",btn);else dock.append(btn);
const overlay=document.createElement("div");overlay.className="coloring-overlay";overlay.id="coloring-overlay";overlay.hidden=true;
overlay.innerHTML='<section class="coloring-panel" role="dialog" aria-modal="true" aria-labelledby="coloring-title"><div class="coloring-panel-head"><span id="coloring-title">♥ COLORING BOOK ♥</span><button type="button" id="coloring-close" aria-label="Close Coloring Book">×</button></div><iframe title="Coloring Book game" src="coloring-book/index.html" loading="lazy"></iframe></section>';
document.body.append(overlay);
let previousFocus=null;
function open(){if(!root.classList.contains("mode-play"))return;previousFocus=document.activeElement;overlay.hidden=false;document.getElementById("coloring-close").focus({preventScroll:true})}
function close(){if(overlay.hidden)return;overlay.hidden=true;if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true})}
document.addEventListener("click",function(e){const trigger=e.target.closest('[data-open="coloring"]');if(!trigger||!root.classList.contains("mode-play"))return;e.preventDefault();e.stopImmediatePropagation();open()},true);
document.getElementById("coloring-close").addEventListener("click",close);
overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden){e.preventDefault();close()}});
new MutationObserver(()=>{if(!root.classList.contains("mode-play"))close()}).observe(root,{attributes:true,attributeFilter:["class"]});
})();