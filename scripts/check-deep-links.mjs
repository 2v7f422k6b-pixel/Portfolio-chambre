import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const router = source('nana-deep-links.js');
const base = 'https://nana.test/Portfolio-chambre/';
const card = 'objet/carte-pokemon';
const drawing = 'illu/swans-lotus';

function browser(initial = '', {savedSession, loadingGallery = false} = {}) {
  const location = new URL(initial, base);
  const ui = {mode:null, panel:null, extra:null, shop:null, copied:null, toasts:[], modeChanges:[]};
  const listeners = new Map(), timers = new Map();
  const listen = (event, fn) => listeners.set(event, [...listeners.get(event) || [], fn]);
  const emit = event => listeners.get(event)?.forEach(fn => fn());
  const entries = [{href:location.href, state:null}];
  let position = 0, timerId = 0;
  function write(replace, state, url) {
    location.href = new URL(url, location);
    if (!replace) entries.splice(++position);
    entries[position] = {href:location.href, state};
  }
  function traverse(offset) {
    position += offset;
    location.href = entries[position].href;
    emit('popstate');
    emit('hashchange');
  }
  const app = {classList:{contains:name => name === 'mode-' + ui.mode}};
  const document = {
    readyState:'loading', body:{}, documentElement:{lang:'en',dataset:{theme:'night'}},
    getElementById:() => app, querySelector:() => null, addEventListener:listen
  };
  const room = {
    current:() => ui.extra, mode:() => null, closeExtras:() => { ui.extra = null; },
    open(route) { if (route !== card) return false; ui.extra = route; return true; }
  };
  const art = {
    current:() => ui.panel,
    open(route) {
      if (route !== drawing && route !== 'illu/18') return false;
      ui.panel = loadingGallery ? 'illustrations' : drawing;
      return true;
    }
  };
  const env = {
    URL, URLSearchParams, location, document, app, shade:{}, specialShade:{},
    history:{get state() { return entries[position].state; },
      pushState:(state,title,url) => write(false,state,url), replaceState:(state,title,url) => write(true,state,url)},
    MutationObserver:class {observe() {}},
    addEventListener:listen, setTimeout:fn => {timers.set(++timerId, fn); return timerId;}, clearTimeout:id => timers.delete(id),
    navigator:{clipboard:{writeText:async text => {ui.copied = text;}}},
    chooseMode:value => {ui.modeChanges.push(value); ui.mode = value; ui.panel = null;},
    returnToWelcome:() => {ui.mode = ui.panel = null;},
    closeWindow:() => {ui.panel = null;}, closeSpecial() {}, showToast:message => ui.toasts.push(message),
    NanaRoomLinks:room, NanaArtLinks:art,
    NanaShop:{current:() => ui.shop, open:route => {ui.shop = route;}, close:() => {ui.shop = null;}},
    NanaBookLinks:{current:() => null, open:() => false}, NanaPagesLinks:{current:() => null, open:() => false}
  };
  env.window = env;
  if (savedSession) {
    env.sessionStorage = {getItem:() => JSON.stringify(savedSession)};
    const appJs = source('app.js');
    const start = appJs.indexOf('/* Restore the current room after a browser refresh');
    assert.ok(start >= 0);
    vm.runInNewContext(appJs.slice(start), env);
  }
  vm.runInNewContext(router, env);
  emit('DOMContentLoaded');
  function flush() {
    const queue = [...timers.values()];
    timers.clear();
    queue.forEach(fn => fn());
  }
  return {ui, location, document, entries, router:env.NanaDeepLinks, emit, flush, traverse,
    close:() => {env.closeWindow(); room.closeExtras(); emit('click'); flush();}};
}

test('opening and closing views makes Back and Forward restore exactly one entry each', () => {
  const b = browser('#/room');
  b.router.open(card);
  b.router.open(drawing);
  b.close();
  assert.deepEqual(b.entries.map(e => new URL(e.href).hash), ['#/room','#/'+card,'#/'+drawing,'#/room']);
  for (const [offset, expected] of [[-1,drawing],[-1,card],[-1,'room'],[1,card],[1,drawing],[1,'room']]) {
    b.traverse(offset); b.flush();
    assert.equal(b.router.current(), expected);
  }
  assert.equal(b.entries.length, 4);
});

