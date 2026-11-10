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
 // Clip covered upper layers without moving or rescaling a single artwork row.
 function contained(id,outer,upperOnly){const b=profile(outer);if(!b||!get(id).loaded)return null;
  return remember('mask:'+id+':'+outer+':'+upperOnly,()=>{
   const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(get(id).im,0,0,CW,CH);
   for(let y=330;y<=(id==='suit-miffy'?b.bottom:b.hem);y++){
    const r=b.rows[y];if(!r)continue;
    ctx.clearRect(0,y,Math.max(0,r.l),1);ctx.clearRect(r.h+1,y,CW-r.h-1,1);
   }
   if(upperOnly)ctx.clearRect(0,b.hem+1,CW,CH-b.hem-1);
   return c;
  });
 }
 function hands(s,entries){const src=s.gloves?source(s.gloves):'assets/dressing-lena/IMG_5495.png',r=image(src);
  const ids=garmentSlots.map(k=>s[k]).filter(id=>id&&!sleeveless.has(id)&&!['top-sparkle-pink','top-sparkle-charcoal'].includes(id));
  if(!r.loaded||ids.some(id=>!get(id).loaded))return null;
  return remember('arms:'+src+':'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(r.im,0,0,CW,CH);
   ctx.globalCompositeOperation='destination-out';for(const id of ids){const e=entries.find(e=>e.id===id);ctx.drawImage(e?.canvas||get(id).im,0,0,CW,CH);}return c;});
 }
 function phone(s,entries){const id=s.phone;if(!id)return null;const ids=garmentSlots.filter(k=>['sweater','cardigan','jackets'].includes(k)||sleeveEnd[s[k]]>1100).map(k=>s[k]).filter(x=>x&&!sleeveless.has(x));if(!get(id).loaded||ids.some(x=>!get(x).loaded))return null;
  return remember('phone:'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(get(id).im,0,0,CW,CH);ctx.save();ctx.beginPath();ctx.rect(0,0,CW,900);ctx.clip();ctx.globalCompositeOperation='destination-out';for(const x of ids){const e=entries.find(e=>e.id===x);ctx.drawImage(e?.canvas||get(x).im,0,0,CW,CH);}ctx.restore();return c;});
 }
 function sources(entries,s){const ids=garmentSlots.map(k=>s[k]).filter(Boolean);if(s.phone)ids.push(s.phone);if(s.gloves)ids.push(s.gloves);if(s.pants)ids.push(s.pants);if(s.skirts)ids.push(s.skirts);return [...new Set([...ids.map(source),'assets/dressing-lena/IMG_5994.png','assets/dressing-lena/IMG_5993.png','assets/dressing-lena/IMG_5495.png'])]}
 async function ready(entries,s){await Promise.all(sources(entries,s).map(src=>image(src).ready))}
 function process(entries,s){sources(entries,s).forEach(image);
  const outer=s.wrap||s.jackets||s.vest||s.cardigan||s.sweater||(s.dresses==='dress-denim'?s.dresses:s.overalls)||(['top-damson','top-gabzilla','top-plantasia','top-pink-floyd'].includes(s.tops)?s.tops:null);
  const outEntry=entries.find(e=>e.id===outer),z=outEntry?.z;
  const result=entries.map(e=>{if(!e.id||e.hood||e.canvas)return {...e};
   const key=Object.keys(s).find(k=>s[k]===e.id);
   // Hands occlude the original lower garment; never reshape it to clear wrists.
   if(['pants','skirts','overalls'].includes(key))return {...e,clip:null,rowFit:null,fit:null};
   if(outer&&!sleeveless.has(outer)&&e.id!==outer&&e.z<z&&['tops','sheer','sweater','cardigan','vest','dresses'].includes(key)){
    const c=contained(e.id,outer,['tops','sheer','sweater','cardigan','vest'].includes(key));if(c)return {id:e.id,z:e.z,canvas:c,cover:e.cover};
   }
   return ['tops','sheer','dresses','overalls','sweater','cardigan','vest'].includes(key)?{...e,clip:null,rowFit:null,fit:null}:{...e};
  });
  if(s.phone){const e=result.find(e=>e.id===s.phone),c=phone(s,result);if(e&&c)e.canvas=c;}
  const hand=hands(s,result);if(hand){
   for(let i=result.length-1;i>=0;i--)if(result[i].src?.includes('IMG_5495')||(s.gloves&&result[i].id===s.gloves))result.splice(i,1);
   result.push({canvas:hand,z:10.2,part:'hands'});
  }
  if(s.bags==='bag-crochet'&&hand){
   const key='crochet:'+(s.gloves||'')+':'+garmentSlots.map(k=>s[k]||'').join(',');
   const c=remember(key,()=>{const c=canvas(),ctx=c.getContext('2d');ctx.save();ctx.beginPath();ctx.moveTo(0,390);ctx.lineTo(380,390);ctx.lineTo(385,500);ctx.lineTo(390,650);ctx.lineTo(395,750);ctx.lineTo(385,800);ctx.lineTo(405,875);ctx.lineTo(0,875);ctx.closePath();ctx.clip();
    for(const e of result.filter(e=>e.part==='hands'||garmentSlots.some(k=>s[k]===e.id)).sort((a,b)=>a.z-b.z)){const im=e.canvas||(e.id&&get(e.id).loaded?get(e.id).im:null);if(im){ctx.save();if(sleeveEnd[e.id]&&sleeveEnd[e.id]<1200){ctx.beginPath();ctx.rect(0,0,CW,sleeveEnd[e.id]/S);ctx.clip();}ctx.drawImage(im,0,0,CW,CH);ctx.restore();}}ctx.restore();return c;});
   result.push({canvas:c,z:19.5,part:'bag-arm'});
  }
  return result.sort((a,b)=>a.z-b.z);
 }
 return {ready,process,profile};
}
window.NanaDressingGeometry={create};
})();
