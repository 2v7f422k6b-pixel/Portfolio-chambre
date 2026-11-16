import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../kero-wake.js',import.meta.url),'utf8');
function setup({night=false,reduced=false}={}){
 const poses={dataset:{keroState:'asleep'}},listeners={},timers=new Map(),feats=[],sources=[];let next=0;
 const document={hidden:false,documentElement:{dataset:{theme:night?'night':'day'}},getElementById:id=>id==='kero-poses'?poses:{addEventListener(){}},addEventListener:(n,f)=>listeners[n]=f};
 const env={document,Image:class {set src(s){sources.push(s);queueMicrotask(()=>this.onload())}decode(){return Promise.resolve()}},setTimeout(f,ms){let id=++next;timers.set(id,{f,ms});return id},clearTimeout:id=>timers.delete(id),window:{matchMedia:()=>({matches:reduced}),NanaProgress:{feat:id=>feats.push(id)}}};vm.runInNewContext(source,env);
 return {poses,document,feats,sources,listeners,activate:env.window.NanaKeroWake.activate,async tick(ms){const selected=[...timers].filter(([id,t])=>t.ms===ms);for(const [id,t]of selected){timers.delete(id);t.f()}await flush();}};
}
async function flush(){for(let i=0;i<15;i++)await Promise.resolve()}
test('day and night wake in two drawn steps, reward once, then return to sleep',async()=>{
 for(const night of [false,true]){const h=setup({night});const done=h.activate();await flush();assert.equal(h.poses.dataset.keroState,'waking');assert.equal(h.feats.length,0);await h.activate();assert.equal(h.sources.length,2);assert(h.sources.every(s=>s.endsWith(night?'-night.png':'-day.png')));await h.tick(180);await done;assert.equal(h.poses.dataset.keroState,'awake');assert.deepEqual(h.feats,['kero-awake']);await h.tick(2200);assert.equal(h.poses.dataset.keroState,'asleep');}
});
test('reduced motion awards immediately; hiding the page cancels an unfinished wake',async()=>{
 const r=setup({reduced:true});await r.activate();assert.equal(r.poses.dataset.keroState,'awake');assert.equal(r.feats.length,1);
 const h=setup();const done=h.activate();await flush();h.document.hidden=true;h.listeners.visibilitychange();await h.tick(420);await done;assert.equal(h.feats.length,0);assert.equal(h.poses.dataset.keroState,'asleep');
});
test('six compact poses keep day/night classes and the original shelf registration',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const rows=[...html.matchAll(/<image[^>]*data-kero-pose="([^"]+)"[^>]*>/g)];assert.equal(rows.length,6);for(const [tag,state]of rows){assert(tag.includes('assets/kero/'+state+'-'));assert(tag.includes('width="138.623046875"'));assert(tag.includes('x="1295.4459635416667"'));}
 const registry=readFileSync(new URL('../room-zone-registry.js',import.meta.url),'utf8');assert(registry.includes("if(id==='kero'&&window.NanaKeroWake)"));
});
