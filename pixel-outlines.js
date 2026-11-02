/* Draw the actual alpha boundaries of the original full-canvas PNG layers. */
(() => {
 const scene=document.getElementById('play-scene'),svg=document.getElementById('hotspots');
 if(!scene||!svg)return;
 const files=['IMAC.PNG','TSHIRT GABZILLA.PNG','MARSHALL.PNG','CDS.PNG','IPHONE.PNG','TAMAGOTCHI.PNG','MUG LATTE.PNG','TALE.PNG','RILAKKUMA.PNG','GUITARE.PNG','RING LIGHT.PNG','CAT.PNG','INSTAX.PNG'];
 const canvas=document.createElement('canvas');
 canvas.width=1670;canvas.height=942;canvas.id='pixel-outline-overlay';
 Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'8',display:'none'});
 scene.appendChild(canvas);
 const ctx=canvas.getContext('2d'),layers=[];
 function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='rgba(255,255,255,.98)';
  ctx.lineWidth=1.6;
  ctx.shadowColor='rgba(90,45,120,.7)';ctx.shadowBlur=2;
  for(const mask of layers){
   const {alpha,w,h}=mask;
   ctx.beginPath();
   // Each destination pixel samples the original 3072x1732 PNG transparency.
   for(let y=1;y<941;y++){
    const sy=Math.floor(y*h/942),up=Math.floor((y-1)*h/942),down=Math.floor((y+1)*h/942);
    for(let x=1;x<1669;x++){
     const sx=Math.floor(x*w/1670),left=Math.floor((x-1)*w/1670),right=Math.floor((x+1)*w/1670);
     const a=(yy,xx)=>alpha[yy*w+xx];
     if(a(sy,sx)>25&&(a(sy,left)<=25||a(sy,right)<=25||a(up,sx)<=25||a(down,sx)<=25))
      ctx.rect(x,y,1,1);
    }
   }
   ctx.fillStyle='white';ctx.fill();
  }
 }
 let queued=false;
 function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}}
 for(const file of files){
  const img=new Image();
  img.onload=()=>{
   const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
   const cx=c.getContext('2d',{willReadFrequently:true});if(!cx)return;
   cx.drawImage(img,0,0);
   try {
    const rgba=cx.getImageData(0,0,c.width,c.height).data;
    const alpha=new Uint8Array(c.width*c.height);
    for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
    layers.push({alpha,w:c.width,h:c.height});schedule();
   }catch(e){console.warn('Mask unavailable',file,e);}
  };
  img.src='assets/'+encodeURIComponent(file);
 }
 function sync(){
  const visible=svg.classList.contains('hotspot-guide-on')||svg.classList.contains('hotspot-peek');
  canvas.style.display=visible?'block':'none';
 }
 new MutationObserver(sync).observe(svg,{attributes:true,attributeFilter:['class']});
 sync();
})();
