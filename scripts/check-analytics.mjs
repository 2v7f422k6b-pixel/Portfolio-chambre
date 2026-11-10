import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker,{allowed} from '../analytics-service/worker.mjs';
import catalogue from '../analytics-service/metrics.json' with {type:'json'};
const source=readFileSync(new URL('../nana-analytics.js',import.meta.url),'utf8');
const catalogSource=readFileSync(new URL('../nana-analytics-catalog.js',import.meta.url),'utf8');
function browser(options={}){
 const requests=[],storage=new Map(options.disabled?[['nana-statistics-disabled-v1','1']]:[]),events={},docEvents={};let now=100000,ticker;
 const window={NANA_ANALYTICS_ENDPOINT:options.endpoint??'https://stats.example/collect',addEventListener:(n,fn)=>events[n]=fn};
 const document={hidden:false,readyState:'loading',referrer:options.referrer||'',querySelector:()=>null,addEventListener:(n,fn)=>docEvents[n]=fn};
 const context={window,document,parent:options.parent||window,location:{origin:'https://portfolio.example',pathname:options.path||'/Portfolio-chambre/index.html',search:options.search||''},navigator:{doNotTrack:options.dnt?'1':'0',globalPrivacyControl:!!options.gpc,userAgent:options.ua||'Desktop Chrome',maxTouchPoints:0},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>options.admin?'1':null},URL,URLSearchParams,AbortController,Date:{now:()=>now},setInterval:fn=>ticker=fn,fetch:(...args)=>{requests.push(args);return Promise.resolve({ok:true});}};
 vm.runInNewContext(catalogSource,context);vm.runInNewContext(source,context);
 return {api:window.NanaAnalytics,requests,storage,events,document,docEvents,window,advance(ms){for(let i=0;i<ms;i+=1000){now+=1000;ticker?.();}},sent:()=>requests.map(x=>JSON.parse(x[1].body))};
}
test('client and collector share exactly the selected fixed catalogue',()=>{
 const c={window:{}};vm.runInNewContext(catalogSource,c);assert.deepEqual(JSON.parse(JSON.stringify(c.window.NANA_ANALYTICS_CATALOG)),catalogue);
 assert.deepEqual(catalogue.selected,[1,2,4,6,9,10,12,14,16,17,18,24,25,28,29,30,34,35,36,37,38,39,40,41,42,43,44,45,46,50,51,53]);
 for(const m of Object.values(catalogue.metrics))assert.ok(catalogue.selected.includes(m.number));
});
test('inactive configuration never sends, queues, or replays measurements',()=>{
 const b=browser({endpoint:''});b.api.startActivity('latte');b.advance(10000);b.api.record('latte/drawing');assert.equal(b.requests.length,0);
 b.window.NANA_ANALYTICS_ENDPOINT='https://stats.example/collect';b.api.endActivity();assert.equal(b.requests.length,0);assert.equal(b.storage.size,0);
});
test('only approved payloads leave the browser, without referrer URL or personal text',()=>{
 const b=browser({referrer:'https://www.instagram.com/private/person?email=secret@example.com'});b.api.record('latte/drawing',1,true);b.api.record('latte/drawing',1,true);b.api.record('action/look-saved');b.api.record('form/contact/success',99);b.api.record('private/message');
 assert.equal(b.sent().filter(x=>x.event==='latte/drawing').length,1);assert.ok(b.sent().some(x=>x.event==='source/instagram'));assert.ok(!JSON.stringify(b.requests).includes('secret'));
 for(const [url,r] of b.requests){assert.equal(url,'https://stats.example/collect');assert.equal(r.credentials,'omit');assert.equal(r.referrerPolicy,'no-referrer');assert.ok(allowed.has(JSON.parse(r.body).event));}
 assert.equal(b.storage.size,0);
});
test('opposition, privacy signals, admin and preview exclude all collection',()=>{
 for(const options of [{disabled:true},{dnt:true},{gpc:true},{admin:true},{search:'?look-preview=1'},{search:'?zones=1'}]){const b=browser(options);b.api?.record('latte/drawing');assert.equal(b.requests.length,0);}
 const b=browser();b.api.startActivity('latte');b.api.setDisabled(true);const n=b.requests.length;b.advance(5000);b.api.endActivity();b.api.record('newsletter/subscribed');assert.equal(b.requests.length,n);assert.equal(b.storage.get('nana-statistics-disabled-v1'),'1');
});
test('frames share the parent; thumbnail previews cannot borrow its live collector',()=>{
 const b=browser();assert.equal(browser({parent:{NanaAnalytics:b.api},path:'/latte/index.html'}).api,b.api);
 assert.equal(browser({parent:{NanaAnalytics:b.api},search:'?look-preview=1'}).api,undefined);
});
test('active durations stop for hidden/idle pages; only actual unfinished bounded activities count exits',()=>{
 const b=browser();b.api.setMode('play');b.api.startActivity('latte');b.advance(5000);b.document.hidden=true;b.advance(10000);b.document.hidden=false;b.api.touch();b.advance(5000);b.api.complete('latte');b.api.endActivity();b.api.setMode('work');
 assert.equal(b.sent().find(x=>x.event==='time/activity/latte').value,10);assert.equal(b.sent().find(x=>x.event==='time/mode/play').value,10);assert.ok(!b.sent().some(x=>x.event==='activity/exit/latte'));
 b.api.startActivity('do-nothing');b.advance(1000);b.api.endActivity();assert.ok(b.sent().some(x=>x.event==='activity/exit/do-nothing'));
 b.api.startActivity('bead-box');b.advance(120000);b.api.endActivity();assert.ok(!b.sent().some(x=>x.event==='activity/exit/bead-box'));assert.ok(b.sent().find(x=>x.event==='time/activity/bead-box').value<=60);
});
test('video seek skips do not become watched milestones and source changes remove old listeners',()=>{
 const b=browser();const v=new EventTarget();Object.assign(v,{currentTime:0,duration:10,paused:false,seeking:false});b.api.trackVideo(v,'dream-1');v.dispatchEvent(new Event('playing'));
 v.currentTime=9;v.dispatchEvent(new Event('timeupdate'));assert.ok(!b.sent().some(x=>x.event==='motion/dream-1/50'));
 b.api.trackVideo(v,'bird');v.currentTime=0;v.dispatchEvent(new Event('playing'));for(let i=1;i<=10;i++){v.currentTime=i;v.dispatchEvent(new Event('timeupdate'));}
 assert.ok(b.sent().some(x=>x.event==='motion/bird/end'));assert.ok(!b.sent().some(x=>x.event==='motion/dream-1/end'));
});
function service(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../analytics-service/schema.sql',import.meta.url),'utf8'));
 const env={SITE_ORIGIN:'https://portfolio.example',ADMIN_PASSWORD:'test-password-with-at-least-24-characters',DB:{
 prepare(sql){return {bind(...args){return {async run(){return db.prepare(sql).run(...args);},async all(){return {results:db.prepare(sql).all(...args)};}};}};},async batch(writes){return Promise.all(writes.map(w=>w.run()));}
 }};
 const send=(payload,origin=env.SITE_ORIGIN,country='FR')=>{const r=new Request('https://stats.example/collect',{method:'POST',headers:{Origin:origin,'Content-Type':'text/plain'},body:typeof payload==='string'?payload:JSON.stringify(payload)});Object.defineProperty(r,'cf',{value:{country}});return worker.fetch(r,env);};
 return {db,env,send};
}
test('collector stores only daily sums, rejects extra fields, legacy names and spoofed country',async()=>{
 const s=service();assert.equal((await s.send({event:'site/open',value:1})).status,204);assert.equal((await s.send({event:'time/mode/play',value:12})).status,204);
 for(const payload of [{event:'site/open',value:1,email:'secret'},{event:'country/FR',value:1},{event:'site/open',value:999},{event:'time/mode/play',value:1801},{event:'action/look-saved',value:1}])assert.equal((await s.send(payload)).status,400);
 assert.equal((await s.send({event:'site/open',value:1},'https://evil.example')).status,403);assert.equal((await s.send('x'.repeat(201))).status,413);
 const rows=s.db.prepare('SELECT * FROM daily_metrics').all();assert.equal(rows.length,3);assert.deepEqual(Object.keys(rows[0]),['day','event','samples','value_sum']);s.db.close();
});
test('private dashboard shows period averages, groups small countries and purges old data',async()=>{
 const s=service();await s.send({event:'site/open',value:1});await s.send({event:'time/mode/play',value:10});await s.send({event:'time/mode/play',value:20});
 s.db.prepare('INSERT INTO daily_metrics VALUES (?,?,?,?)').run('2000-01-01','site/open',999,999);
 assert.equal((await worker.fetch(new Request('https://stats.example/'),s.env)).status,401);
 const response=await worker.fetch(new Request('https://stats.example/?days=7',{headers:{Authorization:'Basic '+btoa('lena:'+s.env.ADMIN_PASSWORD)}}),s.env);assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('15 s en moyenne'));assert.ok(html.includes('Pays regroupés'));assert.ok(!html.includes('France'));assert.ok(html.includes('À relier'));assert.ok(!html.includes('999'));
 await worker.scheduled({},s.env);assert.equal(s.db.prepare("SELECT COUNT(*) AS n FROM daily_metrics WHERE day='2000-01-01'").get().n,0);s.db.close();
});
