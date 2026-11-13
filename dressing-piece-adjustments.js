/* Per-piece movement, layer order and local masks, shared by preview and PNG. */
(()=>{'use strict';
const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9_-]{0,99}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
const bound=(n,min,max)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):0;
function cleanPieces(raw,cleanMask){const out=Object.create(null);if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 for(const [id,r] of Object.entries(raw).slice(0,64)){if(!validId(id)||!r||typeof r!=='object')continue;
  const mode=['auto','before','after','front','back'].includes(r.mode)?r.mode:'auto',reference=validId(r.reference)&&r.reference!==id?r.reference:'';
  out[id]={dx:bound(r.dx,-700,700),dy:bound(r.dy,-1000,1000),mode:['before','after'].includes(mode)&&!reference?'auto':mode,reference,mask:cleanMask(r.mask)};
 }return out;
}
function wornIds(s){return [...new Set([...Object.values(s).filter(x=>typeof x==='string'),...(Object.prototype.toString.call(s.makeup)==='[object Set]'||Array.isArray(s.makeup)?s.makeup:[])])];}
function ownerOf(e,s){return e.owner||e.id||(e.part===s.bags?s.bags:null);}
function active(r){return !!r&&(r.dx||r.dy||r.mode!=='auto'||r.mask?.length);}
function offset(id,pieces,s){const r=pieces[id]||{},bag=id===s.bagAccessories?pieces[s.bags]||{}:{};return {dx:(r.dx||0)+(bag.dx||0),dy:(r.dy||0)+(bag.dy||0)};}
function clip(ctx,points){if(!points)return;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x/2,y/2):ctx.moveTo(x/2,y/2));ctx.closePath();ctx.clip();}
function rasterEntry(e,{canvas,image,placement}){const c=canvas(),ctx=c.getContext('2d'),im=e.canvas||image(e);if(!im)return null;
 ctx.save();clip(ctx,e.cover);clip(ctx,e.clip);
 if(e.fit){const f=e.fit,ox=(f.ox??970)/2,oy=(f.oy||0)/2;ctx.translate(ox+(f.dx||0)/2,oy+(f.dy||0)/2);ctx.transform(f.sx??1,0,f.kx||0,f.sy??1,0,0);ctx.translate(-ox,-oy);}
 clip(ctx,e.localClip);const rect=!e.canvas&&!e.src&&placement?.(e.id);if(rect)ctx.drawImage(im,...rect);else ctx.drawImage(im,0,0,1024,1536);ctx.restore();return c;
}
function depths(entries,pieces,s){const base=new Map();for(const e of entries){const id=ownerOf(e,s);if(id&&e.role!=='back'&&e.role!=='decoration'&&!base.has(id))base.set(id,e.z);}
 const top=Math.max(44,...entries.map(e=>e.z)),resolved=new Map();
 function get(id,path=new Set()){
  if(resolved.has(id))return resolved.get(id);const z=base.get(id);if(z===undefined)return undefined;if(path.has(id))return z;
  const r=pieces[id];let target=z;if(r?.mode==='front')target=top+1;else if(r?.mode==='back')target=1.1;else if(['before','after'].includes(r?.mode)&&base.has(r.reference)){const p=new Set(path);p.add(id);target=get(r.reference,p)+(r.mode==='before'?.05:-.05);}
  resolved.set(id,target);return target;
 }
 for(const id of base.keys())get(id);return {base,resolved};
}
function applyPieces(entries,s,pieces,helpers){if(!Object.values(pieces).some(active))return entries;
 // Split a cached bag contact overlay only when manual calibration needs its
 // individual sleeves. Ordinary rendering keeps the original compositor.
 let expanded=entries.flatMap(e=>e.part==='bag-arm'&&e.canvas?.nanaSleeveCopies?[{...e,canvas:e.canvas.nanaArmBase,unmaskedArm:e.canvas.nanaUnmaskedArm},...e.canvas.nanaSleeveCopies.map(copy=>({...copy,z:e.z,part:'sleeve-copy'}))]:[e]);
 if(active(pieces[s.scarves]))expanded=expanded.map(e=>({...e,cover:null}));
 const {base,resolved}=depths(expanded,pieces,s),result=[];
 for(const e of expanded){const id=ownerOf(e,s),r=pieces[id],parent=id===s.bagAccessories?pieces[s.bags]:null;
  if(!active(r)&&!active(parent)){result.push(e);continue;}
  let c=rasterEntry(e,helpers);if(!c){result.push(e);continue;}
  if(r?.mask?.length)c=helpers.mask(c,r.mask);
  const shift=offset(id,pieces,s),delta=(resolved.get(id)??base.get(id)??e.z)-(base.get(id)??e.z),parentDelta=parent&&!active(r)?(resolved.get(s.bags)??base.get(s.bags)??19)-(base.get(s.bags)??19):0;
  result.push({...e,canvas:c,src:undefined,clip:null,localClip:null,cover:null,rowFit:null,fit:{sx:1,dx:shift.dx,dy:shift.dy},z:e.role==='back'?Math.min(e.z,.9):r&&r.mode!=='auto'?(resolved.get(id)??e.z)+Math.max(-.02,Math.min(.02,e.z-(base.get(id)??e.z))):parent&&parent.mode!=='auto'&&!active(r)?(resolved.get(s.bags)??19)+.02:e.z+delta+parentDelta});
 }
 // Move the bag contact mask with the bag, rather than leaving an arm-shaped
 // patch at its previous position. Sleeves remain separate, editable pieces.
 if(active(pieces[s.bags])){
  const bag=result.find(e=>ownerOf(e,s)===s.bags&&e.role!=='back'),contact=result.find(e=>e.part==='bag-arm'&&e.unmaskedArm);
  if(bag&&contact){const shape=rasterEntry(bag,helpers);if(shape){const ctx=shape.getContext('2d'),pixels=ctx.getImageData(0,0,1024,1536);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i])pixels.data[i]=255;ctx.putImageData(pixels,0,0);
   const c=helpers.canvas(),m=c.getContext('2d');m.drawImage(contact.unmaskedArm,0,0);m.globalCompositeOperation='destination-in';m.drawImage(shape,0,0);contact.canvas=c;
  }}
 }
 return result.sort((a,b)=>a.z-b.z);
}
const core={validId,cleanPieces,wornIds,ownerOf,active,offset,rasterEntry,depths,applyPieces};
if(typeof module!=='undefined'&&module.exports)module.exports=core;else window.NanaPieceAdjustments=core;
})();
