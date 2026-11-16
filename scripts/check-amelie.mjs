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
test('Amelie is locked until the wall memory box is discovered; discovery survives reload',()=>{
 const storage=new Map(),p=progress(storage);assert.equal(p.unlockedOutfit('amelie-poulain'),false);p.feat('secret-memory-box');const restored=progress(storage),o=restored.outfits.find(o=>o.id==='amelie-poulain');assert(restored.unlockedOutfit(o.id));assert.equal(o.pieces.length,4);for(const id of o.pieces)assert(data.items[id]&&data.fitted[id]&&data.thumbnails[id]);
});
test('cardigan coexists with the dress, umbrella uses three ordered layers and an object-only catalogue image',()=>{
 const o=progress().outfits.find(o=>o.id==='amelie-poulain'),rEnv={window:{}};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),rEnv);const rules=rEnv.window.NanaWardrobeRules,s={makeup:new Set()};for(const id of o.pieces)rules.choose(s,id,data.items);assert.equal(s.cardigan,'jacket-amelie');assert.equal(s.dresses,'dress-amelie');assert.equal(s.handObject,'held-amelie-umbrella');
 const env={slots:s,data,BASE:data.base,HAT_HAIR_CORRECTIONS:{},FITTED:data.fitted,SPRITES:data.sprites,PULLOVERS:new Set(),bagFits:()=>({}),underJacketClip:()=>null,raisedCollar:()=>null,badgeCarrier:()=>null,correctedSource:id=>data.fitted[id]||data.sprites[id],BAG_CHARM_FILES:{},correctionFile:n=>'correction-'+n};
 const start=html.indexOf('function outfitLayers(){'),end=html.indexOf('let avatarRevision',start);vm.runInNewContext(html.slice(start,end),env);const layers=env.outfitLayers();const z=id=>layers.find(e=>e.id===id).z;assert(z('jacket-amelie')>z('dress-amelie'));assert.equal(layers.find(e=>e.body).src,'assets/dressing-lena/IMG_6650.png');
 const held=layers.filter(e=>e.owner==='held-amelie-umbrella');assert.equal(held.length,3);assert.deepEqual(Array.from(held,e=>e.src),['assets/IMG_7249.png','assets/IMG_7250.png','assets/IMG_7251.png']);assert(held[0].z<held[1].z&&held[1].z<held[2].z);assert.equal(data.sprites['held-amelie-umbrella'],'assets/IMG_7250.png');
});
