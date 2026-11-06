import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../bead-box.js',import.meta.url),'utf8').replace('window.NanaBeadBox={open};','window.NanaBeadBox={open,panel,bead,add,nearestSlot,slotPoint,onString,charmMarkup,getBeads:()=>beads};');
function setup(lang='fr',saved={}){
 const events={},memory={value:JSON.stringify(saved)};
 const stage={getScreenCTM:()=>({inverse:()=>({})}),classList:{toggle(){},remove(){}}};
 const context={window:{addEventListener(){}},Date,DOMPoint:class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}},localStorage:{getItem:()=>memory.value,setItem:(k,v)=>memory.value=v},document:{readyState:'loading',documentElement:{lang},addEventListener:(name,fn)=>events[name]=fn,querySelector:()=>null,elementFromPoint:()=>null,createElement:()=>({style:{},setAttribute(){},remove(){}}),body:{appendChild(){}}}};
 let randomIndex=0;context.Math=Object.create(Math);context.Math.random=()=>((randomIndex++%4)+0.5)/4;
 vm.runInNewContext(source,context);
 return {api:context.window.NanaBeadBox,context,events,memory,stage};
}
for(const lang of ['fr','en']){
 const {api}=setup(lang,{beads:[{type:'glass'},{type:'star',variant:7},{type:'letter',letter:'é'},{type:'flower',variant:2}],pendant:'star'});
 assert.equal(api.getBeads().length,3);assert.equal(api.getBeads()[1].letter,'E');
 const html=api.panel();assert.equal((html.match(/class="bead-tray"/g)||[]).length,3);assert.equal((html.match(/data-add-bead=/g)||[]).length,16);
 for(const removed of ['id="bead-count"','id="bead-empty"','bead-box-lid','data-bead-edit','data-bead-action="save"','data-pendant="star"','data-pendant="heart"'])assert(!html.includes(removed),removed);
 assert(html.includes('bead-word-input'));assert(html.includes('IMG_5132.png'));
}
const fixture=setup(),{api,events,context,stage}=fixture;
// Mouse, touch and pen all use the same Pointer Events path.
for(const pointerType of ['mouse','touch','pen']){
 const source={dataset:{addBead:'flower',variant:'5'},hasAttribute:()=>false,setPointerCapture(){},releasePointerCapture(){}};
 const target={closest:()=>source};
 const drop=api.slotPoint(5);
 events.pointerdown({target,isPrimary:true,button:0,pointerId:1,clientX:0,clientY:0,pointerType});
 context.document.querySelector=sel=>sel==='#bead-charm'?stage:null;
 events.pointermove({pointerId:1,clientX:drop.x,clientY:drop.y,preventDefault(){}});
 // End over the string; refresh is skipped in this unit harness.
 context.document.querySelector=(()=>{let count=0;return sel=>sel==='#bead-charm'&&count++<2?stage:null;})();
 events.pointerup({pointerId:1,clientX:drop.x,clientY:drop.y,preventDefault(){}});
 context.document.querySelector=()=>null;
}
assert.equal(api.getBeads().length,3);assert.equal(new Set(api.getBeads().map(b=>b.slot)).size,3);
api.add(Array.from({length:17},()=>({type:'heart',variant:0})));assert.equal(api.getBeads().length,20);
api.add([{type:'star',variant:0}]);assert.equal(api.getBeads().length,20);assert.equal(api.nearestSlot({x:220,y:260}),-1);
const restored=setup('en',JSON.parse(fixture.memory.value));assert.equal(restored.api.getBeads().length,20);assert.equal(new Set(restored.api.getBeads().map(b=>b.slot)).size,20);
console.log('Bead box OK: categories, removals, letters, mouse/touch/pen drops, capacity and saved positions.');

// Letter colors are chosen once per addition, never by the rendering function.
const letters=setup();letters.api.add([..."NANA"].map(letter=>({type:'letter',letter})));
assert.deepEqual(Array.from(letters.api.getBeads(),b=>b.variant),[0,1,2,3]);
assert(letters.api.getBeads().every(b=>b.colorAssigned));
const savedLetters=JSON.parse(letters.memory.value);
const loadedLetters=setup('en',savedLetters);
assert.deepEqual(Array.from(loadedLetters.api.getBeads(),b=>b.variant),[0,1,2,3]);
for(const b of loadedLetters.api.getBeads()){
 const rendered=loadedLetters.api.bead(b.type,b.letter,b.variant);
 assert(rendered.includes('assets/beads/IMG_521'));assert(rendered.includes('<text'));
 assert.equal(rendered,loadedLetters.api.bead(b.type,b.letter,b.variant));
}
assert(!letters.api.panel().includes('data-add-bead="letter"'));
const legacy=setup('fr',{beads:[{type:'letter',letter:'A',variant:0},{type:'letter',letter:'B',variant:0}]});
assert(JSON.parse(legacy.memory.value).beads.every(b=>b.colorAssigned));
assert.deepEqual(Array.from(setup('fr',JSON.parse(legacy.memory.value)).api.getBeads(),b=>b.variant),Array.from(legacy.api.getBeads(),b=>b.variant));
console.log('Letter backgrounds OK: four random variants, stable render/reload, legacy migration, no color picker.');

// Both drawings remain present on an empty string; only the lower string accepts drops.
const emptyCharm=setup().api;
for(const name of ['IMG_5259.png','IMG_5260.png'])assert(emptyCharm.charmMarkup().includes(name));
assert(!emptyCharm.charmMarkup().includes('<path'));
for(let slot=0;slot<20;slot++)assert(emptyCharm.onString(emptyCharm.slotPoint(slot)));
for(const [x,y] of [[272,12],[230,90],[195,175],[195,193],[320,320],[0,0]]){
 assert.equal(emptyCharm.onString({x,y}),false,'No bead drop on the strap, clasp or outside the string');
}
const blocked=setup();
const sourceButton={dataset:{addBead:'star',variant:'0'},hasAttribute:()=>false,setPointerCapture(){},releasePointerCapture(){}};
blocked.events.pointerdown({target:{closest:()=>sourceButton},isPrimary:true,button:0,pointerId:2,clientX:0,clientY:0});
blocked.context.document.querySelector=sel=>sel==='#bead-charm'?blocked.stage:null;
blocked.events.pointermove({pointerId:2,clientX:195,clientY:175,preventDefault(){}});
blocked.events.pointerup({pointerId:2,clientX:195,clientY:175,preventDefault(){}});
assert.equal(blocked.api.getBeads().length,0);
console.log('Original drawings OK: persistent strap, string-only drops and unchanged saved slots.');
