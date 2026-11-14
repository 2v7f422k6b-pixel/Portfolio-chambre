import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
test('ten held props use three distinct, aligned artist exports and retain stable IDs',()=>{
 assert.equal(Object.keys(data.heldParts).length,10);
 for(const [id,parts]of Object.entries(data.heldParts)){
  assert(data.items[id]);assert.equal(data.fitted[id],parts.object);
  assert.equal(data.sprites[id],parts.object);
  assert.equal(new Set(Object.values(parts)).size,3);
  for(const path of Object.values(parts)){const png=readFileSync(new URL('../'+path,import.meta.url));assert.equal(png.readUInt32BE(16),2048);assert.equal(png.readUInt32BE(20),3072);}
 }
 assert.equal(data.heldParts['held-miffy-bottle'].object,'assets/dressing-lena/IMG_6713.png');
 assert.equal(data.sprites['held-miffy-bottle'],data.heldParts['held-miffy-bottle'].object);
});
test('new cherry socks layer over tights and heart pyjamas use two independent slots',async()=>{
 const vm=await import('node:vm');const env={window:{}};
 vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),env);
 const rules=env.window.NanaWardrobeRules;
 assert.equal(rules.slotFor('hosiery-cherry-socks',data.items),'socks');
 assert.equal(rules.slotFor('top-pajama-hearts',data.items),'tops');
 assert.equal(rules.slotFor('pants-pajama-hearts',data.items),'pants');
 const pyjamas=html.match(/const PYJAMAS=new Set\(\[(.*?)\]\)/s)[1];
 assert(pyjamas.includes('top-pajama-hearts'));assert(pyjamas.includes('pants-pajama-hearts'));
});
test('Nana Color Studio T-shirt is an independent top',()=>{
 assert.equal(data.items['top-nana-color-studio'][1],'tops');
 assert.equal(data.fitted['top-nana-color-studio'],'assets/dressing-lena/IMG_6658.png');
});
