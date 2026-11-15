import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('butterfly pauses on touch, respects page visibility and unlocks Paprika only on activation',()=>{
 const events=new Map(),docEvents=new Map(),classes=new Set(),actions=[],timers=new Map();let next=0;
 const button={setAttribute(k,v){this[k]=v},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){on?classes.add(c):classes.delete(c)}},addEventListener:(name,fn)=>events.set(name,fn)};
 const document={documentElement:{lang:'fr'},hidden:false,getElementById:()=>button,addEventListener:(name,fn)=>docEvents.set(name,fn)};
 vm.runInNewContext(readFileSync(new URL('../paprika-butterfly.js',import.meta.url),'utf8'),{document,window:{NanaProgress:{visit:id=>actions.push(['visit',id]),feat:id=>actions.push(['feat',id])}},setTimeout:fn=>{timers.set(++next,fn);return next},clearTimeout:id=>timers.delete(id)});
 events.get('pointerdown')();assert(classes.has('is-paused'));assert.equal(actions.length,0);
 events.get('pointerup')();for(const fn of timers.values())fn();assert(!classes.has('is-paused'));
 document.hidden=true;docEvents.get('visibilitychange')();assert(classes.has('is-idle'));
 document.hidden=false;docEvents.get('visibilitychange')();assert(!classes.has('is-idle'));
 events.get('click')({preventDefault(){},stopPropagation(){}});assert.deepEqual(actions,[['visit','objet/papillon-paprika'],['feat','paprika-butterfly']]);
 document.documentElement.lang='en';docEvents.get('portfolio-language-change')();assert.match(button['aria-label'],/Paprika/);
});
test('butterfly keeps all three registered artist layers and a native keyboard-accessible button',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const markup=html.match(/<button id="paprika-butterfly".*?<\/button>/s)[0];
 assert.match(markup,/type="button"/);assert.equal([...markup.matchAll(/<image /g)].length,3);
 for(const n of [7136,7137,7138]){assert(markup.includes('IMG_'+n+'.png'));const file=readFileSync(new URL('../assets/IMG_'+n+'.png',import.meta.url));assert.equal(file.readUInt32BE(16),1000);assert.equal(file.readUInt32BE(20),1000);}
 const css=readFileSync(new URL('../paprika-butterfly.css',import.meta.url),'utf8');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/:focus-within/);
});
