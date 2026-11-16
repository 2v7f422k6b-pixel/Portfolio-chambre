/* Export the actual card layout to PNG, with the artist's images and local font.
   Uses native canvas, no remote renderer and no SVG foreignObject (Safari). */
(() => {
  'use strict';
  let lastURL=null,revision=0;
  const transparent=color=>!color||color==='transparent'||color==='rgba(0, 0, 0, 0)';
  function loadImage(src){return new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Card image unavailable'));image.src=src;
  });}
  async function render(card){
    await document.fonts.ready;
    await Promise.all([...card.querySelectorAll('img')].map(image=>image.decode()));
    // The shared loading gate temporarily hides the card during image decoding.
    // Wait for its reveal and the window entrance before measuring the layout.
    const started=performance.now();
    while(card.isConnected&&getComputedStyle(card).visibility==='hidden'){
      if(performance.now()-started>15000)throw new Error('Card still loading');
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    const animations=card.closest('#window')?.getAnimations()||[];
    await Promise.allSettled(animations.map(animation=>animation.finished));
    await new Promise(resolve=>requestAnimationFrame(resolve));
    const origin=card.getBoundingClientRect();
    if(!origin.width||!origin.height||!card.isConnected)throw new Error('Card closed');
    const scale=1260/origin.width,canvas=document.createElement('canvas');
    canvas.width=1260;canvas.height=Math.round(origin.height*scale);
    const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
    const box=el=>{const r=el.getBoundingClientRect();return{x:r.left-origin.left,y:r.top-origin.top,w:r.width,h:r.height};};
    // Clip only the outside rounded paper. All internal artwork keeps its own geometry.
    ctx.beginPath();ctx.roundRect(0,0,origin.width,origin.height,origin.width*.05);ctx.clip();
    async function draw(el){
      const style=getComputedStyle(el),r=box(el);
      if(style.display==='none'||style.visibility==='hidden')return;
      if(!transparent(style.backgroundColor)){ctx.fillStyle=style.backgroundColor;ctx.fillRect(r.x,r.y,r.w,r.h);}
      if(el.matches('.card-energy')){
        ctx.fillStyle='#fff4e8';ctx.fillRect(r.x+2,r.y+2,r.w-4,r.h-4);
        const frame=await loadImage('assets/drawn-ui/cadre_bouton.png');
        ctx.drawImage(frame,r.x,r.y,r.w,r.h);
      }
      if(el instanceof SVGElement){
        // SVG paths inherit the resolved card ink, without external CSS or fonts.
        const clone=el.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
        clone.setAttribute('width',r.w);clone.setAttribute('height',r.h);clone.style.color=style.color;
        const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
        try{ctx.drawImage(await loadImage(url),r.x,r.y,r.w,r.h);}finally{URL.revokeObjectURL(url);}
        return;
      }
      if(el instanceof HTMLImageElement){ctx.drawImage(el,r.x,r.y,r.w,r.h);return;}
      for(const child of el.childNodes){
        if(child.nodeType===Node.ELEMENT_NODE){if(!child.matches('.card-outline'))await draw(child);}
        else if(child.nodeType===Node.TEXT_NODE&&child.textContent.trim()){
          ctx.fillStyle=style.color;
          ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          ctx.textBaseline='alphabetic';ctx.textAlign='left';
          const metrics=ctx.measureText('Mg'),ascent=metrics.fontBoundingBoxAscent||parseFloat(style.fontSize)*.8;
          const descent=metrics.fontBoundingBoxDescent||parseFloat(style.fontSize)*.2;
          const range=document.createRange();
          // DOM ranges retain actual line wrapping, letter spacing and alignment.
          for(let i=0;i<child.length;){
            const char=String.fromCodePoint(child.textContent.codePointAt(i));
            range.setStart(child,i);range.setEnd(child,i+char.length);i+=char.length;
            if(!char.trim())continue;
            const rect=range.getBoundingClientRect();
            ctx.fillText(char,rect.left-origin.left,rect.top-origin.top+(rect.height-ascent-descent)/2+ascent);
          }
        }
      }
    }
    await draw(card);await draw(card.querySelector('.card-outline'));
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed')),'image/png'));
  }
  async function prepare(card,controls){
    const token=++revision,en=document.documentElement.lang==='en';
    const status=controls.querySelector('[role="status"]'),download=controls.querySelector('[data-card-download]');
    const retry=controls.querySelector('[data-card-retry]');
    status.textContent=en?'Preparing your PNG…':'Préparation du PNG…';retry.hidden=true;
    try{
      const blob=await render(card);if(token!==revision||!card.isConnected)return;
      if(lastURL)URL.revokeObjectURL(lastURL);lastURL=URL.createObjectURL(blob);
      const filename=en?'lena-character-card.png':'carte-lena.png';
      download.href=lastURL;download.download=filename;download.hidden=false;
      status.textContent='';
    }catch(_){
      if(token!==revision||!card.isConnected)return;
      status.textContent=en?'The PNG could not be prepared. Please try again.':'Le PNG n’a pas pu être préparé. Tu peux réessayer.';
      retry.hidden=false;retry.onclick=()=>prepare(card,controls);
    }
  }
  window.NanaCardExport={prepare};
})();
