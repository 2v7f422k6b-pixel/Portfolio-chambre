import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../mimilab-fit.js',import.meta.url),'utf8');
function surface(width,height){
  const listeners=new Map();
  return {innerWidth:width,innerHeight:height,location:{origin:'https://portfolio.test'},listeners,
    addEventListener(name,fn){listeners.set(name,fn)},
    removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name)},
    messages:[],postMessage(data,origin){this.messages.push({data,origin})}};
}
function run(frame,parent=frame){
  frame.parent=parent;
  const classes=new Set(),events=new Map();
  const document={documentElement:{classList:{toggle(name,on){on?classes.add(name):classes.delete(name)}}},
    addEventListener(name,fn){events.set(name,fn)}};
  vm.runInNewContext(source,{window:frame,document,location:frame.location});
  return {classes,events};
}
test('portrait iPad uses its host orientation despite a landscape-shaped iframe',()=>{
  const host=surface(1024,1366),frame=surface(994,850);
  const {classes}=run(frame,host);
  assert.ok(classes.has('dl-force-portrait'));
  assert.ok(!classes.has('dl-force-landscape'));
  host.innerWidth=1366;host.innerHeight=1024;host.listeners.get('resize')();
  assert.ok(classes.has('dl-force-landscape'));
  assert.ok(!classes.has('dl-force-portrait'));
  frame.listeners.get('pagehide')();
  assert.ok(!host.listeners.has('resize'));
});
test('standalone pages retain their own navigation and viewport orientation',()=>{
  const {classes}=run(surface(390,740));
  assert.ok(classes.has('dl-standalone'));
  assert.ok(classes.has('dl-force-portrait'));
});
test('inaccessible parent falls back to the embedded viewport',()=>{
  const parent={get location(){throw new Error('cross-origin')}};
  const {classes}=run(surface(820,1050),parent);
  assert.ok(classes.has('dl-force-portrait'));
  assert.ok(!classes.has('dl-standalone'));
});
test('Escape inside the studio requests closing only its same-origin host',()=>{
  const host=surface(1024,768),frame=surface(994,560);
  const {events}=run(frame,host);let prevented=false;
  events.get('keydown')({key:'Escape',preventDefault(){prevented=true}});
  assert.ok(prevented);
  assert.equal(host.messages.length,1);
  assert.equal(host.messages[0].data.type,'portfolio-close-dreamlab');
  assert.equal(host.messages[0].origin,'https://portfolio.test');
});
