import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
const context={window:{}};vm.runInNewContext(readFileSync(new URL('../dressing-rules.js',import.meta.url),'utf8'),context);
const rules=context.window.NanaWardrobeRules;
const renderer=html.slice(html.indexOf('function outfitLayers(){'),html.indexOf('let avatarRevision='));
function layers(slots){return vm.runInNewContext('('+renderer.trim()+')',{slots,data,BASE:data.base,ITEMS:data.items,FITTED:data.fitted,SPRITES:data.sprites,HAT_HAIR_CORRECTIONS:{},PULLOVERS:new Set(),badgeCarrier:()=>null,raisedCollar:()=>null,bagFits:()=>({}),underJacketClip:()=>null,scarfFrame:()=>null,correctedSource:id=>data.fitted[id]||data.sprites[id]})();}
test('Mononoke combinations preserve dress/tabard, both necklaces and forehead band/mask in both orders',()=>{
 for(const pair of [['dress-mononoke','top-mononoke-tabard'],['jewelry-mononoke-ashitaka','jewelry-mononoke-teeth'],['head-mononoke-band','head-mononoke-mask']])for(const ids of [pair,[...pair].reverse()]){
  const slots={makeup:new Set()};for(const id of ids)rules.choose(slots,id,data.items);
  for(const id of ids)assert.equal(slots[rules.slotFor(id,data.items)],id);
 }
});
test('cape switches from filled to cutout behind the body as torso clothing changes',()=>{
 const slots={cape:'cape-mononoke',makeup:new Set()};
 for(const [key,id] of [[null,null],['dresses','dress-mononoke'],['vest','top-mononoke-tabard'],[null,null]]){
  slots.dresses=null;slots.vest=null;if(key)slots[key]=id;
  const entries=layers(slots),cape=entries.find(e=>e.role==='cape-back');
  assert.equal(cape.src,data.capeVariants['cape-mononoke'][key?'clothed':'bare']);
  assert(cape.z<entries.find(e=>e.body).z);assert.equal(entries.find(e=>e.body).src,data.base);
 }
});
test('knife uses three ordered layers while its catalogue image is the object alone; hair is excluded',()=>{
 const entries=layers({handObject:'held-mononoke-knife',makeup:new Set()}),grip=entries.filter(e=>/^held-/.test(e.role||''));
 assert.equal(grip.length,3);assert(grip[0].z<grip[1].z&&grip[1].z<grip[2].z);
 assert.equal(grip[0].src,data.heldParts['held-mononoke-knife'].wrist);
 assert.equal(data.sprites['held-mononoke-knife'],data.heldParts['held-mononoke-knife'].object);
 assert(!JSON.stringify(data).includes('IMG_7082.png'));
});
