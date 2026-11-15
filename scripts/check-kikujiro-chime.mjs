import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function setup(audio=true){
 const events=new Map(),classes=new Set(),feats=new Set(),visits=[],notes=[],timers=new Map();let clock=1000,id=0;
 const chime={setAttribute(){},getBoundingClientRect(){return{}},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){on?classes.add(c):classes.delete(c)}},addEventListener:(name,fn)=>events.set(name,fn)};
 const toast={hidden:true,textContent:''},document={hidden:false,documentElement:{lang:'fr'},getElementById:name=>name==='toast'?toast:chime,addEventListener(){}};
 const window={NanaProgress:{hasFeat:id=>feats.has(id),feat:id=>feats.add(id),visit:id=>visits.push(id)}};
 if(audio)window.AudioContext=class{state='running';currentTime=0;destination={};createOscillator(){const node={frequency:{value:0},connect(){},disconnect(){},start(){notes.push(node.frequency.value)},stop(){}};return node;}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}};
 vm.runInNewContext(readFileSync(new URL('../kikujiro-chime.js',import.meta.url),'utf8'),{document,window,navigator:{userActivation:{hasBeenActive:true}},performance:{now:()=>clock},setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:id=>timers.delete(id)});
 const event={pointerType:'mouse',preventDefault(){},stopPropagation(){}};
 return{events,event,classes,feats,visits,notes,toast,advance:ms=>clock+=ms};
}
test('hover rings softly without awarding anything; click/keyboard remembers Kikujiro, even without audio',()=>{
 for(const audio of [true,false]){
  const p=setup(audio);p.events.get('pointerenter')(p.event);assert(p.classes.has('is-ringing'));assert.equal(p.feats.size,0);assert.equal(p.notes.length,audio?6:0);
  p.events.get('pointerenter')(p.event);assert.equal(p.notes.length,audio?6:0,'rapid hover is throttled');
  p.advance(800);p.events.get('click')(p.event);assert(p.feats.has('kikujiro-chime'));assert.deepEqual(p.visits,['objet/clochette-kikujiro']);assert.equal(p.toast.hidden,false);
  p.events.get('keydown')({...p.event,key:'Enter'});p.events.get('keydown')({...p.event,key:' '});assert.equal(p.feats.size,1);
 }
});
test('all six artist exports stay at their registered positions with fixed strap and nested bell/clappers',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 for(const n of [7139,7140,7141,7142,7143,7144]){assert(html.includes('IMG_'+n+'.png'));const png=readFileSync(new URL('../assets/IMG_'+n+'.png',import.meta.url));assert.equal(png.readUInt32BE(16),3072);assert.equal(png.readUInt32BE(20),1732);}
 assert.match(html,/class="chime-body">\s*<g class="chime-clappers">/);
});
