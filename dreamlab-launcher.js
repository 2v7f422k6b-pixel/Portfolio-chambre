(() => {
  "use strict";
  // Temporary doorway: replace this trigger with the user's own MiniLab artwork later.
  const desktop=document.getElementById("desktop"), play=document.getElementById("play-viewport");
  if(!desktop||!play)return;
  const style=document.createElement("style");
  style.id="nana-dreamlab-launcher-style";
  style.textContent=`
@font-face{font-family:NanaTraceStudio;src:url("assets/fonts/NanaTraceUI-Regular.woff2") format("woff2");font-display:swap}#nana-dreamlab-topbar,#nana-dreamlab-topbar *{font-family:NanaTraceStudio,"Comic Sans MS",cursive!important;font-style:normal!important;font-weight:400!important}#nana-dreamlab-trigger{position:fixed;bottom:78px;right:18px;z-index:95;padding:11px 15px;max-width:160px;color:#fa123b;background:#fff0f8;border:3px solid #fa123b;border-radius:0;box-shadow:4px 4px 0 #fa123b55;font-family:"NanaTraceUI","Comic Sans MS",cursive;font-size:15px;font-weight:bold;line-height:1.05;cursor:pointer;transform:rotate(-2deg)}
#nana-dreamlab-language,#nana-dreamlab-close{clip-path:polygon(2% 0%,96% 2%,100% 94%,3% 100%,0% 7%)!important;box-shadow:2px 2px 0 #f10b3940!important;font-family:NanaTraceStudio,"Comic Sans MS",cursive!important;font-weight:400!important}#nana-dreamlab-close{font-size:24px!important;line-height:1!important}#nana-dreamlab-trigger:hover{background:#ffd5e6;transform:rotate(1deg)}
#nana-dreamlab-trigger[hidden]{display:none!important}
#nana-dreamlab-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(30,7,33,.75);display:grid;place-items:center;padding:15px}
#nana-dreamlab-window{position:relative;background:#ffe3ed;border:3px solid #f10b39;width:min(1240px,100%);height:min(900px,calc(100dvh - 30px));display:flex;flex-direction:column;box-shadow:7px 7px 0 #f10b3970}
#nana-dreamlab-topbar{display:flex;justify-content:space-between;align-items:center;background:#ffe6f0;color:#f10b39;border-bottom:2px solid #f10b39;padding:6px 10px;font:700 16px/1.2 "NanaTraceUI","Comic Sans MS",cursive}
#nana-dreamlab-actions{display:flex;align-items:center;gap:6px;margin-left:auto}#nana-dreamlab-language{font:inherit;color:#f10b39;background:#fff;border:2px solid #f10b39;border-radius:0;cursor:pointer;min-width:36px;min-height:30px;padding:2px 5px}#nana-dreamlab-close{font:inherit;color:#f10b39;background:#fff;border:2px solid #f10b39;border-radius:0;cursor:pointer;min-width:32px;min-height:30px}
#nana-dreamlab-iframe{display:block;width:100%;height:100%;border:0;background:#ffedf6;flex:1}
@media(max-width:760px){#nana-dreamlab-trigger{right:12px;bottom:69px;font-size:13px;padding:8px 11px}#nana-dreamlab-overlay{padding:0}#nana-dreamlab-window{height:100dvh;width:100%;border:0;box-shadow:none}#nana-dreamlab-topbar{padding:6px 10px}}
`;
  document.head.append(style);
  const trigger=document.createElement("button");
  trigger.id="nana-dreamlab-trigger";trigger.type="button";
  const sync=()=>{
    trigger.hidden=true;
    const fr=!document.documentElement.lang.toLowerCase().startsWith("en");
    trigger.textContent=fr?"✳ essayer mimilab 3":"✳ try mimilab 3";
    trigger.setAttribute("aria-label",fr?"Ouvrir mimilab 3":"Open mimilab 3");
  };
  trigger.hidden=true; // The MiniLab illustration is now the only entry point.
  const obs=new MutationObserver(sync);
  [desktop,play,document.documentElement].forEach(el=>obs.observe(el,{attributes:true,attributeFilter:["hidden","class","lang"]}));
  const welcome=document.getElementById("welcome");if(welcome)obs.observe(welcome,{attributes:true,attributeFilter:["hidden","class"]});
  sync();
  let overlay=null,restoreOverflow="",previousFocus=null;
  function close(){
    if(!overlay)return;
    const panel=overlay;overlay=null;
    // Removing the iframe stops playback and releases all its audio resources.
    const iframe=panel.querySelector("iframe");if(iframe)iframe.remove();
    panel.remove();document.body.style.overflow=restoreOverflow;
    document.removeEventListener("keydown",esc);
    if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
  }
  function esc(e){if(e.key==="Escape"){e.preventDefault();close()}}
  function open(){
    if(overlay)return;
    previousFocus=document.activeElement;restoreOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    overlay=document.createElement("div");overlay.id="nana-dreamlab-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label","mimilab 3");
    const panel=document.createElement("div");panel.id="nana-dreamlab-window";
    const bar=document.createElement("div");bar.id="nana-dreamlab-topbar";
    const label=document.createElement("span");label.textContent="mimilab 3 — nana color studio";
    const x=document.createElement("button");x.type="button";x.id="nana-dreamlab-close";x.textContent="×";
    x.setAttribute("aria-label","Fermer mimilab 3");x.addEventListener("click",close);
    const language=document.createElement("button");language.type="button";language.id="nana-dreamlab-language";language.textContent=document.documentElement.lang.toLowerCase().startsWith("en")?"FR":"EN";language.setAttribute("aria-label","Changer la langue");language.addEventListener("click",()=>{const inner=panel.querySelector("iframe");const btn=inner?.contentDocument?.getElementById("dl-language");if(btn){btn.click();language.textContent=inner.contentDocument.documentElement.lang==="en"?"FR":"EN";}});const actions=document.createElement("div");actions.id="nana-dreamlab-actions";actions.append(language,x);bar.append(label,actions);
    const iframe=document.createElement("iframe");iframe.id="nana-dreamlab-iframe";iframe.title="mimilab 3";iframe.setAttribute("allow","autoplay");
    iframe.src="dreamlab.html?v=20261105-label-calibration&lang="+(document.documentElement.lang.toLowerCase().startsWith("en")?"en":"fr");
    panel.append(bar,iframe);overlay.append(panel);document.body.append(overlay);
    overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
    document.addEventListener("keydown",esc);x.focus();
  }
  trigger.addEventListener("click",open);
  window.NanaDreamLab={open,close};
})();