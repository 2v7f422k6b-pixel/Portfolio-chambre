import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../dressing-geometry.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
function fixture(){
 const env={window:{},Image:class{decode(){return Promise.resolve()}},requestAnimationFrame(){},document:{createElement(){
  const calls=[],clears=[],rects=[];let last;
  const ctx={calls,clears,rects,drawImage(...args){calls.push(args);last=args[0]},clearRect(...a){clears.push(a)},save(){},restore(){},beginPath(){},rect(...a){rects.push(a)},clip(){},moveTo(){},lineTo(){},closePath(){},translate(){},transform(){},fillRect(){},putImageData(){},
   getImageData(){const data=new Uint8ClampedArray(1024*1536*4);const outer=last?.src==='jacket-inspector';
    for(let y=600;y<(outer?900:1200);y++)for(let x=outer?350:280;x<(outer?650:740);x++)data[(y*1024+x)*4+3]=255;
    return {data};}};return {getContext(){return ctx}};
 }}};
 vm.runInNewContext(code,env);return env.window.NanaDressingGeometry.create({source:id=>id,changed(){}});
}
test('screen and saved PNG use the same compositor and await its sources',()=>{
 assert.equal((html.match(/geometry.process\(outfitLayers\(\),slots\)/g)||[]).length,2);
 assert.match(html,/async function composeLook\(width=W\)\{await geometry.ready/);
});
test('lower garments retain original geometry under tees and trench',async()=>{
 for(const [key,id] of [['skirts','skirt-denim'],['pants','pants-stripes'],['dresses','dress-denim']]){
  const geo=fixture(),s={[key]:id,jackets:'jacket-inspector'},entries=[{id,z:6},{id:s.jackets,z:12}];
  await geo.ready(entries,s);const layer=geo.process(entries,s).find(e=>e.id===id);
  assert.equal(layer.canvas,undefined);assert.equal(layer.fit,null);assert.equal(layer.clip,null);
 }
});
test('boot shafts are hidden above the measured trouser hem',async()=>{
 const geo=fixture(),s={pants:'pants-inspector',shoes:'shoes-dj'},entries=[{id:s.pants,z:5},{id:s.shoes,z:3}];
 await geo.ready(entries,s);const shoe=geo.process(entries,s).find(e=>e.id===s.shoes);
 assert.deepEqual(shoe.canvas.getContext('2d').clears.map(a=>Array.from(a)),[[0,0,500,1200],[500,0,524,1200]]);
});
test('a lower garment worn without an enclosing top retains its original source',async()=>{
 const geo=fixture(),s={pants:'pants-stripes',tops:'top-dj'},entries=[{id:s.pants,z:5},{id:s.tops,z:8}];
 await geo.ready(entries,s);const layer=geo.process(entries,s).find(e=>e.id===s.pants);assert.equal(layer.canvas,undefined);assert.equal(layer.fit,null);
});
test('a sleeveless dress does not erase the foreground hands',async()=>{
 const geo=fixture(),s={dresses:'dress-polka',jackets:'jacket-inspector'},entries=[{id:s.dresses,z:9},{id:s.jackets,z:12}];
 await geo.ready(entries,s);const hands=geo.process(entries,s).find(e=>e.part==='hands');
 assert(hands);assert(!hands.canvas.getContext('2d').calls.some(c=>c[0]?.src==='dress-polka'));
});
test('hair clips sit beneath hats and boots have no fixed horizontal trouser cut',()=>{
 assert.match(html,/\['clips',22\.5\]/);assert.match(html,/\['hat',23\]/);
 assert.doesNotMatch(html,/if\(key==='shoes'&&/);
});

test('standalone tops are not covered by a foreground upper arm or a sleeve-end cutoff',async()=>{
 const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
 for(const id of Object.keys(data.items).filter(id=>id.startsWith('top-'))){
  const geo=fixture(),s={tops:id},entries=[{id,z:8}];await geo.ready(entries,s);
  const result=geo.process(entries,s),top=result.find(e=>e.id===id),hands=result.find(e=>e.part==='hands');
  assert.equal(top.canvas,undefined,id+' retains its original artwork');
  const ctx=hands.canvas.getContext('2d');
  assert(ctx.clears.some(a=>a[0]===0&&a[1]===0&&a[2]===1024&&a[3]===780),id+' must not repaint upper arms');
  assert(ctx.rects.every(a=>a[3]===1536),id+' must mask the entire sleeve, not an estimated sleeve length');
 }
});
