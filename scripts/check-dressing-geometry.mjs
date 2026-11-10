import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context={window:{}};
vm.runInNewContext(readFileSync(new URL('../dressing-geometry.js',import.meta.url),'utf8'),context);
test('screen and saved PNG use the same compositor and PNG waits for geometry assets',()=>{
 const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
 assert.equal((html.match(/geometry.process\(outfitLayers\(\),slots\)/g)||[]).length,2);
 assert.match(html,/async function composeLook\(width=W\)\{await geometry.ready/);
});
test('bottoms beneath tops, knitwear and coats retain their source and never enter pixel deformation',async()=>{
 const ctx={drawImage(){},clearRect(){},getImageData(){throw Error('Bottom artwork must not be sampled or warped');}};
 const env={window:{},Image:class{decode(){return Promise.resolve()}},requestAnimationFrame(){},document:{createElement(){return {getContext(){return ctx}}}}};
 vm.runInNewContext(readFileSync(new URL('../dressing-geometry.js',import.meta.url),'utf8'),env);
 const compositor=env.window.NanaDressingGeometry.create({source:id=>id,changed(){}});
 for(const [slot,id] of [['skirts','skirt-denim'],['skirts','skirt-princess'],['skirts','skirt-black'],['pants','pants-stripes'],['pants','pants-leopard'],['pants','pants-cargo-pink']]){
  for(const [outerSlot,outer] of [['tops','top-gabzilla'],['sweater','top-lime'],['jackets','jacket-purple'],['jackets','jacket-inspector']]){
  const s={[slot]:id,[outerSlot]:outer};const entries=[{id,z:5,clip:[[1,2]],rowFit:'legacy'},{id:outer,z:12}];
  await compositor.ready(entries,s);const layer=compositor.process(entries,s).find(e=>e.id===id);
  assert.equal(layer.canvas,undefined);assert.equal(layer.clip,null);assert.equal(layer.rowFit,null);assert.equal(layer.fit,null);
 }}
});
