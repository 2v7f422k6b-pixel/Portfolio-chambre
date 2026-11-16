import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('Happy Berry, BLAST and Kero unlock their own collections by click, Enter and Space',()=>{
 const events=new Map(),actions=[];
 const svg={querySelector:()=>null,addEventListener(type,fn){const all=events.get(type)||[];all.push(fn);events.set(type,all);}};
 const window={NanaResources:{enqueueImage(){}},NanaProgress:{visit:r=>actions.push(['visit',r]),feat:r=>actions.push(['feat',r])},dispatchEvent(){}};
 const document={getElementById:id=>id==='hotspots'?svg:null};
 class Event{constructor(type,options){this.type=type;Object.assign(this,options);}}
 vm.runInNewContext(readFileSync(new URL('../room-zone-registry.js',import.meta.url),'utf8'),{window,document,setTimeout(){},Event,MouseEvent:Event});
 const zone=window.NANA_ROOM_ZONES.find(z=>z.id==='happy-berry');assert.equal(zone.file,'IMG_7121.png');assert.equal(zone.number,47);
 const target={dataset:{roomZoneId:'happy-berry'},closest:selector=>selector.includes('data-room-zone-id')?target:null,dispatchEvent:e=>dispatch(e.type)};
 function dispatch(type,key){const event={type,key,target,preventDefault(){},stopImmediatePropagation(){this.stopped=true;}};for(const fn of events.get(type)||[]){fn(event);if(event.stopped)break;}}
 assert(!window.NANA_ROOM_ZONES.some(z=>/713[34]/.test(z.file||'')),'The shelf is not an interactive room zone');
 for(const [id,feat] of [['happy-berry','gokinjo-happy-berry'],['blast','nana-blast'],['kero','kero-awake']]){
  target.dataset.roomZoneId=id;
  for(const [type,key] of [['click'],['keydown','Enter'],['keydown',' ']]){actions.length=0;dispatch(type,key);assert.deepEqual(actions,[['visit','objet/'+id],['feat',feat]]);}
 }
 window.NanaKeroWake={activate:()=>actions.push(['wake','kero'])};
 target.dataset.roomZoneId='kero';for(const [type,key]of [['click'],['keydown','Enter'],['keydown',' ']]){actions.length=0;dispatch(type,key);assert.deepEqual(actions,[['visit','objet/kero'],['wake','kero']]);}
 target.dataset.roomZoneId='imac';actions.length=0;dispatch('click');assert.equal(actions.length,0);
 actions.length=0;dispatch('keydown','Escape');assert.equal(actions.length,0);
});
test('Happy Berry day and night exports keep the same full-room canvas and use the shared white contour',()=>{
 for(const n of [7121,7122,7126,7127,7131,7132,7133,7134]){const file=readFileSync(new URL('../assets/IMG_'+n+'.png',import.meta.url));assert.equal(file.readUInt32BE(16),3072);assert.equal(file.readUInt32BE(20),1732);}
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/class="berry-day"[^>]+data-resource-theme="day"[^>]+IMG_7121/);
 assert.match(html,/class="berry-night"[^>]+data-resource-theme="night"[^>]+IMG_7122/);
 assert.match(html,/class="blast-day"[^>]+data-resource-theme="day"[^>]+IMG_7126/);
 assert.match(html,/class="blast-night"[^>]+data-resource-theme="night"[^>]+IMG_7127/);
 assert.match(html,/class="sakura-day kero-art"[^>]+data-resource-theme="day"[^>]+assets\/kero\/asleep-day\.png/);
 assert.match(html,/class="sakura-night kero-art"[^>]+data-resource-theme="night"[^>]+assets\/kero\/asleep-night\.png/);
 assert(html.indexOf('class="sakura-day shelf-art"')<html.indexOf('class="sakura-day kero-art"'));
 const outlines=readFileSync(new URL('../pixel-outlines.js',import.meta.url),'utf8');assert.match(outlines,/files.push\('IMG_7121.png'\)/);assert.match(outlines,/cushionTapTimer/);
});

test('compact Kero frames exactly match the original artist pixels and registration',()=>{
 for(const state of ['asleep','waking','awake'])for(const mode of ['day','night']){
  const png=readFileSync(new URL('../assets/kero/'+state+'-'+mode+'.png',import.meta.url));assert.equal(png.readUInt32BE(16),255);assert.equal(png.readUInt32BE(20),227);
 }
});
