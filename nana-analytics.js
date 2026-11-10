/* Aggregate counters only: no visitor ID, cookies, history, creations or free text. */
(() => {
  'use strict';
  if (window.NanaAnalytics) return;
  try { if (parent !== window && parent.NanaAnalytics) {
    window.NanaAnalytics = parent.NanaAnalytics; return;
  } } catch (_) {}
  const pages = ['room','shop','dressing','mimilab','latte','tamagotchi','polaroids','coloring'];
  const games = ['dressing','latte','tamagotchi','coloring','bead-box','do-nothing','word-lab','mimilab','fortune-cookie'];
  const objects = ['miffy','reading-room','souvenues','marshall','music-visuals','phone','gabzilla','gearnews-series','imac','lampe-fleur',
    'cds','iphone','book','rilakkuma','guitare','ring-light','chat','instax','vase','guirlande','jelly','crayons-1','crayons-2','crayons-3',
    'livres-1','livres-2','livres-3','lampe-bureau','ipad','tapis','bambi-lampe','sonny-angel','bretzel','cv'];
  const allowed = new Set([
    ...pages.map(x=>'page/'+x), ...games.map(x=>'visit/jeu/'+x), ...objects.map(x=>'visit/objet/'+x),
    'visit/night','visit/photos','visit/livre/la-princesse-clown',
    ...['look-saved','latte-made','beads-made','minilab-composed','rested','outfit-styled','polaroids-all'].map(x=>'action/'+x)
  ]);
  const KEY = 'nana-statistics-disabled-v1';
  const seen = new Set();
  let sent = 0, disabled = false;
  try { disabled = localStorage.getItem(KEY) === '1'; } catch (_) {}
  function excluded() {
    const flags = new URLSearchParams(location.search);
    let editing = false;
    try { editing = sessionStorage.getItem('nana-admin-session-v1') === '1'; } catch (_) {}
    return disabled || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true || editing ||
      window.NanaProgress?.suppressed() ||
      ['previewReward','posterEdit','lampEdit','starsEdit','cookieEdit','ipadClockEdit','zones','look-preview'].some(k => flags.has(k));
  }
  function endpoint() {
    try { const url = new URL(window.NANA_ANALYTICS_ENDPOINT);
      return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash ? url.href : null;
    } catch (_) { return null; }
  }
  function count(event, once = true) {
    if (!allowed.has(event) || excluded() || !endpoint() || sent >= 100 || (once && seen.has(event))) return;
    seen.add(event); sent++;
    // Only the fixed counter name leaves the browser. Never retry or queue history.
    try { fetch(endpoint(), {method:'POST', body:event, credentials:'omit', referrerPolicy:'no-referrer', keepalive:true,
      headers:{'Content-Type':'text/plain'}, cache:'no-store'}).catch(() => {}); } catch (_) {}
  }
  window.NanaAnalytics = {
    count,
    active: () => !!endpoint() && !excluded(),
    disabled: () => disabled,
    setDisabled(value) {
      disabled = !!value;
      try { if (disabled) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (_) {}
    }
  };
  window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) {
    try { disabled = localStorage.getItem(KEY) === '1'; } catch (_) { disabled = true; }
  } });
  const path = location.pathname.replace(/\/$/, '/index.html').split('/').slice(-2).join('/');
  const page = {'latte/index.html':'latte','tamagotchi/index.html':'tamagotchi','polaroids/index.html':'polaroids',
    'coloring-book/index.html':'coloring'}[path] ||
    {'index.html':'room','shop.html':'shop','about-me.html':'dressing','dreamlab.html':'mimilab'}[location.pathname.split('/').pop() || 'index.html'];
  if (page) count('page/' + page);
})();
