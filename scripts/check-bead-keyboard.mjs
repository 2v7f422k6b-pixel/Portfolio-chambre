import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../bead-box.js',import.meta.url),'utf8').replace('window.NanaBeadBox={open};','window.NanaBeadBox={open,centerLetters};');
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
test('glyph ink ignores SVG font metrics and centers the actual painted strokes',()=>{
 const p=setup();
 const ink={actualBoundingBoxLeft:-2,actualBoundingBoxRight:16,actualBoundingBoxAscent:19,actualBoundingBoxDescent:1};
 p.document.createElement=()=>({getContext:()=>({measureText:()=>ink})});
 const attrs={};
 const text={textContent:'A',setAttribute:(key,value)=>attrs[key]=value,getBBox(){throw new Error('SVG font box must not replace actual ink metrics');}};
 p.api.centerLetters({querySelectorAll:()=>[text]});
 assert.equal(Number(attrs.x),-9);
 assert.equal(Number(attrs.y),9);
 assert.equal(Number(attrs.x)+(-ink.actualBoundingBoxLeft+ink.actualBoundingBoxRight)/2,0);
 assert.equal(Number(attrs.y)+(-ink.actualBoundingBoxAscent+ink.actualBoundingBoxDescent)/2,0);
});
test('older browsers can fall back to SVG metrics',()=>{
 const p=setup();
 for(const box of [{x:2,y:-22,width:17,height:24},{x:4,y:-15,width:14,height:18}]){
  const attrs={};const text={setAttribute:(key,value)=>attrs[key]=value,getBBox:()=>box};
  p.api.centerLetters({querySelectorAll:()=>[text]});
  assert.equal(Number(attrs.x)+box.x+box.width/2,0);assert.equal(Number(attrs.y)+box.y+box.height/2,0);
 }
});

