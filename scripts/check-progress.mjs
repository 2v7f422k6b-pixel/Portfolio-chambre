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
  const cafe=p.outfits.find(x=>x.id==='cafe');
  assert.equal(cafe.values.tops,'top-bear');assert.ok(cafe.pieces.includes('top-bear'));
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
test('Sonny hides hair while the bear sweater keeps it visible',()=>{
 const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
 const assets=JSON.parse(html.split('id="assets">')[1].split('</script>')[0]);
 assert.ok(existsSync(new URL('../'+assets.hairlessBase,import.meta.url)));
 const fn=html.slice(html.indexOf('function outfitLayers(){'),html.indexOf('function renderAvatar(){'));
 const slots={hat:'head-sonny-rabbit',jackets:'jacket-purple',makeup:new Set()};
 const env={slots,BASE:assets.base,HAIRLESS_BASE:assets.hairlessBase,ITEMS:assets.items,
  PULLOVERS:new Set(),raisedCollar:()=>null,bagFits:()=>({}),underJacketClip:()=>null,GREEN_COAT_BOTTOM_FITS:{},FACE_FOREGROUND:[]};
 const layers=vm.runInNewContext('('+fn.trim()+')',env);
 for(const jacket of ['jacket-purple',null]){
  slots.jackets=jacket;
  const bodies=layers().filter(x=>x.z===1||x.z===13);
  assert.equal(bodies.length,jacket?2:1);
  assert.ok(bodies.every(x=>x.src===assets.hairlessBase));
 }
 slots.hat=null;slots.sweater='top-bear';slots.jackets='jacket-purple';
 assert.ok(layers().filter(x=>x.z===1||x.z===13).every(x=>x.src===assets.base));
 assert.ok(layers().some(x=>x.id==='top-bear'&&x.hood&&x.z>13));
 slots.sweater=null;
 for(const hat of [null,'head-headlamp','head-miffy']){
  slots.hat=hat;slots.jackets='jacket-purple';
  assert.ok(layers().filter(x=>x.z===1||x.z===13).every(x=>x.src===assets.base));
 }
});

test('paint overalls unlock with the existing atelier activity and retain that saved discovery',()=>{
 const {p,storage}=browser();const notices=[];p.subscribe(e=>notices.push(...e.added));
 assert.equal(p.unlockedOutfit('atelier'),false);
 const atelier=p.outfits.find(x=>x.id==='atelier');
 assert.ok(atelier.pieces.includes('suit-paint'));assert.equal(atelier.values.overalls,'suit-paint');
 p.visit('jeu/coloring');p.visit('jeu/coloring');
 assert.equal(p.unlockedOutfit('atelier'),true);
 assert.equal(notices.filter(x=>x==='outfit:atelier').length,1);
 assert.equal(browser({storage}).p.unlockedOutfit('atelier'),true);
});
test('overalls combine with tops and jackets and exclude other bottoms in either selection order',()=>{
 const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
 const assets=JSON.parse(html.split('id="assets">')[1].split('</script>')[0]);
 const slots={tops:'top-white',jackets:'jacket-purple',pants:'pants-pajama',skirts:null,dresses:null,overalls:null,makeup:new Set()};
 const env={slots,ITEMS:assets.items,PULLOVERS:new Set(['top-pullover','top-lime']),progress:null,clownActive:false,render:()=>{},itemUnlocked:()=>true};
 const slotFn=html.slice(html.indexOf('function slotFor(id){'),html.indexOf('function selected(id)'));
 const selectFn=html.slice(html.indexOf('function select(id){'),html.indexOf('function applyPreset(i)'));
 env.window={};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),env);env.rules=env.window.NanaWardrobeRules;vm.runInNewContext(slotFn+selectFn,env);
 env.select('suit-paint');assert.equal(slots.overalls,'suit-paint');assert.equal(slots.pants,null);
 assert.equal(slots.tops,'top-white');assert.equal(slots.jackets,'jacket-purple');
 env.select('top-gabzilla');assert.equal(slots.overalls,'suit-paint');assert.equal(slots.tops,'top-gabzilla');
 for(const id of ['pants-pajama','skirt-black','dress-blue','suit-miffy']){
  env.select(id);assert.equal(slots.overalls,null);
  env.select('suit-paint');assert.equal(slots.overalls,'suit-paint');
  for(const key of ['pants','skirts','dresses'])assert.equal(slots[key],null);
 }
 env.select('suit-paint');assert.equal(slots.overalls,null);
});

test('Shining requires the typewriter and cafe socks follow the latte reward',()=>{
 const {p,storage}=browser();
 const cafe=p.outfits.find(x=>x.id==='cafe');assert.ok(cafe.pieces.includes('hosiery-cafe'));assert.equal(cafe.values.hosiery,'hosiery-cafe');
 assert.equal(p.unlockedOutfit('shining'),false);p.feat('latte-made');assert.equal(p.unlockedOutfit('shining'),false);
 p.feat('secret-typewriter');assert.equal(p.unlockedOutfit('shining'),true);assert.equal(browser({storage}).p.unlockedOutfit('shining'),true);
 assert.equal(p.outfits.find(x=>x.id==='shining').pieces.length,4);
});

