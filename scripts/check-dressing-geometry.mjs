import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../dressing-geometry.js',import.meta.url),'utf8'),context);
const fit=context.window.NanaDressingGeometry.fitRow;
test('fabric fitting keeps both borders inside the coat without widening a narrow garment',()=>{
 for(const [left,right,lo,hi] of [[10,100,30,80],[40,60,30,80],[-100,300,0,120],[0,150,60,150]]){
  const [a,b]=fit(left,right,lo,hi);assert.ok(a>=lo&&b<=hi);assert.ok(a>=left&&b<=right);assert.ok(a<b);
 }
});
test('the original red contour is unchanged when the coat releases the fabric',()=>{
 assert.deepEqual(Array.from(fit(10,100,30,80,0)),[10,100]);
 const [a,b]=fit(10,100,30,80,.5);assert.equal(a,20);assert.equal(b,90);
});
test('screen and saved PNG use the same compositor and PNG waits for geometry assets',()=>{
 const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
 assert.equal((html.match(/geometry.process\(outfitLayers\(\),slots\)/g)||[]).length,2);
 assert.match(html,/async function composeLook\(width=W\)\{await geometry.ready/);
});
test('bottoms beneath knitwear retain their source and never enter pixel deformation',async()=>{
 const ctx={drawImage(){},clearRect(){},getImageData(){throw Error('Bottom artwork must not be sampled or warped');}};
 const env={window:{},Image:class{decode(){return Promise.resolve()}},requestAnimationFrame(){},document:{createElement(){return {getContext(){return ctx}}}}};
 vm.runInNewContext(readFileSync(new URL('../dressing-geometry.js',import.meta.url),'utf8'),env);
 const compositor=env.window.NanaDressingGeometry.create({source:id=>id,changed(){}});
 for(const [slot,id] of [['skirts','skirt-denim'],['skirts','skirt-princess'],['skirts','skirt-black'],['pants','pants-stripes'],['pants','pants-leopard'],['pants','pants-cargo-pink']]){
  const s={[slot]:id,sweater:'top-lime'};const entries=[{id,z:5,clip:[[1,2]],rowFit:'legacy'},{id:'top-lime',z:11}];
  await compositor.ready(entries,s);const layer=compositor.process(entries,s).find(e=>e.id===id);
  assert.equal(layer.canvas,undefined);assert.equal(layer.clip,null);assert.equal(layer.rowFit,null);assert.equal(layer.fit,null);
 }
});
