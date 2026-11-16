import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.split('id="assets">')[1].split('</script>')[0]);
function progress(storage=new Map()){
 const env={window:null,URLSearchParams,location:{search:''},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=>null},addEventListener(){}};env.window=env;env.parent=env;
 vm.runInNewContext(readFileSync(new URL('../nana-progress.js',import.meta.url),'utf8'),env);return env.NanaProgress;
}
test('six Preacher pieces unlock from the small dog, including discoveries saved before their release',()=>{
 const storage=new Map(),p=progress(storage);assert.equal(p.unlockedOutfit('preacher'),false);p.feat('preacher-dog');const restored=progress(storage),outfit=restored.outfits.find(o=>o.id==='preacher');assert(restored.unlockedOutfit('preacher'));assert.equal(outfit.pieces.length,6);assert.equal(Object.keys(outfit.values).length,6);for(const id of outfit.pieces)assert(data.items[id]&&data.fitted[id]&&data.thumbnails[id]);
});
test('mask uses a hairless base; goggles, boots and gloves render above their matching parts',()=>{
 const outfit=progress().outfits.find(o=>o.id==='preacher');
 const env={slots:{...outfit.values,makeup:new Set()},data,BASE:data.base,HAT_HAIR_CORRECTIONS:{},FITTED:data.fitted,SPRITES:data.sprites,PULLOVERS:new Set(),bagFits:()=>({}),underJacketClip:()=>null,raisedCollar:()=>null,badgeCarrier:()=>null,correctedSource:id=>data.fitted[id]||data.sprites[id],BAG_CHARM_FILES:{},correctionFile:n=>'correction-'+n};
 const start=html.indexOf('function outfitLayers(){'),end=html.indexOf('let avatarRevision',start);vm.runInNewContext(html.slice(start,end),env);
 let layers=env.outfitLayers(),z=id=>layers.find(e=>e.id===id).z;assert.equal(layers.find(e=>e.body).src,'correction-35');assert(z('head-preacher-goggles')>z('head-preacher-dog'));assert(z('shoes-preacher')>z('suit-preacher'));assert(z('accessory-preacher-gloves')>z('suit-preacher'));assert(z('jewelry-preacher-leash')>z('suit-preacher'));
 env.slots.hat=null;layers=env.outfitLayers();assert.equal(layers.find(e=>e.body).src,data.base);
});
test('mask and goggles coexist; mask excludes hair clips; catsuit replaces trousers and tops',()=>{
 const env={window:{}};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),env);const r=env.window.NanaWardrobeRules,s={makeup:new Set()};
 for(const id of ['top-white','pants-green','suit-preacher','head-preacher-dog','head-preacher-goggles','accessory-preacher-gloves'])r.choose(s,id,data.items);
 assert.equal(s.dresses,'suit-preacher');assert(!s.tops&&!s.pants);assert.equal(s.hat,'head-preacher-dog');assert.equal(s.glasses,'head-preacher-goggles');assert.equal(s.gloves,'accessory-preacher-gloves');
 r.choose(s,'head-miffy-clips',data.items);assert(!s.hat);r.choose(s,'head-preacher-dog',data.items);assert(!s.clips);
});
