/* Mount the original-resolution cutouts together after their artwork is ready. */
(async () => {
  'use strict';
  const scene = document.getElementById('play-scene');
  const hotspots = document.getElementById('hotspots');
  if (!scene || !hotspots) return;
  const folder = 'assets/room-redraw/';
  function loadImage(file) {
    const image = new Image();
    image.src = folder + file;
    return image.decode().then(() => image);
  }
  const response = await fetch(folder + 'objets.svg?v=mer-1');
  if (!response.ok) throw new Error('Room drawing unavailable');
  const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') throw new Error('Invalid room drawing');
  const [underlay] = await Promise.all([
    loadImage('fond-mouvements.webp?v=van12'), loadImage('objets-jour.webp'), loadImage('kero-visages.webp'),
    loadImage('miroir.webp'), loadImage('lampe-fleur.webp'), loadImage('cinq-objets.webp'), loadImage('calques-personnages.webp')
  ]);
  underlay.id = 'room-v2-underlay';
  underlay.dataset.roomV2Layer = '';
  underlay.alt = '';
  underlay.draggable = false;
  const responseArt = document.getElementById('cat-response');
  if (responseArt) svg.querySelector('[data-cat-effects]').append(responseArt);
  const officeWords = svg.querySelector('[data-object="office"] .office-words');
  // Isolated iPad comparison. Keep lamp coordinates fixed in the room while
  // limiting the filter output to each object's bounds.
  const localLighting = new URLSearchParams(location.search).get('renduNuit') === 'local';
  const bakedLighting = !localLighting;
  if (bakedLighting) {
    const folderNight = folder + 'nuit-objets/';
    const pieces = folderNight + 'pieces/';
    // Each moving part has its own room-sized crop. Keep the original masks
    // and hit targets, and avoid updating an atlas inside a SVG <use> tree.
    const nightImages = [];
    for (const use of svg.querySelectorAll('svg[viewBox] > use')) {
      const crop = use.parentNode;
      if (crop.parentNode === svg || crop.closest('mask, .v2-ferry, [data-hand]')) continue;
      const ref = use.getAttribute('href');
      if (!['#v2-atlas','#five-atlas','#character-art','#v2-cookie-parts'].includes(ref)) continue;
      const [u,v] = crop.getAttribute('viewBox').split(/\s+/);
      const image = document.createElementNS(svg.namespaceURI,'image');
      for (const attr of ['x','y','width','height']) image.setAttribute(attr,crop.getAttribute(attr) || '0');
      image.setAttribute('pointer-events','none');
      image.classList.add('v2-piece-night');
      crop.classList.add('v2-piece-day');
      crop.after(image);
      const nightUrl = crop.parentNode.classList.contains('clock-shake')
        ? folderNight + 'reveil-nuit-jelly.webp'
        : pieces + ref.slice(1) + '-' + u + '-' + v + '.webp';
      nightImages.push([image, nightUrl]);
    }
    const textures = Array.from(svg.querySelectorAll('#v2-van-visual, .v2-kero-faces'), image => {
      const day = image.getAttribute('href');
      return { image, day, night: folderNight + day.split('/').pop() };
    });
    const sceneRoot = scene.closest('#play-viewport');
    sceneRoot.classList.add('v2-baked-test');
    for (const image of scene.querySelectorAll('#paprika-butterfly .butterfly-night')) {
      const file = image.dataset.resourceSrc.match(/IMG_(\d+)\.png$/);
      if (!file) continue;
      const url = pieces + 'paprika-' + file[1] + '.webp';
      if (window.NanaResources) window.NanaResources.setSource(image,url,{theme:'night'});
      else image.src = url;
    }
    const handDrawing = svg.querySelector('[data-hand="hour"]').parentNode;
    const handMask = svg.querySelector('#sailor-hand-mask');
    const nightHands = svg.querySelector('#sailor-night-hands');
    let requested = false;
    function syncTextures() {
      const night = document.documentElement.dataset.theme === 'night';
      if (night) {
        handMask.appendChild(handDrawing);
        nightHands.removeAttribute('display');
      } else {
        nightHands.setAttribute('display','none');
        nightHands.before(handDrawing);
      }
      if (night && !requested) {
        requested = true;
        for (const [image,url] of nightImages) image.setAttribute('href',url);
      }
      for (const texture of textures) texture.image.setAttribute('href', night ? texture.night : texture.day);
    }
    syncTextures();
    new MutationObserver(syncTextures).observe(document.documentElement, {
      attributes:true, attributeFilter:['data-theme']
    });
    const cushion = svg.querySelector('[data-object="happy-berry"]');
    cushion.appendChild(cushion.querySelector('.v2-hit'));
    svg.classList.add('v2-baked-lighting');
    const rules = document.createElement('style');
    rules.textContent = `
      .v2-baked-lighting .clock-shake .v2-clock-reflection { display:none; }
      .v2-piece-night { display:none; }
      #play-scene > .v2-sky-sparkles { display:none; position:absolute; pointer-events:none; mask-repeat:no-repeat; -webkit-mask-repeat:no-repeat; }
      html[data-theme="night"] #play-scene[data-landscape="marseille"] > .v2-sky-sparkles { display:block; }
      .v2-sky-sparkles img { position:absolute; pointer-events:none; will-change:transform,opacity; animation:window-star-twinkle 3.6s ease-in-out infinite; }
      .v2-sky-sparkles img:nth-child(2n) { animation-delay:-1.7s; }
      .v2-sky-sparkles img:nth-child(3n) { animation-delay:-3.4s; }
      .v2-sky-sparkles img:nth-child(5n) { animation-duration:6.2s; }
      @media(prefers-reduced-motion:reduce) { .v2-sky-sparkles img { animation:none; } }
      html[data-theme="night"] .v2-baked-lighting .v2-piece-day { display:none; }
      html[data-theme="night"] .v2-baked-lighting .v2-piece-night { display:inline; }
      html[data-theme="night"] #play-viewport.v2-baked-test #paprika-butterfly,
      html[data-theme="night"] #play-viewport.room-redraw-preview #room-v2-ambient.v2-baked-lighting { filter:none; }
      html[data-theme="night"] .v2-baked-lighting :is([data-object="office"] > rect:not(.v2-hit), [data-object="office"] > g, [data-cat-effects]) { filter:url(#room-v2-night-ink); }
      html[data-theme="night"] .v2-baked-test #window-life .outside-day,
      html:not([data-theme="night"]) .v2-baked-test #window-life .outside-night { display:none; }
      @media (hover:none) {
        #room-v2-ambient.v2-baked-lighting [data-object="happy-berry"]:not(:focus-visible) .v2-hit { stroke:none; }
        #room-v2-ambient.v2-baked-lighting [data-object="happy-berry"]:not(:focus-visible) { outline:none; }
      }
    `;
    document.head.appendChild(rules);
  }
  if (localLighting) {
    const filter = document.getElementById('room-v2-lit-objects').cloneNode(true);
    filter.id = 'v2-local-lamp-light';
    filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
    const spill = filter.querySelector('feImage');
    spill.setAttribute('x', '0');
    spill.setAttribute('y', '0');
    spill.setAttribute('width', '3072');
    spill.setAttribute('height', '1732');
    svg.querySelector('defs').appendChild(filter);
    for (const object of Array.from(svg.children)) {
      if (object.localName !== 'g') continue;
      if (!object.querySelector('image, use, text') && !object.hasAttribute('data-cat-effects')) continue;
      const region = document.createElementNS(svg.namespaceURI, 'g');
      region.classList.add('v2-local-light');
      object.before(region);
      region.appendChild(object);
    }
    svg.classList.add('v2-local-lighting');
    const rules = document.createElement('style');
    rules.textContent = `
      html[data-theme="night"] #play-viewport.room-redraw-preview #room-v2-ambient.v2-local-lighting { filter:none; }
      html[data-theme="night"] #room-v2-ambient.v2-local-lighting > .v2-local-light { filter:url(#v2-local-lamp-light); }
    `;
    document.head.appendChild(rules);
  }
  scene.append(underlay, svg);
  hotspots.dataset.roomV2Layer = '';

  // Each crop stores its room position, atlas position and dimensions.
  const kodamaCrops = [[[2569, 1487, 0, 147, 51, 148], [2567, 1424, 53, 147, 78, 75]], [[199, 1488, 133, 147, 58, 135], [181, 1409, 193, 147, 90, 85]], [[601, 1046, 285, 147, 96, 94], [609, 968, 383, 147, 79, 115]], [[2012, 1265, 464, 147, 68, 134], [2001, 1189, 534, 147, 94, 90]], [[2543, 568, 630, 147, 59, 72], [2546, 529, 691, 147, 49, 60]]];
  const kodamaLayer = document.getElementById('kodama-layer');
  const percent = (value, total) => (100 * value / total) + '%';
  kodamaLayer.querySelectorAll('.kodama').forEach((button, index) => {
    const parts = kodamaCrops[index];
    const left = Math.min(...parts.map(p => p[0]));
    const top = Math.min(...parts.map(p => p[1]));
    const width = Math.max(...parts.map(p => p[0] + p[4])) - left;
    const height = Math.max(...parts.map(p => p[1] + p[5])) - top;
    Object.assign(button.style, {left: percent(left, 3072), top: percent(top, 1732),
      width: percent(width, 3072), height: percent(height, 1732)});
    button.querySelectorAll('.sprite-part').forEach((part, i) => {
      const [x, y, atlasX, atlasY, w, h] = parts[i];
      part.replaceChildren();
      Object.assign(part.style, {left: percent(x-left, width), top: percent(y-top, height),
        width: percent(w,width), height: percent(h,height), opacity: '.85',
        backgroundImage: 'url(assets/room-redraw/calques-personnages.webp)',
        backgroundSize: percent(768,w) + ' ' + percent(453,h),
        backgroundPosition: percent(atlasX,768-w) + ' ' + percent(atlasY,453-h)});
    });
  });
  kodamaLayer.dataset.roomV2Layer = '';

  const windowLife = scene.querySelector('#window-life');
  if (localLighting || bakedLighting) {
    // Alpha bounds of masque-ciel.png on its 1536 × 866 source canvas.
    const x = 867, y = 9, width = 213, height = 241;
    const w = 1536, h = 866;
    windowLife.setAttribute('viewBox', [x*1670/w, y*942/h, width*1670/w, height*942/h].join(' '));
    const maskSize = percent(w,width) + ' ' + percent(h,height);
    const maskPosition = percent(x,w-width) + ' ' + percent(y,h-height);
    Object.assign(windowLife.style, {
      inset:'auto', left:percent(x,w), top:percent(y,h),
      width:percent(width,w), height:percent(height,h), overflow:'hidden',
      webkitMaskSize:maskSize, maskSize, webkitMaskPosition:maskPosition, maskPosition
    });
  }
  const stars = windowLife.querySelectorAll('.night-star');
  const skyPoints = [[950,83],[978,142],[1144,89],[1126,55],[946,210],
    [1146,193],[1001,207],[1061,164],[981,121],[1069,111]];
  let skyStars;
  if (bakedLighting) {
    skyStars = document.createElement('div');
    skyStars.className = 'v2-sky-sparkles';
    skyStars.dataset.roomV2Layer = '';
    skyStars.setAttribute('aria-hidden','true');
    skyStars.style.cssText = windowLife.style.cssText;
    skyStars.style.zIndex = getComputedStyle(windowLife).zIndex;
    const skyMask = 'url("assets/room-redraw/masque-ciel.png")';
    skyStars.style.webkitMaskImage = skyMask;
    skyStars.style.maskImage = skyMask;
    windowLife.before(skyStars);
  }
  stars.forEach((star, i) => {
    if (bakedLighting) {
      const [x,y] = skyPoints[i];
      const box = windowLife.viewBox.baseVal;
      const img = new Image();
      img.alt = '';
      img.src = folder + 'nuit-objets/ciel-' + String(i+1).padStart(2,'0') + '.webp';
      Object.assign(img.style, {
        left:percent(x-8-box.x,box.width), top:percent(y-8-box.y,box.height),
        width:percent(Number(star.getAttribute('width'))+16,box.width),
        height:percent(Number(star.getAttribute('height'))+16,box.height)
      });
      skyStars.appendChild(img);
      star.remove();
      return;
    }
    star.setAttribute('x',skyPoints[i][0]); star.setAttribute('y',skyPoints[i][1]);
  });
  const ns = 'http://www.w3.org/2000/svg';
  const streak = windowLife.querySelector('.shooting-star');
  const meteor = document.createElementNS(ns,'g');
  meteor.classList.add('v2-meteor');
  meteor.setAttribute('role','button');
  meteor.setAttribute('tabindex','0');
  const labelMeteor = () => meteor.setAttribute('aria-label',document.documentElement.lang === 'en' ? 'Catch the shooting star' : 'Attraper l’étoile filante');
  labelMeteor();
  document.addEventListener('portfolio-language-change',labelMeteor);
  windowLife.removeAttribute('aria-hidden');
  streak.replaceWith(meteor);
  streak.removeAttribute('class');
  const hit = document.createElementNS(ns,'rect');
  for(const [node,x,y,size] of [[streak,1115,56,31],[hit,1101,42,60]]) {
    node.setAttribute('x',x);node.setAttribute('y',y);
    node.setAttribute('width',size);node.setAttribute('height',size);
  }
  hit.setAttribute('fill','transparent');
  meteor.append(streak,hit);
  const catchMeteor = event => {
    if(event.type === 'keydown' && !['Enter',' '].includes(event.key)) return;
    if(document.documentElement.dataset.theme !== 'night' || meteor.classList.contains('caught')) return;
    event.preventDefault();event.stopPropagation();
    window.NanaProgress?.feat('shooting-star-encounter');
    meteor.classList.add('caught');
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) setTimeout(()=>meteor.classList.remove('caught'),25000);
  };
  meteor.addEventListener('click',catchMeteor);
  meteor.addEventListener('keydown',catchMeteor);
  meteor.addEventListener('animationiteration',()=>meteor.classList.remove('caught'));

  const labels = [...svg.querySelectorAll('[data-label-en]')];
  for (const item of labels) item.dataset.labelFr = item.getAttribute('aria-label');
  function setLabels() {
    const english = document.documentElement.lang === 'en';
    for (const item of labels) item.setAttribute('aria-label', english ? item.dataset.labelEn : item.dataset.labelFr);
  }
  setLabels();
  document.addEventListener('portfolio-language-change', setLabels);

  const hands = Object.fromEntries(Array.from(svg.querySelectorAll('[data-hand]'), el => [el.dataset.hand, el]));
  const desertTemplate = document.getElementById('v2-desert-template');
  desertTemplate.replaceWith(desertTemplate.content);
  const parisWindow = scene.querySelector('#v2-paris');
  const previewSparkles = new URLSearchParams(location.search).get('scintillement') === '1';
  function showTime() {
    const now = new Date();
    // Paris is always a whole number of hours ahead of UTC.
    parisWindow.toggleAttribute('data-sparkling', previewSparkles || now.getUTCMinutes() < 5);
    const s = now.getSeconds(), m = now.getMinutes() + s / 60;
    hands.hour.setAttribute('transform', `rotate(${(now.getHours() % 12 + m / 60) * 30 + 110} 490 692)`);
    hands.minute.setAttribute('transform', `rotate(${m * 6 - 107} 490 692)`);
    hands.second.setAttribute('transform', `translate(-1 -5) rotate(${s * 6 + 133} 491 697)`);
  }
  let clock;
  function syncClock() {
    clearInterval(clock);
    if (!document.hidden) {
      showTime();
      clock = setInterval(showTime, 1000);
    }
  }
  document.addEventListener('visibilitychange', syncClock);
  window.addEventListener('pageshow', syncClock);
  window.addEventListener('pagehide', () => clearInterval(clock));
  syncClock();

  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  function motion(node, frames, duration, origin, fill = 'none') {
    node.getAnimations().forEach(a => a.cancel());
    if (origin) {
      node.style.transformBox = 'view-box';
      node.style.transformOrigin = origin;
    }
    if (quiet.matches && fill === 'none') return;
    return node.animate(frames, {duration: quiet.matches ? 0 : duration, easing:'ease-in-out', fill});
  }
  const turns = (...angles) => angles.map(angle => ({transform:'rotate(' + angle + 'deg)'}));
  function shy() {
    motion(svg.querySelector('.kokeshi-tilt'), turns(0,-11,-9,0), 1500, '2865px 166px');
  }
  svg.querySelector('[data-object="kokeshi"]').addEventListener('pointerenter', e => {
    if (e.pointerType !== 'touch') shy();
  });
  const nightDust = document.getElementById('desert-night-dust');
  // display:none removes it from observation in daytime, Marseille and reduced motion.
  const dustUrl = folder + 'rafale-lilas.webp';
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!nightDust.hasAttribute('src')) nightDust.src = dustUrl;
      } else {
        nightDust.removeAttribute('src');
      }
    }).observe(nightDust);
  } else {
    nightDust.src = dustUrl;
  }
  const wheel = svg.querySelector('.landscape-wheel');
  const landscape = new URLSearchParams(location.search).get('landscape');
  const landscapes = ['marseille', 'japon', 'pink', 'paris'];
  let dialAngle = landscape === 'desert-rose' ? 180 : landscape === 'paris' ? 270 : landscape === 'japon' ? 90 : 0;
  function showLandscape() {
    scene.dataset.landscape = landscapes[(dialAngle % 360) / 90];
  }
  wheel.style.transformBox = 'view-box';
  wheel.style.transformOrigin = '1931px 990px';
  wheel.style.transform = 'rotate(' + dialAngle + 'deg)';
  showLandscape();
  const windowArt = {
    marseille: '#v2-marseille-hiver',
    japon: '#v2-japan',
    paris: '#v2-paris',
    pink: '#v2-desert'
  };
  const windowEffects = {
    marseille: '#window-life, #ufo-window-layer, .v2-ferry, .v2-sky-sparkles',
    japon: null,
    pink: '#desert-night-dust, #desert-window-light'
  };
  function visibleEffects(place) {
    return windowEffects[place]
      ? [...scene.querySelectorAll(windowEffects[place])].filter(el => getComputedStyle(el).display !== 'none')
      : [];
  }
  function blendWindows(spin) {
    const previous = scene.dataset.landscape;
    const oldArt = scene.querySelector(windowArt[previous]);
    const oldLayers = [oldArt, ...visibleEffects(previous)];
    const oldDisplay = oldLayers.map(el => getComputedStyle(el).display);
    const animations = [];
    function fade(el, from, to) {
      animations.push(el.animate([{opacity:from}, {opacity:to}], {
        delay:1150, duration:550, easing:'ease-in-out', fill:'both'
      }));
    }
    // Reveal the destination underneath the outgoing painting while the dial slows.
    oldLayers.forEach((el, i) => { el.style.display = oldDisplay[i]; });
    oldArt.style.zIndex = '5';
    const raised = oldLayers.slice(1).filter(el => el.parentNode === scene && Number(getComputedStyle(el).zIndex) < 5);
    const stacking = raised.map(el => el.style.zIndex);
    raised.forEach(el => { el.style.zIndex = '5'; });
    showLandscape();
    oldLayers.forEach(el => fade(el, 1, 0));
    visibleEffects(scene.dataset.landscape).forEach(el => fade(el, 0, 1));
    spin.onfinish = () => {
      oldLayers.forEach(el => el.style.removeProperty('display'));
      oldArt.style.removeProperty('z-index');
      raised.forEach((el, i) => { el.style.zIndex = stacking[i]; });
      animations.forEach(animation => animation.cancel());
    };
  }
  function spinDial() {
    if (wheel.getAnimations().some(a => a.playState === 'running')) return;
    const start = dialAngle;
    const currentSlot = (start % 360) / 90;
    const steps = landscapes.map((_, step) => step).filter(step =>
      landscapes[(currentSlot + step) % landscapes.length] !== scene.dataset.landscape
    );
    dialAngle = start + 720 + 90 * steps[Math.floor(Math.random() * steps.length)];
    const spin = motion(wheel, turns(start,dialAngle), 1700, '1931px 990px','forwards');
    if (!quiet.matches) blendWindows(spin);
    else spin.onfinish = showLandscape;
  }
  const machine = svg.querySelector('[data-object="gashapon"]');
  const prize = machine.querySelector('.gasha-prize');
  let capsuleState = 'idle';
  function capsuleLabel(open) {
    machine.dataset.labelFr = open ? 'Ouvrir la capsule dans le bac' : 'Tourner la poignée du Gashapon';
    machine.dataset.labelEn = open ? 'Open the capsule in the tray' : 'Turn the capsule machine handle';
    setLabels();
  }
  const collection = window.NanaGacha;
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const historyKey = 'nana-gashapon-draws-v1';
  let history = {counts: {}, last: null};
  function readDraws() {
    try {
      const saved = JSON.parse(localStorage.getItem(historyKey));
      if (saved?.counts) history = saved;
    } catch { /* Keep playing in memory when storage is unavailable. */ }
    const counts = {};
    for (const {id} of collection.figures) {
      const n = history.counts[id];
      counts[id] = Number.isInteger(n) && n > 0 ? Math.min(n, 3) : Number(window.NanaProgress.hasFeat(id));
    }
    return {counts, last: history.last};
  }
  function candidates({counts, last}) {
    const total = Object.values(counts).reduce((sum, n) => sum + 3 - n, 0);
    // Leave enough intervening draws to give out all copies without a repeat.
    const mustDraw = collection.figures.find(f => 3 - counts[f.id] > total / 2);
    return collection.figures.filter(f => counts[f.id] < 3 && f.id !== last && (!mustDraw || f === mustDraw));
  }
  function chooseFigure(pool) {
    const weight = f => f.id === 'charm-gacha-7554' ? 1 : 4;
    let roll = Math.random() * pool.reduce((sum, f) => sum + weight(f), 0);
    return pool.find(f => (roll -= weight(f)) < 0);
  }
  const finishedText = () => document.documentElement.lang === 'en'
    ? 'All 45 figurines collected!' : 'Tu as trouvé les 45 figurines !';
  let color;
  function showCapsule() {
    capsuleState = 'opening';
    const english = document.documentElement.lang === 'en';
    const dialog = document.createElement('dialog');
    dialog.className = 'gacha-reveal';
    dialog.setAttribute('aria-label', english ? 'Capsule' : 'Capsule du gachapon');
    dialog.innerHTML = `<button class="gacha-dismiss" type="button"><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button>
      <p class="gacha-title" hidden></p>
      <button class="gacha-stage" type="button">
        <span class="gacha-closed"><img class="gacha-whole" alt=""></span><img class="gacha-half" alt="">
        <img class="gacha-clear" alt=""><img class="gacha-figure" alt="">
      </button><p class="gacha-caption" role="status"></p>`;
    const close = dialog.querySelector('.gacha-dismiss');
    const stage = dialog.querySelector('.gacha-stage');
    const title = dialog.querySelector('.gacha-title');
    const caption = dialog.querySelector('.gacha-caption');
    const progress = window.NanaProgress;
    const images = [...stage.querySelectorAll('img')];
    [color.closed, color.half, collection.clearHalf].forEach((src,i) => images[i].src = src);
    const prompt = english ? 'Tap the capsule to open it' : 'Touche la capsule pour l’ouvrir';
    stage.setAttribute('aria-label', prompt);
    caption.textContent = prompt;
    close.setAttribute('aria-label', english ? 'Close' : 'Fermer');
    let busy = false;
    const reveal = async () => {
      if (!dialog.open) return;
      const draws = readDraws();
      const pool = candidates(draws);
      if (!pool.length) {
        capsuleState = 'revealed';
        dialog.close();
        window.showToast?.(finishedText());
        return;
      }
      const figure = chooseFigure(pool);
      images[3].src = figure.image;
      try {
        await Promise.all(images.map(image => image.decode()));
      } catch {
        busy = false;
        caption.textContent = english ? 'Tap to retry' : 'Touche la capsule pour réessayer';
        images.filter(image => !image.naturalWidth).forEach(image => image.src = image.src);
        return;
      }
      if (!dialog.open) return;
      const owned = progress.hasFeat(figure.id);
      draws.counts[figure.id]++;
      draws.last = figure.id;
      history = draws;
      try { localStorage.setItem(historyKey, JSON.stringify(draws)); } catch { /* Session only. */ }
      progress.feat(figure.id);
      capsuleState = 'revealed';
      dialog.classList.add('is-open');
      stage.disabled = true;
      const name = english ? figure.en : figure.fr;
      const article = ['Smiski', 'Mofusand fraise', 'Monchhichi'].includes(figure.fr) ? 'un ' : '';
      title.textContent = english ? `Oh, it’s ${name}!` : `Oh, c’est ${article}${name} !`;
      title.hidden = false;
      if (owned) {
        caption.textContent = english ? 'Oh no, you already had this one!' : 'Zut, tu l’avais déjà !';
      } else if (english) {
        caption.textContent = 'Yes, added to your wardrobe!';
      } else {
        const word = {m: 'ajouté', f: 'ajoutée'}[figure.agreement];
        caption.textContent = word ? `Yes, ${word} au dressing !` : 'Yes, figurine ajoutée au dressing !';
      }
      const found = collection.figures.filter(f => draws.counts[f.id] > 0).length;
      const total = collection.figures.length;
      const summary = document.createElement('small');
      summary.textContent = english ? `(You’ve found ${found} of the ${total} different gachapon figurines.)`
        : `(Tu as trouvé ${found} des ${total} figurines différentes du gachapon.)`;
      caption.append(summary);
      if (figure.id === 'charm-gacha-7554') {
        const rarity = document.createElement('small');
        rarity.textContent = english ? 'She’s very rare!' : 'Elle est très rare !';
        title.append(rarity);
        if (!quiet.matches) {
          const colors = ['#ff93b9', '#fff0b0', '#cebbff'];
          for (let i = 0; i < 12; i++) {
            const piece = document.createElement('span');
            piece.className = 'gacha-confetti';
            piece.setAttribute('aria-hidden', 'true');
            piece.style.left = (i % 2 ? 56 + i * 2 : 43 - i * 2) + '%';
            piece.style.top = (33 + i % 4 * 5) + '%';
            piece.style.backgroundColor = colors[i % colors.length];
            piece.style.animationDelay = (i % 4 * 45) + 'ms';
            stage.insertBefore(piece, images[3]);
            piece.addEventListener('animationend', () => piece.remove(), {once:true});
          }
        }
      }
      caption.setAttribute('aria-label', title.textContent + ' ' + caption.textContent);
      close.focus({preventScroll:true});
    };
    stage.onclick = async () => {
      if (busy) return;
      busy = true;
      if (navigator.locks) await navigator.locks.request(historyKey, reveal);
      else await reveal();
    };
    const dismiss = () => dialog.close();
    close.onclick = dismiss;
    dialog.onclick = event => { if (event.target === dialog) dismiss(); };
    dialog.onkeydown = event => { if (event.key === 'Escape') event.stopPropagation(); };
    window.addEventListener('hashchange', dismiss);
    dialog.addEventListener('close', () => {
      window.removeEventListener('hashchange', dismiss);
      dialog.remove();
      if (capsuleState === 'revealed') {
        prize.setAttribute('visibility','hidden');
        capsuleState = 'idle';
        machine.classList.remove('capsule-ready');
        capsuleLabel(false);
      } else capsuleState = 'ready';
      machine.focus({preventScroll:true});
    }, {once:true});
    document.body.append(dialog);
    dialog.showModal();
    stage.focus({preventScroll:true});
  }
  function drawCapsule() {
    if (capsuleState === 'ready') {
      showCapsule();
      return;
    }
    if (capsuleState !== 'idle') return;
    if (!candidates(readDraws()).length) { window.showToast?.(finishedText()); return; }
    capsuleState='mixing';
    motion(machine.querySelector('.gasha-handle'),turns(0,180,360),650,'2412px 875px');
    machine.querySelectorAll('.gasha-ball').forEach((ball,i) => {
      if(quiet.matches)return;
      const dx = i % 2 ? 5 : -5;
      const lift = 5 + i % 3;
      ball.animate([
        {transform:'translate(0,0)'},
        {transform:`translate(${dx}px,-${lift}px)`,offset:0.23},
        {transform:'translate(0,0)',offset:0.46},
        {transform:`translate(${-dx * 0.8}px,-4px)`,offset:0.7},
        {transform:'translate(0,0)'}
      ], {duration:595,delay:(i%4)*24,easing:'ease-in-out'});
    });
    color = pick(collection.colors);
    prize.querySelectorAll('use').forEach(copy => copy.setAttribute('href', '#gasha-capsule-' + color.tray));
    setTimeout(() => {
      prize.setAttribute('visibility','visible');
      motion(prize,[{transform:'translateY(-28px)',opacity:0},{transform:'translateY(3px)',opacity:1},{transform:'none',opacity:1}],600);
      capsuleState='ready'; machine.classList.add('capsule-ready'); capsuleLabel(true);
    },quiet.matches?0:700);
  }

  // Coordinates use an 800 × 451 view of the room drawing. Colour checks
  // separate overlapping silhouettes inside each piece of furniture.
  async function seaLightMap(art, width, height, phase, signal) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (art) ctx.drawImage(art, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height);
    const data = pixels.data;
    let sliceStart = performance.now();
    for (let y = 0; y < height; y++) {
      if (y % 4 === 0 && performance.now() - sliceStart >= 5) {
        if (globalThis.scheduler?.yield) await globalThis.scheduler.yield();
        else await new Promise(resolve => setTimeout(resolve, 0));
        if (signal.aborted) return null;
        sliceStart = performance.now();
      }
      const Y = 451 * y / height;
      for (let x = 0; x < width; x++) {
        const X = 800 * x / width;
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        if (art && !data[i+3]) continue;
        let u = X / 42, v = Y / 22, strength = .83;
        const wall = r > 245 && g > 240 && b < g - 8;
        if (!art) {
          u = x / width * 3.6;
          v = y / height * 3.1 + .6 * Math.sin(Math.PI * x / width);
        } else if (wall && Y < 370) {
          // The two wall planes meet at the drawn vertical corner.
          v += (X < 279 ? -.32 : .15) * u;
          if (X >= 279) u = 1.18*u + 3.2;
        } else if (X > 449 && X < 568 && Y < 235) {
          // Broad oblique shafts on the window glass.
          u = X / 74;
          v = (X + .63 * Y) / 17;
          strength = .65;
        } else if (((X > 404 && X < 453) || (X > 570 && X < 614)) && Y < 354 && r > g + 40) {
          u = X / 32;
          v = Y / 24 + 1.35 * Math.sin(X / 3.3);
        } else if (X < 450 && Y > 277 && ((r > 238 && b > g + 7) || (b > r + 15 && r > g + 18))) {
          // Quilt crest, turned-down side and the draped purple blanket.
          const turn = Y - (346 - .10*X + 13*Math.sin(X/92));
          u = X / 39 + .009*Y;
          v = Y / 14 + .55*Math.sin(X/10 + Y/28) + Math.max(0,turn) * -.034;
          if (b > r) v += 2.6;
          strength = 1;
        } else if (X > 600 && X < 734 && Y > 248 && Y < 353 && g > r && g > b + 12) {
          u = X / 38;
          v = Y / 18 + .0013*(X-665)**2;
        } else if (Y > 344 && X > 333 && X < 608 && Y < 411 && b >= r && g > 145) {
          u = X / 48;
          v = (Y - .15*X) / 9;
        } else if (Y > 334 && (r > g && g > b && r-g < 75 || Y > 400 && X > 300 && X < 640)) {
          // Foreshorten the pattern towards the back of the parquet.
          const depth = .58 + (Y-334)/122;
          u = (X-400) / (52*depth);
          v = 13 / depth + .14*u;
        } else {
          // Local curvature on smaller drawings and shelf edges.
          u += (r-b)/86;
          v += (g-b)/68 + .75*Math.sin(X/19);
          strength = .72;
        }
        u += phase;
        v += phase * .57;
        const a = u + .56*Math.sin(1.7*v + .44*u) + .21*Math.sin(2.4*u - v);
        const c = v + .72*Math.sin(1.4*u - .3*v) + .25*Math.sin(2*v + u);
        const ridge = Math.sin(a + c) + .70*Math.sin(a - 1.3*c + .45*Math.sin(c));
        const glow = .62*Math.exp(-32*ridge*ridge) + .38*Math.exp(-3.1*ridge*ridge);
        const ink = art ? (data[i+3]/255) * Math.min(1, g/162) ** 2 : 1;
        // Tint the receiving surface first so even ivory paint can catch white light.
        const highlight = Math.min(1, strength * glow);
        const water = art ? (wall ? .59 : .22) : 0;
        const alpha = highlight + water * (1-highlight);
        const white = alpha ? highlight/alpha : 0;
        data[i] = 58 + 197*white;
        data[i+1] = 211 + 42*white;
        data[i+2] = 220 + 15*white;
        data[i+3] = 255 * ink * alpha;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
  }

  const seaFadeMs = 5000;
  const seaSurfaceMaps = new WeakMap();
  async function lightSeaSurfaces(signal) {
    const maps = [];
    for (const art of [document.getElementById('room-redraw-preview'), underlay]) {
      if (!art?.naturalWidth) continue;
      let map = seaSurfaceMaps.get(art);
      if (!map || map.dataset.source !== art.currentSrc) {
        const source = art.currentSrc;
        map = await seaLightMap(art, 1152, 650, 0, signal);
        if (signal.aborted) return;
        if (source !== art.currentSrc) continue;
        map.dataset.source = art.currentSrc;
        seaSurfaceMaps.set(art, map);
      }
      map.className = 'sea-surface-light';
      map.dataset.roomV2Layer = '';
      map.setAttribute('aria-hidden', 'true');
      map.style.zIndex = getComputedStyle(art).zIndex;
      maps.push({art, map});
    }
    let lightDefs = document.getElementById('v2-sea-light-defs');
    if (!lightDefs) {
      lightDefs = document.createElementNS(ns, 'svg');
      lightDefs.id = 'v2-sea-light-defs';
      lightDefs.setAttribute('width', '0');
      lightDefs.setAttribute('height', '0');
      lightDefs.setAttribute('aria-hidden', 'true');
      lightDefs.style.position = 'absolute';
      const defs = document.createElementNS(ns, 'defs');
      lightDefs.append(defs);
      const filter = document.createElementNS(ns, 'filter');
      filter.id = 'v2-sea-object-light';
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      filter.innerHTML = '<feImage x="0" y="0" width="1" height="1" preserveAspectRatio="none"/><feComponentTransfer><feFuncA type="linear" slope="0"><animate attributeName="slope" from="0" to="1" begin="indefinite" fill="freeze"/></feFuncA></feComponentTransfer><feComposite in2="SourceAlpha" operator="in"/><feComposite in2="SourceGraphic" operator="atop"/>';
      filter.setAttribute('primitiveUnits', 'objectBoundingBox');
      const texture = await seaLightMap(null, 220, 150, 1, signal);
      if (signal.aborted) return;
      filter.querySelector('feImage').setAttribute('href', texture.toDataURL());
      defs.append(filter);
      document.body.append(lightDefs);
    }
    const lightFade = lightDefs.querySelector('animate');
    function fadeObjectLight(from, to, duration) {
      lightFade.setAttribute('from', String(from));
      lightFade.setAttribute('to', String(to));
      lightFade.setAttribute('dur', duration + 'ms');
      lightFade.beginElement();
    }
    fadeObjectLight(0, 1, seaFadeMs);
    for (const {art, map} of maps) {
      if (art.currentSrc === map.dataset.source) art.after(map);
    }
    scene.classList.add('sea-lit');
    return {
      surfaces: maps.map(({map}) => map),
      fadeObjects(duration) {
        fadeObjectLight(lightDefs.querySelector('feFuncA').slope.animVal, 0, duration);
      },
      remove() {
        scene.classList.remove('sea-lit');
        maps.forEach(({map}) => map.remove());
      }
    };
  }

  function pauseSeaBackdrop() {
    const paused = scene.getAnimations({subtree: true}).filter(animation =>
      animation.playState === 'running' &&
      animation.effect?.getTiming().iterations === Infinity &&
      !animation.effect.target?.closest('.sea-surface-light')
    );
    for (const animation of paused) animation.pause();
    const timelines = Array.from(scene.querySelectorAll('svg')).filter(root =>
      !root.ownerSVGElement && root.querySelector('animate, animateTransform, animateMotion') &&
      !root.animationsPaused()
    );
    for (const root of timelines) root.pauseAnimations();
    return () => {
      for (const animation of paused) {
        if (animation.playState === 'paused') animation.play();
      }
      for (const root of timelines) root.unpauseAnimations();
    };
  }

  let seaLayer;
  async function toggleSea() {
    if (seaLayer) { seaLayer.dismiss(); return; }
    const layer = document.createElement('div');
    layer.className = 'v2-sea';
    layer.setAttribute('aria-hidden', 'true');
    const still = quiet.matches;
    const swimmers = ['dauphin', 'poisson', 'manta'].map(name => {
      const fish = new Image();
      fish.alt = '';
      fish.className = 'sea-' + name;
      fish.src = folder + 'mer/' + name + (still ? '-repos' : '') + '.webp';
      if (!still) fish.addEventListener('animationend', () => {
        fish.remove();
        fish.removeAttribute('src');
      }, {once: true});
      layer.append(fish);
      return fish;
    });
    const preparation = new AbortController();
    let timer, lights, resumeBackdrop, enteredAt, leaving = false;
    function dismiss() {
      if (seaLayer !== layer) return;
      preparation.abort();
      clearTimeout(timer);
      lights?.remove();
      resumeBackdrop?.();
      for (const type of guardedEvents) window.removeEventListener(type, guardRoom, true);
      window.removeEventListener('pagehide', dismiss);
      observer.disconnect();
      layer.remove();
      if (seaLayer === layer) seaLayer = null;
    }
    function leave() {
      if (enteredAt === undefined) { dismiss(); return; }
      if (leaving) return;
      leaving = true;
      clearTimeout(timer);
      const duration = Math.max(100, Math.min(seaFadeMs, performance.now() - enteredAt));
      lights.fadeObjects(duration);
      const fades = [layer, ...lights.surfaces].map(node =>
        node.animate([{opacity: getComputedStyle(node).opacity}, {opacity: 0}],
          {duration, easing: 'ease-in-out', fill: 'forwards'}).finished
      );
      Promise.allSettled(fades).then(() => { if (seaLayer === layer) dismiss(); });
    }
    const guardedEvents = [
      'pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout',
      'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'mousemove',
      'click', 'dblclick', 'auxclick', 'contextmenu', 'wheel', 'dragstart',
      'keydown', 'keyup', 'keypress'
    ];
    function guardRoom(event) {
      // Preserve browser shortcuts and the normal touch-to-click sequence.
      if (event.type.startsWith('key') && (event.metaKey || event.ctrlKey || event.altKey)) return;
      const mobile = event.target?.closest?.('[data-object="fish-mobile"]');
      const exitKey = event.type === 'keydown' && !event.repeat &&
        (event.key === 'Escape' || (mobile && ['Enter', ' '].includes(event.key)));
      event.stopImmediatePropagation();
      if (event.cancelable && !(mobile && /^(pointer|mouse|touch)/.test(event.type))) event.preventDefault();
      if (exitKey || (mobile && event.type === 'click')) leave();
    }
    const app = document.getElementById('app');
    const observer = new MutationObserver(() => {
      if (!app.classList.contains('mode-play')) dismiss();
    });
    observer.observe(app, {attributes:true, attributeFilter:['class']});
    layer.dismiss = leave;
    seaLayer = layer;
    for (const type of guardedEvents) {
      window.addEventListener(type, guardRoom, {capture: true, passive: false});
    }
    window.addEventListener('pagehide', dismiss);
    try {
      await Promise.all(swimmers.map(fish => fish.decode()));
      if (seaLayer !== layer) return;
      layer.classList.toggle('sea-still', still);
      lights = await lightSeaSurfaces(preparation.signal);
      if (seaLayer !== layer) { lights?.remove(); return; }
      resumeBackdrop = pauseSeaBackdrop();
      document.body.append(layer);
      enteredAt = performance.now();
      layer.animate([{opacity: 0}, {opacity: 1}], {duration: seaFadeMs, easing: 'ease-in-out', fill: 'both'});
      timer = setTimeout(leave, still ? seaFadeMs + 1500 : 14500);
    } catch { dismiss(); }
  }

  function activate(event) {
    const item = event.target.closest('[data-object], [data-open], [data-room-zone-id]');
    if (!item || (event.type === 'keydown' && !['Enter', ' '].includes(event.key))) return;
    // App links use the same delegated click as the desktop and the journal.
    if (item.hasAttribute('data-open') || item.hasAttribute('data-room-zone-id')) {
      if (event.type === 'click' && item.dataset.roomZoneId === 'gabzilla') window.NanaProgress?.visit('objet/gabzilla');
      if (event.type === 'keydown') {
        event.preventDefault();
        if (!event.repeat) item.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
      }
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;
    if (item.dataset.object === 'night-lamp') document.getElementById('theme-toggle')?.click();
    if (item.dataset.object === 'sailor') {
      const kicks=[[0,0],[-9,-18],[4,12],[-27,-22],[0,16],[-21,24],[0,-19],[-25,-22],[2,18],[-14,15],[0,-10],[-5,6],[0,0]];
      motion(item.querySelector('.clock-shake'), kicks.map(([y,a])=>({transform:'translateY('+y+'px) rotate('+a+'deg)'})), 1900, '487px 734px');
    }
    if (item.dataset.object === 'happy-berry') {
      const found = window.NanaProgress?.hasFeat('gokinjo-happy-berry');
      window.NanaProgress?.visit('objet/happy-berry');
      window.NanaProgress?.feat('gokinjo-happy-berry');
      if (found) window.NanaJournal?.remindOutfit('gokinjo');
      const cushion = item.querySelector('.berry-flight');
      if (!quiet.matches && !cushion.getAnimations().length) {
        motion(cushion, [{transform:'none'}, {transform:'translate(8px,-115px) rotate(-4deg)'},
          {transform:'none'}], 3100, '414px 1100px');
        for (const [name, angle, pivot] of [['left', 22, '380px 1100px'], ['right', -22, '460px 1088px']]) {
          const wing = item.querySelector('.berry-' + name);
          wing.style.transformBox = 'view-box';
          wing.style.transformOrigin = pivot;
          wing.animate(turns(0, angle, -angle/2, 0), {duration: 400, iterations: 7, easing:'ease-in-out'});
        }
      }
    }
    if (item.dataset.object === 'office') {
      motion(officeWords, [
        {transform:'none',opacity:1},{transform:'translateY(-6px)',opacity:0,offset:.28},
        {transform:'translateY(-6px)',opacity:0,offset:.78},{transform:'none',opacity:1}
      ],1450);
    }
    if (['alice-bottle','nana-zola-book'].includes(item.dataset.object)) {
      window.NanaProgress?.feat(item.dataset.object);
    }
    if (item.dataset.object === 'fish-mobile') toggleSea();
    if (item.dataset.object === 'landscape') spinDial();
    if (item.dataset.object === 'gashapon') drawCapsule();
    if (item.dataset.object === 'kokeshi') {
      shy();
      window.NanaProgress?.visit('objet/kokeshi');
      window.NanaProgress?.feat('kokeshi-yukata');
    }
    if (item.dataset.object === 'kero') {
      window.NanaProgress?.visit('objet/kero');
      window.NanaKeroWake?.activate(item);
    }
    if (item.dataset.object === 'plant') window.NanaProgress?.visit('objet/plante-fleur');
    if (item.dataset.object === 'van') {
      const already = window.NanaProgress?.hasFeat('olive-van-started');
      window.NanaProgress?.visit('objet/volkswagen');
      window.NanaProgress?.feat('olive-van-started');
      window.NanaRoomObjectMotion?.play('volkswagen', item);
      if (already) window.NanaJournal?.remindOutfit('little-miss-sunshine');
    }
    if (item.dataset.object === 'dog') {
      window.NanaProgress?.visit('objet/preacher-dog');
      window.NanaProgress?.feat('preacher-dog');
    }
    if (item.dataset.object === 'bell') {
      document.getElementById('nana-kikujiro-chime')?.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    }
  }
  svg.addEventListener('click', activate);
  svg.addEventListener('keydown', activate);
  window.dispatchEvent(new Event('nana-room-v2-ready'));
})().catch(error => console.error('Chambre V2', error));
