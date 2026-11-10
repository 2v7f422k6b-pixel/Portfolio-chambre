/* Non-destructive garment composition. All coordinates refer to Léna's 2048 × 3072 canvas. */
(()=>{'use strict';
const CW=1024,CH=1536,S=2;
const garmentSlots=['tops','sheer','dresses','overalls','sweater','cardigan','vest','jackets','wrap'];
const sleeveless=new Set(['top-ganni-knit','vest-george-sand','jacket-floral','dress-denim','suit-paint']);
const sleeveEnd={ 'top-bear':1640,'jacket-blue':1510,'top-pullover':1590,'top-lime':1590,'top-pajama':1590,'top-pajama-blue':1590,'top-pajama-leopard':1590,'top-yellow':900,'top-white':900,'top-pink':800,'top-dj':800,'top-clown':1120,'top-gabzilla':1060,'top-plantasia':1060,'top-pink-floyd':1060,'top-damson':1140,'top-peter-pan':1570,'top-bow-blouse-tucked':1580,'top-george-sand':1590,'top-inspector':1590,'top-sparkle-pink':1620,'top-sparkle-charcoal':1620,'dress-floral':1600,'dress-striped':1620};
function canvas(){const c=document.createElement('canvas');c.width=CW;c.height=CH;return c}
function create({source,changed}){
 const images=new Map(),profiles=new Map(),frames=new Map();let queued=false;
 function invalidate(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;changed()})}}
 function image(src){if(!images.has(src)){const im=new Image();im.src=src;const r={im,loaded:false};r.ready=im.decode().then(()=>{r.loaded=true;invalidate()});r.ready.catch(()=>{});images.set(src,r)}return images.get(src)}
 function get(id){return image(source(id))}
 function profile(id){if(profiles.has(id))return profiles.get(id);const r=get(id);if(!r.loaded)return null;
  const c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(r.im,0,0,CW,CH);const px=ctx.getImageData(0,0,CW,CH).data,rows=[];let hem=0;
  for(let y=0;y<CH;y++){let l=CW,h=-1,run=0;for(let x=0;x<CW;x++){run=px[(y*CW+x)*4+3]>90?run+1:0;if(run>=3){l=Math.min(l,x-run+1);h=x;}}
   // Central fabric excludes detached sleeves when measuring a coat's skirt.
   let cl=500,cr=500;if(px[(y*CW+500)*4+3]>90){while(cl>0&&px[(y*CW+cl-1)*4+3]>50)cl--;while(cr<CW-1&&px[(y*CW+cr+1)*4+3]>50)cr++;if(cr-cl>30)hem=y;}
   rows.push(h>l?{l,h,cl:cr-cl>30?cl:l,cr:cr-cl>30?cr:h}:null);
  }
  const bottom=rows.findLastIndex(r=>r&&r.h-r.l>40);if(['jacket-inspector','jacket-george-sand','jacket-green','jacket-yukata'].includes(id))hem=bottom;const p={rows,hem,bottom};profiles.set(id,p);return p;
 }
 function remember(key,make){if(frames.has(key))return frames.get(key);const c=make();if(frames.size>=8)frames.delete(frames.keys().next().value);frames.set(key,c);return c}
 // The underlayer follows the enclosing silhouette, never the narrowing last
 // scanline of a hem. Continue the silhouette below the hem without moving pixels.
 function contained(id,outer,upperOnly){const b=profile(outer);if(!b||!get(id).loaded)return null;
  return remember('mask:'+id+':'+outer+':'+upperOnly,()=>{
   const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(get(id).im,0,0,CW,CH);
   const long=['jacket-green','jacket-inspector','jacket-george-sand','jacket-yukata'].includes(outer);
   const end=Math.max(400,b.hem-18);let last=null;
   for(let y=350;y<CH;y++){
    if(y<=end){const rr=b.rows.slice(Math.max(350,y-8),Math.min(end,y+8)+1).filter(Boolean);
     if(!rr.length)continue;last={l:Math.min(...rr.map(r=>r.l)),h:Math.max(...rr.map(r=>r.h))};
    }else if(!last)break;
    if(y>end&&!upperOnly&&!long)break;
    const spread=y>end?(y-end)*(long?.45:0):0;
    ctx.clearRect(0,y,Math.max(0,last.l-spread),1);ctx.clearRect(last.h+spread+1,y,CW,1);
    if(upperOnly&&y>end){ctx.clearRect(0,y,CW,1);}
   }
   // Sleeve gaps are not openings in the coat: show the underlayer only
   // through the central opening or beneath actual outer fabric.
   const mask=canvas(),m=mask.getContext('2d');m.drawImage(get(outer).im,0,0,CW,CH);m.fillRect(420,300,160,Math.max(0,end-300));
   ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);
   return c;
  });
 }
 // User-approved contour adaptation: horizontal only, with an unmodified hem.
 function lowerContour(id,outer){const a=profile(id),b=profile(outer);if(!a||!b)return null;
  return remember('contour:'+id+':'+outer,()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(get(id).im,0,0,CW,CH);
   for(let y=350;y<600;y++){const r=b.rows[y];if(r){ctx.clearRect(0,y,r.l,1);ctx.clearRect(r.h+1,y,CW,1);}}
   const end=Math.max(600,b.hem-18),endRows=b.rows.slice(Math.max(600,end-16),end+1).filter(Boolean);
   if(!endRows.length)return c;const limit={l:Math.min(...endRows.map(r=>r.l)),h:Math.max(...endRows.map(r=>r.h))};
   const release=Math.max(end+1,a.bottom-24);
   for(let y=600;y<a.bottom-24;y++){const row=a.rows[y];if(!row)continue;
    const rr=y<=end?b.rows.slice(Math.max(600,y-8),Math.min(end,y+8)+1).filter(Boolean):[];
    const bound=rr.length?{l:Math.min(...rr.map(r=>r.l)),h:Math.max(...rr.map(r=>r.h))}:limit;
    const t=y<=end?1:Math.max(0,1-(y-end)/(release-end));const weight=t*t*(3-2*t);
    const l=row.l+Math.max(0,bound.l-row.l)*weight,h=row.h-Math.max(0,row.h-bound.h)*weight;
    const sx=(h-l)/(row.h-row.l);if(sx>=.999||sx<=0)continue;
    ctx.clearRect(0,y,CW,1);ctx.drawImage(get(id).im,0,y*S,CW*S,S,l-row.l*sx,y,CW*sx,1);
   }return c;
  });
 }
 const bareDresses=new Set(['dress-blue','dress-polka','dress-gingham','dress-denim','dress-pink-check','dress-pink-bustier']);
 function hands(s,entries,forearm=false){const src=s.gloves?source(s.gloves):'assets/dressing-lena/IMG_5495.png',r=image(src);
  const ids=garmentSlots.map(k=>s[k]).filter(id=>id&&!sleeveless.has(id)&&!bareDresses.has(id));
  if(!r.loaded||ids.some(id=>!get(id).loaded))return null;
  return remember('arms:'+src+':'+forearm+':'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(r.im,0,0,CW,CH);
   // The ordinary foreground layer restores wrists and fingers only. Bare
   // upper arms already exist in the body and must never repaint over tops.
   if(!s.gloves)ctx.clearRect(0,0,CW,forearm?450:780);
   ctx.globalCompositeOperation='destination-out';for(const id of ids){
    const e=entries.find(e=>e.id===id);ctx.save();ctx.beginPath();
    // Only sleeves can cover arms: a dress's skirt must not erase the hands.
    const end=s.dresses===id?800:CH;
    let cover=e?.canvas||get(id).im;
    // Transparent sleeves already tint the base arm. Do not repaint skin
    // over them, including the small section overlapping the wrist.
    if(['top-sparkle-pink','top-sparkle-charcoal'].includes(id)){
     const mask=canvas(),m=mask.getContext('2d',{willReadFrequently:true});m.drawImage(cover,0,0,CW,CH);
     const p=m.getImageData(0,0,CW,CH);for(let i=3;i<p.data.length;i+=4)if(p.data[i])p.data[i]=255;
     m.putImageData(p,0,0);cover=mask;
    }
    ctx.rect(0,0,CW,end);ctx.clip();ctx.drawImage(cover,0,0,CW,CH);ctx.restore();
   }return c;});
 }
 function phone(s,entries){const id=s.phone;if(!id)return null;const ids=garmentSlots.filter(k=>['sweater','cardigan','jackets','wrap'].includes(k)||sleeveEnd[s[k]]>1100).map(k=>s[k]).filter(x=>x&&!sleeveless.has(x));if(!get(id).loaded||ids.some(x=>!get(x).loaded))return null;
  return remember('phone:'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(get(id).im,0,0,CW,CH);ctx.save();ctx.beginPath();ctx.rect(0,0,CW,900);ctx.clip();ctx.globalCompositeOperation='destination-out';for(const x of ids){const e=entries.find(e=>e.id===x);ctx.drawImage(e?.canvas||get(x).im,0,0,CW,CH);}ctx.restore();return c;});
 }
 function paint(ctx,e){const r=e.src?image(e.src):e.id?get(e.id):null;const im=e.canvas||(r?.loaded?r.im:null);if(!im)return;
  ctx.save();if(e.fit){const f=e.fit,ox=(f.ox??970)/S,oy=(f.oy||0)/S;ctx.translate(ox+(f.dx||0)/S,oy+(f.dy||0)/S);ctx.transform(f.sx,0,f.kx||0,f.sy||1,0,0);ctx.translate(-ox,-oy);}
  const points=e.localClip||e.clip;if(points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x/S,y/S):ctx.moveTo(x/S,y/S));ctx.closePath();ctx.clip();}ctx.drawImage(im,0,0,CW,CH);ctx.restore();
 }
 function shoulderBag(entries,s){if(s.bags!=='bag-brown')return null;
  const parts=entries.filter(e=>e.src?.includes('IMG_554'));if(garmentSlots.some(k=>s[k]&&!get(s[k]).loaded)||parts.some(e=>!image(e.src).loaded)||!image('assets/dressing-lena/IMG_5993.png').loaded)return null;
  return remember('brown:'+JSON.stringify([s,parts.map(e=>e.fit)]),()=>{const c=canvas(),ctx=c.getContext('2d');parts.forEach(e=>paint(ctx,e));
   const mask=canvas(),m=mask.getContext('2d');m.drawImage(image('assets/dressing-lena/IMG_5993.png').im,0,0,CW,CH);
   for(const e of entries)if(garmentSlots.some(k=>s[k]===e.id))paint(m,e);
   m.fillRect(0,440,CW,CH-440);ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);return c;
  });
 }
 function bodyFrame(e,s,outer){if(!image(e.src).loaded)return null;
  const hat=['head-bucket-blue','head-bucket-beige','head-george-sand'].includes(s.hat)?s.hat:null;
  if(hat&&!get(hat).loaded)return null;
  if(['top-pullover','top-lime'].includes(outer)&&!get(outer).loaded)return null;
  if(!hat&&!['top-pullover','top-lime'].includes(outer))return null;
  return remember('body:'+s.hat+':'+outer,()=>{const c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image(e.src).im,0,0,CW,CH);
   if(hat){const hc=canvas(),h=hc.getContext('2d',{willReadFrequently:true});h.drawImage(get(hat).im,0,0,CW,CH);const hp=h.getImageData(0,0,CW,400).data;const bottom=[];
    for(let x=290;x<680;x++){let last=0;for(let y=0;y<340;y++)if(hp[(y*CW+x)*4+3]>100)last=y;bottom[x]=last;}
    const pixels=ctx.getImageData(0,0,CW,400),p=pixels.data;
    for(let x=290;x<680;x++){let edge=bottom[x];if(!edge){for(let d=1;d<100&&!edge;d++)edge=bottom[x-d]||bottom[x+d];}
     for(let y=100;y<Math.min(340,edge||0);y++){const i=(y*CW+x)*4;if(p[i]>p[i+1]*1.15&&p[i+1]>p[i+2]&&p[i]<150)p[i+3]=0;}}
    ctx.putImageData(pixels,0,0);
   }
   const b=outer?profile(outer):null;if(['top-pullover','top-lime'].includes(outer)&&b)for(let y=370;y<430;y++){const r=b.rows[y];if(r&&r.h-r.l>150){ctx.clearRect(0,y,r.l,1);ctx.clearRect(r.h+1,y,CW,1);}}
   return c;
  });
 }
 function sources(entries,s){const ids=garmentSlots.map(k=>s[k]).filter(Boolean);if(s.phone)ids.push(s.phone);if(s.gloves)ids.push(s.gloves);if(s.pants)ids.push(s.pants);if(s.hat)ids.push(s.hat);if(s.bags)ids.push(s.bags);if(s.skirts)ids.push(s.skirts);return [...new Set([...ids.map(source),...entries.filter(e=>e.src).map(e=>e.src),'assets/dressing-lena/IMG_5994.png','assets/dressing-lena/IMG_5993.png','assets/dressing-lena/IMG_5495.png'])]}
 async function ready(entries,s){await Promise.all(sources(entries,s).map(src=>image(src).ready))}
 function process(entries,s){sources(entries,s).forEach(image);
  const outer=s.wrap||s.jackets||s.vest||s.cardigan||s.sweater||(s.dresses==='dress-denim'?s.dresses:s.overalls)||(['top-damson','top-gabzilla','top-plantasia','top-pink-floyd'].includes(s.tops)?s.tops:null);
  const outEntry=entries.find(e=>e.id===outer),z=outEntry?.z;
  const result=entries.map(e=>{if(!e.id||e.hood||e.canvas)return {...e};
   const key=Object.keys(s).find(k=>s[k]===e.id);
   // Hands occlude the original lower garment; never reshape it to clear wrists.
   if(['pants','skirts','overalls'].includes(key)){const c=outer&&!sleeveless.has(outer)?lowerContour(e.id,outer):null;return {...e,canvas:c||undefined,clip:null,rowFit:null,fit:null};}
   if(outer&&!sleeveless.has(outer)&&e.id!==outer&&e.z<z&&['tops','sheer','sweater','cardigan','vest','dresses'].includes(key)){
    const c=key==='dresses'?lowerContour(e.id,outer):contained(e.id,outer,true);if(c)return {id:e.id,z:e.z,canvas:c,cover:e.cover};
   }
   return ['tops','sheer','dresses','overalls','sweater','cardigan','vest'].includes(key)?{...e,clip:null,rowFit:null,fit:null}:{...e};
  });
  // The polka dress's tied straps are tucked under the vest at the shoulders.
  if(s.vest&&s.dresses==='dress-polka'){const e=result.find(e=>e.id==='dress-polka');if(e){const c=canvas(),ctx=c.getContext('2d');paint(ctx,e);ctx.clearRect(0,0,CW,465);e.canvas=c;e.clip=null;e.fit=null;}}
  const base=result.find(e=>e.src==='assets/dressing-lena/IMG_5993.png');if(base){const c=bodyFrame(base,s,outer);if(c)base.canvas=c;}
  const brown=shoulderBag(result,s);if(brown){for(let i=result.length-1;i>=0;i--)if(result[i].src?.includes('IMG_554'))result.splice(i,1);result.push({canvas:brown,z:19,part:'brown-bag'});}
  if(s.phone){const e=result.find(e=>e.id===s.phone),c=phone(s,result);if(e&&c)e.canvas=c;}
  const hand=hands(s,result);if(hand){
   for(let i=result.length-1;i>=0;i--)if(result[i].src?.includes('IMG_5495')||(s.gloves&&result[i].id===s.gloves))result.splice(i,1);
   result.push({canvas:hand,z:10.2,part:'hands'});
  }
  if(s.bags==='bag-crochet'&&hand){
   const forearm=hands(s,result,true);
   const key='crochet:'+(s.gloves||'')+':'+garmentSlots.map(k=>s[k]||'').join(',');
   const c=remember(key,()=>{const c=canvas(),ctx=c.getContext('2d');
    // Redraw the left arm and its sleeves only, not the dress/torso beside it.
    for(const e of result.filter(e=>e.part==='hands'||garmentSlots.some(k=>s[k]===e.id)).sort((a,b)=>a.z-b.z)){
     if(e.id&&(sleeveless.has(e.id)||bareDresses.has(e.id)))continue;
     const im=e.part==='hands'?forearm:e.canvas||(e.id&&get(e.id).loaded?get(e.id).im:null);if(!im)continue;
     ctx.save();ctx.beginPath();
     if(e.part==='hands')ctx.rect(0,450,445,450);
     else {ctx.moveTo(0,500);ctx.lineTo(400,500);ctx.lineTo(398,580);ctx.lineTo(384,650);ctx.lineTo(365,720);ctx.lineTo(360,785);ctx.lineTo(385,855);ctx.lineTo(0,855);ctx.closePath();}
     ctx.clip();if(e.id){ctx.beginPath();ctx.rect(0,0,CW,(sleeveEnd[e.id]||1600)/S);ctx.clip();}
     ctx.drawImage(im,0,0,CW,CH);ctx.restore();
    }return c;});result.push({canvas:c,z:19.5,part:'bag-arm'});
  }
  // Hand-held handles go behind the original fingers.
  if(s.bags==='bag-heart'&&hand){const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(hand,0,0);ctx.clearRect(0,0,550,CH);result.push({canvas:c,z:19.5,part:'handle-hand'});}
  return result.sort((a,b)=>a.z-b.z);
 }
 return {ready,process,profile};
}
window.NanaDressingGeometry={create};
})();
