import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../nana-looks.js',import.meta.url),'utf8');
function browser(storage=new Map(),options={}){
 let events=0;
 const context={window:{NanaProgress:{suppressed:()=>!!options.creator},addEventListener(){}},document:{documentElement:{lang:'fr'},dispatchEvent(){events++;}},CustomEvent:class{},localStorage:{get length(){return storage.size},key:i=>[...storage.keys()][i],getItem:key=>storage.get(key)??null,setItem(key,value){if(options.fail)throw new Error('quota');storage.set(key,value)},removeItem(key){if(options.fail)throw new Error('quota');storage.delete(key)}},URL,crypto:globalThis.crypto,setTimeout,clearTimeout};
 context.parent=context.window;vm.runInNewContext(source,context);return {s:context.window.NanaLooks,storage,events:()=>events};
}
const outfit={slots:{tops:'top-white',pants:'pants-pajama',jackets:'jacket-badges'},makeup:['makeup-blush'],badges:['glance'],layout:{version:1,badgePlaces:[[825,1030]]}};
const copy=value=>JSON.parse(JSON.stringify(value));
test('named and default looks survive reload, contain only compact outfit data, and do not touch other games',()=>{
 const storage=new Map([['nana-keepsakes-v1','poems'],['nana-progress-v1','rewards'],['bead-box','beads']]);const {s}=browser(storage);
 const saved=s.save('Marseille ♡',outfit).value;
 assert.equal(saved.name,'Marseille ♡');assert.deepEqual(copy(saved.outfit),outfit);
 s.last(outfit,saved.id);
 const next=browser(storage).s;assert.equal(next.list().length,1);assert.equal(next.get(saved.id).name,'Marseille ♡');assert.equal(next.last().editingId,saved.id);
 assert.equal(next.defaultName(),'Mon look 2');assert.equal(storage.get('nana-keepsakes-v1'),'poems');assert.equal(storage.get('nana-progress-v1'),'rewards');assert.equal(storage.get('bead-box'),'beads');
 assert.ok(JSON.stringify(saved).length<1000);assert.ok(!JSON.stringify(saved).includes('base64'));
});
test('new, update, rename and delete have independent identities and preserve creation date',()=>{
 const {s}=browser(),a=s.save('A',outfit).value,b=s.save('B',outfit).value;
 const changed=copy(outfit);changed.slots.tops='top-pink';
 assert.equal(s.save('A2',changed,a.id).ok,true);assert.equal(s.list().length,2);
 assert.equal(s.get(a.id).createdAt,a.createdAt);assert.equal(s.get(b.id).outfit.slots.tops,'top-white');
 assert.equal(s.rename(a.id,'Nouveau nom').ok,true);assert.equal(s.get(a.id).outfit.slots.tops,'top-pink');
 assert.equal(s.remove(a.id).ok,true);assert.equal(s.get(a.id),null);assert.equal(s.save('Deleted',changed,a.id).ok,false);assert.equal(s.list().length,1);
});
test('independent tab creations never overwrite each other and last outfit is independent of saved looks',()=>{
 const storage=new Map(),a=browser(storage).s,b=browser(storage).s;
 const first=a.save('A',outfit).value;b.save('B',outfit);a.save('C',outfit);
 assert.equal(b.list().length,3);a.last({...outfit,slots:{tops:'top-pink'}},first.id);
 assert.equal(browser(storage).s.last().outfit.slots.tops,'top-pink');assert.equal(a.get(first.id).outfit.slots.tops,'top-white');
 a.requestWear(first.id);assert.equal(a.takeWear(),first.id);assert.equal(a.takeWear(),null);
});
test('failed writes and creator previews do not claim success or destroy a previous record',()=>{
 const storage=new Map(),good=browser(storage).s,saved=good.save('Safe',outfit).value;good.last(outfit,saved.id);
 const before=[...storage],blocked=browser(storage,{fail:true}).s;
 assert.equal(blocked.save('Replace',outfit,saved.id).ok,false);assert.equal(blocked.rename(saved.id,'Rename').ok,false);assert.equal(blocked.remove(saved.id).ok,false);assert.equal(blocked.last({slots:{}}).ok,false);
 assert.deepEqual([...storage],before);assert.equal(blocked.status(),'write');
 assert.equal(browser(storage,{creator:true}).s.save('Preview',outfit).ok,false);
});
test('malformed and future records are left intact; new collection IDs survive reading',()=>{
 const storage=new Map([['nana-look-v1:broken','{bad'],['nana-look-v1:future',JSON.stringify({version:2})],['nana-look-v1:invalid',JSON.stringify({version:1,id:'invalid',outfit:{slots:{}}})]]),{s}=browser(storage);
 assert.equal(s.list().length,0);const saved=s.save('Future collection',{slots:{tops:'future-new-top'},makeup:[],badges:[]}).value;
 assert.equal(s.get(saved.id).outfit.slots.tops,'future-new-top');assert.equal(storage.get('nana-look-v1:broken'),'{bad');
});
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/<script type="application\/json" id="assets">([^]*?)<\/script>/)[1]);
function dressing(earned=[]){
 const allSlots=JSON.parse(html.match(/const allSlots=(\[[^;]+\]);/)[1].replaceAll("'",'"'));
 const context={dressingTest:false,data:copy(data),ITEMS:data.items,SPRITES:data.sprites,allSlots,slots:{makeup:new Set()},BADGE_PLACES:[[825,1030],[1115,1030],[825,1175],[1115,1175],[825,1390]],badgeSelection:[],PULLOVERS:new Set(['top-bow-knit','top-pullover','top-lime','top-bear']),clownActive:false,progress:{stickers:[{id:'glance',earned:()=>earned.includes('glance')}],unlockedOutfit:id=>earned.includes(id)},itemReward:id=>['suit-paint','accessory-camera','accessory-phone','top-dj'].includes(id)?{id}:null};
 context.window={};vm.createContext(context);vm.runInContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),context);context.rules=context.window.NanaWardrobeRules;
 vm.runInContext(html.match(/function slotFor\(id\)\{[^\n]+/)[0]+ '\n'+html.slice(html.indexOf('function snapshotOutfit(){'),html.indexOf('window.NanaDressing=')),context);
 return context;
}
test('restoration enforces reward gates, keeps missing references in saved data and supports stable IDs/aliases',()=>{
 const d=dressing(),saved={slots:{tops:'old-blouse',camera:'accessory-camera',phone:'accessory-phone',vest:'gone'},makeup:['makeup-blush'],badges:['glance']};
 d.data.aliases={'old-blouse':'top-white'};const original=copy(saved),missing=d.restoreOutfit(saved);
 assert.equal(d.slots.tops,'top-white');assert.equal(d.slots.camera,null);assert.equal(d.slots.phone,null);assert.ok(missing.includes('gone'));assert.ok(missing.includes('glance'));assert.deepEqual(saved,original);
});
test('layered blouse, GANNI knit, overalls, accessories, pyjamas, makeup and ordered patches round-trip',()=>{
 const d=dressing(['suit-paint','accessory-camera','accessory-phone','glance']);
 const saved={slots:{tops:'top-peter-pan',vest:'top-ganni-knit',overalls:'suit-paint',camera:'accessory-camera',phone:'accessory-phone',shoes:'shoes-bambi',jackets:'jacket-badges',bags:'bag-heart'},makeup:['makeup-blush'],badges:['glance'],layout:{version:1,badgePlaces:[[811,1062]]}};
 assert.equal(d.restoreOutfit(saved).length,0);let result=d.snapshotOutfit();
 for(const [key,id] of Object.entries(saved.slots))assert.equal(result.slots[key],id);
 assert.deepEqual(copy(result.makeup),saved.makeup);assert.deepEqual(copy(result.badges),saved.badges);assert.deepEqual(copy(result.layout.badgePlaces[0]),[811,1062]);
 d.restoreOutfit({slots:{tops:'top-pajama-blue',pants:'pants-pajama-leopard'},makeup:[],badges:[]});assert.equal(d.slots.tops,'top-pajama-blue');assert.equal(d.slots.pants,'pants-pajama-leopard');
 d.restoreOutfit({slots:{tops:'top-peter-pan',dresses:'dress-denim'}});assert.equal(d.slots.tops,'top-peter-pan');assert.equal(d.slots.dresses,'dress-denim');
 d.restoreOutfit({slots:{tops:'top-white',dresses:'dress-blue',pants:'pants-pajama'}});assert.equal(d.slots.tops,null);assert.equal(d.slots.pants,null);
});


test('local dressing test permits reward pieces without changing earned rewards',()=>{const d=dressing();d.dressingTest=true;d.restoreOutfit({slots:{overalls:'suit-paint',camera:'accessory-camera'}});assert.equal(d.slots.overalls,'suit-paint');assert.equal(d.slots.camera,'accessory-camera');assert.equal(d.progress.unlockedOutfit('suit-paint'),false);});