test('aliases resolve to the actual creation and copied links omit editor/session flags', async () => {
  const b = browser('?editor=1#/illu/18', {savedSession:{mode:'work',open:'phone',lang:'fr',theme:'day'}});
  assert.equal(b.router.current(), drawing);
  assert.equal(b.ui.mode, 'play');
  assert.deepEqual(b.ui.modeChanges, ['play']);
  assert.equal(b.document.documentElement.lang, 'en');
  assert.equal(b.document.documentElement.dataset.theme, 'night');
  assert.equal(await b.router.copy(), base+'#/'+drawing);
  assert.equal(b.ui.copied, base+'#/'+drawing);
  b.emit('nana-route-change'); b.flush();
  assert.equal(b.entries.length, 1);
});

test('the gallery resolving after initial navigation keeps its requested history entry', () => {
  const b = browser('#/'+drawing, {loadingGallery:true});
  assert.equal(b.router.current(), 'illustrations');
  b.ui.panel = drawing;
  b.emit('nana-route-change'); b.flush();
  assert.equal(b.router.current(), drawing);
  assert.equal(b.entries.length, 1);
  b.document.documentElement.lang = 'fr';
  b.document.documentElement.dataset.theme = 'day';
  b.emit('click'); b.flush();
  assert.equal(b.entries.length, 1);
});

test('programmatic re-entry recovers a closed view before queued close sync fires', () => {
  const b = browser('#/'+drawing);
  b.ui.panel = null;
  b.emit('nana-route-change');
  b.router.open(drawing);
  b.flush();
  assert.equal(b.router.current(), drawing);
  assert.equal(b.entries.length, 1);
});

test('an old UI notification cannot append an entry after browser Back', () => {
  const b = browser('#/work');
  b.router.open(card);
  b.router.open('shop/la-princesse-clown');
  b.emit('click');
  b.traverse(-1); b.flush();
  assert.equal(b.router.current(), card);
  assert.equal(b.ui.mode, 'work');
  assert.equal(b.entries.length, 3);
  b.traverse(1);
  assert.equal(b.router.current(), 'shop/la-princesse-clown');
});

test('malformed and unknown hashes fall back to the room without adding an entry', () => {
  for (const route of ['#/%E0%A4','#/unknown']) {
    const b = browser(route);
    assert.equal(b.router.current(), 'room');
    assert.equal(b.location.hash, '#/room');
    assert.equal(b.ui.toasts.length, 1);
    assert.equal(b.entries.length, 1);
  }
});

test('published illustrations and Gabzilla images round-trip by file name, even after reordering', () => {
  const ctx = {
    document: {addEventListener(){}, querySelector:() => null, getElementById:() => ({hidden:false})},
    currentWindow:'gallery', currentGallery:null
  };
  ctx.window = ctx;
  ctx.openGallery = (which,index) => { ctx.currentGallery = {which,index}; };
  // Load the real catalog, including the artist's titles and original file names.
  vm.runInNewContext(source('app.js').split('const $ = selector')[0] +
    '\nwindow.artworkLists = [ART, GABZILLA];', ctx);
  vm.runInNewContext(source('nana-art-links.js'),ctx);
  for (const [group, items] of ctx.artworkLists.entries()) {
    const routes = items.map((_,index) => {
      ctx.openGallery(group ? 'gabzilla' : 'art', index);
      return ctx.NanaArtLinks.current();
    });
    assert.equal(new Set(routes).size, items.length);
    const reordered = Array.from(items).reverse();
    items.splice(0,items.length,...reordered);
    for (const [index,route] of routes.entries()) {
      assert.equal(ctx.NanaArtLinks.open(route),true);
      assert.equal(ctx.currentGallery.index,items.length-1-index);
      assert.equal(ctx.NanaArtLinks.current(),route);
    }
  }
  assert.equal(ctx.NanaArtLinks.open('illu/bubbles'),true);
  assert.equal(ctx.NanaArtLinks.current(),'illu/soap-bubbles');
  assert.equal(ctx.NanaArtLinks.open('illu/missing-image'),false);
  assert.equal(ctx.NanaArtLinks.open('illu/999'),false);
});

test('every public shop product keeps its old URL and appears in both link directories', () => {
  const window = {};
  for (const file of ['shop-book-catalog.js', 'shop-products.js']) {
    vm.runInNewContext(source(file), {window});
  }
  const catalog = window.NanaShopCatalog;
  for (const language of ['fr','en']) {
    const entries = catalog.entries(language);
    const routes = new Set(entries.map(entry => entry.route));
    assert.equal(routes.size, entries.length, 'duplicate shop route');
    for (const product of catalog.products) {
      const route = catalog.productRoute(product.id);
      assert.ok(routes.has(route), product.id);
      assert.equal(catalog.canonical('shop/'+product.id), route);
      const entry = entries.find(item => item.route === route);
      assert.ok(entry.title.includes(product[language]), route);
    }
  }
});
