import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../about-me.html',import.meta.url),'utf8');
const data=JSON.parse(html.match(/id="assets">(.*?)<\/script>/s)[1]);
test('Sakura uses all twelve artist files for eight pieces and both grip variants',()=>{
 const ids=['dress-sakura-main','jewelry-sakura-bow','hosiery-sakura-main','shoes-sakura-main','accessory-sakura-gloves','accessory-sakura-wings','held-sakura-scepter','head-sakura-main'];
 const bare=data.heldParts['held-sakura-scepter'],gloved=data.heldGloveParts['held-sakura-scepter']['accessory-sakura-gloves'];
 const files=new Set([...ids.map(id=>data.fitted[id]),...Object.values(bare),...Object.values(gloved)]);
 assert.equal(files.size,12);assert.equal(data.sprites['held-sakura-scepter'],bare.object);
 for(const path of files){const png=readFileSync(new URL('../'+path,import.meta.url));assert.equal(png.readUInt32BE(16),2048);assert.equal(png.readUInt32BE(20),3072);}
});
test('real renderer chooses bare, gloved and normal hands as gloves/scepter are added and removed',()=>{
 const slots={dresses:'dress-sakura-main',wings:'accessory-sakura-wings',necklace:'jewelry-sakura-bow',makeup:new Set()};
 const env={slots,data,BASE:data.base,ITEMS:data.items,FITTED:data.fitted,SPRITES:data.sprites,HAT_HAIR_CORRECTIONS:{},PULLOVERS:new Set(),badgeCarrier:()=>null,raisedCollar:()=>null,bagFits:()=>({}),underJacketClip:()=>null,scarfFrame:()=>null,correctedSource:id=>data.fitted[id]||data.sprites[id]};
 const source=html.slice(html.indexOf('function outfitLayers(){'),html.indexOf('let avatarRevision='));
 const layers=vm.runInNewContext('('+source.trim()+')',env);
 for(const [gloves,scepter] of [[false,false],[true,false],[false,true],[true,true],[false,true],[true,true],[true,false]]){
  slots.gloves=gloves?'accessory-sakura-gloves':null;slots.handObject=scepter?'held-sakura-scepter':null;
  const entries=layers(),grip=entries.filter(e=>/^held-/.test(e.role||''));
  assert.equal(entries.find(e=>e.body).src,scepter?'assets/dressing-lena/IMG_6650.png':data.base);
  assert.equal(grip.length,scepter?3:0);
  if(scepter){assert.equal(grip.find(e=>e.role==='held-wrist').src,'assets/dressing-lena/IMG_'+(gloves?7061:7059)+'.png');assert.equal(grip.find(e=>e.role==='held-fingers').src,'assets/dressing-lena/IMG_'+(gloves?7063:7064)+'.png');assert(grip[0].z<grip[1].z&&grip[1].z<grip[2].z);}
  assert.equal(entries.some(e=>e.id==='accessory-sakura-gloves'),gloves);
  assert(entries.find(e=>e.id==='accessory-sakura-wings').z<entries.find(e=>e.body).z);
  assert(entries.find(e=>e.id==='jewelry-sakura-bow').z>entries.find(e=>e.id==='dress-sakura-main').z);
 }
});
