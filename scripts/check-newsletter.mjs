import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../nana-newsletter.js', import.meta.url), 'utf8');
const KEY = 'nana-newsletter-v1';
function browser({storage = new Map(), blockedStorage = false, suppressed = false, request} = {}) {
  const events = new Map(), intervals = new Map(), timeouts = new Map(), requests = [];
  const ui = {now:0, mode:'play', blocked:false, feats:[], required:['a','b','c','d'], discovered:[], focus:null};
  const listen = (map, name, fn) => map.set(name, [...map.get(name) || [], fn]);
  class Element {
    constructor() { this.children = new Map(); this.events = new Map(); this.hidden = false; this.open = false; this.value = ''; this.isConnected = true; this.elements = {_gotcha:{value:''}}; this.valid = true; }
    setAttribute(name,value) { this[name] = value; }
    querySelector(selector) { if (!this.children.has(selector)) this.children.set(selector, new Element()); return this.children.get(selector); }
    querySelectorAll() { return [this.querySelector('.nn-close'),this.querySelector('.nn-later')]; }
    addEventListener(name, fn) { listen(this.events, name, fn); }
    async emit(name) { for (const fn of this.events.get(name) || []) await fn({preventDefault(){},stopPropagation(){}}); }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    focus() { ui.focus = this; }
    getClientRects() { return this.hidden ? [] : [{}]; }
    reportValidity() { return this.valid; }
    reset() { dialog.querySelector('#nn-email').value = ''; }
  }
  const nodes = new Map();
  const document = {hidden:false, documentElement:{lang:'fr'}, activeElement:new Element(),
    body:{append:(...els) => els.forEach(el => nodes.set(el.id,el))},
    createElement:() => new Element(),
    getElementById:id => id === 'app' ? {classList:{contains:name => name === 'mode-' + ui.mode}} : nodes.get(id),
    querySelector:() => ui.blocked || nodes.get('nana-newsletter')?.open ? {} : null,
    addEventListener:(name,fn) => listen(events,name,fn)};
  let serial = 0;
  const env = {document, performance:{now:() => ui.now}, Date, AbortController,
    localStorage:{getItem:key => { if (blockedStorage) throw Error('blocked'); return storage.get(key) || null; },setItem:(key,value) => { if (blockedStorage) throw Error('blocked'); storage.set(key,value); }},
    NanaProgress:{suppressed:() => suppressed,snapshot:() => ({feats:ui.feats,room:{required:ui.required,discovered:ui.discovered}})},
    setInterval:fn => { intervals.set(++serial,fn); return serial; },clearInterval:id => intervals.delete(id),
    setTimeout:fn => { timeouts.set(++serial,fn); return serial; },clearTimeout:id => timeouts.delete(id),
    addEventListener:(name,fn) => listen(events,name,fn),
    FormData:class extends Map {},
    fetch:async (url,options) => { requests.push({url,options}); return request ? request(options) : {ok:true}; }};
  env.window = env;
  vm.runInNewContext(source, env);
  const dialog = nodes.get('nana-newsletter'), note = nodes.get('nana-newsletter-note');
  return {ui,env,storage,requests,dialog,note,document,form:dialog.querySelector('form'),email:dialog.querySelector('#nn-email'),
    advance:seconds => { for(let i=0;i<seconds;i++){ui.now += 1000;[...intervals.values()].forEach(fn => fn());} },
    emit:(name,event={}) => (events.get(name) || []).forEach(fn => fn(event)),
    expire:() => [...timeouts.values()].forEach(fn => fn())};
}

