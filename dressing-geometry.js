/* Non-destructive garment composition. All coordinates refer to Léna's 2048 × 3072 canvas. */
(()=>{'use strict';
const CW=1024,CH=1536,S=2;
const garmentSlots=['tops','sheer','dresses','overalls','sweater','cardigan','vest','jackets','wrap'];
const sleeveless=new Set(['top-ganni-knit','vest-george-sand','jacket-floral','dress-denim','suit-paint']);
const sleeveEnd={ 'top-bear':1640,'jacket-blue':1510,'top-pullover':1590,'top-lime':1590,'top-pajama':1590,'top-pajama-blue':1590,'top-pajama-leopard':1590,'top-yellow':900,'top-white':900,'top-pink':800,'top-dj':800,'top-clown':1120,'top-gabzilla':1060,'top-plantasia':1060,'top-pink-floyd':1060,'top-damson':1140,'top-peter-pan':1570,'top-bow-blouse-tucked':1580,'top-george-sand':1590,'top-inspector':1590,'top-sparkle-pink':1620,'top-sparkle-charcoal':1620,'dress-floral':1600,'dress-striped':1620};
const artistSleeves={"top-sparkle-pink":"assets/dressing-lena/IMG_6182.png","jacket-inspector":"assets/dressing-lena/IMG_6183.png","top-sparkle-charcoal":"assets/dressing-lena/IMG_6184.png","jacket-green":"assets/dressing-lena/IMG_6185.png","jacket-george-sand":"assets/dressing-lena/IMG_6186.png","jacket-purple":"assets/dressing-lena/IMG_6187.png","top-george-sand":"assets/dressing-lena/IMG_6188.png","top-inspector":"assets/dressing-lena/IMG_6189.png","top-bow-knit":"assets/dressing-lena/IMG_6190.png","top-pajama-leopard":"assets/dressing-lena/IMG_6191.png","jacket-cardigan":"assets/dressing-lena/IMG_6192.png","dress-floral":"assets/dressing-lena/IMG_6230.png","jacket-fleece":"assets/dressing-lena/IMG_6194.png","top-lime":"assets/dressing-lena/IMG_6195.png","top-pajama":"assets/dressing-lena/IMG_6196.png","jacket-striped-knit":"assets/dressing-lena/IMG_6197.png","top-peter-pan":"assets/dressing-lena/IMG_6198.png","top-bow-blouse-tucked":"assets/dressing-lena/IMG_6199.png","jacket-yukata":"assets/dressing-lena/IMG_6200.png","suit-miffy":"assets/dressing-lena/IMG_6201.png","top-pullover":"assets/dressing-lena/IMG_6227.png","jacket-blue":"assets/dressing-lena/IMG_6202.png","top-bear":"assets/dressing-lena/IMG_6203.png","jacket-badges":"assets/dressing-lena/IMG_6204.png","jacket-ganni-knit":"assets/dressing-lena/IMG_6205.png","top-pajama-blue":"assets/dressing-lena/IMG_6206.png"};
function canvas(){const c=document.createElement('canvas');c.width=CW;c.height=CH;return c}
function create({source,changed}){
 const images=new Map(),profiles=new Map(),frames=new Map(),shoulders=new Map();let queued=false,lastSources="";
 function invalidate(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;changed()})}}
 function image(src){if(!images.has(src)){const im=new Image();im.src=src;const r={im,loaded:false};r.ready=im.decode().then(()=>{r.loaded=true;frames.clear();invalidate()});r.ready.catch(()=>{});images.set(src,r)}return images.get(src)}
 function get(id){return image(source(id))}
 function profile(id){const key=source(id);if(profiles.has(key))return profiles.get(key);const r=get(id);if(!r.loaded)return null;
  const c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(r.im,0,0,CW,CH);const px=ctx.getImageData(0,0,CW,CH).data,rows=[];let hem=0;
  for(let y=0;y<CH;y++){let l=CW,h=-1,run=0;for(let x=0;x<CW;x++){run=px[(y*CW+x)*4+3]>90?run+1:0;if(run>=3){l=Math.min(l,x-run+1);h=x;}}
   // Central fabric excludes detached sleeves when measuring a coat's skirt.
   let cl=500,cr=500;if(px[(y*CW+500)*4+3]>90){while(cl>0&&px[(y*CW+cl-1)*4+3]>50)cl--;while(cr<CW-1&&px[(y*CW+cr+1)*4+3]>50)cr++;if(cr-cl>30)hem=y;}
   rows.push(h>l?{l,h,cl:cr-cl>30?cl:l,cr:cr-cl>30?cr:h}:null);
  }
  const bottom=rows.findLastIndex(r=>r&&r.h-r.l>40);if(['jacket-inspector','jacket-george-sand','jacket-green','jacket-yukata'].includes(id))hem=bottom;const p={rows,hem,bottom};profiles.set(key,p);return p;
 }
 // Sample actual opacity at the strap contact, not the row's bounding box.
 // A sustained run rejects isolated drawing specks and detached outlines.
 function shoulder(s,x,fallback){
  const paths=[['assets/dressing-lena/IMG_5722.png',320],...garmentSlots.map(k=>s[k]).filter(Boolean).map(id=>[source(id),id==='top-bear'?380:320])];
  const column=Math.round(x/S);let edge=null;
  // The bear hood rises above the load-bearing shoulder; exclude the hood.
  for(const [src,start] of paths){const r=image(src);if(!r.loaded)continue;
   const key=src+':'+column+':'+start;
   if(!shoulders.has(key)){
    const c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(r.im,0,0,CW,CH);
    const data=ctx.getImageData(column-2,start,5,450-start).data;let run=0,found=null;
    for(let y=0;y<450-start;y++){let opaque=0;for(let dx=0;dx<5;dx++)if(data[(y*5+dx)*4+3]>90)opaque++;
     run=opaque>=3?run+1:0;if(run===6){found=(start+y-5)*S;break;}}
    shoulders.set(key,found);
   }
   const y=shoulders.get(key);if(y!==null)edge=edge===null?y:Math.min(edge,y);
  }
  return edge===null?fallback:edge+4;
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
 // Preserve original lower artwork. Trench-specific variants will be supplied
 // by the artist; never compress scanlines or invent replacement contours.
 function boots(id,pants){const r=get(id),p=profile(pants);if(!r.loaded||!p)return null;
  return remember('boots:'+id+':'+pants,()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(r.im,0,0,CW,CH);
   const pc=canvas(),m=pc.getContext('2d',{willReadFrequently:true});m.drawImage(get(pants).im,0,0,CW,CH);
   const pixels=m.getImageData(0,0,CW,CH).data;
   // Measure each trouser leg independently. Clip only the shaft above its
   // actual hem, including outlines outside the fabric and between the legs.
   for(const [left,right] of [[0,500],[500,CW]]){let hem=0;
    for(let y=850;y<CH;y++){let count=0;for(let x=left;x<right;x++)if(pixels[(y*CW+x)*4+3]>90)count++;
     if(count>=12)hem=y;}
    if(hem)ctx.clearRect(left,0,right-left,hem+1);
   }return c;});
 }
 function underVest(id,outer){const r=get(id),o=get(outer),p=profile(outer);
  const collar=id==='top-peter-pan'?image('assets/dressing-lena/IMG_5999.png'):null;
  if(!r.loaded||!o.loaded||!p||(collar&&!collar.loaded))return null;
  return remember('vest:'+id+':'+outer,()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(r.im,0,0,CW,CH);
   // Remove only the collar supplied separately, without changing the blouse.
   if(collar){ctx.globalCompositeOperation='destination-out';ctx.drawImage(collar.im,0,0,CW,CH);ctx.globalCompositeOperation='source-over';}
   const oc=canvas(),m=oc.getContext('2d',{willReadFrequently:true});m.drawImage(o.im,0,0,CW,CH);const px=m.getImageData(0,0,CW,CH).data;
   // Shoulder seams follow the actual vest artwork. Leave the central neck
   // opening and sleeves outside the shoulder straps intact.
   for(let x=350;x<650;x++){if(x>440&&x<555)continue;let edge=0;
    for(let y=330;y<410;y++)if(px[(y*CW+x)*4+3]>100){edge=y;break;}
    if(edge)ctx.clearRect(x,330,1,edge-330);
   }
   // Conceal a shirt hem beneath the knit without cutting off its sleeves.
   if(outer==='top-ganni-knit')ctx.clearRect(410,p.bottom+1,180,CH-p.bottom-1);
   return c;});
 }
 const bareDresses=new Set(['dress-blue','dress-polka','dress-gingham','dress-denim','dress-pink-check','dress-pink-bustier']);
 function hands(s,entries,forearm=false){const src=s.gloves?source(s.gloves):'assets/dressing-lena/IMG_5495.png',r=image(src);
  const ids=garmentSlots.map(k=>s[k]).filter(id=>id&&(forearm||(!sleeveless.has(id)&&!bareDresses.has(id))));
  if(!r.loaded||ids.some(id=>!get(id).loaded))return null;
  return remember('arms:'+src+':'+forearm+':'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(r.im,0,0,CW,CH);
   // The ordinary foreground layer restores wrists and fingers only. Bare
   // upper arms already exist in the body and must never repaint over tops.
   if(!s.gloves)ctx.clearRect(0,0,CW,forearm?350:780);
   ctx.globalCompositeOperation='destination-out';for(const id of ids){
    const e=entries.find(e=>e.id===id);
    // Only sleeves can cover arms: a dress's skirt must not erase the hands.
    const bare=sleeveless.has(id)||bareDresses.has(id)||['top-yellow','top-white','top-pink','top-dj'].includes(id);
    const end=forearm&&bare?550:s.dresses===id?800:CH;
    if(forearm&&['top-sparkle-pink','top-sparkle-charcoal'].includes(id))continue;
    ctx.save();ctx.beginPath();
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
 function shoulderBag(entries,s){if(!['bag-brown','bag-crochet'].includes(s.bags))return null;
  const parts=entries.filter(e=>e.src?.includes('IMG_554')||e.id==='bag-crochet');if(garmentSlots.some(k=>s[k]&&!get(s[k]).loaded)||parts.some(e=>!(e.id?get(e.id):image(e.src)).loaded)||!image('assets/dressing-lena/IMG_5993.png').loaded)return null;
  return remember('shoulder-bag:'+JSON.stringify([s,parts.map(e=>e.fit)]),()=>{const c=canvas(),ctx=c.getContext('2d');parts.forEach(e=>paint(ctx,e));
   const mask=canvas(),m=mask.getContext('2d');m.drawImage(image('assets/dressing-lena/IMG_5993.png').im,0,0,CW,CH);
   for(const e of entries)if(garmentSlots.some(k=>s[k]===e.id))paint(m,e);
   m.fillRect(0,440,CW,CH-440);ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);return c;
  });
 }
 function bodyFrame(e,s,outer){if(!image(e.src).loaded)return null;
  // The artist now supplies hats with visible hair over the bald tattooed body.
  const hat=null;
  if(hat&&!get(hat).loaded)return null;
  if(['top-pullover','top-lime'].includes(outer)&&!get(outer).loaded)return null;
  if(!hat&&!['top-pullover','top-lime'].includes(outer))return null;
  return remember('body:'+e.src+':'+s.hat+':'+outer,()=>{const c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image(e.src).im,0,0,CW,CH);
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
 function sources(entries,s){const ids=garmentSlots.map(k=>s[k]).filter(Boolean);if(s.phone)ids.push(s.phone);if(s.gloves)ids.push(s.gloves);if(s.pants)ids.push(s.pants);if(s.hat)ids.push(s.hat);if(s.bags)ids.push(s.bags);if(s.shoes)ids.push(s.shoes);if(s.skirts)ids.push(s.skirts);return [...new Set([...ids.map(source),...ids.filter(id=>artistSleeves[id]).map(id=>artistSleeves[id]),...entries.filter(e=>e.src).map(e=>e.src),'assets/dressing-lena/IMG_5999.png','assets/dressing-lena/IMG_5994.png','assets/dressing-lena/IMG_5993.png','assets/dressing-lena/IMG_5722.png','assets/dressing-lena/IMG_5495.png'])]}
 async function ready(entries,s){await Promise.all(sources(entries,s).map(src=>image(src).ready))}
 function process(entries,s){const paths=sources(entries,s),signature=JSON.stringify(paths);if(signature!==lastSources){frames.clear();lastSources=signature;}paths.forEach(image);
  const outer=s.wrap||s.jackets||s.vest||s.cardigan||s.sweater||(s.dresses==='dress-denim'?s.dresses:s.overalls)||(['top-damson','top-gabzilla','top-plantasia','top-pink-floyd'].includes(s.tops)?s.tops:null);
  const outEntry=entries.find(e=>e.id===outer),z=outEntry?.z;
  const result=entries.map(e=>{if(!e.id||e.hood||e.canvas)return {...e};
   const key=Object.keys(s).find(k=>s[k]===e.id);
   if(key==='shoes'&&s.pants&&['shoes-boots','shoes-dj','shoes-green','shoes-george-sand'].includes(e.id)){const c=boots(e.id,s.pants);return {...e,canvas:c||undefined};}
   if(['top-ganni-knit','jacket-floral'].includes(outer)&&e.id!==outer&&e.z<z&&['tops','sheer','dresses'].includes(key)){const c=underVest(e.id,outer);if(c)return {...e,canvas:c,clip:null,fit:null};}
   // Hands occlude the original lower garment; never reshape it to clear wrists.
   if(['pants','skirts','overalls'].includes(key)){return {...e,clip:null,localClip:null,rowFit:null,fit:null};}
   if(outer&&!sleeveless.has(outer)&&e.id!==outer&&e.z<z&&['tops','sheer','sweater','cardigan','vest','dresses'].includes(key)){
    const c=key==='dresses'?null:contained(e.id,outer,true);if(c)return {id:e.id,z:e.z,canvas:c,cover:e.cover};
   }
   return ['tops','sheer','dresses','overalls','sweater','cardigan','vest'].includes(key)?{...e,clip:null,rowFit:null,fit:null}:{...e};
  });
  // The polka dress's tied straps are tucked under the vest at the shoulders.
  if(s.vest&&s.dresses==='dress-polka'){const e=result.find(e=>e.id==='dress-polka');if(e){const c=canvas(),ctx=c.getContext('2d');paint(ctx,e);ctx.clearRect(0,0,CW,465);e.canvas=c;e.clip=null;e.fit=null;}}
  const base=result.find(e=>e.body);if(base){const c=bodyFrame(base,s,outer);if(c)base.canvas=c;}
  const brown=shoulderBag(result,s);if(brown){for(let i=result.length-1;i>=0;i--)if(result[i].src?.includes('IMG_554')||result[i].id==='bag-crochet')result.splice(i,1);result.push({canvas:brown,z:19,part:s.bags});}
  if(s.phone){const e=result.find(e=>e.id===s.phone),c=phone(s,result);if(e&&c)e.canvas=c;}
  const hand=hands(s,result);if(hand){
   for(let i=result.length-1;i>=0;i--)if(result[i].src?.includes('IMG_5495')||(s.gloves&&result[i].id===s.gloves))result.splice(i,1);
   result.push({canvas:hand,z:10.2,part:'hands'});
  }
  if(s.bags==='bag-crochet'&&hand){
   const forearm=hands(s,result,true);
   const key='crochet:'+(s.gloves||'')+':'+garmentSlots.map(k=>s[k]||'').join(',');
   const c=remember(key,()=>{const c=canvas(),ctx=c.getContext('2d');
    // Skin is behind fabric, but in front of the bag. Keep the complete left
    // arm, masking shoulder straps/ruffles with their real alpha silhouette.
    if(forearm){ctx.save();ctx.beginPath();ctx.rect(0,0,445,CH);ctx.clip();ctx.drawImage(forearm,0,0);ctx.restore();}
    const garments=result.filter(e=>e.id&&garmentSlots.some(k=>s[k]===e.id)).sort((a,b)=>a.z-b.z);
    for(const e of garments){
     if(sleeveless.has(e.id)||bareDresses.has(e.id)||['top-yellow','top-white','top-pink','top-dj'].includes(e.id))continue;
     const exact=canvas(),m=exact.getContext('2d');
     if(artistSleeves[e.id]){
      const sleeve=image(artistSleeves[e.id]);if(!sleeve.loaded)continue;
      m.drawImage(sleeve.im,0,0,CW,CH);
      const visible=canvas(),v=visible.getContext('2d',{willReadFrequently:true});paint(v,e);
      const pixels=v.getImageData(0,0,CW,CH);
      for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i])pixels.data[i]=255;
      v.putImageData(pixels,0,0);m.globalCompositeOperation='destination-in';m.drawImage(visible,0,0);m.globalCompositeOperation='source-over';
     }else{
      // Legacy sleeves pending an artist layer: do not let their torso patch
      // reappear over an outer coat. The same occlusion applies to every layer.
      m.save();m.beginPath();m.moveTo(0,500);m.lineTo(400,500);m.lineTo(398,580);m.lineTo(384,650);m.lineTo(365,720);m.lineTo(360,785);m.lineTo(385,855);m.lineTo(0,855);m.closePath();m.clip();
      m.beginPath();m.rect(0,0,CW,(sleeveEnd[e.id]||1600)/S);m.clip();paint(m,e);m.restore();
     }
     m.globalCompositeOperation='destination-out';
     for(const above of garments)if(above.z>e.z)paint(m,above);
     ctx.drawImage(exact,0,0);
    }return c;});result.push({canvas:c,z:19.5,part:'bag-arm'});
  }
  // Hand-held handles go behind the original fingers.
  if(s.bags==='bag-heart'&&hand){const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(hand,0,0);ctx.clearRect(0,0,550,CH);result.push({canvas:c,z:19.5,part:'handle-hand'});}
  return result.sort((a,b)=>a.z-b.z);
 }
 return {ready,process,profile,shoulder};
}
window.NanaDressingGeometry={create};
})();