test('camera needs distinct photos across visits; phone and waistcoat have separate triggers',()=>{
 const {p,storage}=browser();const ids=['a','b','c','d','e','f','g'];
 p.readPolaroid('a',ids);p.readPolaroid('a',ids);p.readPolaroid('unknown',ids);
 assert.equal(p.unlockedOutfit('photographer'),false);
 for(const id of ids.slice(1,6))p.readPolaroid(id,ids);
 const q=browser({storage}).p;assert.equal(q.unlockedOutfit('photographer'),false);q.readPolaroid('g',ids);assert.equal(q.unlockedOutfit('photographer'),true);
 assert.equal(q.unlockedOutfit('flower'),false);assert.equal(q.unlockedOutfit('tresors'),false);
 q.visit('objet/lampe-fleur');assert.equal(q.unlockedOutfit('flower'),true);assert.equal(q.unlockedOutfit('tresors'),false);
 q.feat('beads-made');assert.equal(q.unlockedOutfit('tresors'),true);
 const creator=browser({creator:true}).p;for(const id of ids)creator.readPolaroid(id,ids);assert.equal(creator.unlockedOutfit('photographer'),false);
});

test('the five patches unlock at real exploration thresholds and stay earned after reload',()=>{
 const {p,env,storage}=browser(),required=Array.from({length:49},(_,i)=>'object:test-'+i);
 let discovered=[];
 env.NanaDiscoveries={snapshot:()=>({required,discovered})};
 const notices=[];p.subscribe(e=>notices.push(...e.added));
 const earned=()=>p.stickers.filter(b=>b.earned()).length;
 assert.equal(p.stickers.length,5);assert.equal(earned(),0);
 p.feat('latte-made');p.feat('beads-made');p.feat('rested');assert.equal(earned(),0,'activity rewards do not add patches');
 for(const [count,total] of [[1,1],[12,1],[13,2],[24,2],[25,3],[36,3],[37,4],[48,4],[49,5]]){
  discovered=[...required.slice(0,count),required[0],'unknown-object'];p.refresh();
  assert.equal(earned(),total,'unique required discoveries: '+count);
 }
 p.refresh();assert.equal(notices.filter(id=>id.startsWith('sticker:')).length,5,'one notification per patch');
 assert.equal(browser({storage}).p.stickers.filter(b=>b.earned()).length,5,'standalone dressing retains patches');
 required.push('object:new-zone');p.refresh();assert.equal(earned(),5,'new room objects do not revoke earned patches');
});

test('saved room totals restore thresholds and patch progress merges between tabs',()=>{
 const required=Array.from({length:48},(_,i)=>'object:'+i);
 const storage=new Map([[roomKey,JSON.stringify({required,discovered:required.slice(0,24)})]]);
 const a=browser({storage}),b=browser({storage});
 assert.equal(a.p.stickers.filter(x=>x.earned()).length,3);
 storage.set(roomKey,JSON.stringify({required,discovered:required}));a.emit('storage',{key:roomKey});
 b.emit('storage',{key:b.p.BADGES_KEY});assert.equal(b.p.stickers.filter(x=>x.earned()).length,5);
 const old=browser({storage:new Map([[roomKey,JSON.stringify({discovered:['object:old'],celebrated:true,rewardSeen:true})]])});
 assert.equal(old.p.stickers.filter(x=>x.earned()).length,5,'previous completed explorers retain all five milestones');
 for(const options of [{creator:true},{search:'?previewReward=1'}]){
  const preview=browser(options);preview.env.NanaDiscoveries={snapshot:()=>({required,discovered:required})};preview.p.refresh();
  assert.equal(preview.p.stickers.filter(x=>x.earned()).length,0,'preview does not award patches');
  assert.equal(preview.storage.has(preview.p.BADGES_KEY),false);
 }
});

test('removing the flower shortcut keeps full exploration reachable and old achievements intact',()=>{
  const oldRoom={discovered:['object:instax'],required:['object:instax','flowers'],celebrated:false};
  const storage=new Map([[roomKey,JSON.stringify(oldRoom)]]);
  const {p,env}=browser({storage});
  assert.equal(p.fullRoom(),true);
  assert.equal(p.snapshot().room.required.includes('flowers'),false);
  assert.equal(p.snapshot().room.discovered.includes('object:instax'),true);
  assert.deepEqual(JSON.parse(storage.get(roomKey)),oldRoom);
  const remembered=[];
  env.NanaDiscoveries={remember:id=>remembered.push(id),snapshot:()=>({required:['object:instax'],discovered:['object:instax']})};
  p.visit('illustrations');
  assert.deepEqual(remembered,[]);
  assert.equal(p.fullRoom(),true);
});

test('denim dress, overalls and GANNI accept a blouse in both selection orders',()=>{
 const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
 const assets=JSON.parse(html.split('id="assets">')[1].split('</script>')[0]);
 const env={slots:{makeup:new Set()},ITEMS:assets.items,PULLOVERS:new Set(),progress:null,clownActive:false,render:()=>{},itemUnlocked:()=>true};
 env.window={};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),env);env.rules=env.window.NanaWardrobeRules;
 vm.runInNewContext(html.slice(html.indexOf('function slotFor(id){'),html.indexOf('function selected(id)'))+html.slice(html.indexOf('function select(id){'),html.indexOf('function applyPreset(i)')),env);
 for(const outer of ['dress-denim','suit-paint','top-ganni-knit'])for(const pair of [[outer,'top-peter-pan'],['top-peter-pan',outer]]){
  env.slots={makeup:new Set()};for(const id of pair)env.select(id);
  assert.equal(env.slots.tops,'top-peter-pan');assert.ok(Object.values(env.slots).includes(outer));
 }
 env.select('dress-blue');assert.equal(env.slots.tops,null);assert.equal(env.slots.vest,'top-ganni-knit');
});
