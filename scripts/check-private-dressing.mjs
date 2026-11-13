import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const editor=readFileSync(new URL('../dressing-layer-editor.js',import.meta.url),'utf8');
test('an unsigned visitor including a direct editor URL cannot create or apply private controls',async()=>{
 const env={window:{addEventListener(){}},location:{search:'?layerEdit=1'},localStorage:{getItem:()=>JSON.stringify({format:'nana-layer-adjustments',version:1,records:[{scope:'item',ids:['bag'],settings:{bag:{dx:100}}}]})},document:{createElement(){throw Error('private UI created');}},URLSearchParams};
 vm.runInNewContext(editor,env);const api=env.window.NanaLayerEditor;
 api.init({authorized:()=>false,has:()=>true});api.open();const entries=[{id:'bag',z:19}];assert.equal(api.prepare(entries,{bags:'bag'}),entries);assert.equal(api.apply(entries,{bags:'bag'}),entries);await api.ready({});
});
test('badge choice replaces the previous earned badge and toggles off',()=>{
 const fn=html.slice(html.indexOf('function toggleBadge(id){'),html.indexOf('function badgeImage('));
 const env={progress:{stickers:[{id:'a',earned:()=>true},{id:'b',earned:()=>true},{id:'locked',earned:()=>false}]},badgeAllowed:b=>b.earned(),badgeCarrier:()=>true,slots:{},localStorage:{setItem(){}},BADGE_KEY:'badges',render(){}};
 vm.runInNewContext('let badgeSelection=["a"];'+fn+';this.pick=toggleBadge;this.selection=()=>badgeSelection;',env);
 env.pick('b');assert.deepEqual(Array.from(env.selection()),['b']);env.pick('locked');assert.deepEqual(Array.from(env.selection()),['b']);env.pick('b');assert.equal(env.selection().length,0);
});
test('old saved looks migrate to one earned badge at the fixed upper right chest position',()=>{
 const places=JSON.parse(html.match(/const BADGE_PLACES=(.*?);/)[1]);assert.equal(places.length,1);assert(places[0][0]>1024);assert(places[0][1]<1000);
 const fn=html.slice(html.indexOf('function restoreOutfit(saved){'),html.indexOf('window.NanaDressing='));
 const env={BADGE_PLACES:places,allSlots:[],slots:{makeup:new Set()},data:{},rules:{normalize(){}},bagEditor:{restore(){}},progress:{stickers:[{id:'a',earned:()=>true},{id:'b',earned:()=>true}]}};
 vm.runInNewContext('let badgePlaces=[],badgeSelection=[],clownActive=false;'+fn+';this.restore=restoreOutfit;this.badges=()=>badgeSelection;this.places=()=>badgePlaces;',env);
 env.restore({badges:['a','b'],layout:{badgePlaces:[[825,1390],[1115,1390]]}});assert.deepEqual(Array.from(env.badges()),['a']);assert.equal(JSON.stringify(env.places()),JSON.stringify(places));
});

test('dressing backdrop and Escape keep it open while other windows retain their dismissal',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const backdrop=app.slice(app.indexOf("if(e.target.id==='special-shade'){"),app.indexOf("if(e.target.closest('#player-play'))"));
 const escape=app.slice(app.indexOf("if(e.key==='Escape'){if(!specialShade.hidden"),app.indexOf("if(e.key==='Escape'){if(!specialShade.hidden")+app.slice(app.indexOf("if(e.key==='Escape'){if(!specialShade.hidden")).indexOf('\n'));
 for(const dressing of [true,false]){let closed=0;const specialShade={hidden:false},env={e:{target:{id:'special-shade'},detail:0,key:'Escape'},specialShade,lastPointerDownTarget:specialShade,specialHost:{querySelector:()=>dressing?{}:null},closeSpecial:()=>closed++,shade:{hidden:true},currentMode:null};
  vm.runInNewContext('(function(){'+backdrop+'})()',env);assert.equal(closed,dressing?0:1);
  closed=0;vm.runInNewContext('(function(){'+escape+'})()',env);assert.equal(closed,dressing?0:1);
 }
});
