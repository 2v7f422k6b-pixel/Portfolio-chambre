import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
test('Helly top tucks under the skirt and Lumon lanyard stays above every outfit layer',()=>{
 const slots={hosiery:'hosiery-helly',shoes:'shoes-helly',tops:'top-helly',skirts:'skirt-helly',necklace:'jewelry-helly-badge',makeup:new Set()};
 const env={slots,data,BASE:data.base,ITEMS:data.items,FITTED:data.fitted,SPRITES:data.sprites,HAT_HAIR_CORRECTIONS:{},PULLOVERS:new Set(),badgeCarrier:()=>null,raisedCollar:()=>null,bagFits:()=>({}),underJacketClip:()=>null,scarfFrame:()=>null,correctedSource:id=>data.fitted[id]||data.sprites[id]};
 const source=html.slice(html.indexOf('function outfitLayers(){'),html.indexOf('let avatarRevision='));
 const entries=vm.runInNewContext('('+source.trim()+')',env)();
 const top=entries.find(e=>e.id===slots.tops),skirt=entries.find(e=>e.id===slots.skirts),badge=entries.find(e=>e.id===slots.necklace);
 assert(top.z<skirt.z);assert(entries.filter(e=>e!==badge).every(e=>e.z<badge.z));
 assert.equal(entries.filter(e=>e.id==='shoes-helly').length,1);
 assert.equal(data.sprites['shoes-helly'],data.fitted['shoes-helly']);
 const pair=readFileSync(new URL('../'+data.sprites['shoes-helly'],import.meta.url));assert.equal(pair.readUInt32BE(16),2048);assert.equal(pair.readUInt32BE(20),3072);
 assert.equal(data.sprites['jewelry-helly-badge'],'assets/dressing-lena/IMG_7108.png');
 assert.equal(data.fitted['jewelry-helly-badge'],'assets/dressing-lena/IMG_7107.png');
});
