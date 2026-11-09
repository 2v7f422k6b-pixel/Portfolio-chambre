import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source = readFileSync(new URL('../play-pan-hint.js', import.meta.url), 'utf8');
const key = 'nana-room-tour-seen-v1';

function setup({mobile = true, reduced = false, storage = new Map(), route = 'room', decode, blocked = false, lang = 'fr'} = {}) {
  class Target {
    listeners = new Map();
    addEventListener(type, fn) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(fn);
    }
    removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
    dispatch(type) { for (const fn of [...(this.listeners.get(type) || [])]) fn({type}); }
  }
  const doc = new Target(), win = new Target(), motion = new Target();
  motion.matches = reduced;
  let mode = 'play', modeChanged, position = 0, maxSeen = 0, now = 0, id = 0;
  const frames = new Map(), timers = new Map(), nodes = new Map();
  const viewport = new Target();
  Object.assign(viewport, {hidden:false, clientWidth:390, clientHeight:804, scrollWidth:1425});
  Object.defineProperty(viewport, 'scrollLeft', {
    get:() => position,
    set:value => { position = value; maxSeen = Math.max(maxSeen, value); }
  });
  const scene = {offsetWidth:1425, offsetHeight:804};
  nodes.set('app', {classList:{contains:name => name === 'mode-' + mode}});
  nodes.set('play-viewport', viewport);
  nodes.set('play-scene', scene);
  for (const name of ['room-img', 'room-night', 'marseille-day', 'marseille-night']) {
    nodes.set(name, {complete:true, naturalWidth:1670, decode:decode || (() => Promise.resolve())});
  }
  doc.documentElement = {lang, dataset:{theme:'day'}};
  doc.hidden = false;
  doc.head = {appendChild() {}};
  doc.body = {appendChild:node => nodes.set(node.id, node)};
  doc.getElementById = name => nodes.get(name);
  doc.querySelector = () => null;
  doc.createElement = () => {
    const label = {};
    return {classList:{add() {}}, setAttribute() {}, querySelector:() => label,
      remove() { nodes.delete(this.id); }};
  };
  win.matchMedia = query => query.includes('reduced-motion') ? motion : {matches:mobile};
  win.NanaDeepLinks = {current:() => route};
  const sandbox = {
    document:doc, window:win,
    navigator:{userAgent:mobile ? 'iPhone' : 'Desktop', platform:mobile ? 'iPhone' : 'Linux', maxTouchPoints:mobile ? 5 : 0},
    localStorage:{
      getItem:name => { if (blocked) throw Error('unavailable'); return storage.get(name); },
      setItem:(name, value) => { if (blocked) throw Error('unavailable'); storage.set(name, value); }
    },
    requestAnimationFrame:fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame:frame => frames.delete(frame),
    setTimeout:(fn, delay) => { timers.set(++id, {fn, at:now + delay}); return id; },
    clearTimeout:timer => timers.delete(timer),
    MutationObserver:class { constructor(fn) { modeChanged = fn; } observe() {} }
  };
  vm.runInNewContext(source, sandbox);
  async function advance(duration) {
    for (let elapsed = 0; elapsed < duration; elapsed += 16) {
      now += 16;
      const pending = [...frames.values()]; frames.clear();
      pending.forEach(fn => fn(now));
      for (const [timer, value] of timers) if (value.at <= now) { timers.delete(timer); value.fn(); }
      await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    }
  }
  return {advance, doc, win, motion, viewport, storage,
    position:() => position, maxSeen:() => maxSeen,
    hint:() => nodes.get('nana-play-pan-hint'),
    changeMode(value) { mode = value; viewport.hidden = mode !== 'play'; modeChanged(); }
  };
}

test('first mobile entry reveals the far edge, returns home, then explains the gesture', async () => {
  const page = setup();
  await page.advance(1200);
  assert.ok(page.position() > 0);
  assert.equal(page.hint(), undefined);
  await page.advance(2400);
  assert.ok(page.maxSeen() >= 1034);
  assert.equal(page.position(), 0);
  assert.equal(page.hint().querySelector().textContent, 'Fais glisser pour explorer');
  assert.equal(page.storage.get(key), '1');
  page.changeMode('work'); page.changeMode('play');
  await page.advance(1000);
  assert.equal(page.position(), 0);
  assert.ok(page.hint());
});

test('subsequent visits keep the hint without replaying the tour', async () => {
  const page = setup({storage:new Map([[key, '1']]), lang:'en'});
  await page.advance(2000);
  assert.equal(page.position(), 0);
  assert.equal(page.hint().querySelector().textContent, 'Swipe to explore');
});

for (const input of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
  test(`${input} stops immediately without snapping back or showing an overlay`, async () => {
    const page = setup();
    await page.advance(1200);
    const stopped = page.position();
    assert.ok(stopped > 0);
    page.doc.dispatch(input);
    await page.advance(4000);
    assert.equal(page.position(), stopped);
    assert.equal(page.hint(), undefined);
    assert.equal(page.doc.listeners.get(input).size, 0);
  });
}

test('reduced motion and desktop never pan automatically', async () => {
  for (const options of [{reduced:true}, {mobile:false}]) {
    const page = setup(options);
    await page.advance(3600);
    assert.equal(page.maxSeen(), 0);
    assert.ok(page.hint());
    assert.equal(page.storage.get(key), undefined);
  }
});

test('opening a direct object link does not move the room behind the object', async () => {
  const page = setup({route:'secret/boite-a-souvenirs'});
  await page.advance(3600);
  assert.equal(page.maxSeen(), 0);
  assert.equal(page.hint(), undefined);
  assert.equal(page.storage.get(key), undefined);
});

test('waits for artwork and cancels pending work when leaving Play', async () => {
  let loaded;
  const loading = new Promise(resolve => { loaded = resolve; });
  const page = setup({decode:() => loading});
  await page.advance(1000);
  assert.equal(page.maxSeen(), 0);
  assert.equal(page.storage.get(key), undefined);
  page.changeMode('work'); loaded();
  await page.advance(4000);
  assert.equal(page.maxSeen(), 0);
  assert.equal(page.hint(), undefined);
});

test('orientation changes stop the tour at its current position', async () => {
  const page = setup();
  await page.advance(1000);
  const stopped = page.position();
  page.win.dispatch('resize');
  await page.advance(4000);
  assert.equal(page.position(), stopped);
});

test('unavailable browser storage still remembers the tour for the current page', async () => {
  const page = setup({blocked:true});
  await page.advance(3600);
  page.changeMode('work'); page.changeMode('play');
  await page.advance(1000);
  assert.equal(page.position(), 0);
  assert.ok(page.hint());
});
