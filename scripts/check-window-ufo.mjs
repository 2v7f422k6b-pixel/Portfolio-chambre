import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function room({preview=false,reduced=false}={}){
 let time=0,tick;const events={},feats=[],attrs={},root={dataset:{theme:'night'},lang:'fr'};
 const button={setAttribute:(k,v)=>attrs[k]=v,addEventListener:(k,v)=>events[k]=v};
 const ufo={dataset:{},querySelector:()=>button,setAttribute(){},classList:{toggle(){}}};
 const app={classList:{contains:()=>true}};
 const document={hidden:false,documentElement:root,addEventListener(){},getElementById:id=>({'window-ufo':ufo,app,'play-viewport':{getClientRects:()=>[1]}}[id])};
 vm.runInNewContext(readFileSync(new URL('../window-ufo.js',import.meta.url),'utf8'),{document,window:{matchMedia:()=>({matches:reduced}),addEventListener(){},NanaProgress:{feat:id=>feats.push(id)}},location:{hash:'#/room',search:preview?'?ufoPreview=1':''},URLSearchParams,performance:{now:()=>time},MutationObserver:class{observe(){}},setInterval:fn=>tick=fn});
 return{ufo,root,document,events,feats,attrs,advance(ms){for(let i=0;i<ms;i+=100){time+=100;tick();}}};
}
test('saucer waits for night, approaches, observes, escapes on click and saves discovery',()=>{
 const r=room();r.root.dataset.theme='day';r.advance(20000);assert.equal(r.ufo.dataset.phase,undefined);
 r.root.dataset.theme='night';r.advance(18000);assert.equal(r.ufo.dataset.phase,'arriving');r.advance(1200);assert.equal(r.ufo.dataset.phase,'observing');assert.equal(r.attrs.tabindex,'0');
 assert.equal(r.feats.length,0);r.events.click({preventDefault(){},stopPropagation(){}});assert.equal(r.ufo.dataset.phase,'leaving');assert.deepEqual(r.feats,['ufo-encounter']);r.advance(500);assert.equal(r.ufo.dataset.phase,'waiting');assert.equal(r.attrs.tabindex,'-1');
});
test('preview is immediate and never awards; hidden pages pause; reduced motion skips approach',()=>{
 const r=room({preview:true,reduced:true});r.document.hidden=true;r.advance(5000);assert.equal(r.ufo.dataset.phase,undefined);r.document.hidden=false;r.advance(500);assert.equal(r.ufo.dataset.phase,'observing');
 r.events.keydown({key:'Enter',preventDefault(){},stopPropagation(){}});assert.equal(r.ufo.dataset.phase,'leaving');assert.equal(r.feats.length,0);r.advance(200);assert.equal(r.ufo.dataset.phase,'waiting');
});

