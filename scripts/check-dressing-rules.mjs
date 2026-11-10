import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const items=JSON.parse(html.match(/id="assets">([^]*?)<\/script>/)[1]).items;
const context={window:{}};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),context);
const r=context.window.NanaWardrobeRules;
function wear(...ids){const s={makeup:new Set()};for(const id of ids){assert.ok(items[id],id);r.choose(s,id,items);}return s;}
test('four sweaters preserve dresses in either selection order',()=>{
 for(const dress of ['dress-blue','dress-floral','dress-striped','dress-denim'])for(const knit of r.sweaters)for(const pair of [[dress,knit],[knit,dress]]){const s=wear(...pair);assert.equal(s.dresses,dress);assert.equal(s.sweater,knit);}
});
test('sleeveless knit and turtleneck combine, blue cardigan cannot cover another sweater',()=>{
 const s=wear('top-inspector','top-ganni-knit');assert.equal(s.tops,'top-inspector');assert.equal(s.vest,'top-ganni-knit');
 assert.equal(wear('top-pullover','jacket-blue').sweater,null);
 const c=wear('jacket-blue','jacket-inspector');assert.equal(c.cardigan,'jacket-blue');assert.equal(c.jackets,'jacket-inspector');
});
test('sparkling tops combine with camisoles and allowed dresses',()=>{
 for(const top of ['top-pink','top-dj'])for(const sheer of r.sparkles){const s=wear(top,sheer);assert.equal(s.tops,top);assert.equal(s.sheer,sheer);}
 const s=wear('dress-polka','top-sparkle-pink');assert.equal(s.dresses,'dress-polka');assert.equal(s.sheer,'top-sparkle-pink');
 assert.equal(wear('dress-blue','top-inspector').dresses,null);
});
test('striped coat excludes bulky knits, floral vest accepts blue cardigan',()=>{
 assert.equal(wear('top-pullover','jacket-striped-knit').sweater,null);
 const s=wear('jacket-blue','jacket-floral');assert.equal(s.cardigan,'jacket-blue');assert.equal(s.vest,'jacket-floral');
});
test('headlamp sits independently of headphones, excludes buckets',()=>{
 const s=wear('head-headlamp','head-airpods','head-stars');assert.equal(s.headlamp,'head-headlamp');assert.equal(s.headphones,'head-airpods');assert.equal(s.clips,'head-stars');
 assert.equal(wear('head-headlamp','head-bucket-blue').headlamp,null);
});
test('every inline script parses',()=>{
 for(const m of html.matchAll(/<script\b([^>]*)>([^]*?)<\/script>/g))if(!/src=|application\//.test(m[1]))assert.doesNotThrow(()=>new vm.Script(m[2]));
});
test('crochet bag keeps its own charm without switching to the brown bag',()=>{
 const s=wear('bag-crochet','charm-pink');assert.equal(s.bags,'bag-crochet');assert.equal(s.bagAccessories,'charm-pink');
 const t=wear('bag-brown','charm-pink','bag-crochet');assert.equal(t.bagAccessories,'charm-pink');
 assert.equal(wear('bag-crochet','charm-pink','bag-heart').bagAccessories,null);
});
