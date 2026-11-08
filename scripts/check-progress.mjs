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
test('the three personal secrets replace the old interactions without losing saved history',()=>{
  const storage=new Map([[key,JSON.stringify({visits:[],feats:['secret-rug','secret-cookie','secret-typewriter','secret-twist'],title:null})]]);
  const {p}=browser({storage});
  assert.deepEqual(Array.from(p.secrets,x=>x.id),['secret-rug','secret-memory-box','secret-childhood-drawing']);
  assert.equal(p.secrets.filter(x=>p.hasFeat(x.id)).length,1);
  assert.equal(p.hasFeat('secret-cookie'),true);
  assert.equal(p.titles.find(x=>x.id==='detective').earned(),false);
  p.feat('secret-childhood-drawing');assert.equal(p.hasFeat('secret-childhood-drawing'),false);
  p.feat('secret-memory-box');p.feat('secret-memory-box');
  assert.equal(p.secrets.filter(x=>p.hasFeat(x.id)).length,2);
  assert.equal(p.titles.find(x=>x.id==='detective').earned(),true);
  assert.equal(browser({storage}).p.hasFeat('secret-memory-box'),true);
});
test('opening a route or the cookie never awards the hidden memory box',()=>{
  const {p}=browser();p.visit('secret/boite-a-souvenirs');p.visit('jeu/fortune-cookie');
  assert.equal(p.hasFeat('secret-memory-box'),false);assert.equal(p.hasFeat('secret-cookie'),false);
  assert.equal(p.hasVisit('jeu/fortune-cookie'),true);
});


test('Miffy and DJ unlock only through their activity, persist and notify once',()=>{
 const {p,storage}=browser();const notices=[];p.subscribe(e=>notices.push(...e.added));
 p.visit('jeu/mimilab');assert.equal(p.unlockedOutfit('dj'),false);
 p.visit('objet/miffy');assert.equal(p.unlockedOutfit('miffy'),false);
 for(let i=0;i<6;i++)p.readDialogueLine('miffy',i);
 assert.equal(p.unlockedOutfit('miffy'),true);
 assert.equal(p.unlockedOutfit('dj'),false);
 p.feat('minilab-composed');p.feat('minilab-composed');
 assert.equal(p.unlockedOutfit('dj'),true);
 assert.equal(notices.filter(x=>x==='outfit:dj').length,1);
 const reloaded=browser({storage}).p;assert.equal(reloaded.unlockedOutfit('dj'),true);assert.equal(reloaded.unlockedOutfit('miffy'),true);
 for(const opts of [{creator:true},{search:'?previewReward=1'}]){
  const q=browser(opts).p;q.feat('minilab-composed');q.visit('objet/miffy');
  for(let i=0;i<6;i++)q.readDialogueLine('miffy',i);
  assert.equal(q.unlockedOutfit('dj'),false);assert.equal(q.unlockedOutfit('miffy'),false);
  assert.equal(q.dialogueProgress('miffy').read.length,0);
 }
});
test('Miffy requires six unique lines, not a visit, repeats or Sonny dialogue',()=>{
 const storage=new Map([[key,JSON.stringify({visits:['objet/miffy'],feats:[]})],
  [roomKey,JSON.stringify({discovered:['object:miffy']})]]);
 let {p}=browser({storage});
 assert.equal(p.unlockedOutfit('miffy'),false);
 for(let i=0;i<6;i++){p.readDialogueLine('miffy',0);p.readDialogueLine('sonny-angel',i);}
 for(const i of [-1,6,NaN,'1',1.2])p.readDialogueLine('miffy',i);
 p.readDialogueLine('other',0);
 assert.equal(p.hasReadDialogue('sonny-angel'),true);
 assert.equal(p.unlockedOutfit('miffy'),false);
 assert.equal(p.dialogueProgress('miffy').read.length,1);
 for(let i=1;i<5;i++)p.readDialogueLine('miffy',i);
 p=browser({storage}).p;
 assert.equal(p.dialogueProgress('miffy').read.length,5);
 assert.equal(p.unlockedOutfit('miffy'),false);
 const notices=[];p.subscribe(e=>notices.push(...e.added));
 p.readDialogueLine('miffy',5);p.readDialogueLine('miffy',5);
 assert.equal(p.unlockedOutfit('miffy'),true);
 assert.equal(notices.filter(x=>x==='outfit:miffy').length,1);
 assert.equal(browser({storage}).p.unlockedOutfit('miffy'),true);
});
test('dialogue merges between tabs and remains usable with unavailable storage',()=>{
 const storage=new Map(),a=browser({storage}),b=browser({storage});
 for(let i=0;i<6;i++)(i%2?a:b).p.readDialogueLine('miffy',i);
 for(const tab of [a,b]){
  tab.emit('storage',{key:tab.p.DIALOGUE_KEY});
  assert.equal(tab.p.unlockedOutfit('miffy'),true);
 }
 const {p}=browser({blocked:true});
 for(let i=0;i<6;i++)p.readDialogueLine('miffy',i);
 assert.equal(p.unlockedOutfit('miffy'),true);
});
test('silent recordings do not qualify, music on either channel does',()=>{
 const recorder=readFileSync(new URL('../dreamlab-multitrack.js',import.meta.url),'utf8');
 const fn=recorder.slice(recorder.indexOf('function containsMusic('),recorder.indexOf('  const en='));
 const containsMusic=vm.runInNewContext('('+fn.trim()+')');
 const audio=channels=>({numberOfChannels:channels.length,getChannelData:i=>Float32Array.from(channels[i])});
 assert.equal(containsMusic(audio([[0,0,0],[0,0,0]])),false);
 assert.equal(containsMusic(audio([[0,.00001,0]])),false);
 assert.equal(containsMusic(audio([[0,0,0],[0,-.05,0]])),true);
});

