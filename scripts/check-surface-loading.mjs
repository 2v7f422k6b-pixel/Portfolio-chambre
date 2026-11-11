import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {createGate,waitForImage,waitForView}=createRequire(import.meta.url)('../surface-loading.js');
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject};}
class FakeImage extends EventTarget {
  complete=false;naturalWidth=0;decoded=deferred();
  decode(){return this.decoded.promise;}
  loaded(){this.complete=true;this.naturalWidth=3072;this.dispatchEvent(new Event('load'));}
}
test('Marseille loading first never reveals a room whose foreground has not decoded',async()=>{
  const city=new FakeImage(),room=new FakeImage(),events=[];
  const gate=createGate({prepare:()=>Promise.all([waitForImage(city),waitForImage(room)]),pending:()=>events.push('pending'),reveal:()=>events.push('reveal'),failed:()=>events.push('failed')});
  const run=gate.run();city.loaded();city.decoded.resolve();
  await Promise.resolve();assert.deepEqual(events,['pending']);
  room.loaded();await Promise.resolve();assert.deepEqual(events,['pending']);
  room.decoded.resolve();await run;assert.deepEqual(events,['pending','reveal']);
});
test('late completion from a previous view cannot reveal a replacement still loading',async()=>{
  const first=deferred(),second=deferred(),events=[];let task=first;
  const gate=createGate({prepare:()=>task.promise,pending:()=>events.push('pending'),reveal:()=>events.push('reveal'),failed:()=>events.push('failed')});
  const a=gate.run();task=second;const b=gate.run();first.resolve();await a;
  assert.deepEqual(events,['pending','pending']);second.resolve();await b;
  assert.deepEqual(events,['pending','pending','reveal']);
});
test('closing during loading cancels both success and error presentation',async()=>{
  for(const fail of [true,false]){
    const task=deferred(),events=[];
    const gate=createGate({prepare:()=>task.promise,pending:()=>{},reveal:()=>events.push('reveal'),failed:()=>events.push('failed')});
    const run=gate.run();gate.cancel();fail?task.reject(new Error('offline')):task.resolve();await run;
    assert.deepEqual(events,[]);
  }
});
test('failed image and slow image produce bounded errors instead of an endless loader',async()=>{
  const broken=new FakeImage();const failed=waitForImage(broken,30);broken.dispatchEvent(new Event('error'));
  await assert.rejects(failed,/unavailable/);
  await assert.rejects(waitForImage(new FakeImage(),5),/timeout/);
});
test('an explicit retry recovers from an error without caching a rejected load forever',async()=>{
  let good=false;const events=[];
  const gate=createGate({prepare:()=>good?Promise.resolve():Promise.reject(new Error('offline')),pending:()=>events.push('pending'),reveal:()=>events.push('reveal'),failed:()=>events.push('failed')});
  await gate.run();good=true;await gate.run();assert.deepEqual(events,['pending','failed','pending','reveal']);
});
test('cached images still decode on re-entry, including after browser memory eviction',async()=>{
  let decodes=0;const image=new FakeImage();image.complete=true;image.naturalWidth=3072;
  image.decode=async()=>{decodes++;};
  for(let i=0;i<20;i++)await waitForImage(image);
  assert.equal(decodes,20);
});

test('an embedded avatar cannot leave its parent loader waiting forever',async()=>{
  await waitForView(Promise.resolve());
  await assert.rejects(waitForView(new Promise(()=>{}),5),/View timeout/);
});
