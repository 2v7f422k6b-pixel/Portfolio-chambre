import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
const env={window:{}};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),env);
const rules=env.window.NanaWardrobeRules;
test('base tights, lace overlay and socks can coexist',()=>{
 const s={makeup:new Set()};for(const id of ['hosiery-red','hosiery-blue-lace','shoes-pink-lace'])rules.choose(s,id,data.items);
 assert.equal(s.hosiery,'hosiery-red');assert.equal(s.hosieryOverlay,'hosiery-blue-lace');assert.equal(s.socks,'shoes-pink-lace');
 rules.choose(s,'hosiery-dj',data.items);assert.equal(s.hosieryOverlay,'hosiery-dj');assert.equal(s.socks,'shoes-pink-lace');
});
test('Miffy clips exclude incompatible hats in either selection order',()=>{
 for(const hat of ['head-clown-wig','head-band-white','head-band-pink','head-band-blue','head-cap','head-george-sand'])for(const order of [[hat,'head-miffy-clips'],['head-miffy-clips',hat]]){
  const s={makeup:new Set()};for(const id of order)rules.choose(s,id,data.items);assert(!(s.clips&&s.hat));
 }
 const s={makeup:new Set()};rules.choose(s,'head-miffy',data.items);rules.choose(s,'head-miffy-clips',data.items);assert.equal(s.hat,'head-miffy');assert.equal(s.clips,'head-miffy-clips');
});
test('bag charms and flower bag use their correct wearing slots',()=>{
 assert.equal(rules.slotFor('jewelry-flower-long',data.items),'bags');
 for(const id of ['jewelry-coffee-lanyard','jewelry-piano-lanyard']){const s={bags:'bag-heart',makeup:new Set()};rules.choose(s,id,data.items);assert.equal(s.bags,'bag-heart');assert.equal(s.bagAccessories,id);}
});
test('old layered shirt migrates to Rock shirt',()=>{assert(!data.items['top-layered-pink']);assert.equal(data.aliases['top-layered-pink'],'top-rock-layered');});