test('Sonny hood and headlamp require their own discoveries and survive reload',()=>{
 const {p,storage}=browser();
 assert.equal(p.unlockedOutfit('sonny'),false);assert.equal(p.unlockedOutfit('night-explorer'),false);
 for(let i=0;i<6;i++)p.readDialogueLine('miffy',i);
 assert.equal(p.unlockedOutfit('sonny'),false);
 for(let i=0;i<5;i++)p.readDialogueLine('sonny-angel',i);
 assert.equal(p.unlockedOutfit('sonny'),false);
 p.readDialogueLine('sonny-angel',5);
 assert.equal(p.unlockedOutfit('sonny'),true);
 assert.equal(p.unlockedOutfit('night-explorer'),false);
 p.visit('night');assert.equal(p.unlockedOutfit('night-explorer'),true);
 const reloaded=browser({storage}).p;
 assert.equal(reloaded.unlockedOutfit('sonny'),true);assert.equal(reloaded.unlockedOutfit('night-explorer'),true);
});
test('Sonny hood uses the hairless body for both the base and purple-jacket face overlay',()=>{
 const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
 const assets=JSON.parse(html.match(/<script type="application\/json" id="assets">([^]*?)<\/script>/)[1]);
 assert.ok(existsSync(new URL('../'+assets.hairlessBase,import.meta.url)));
 const fn=html.slice(html.indexOf('function outfitLayers(){'),html.indexOf('function renderAvatar(){'));
 const slots={hat:'head-sonny-rabbit',jackets:'jacket-purple',makeup:new Set()};
 const env={slots,BASE:assets.base,HAIRLESS_BASE:assets.hairlessBase,ITEMS:assets.items,
  PULLOVERS:new Set(),bagFits:()=>({}),underJacketClip:()=>null,GREEN_COAT_BOTTOM_FITS:{},FACE_FOREGROUND:[]};
 const layers=vm.runInNewContext('('+fn.trim()+')',env);
 for(const jacket of ['jacket-purple',null]){
  slots.jackets=jacket;
  const bodies=layers().filter(x=>x.z===1||x.z===13);
  assert.equal(bodies.length,jacket?2:1);
  assert.ok(bodies.every(x=>x.src===assets.hairlessBase));
 }
 for(const hat of [null,'head-headlamp','head-miffy']){
  slots.hat=hat;slots.jackets='jacket-purple';
  assert.ok(layers().filter(x=>x.z===1||x.z===13).every(x=>x.src===assets.base));
 }
});
