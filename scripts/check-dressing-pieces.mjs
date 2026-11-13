import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),p=require('../dressing-piece-adjustments.js'),m=require('../dressing-layer-painter.js'),e=require('../dressing-layer-editor.js');
const clean=raw=>p.cleanPieces(raw,m.cleanMask);
function canvas(){const calls=[];const ctx={calls,drawImage(...a){calls.push(['draw',...a])},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},translate(...a){calls.push(['translate',...a])},transform(...a){calls.push(['transform',...a])},clearRect(){},arc(){},fill(){},stroke(){},getImageData:()=>({data:new Uint8ClampedArray(1024*1536*4)}),putImageData(){}};return {getContext:()=>ctx};}
const helpers={canvas,image:()=>({}),mask:(c,strokes)=>m.maskEntries([{canvas:c,part:'hands'}],strokes,canvas)[0].canvas};
test('every worn slot, jewelry and makeup can be selected without moving the body',()=>{
 assert.deepEqual(p.wornIds({tops:'shirt',necklace:'necklace',glasses:'glasses',makeup:new Set(['blush','lipstick'])}),['shirt','necklace','glasses','blush','lipstick']);
 const body={canvas:canvas(),body:true,z:1},jewel={id:'necklace',z:4};const out=p.applyPieces([body,jewel],{necklace:'necklace'},clean({necklace:{dx:20,dy:-10}}),helpers);assert.equal(out[0],body);assert.equal(out[1].fit.dx,20);assert.equal(out[1].fit.dy,-10);
});
test('movement and masks preserve the source, other pieces and stable item IDs',()=>{
 const src=canvas(),shirt={id:'shirt',canvas:src,z:8},jewel={id:'necklace',canvas:canvas(),z:18};
 const settings=clean({shirt:{dx:100,dy:60,mask:[{mode:'hide',radius:30,points:[[700,1400]]}]}}),out=p.applyPieces([shirt,jewel],{},settings,helpers);
 assert.equal(out[0].fit.dx,100);assert.equal(out[0].fit.dy,60);assert.notEqual(out[0].canvas,src);assert.equal(src.getContext().calls.length,0);assert.equal(out[1],jewel);
});
test('front and back order follows a named reference, including collar and sleeve copies',()=>{
 const entries=[{id:'coat',canvas:canvas(),z:12},{owner:'coat',canvas:canvas(),part:'sleeve-copy',z:19.5},{id:'bag',canvas:canvas(),z:19}];
 const out=p.applyPieces(entries,{bags:'bag'},clean({coat:{mode:'after',reference:'bag'}}),helpers);assert(out.filter(x=>p.ownerOf(x,{bags:'bag'})==='coat').every(x=>x.z<19));
 const forward=p.applyPieces(entries,{bags:'bag'},clean({coat:{mode:'before',reference:'bag'}}),helpers);assert(forward.filter(x=>p.ownerOf(x,{bags:'bag'})==='coat').every(x=>x.z>19));
});
test('cyclic references terminate and produce deterministic output',()=>{
 const entries=[{id:'a',z:8},{id:'b',z:12}],rules=clean({a:{mode:'before',reference:'b'},b:{mode:'before',reference:'a'}});
 assert.deepEqual([...p.depths(entries,rules,{}).resolved],[...p.depths(entries,rules,{}).resolved]);
});
test('a coat back and badge move with it while its back stays behind the body',()=>{
 const entries=[{src:'back',owner:'coat',role:'back',z:0},{id:'coat',canvas:canvas(),z:12},{owner:'coat',role:'decoration',canvas:canvas(),z:12.2}];
 const out=p.applyPieces(entries,{},clean({coat:{dx:30,dy:40,mode:'front'}}),helpers);assert(out.every(x=>x.fit.dx===30&&x.fit.dy===40));assert.equal(out.find(x=>x.role==='back').z,0);
});
test('bag charms follow the bag and retain their independent fine adjustment',()=>{
 const entries=[{id:'bag',canvas:canvas(),z:19},{id:'charm',canvas:canvas(),z:20}],s={bags:'bag',bagAccessories:'charm'};
 const out=p.applyPieces(entries,s,clean({bag:{dx:100,dy:20},charm:{dx:5,dy:-5}}),helpers);assert.deepEqual(out.find(x=>x.id==='charm').fit,{sx:1,dx:105,dy:15});
});
test('piece settings round-trip and combinations override the corresponding piece only',()=>{
 const records=[{scope:'item',ids:['necklace'],settings:{pieces:{necklace:{dx:15}}}},{scope:'outfit',ids:['necklace','shirt'],settings:{pieces:{shirt:{dy:20}}}}];
 const map=e.decode(JSON.parse(JSON.stringify({format:'nana-layer-adjustments',version:1,records})),id=>['necklace','shirt'].includes(id)),v=e.resolve(map,{tops:'shirt',necklace:'necklace'});
 assert.equal(v.pieces.necklace.dx,15);assert.equal(v.pieces.shirt.dy,20);assert.throws(()=>e.decode({format:'nana-layer-adjustments',version:1,records:[{scope:'item',ids:['shirt'],settings:{pieces:{unknown:{dx:1}}}}]},id=>id==='shirt'));
});

test('badge placement is saved per garment and remains independent of the chosen earned badge',()=>{
 const settings={pieces:{'badge-placement':{dx:35,dy:-25}}},records=e.decode({format:'nana-layer-adjustments',version:1,records:[{scope:'item',ids:['coat'],settings}]},id=>['coat','badge-placement'].includes(id));
 const a={jackets:'coat',badgePlacement:'badge-placement'},b={jackets:'other-coat',badgePlacement:'badge-placement'};
 assert.equal(e.resolve(records,a).pieces['badge-placement'].dx,35);assert.equal(e.resolve(records,b).pieces['badge-placement'],undefined);
 const entries=[{id:'coat',canvas:canvas(),z:12},{owner:'badge-placement',role:'decoration',canvas:canvas(),z:12.2}];
 const out=p.applyPieces(entries,a,clean({...settings.pieces,coat:{dx:20,dy:10}}),helpers);assert.deepEqual(out.find(x=>x.owner==='badge-placement').fit,{sx:1,dx:55,dy:-15});
 const front=p.applyPieces(entries,a,clean({'badge-placement':{mode:'front'}}),helpers);assert(front.find(x=>x.owner==='badge-placement').z>12.2);
});
