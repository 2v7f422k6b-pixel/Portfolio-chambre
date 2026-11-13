import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),p=require('../dressing-layer-painter.js'),e=require('../dressing-layer-editor.js');
const stroke=(mode='hide')=>({mode,radius:40,points:[[700,1400],[720,1450]]});
test('Pencil coordinates stay on original canvas at different zoom levels',()=>{
 assert.deepEqual(p.pointToArt(150,250,{left:100,top:100,width:200,height:300}),[512,1536]);
 assert.deepEqual(p.pointToArt(200,400,{left:100,top:100,width:400,height:600}),[512,1536]);
});
test('mask imports reject malformed strokes and bound coordinates, point counts and brush radius',()=>{
 assert.equal(p.cleanMask([{mode:'javascript',points:[[1,2]]}]).length,0);
 const s=p.cleanMask([{mode:'hide',radius:999,points:[[-2,9999],[Infinity,2]]}])[0];assert.equal(s.radius,160);assert.deepEqual(s.points,[[0,3072]]);
 assert.equal(p.cleanMask(Array.from({length:999},()=>stroke())).length,400);
});
function canvas(){const events=[];let op='source-over';const ctx={events,set globalCompositeOperation(v){op=v;events.push(['op',v])},get globalCompositeOperation(){return op},clearRect(){},beginPath(){},arc(){events.push(['dot',op])},fill(){},moveTo(){},lineTo(){},stroke(){events.push(['line',op])},drawImage(...args){events.push(['draw',op,...args])}};return {getContext:()=>ctx};}
test('restoring a painted area removes the mask instead of painting new arm pixels',()=>{
 const c=canvas();p.drawCoverage(c.getContext(),[stroke(),stroke('show')]);const events=c.getContext().events;
 assert(events.some(x=>x[0]==='dot'&&x[1]==='source-over'));assert(events.some(x=>x[0]==='line'&&x[1]==='destination-out'));
});
test('masking alters only foreground arm copies, preserving drawings, clothes and bags',()=>{
 const hands=canvas(),body={canvas:canvas(),z:1,body:true},coat={canvas:canvas(),id:'coat',z:12},bag={canvas:canvas(),part:'bag',z:19};
 const entries=[body,coat,bag,{canvas:hands,part:'hands',z:14}];const result=p.maskEntries(entries,[stroke()],canvas);
 assert.equal(result[0],body);assert.equal(result[1],coat);assert.equal(result[2],bag);assert.notEqual(result[3].canvas,hands);assert.equal(hands.getContext().events.length,0);
 assert(result[3].canvas.getContext().events.some(x=>x[0]==='draw'&&x[1]==='destination-out'));
});
test('masks survive settings export/import and combination strokes follow piece strokes',()=>{
 const records=e.decode({format:'nana-layer-adjustments',version:1,records:[{scope:'item',ids:['top'],settings:{mask:[stroke()]}},{scope:'outfit',ids:['top','bag'],settings:{mask:[stroke('show')]}}]},()=>true);
 const settings=e.resolve(records,{tops:'top',bags:'bag'});assert.deepEqual(settings.mask.map(x=>x.mode),['hide','show']);
 assert.deepEqual(e.clean(JSON.parse(JSON.stringify(settings))),settings);
});
test('piece names are plain text, bounded and retain stable IDs',()=>{
 const names=e.decodeNames({top:'  Mon pull 🩷  '},id=>id==='top');assert.equal(names.top,'Mon pull 🩷');
 assert.throws(()=>e.decodeNames({missing:'Test'},id=>id==='top'));assert.throws(()=>e.decodeNames({top:{}},()=>true));
 assert.equal(e.decodeNames(undefined,()=>true).top,undefined);
});
