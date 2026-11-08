/* Resolve public room links against the same apps and hotspots used by the room. */
(() => {
  const q = selector => document.querySelector(selector);
  const visible = selector => q(selector + ':not([hidden])');
  const notify = () => document.dispatchEvent(new Event('nana-route-change'));
  const appRoutes = new Map();
  for (const name of ['finder','illustration','social','interactive','contact','mail','help',
    'gearnews-series','phone','reading-room','souvenues','pages','motion']) {
    appRoutes.set('objet/' + name, name);
  }
  for (const name of ['coloring','bead-box','word-lab','latte','tamagotchi','do-nothing','mimilab']) {
    appRoutes.set('jeu/' + name, name);
  }
  appRoutes.set('jeu/dressing', 'dressup');
  appRoutes.set('objet/carte-pokemon', 'about');
  appRoutes.set('jeux', 'mini-games');
  appRoutes.set('livre/la-princesse-clown', 'book');

  const routeByApp = new Map([...appRoutes].map(([route, app]) => [app, route]));
  const aliases = new Map(Object.entries({
    'fenetre/projets':'objet/finder', 'fenetre/illustration':'objet/illustration',
    'fenetre/social':'objet/social', 'fenetre/interactive':'objet/interactive', 'fenetre/articles':'objet/pages',
    'fenetre/a-propos':'objet/carte-pokemon', 'fenetre/contact':'objet/contact', 'fenetre/mail':'objet/mail',
    'fenetre/aide':'objet/help', 'fenetre/bibliotheque':'objet/reading-room', 'fenetre/souvenues':'objet/souvenues',
    'fenetre/gearnews':'objet/gearnews-series', 'telephone/contacts':'objet/phone/contacts',
    'telephone/mail':'objet/phone/mail', 'objet/postit':'objet/post-it', 'objet/dressing':'jeu/dressing',
    'objet/photos':'illustrations', 'objet/do-nothing':'jeu/do-nothing', 'jeu/dressup':'jeu/dressing',
    'objet/about':'objet/carte-pokemon', 'objet/dressup':'jeu/dressing',
    'objet/mini-games':'jeux', 'objet/word-lab':'jeu/word-lab', 'objet/coloring':'jeu/coloring',
    'objet/boite-a-souvenirs':'secret/boite-a-souvenirs', 'objet/bead-box':'jeu/bead-box', 'objet/rug-secret':'objet/tapis', 'objet/twist-reality':'objet/bretzel',
    'objet/music':'objet/marshall', 'objet/typewriter':'objet/machine-a-ecrire', 'objet/iphone':'objet/phone',
    'objet/ring-light':'objet/gearnews-series', 'objet/cds':'objet/music-visuals', 'objet/miroir':'jeu/dressing',
    'objet/rilakkuma':'jeu/do-nothing', 'jeu/rilakkuma':'jeu/do-nothing', 'objet/work-zoom':'objet/imac',
    'objet/livres-1':'objet/reading-room', 'objet/livres-2':'objet/souvenues', 'objet/livres-3':'jeu/word-lab',
    'objet/fortune-cookie':'jeu/fortune-cookie', 'objet/latte':'jeu/latte', 'objet/tamagotchi':'jeu/tamagotchi',
    'objet/book':'livre/la-princesse-clown', 'objet/instax':'photos', 'objet/fleurs':'illustrations',
    'objet/polaroids':'photos', 'objet/mimilab':'jeu/mimilab', 'objet/mirror':'jeu/dressing',
    'objet/flower-lamp':'objet/lampe-fleur', 'objet/wall-lamp':'objet/lampe-fleur'
  }));
  const normalize = route => aliases.get(route) || route;
  const workObjects = new Map([['objet/post-it','postit'],['objet/corbeille','trash']]);
  const sceneObjects = new Set(['chat','guitare','vase','miffy','sonny-angel','guirlande','jelly','lampe-bureau',
    'bambi-lampe','lampe-fleur','ipad','cv','tapis','bretzel','crayons-1','crayons-2','crayons-3','fortune-cookie']);
  const objectRoute = id => id === 'fortune-cookie' ? 'jeu/fortune-cookie' : 'objet/' + id;
  const sceneId = route => {
    const id = route.split('/')[1];
    return sceneObjects.has(id) && objectRoute(id) === route ? id : null;
  };
  const lamps = new Set(['guirlande','jelly','lampe-bureau','bambi-lampe','lampe-fleur']);
  const isPencil = id => id?.startsWith('crayons-');
  let selected = null, pending = null;

  function hotspot(id) {
    if (id === 'lampe-fleur') return q('#wall-lamp-hit');
    if (id === 'fortune-cookie') return q('#nana-fortune-cookie [data-open]');
    return window.NANA_ROOM_ZONES?.find(zone => zone.id === id)?.element;
  }
  function clickHotspot(element) {
    // SVG polygons have no HTMLElement.click() in Safari and Chromium.
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }
  function revealObject() {
    if (!pending || pending !== selected) return;
    const hit = hotspot(pending);
    if (!hit) return; // Room silhouettes are decoded in batches.
    const id = pending;
    pending = null;
    hit.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});
    hit.focus({preventScroll:true});
    // The existing focus outline identifies lamps and the iPad. Opening a link
    // to a lamp preserves the visitor's current day/night setting.
    if (!lamps.has(id) && !['ipad','cv'].includes(id) && (id !== 'tapis' || !q('#nana-rug-secret.is-open'))) {
      clickHotspot(hit);
    }
    notify();
  }
  window.addEventListener('nana-room-zones-ready', revealObject);
  function clearSelection() { selected = null; pending = null; }
  function mode(raw) {
    const route = normalize(raw);
    if (raw.startsWith('fenetre/') || route === 'objet/machine-a-ecrire' || route === 'objet/imac' || workObjects.has(route)) return 'work';
    if (route==='secret/boite-a-souvenirs' || sceneId(route)) return 'play';
    return null;
  }
  function open(raw) {
    const route = normalize(raw);
    if (route === 'photos' || route === 'illustrations' || route === 'objet/gabzilla') {
      return !!window.NanaArtLinks?.open(route);
    }
    const outfit=/^jeu\/dressing\/tenue\/([a-z-]+)$/.exec(route);
    if(outfit && window.NanaProgress?.outfits.some(x=>x.id===outfit[1])){window.openAbout(outfit[1]);return true;}
    if(route==='secret/boite-a-souvenirs')return !!window.NanaMemoryBox?.open();
    const appName = appRoutes.get(route);
    if (appName) { window.openApp(appName); return true; }
    if (route === 'objet/phone/contacts' || route === 'objet/phone/mail') {
      window.showPhone();
      if (route.endsWith('/mail')) window.phoneMail(); else window.phoneContacts();
      return true;
    }
    if (route === 'objet/marshall') { window.showMusic(false); return true; }
    if (route === 'objet/music-visuals') {
      const hit = q('#hotspots [data-mv-open]');
      if (hit) clickHotspot(hit);
      return !!hit;
    }
    if (route === 'objet/machine-a-ecrire') { window.NanaTypewriter.open(); return true; }
    if (route === 'objet/imac') { window.chooseMode('work', false); return true; }
    if (workObjects.has(route)) {
      const button = q('.desk-extra[data-object="' + workObjects.get(route) + '"]');
      button?.click();
      return !!button;
    }
    const id = sceneId(route);
    if (!id) return false;
    selected = pending = id;
    revealObject();
    return true;
  }

  function current() {
    if(q('#nana-memory-box[open]'))return window.NanaMemoryBox?.current();
    if (visible('#work-break-nudge')) return 'objet/machine-a-ecrire';
    if (q('#nana-dreamlab-overlay')) return 'jeu/mimilab';
    if (visible('#coloring-overlay')) return isPencil(selected) ? objectRoute(selected) : 'jeu/coloring';
    if (visible('#special-shade')) {
      if (q('#special-host .phone-device')) {
        if (visible('#phone-page')) return q('#phone-mail-form') ? 'objet/phone/mail' : 'objet/phone/contacts';
        return 'objet/phone';
      }
      const dressing=q('#special-host iframe[src^="about-me.html"]');
      if(dressing){const outfit=new URL(dressing.src,location.href).searchParams.get('outfit');return 'jeu/dressing'+(outfit?'/tenue/'+outfit:'');}
      if (q('#special-host .tama-frame')) return 'jeu/tamagotchi';
      if (q('#special-host .latte-frame')) return 'jeu/latte';
      return null;
    }
    if (visible('#window-shade')) {
      const type = q('#window').dataset.windowType;
      if (type === 'literary') {
        if (q('.lit-reading')) return 'objet/reading-room';
        if (q('.lit-souvenues')) return 'objet/souvenues';
        if (q('.lit-lab')) return 'jeu/word-lab';
      }
      const app = {'work-about':'about','music-visual-design':'music-visuals','pages-library':'pages'}[type] || type;
      return app === 'music-visuals' ? 'objet/music-visuals' : routeByApp.get(app) || null;
    }
    const desk = visible('.desk-panel');
    if (desk && q('#app.mode-work')) return desk.dataset.object === 'trash' ? 'objet/corbeille' : 'objet/post-it';
    if(q('#app.mode-play')&&window.NanaMemoryBox?.current())return window.NanaMemoryBox.current();
    if (q('#app.mode-play') && selected && !isPencil(selected)) return objectRoute(selected);
    return visible('#player') ? 'objet/marshall' : null;
  }

  function closeExtras() {
    if (selected && document.activeElement === hotspot(selected)) document.activeElement?.blur();
    if (selected === 'fortune-cookie' && q('#toast')) q('#toast').hidden = true;
    if (selected === 'miffy' || selected === 'sonny-angel') {
      const bubble = q('.figurine-speech');
      if (bubble) bubble.hidden = true;
    }
    clearSelection();
    window.NanaMemoryBox?.close();
    window.NanaTypewriter?.close();
    window.NanaDreamLab?.close();
    window.NanaColoring?.close();
    if (q('#app.nana-reality-active')) window.NanaTwistReality?.close();
    if (q('#nana-rug-secret.is-open') && hotspot('tapis')) clickHotspot(hotspot('tapis'));
    if (visible('#player')) q('#player-hide').click();
    if (visible('.desk-panel')) q('.desk-panel').hidden = true;
    clearSelection();
  }

  // Capture interactions before individual SVG handlers stop propagation.
  window.addEventListener('click', event => {
    const target = event.target;
    const zone = target.closest?.('[data-room-zone-id]');
    const id = target.closest?.('#nana-fortune-cookie') ? 'fortune-cookie' :
      target.closest?.('#wall-lamp-hit') ? 'lampe-fleur' : zone?.dataset.roomZoneId;
    if (sceneObjects.has(id)) {
      selected = id === 'tapis' && q('#nana-rug-secret.is-open') ? null : id;
      pending = null;
      queueMicrotask(notify);
    } else if (target.closest?.('#play-scene,[data-open],#switch-mode,#menu-mode,#home-menu,#back-to-room,#nana-untwist,#coloring-close,[data-mode],.desk-extra')) {
      if (selected) { clearSelection(); queueMicrotask(notify); }
    }
  }, true);
  // Escape dismisses a shared in-room interaction before leaving the room.
  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !selected || isPencil(selected) || !q('#app.mode-play')) return;
    const route = current();
    if (route !== objectRoute(selected)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    closeExtras(); notify();
  }, true);
  // Independent overlays can close from inside an iframe.
  for (const event of ['nana-dreamlab-open','nana-dreamlab-close']) document.addEventListener(event, notify);
  window.NanaRoomLinks = {open, current, closeExtras, mode};
})();

