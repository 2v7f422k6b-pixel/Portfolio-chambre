import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../kodama.js',import.meta.url),'utf8');
function room(){
 let time=0,tick,active=true,done=false;const clicks=[],windowEvents=new Map();
 const spirits=Array.from({length:5},()=>{
  const classes=new Set(),handlers={},attrs={},animations=[];
  const head={animate:(frames,options)=>{const motion={frames,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(motion);return motion;}};
  const button={classes,handlers,attrs,animations,querySelector:()=>head,setAttribute:(k,v)=>attrs[k]=v,addEventListener:(k,v)=>handlers[k]=v,classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k),contains:k=>classes.has(k)}};
  button.closest=()=>button;return button;
 });
 const dog={closest(){return this;},classList:{toggle(){}}};
 const document={hidden:false,documentElement:{lang:'fr'},addEventListener(){},getElementById:id=>id==='kodama-spirits'?{querySelectorAll:()=>spirits}:id==='preacher-dog-sprite'?dog:id==='app'?{classList:{contains:()=>active}}:{hidden:false}};
 const p={hasFeat:id=>id==='mononoke-kodama'?done:false,subscribe(){},feat:id=>clicks.push(id),visit(){}};
 vm.runInNewContext(source,{document,window:{NanaProgress:p,matchMedia:()=>({matches:false}),addEventListener:(type,fn,capture)=>{assert.equal(capture,true);windowEvents.set(type,fn);}},performance:{now:()=>time},location:{hash:'#/room'},setInterval:fn=>tick=fn});
 return{spirits,clicks,windowEvents,dog,emit(type,target,extras={}){const e={target,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extras};windowEvents.get(type)(e);return e;},advance(ms){for(let n=0;n<ms;n+=250){time+=250;tick();}},pause(on){active=!on;},complete(){done=true;}};
}
test('Kodama appear progressively, wait for the fifth discovery and later return',()=>{
 const r=room(),visible=()=>r.spirits.filter(s=>s.classes.has('is-visible')).length;
 r.advance(14750);assert.equal(visible(),0);r.advance(250);assert.equal(visible(),1);
 r.pause(true);r.advance(20000);assert.equal(visible(),1);r.pause(false);r.advance(24000);assert.equal(visible(),5);
 r.advance(60000);assert.equal(visible(),5);r.complete();r.advance(10000);assert.equal(visible(),5);r.advance(250);assert.equal(visible(),0);
 r.advance(120000);assert.equal(visible(),5);r.advance(35000);assert.equal(visible(),0);
});
test('touch and synthetic click are intercepted before underlying hotspots and restart a strong local motion',()=>{
 const r=room(),spirit=r.spirits[0];r.emit('click',spirit);assert.equal(r.clicks.length,0);r.advance(15000);
 for(const type of ['pointerdown','pointerup','touchstart','touchend'])assert.equal(r.emit(type,spirit).stopped,true);
 const click=r.emit('click',spirit);assert(click.stopped&&click.prevented);assert.deepEqual(r.clicks,['kodama-1']);
 assert(spirit.animations[0].frames.some(f=>f.transform.includes('rotate(-38deg)')));
 r.emit('keydown',spirit,{key:'Enter',repeat:false});assert(spirit.animations[0].cancelled);assert.equal(spirit.animations.length,2);
 const outside={closest:()=>null};assert.equal(r.emit('click',outside).stopped,false);
});
test('hover never counts as discovery and the dog keeps its existing reward',()=>{
 const r=room();r.spirits[0].handlers.pointerenter({pointerType:'mouse'});assert.equal(r.clicks.length,0);
 r.emit('click',r.dog);assert.deepEqual(r.clicks,['preacher-dog']);
});
