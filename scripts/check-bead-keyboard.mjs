import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../bead-box.js',import.meta.url),'utf8').replace('window.NanaBeadBox={open};','window.NanaBeadBox={open,bead};');
function setup(){
 const events={},visualEvents={},frames=[],style=new Map(),classes=new Map();
 const input={id:'bead-word-input',value:'NANA',getBoundingClientRect:()=>({top:620,bottom:670})};
 const shade={classList:{toggle:(key,value)=>classes.set(key,value)},style:{setProperty:(key,value)=>style.set(key,value)}};
 const pane={scrollTop:0,getBoundingClientRect:()=>({top:150,bottom:460})};
 const viewport={height:900,offsetTop:0,scale:1,addEventListener:(name,fn)=>visualEvents[name]=fn};
 const document={readyState:'loading',documentElement:{lang:'fr',clientHeight:900},activeElement:input,querySelector:()=>null,addEventListener:(name,fn)=>events[name]=fn,getElementById:id=>({'bead-word-input':input,'window-shade':shade,'window-content':pane,menubar:{getBoundingClientRect:()=>({bottom:56})}}[id])};
 const context={window:{innerHeight:900,visualViewport:viewport,addEventListener(){}},document,localStorage:{getItem:()=>null},requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}};
 vm.runInNewContext(source,context);
 return {events,visualEvents,viewport,document,pane,input,style,classes,api:context.window.NanaBeadBox,flush(){while(frames.length)frames.shift()();}};
}
test('keyboard viewport anchors only this window and scrolls the input inside it',()=>{
 const p=setup();p.events.focusin({target:p.input});p.flush();assert.equal(p.classes.get('bead-keyboard-open'),false);
 p.viewport.height=420;p.viewport.offsetTop=80;p.visualEvents.resize();p.flush();
 assert.equal(p.classes.get('bead-keyboard-open'),true);assert.equal(p.style.get('--bead-keyboard-top'),'88px');assert.equal(p.style.get('--bead-keyboard-height'),'404px');assert.equal(p.pane.scrollTop,222);assert.equal(p.input.value,'NANA');
 p.document.activeElement=null;p.events.focusout({target:p.input});p.flush();assert.equal(p.classes.get('bead-keyboard-open'),false);
});
test('pinch zoom and hardware keyboards do not trigger keyboard layout',()=>{
 const p=setup();p.events.focusin({target:p.input});p.flush();assert.equal(p.classes.get('bead-keyboard-open'),false);
 p.viewport.height=400;p.viewport.scale=2;p.visualEvents.resize();p.flush();assert.equal(p.classes.get('bead-keyboard-open'),false);
});
test('all letters and digits use centered original PNGs without a font dependency',()=>{
 const p=setup();
 for(const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'){
  const html=p.api.bead('letter',letter,0);
  assert.ok(html.includes('assets/drawn-ui/lettre_'+letter+'.png'));
  assert.ok(html.includes('x="-11" y="-12" width="22" height="24"'));
  assert.ok(html.includes('preserveAspectRatio="xMidYMid meet"'));
  assert.ok(!html.includes('<text'));
 }
});
