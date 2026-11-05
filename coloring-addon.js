/* Coloring Book for Play Mode. This feature is independent of existing windows. */
(function(){
"use strict";
const root=document.getElementById("app");
if(!root)return;
const style=document.createElement("style");style.id="coloring-book-styles";
style.textContent=[
'#app.mode-work #dock .coloring-dock-button{display:none!important}',
'#dock .coloring-dock-button .dock-app{color:#f20b35}',
'.coloring-overlay{position:fixed;inset:0;z-index:2050;display:flex;align-items:center;justify-content:center;padding:clamp(65px,9vh,88px) 16px 18px;background:rgba(20,3,14,.78)}',
'.coloring-overlay[hidden]{display:none!important}',
'.coloring-panel{width:min(1100px,100%);height:min(730px,calc(100dvh - clamp(94px,12vh,120px)));display:flex;flex-direction:column;min-height:0;border:2px solid transparent;border-radius:0;background:#fff;box-shadow:0 0 19px rgba(242,11,53,.33);overflow:hidden}',
'.coloring-panel-head{height:49px;flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:2px solid transparent;background:#fff8fa;padding:5px 12px;color:#f20b35;font:19px Nana,"Courier New",monospace}',
'.coloring-panel-head button{width:36px;height:34px;border:2px solid transparent;border-radius:0;color:#f20b35;background:white;box-shadow:0 0 8px rgba(242,11,53,.4);cursor:pointer;font:23px/1 Nana,"Courier New",monospace}',
'.coloring-panel-head button:hover,.coloring-panel-head button:focus-visible{color:#fff;background:#f20b35}',
'.coloring-panel iframe{width:100%;height:100%;flex:1;min-height:0;border:0;background:white}',
'/* One SVG outline per component, without any rigid CSS border underneath */',
'.coloring-overlay .coloring-panel.sketch-ui-frame,.coloring-overlay .coloring-panel-head.sketch-ui-rule,.coloring-overlay .coloring-panel-head button.sketch-ui-frame{border-color:transparent!important;outline:none!important}',
'.coloring-overlay .coloring-panel.sketch-ui-frame>.sketch-ui-svg{z-index:7!important;pointer-events:none!important}',
'.coloring-overlay .sketch-ui-svg .sketch-ui-ink{stroke:#f20b35;stroke-width:1.7;filter:drop-shadow(0 0 1.5px #f20b3540)}',
'@media(max-width:600px){.coloring-overlay{padding:64px 7px 12px}.coloring-panel{width:100%;height:calc(100dvh - 80px)}.coloring-panel-head{height:42px;font-size:16px;padding:4px 8px}}'
].join("\n");
document.head.append(style);
const overlay=document.createElement("div");overlay.className="coloring-overlay";overlay.id="coloring-overlay";overlay.hidden=true;
overlay.innerHTML='<section class="coloring-panel" role="dialog" aria-modal="true" aria-labelledby="coloring-title"><div class="coloring-panel-head"><span id="coloring-title">Coloring Book</span><button type="button" id="coloring-close" aria-label="Close Coloring Book">×</button></div><iframe title="Coloring Book game" src="coloring-book/index.html?v=20261103-one-localized-title-1" loading="lazy"></iframe></section>';
document.body.append(overlay);
let previousFocus=null;
function syncTitle(){let lang="fr";try{lang=localStorage.getItem("portfolio-language-v2")==="en"?"en":"fr"}catch(_){}document.getElementById("coloring-title").textContent=lang==="fr"?"Coloriage":"Coloring Book";document.getElementById("coloring-close").setAttribute("aria-label",lang==="fr"?"Fermer le livre de coloriage":"Close Coloring Book")}
function open(){previousFocus=document.activeElement;syncTitle();overlay.hidden=false;document.getElementById("coloring-close").focus({preventScroll:true})}
function close(){if(overlay.hidden)return;overlay.hidden=true;if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true})}
document.addEventListener("click",function(e){const trigger=e.target.closest('[data-open="coloring"]');if(!trigger)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
document.getElementById("coloring-close").addEventListener("click",close);
let backdropPointerStarted=false;
overlay.addEventListener("pointerdown",e=>{backdropPointerStarted=e.target===overlay},{passive:true});
overlay.addEventListener("click",e=>{if(e.target===overlay && (e.detail===0 || backdropPointerStarted))close();backdropPointerStarted=false});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden){e.preventDefault();close()}});
new MutationObserver(()=>{if(!root.classList.contains("mode-play"))close()}).observe(root,{attributes:true,attributeFilter:["class"]});
})();
