import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../bead-box.js',import.meta.url),'utf8').replace('window.NanaBeadBox={open};','window.NanaBeadBox={open,panel,add,nearestSlot,slotPoint,getBeads:()=>beads};');
function setup(lang='fr',saved={}){
 const events={},memory={value:JSON.stringify(saved)};
 const stage={getScreenCTM:()=>({inverse:()=>({})}),classList:{toggle(){},remove(){}}};
 const context={window:{addEventListener(){}},Date,DOMPoint:class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}},localStorage:{getItem:()=>memory.value,setItem:(k,v)=>memory.value=v},document:{readyState:'loading',documentElement:{lang},addEventListener:(name,fn)=>events[name]=fn,querySelector:()=>null,elementFromPoint:()=>null,createElement:()=>({style:{},setAttribute(){},remove(){}}),body:{appendChild(){}}}};
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
 events.pointerdown({target,isPrimary:true,button:0,pointerId:1,clientX:0,clientY:0,pointerType});
 context.document.querySelector=sel=>sel==='#bead-charm'?stage:null;
 events.pointermove({pointerId:1,clientX:300,clientY:260,preventDefault(){}});
 // End over the string; refresh is skipped in this unit harness.
 context.document.querySelector=(()=>{let count=0;return sel=>sel==='#bead-charm'&&count++<2?stage:null;})();
 events.pointerup({pointerId:1,clientX:300,clientY:260,preventDefault(){}});
 context.document.querySelector=()=>null;
}
assert.equal(api.getBeads().length,3);assert.equal(new Set(api.getBeads().map(b=>b.slot)).size,3);
api.add(Array.from({length:17},()=>({type:'heart',variant:0})));assert.equal(api.getBeads().length,20);
api.add([{type:'star',variant:0}]);assert.equal(api.getBeads().length,20);assert.equal(api.nearestSlot({x:220,y:260}),-1);
const restored=setup('en',JSON.parse(fixture.memory.value));assert.equal(restored.api.getBeads().length,20);assert.equal(new Set(restored.api.getBeads().map(b=>b.slot)).size,20);
console.log('Bead box OK: categories, removals, letters, mouse/touch/pen drops, capacity and saved positions.');
