import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../kodama.js',import.meta.url),'utf8');
function room(){
 let time=0,tick,active=true,done=false;const clicks=[];
 const spirits=Array.from({length:5},()=>{
  const classes=new Set(),handlers={},attrs={};const button={setAttribute:(k,v)=>attrs[k]=v,addEventListener:(k,v)=>handlers[k]=v};
  return{classes,handlers,attrs,querySelector:()=>button,setAttribute(){},addEventListener(){},getBoundingClientRect(){return{};},classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k),add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)}};
 });
 const document={hidden:false,documentElement:{lang:'fr'},createElementNS:()=>({setAttribute(){},appendChild(){}}),addEventListener(){},getElementById:id=>id==='kodama-spirits'?{querySelectorAll:()=>spirits}:id==='app'?{classList:{contains:()=>active}}:{getClientRects:()=>[1],appendChild(){}}};
 const p={hasFeat:id=>id==='mononoke-kodama'?done:false,subscribe(){},feat:id=>clicks.push(id)};
 vm.runInNewContext(source,{document,window:{NanaProgress:p},performance:{now:()=>time},location:{hash:'#/room'},setInterval:fn=>tick=fn});
 return{spirits,clicks,advance(ms){for(let n=0;n<ms;n+=250){time+=250;tick();}},pause(on){active=!on;},complete(){done=true;}};
}
test('Kodama appear progressively, wait for the fifth discovery and later return',()=>{
 const r=room(),visible=()=>r.spirits.filter(s=>s.classes.has('is-visible')).length;
 r.advance(14750);assert.equal(visible(),0);r.advance(250);assert.equal(visible(),1);
 r.pause(true);r.advance(20000);assert.equal(visible(),1);r.pause(false);r.advance(24000);assert.equal(visible(),5);
 r.advance(60000);assert.equal(visible(),5);r.complete();r.advance(10000);assert.equal(visible(),5);r.advance(250);assert.equal(visible(),0);
 r.advance(120000);assert.equal(visible(),5);r.advance(35000);assert.equal(visible(),0);
});
test('hover animates without counting and visible clicks target the correct spirit',()=>{
 const r=room();const e={preventDefault(){},stopPropagation(){}};
 r.spirits[0].handlers.click(e);assert.equal(r.clicks.length,0);r.advance(15000);
 r.spirits[0].handlers.pointerenter();assert.equal(r.clicks.length,0);assert(r.spirits[0].classes.has('is-wiggling'));
 r.spirits[0].handlers.click(e);assert.deepEqual(r.clicks,['kodama-1']);
});
