import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('butterfly pauses on touch, respects page visibility and unlocks Paprika only on activation',()=>{
 const events=new Map(),docEvents=new Map(),classes=new Set(),actions=[],timers=new Map();let next=0;
 const button={parentElement:{clientWidth:1200,clientHeight:800},style:{setProperty(){}},setAttribute(k,v){this[k]=v},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){on?classes.add(c):classes.delete(c)}},addEventListener:(name,fn)=>events.set(name,fn)};
 const document={documentElement:{lang:'fr'},hidden:false,getElementById:()=>button,addEventListener:(name,fn)=>docEvents.set(name,fn)};
 vm.runInNewContext(readFileSync(new URL('../paprika-butterfly.js',import.meta.url),'utf8'),{document,window:{addEventListener(){},NanaProgress:{visit:id=>actions.push(['visit',id]),feat:id=>actions.push(['feat',id])}},setTimeout:fn=>{timers.set(++next,fn);return next},clearTimeout:id=>timers.delete(id)});
 events.get('pointerdown')();assert(classes.has('is-paused'));assert.equal(actions.length,0);
 events.get('pointerup')();for(const fn of timers.values())fn();assert(!classes.has('is-paused'));
 document.hidden=true;docEvents.get('visibilitychange')();assert(classes.has('is-idle'));
 document.hidden=false;docEvents.get('visibilitychange')();assert(!classes.has('is-idle'));
 events.get('click')({preventDefault(){},stopPropagation(){}});assert.deepEqual(actions,[['visit','objet/papillon-paprika'],['feat','paprika-butterfly']]);
 document.documentElement.lang='en';docEvents.get('portfolio-language-change')();assert.match(button['aria-label'],/Paprika/);
});
test('butterfly keeps both registered three-layer themes and a native keyboard-accessible button',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const markup=html.match(/<button id="paprika-butterfly".*?<\/button>/s)[0];
 assert.match(markup,/type="button"/);assert.equal([...markup.matchAll(/<img /g)].length,6);
 for(const n of [7136,7137,7138,7199,7200,7201]){assert(markup.includes('IMG_'+n+'.png'));const file=readFileSync(new URL('../assets/IMG_'+n+'.png',import.meta.url));assert.equal(file.readUInt32BE(16),1000);assert.equal(file.readUInt32BE(20),1000);}
 for(const theme of ['day','night']){const layers=[...markup.matchAll(/<img [^>]+>/g)].map(m=>m[0]).filter(m=>m.includes('data-resource-theme="'+theme+'"'));assert.equal(layers.length,3);assert.equal(layers.filter(m=>m.includes('butterfly-wing')).length,2);assert.equal(layers.filter(m=>m.includes('butterfly-body')).length,1);}
 const css=readFileSync(new URL('../paprika-butterfly.css',import.meta.url),'utf8');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/:focus-within/);
});
