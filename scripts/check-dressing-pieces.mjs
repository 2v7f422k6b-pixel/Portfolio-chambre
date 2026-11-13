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

test('existing sock masks apply with any shoes and disappear barefoot without losing strokes',()=>{
 const stroke={mode:'hide',radius:42,points:[[936,2841],[928,2841]]},raw={format:'nana-layer-adjustments',version:1,records:[{scope:'item',ids:['hosiery-cafe'],settings:{mask:[stroke],pieces:{'hosiery-cafe':{mask:[stroke]}}}}]};
 const records=e.decode(raw,()=>true),stored=records.get(e.key('item',['hosiery-cafe']));
 assert.equal(stored.settings.maskWhen,'shoes');assert.equal(stored.settings.pieces['hosiery-cafe'].maskWhen,'shoes');
 const base={hosiery:'hosiery-cafe',underwear:'bra-blue'},sock={id:'hosiery-cafe',canvas:canvas(),z:3},body={canvas:canvas(),body:true,z:1},hand={canvas:canvas(),part:'hands',z:21};
 const barefoot=e.resolve(records,base);assert.equal(barefoot.mask.length,0);
 assert.equal(p.applyPieces([sock],base,barefoot.pieces,helpers)[0],sock);
 for(const shoes of ['shoes-bunny','shoes-boots','shoes-sandals']){
  const slots={...base,shoes},settings=e.resolve(records,slots);assert.equal(settings.mask.length,1);
  const out=p.applyPieces([body,sock,hand],slots,settings.pieces,helpers);assert.notEqual(out.find(x=>x.id==='hosiery-cafe').canvas,sock.canvas);assert.equal(out.find(x=>x.body),body);assert.equal(out.find(x=>x.part==='hands'),hand);
 }
 assert.deepEqual(stored.settings.mask,[stroke]);assert.deepEqual(stored.settings.pieces['hosiery-cafe'].mask,[stroke]);
 const round=e.decode(JSON.parse(JSON.stringify({format:raw.format,version:1,records:[...records.values()]})),()=>true);
 assert.deepEqual(round.get(e.key('item',['hosiery-cafe'])),stored);
});
test('barefoot socks retain position while unrelated masks still apply',()=>{
 const stroke={mode:'hide',radius:30,points:[[900,2800]]},records=e.decode({format:'nana-layer-adjustments',version:1,records:[{scope:'item',ids:['hosiery-cafe'],settings:{mask:[stroke],pieces:{'hosiery-cafe':{dx:10,mask:[stroke]}}}},{scope:'item',ids:['shirt'],settings:{mask:[stroke],pieces:{shirt:{mask:[stroke]}}}}]},()=>true);
 const s={hosiery:'hosiery-cafe',tops:'shirt'},settings=e.resolve(records,s);assert.equal(settings.mask.length,1);let maskCalls=0;
 const out=p.applyPieces([{id:'hosiery-cafe',canvas:canvas(),z:3},{id:'shirt',canvas:canvas(),z:8}],s,settings.pieces,{...helpers,mask:(c)=>{maskCalls++;return c}});
 assert.equal(maskCalls,1);assert.equal(out.find(x=>x.id==='hosiery-cafe').fit.dx,10);
});

test('automatic mask coverage excludes the body, the selected piece and rear panels',()=>{
 const source=canvas(),other=canvas(),body=canvas(),rear=canvas(),make=()=>canvas(),entries=[{body:true,canvas:body,z:1},{id:'shirt',canvas:source,z:8},{owner:'coat',role:'back',canvas:rear,z:0},{id:'coat',canvas:other,z:12}];
 const coverage=p.overlapCoverage(entries,{tops:'shirt',jackets:'coat'},clean({shirt:{dx:100},coat:{dx:20,dy:40}}),{...helpers,canvas:make},'shirt',{dx:100,dy:0});
 const draws=coverage.getContext().calls.filter(x=>x[0]==='draw');assert.equal(draws.length,1);assert.equal(draws[0][2],-40);assert.equal(draws[0][3],20);
 assert.equal(source.getContext().calls.length,0);assert.equal(body.getContext().calls.length,0);
});
test('all new masks and legacy unconditional masks use overlap while strokes survive exports',()=>{
 const stroke={mode:'hide',radius:20,points:[[700,900]]};
 for(const id of ['shirt','dress','necklace','bag','skirt']){for(const previous of [undefined,'always']){
 const value=clean({[id]:{maskWhen:previous,mask:[stroke]}})[id];assert.equal(value.maskWhen,'overlap');assert.deepEqual(value.mask,[stroke]);
 assert.deepEqual(clean({[id]:JSON.parse(JSON.stringify(value))})[id],value);
 }}
});
