import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
test('pinch magnifies inner content, leaves iframe viewport stationary and resets cleanly',()=>{
 const listeners={},style=()=>({removeProperty(k){delete this[k]}}),body={style:style()},doc={body,documentElement:{style:style()},addEventListener(k,f){listeners[k]=f}};
 const frame={style:style(),offsetWidth:800,offsetHeight:600,contentDocument:doc,dataset:{},getAttribute:()=> 'dreamlab.html',addEventListener(){}};
 const host={style:style(),querySelectorAll:()=>[frame],querySelector:()=>frame};
 const context={document:{getElementById:()=>host},window:{addEventListener(){}},MutationObserver:class{observe(){}}};
 const src=readFileSync(new URL('../window-bounds.js',import.meta.url),'utf8');vm.runInNewContext(src.slice(src.indexOf('/* Pinch embedded')),context);
 function event(touches){return {touches:touches.map(([clientX,clientY])=>({clientX,clientY})),target:{closest:()=>null},preventDefault(){},stopImmediatePropagation(){}}}
 listeners.touchstart(event([[200,200],[400,200]]));listeners.touchmove(event([[100,200],[500,200]]));
 assert.equal(frame.style.transform,undefined);assert.match(body.style.transform,/scale\(2\)/);assert.match(body.style.transform,/translate\(-300px,-200px\)/);
 listeners.touchend(event([]));
 listeners.touchstart(event([[100,200],[500,200]]));listeners.touchmove(event([[200,200],[400,200]]));
 assert.equal(body.style.transform,'');assert.equal(doc.documentElement.style.overflow,'');
});
