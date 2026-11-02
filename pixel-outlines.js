/* Transparent PNG outlines: precompute once, then render lightweight cached masks. */
(() => {
 const scene=document.getElementById('play-scene'), svg=document.getElementById('hotspots');
 if(!scene||!svg)return;
 const files=['IMAC.PNG','TSHIRT GABZILLA.PNG','MARSHALL.PNG','CDS.PNG','IPHONE.PNG','TAMAGOTCHI.PNG','MUG LATTE.PNG','TALE.PNG','RILAKKUMA.PNG','GUITARE.PNG','RING LIGHT.PNG','CAT.PNG','INSTAX.PNG','VASE.PNG','STARS LAMP.PNG','JELLY LAMP.PNG','CRAYONS 1.PNG','CRAYONS 2.PNG','CRAYONS 3.PNG','BOOKS 1.PNG','BOOKS 2.PNG','BOOKS 3.PNG','OFFICE LAMP.PNG','IPAD.PNG','RUG.PNG','MIFFY.PNG','BAMBI LAMP.PNG','SONNY ANGEL.PNG','BRETZEL.PNG'];
 const W=1670,H=942;
 const canvas=document.createElement('canvas');canvas.id='pixel-outline-overlay';canvas.width=W;canvas.height=H;
 Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'999',display:'none'});
 scene.appendChild(canvas);
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const layers=new Map();
 let hovered=null,queued=false;
 const guide=()=>svg.classList.contains('hotspot-guide-on')||svg.classList.contains('hotspot-peek');
 function draw(){
  queued=false;ctx.clearRect(0,0,W,H);
  const showAll=guide();
  canvas.style.display=(showAll||hovered)?'block':'none';
  ctx.save();
  ctx.shadowColor='rgba(255,255,255,.95)';ctx.shadowBlur=6;
  if(showAll){for(const layer of layers.values()){ctx.drawImage(layer.outline,0,0);ctx.drawImage(layer.outline,0,0);}}
  else if(hovered&&layers.has(hovered)){ctx.drawImage(layers.get(hovered).outline,0,0);ctx.drawImage(layers.get(hovered).outline,0,0);}
  ctx.restore();
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(draw);}}
 // Decode each layer at the displayed coordinate system, and cache its edge pixels.
 async function load(file){
  const img=new Image();img.decoding='async';
  img.onload=()=>{
   try{
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const cctx=c.getContext('2d',{willReadFrequently:true});if(!cctx)return;
    cctx.drawImage(img,0,0,W,H);
    const rgba=cctx.getImageData(0,0,W,H).data;
    const alpha=new Uint8Array(W*H);
    for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
    const edge=new Uint8ClampedArray(W*H*4);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x;
      if(alpha[i]>25&&(alpha[i-1]<=25||alpha[i+1]<=25||alpha[i-W]<=25||alpha[i+W]<=25)){
        const p=i*4;edge[p]=255;edge[p+1]=255;edge[p+2]=255;edge[p+3]=255;
      }
    }
    const out=document.createElement('canvas');out.width=W;out.height=H;
    out.getContext('2d').putImageData(new ImageData(edge,W,H),0,0);
    layers.set(file,{alpha,outline:out});
    schedule();
   }catch(e){console.warn('Could not prepare PNG outline',file,e);}
  };
  img.onerror=()=>console.warn('Missing PNG layer',file);
  img.src='assets/'+encodeURIComponent(file);
 }
 // Limit simultaneous decoding to avoid large memory spikes on iPad.
 let next=0,active=0;
 function pump(){
  while(active<2&&next<files.length){
   const file=files[next++];active++;
   const img=new Image();img.decoding='async';
   img.onload=()=>{
    try{
     const c=document.createElement('canvas');c.width=W;c.height=H;
     const cc=c.getContext('2d',{willReadFrequently:true});cc.drawImage(img,0,0,W,H);
     const raw=cc.getImageData(0,0,W,H).data,alpha=new Uint8Array(W*H),pixels=new Uint8ClampedArray(W*H*4);
     for(let i=0;i<alpha.length;i++)alpha[i]=raw[i*4+3];
     // Fill the object silhouette: connect small gaps, then flood-fill the exterior.
     const solid=new Uint8Array(W*H);
     for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
       const i=y*W+x;if(alpha[i]>25){
        for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)solid[i+dy*W+dx]=1;
       }
     }
     const exterior=new Uint8Array(W*H),queue=new Int32Array(W*H);
     let head=0,tail=0;
     function seed(i){if(!solid[i]&&!exterior[i]){exterior[i]=1;queue[tail++]=i;}}
     for(let x=0;x<W;x++){seed(x);seed((H-1)*W+x);}
     for(let y=0;y<H;y++){seed(y*W);seed(y*W+W-1);}
     while(head<tail){
       const i=queue[head++],x=i%W;
       if(x>0)seed(i-1);if(x<W-1)seed(i+1);
       if(i>=W)seed(i-W);if(i<W*(H-1))seed(i+W);
     }
     const filled=new Uint8Array(W*H);
     for(let i=0;i<filled.length;i++)if(!exterior[i])filled[i]=255;
     for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
       const i=y*W+x;
       if(filled[i]&&(!filled[i-1]||!filled[i+1]||!filled[i-W]||!filled[i+W])){
         const p=i*4;pixels[p]=pixels[p+1]=pixels[p+2]=pixels[p+3]=255;
       }
     }
     const out=document.createElement('canvas');out.width=W;out.height=H;
     out.getContext('2d').putImageData(new ImageData(pixels,W,H),0,0);
     layers.set(file,{alpha:filled,outline:out});schedule();
    }catch(e){console.warn('PNG outline error',file,e);}
    active--;pump();
   };
   img.onerror=()=>{active--;pump();};
   img.src='assets/'+encodeURIComponent(file);
  }
 }
 pump();
 new MutationObserver(schedule).observe(svg,{attributes:true,attributeFilter:['class']});
 const image=document.getElementById('room-img');
 function at(e){
  const r=image.getBoundingClientRect();if(!r.width||!r.height)return null;
  const x=Math.floor((e.clientX-r.left)*W/r.width),y=Math.floor((e.clientY-r.top)*H/r.height);
  return x>=0&&x<W&&y>=0&&y<H?y*W+x:null;
 }
 scene.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const i=at(e);let found=null;
  if(i!==null){for(let n=files.length-1;n>=0;n--){const layer=layers.get(files[n]);if(layer&&layer.alpha[i]>25){found=files[n];break;}}}
  if(found!==hovered){hovered=found;schedule();}
 },{passive:true});
 scene.addEventListener('pointerleave',()=>{hovered=null;schedule();});
 schedule();
})();