import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker, {allowed} from '../analytics-service/worker.mjs';
const source=readFileSync(new URL('../nana-analytics.js',import.meta.url),'utf8');
function browser(options={}){
 const requests=[],storage=new Map(options.disabled?[['nana-statistics-disabled-v1','1']]:[]),handlers={};
 const window={NANA_ANALYTICS_ENDPOINT:options.endpoint??'https://stats.example/collect',addEventListener:(name,fn)=>handlers[name]=fn};
 const context={window,parent:options.parent||window,location:{pathname:options.path||'/Portfolio-chambre/index.html',search:options.search||''},navigator:{doNotTrack:options.dnt?'1':'0',globalPrivacyControl:!!options.gpc},localStorage:{getItem:key=>storage.get(key)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>options.admin?'1':null},URL,URLSearchParams,fetch:(...args)=>{requests.push(args);return Promise.resolve({ok:true});}};
 vm.runInNewContext(source,context);return {api:window.NanaAnalytics,requests,storage,handlers,window};
}
test('disabled configuration sends nothing and never replays old activity',()=>{
 const b=browser({endpoint:''});b.api.count('action/beads-made');assert.equal(b.requests.length,0);
 b.window.NANA_ANALYTICS_ENDPOINT='https://stats.example/collect';b.api.count('action/latte-made');
 assert.equal(b.requests.length,1);assert.equal(b.requests[0][1].body,'action/latte-made');assert.equal(b.storage.size,0);
});
test('transmits only fixed event names without credentials, referrer, visitor ID or stored history',()=>{
 const b=browser();b.api.count('action/latte-made');b.api.count('action/latte-made');
 assert.equal(b.requests.length,2);for(const [url,request] of b.requests){assert.equal(url,'https://stats.example/collect');assert.ok(allowed.has(request.body));assert.equal(request.credentials,'omit');assert.equal(request.referrerPolicy,'no-referrer');assert.equal(request.method,'POST');}
 assert.equal(b.storage.size,0);b.api.count('action/with name@email.fr');assert.equal(b.requests.length,2);
});
test('objection, privacy signals and creator previews suppress every event',()=>{
 for(const option of [{disabled:true},{dnt:true},{gpc:true},{admin:true},{search:'?look-preview=1'},{search:'?zones=1'},{search:'?previewReward=1'}]){const b=browser(option);b.api.count('action/look-saved',false);assert.equal(b.requests.length,0,JSON.stringify(option));}
 const b=browser();b.api.setDisabled(true);b.api.count('action/beads-made');assert.equal(b.requests.length,1);assert.equal(b.storage.get('nana-statistics-disabled-v1'),'1');b.api.setDisabled(false);b.api.count('action/beads-made');assert.equal(b.requests.length,2);
});
test('iframes reuse the parent without counting another page, and standalone games work',()=>{
 const owner=browser();const frame=browser({parent:{NanaAnalytics:owner.api},path:'/Portfolio-chambre/latte/index.html'});assert.equal(frame.api,owner.api);assert.equal(frame.requests.length,0);
 const solo=browser({path:'/Portfolio-chambre/latte/index.html'});assert.equal(solo.requests[0][1].body,'page/latte');
});
function service(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../analytics-service/schema.sql',import.meta.url),'utf8'));
 const env={
  SITE_ORIGIN:'https://2v7f422k6b-pixel.github.io',
  ADMIN_PASSWORD:'test-only-secret-with-at-least-24-characters',
  DB:{prepare(sql){return {bind(...args){return {
    async run(){return db.prepare(sql).run(...args);},
    async all(){return {results:db.prepare(sql).all(...args)};}
  };}};}}
 };
 const send=(event,origin=env.SITE_ORIGIN)=>worker.fetch(new Request('https://stats.example/collect',{method:'POST',headers:{Origin:origin,'Content-Type':'text/plain'},body:event}),env);
 return {db,env,send};
}
test('collector stores daily sums only, rejects unknown/free-text events and foreign origins',async()=>{
 const s=service();assert.equal((await s.send('action/beads-made')).status,204);assert.equal((await s.send('action/beads-made')).status,204);
 assert.equal((await s.send('My private poem')).status,400);assert.equal((await s.send('action/latte-made','https://other.example')).status,403);assert.equal((await s.send('a'.repeat(101))).status,413);
 const rows=s.db.prepare('SELECT * FROM counters').all();assert.equal(rows.length,1);assert.equal(rows[0].total,2);assert.deepEqual(Object.keys(rows[0]),['day','event','total']);s.db.close();
});
test('dashboard denies unauthenticated requests, renders sums, and purges expired counters',async()=>{
 const s=service();await s.send('action/look-saved');s.db.prepare('INSERT INTO counters VALUES (?,?,?)').run('2000-01-01','page/room',999);
 assert.equal((await worker.fetch(new Request('https://stats.example/'),s.env)).status,401);
 const request=new Request('https://stats.example/',{headers:{Authorization:'Basic '+btoa('lena:'+s.env.ADMIN_PASSWORD)}});
 const response=await worker.fetch(request,s.env);assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('action/look-saved'));assert.ok(!html.includes('999'));assert.ok(response.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));
 await worker.scheduled({},s.env);assert.equal(s.db.prepare('SELECT COUNT(*) AS n FROM counters').get().n,1);s.db.close();
});
