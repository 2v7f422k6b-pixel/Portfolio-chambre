import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
test('five held props use three distinct, aligned artist exports and retain stable IDs',()=>{
 assert.equal(Object.keys(data.heldParts).length,5);
 for(const [id,parts]of Object.entries(data.heldParts)){
  assert(data.items[id]);assert.equal(data.fitted[id],parts.object);
  assert.equal(new Set(Object.values(parts)).size,3);
  for(const path of Object.values(parts)){const png=readFileSync(new URL('../'+path,import.meta.url));assert.equal(png.readUInt32BE(16),2048);assert.equal(png.readUInt32BE(20),3072);}
 }
 assert(!data.heldParts['held-miffy-bottle']);
});
test('Nana Color Studio T-shirt is an independent top',()=>{
 assert.equal(data.items['top-nana-color-studio'][1],'tops');
 assert.equal(data.fitted['top-nana-color-studio'],'assets/dressing-lena/IMG_6658.png');
});
