/* Personal looks: small, versioned records. No image data and no progress writes. */
(() => {
  'use strict';
  if (window.NanaLooks) return;
  try { if (parent !== window && parent.NanaLooks) { window.NanaLooks=parent.NanaLooks; return; } } catch (_) {}
  const PREFIX='nana-look-v1:', LAST='nana-last-look-v1';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
  let error=null,pending=null;
  function read(key){try {const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch(_){error='read';return null;}}
  function changed(){document.dispatchEvent(new CustomEvent('nana-looks-change'));}
  function write(key,value){
    if(window.NanaProgress?.suppressed())return {ok:false,error:'preview'};
    try{localStorage.setItem(key,JSON.stringify(value));error=null;if(key!==LAST)changed();return {ok:true,value:clone(value)};}
    catch(_){error='write';return {ok:false,error};}
  }
  function get(id){if(!validId(id))return null;const item=read(PREFIX+id);return item?.version===1&&item.id===id&&item.outfit?.slots&&typeof item.name==='string'&&typeof item.createdAt==='string'&&Number.isFinite(Date.parse(item.createdAt))?item:null;}
  function list(){
    const result=[];
    try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(PREFIX)){const item=get(key.slice(PREFIX.length));if(item)result.push(item);}}}
    catch(_){error='read';}
    return result.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));
  }
  function save(name,outfit,id=null){
    const previous=id?get(id):null;
    if(id&&!previous)return {ok:false,error:'missing'};
    const now=new Date().toISOString();
    const item={version:1,id:id||('look-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))),name:String(name).trim().slice(0,80),createdAt:previous?.createdAt||now,updatedAt:now,outfit:clone(outfit)};
    const result=write(PREFIX+item.id,item);
    if(result.ok&&!previous)window.NanaAnalytics?.count('action/look-saved',false);
    return result;
  }
  function rename(id,name){const old=get(id);return old?save(name,old.outfit,id):{ok:false,error:'missing'};}
  function remove(id){
    if(!validId(id)||window.NanaProgress?.suppressed())return {ok:false};
    try{localStorage.removeItem(PREFIX+id);changed();return {ok:true};}catch(_){error='write';return {ok:false,error};}
  }
  function last(outfit,editingId=null){if(arguments.length)return write(LAST,{version:1,outfit:clone(outfit),editingId});const value=read(LAST);return value?.version===1&&value.outfit?.slots?value:null;}
  function defaultName(){return (document.documentElement.lang==='en'?'My look':'Mon look')+' '+(list().length+1);}
  // One isolated dressing instance uses the existing compositor for every Polaroid.
  // Object URLs live only in memory, never in localStorage. Only visible pages render.
  let renderer,queue=Promise.resolve();
  const previews=new Map();
  function engine(){
    if(renderer)return renderer;
    renderer=new Promise((resolve,reject)=>{
      const frame=document.createElement('iframe');frame.hidden=true;frame.inert=true;frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
      frame.src='about-me.html?v=20261110-looks-1&look-preview=1';
      const timer=setTimeout(()=>{frame.remove();renderer=null;reject(new Error('preview timeout'));},30000);
      frame.onload=()=>{const api=frame.contentWindow.NanaDressing;if(api){clearTimeout(timer);resolve(api);}else{clearTimeout(timer);frame.remove();renderer=null;reject(new Error('preview unavailable'));}};
      document.body.append(frame);
    });return renderer;
  }
  function preview(outfit){
    const permissions=window.NanaProgress;
    const key=JSON.stringify([outfit,permissions?.outfits.filter(x=>permissions.unlockedOutfit(x.id)).map(x=>x.id),permissions?.stickers.filter(x=>x.earned()).map(x=>x.id)]);
    if(previews.has(key))return previews.get(key);
    const job=queue.catch(()=>{}).then(async()=>{const api=await engine();const result=await api.preview(outfit);return {...result,url:URL.createObjectURL(result.blob)};});
    queue=job;previews.set(key,job);
    job.catch(()=>previews.delete(key));
    if(previews.size>24){const oldest=previews.keys().next().value;previews.get(oldest).then(x=>URL.revokeObjectURL(x.url)).catch(()=>{});previews.delete(oldest);}
    return job;
  }
  window.NanaLooks={PREFIX,LAST,list,get,save,rename,remove,last,defaultName,preview,status:()=>error,requestWear:id=>{pending=id;},takeWear:()=>{const id=pending;pending=null;return id;}};
  window.addEventListener('storage',event=>{if(event.key===LAST||event.key?.startsWith(PREFIX)||event.key===null)changed();});
})();
