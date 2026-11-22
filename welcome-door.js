(() => {
  if (new URLSearchParams(location.search).get('chambreV2') !== '1') return;
  const welcome = document.querySelector('#welcome');
  const panel = welcome.querySelector('.welcome-panel');
  const screen = document.createElement('div');
  screen.className = 'door-screen';
  screen.setAttribute('data-no-translate','');
  screen.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 3072 1732\" aria-label=\"Nana’s Room\">\n<image href=\"assets/accueil-v2/wall.webp\" x=\"0\" y=\"0\" width=\"3072\" height=\"1732\" class=\"art-wall\"/>\n<image class=\"behind\" x=\"342\" y=\"0\" width=\"1686\" height=\"1732\" preserveAspectRatio=\"xMidYMid slice\"/>\n<g class=\"leaf\"><image href=\"assets/accueil-v2/door.webp\" x=\"337\" y=\"0\" width=\"1693\" height=\"1732\" class=\"art-door\"/><image href=\"assets/accueil-v2/mood-fr.webp\" x=\"603\" y=\"606\" width=\"1203\" height=\"189\" class=\"art-mood-fr\"/><image href=\"assets/accueil-v2/mood-en.webp\" x=\"632\" y=\"602\" width=\"1162\" height=\"190\" class=\"art-mood-en\"/>\n<text x=\"1200\" y=\"511\" text-anchor=\"middle\" class=\"signature\"></text>\n<image href=\"assets/accueil-v2/charm.webp\" x=\"1712\" y=\"1343\" width=\"89\" height=\"234\" class=\"art-charm\"/><image href=\"assets/accueil-v2/handle.webp\" x=\"1515\" y=\"1319\" width=\"345\" height=\"79\" class=\"art-handle\"/>\n<a href=\"#/play\" data-entry=\"play\" aria-label=\"Play\"><rect x=\"540\" y=\"787\" width=\"605\" height=\"501\"/></a>\n<a href=\"#/work\" data-entry=\"work\" aria-label=\"Work\"><rect x=\"1200\" y=\"789\" width=\"778\" height=\"471\"/></a></g>\n<g class=\"shop-position\"><a href=\"#/shop\" data-entry=\"shop\" aria-label=\"Boutique\"><g class=\"card\"><image href=\"assets/accueil-v2/postcard.webp\" x=\"2180\" y=\"450\" width=\"727\" height=\"627\" class=\"art-postcard\"/><image href=\"assets/accueil-v2/shop-fr.webp\" x=\"2455\" y=\"948\" width=\"260\" height=\"62\" class=\"art-shop-fr\"/><image href=\"assets/accueil-v2/shop-en.webp\" x=\"2519\" y=\"956\" width=\"131\" height=\"46\" class=\"art-shop-en\"/></g><image href=\"assets/accueil-v2/pin.webp\" x=\"2506\" y=\"436\" width=\"48\" height=\"80\" class=\"art-pin\"/></a></g></svg>";
  welcome.append(screen);
  screen.append(panel.querySelector('.welcome-language'));
  const scene = screen.querySelector('svg');
  const portrait = matchMedia('(orientation:portrait)');
  function layout() {
    scene.setAttribute('viewBox', portrait.matches ? '220 -180 1940 2700' : '0 0 3072 1732');
  }
  function language() {
    const english = document.documentElement.lang.startsWith('en');
    screen.lang = english ? 'en' : 'fr';
    const title = english ? 'Portfolio by Léna de Firmas' : 'Portfolio de Léna de Firmas';
    screen.querySelector('.signature').textContent = title;
    document.title = title;
    screen.querySelector('[data-entry="shop"]').setAttribute('aria-label', english ? 'Shop' : 'Boutique');
  }
  layout(); language();
  portrait.addEventListener('change', layout);
  new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  let busy = false;
  screen.addEventListener('click', async event => {
    const link = event.target.closest('[data-entry]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    if (busy) return;
    busy = true;
    const target = link.dataset.entry;
    const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate) {
      if(target !== 'shop') screen.querySelector('.behind').setAttribute('href','assets/room-redraw/apercu-jour.webp');
      screen.classList.add(target === 'shop' ? 'shop' : 'open');
      await new Promise(resolve => setTimeout(resolve, target === 'shop' ? 450 : 650));
    }
    if(target === 'shop') panel.querySelector('#postcard-shop-preview').click();
    else {
      panel.querySelector('[data-mode="'+(animate ? 'play' : target)+'"]').click();
      if(animate && target === 'work') requestAnimationFrame(() => requestAnimationFrame(() => panel.querySelector('[data-mode="work"]').click()));
    }
    screen.classList.remove('open','shop');
    busy = false;
  });
})();