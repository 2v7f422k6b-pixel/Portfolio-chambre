import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';

const source=readFileSync(new URL('../nana-progress.js',import.meta.url),'utf8');
const key='nana-visitor-progress-v1',roomKey='nana-room-exploration-20261104-v1';
function browser({storage=new Map(),blocked=false,creator=false,search=''}={}){
  const handlers=new Map();
  const env={URLSearchParams,location:{search},
    localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);}},
    sessionStorage:{getItem:()=>creator?'1':null},addEventListener:(name,fn)=>handlers.set(name,fn)};
  env.window=env;env.parent=env;
  vm.runInNewContext(source,env);
  return {p:env.NanaProgress,env,storage,emit:(name,event)=>handlers.get(name)?.(event)};
}
test('old discoveries and the existing clown key survive migration without awarding anything twice',()=>{
  const storage=new Map([[roomKey,JSON.stringify({discovered:['object:latte','object:book','mirror'],celebrated:false})],['nana-clown-outfit-unlocked-v1','1']]);
  const {p}=browser({storage});const changes=[];p.subscribe(x=>changes.push(x));
  assert.equal(p.hasVisit('jeu/latte'),true);assert.equal(p.unlockedOutfit('clown'),true);
  assert.equal(p.unlockedOutfit('cafe'),false); // visiting a mug does not finish a recipe
  p.refresh();assert.equal(changes[0].added.length,0);
  p.feat('latte-made');assert.equal(p.unlockedOutfit('cafe'),true);
  const notices=changes.length;p.feat('latte-made');assert.equal(changes.length,notices);
  const reloaded=browser({storage}).p;assert.equal(reloaded.unlockedOutfit('cafe'),true);
  assert.deepEqual(JSON.parse(storage.get(roomKey)).discovered,['object:latte','object:book','mirror']);
});
test('corrupted or unavailable storage leaves a working in-memory visit',()=>{
  for(const options of [{blocked:true},{storage:new Map([[key,'{"visits":42,"feats":null}'],[roomKey,'null']])},{storage:new Map([[key,'broken json']])}]){
    const {p}=browser(options);p.visit('jeu/coloring');p.feat('beads-made');
    assert.equal(p.unlockedOutfit('atelier'),true);assert.equal(p.unlockedOutfit('tresors'),true);
  }
});
test('a deep link and its exact room object share one discovery',()=>{
  const {p,env}=browser();const discovered=new Set();
  env.NanaDiscoveries={remember:id=>discovered.add(id),snapshot:()=>({required:['mirror','object:book'],discovered:[...discovered]})};
  p.visit('jeu/dressing/tenue/clown');p.visit('jeu/dressing');p.visit('livre/la-princesse-clown/page/4');
  assert.deepEqual([...discovered],['mirror','object:book']);assert.equal(p.fullRoom(),true);
  assert.equal(p.snapshot().visits.length,2);
});
test('unknown events and unknown routes cannot unlock a gift or an outfit',()=>{
  const {p}=browser();p.feat('reward:merci10');p.feat('anything');p.visit('jeu/unknown');p.visit('shop');
  assert.equal(p.snapshot().feats.length,0);assert.equal(p.snapshot().visits.length,0);assert.equal(p.fullRoom(),false);
  p.selectTitle('resident');assert.equal(p.snapshot().title,null);
});
test('creator previews unlock clothing for testing without earning stickers, titles or discounts',()=>{
  const {p}=browser({creator:true});p.feat('latte-made');p.visit('jeu/coloring');
  assert.equal(p.unlockedOutfit('cafe',true),true);assert.equal(p.unlockedOutfit('cafe'),false);
  assert.equal(p.snapshot().feats.length,0);assert.equal(p.snapshot().visits.length,0);assert.equal(p.fullRoom(),false);
  const preview=browser({search:'?previewReward=1'}).p;preview.feat('latte-made');assert.equal(preview.unlockedOutfit('cafe'),false);
});
test('different self-care actions are counted once, titles can be worn and removed',()=>{
  const {p}=browser();p.feat('care-feed');p.feat('care-feed');p.feat('care-sleep');
  assert.equal(p.titles.find(x=>x.id==='care').earned(),false);
  p.feat('care-cuddle');assert.equal(p.titles.find(x=>x.id==='care').earned(),true);
  p.selectTitle('care');assert.equal(p.snapshot().title,'care');p.selectTitle(null);assert.equal(p.snapshot().title,null);
});
test('simultaneous tabs merge discoveries rather than overwriting them',()=>{
  const storage=new Map(),a=browser({storage}),b=browser({storage});
  a.p.visit('jeu/latte');b.p.visit('jeu/coloring');a.p.feat('latte-made');b.p.feat('beads-made');
  a.emit('storage',{key});
  for(const p of [a.p,b.p,browser({storage}).p]){
    assert.equal(p.hasVisit('jeu/latte'),true);assert.equal(p.hasVisit('jeu/coloring'),true);
    assert.equal(p.unlockedOutfit('cafe'),true);assert.equal(p.unlockedOutfit('tresors'),true);
  }
});
test('every collectible uses an existing drawing and every bonus outfit uses actual clothing',()=>{
  const {p}=browser();
  for(const entry of [...p.games,...p.stickers,...p.secrets,...p.outfits]){
    const path=typeof entry.image==='object'?entry.image.src:entry.image;
    assert.ok(existsSync(new URL('../'+path,import.meta.url)),path);
  }
  const dressing=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
  const assets=JSON.parse(dressing.match(/<script type="application\/json" id="assets">([^]*?)<\/script>/)[1]);
  for(const outfit of p.outfits)for(const id of [...Object.values(outfit.values),...(outfit.makeup||[])])assert.ok(assets.items[id],id);
});
