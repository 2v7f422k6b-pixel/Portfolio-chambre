(() => {
  "use strict";
  // Keep the complete mini-instrument + five-track mixer visible in one screen.
  // Compacts the layout first in CSS; only applies proportional scaling if the
  // remaining vertical space is smaller than the current content.
  const app=document.querySelector(".dl-app");
  if(!app)return;
  let pending=false;
  let lastHeight=0;
  let lastWidth=0;

  const size=()=>{
    const width=document.documentElement.clientWidth||window.innerWidth;
    const height=Math.floor(window.visualViewport?.height||window.innerHeight);
    return {width,height};
  };

  function fit(){
    pending=false;
    const {width,height}=size();
    if(!height||!width)return;
    lastHeight=height;lastWidth=width;
    app.style.removeProperty("zoom");
    app.style.removeProperty("width");
    app.style.removeProperty("max-width");

    const usableHeight=height-8;
    const natural=app.getBoundingClientRect().height;
    if(!natural)return;

    let scale=Math.min(1,usableHeight/natural);
    const availableWidth=Math.min(width-12,1140);
    if(scale>=.999){
      document.body.classList.add("dl-fits-screen");
      document.body.style.overflowY="hidden";
      return;
    }
    for(let pass=0;pass<4;pass++){
      app.style.setProperty("width",Math.floor(availableWidth/scale)+"px","important");
      app.style.setProperty("max-width",Math.floor(1140/scale)+"px","important");
      app.style.setProperty("zoom",String(scale));
      const actual=app.getBoundingClientRect().height;
      if(actual<=usableHeight+1)break;
      scale=Math.max(.38,scale*(usableHeight/actual)*.99);
    }
    const fits=app.getBoundingClientRect().height<=usableHeight+2;
    document.body.classList.toggle("dl-fits-screen",fits);
    document.body.style.overflowY=fits?"hidden":"auto";
  }

  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(fit);
  }
  window.addEventListener("resize",()=>{
    const {width,height}=size();
    if(width!==lastWidth||height!==lastHeight)schedule();
  },{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",schedule,{passive:true});
  const rows=document.getElementById("dl-track-list");
  if(window.MutationObserver){
    if(rows)new MutationObserver(schedule).observe(rows,{childList:true});
    const player=document.getElementById("dl-playback");
    if(player)new MutationObserver(schedule).observe(player,{attributes:true,attributeFilter:["hidden","src","controls"]});
    const status=document.getElementById("dl-status");
    if(status)new MutationObserver(schedule).observe(status,{childList:true,characterData:true,subtree:true});
  }
  if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
  schedule();
  setTimeout(schedule,250);
})();