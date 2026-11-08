/* Keep the address bar, browser history and the room's visible content in sync. */
(() => {
  'use strict';

  const mode = () => document.getElementById('app').classList.contains('mode-work') ? 'work'
    : document.getElementById('app').classList.contains('mode-play') ? 'play' : null;
  const homeRoute = () => mode() === 'work' ? 'work' : mode() === 'play' ? 'room' : '';
  const isShop = route => route === 'shop' || route.startsWith('shop/');

  let lastView, lastHash, scheduled, ready = false;
  const parse = () => {
    try { return decodeURIComponent(location.hash.slice(2)).replace(/^\/+|\/+$/g, ''); }
    catch { return null; }
  };
  const hashFor = route => route ? '#/' + route.split('/').map(encodeURIComponent).join('/') : '';

  function visibleRoute() {
    const journal = window.NanaJournal?.current();
    if (journal) return journal;
    const shop = window.NanaShop?.current();
    if (shop) return shop;
    if (!mode()) return '';
    const room = window.NanaRoomLinks?.current();
    // These independent dialogs can sit on top of the main artwork window.
    if (document.querySelector('#work-break-nudge:not([hidden]),#nana-dreamlab-overlay,#coloring-overlay:not([hidden])') && room) return room;
    if (document.getElementById('nana-link-index')?.isConnected) return 'liens';
    return window.NanaArtLinks?.current() || window.NanaMediaLinks?.current() || window.NanaLiterary?.route?.() ||
      window.NanaBookLinks?.current() || window.NanaPagesLinks?.current() || room || homeRoute();
  }
  function write(route, method) {
    window.NanaProgress?.visit(route);
    const url = location.pathname + location.search + hashFor(route);
    history[method]({...history.state, nanaMode:mode()}, '', url);
    lastHash = location.hash;
  }
  function sync() {
    if (!ready || scheduled !== undefined) return;
    scheduled = setTimeout(() => {
      scheduled = undefined;
      // The browser may already have moved to an entry we haven't rendered yet.
      if (location.hash !== lastHash) return;
      const route = visibleRoute();
      window.NanaProgress?.visit(route);
      if (route === lastView) return;
      lastView = route;
      if (hashFor(route) !== location.hash) write(route, 'pushState');
    }, 0);
  }

  function display(route, entryMode) {
    clearTimeout(scheduled);
    scheduled = undefined;
    const rooms = window.NanaRoomLinks;
    if (!/^carnet(?:\/|$)/.test(route || '')) window.NanaJournal?.close();
    if (!route || route === 'accueil') {
      window.NanaShop?.close();
      rooms?.closeExtras();
      returnToWelcome();
      return true;
    }
    if (!isShop(route)) window.NanaShop?.close();
    const targetMode = route === 'work' ? 'work' : /^(room|chambre|play)$/.test(route) ? 'play'
      : rooms?.mode(route) || entryMode || mode() || 'play';
    if (targetMode !== mode()) chooseMode(targetMode, false);

    if (/^carnet(?:\/|$)/.test(route)) {
      closeWindow(); closeSpecial(); rooms?.closeExtras();
      return !!window.NanaJournal?.open(route.split('/')[1] || 'chambre');
    }
    if (isShop(route)) {
      if (!window.NanaShop?.current()) {
        rooms?.closeExtras();
        closeWindow();
        closeSpecial();
      }
      window.NanaShop?.open(route);
      return true;
    }
    rooms?.closeExtras();
    if (/^(room|chambre|play|work)$/.test(route)) {
      closeWindow();
      closeSpecial();
      return true;
    }
    if (route === 'liens') { window.NanaLinkDirectory.open(); return true; }
    if (window.NanaArtLinks?.open(route) || window.NanaMediaLinks?.open(route) || window.NanaLiterary?.openRoute?.(route) ||
        window.NanaBookLinks?.open(route) || window.NanaPagesLinks?.open(route)) return true;

    closeWindow();
    closeSpecial();
    if (rooms?.open(route)) return true;
    showToast(document.documentElement.lang === 'en' ? 'This link is unknown. Welcome to my room!' : 'Ce lien est inconnu. Bienvenue dans ma chambre !');
    return false;
  }

  function fromAddress() {
    if (!ready || lastHash === location.hash) return;
    const route = location.hash.startsWith('#/') ? parse() : '';
    const ok = display(route === null ? 'invalid-link' : route, history.state?.nanaMode);
    lastView = visibleRoute();
    window.NanaProgress?.visit(lastView);
    lastHash = location.hash;
    if (!ok) write(homeRoute(), 'replaceState');
    else if (history.state?.nanaMode !== mode()) {
      history.replaceState({...history.state, nanaMode:mode()}, '', location.href);
    }
  }
  function open(route) {
    if (typeof route !== 'string') return;
    route = route.replace(/^#?\/?/, '').replace(/\/+$/, '');
    if (hashFor(route) === location.hash && visibleRoute() === route) return;
    const ok = display(route);
    lastView = visibleRoute();
    window.NanaProgress?.visit(lastView);
    const target = ok ? route : homeRoute();
    if (hashFor(target) !== location.hash) write(target, 'pushState');
    else lastHash = location.hash;
  }
  async function copy() {
    // Never share placement-editor or preview flags from the owner's session.
    const route = visibleRoute();
    const url = new URL(location.pathname, location.origin);
    url.hash = hashFor(route);
    const value = url.href;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const focus = document.activeElement;
      const input = document.createElement('textarea');
      input.value = value;
      input.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      (document.querySelector('dialog[open]') || document.body).append(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } finally { input.remove(); focus?.focus({preventScroll:true}); }
      if (!copied) {
        window.prompt(document.documentElement.lang === 'en' ? 'Copy this link' : 'Copie ce lien', value);
        return null;
      }
    }
    return value;
  }
  window.NanaDeepLinks = {open, copy, sync, current:visibleRoute, entries:() => window.NanaLinkDirectory.entries(),
    record:sync, recordApp:sync, recordWindow:sync, recordGallery:sync};

  function start() {
    ready = true;
    if (location.hash.startsWith('#/')) fromAddress();
    else if (!location.hash && new URLSearchParams(location.search).get('typewriterTest') === '1') {
      write('objet/machine-a-ecrire', 'replaceState');
      lastHash = undefined;
      fromAddress();
    } else {
      lastHash = location.hash;
      lastView = visibleRoute();
      window.NanaProgress?.visit(lastView);
      if (!lastHash && lastView) write(lastView, 'replaceState');
    }
    // Apps may be opened by search, keyboard shortcuts, or a message from a game.
    const observer = new MutationObserver(sync);
    for (const selector of ['#app','#window-shade','#window','#special-shade','#player','#work-break-nudge','#coloring-overlay','.desk-panel']) {
      const node = document.querySelector(selector);
      if (node) observer.observe(node, {attributes:true, attributeFilter:['hidden','class','data-window-type']});
    }
    observer.observe(document.body, {childList:true});
    document.addEventListener('click', sync, true);
    document.addEventListener('keydown', sync, true);
    document.addEventListener('nana-route-change', sync);
    window.addEventListener('hashchange', fromAddress);
    window.addEventListener('popstate', fromAddress);
  }
  if (document.readyState === 'loading' || document.readyState === 'interactive') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else start();
})();
