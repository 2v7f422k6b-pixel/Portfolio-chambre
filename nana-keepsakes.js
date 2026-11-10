/* Visitor-created poems and explicitly saved reading references. Kept on this browser. */
(() => {
  'use strict';
  const KEY='nana-keepsakes-v1', DRAFT_KEY='nana-word-lab-draft-v1';
  const kinds=new Set(['poem','book','excerpt']);
  const text=(v,max)=>typeof v==='string'?v.slice(0,max):'';
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch(_){return fallback;}}
  function clean(item){
    if(!item||!kinds.has(item.kind)||typeof item.id!=='string'||!item.id.length)return null;
    return {id:text(item.id,120),kind:item.kind,title:text(item.title,180),author:text(item.author,180),body:text(item.body,12000),route:/^(objet\/(reading-room|souvenues)\/[a-z0-9-]+|jeu\/word-lab)$/.test(item.route)?item.route:'',created:Number.isFinite(item.created)?item.created:0};
  }
  function list(){const value=read(KEY,[]);return Array.isArray(value)?value.map(clean).filter(Boolean).slice(0,100):[];}
  function changed(){document.dispatchEvent(new Event('nana-keepsakes-change'));}
  function keep(value){
    if(window.NanaProgress?.suppressed())return false;
    const item=clean(value);if(!item)return false;
    const entries=list(),previous=entries.find(x=>x.id===item.id);
    if(!previous&&entries.length>=100)return false;
    item.created=previous?.created||Date.now();
    try{localStorage.setItem(KEY,JSON.stringify([item,...entries.filter(x=>x.id!==item.id)]));changed();if(!previous&&(item.kind==='poem'||item.kind==='book'))window.NanaAnalytics?.record('creation/'+item.kind);return true;}catch(_){window.NanaAnalytics?.record('error/storage',1,true);return false;}
  }
  function remove(id){if(window.NanaProgress?.suppressed())return false;try{localStorage.setItem(KEY,JSON.stringify(list().filter(x=>x.id!==id)));changed();return true;}catch(_){return false;}}
  const has=id=>list().some(x=>x.id===id);
  function draft(value){
    if(arguments.length===0)return read(DRAFT_KEY,null);
    if(window.NanaProgress?.suppressed())return false;
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify(value));return true;}catch(_){return false;}
  }
  window.NanaKeepsakes={KEY,DRAFT_KEY,list,keep,remove,has,draft};
  window.addEventListener('storage',event=>{if(event.key===KEY||event.key===DRAFT_KEY||event.key==='nana-bead-charm-v1')changed();});
})();
