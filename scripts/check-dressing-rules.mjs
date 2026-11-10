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

test('confirmed November combinations survive both selection orders',()=>{
 for(const pair of [['jacket-striped-knit','jacket-yukata'],['top-inspector','jacket-striped-knit'],['top-pullover','jacket-floral'],['jacket-ganni-knit','jacket-floral'],['head-beret','head-headlamp'],['dress-denim','top-sparkle-pink'],['suit-paint','top-sparkle-pink']])for(const ids of [pair,[...pair].reverse()]){const s=wear(...ids);for(const id of pair)assert.equal(s[r.slotFor(id,items)],id);}
 const s=wear('dress-pink-check','top-sparkle-pink');assert.equal(s.dresses,null);
 const c=wear('bag-crochet','charm-treasures');assert.equal(c.bags,'bag-crochet');assert.equal(c.bagAccessories,'charm-treasures');
});

test('three knits collapse to inspector plus the latest outer knit in every order',()=>{
 const knits=[...r.sweaters,...r.cardigans,'top-ganni-knit'];
 for(const a of knits)for(const b of knits)if(a!==b){
  for(const ids of [['top-inspector',a,b],[a,'top-inspector',b],[a,b,'top-inspector']]){
   const s=wear(...ids);assert.equal(s.tops,'top-inspector');
   assert.deepEqual(['sweater','cardigan','vest'].map(k=>s[k]).filter(Boolean),[b]);
  }
 }
 const saved={tops:'top-inspector',sweater:'top-bear',cardigan:'jacket-blue',vest:'top-ganni-knit'};r.normalize(saved);
 assert.equal(['sweater','cardigan','vest'].filter(k=>saved[k]).length,1);
});
test('George Sand waistcoat only accepts George Sand torso pieces, latest choice wins',()=>{
 for(const id of ['top-inspector','top-ganni-knit','jacket-ganni-knit','jacket-blue','jacket-purple','suit-miffy']){
  const a=wear(id,'vest-george-sand');assert.equal(a.vest,'vest-george-sand');assert.ok(!Object.values(a).includes(id));
  const b=wear('vest-george-sand',id);assert.ok(!Object.values(b).includes('vest-george-sand'));assert.ok(Object.values(b).includes(id));
 }
 const s=wear('top-george-sand','vest-george-sand','jacket-george-sand');assert.equal(s.tops,'top-george-sand');assert.equal(s.vest,'vest-george-sand');assert.equal(s.jackets,'jacket-george-sand');
});
test('yukata excludes fleece, denim and other coats in either selection order',()=>{
 for(const id of ['jacket-fleece','jacket-badges','jacket-purple','jacket-inspector','jacket-green','jacket-cardigan']){
  assert.ok(items[id],id);
  for(const ids of [[id,'jacket-yukata'],['jacket-yukata',id]]){const s=wear(...ids);assert.ok(Object.values(s).includes(ids[1]));assert.ok(!Object.values(s).includes(ids[0]));}
 }
 for(const id of ['jacket-striped-knit','jacket-floral'])for(const ids of [[id,'jacket-yukata'],['jacket-yukata',id]]){const s=wear(...ids);for(const x of ids)assert.ok(Object.values(s).includes(x));}
});
test('scarves, ruffs and George Sand bow are mutually exclusive in either order',()=>{
 for(const id of ['jewelry-clown-ruff','jewelry-miffy-ruff','jewelry-george-sand'])for(const ids of [[id,'scarf-check'],['scarf-check',id]]){
  const s=wear(...ids);assert.ok(Object.values(s).includes(ids[1]));assert.ok(!Object.values(s).includes(ids[0]));
 }
});