test('invitation requires engagement and visible time; it never interrupts an open activity', () => {
  const b = browser();
  b.advance(90); assert.equal(b.note.hidden,true); assert.equal(b.requests.length,0);
  b.ui.feats.push('latte-made'); b.ui.blocked = true; b.advance(30); assert.equal(b.note.hidden,true);
  b.ui.blocked = false; b.advance(2); assert.equal(b.note.hidden,true);
  b.advance(1); assert.equal(b.note.hidden,false); assert.equal(b.ui.focus,null);
  b.ui.blocked = true; b.advance(1); assert.equal(b.note.hidden,true);
  b.ui.blocked = false; b.advance(90); assert.equal(b.note.hidden,true);
  assert.equal(browser({storage:b.storage}).note.hidden,true);
});
test('a quarter of unique required objects qualifies, duplicate and unknown discoveries do not', () => {
  const b = browser(); b.ui.required = ['a','b','c','d','e']; b.ui.discovered = ['a','a','unknown'];
  b.advance(90); assert.equal(b.note.hidden,true);
  b.ui.discovered.push('b'); b.advance(1); assert.equal(b.note.hidden,false);
});
test('hidden time and Work do not count; creator previews never show the invitation', () => {
  const b = browser(); b.ui.feats.push('outfit-styled');
  b.document.hidden = true; b.advance(120); b.document.hidden = false;
  b.ui.mode = 'work'; b.advance(120); b.ui.mode = 'play';
  b.advance(59); assert.equal(b.note.hidden,true); b.advance(1); assert.equal(b.note.hidden,false);
  const preview = browser({suppressed:true}); preview.ui.discovered = preview.ui.required;
  preview.advance(120); assert.equal(preview.note.hidden,true); assert.equal(preview.storage.has(KEY),false);
});
test('dismissal persists but deliberate signup stays accessible', async () => {
  const b = browser(); b.ui.feats.push('beads-made'); b.advance(60);
  await b.note.querySelector('[data-nn-dismiss]').emit('click');
  const returning = browser({storage:b.storage}); returning.ui.feats.push('beads-made'); returning.advance(120);
  assert.equal(returning.note.hidden,true); returning.env.NanaNewsletter.open();
  assert.equal(returning.dialog.open,true); assert.equal(returning.requests.length,0);
  assert.equal(returning.ui.focus,returning.email);
});
test('only an explicit valid submission transmits the email and consent, never progress', async () => {
  const b = browser(); b.env.NanaNewsletter.open();
  b.form.valid = false; await b.form.emit('submit'); assert.equal(b.requests.length,0);
  b.form.valid = true; b.form.elements._gotcha.value = 'spam'; await b.form.emit('submit'); assert.equal(b.requests.length,0);
  b.form.elements._gotcha.value = ''; b.email.value = ' visitor@example.test '; b.ui.feats.push('outfit-styled');
  await b.form.emit('submit'); assert.equal(b.requests.length,1);
  const {url,options} = b.requests[0];
  assert.equal(url,'https://formspree.io/f/mbggaaqo'); assert.equal(options.method,'POST');
  assert.equal(options.body.get('email'),'visitor@example.test');
  assert.match(options.body.get('newsletter_consent'),/j’accepte/);
  assert.equal(options.body.get('language'),'fr'); assert.ok(options.body.get('consent_at'));
  assert.equal(options.body.has('feats'),false); assert.equal(options.body.has('discovered'),false);
  assert.equal(b.form.hidden,true); assert.equal(b.email.value,'');
  assert.equal(JSON.stringify([...b.storage]).includes('visitor@'),false);
  assert.equal(JSON.parse(b.storage.get(KEY)).requested,true);
  await b.form.emit('submit'); assert.equal(b.requests.length,1);
});
test('server and network errors keep the email for retry without claiming success', async () => {
  for (const request of [async () => ({ok:false}),async () => { throw Error('offline'); }]) {
    const b = browser({request}); b.email.value = 'visitor@example.test';
    await b.form.emit('submit'); assert.equal(b.email.value,'visitor@example.test');
    assert.equal(b.form.hidden,false); assert.equal(b.dialog.querySelector('[type="submit"]').disabled,false);
    assert.match(b.dialog.querySelector('#nn-status').textContent,/n’a pas abouti/);
    assert.notEqual(JSON.parse(b.storage.get(KEY) || '{}').requested,true);
  }
});
test('pending requests cannot double-submit and time out into a retryable error', async () => {
  const b = browser({request:options => new Promise((resolve,reject) => options.signal.addEventListener('abort',() => reject(Error('timeout'))))});
  b.email.value = 'visitor@example.test'; const pending = b.form.emit('submit');
  assert.equal(b.dialog.querySelector('[type="submit"]').disabled,true);
  await b.form.emit('submit'); assert.equal(b.requests.length,1);
  b.expire(); await pending;
  assert.equal(b.dialog.querySelector('[type="submit"]').disabled,false);
  assert.equal(b.email.value,'visitor@example.test'); assert.equal(b.form.hidden,false);
});
test('language changes retain the address; blocked storage still allows one successful request', async () => {
  const b = browser({blockedStorage:true}); b.env.NanaNewsletter.open(); b.email.value = 'visitor@example.test';
  b.document.documentElement.lang = 'en'; b.emit('portfolio-language-change');
  assert.equal(b.email.value,'visitor@example.test');
  assert.match(b.dialog.querySelector('#nn-title').textContent,/little letter/);
  await b.form.emit('submit'); assert.equal(b.requests[0].options.body.get('language'),'en');
  assert.match(b.requests[0].options.body.get('newsletter_consent'),/I agree/);
  assert.equal(b.form.hidden,true); assert.equal(b.storage.size,0);
});
test('an accepted request in another tab suppresses this invitation', () => {
  const b = browser(); b.ui.feats.push('rested'); b.advance(60); assert.equal(b.note.hidden,false);
  b.storage.set(KEY,JSON.stringify({seen:true,requested:true})); b.emit('storage',{key:KEY});
  assert.equal(b.note.hidden,true); b.env.NanaNewsletter.open(); assert.equal(b.form.hidden,true);
});
