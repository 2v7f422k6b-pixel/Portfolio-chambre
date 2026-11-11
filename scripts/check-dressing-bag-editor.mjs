import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const w={};vm.runInNewContext(readFileSync(new URL('../dressing-bag-editor.js',import.meta.url),'utf8'),{window:w});
const api=w.NanaBagEditor;
test('bag adjustment moves all cushion pieces and charm together, without moving clothing',()=>{
 const s={bags:'bag-brown',bagAccessories:'charm-bear-doll'};
 const entries=[{src:'assets/dressing-lena/IMG_5544.png',fit:{sx:1,dx:20,dy:-100}},{src:'assets/dressing-lena/IMG_5545.png',fit:{sx:1,sy:.8,kx:.1,dx:20,dy:-100},localClip:[[0,0],[2048,1090]]},{id:'charm-bear-doll',fit:{sx:.5,dx:-10,dy:15}},{id:'top-pink'}];
 const shifted=api.shift(entries,s,{dx:12,dy:-8});
 assert.equal(shifted[0].fit.dx,32);assert.equal(shifted[0].fit.dy,-108);
 assert.equal(shifted[1].fit.dx,32);assert.equal(shifted[1].fit.sy,.8);assert.equal(shifted[1].fit.kx,.1);
 assert.equal(shifted[1].localClip,entries[1].localClip);
 assert.equal(shifted[2].fit.dx,2);assert.equal(shifted[2].fit.dy,7);
 assert.equal(shifted[3],entries[3]);assert.equal(entries[0].fit.dx,20);
});
test('calibration is isolated by bag and upper layers, not unrelated shoes',()=>{
 const s={bags:'bag-crochet',tops:'top-pink'};
 assert.notEqual(api.key(s),api.key({...s,bags:'bag-brown'}));
 assert.notEqual(api.key(s),api.key({...s,sweater:'top-ganni-knit'}));
 assert.equal(api.key(s),api.key({...s,shoes:'shoes-bunny'}));
 assert.equal(api.clean({dx:Infinity,dy:600}).dx,0);assert.equal(api.clean({dx:Infinity,dy:600}).dy,500);
});
test('saved look calibration restores without writing global saved settings',()=>{
 const localStorage={getItem:()=>null,setItem:()=>{throw Error('unexpected global write')}},s={bags:'bag-crochet',tops:'top-pink'};
 const ctx={window:{},localStorage};vm.runInNewContext(readFileSync(new URL('../dressing-bag-editor.js',import.meta.url),'utf8'),ctx);
 const e=ctx.window.NanaBagEditor.create({slots:()=>s});
 e.restore({key:api.key(s),value:{dx:22,dy:17}});
 assert.equal(e.apply([{id:'bag-crochet'}],s)[0].fit.dx,22);
 assert.equal(e.snapshot().value.dy,17);
 e.restore(null);assert.equal(e.snapshot().value.dx,0);
});
