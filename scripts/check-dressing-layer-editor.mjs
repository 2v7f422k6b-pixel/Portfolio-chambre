import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),c=require('../dressing-layer-editor.js');
const record=(scope,ids,settings)=>({scope,ids,settings});
const store=records=>c.decode({format:'nana-layer-adjustments',version:1,records},id=>['top','skirt','bag'].includes(id));
test('imports validate format and item ids before accepting any records',()=>{
 assert.throws(()=>c.decode({version:1,records:[]},()=>true));
 assert.throws(()=>store([record('item',['unknown'],{})]));
 assert.throws(()=>store([record('item',['top','skirt'],{})]));
 assert.throws(()=>store([record('__proto__',['top'],{})]));
});
test('ranges are finite, ordered and bounded even in malformed imports',()=>{
 const v=c.clean({left:{mode:'clothes',from:2000},right:{mode:'bag',from:-90,to:Infinity},bag:{mode:'oops',dx:9999,dy:-9999}});
 assert(v.left.to>v.left.from);assert.equal(v.right.from,500);assert.equal(v.right.to,1900);assert.equal(v.bag.dx,500);assert.equal(v.bag.dy,-700);assert.equal(v.bag.mode,'auto');assert.deepEqual(c.clean(v),v);
});
test('combination identity does not depend on slot insertion order',()=>{
 const m=store([record('outfit',['skirt','top'],{left:{mode:'behind'}})]);
 assert.equal(c.resolve(m,{tops:'top',skirts:'skirt',makeup:new Set()}).left.mode,'behind');
 assert.equal(c.resolve(m,{skirts:'skirt',tops:'top'}).left.mode,'behind');
 assert.equal(c.resolve(m,{tops:'top'}).left,null);
});
test('outer and combination rules override only the adjusted sides',()=>{
 const m=store([record('item',['top'],{left:{mode:'behind'}}),record('item',['skirt'],{right:{mode:'bag'}}),record('outfit',['top','skirt'],{left:{mode:'clothes'}})]);
 const v=c.resolve(m,{tops:'top',skirts:'skirt'});assert.equal(v.left.mode,'clothes');assert.equal(v.right.mode,'bag');
 const roundtrip=c.decode(JSON.parse(JSON.stringify({format:'nana-layer-adjustments',version:1,records:[...m.values()]})),()=>true);assert.deepEqual([...roundtrip],[...m]);
});
test('moving a bag preserves its previous adjustment and never moves the body',()=>{
 const body={src:'body',z:1},entries=[body,{id:'bag',z:19,fit:{sx:.8,dx:10,dy:20}},{id:'skirt',z:6}];
 const result=c.position(entries,{bags:'bag'},{bag:{dx:30,dy:-40}});
 assert.equal(result[0],body);assert.equal(result[1].fit.dx,40);assert.equal(result[1].fit.dy,-20);assert.equal(result[1].fit.sx,.8);assert.equal(entries[1].fit.dx,10);
});
function canvas(){const calls=[];const ctx={calls,drawImage(...v){calls.push(['draw',...v])},clearRect(...v){calls.push(['clear',...v])},save(){},restore(){},beginPath(){},rect(...v){calls.push(['rect',...v])},clip(){}};return {getContext:()=>ctx};}
test('manual left arm masks only left generated overlays and adds the selected zone',()=>{
 const original=canvas(),entries=[{canvas:original,z:11,part:'hands'},{id:'skirt',z:6}];
 const result=c.compose(entries,{skirts:'skirt'},{left:{mode:'bag',from:1200,to:1800}},{canvas,arm:{}});
 const generated=result.find(e=>e.part==='hands').canvas;assert.deepEqual(generated.getContext().calls.find(x=>x[0]==='clear'),['clear',0,0,512,1536]);
 const arm=result.find(e=>e.part==='manual-left');assert.equal(arm.z,21);assert.deepEqual(arm.canvas.getContext().calls.find(x=>x[0]==='rect'),['rect',0,600,512,300]);assert.equal(result.find(e=>e.id==='skirt').z,6);assert.equal(original.getContext().calls.length,0);
});
test('behind mode leaves the original body and other side intact',()=>{
 const body={src:'body',z:1},result=c.compose([body,{canvas:canvas(),part:'hands',z:11}],{}, {right:{mode:'behind'}},{canvas,arm:{}});
 assert(result.some(e=>e.src==='body'));assert(!result.some(e=>e.part==='manual-right'));assert.deepEqual(result.find(e=>e.part==='hands').canvas.getContext().calls.find(x=>x[0]==='clear'),['clear',512,0,512,1536]);
});
test('bag in front of arms removes its old foreground arm correction and keeps charm order',()=>{
 const result=c.compose([{id:'bag',z:19},{id:'charm',z:20},{canvas:canvas(),part:'bag-arm',z:19.5}],{bags:'bag',bagAccessories:'charm'},{bag:{mode:'over'}},{canvas,arm:{}});
 assert.equal(result.find(e=>e.id==='bag').z,22);assert.equal(result.find(e=>e.id==='charm').z,23);assert(!result.some(e=>e.part==='bag-arm'));
});
