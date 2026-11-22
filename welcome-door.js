(() => {
  if (new URLSearchParams(location.search).get('chambreV2') !== '1') return;
  const welcome = document.querySelector('#welcome');
  const panel = welcome.querySelector('.welcome-panel');
  const screen = document.createElement('div');
  screen.className = 'door-screen';
  screen.setAttribute('data-no-translate','');
  screen.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 3072 1732\" aria-label=\"Nana’s Room\">\n<image href=\"assets/accueil-v2/wall.webp\" x=\"0\" y=\"0\" width=\"3072\" height=\"1732\" class=\"art-wall\"/>\n<defs><mask id=\"door-opening\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"3072\" height=\"1732\"><rect width=\"3072\" height=\"1732\" style=\"fill:white\"/><rect x=\"350\" width=\"1670\" height=\"1732\" style=\"fill:black\"/></mask></defs>\n<path class=\"jamb-outline\" d=\"M2020 0 C2019 111 2022 185 2020 293 S2019 509 2021 618 S2018 820 2020 964 S2022 1140 2020 1260 S2019 1510 2021 1606 L2020 1732\" fill=\"none\" stroke=\"#ff173b\" stroke-width=\"2.5\"/>\n<g class=\"leaf\"><image href=\"assets/accueil-v2/door.webp\" x=\"337\" y=\"0\" width=\"1693\" height=\"1732\" class=\"art-door\"/><image href=\"assets/accueil-v2/mood-fr.webp\" x=\"603\" y=\"606\" width=\"1203\" height=\"189\" class=\"art-mood-fr\"/><image href=\"assets/accueil-v2/mood-en.webp\" x=\"632\" y=\"602\" width=\"1162\" height=\"190\" class=\"art-mood-en\"/>\n<text x=\"1200\" y=\"511\" text-anchor=\"middle\" class=\"signature\"></text>\n<image href=\"assets/accueil-v2/handle.webp\" x=\"1515\" y=\"1319\" width=\"345\" height=\"79\" class=\"art-handle\"/><image href=\"assets/accueil-v2/charm.webp\" x=\"1712\" y=\"1343\" width=\"89\" height=\"234\" class=\"art-charm\"/>\n<a href=\"#/play\" data-entry=\"play\" aria-label=\"Play\"><rect x=\"540\" y=\"787\" width=\"605\" height=\"501\"/></a>\n<a href=\"#/work\" data-entry=\"work\" aria-label=\"Work\"><rect x=\"1200\" y=\"789\" width=\"778\" height=\"471\"/></a></g>\n<g class=\"shop-position\"><a href=\"#/shop\" data-entry=\"shop\" aria-label=\"Boutique\"><g class=\"card\"><image href=\"assets/accueil-v2/postcard.webp\" x=\"2180\" y=\"450\" width=\"727\" height=\"627\" class=\"art-postcard\"/><image href=\"assets/accueil-v2/shop-fr.webp\" x=\"2455\" y=\"948\" width=\"260\" height=\"62\" class=\"art-shop-fr\"/><image href=\"assets/accueil-v2/shop-en.webp\" x=\"2519\" y=\"956\" width=\"131\" height=\"46\" class=\"art-shop-en\"/></g><image href=\"assets/accueil-v2/pin.webp\" x=\"2506\" y=\"436\" width=\"48\" height=\"80\" class=\"art-pin\"/></a></g></svg>";
  welcome.append(screen);
  screen.append(panel.querySelector('.welcome-language'));
  const scene = screen.querySelector('svg');
  const portrait = matchMedia('(max-aspect-ratio: 6/5)');
  function layout() {
    if (portrait.matches) {
      scene.querySelector('.shop-position').removeAttribute('transform');
      scene.setAttribute('viewBox', '220 -180 1940 2700');
      return;
    }
    const width = 1732 * screen.clientWidth / Math.max(1, screen.clientHeight);
    if (!width || screen.clientHeight === 0) return;
    const left = Math.min(325, (3072 - width) / 2);
    scene.setAttribute('viewBox', [left, 0, width, 1732].join(' '));
    const room = Math.max(0, left + width - 2050);
    const scale = Math.min(1, room / 840);
    const x = Math.min(2180, left + width - 24 - 727 * scale);
    scene.querySelector('.shop-position').setAttribute('transform',
      'translate('+x+' 760) scale('+scale+') translate(-2180 -760)');
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
  new ResizeObserver(layout).observe(screen);
  new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Keep the illustrated SVG for the resting scene. During the swing, give
  // its moving parts real depth in a single HTML perspective coordinate space.
  function buildSwing() {
    const box = scene.viewBox.baseVal;
    const rect = scene.getBoundingClientRect();
    const scale = Math.min(rect.width / box.width, rect.height / box.height);
    const stage = document.createElement('div');
    stage.className = 'swing-stage';
    Object.assign(stage.style, {
      left: ((rect.width - box.width * scale) / 2 - box.x * scale) + 'px',
      top: ((rect.height - box.height * scale) / 2 - box.y * scale) + 'px',
      transform: 'scale(' + scale + ')'
    });
    const slab = document.createElement('div');
    slab.className = 'swing-slab';
    stage.append(slab);
    function plane(contents, depth, extraClass = '') {
      const layer = document.createElement('div');
      layer.className = 'swing-plane ' + extraClass;
      layer.style.transform = 'translateZ(' + depth + 'px)';
      layer.innerHTML = '<svg viewBox="0 0 3072 1732" aria-hidden="true">' + contents + '</svg>';
      slab.append(layer);
    }
    const art = selector => scene.querySelector(selector).outerHTML;
    const edge = document.createElement('div');
    edge.className = 'swing-edge';
    slab.append(edge);
    const back = document.createElement('div');
    back.className = 'swing-back';
    slab.append(back);
    const face = art('.art-door');
    plane(face + art('.art-mood-' + screen.lang) + art('.signature'), 0);
    // The thin relief follows the original drawn borders of both panels.
    const trim = '<clipPath id="raised-door-trim"><path fill-rule="evenodd" clip-rule="evenodd" d="M424 49H1964V1732H1934V80H454V1732H424Z M502 1574H1886V1732H1854V1610H535V1732H502Z"/></clipPath>';
    plane('<defs>' + trim + '</defs><g clip-path="url(#raised-door-trim)">' + face + '</g>', 8);
    // Cross sections of the blue spindle connect the fixed rose to the lever.
    for (let z = 2; z <= 42; z += 4) {
      const ring = document.createElement('i');
      ring.className = 'swing-spindle';
      ring.style.transform = 'translateZ(' + z + 'px)';
      slab.append(ring);
    }
    plane(art('.art-handle'), 46);
    plane('<g class="lever-motion">' + art('.art-charm') + '</g>', 48);
    screen.append(stage);
    return stage;
  }
  async function waitForRoom() {
    // Let the surface loader observe the change of mode and paint the room.
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
    await frame();
    const room = document.getElementById('play-viewport');
    if (room.getAttribute('aria-busy') === 'true') {
      await new Promise(resolve => {
        const finish = () => { observer.disconnect(); clearTimeout(timeout); resolve(); };
        const observer = new MutationObserver(() => {
          if (room.getAttribute('aria-busy') !== 'true') finish();
        });
        const timeout = setTimeout(finish, 16500);
        observer.observe(room, {attributes:true, attributeFilter:['aria-busy']});
      });
    }
    await frame();
  }
  const preview = new Image();
  preview.decoding = 'async';
  preview.src = 'assets/room-redraw/apercu-jour.webp?v=3072';
  let busy = false;
  screen.addEventListener('click', async event => {
    const link = event.target.closest('[data-entry]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    if (busy) return;
    busy = true;
    const target = link.dataset.entry;
    const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (target === 'shop') {
      if (animate) {
        screen.classList.add('shop');
        await new Promise(resolve => setTimeout(resolve, 450));
      }
      panel.querySelector('#postcard-shop-preview').click();
      screen.classList.remove('shop');
    } else if (animate) {
      // Reveal the live room through the doorway as the visitor enters.
      screen.classList.add('preparing');
      document.body.append(screen);
      screen.inert = true;
      panel.querySelector('[data-mode="play"]').click();
      await waitForRoom();
      const stage = buildSwing();
      screen.classList.remove('preparing');
      screen.classList.add('open');
      await new Promise(resolve => setTimeout(resolve, 1680));
      stage.remove();
      welcome.append(screen);
      screen.classList.remove('open');
      screen.inert = false;
      if (target === 'work') panel.querySelector('[data-mode="work"]').click();
    } else {
      panel.querySelector('[data-mode="'+target+'"]').click();
    }
    busy = false;
  });
})();