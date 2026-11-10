/* Non-destructive garment composition. All coordinates refer to Léna's 2048 × 3072 canvas. */
(()=>{'use strict';
const CW=1024,CH=1536,S=2;
const garmentSlots=['tops','sheer','dresses','overalls','sweater','cardigan','vest','jackets','wrap'];
const sleeveless=new Set(['top-ganni-knit','vest-george-sand','jacket-floral','dress-denim','suit-paint']);
const sleeveEnd={ 'top-bear':1640,'jacket-blue':1510,'top-pullover':1590,'top-lime':1590,'top-pajama':1590,'top-pajama-blue':1590,'top-pajama-leopard':1590,'top-yellow':900,'top-white':900,'top-pink':800,'top-dj':800,'top-clown':1120,'top-gabzilla':1060,'top-plantasia':1060,'top-pink-floyd':1060,'top-damson':1140,'top-peter-pan':1570,'top-bow-blouse-tucked':1580,'top-george-sand':1590,'top-inspector':1590,'top-sparkle-pink':1620,'top-sparkle-charcoal':1620,'dress-floral':1600,'dress-striped':1620};
const ease=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t)};
function fitRow(left,right,lo,hi,weight=1){return [left+Math.max(0,lo-left)*weight,right-Math.max(0,right-hi)*weight]}
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
  const bottom=rows.findLastIndex(r=>r&&r.h-r.l>40);if(['jacket-inspector','jacket-george-sand','jacket-green','jacket-yukata'].includes(id))hem=bottom;const p={rows,hem};profiles.set(id,p);return p;
 }
 function remember(key,make){if(frames.has(key))return frames.get(key);const c=make();if(frames.size>=8)frames.delete(frames.keys().next().value);frames.set(key,c);return c}
 function contained(id,outer,arms=false,preserveHem=false){const a=profile(id),b=profile(outer);if(!a||!b)return null;
  return remember('fit:'+id+':'+outer+':'+arms+':'+preserveHem,()=>{
   const c=canvas(),ctx=c.getContext('2d'),im=get(id).im;ctx.drawImage(im,0,0,CW,CH);
   const hem=Math.max(b.hem,(sleeveEnd[id]||0)/S);let last=null;for(let y=330;y<Math.min(CH,preserveHem?b.hem:hem+250);y++){
    const row=a.rows[y],out=b.rows[Math.min(y,Math.max(400,b.hem-60))];if(out&&y<=b.hem)last=out;if(!row)continue;
    ctx.clearRect(0,y,CW,1);
    if(y<400){
     // Keep the neck opening, but shoulder bows/ruffles follow the outer silhouette.
     const lo=out?Math.min(out.l+1,420):420,hi=out?Math.max(out.h-1,575):575;
     ctx.drawImage(im,lo*S,y*S,(hi-lo)*S,S,lo,y,hi-lo,1);continue;
    }
    if(!last){ctx.drawImage(im,0,y*S,2048,S,0,y,CW,1);continue;}
    const w=y<=hem?1:1-ease((y-hem)/250);
    const narrow=y>600?(b.hem<900?1:1-ease((y-750)/100)):0;
    const lo=last.l+Math.max(0,385-last.l)*narrow+2,hi=last.h-Math.max(0,last.h-605)*narrow-2;
    if(arms){
     // Preserve the original sleeves in arm panels; torso fabric stays inside the outer piece.
     const end=(sleeveEnd[id]||1600)/S;
     const leftInner= y<600?418:405,rightInner=y<600?577:585;
     if(y<end){ctx.drawImage(im,0,y*S,leftInner*S,S,0,y,leftInner,1);ctx.drawImage(im,rightInner*S,y*S,2048-rightInner*S,S,rightInner,y,CW-rightInner,1);}
     const ml=Math.max(leftInner,lo),mr=Math.min(rightInner,hi);if(mr>ml)ctx.drawImage(im,ml*S,y*S,(mr-ml)*S,S,ml,y,mr-ml,1);
     if(y>hem&&w<1){const bl=lo+(0-lo)*(1-w),br=hi+(CW-hi)*(1-w);ctx.drawImage(im,bl*S,y*S,(br-bl)*S,S,bl,y,br-bl,1);}
    }else{
     const [l,h]=fitRow(row.l,row.h,lo,hi,w);if(h>l)ctx.drawImage(im,row.l*S,y*S,(row.h-row.l+1)*S,S,l,y,h-l+1,1);
    }
   }return c;
  });
 }
 function hands(s){const src='assets/dressing-lena/IMG_5994.png',r=image(src);const ids=[s.tops,s.sheer,s.dresses,s.sweater,s.cardigan,s.jackets].filter(id=>id&&sleeveEnd[id]>1000);if(!r.loaded||ids.some(id=>!get(id).loaded))return null;
  return remember('hands:'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(r.im,0,0,CW,CH);ctx.clearRect(0,0,CW,500);
   ctx.globalCompositeOperation='destination-out';for(const id of ids){const end=sleeveEnd[id]/S;ctx.drawImage(get(id).im,0,0,2048,end*S,0,0,CW,end);}return c;});
 }
 function phone(s){const id=s.phone;if(!id)return null;const ids=garmentSlots.filter(k=>['sweater','cardigan','jackets'].includes(k)||sleeveEnd[s[k]]>1100).map(k=>s[k]).filter(x=>x&&!sleeveless.has(x));if(!get(id).loaded||ids.some(x=>!get(x).loaded))return null;
  return remember('phone:'+ids.join(','),()=>{const c=canvas(),ctx=c.getContext('2d');ctx.drawImage(get(id).im,0,0,CW,CH);ctx.save();ctx.beginPath();ctx.rect(0,0,CW,830);ctx.clip();ctx.globalCompositeOperation='destination-out';for(const x of ids)ctx.drawImage(get(x).im,0,0,CW,CH);ctx.restore();return c;});
 }
 function sources(entries,s){const ids=garmentSlots.map(k=>s[k]).filter(Boolean);if(s.phone)ids.push(s.phone);if(s.pants)ids.push(s.pants);if(s.skirts)ids.push(s.skirts);return [...new Set([...ids.map(source),'assets/dressing-lena/IMG_5994.png','assets/dressing-lena/IMG_5993.png'])]}
 async function ready(entries,s){await Promise.all(sources(entries,s).map(src=>image(src).ready))}
 function process(entries,s){sources(entries,s).forEach(image);
  const outer=s.wrap||s.jackets||s.vest||s.cardigan||s.sweater||(s.dresses==='dress-denim'?s.dresses:s.overalls)||(['top-damson','top-gabzilla','top-plantasia','top-pink-floyd'].includes(s.tops)?s.tops:null);
  const outEntry=entries.find(e=>e.id===outer),z=outEntry?.z;
  const result=entries.map(e=>{if(!e.id||e.hood||e.canvas)return {...e};
   const key=Object.keys(s).find(k=>s[k]===e.id);
   // Hands occlude the original lower garment; never reshape it to clear wrists.
   if(['pants','skirts'].includes(key)&&!s.jackets&&!s.wrap)return {...e,clip:null,rowFit:null,fit:null};
   if(outer&&e.id!==outer&&e.z<z&&['tops','sheer','sweater','cardigan','vest','dresses','overalls','pants','skirts'].includes(key)){
    const c=contained(e.id,outer,sleeveless.has(outer)&&['tops','sheer','cardigan','sweater'].includes(key),!s.jackets&&!s.wrap);if(c)return {id:e.id,z:e.z,canvas:c,cover:e.cover};
   }
   if(e.id===s.phone){const c=phone(s);if(c)return {...e,canvas:c};}return {...e};
  });
  const hand=hands(s);if(hand&&[s.pants,s.skirts,s.dresses,s.overalls,s.tops].some(Boolean)){
   for(let i=result.length-1;i>=0;i--)if(result[i].src?.includes('IMG_5495'))result.splice(i,1);
   result.push({canvas:hand,z:10.2,part:'hands'});
  }
  if(s.bags==='bag-crochet'&&hand){
   const key='crochet:'+garmentSlots.map(k=>s[k]||'').join(',');
   const c=remember(key,()=>{const c=canvas(),ctx=c.getContext('2d');ctx.save();ctx.beginPath();ctx.moveTo(0,390);ctx.lineTo(350,390);ctx.lineTo(375,500);ctx.lineTo(365,700);ctx.lineTo(405,875);ctx.lineTo(0,875);ctx.closePath();ctx.clip();
    const body=image('assets/dressing-lena/IMG_5993.png');if(body.loaded)ctx.drawImage(body.im,0,0,CW,CH);
    for(const e of result.filter(e=>e.part==='hands'||garmentSlots.some(k=>s[k]===e.id)).sort((a,b)=>a.z-b.z)){const im=e.canvas||(e.id&&get(e.id).loaded?get(e.id).im:null);if(im)ctx.drawImage(im,0,0,CW,CH);}ctx.restore();return c;});
   result.push({canvas:c,z:19.5,part:'bag-arm'});
  }
  return result.sort((a,b)=>a.z-b.z);
 }
 return {ready,process,profile};
}
window.NanaDressingGeometry={create,fitRow};
})();
