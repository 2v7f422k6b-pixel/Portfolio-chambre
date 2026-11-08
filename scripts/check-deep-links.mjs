import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../nana-deep-links.js',import.meta.url),'utf8');
function setup(hash=''){
  const calls=[],events={},tasks=[],writes=[];
  let mode='select';
  const element={hidden:true,dataset:{},classList:{contains:()=>false},scrollIntoView(){},focus(){},dispatchEvent(){calls.push(['object']);},append(){}};
  const nodes={'#app':{classList:{contains:name=>name==='mode-'+mode}},'#nana-link-index':element,'#wall-lamp-hit':element,'[data-open="fortune-cookie"]':element};
  const location={pathname:'/Portfolio-chambre/',search:'',hash,href:'https://example.test/Portfolio-chambre/'+hash,assign:url=>calls.push(['assign',url])};
  const history={pushState(state,unused,url){location.hash=url.slice(url.indexOf('#'));writes.push(['push',location.hash]);},replaceState(state,unused,url){location.hash=url.slice(url.indexOf('#'));writes.push(['replace',location.hash]);}};
  const on=(name,fn)=>(events[name]??=[]).push(fn);
  const document={readyState:'complete',documentElement:{lang:'fr'},querySelector:s=>nodes[s]||null,getElementById:()=>null,addEventListener:on,createElement:()=>({...element})};
  for(const key of ['[data-open="dressup"]','#hotspots [data-open="photos"]','[data-object="postit"]','[data-object="trash"]'])nodes[key]=element;
  const window={addEventListener:on,removeEventListener(){},NANA_ROOM_ZONES:[{id:'vase',label:'Vase',element}],NanaMotionItems:[{file:'Dream 2.mov',title:'Dream 2'}],
    NanaMusicVisuals:{items:[{id:'art.jpeg',title:'Art'}],artists:[{id:'pyrene',title:'Pyrène'}],open:(...a)=>calls.push(['music',...a])},
    chooseMode(value){mode=value;calls.push(['mode',value]);},returnToWelcome(){mode='select';calls.push(['welcome']);},closeWindow(){},closeSpecial(){},
    openApp:(...a)=>calls.push(['app',...a]),openGallery:(...a)=>calls.push(['gallery',...a]),openMotionAt:(...a)=>calls.push(['motion',...a]),openBook:(...a)=>calls.push(['book',...a]),
    openWindow:(...a)=>calls.push(['window',...a]),showToast:(...a)=>calls.push(['toast',...a]),NanaTypewriter:{open:()=>calls.push(['typewriter']),close(){}}};
  const context={window,document,location,history,URL,URLSearchParams,encodeURIComponent,decodeURIComponent,queueMicrotask:fn=>tasks.push(fn),navigator:{},MouseEvent:class{},MutationObserver:class{observe(){}},
    ART:[{filename:'first.jpg',title:'First',index:0},{filename:'second.jpg',title:'Second',index:1}],GABZILLA:[{src:'assets/illustration.webp',title:'Original'},{src:'assets/composition.webp',title:'Composition'}]};
  vm.runInNewContext(source,context);
  return {api:window.NanaDeepLinks,calls,writes,location,events,window,flush(){while(tasks.length)tasks.shift()();}};
}
test('fresh shared URL opens the exact work without adding history',()=>{
  const env=setup('#/illu/second');assert(env.calls.some(c=>c[0]==='mode'&&c[1]==='play'));assert(env.calls.some(c=>c[0]==='gallery'&&c[2]===1));assert.equal(env.writes.length,0);
});
test('catalog routes resolve, including windows without a mounted opener',()=>{
 const env=setup();for(const {route} of env.api.entries()){const before=env.calls.length;env.api.open(route);assert(!env.calls.slice(before).some(c=>c[0]==='toast'),route);}
});
test('gallery URLs use filenames and distinguish GABZILLA',()=>{
 const env=setup();env.api.recordGallery('art',1);env.flush();assert.equal(env.location.hash,'#/illu/second');env.api.recordGallery('gabzilla',1);env.flush();assert.equal(env.location.hash,'#/projet/gabzilla/composition');env.api.open('illu/1');assert(env.calls.some(c=>c[0]==='gallery'&&c[2]===1));
});
test('back and forward reopen content once without adding history',()=>{
 const env=setup('#/illu/first');env.location.hash='#/illu/second';env.events.popstate[0]();env.events.hashchange[0]();assert.equal(env.calls.filter(c=>c[0]==='gallery'&&c[2]===1).length,1);assert.equal(env.writes.length,0);env.location.hash='#/room';env.events.popstate[0]();assert.equal(env.calls.at(-1)[0],'mode');
});
test('malformed and unknown URLs recover safely',()=>{
 for(const route of ['illu/%E0%A4%A','illu/999','illu/missing','objet/missing']){const env=setup('#/'+route);assert.equal(env.location.hash,'#/room');assert(env.calls.some(c=>c[0]==='toast'));}
});
test('encoded animation and immediate typewriter URLs resolve',()=>{
 const env=setup('#/animation/Dream%202.mov');assert(env.calls.some(c=>c[0]==='motion'&&c[1]==='Dream 2.mov'));env.api.open('objet/machine-a-ecrire');assert(env.calls.some(c=>c[0]==='typewriter'));assert(env.calls.some(c=>c[0]==='mode'&&c[1]==='work'));
});
