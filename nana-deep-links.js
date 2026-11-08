/* Shareable deep links for room objects and gallery entries. */
(() => {
  const prefix = '#/';
  const reserved = new Set(['','room']);
  let navigating = false;
  let lastRoute = '';
  const slug = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const routeFor = name => {
    if (name === 'book') return 'livre/la-princesse-clown';
    if (name === 'photos') return 'illustrations';
    if (name === 'polaroids') return 'photos';
    if (name === 'mini-games') return 'jeux';
    if (['do-nothing','tamagotchi','latte','fortune-cookie','mimilab','dressing'].includes(name)) return 'jeu/' + name;
    return 'objet/' + name;
  };
  const setRoute = route => {
    if(navigating) return;
    const hash = prefix + route;
    if(location.hash === hash) return;
    history.pushState({nanaRoute:route},'',location.pathname+location.search+hash);
    lastRoute = route;
  };
  const findOpener = name => [...document.querySelectorAll('[data-open]')].find(el => el.dataset.open === name);
  const openNamed = name => {
    const el = findOpener(name);
    if (!el) return false;
    el.click();
    return true;
  };
  const parse = () => decodeURIComponent(location.hash.replace(/^#\/?/,'')).replace(/^\//,'');
  const navigate = () => {
    const route = parse();
    if (!route || reserved.has(route)) return;
    if(route === lastRoute) return;
    navigating = true;
    try {
      if(route === 'shop' || route.startsWith('shop/')) {
        const shop = document.getElementById('nana-shop-bag') || document.getElementById('dock-shop');
        shop?.click();
      } else if(route === 'illustrations') openNamed('photos');
      else if(route === 'photos') openNamed('polaroids');
      else if(route === 'jeux') openNamed('mini-games');
      else if(route === 'livre/la-princesse-clown') openNamed('book');
      else if(route.startsWith('illu/')) {
        const index = Number(route.split('/').pop());
        openNamed('photos');
        if(Number.isInteger(index) && index >= 0) setTimeout(() => {
          const tiles = [...document.querySelectorAll('[data-gallery-index],[data-gallery-open],[data-art-index]')];
          (tiles[index] || tiles.find(el => Number(el.dataset.galleryIndex) === index))?.click();
        },180);
      } else if(route.startsWith('objet/') || route.startsWith('jeu/')) openNamed(route.split('/').slice(1).join('/'));
      lastRoute = route;
    } finally { navigating = false; }
  };
  document.addEventListener('click', event => {
    if(navigating || !event.isTrusted) return;
    const opener = event.target.closest('[data-open]');
    if(opener?.dataset.open) {
      setTimeout(() => setRoute(routeFor(opener.dataset.open)),0);
      return;
    }
    if(event.target.closest('#nana-shop-bag,#dock-shop')) { setTimeout(()=>setRoute('shop'),0); return; }
    if(event.target.closest('#window-close,#special-close')) { setTimeout(()=>setRoute('room'),0); return; }
    const gallery = event.target.closest('[data-gallery-index]');
    if(gallery) setTimeout(()=>setRoute('illu/'+gallery.dataset.galleryIndex),0);
  },true);
  window.addEventListener('hashchange',navigate);
  window.addEventListener('popstate',navigate);
  window.addEventListener('load',()=>setTimeout(navigate,300));
  window.NanaDeepLinks = {open:route=>{location.hash='/'+route; navigate();},current:()=>parse(),copy:()=>navigator.clipboard?.writeText(location.href)};
})();
