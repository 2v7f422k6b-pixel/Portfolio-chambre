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
test('BLAST unlocks eight Nana pieces and Hachi; the independent leopard coat stays outside both collections',()=>{
 const storage=new Map(),p=progress(storage),outfit=p.outfits.find(x=>x.id==='nana-osaki');
 assert.equal(outfit.pieces.length,8);assert.equal(p.unlockedOutfit('nana-osaki'),false);
 assert(!p.outfits.some(o=>o.pieces.includes('jacket-leopard-fur')));p.feat('nana-blast');
 assert(p.unlockedOutfit('nana-osaki'));assert(p.unlockedOutfit('hachi'));assert(progress(storage).unlockedOutfit('nana-osaki'));
 for(const id of outfit.pieces)assert(data.items[id]&&data.fitted[id]&&data.thumbnails[id]);
});
test('guitar case renders behind the mannequin with the strap in front and removes both together',()=>{
 const p=progress(),outfit=p.outfits.find(x=>x.id==='nana-osaki');
 const env={slots:{...outfit.values,makeup:new Set()},data,BASE:data.base,HAT_HAIR_CORRECTIONS:{},FITTED:data.fitted,SPRITES:data.sprites,PULLOVERS:new Set(),bagFits:()=>({}),underJacketClip:()=>null,raisedCollar:()=>null,badgeCarrier:()=>null,correctedSource:id=>data.fitted[id]||data.sprites[id],BAG_CHARM_FILES:{}};
 const start=html.indexOf('function outfitLayers(){'),end=html.indexOf('let avatarRevision',start);vm.runInNewContext(html.slice(start,end),env);
 const layers=env.outfitLayers(),back=layers.find(e=>e.role==='bag-back'),front=layers.find(e=>e.role==='bag-front'),body=layers.find(e=>e.body),jacket=layers.find(e=>e.id==='jacket-nana-heart');
 assert.equal(back.src,'assets/dressing-lena/IMG_7239.png');assert.equal(front.src,'assets/dressing-lena/IMG_7236.png');assert(back.z<body.z);assert(front.z>jacket.z);
 assert.equal(back.owner,'bag-nana-guitar');assert.equal(front.owner,'bag-nana-guitar');env.slots.bags=null;
 assert(!env.outfitLayers().some(e=>['bag-back','bag-front'].includes(e.role)));
 assert.equal(data.sprites['bag-nana-guitar'],'assets/dressing-lena/catalogue-nana-guitar-case.png');
});
test('Nana belt uses the belt slot and both outer coats can be selected independently',()=>{
 const env={window:{}};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),env);const r=env.window.NanaWardrobeRules;
 assert.equal(r.slotFor('jewelry-nana-belt',data.items),'belt');const slots={makeup:new Set()};r.choose(slots,'jacket-leopard-fur',data.items);assert.equal(slots.jackets,'jacket-leopard-fur');r.choose(slots,'jacket-nana-heart',data.items);assert.equal(slots.jackets,'jacket-nana-heart');
});
