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
  const response = await fetch(folder + 'objets.svg?v=raccords-1');
  if (!response.ok) throw new Error('Room drawing unavailable');
  const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') throw new Error('Invalid room drawing');
  const [underlay] = await Promise.all([
    loadImage('fond-mouvements.webp?v=etagere-nana-2'), loadImage('objets-jour.webp'), loadImage('kero-visages.webp'),
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
    const textures = Array.from(svg.querySelectorAll('#v2-van-visual, #v2-fifi-visual, #v2-niki-petals, #niki-bed-atlas, .niki-breath, .v2-kero-faces'), image => {
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
  // The day and night sheets use the same poses, all warped from the original drawing.
  async function rearHorse(item) {
    if (quiet.matches || item.hasAttribute('data-rearing')) return;
    const horse = item.querySelector('#v2-fifi-visual');
    const sheet = horse.getAttribute('href').replace('cheval-etagere.webp', 'cheval-cabre.webp');
    const frame = document.createElementNS(svg.namespaceURI, 'svg');
    item.setAttribute('data-rearing', '');
    try {
      const preload = new Image();
      preload.src = sheet;
      await preload.decode();
      if (quiet.matches || !item.isConnected) return;
      const drawing = document.createElementNS(svg.namespaceURI, 'image');
      drawing.setAttribute('href', sheet);
      drawing.setAttribute('width', preload.naturalWidth);
      drawing.setAttribute('height', preload.naturalHeight);
      const width = preload.naturalWidth / 8;
      const height = preload.naturalHeight / 4;
      frame.setAttribute('x', Number(horse.getAttribute('x')) - 62);
      frame.setAttribute('y', Number(horse.getAttribute('y')) - 62);
      frame.setAttribute('width', width);
      frame.setAttribute('height', height);
      frame.setAttribute('overflow', 'hidden');
      frame.setAttribute('pointer-events', 'none');
      frame.setAttribute('aria-hidden', 'true');
      frame.append(drawing);
      horse.after(frame);
      await new Promise(resolve => {
        let start;
        function tick(time) {
          start ??= time;
          const pose = Math.floor((time - start) * 32 / 1320);
          if (pose >= 32 || quiet.matches || !item.isConnected ||
              horse.getAttribute('href').replace('cheval-etagere.webp', 'cheval-cabre.webp') !== sheet) {
            resolve();
            return;
          }
          frame.setAttribute('viewBox', [(pose % 8) * width, Math.floor(pose / 8) * height, width, height].join(' '));
          horse.style.visibility = 'hidden';
          requestAnimationFrame(tick);
        }
        frame.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        requestAnimationFrame(tick);
      });
    } catch (error) {
      console.warn('Animation du cheval indisponible', error);
    } finally {
      frame.remove();
      horse.style.removeProperty('visibility');
      item.removeAttribute('data-rearing');
    }
  }
  function spinNikiFlower(item) {
    const petals = item.querySelector('#v2-niki-petals');
    if (quiet.matches || petals.getAnimations().length) return;
    // Each tile carries only the rotating black-and-white ring. Tile zero is clear.
    petals.animate([
      {transform: 'translateX(0px)', easing: 'steps(48, end)'},
      {transform: 'translateX(-2304px)'}
    ], {duration: 1450, easing: 'cubic-bezier(.15,.55,.3,1)'});
  }
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
  const cycleKey = 'nana-landscape-cycle-v1';
  let cycle = [];
  try {
    const saved=JSON.parse(localStorage.getItem(cycleKey));
    if(Array.isArray(saved)) cycle=[...new Set(saved.filter(id=>landscapes.includes(id)))];
  } catch {}
  if(!landscape && cycle.length) dialAngle=90*landscapes.indexOf(cycle[cycle.length-1]);
  function recordLandscape() {
    if(!document.querySelector('#app.mode-play') || window.NanaProgress?.suppressed())return;
    const id=scene.dataset.landscape;
    if(!landscapes.includes(id))return;
    if(!cycle.includes(id))cycle.push(id);
    try { localStorage.setItem(cycleKey,JSON.stringify(cycle)); } catch {}
    window.NanaProgress?.feat('landscape-'+id);
    if (document.documentElement.dataset.theme === 'night') window.NanaProgress?.feat('night-landscape-'+id);
  }
  document.addEventListener('portfolio-mode-change',recordLandscape);
  new MutationObserver(recordLandscape).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  function showLandscape() {
    scene.dataset.landscape = landscapes[(dialAngle % 360) / 90];
    recordLandscape();
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
    if(cycle.length===landscapes.length)cycle=[];
    const steps = landscapes.map((_, step) => step).filter(step =>
      step !== 0 && !cycle.includes(landscapes[(currentSlot + step) % landscapes.length])
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
    return {counts, last:history.last, duplicate:history.duplicate === true};
  }
  function candidates({counts,last,duplicate}) {
    const missing=collection.figures.filter(f=>!counts[f.id]);
    const owned=collection.figures.length-missing.length;
    if(missing.length && (owned<4 || owned>=12 || duplicate)) return missing;
    return collection.figures.filter(f=>f.id!==last);
  }
  function chooseFigure(pool) {
    const weight = f => f.id === 'charm-gacha-7554' ? 1 : 4;
    let roll = Math.random() * pool.reduce((sum, f) => sum + weight(f), 0);
    return pool.find(f => (roll -= weight(f)) < 0);
  }
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
      const owned = draws.counts[figure.id] > 0;
      draws.duplicate = owned;
      draws.counts[figure.id]++;
      draws.last = figure.id;
      if(!progress.suppressed()){
        history = draws;
        try { localStorage.setItem(historyKey, JSON.stringify(draws)); } catch { /* Session only. */ }
      }
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
      summary.textContent = found+' / '+total;
      caption.append(summary);
      if(!owned){
        if(found===total){
          const badge=document.createElement('small');
          const icon=document.createElement('img');
          icon.src=progress.stickers.find(b=>b.id==='gashapon').image;
          icon.alt='';icon.width=32;icon.height=32;
          badge.textContent=english?'Gashapon patch earned!':'Écusson Gashapon débloqué !';
          badge.prepend(icon);
          summary.append(badge);
        }
        const tryOn=document.createElement('button');
        tryOn.type='button';
        tryOn.className='gacha-try-on';
        tryOn.textContent=english?'Try on in the wardrobe':'Essayer dans le dressing';
        tryOn.onclick=()=>{
          dialog.close();
          window.openAbout(undefined,figure.id);
        };
        dialog.append(tryOn);
      }
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
  async function seaLightMap(art, width, height, signal) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(art, 0, 0, width, height);
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
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        if (!data[i+3]) continue;
        const wall = r > 245 && g > 240 && b < g - 8;
        const ink = (data[i+3]/255) * Math.min(1, g/162) ** 2;
        data[i] = 58;
        data[i+1] = 211;
        data[i+2] = 220;
        data[i+3] = 255 * ink * (wall ? .59 : .22);
      }
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
  }

  function animateSeaCaustics(art, base) {
    // The movie stores focused light on black. Screen blending adds only the
    // reflected light, so the room drawing stays visible between the folds.
    const texture = folder + 'mer/caustiques';
    const light = document.createElement(quiet.matches ? 'img' : 'video');
    light.className = 'sea-surface-light';
    light.dataset.roomV2Layer = '';
    light.setAttribute('aria-hidden', 'true');
    // Project once, above the furniture and its individual SVG cutouts.
    light.style.zIndex = '100';
    light.style.mixBlendMode = 'screen';
    light.style.objectFit = 'fill';
    const mask = [art, underlay].map(image => 'url(' + JSON.stringify(image.currentSrc) + ')').join(', ');
    light.style.maskImage = light.style.webkitMaskImage = mask;
    light.style.maskSize = light.style.webkitMaskSize = '100% 100%';
    if (light instanceof HTMLVideoElement) {
      light.muted = true;
      light.playsInline = true;
      light.loop = true;
      light.poster = texture + '.jpg?v=mailles-2';
      light.src = texture + '.mp4?v=mailles-locales-3';
    } else {
      light.alt = '';
      light.src = texture + '.jpg?v=mailles-2';
    }
    base.after(light);
    if (light instanceof HTMLVideoElement) light.play().catch(() => {});
    return light;
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
        map = await seaLightMap(art, 1152, 650, signal);
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
    for (const {art, map} of maps) {
      if (art.currentSrc === map.dataset.source) art.after(map);
    }
    const backdrop = maps.find(({art, map}) => art.id === 'room-redraw-preview' && map.isConnected);
    const caustics = backdrop && animateSeaCaustics(backdrop.art, backdrop.map);
    const surfaces = maps.map(({map}) => map);
    if (caustics) surfaces.push(caustics);
    const beam = new Image();
    beam.alt = '';
    beam.src = folder + (quiet.matches ? 'mer/fenetre-lumiere-fixe.webp' : 'mer/fenetre-lumiere.webp');
    beam.className = 'sea-surface-light';
    beam.dataset.roomV2Layer = '';
    Object.assign(beam.style, {zIndex: '101', animation: 'none', opacity: '1'});
    scene.append(beam);
    beam.animate([{opacity: 0}, {opacity: 1}], {duration: 2200, easing: 'ease-out'});
    surfaces.push(beam);
    scene.classList.add('sea-lit');
    return {
      surfaces,
      caustics,
      remove() {
        if (caustics instanceof HTMLVideoElement) {
          caustics.pause();
          caustics.removeAttribute('src');
          caustics.load();
        }
        caustics?.remove();
        beam.remove();
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

  // Sample the room projection in each swimmer's local coordinates. The CSS
  // mask follows the animated drawing, including its transparent fin edges.
  function reflectOnSwimmers(light, swimmers, signal) {
    if (!light) return;
    const patches = swimmers.map(fish => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(480, fish.naturalWidth);
      canvas.height = Math.round(canvas.width * fish.naturalHeight / fish.naturalWidth);
      canvas.style.maskImage = canvas.style.webkitMaskImage = 'url(' + JSON.stringify(fish.currentSrc) + ')';
      fish.after(canvas);
      const ctx = canvas.getContext('2d');
      const dorsal = ctx?.createLinearGradient(0, 0, canvas.width * .14, canvas.height * .86);
      dorsal?.addColorStop(0, 'white');
      dorsal?.addColorStop(.52, 'white');
      dorsal?.addColorStop(.85, 'transparent');
      return {fish, canvas, ctx, dorsal};
    });
    let frame;
    function draw() {
      if (signal.aborted) return;
      const room = light.getBoundingClientRect();
      const ready = light instanceof HTMLVideoElement ? light.readyState >= 2 : light.naturalWidth > 0;
      for (const {fish, canvas, ctx, dorsal} of patches) {
        const swimmer = fish.parentElement;
        if (!swimmer?.isConnected || !ctx) continue;
        const bounds = swimmer.getBoundingClientRect();
        // Keep the glint brief as the swimmer crosses the desk and bed.
        const x = (bounds.left + bounds.width / 2 - room.left) / room.width;
        const strength = Math.max(0, 1 - Math.abs(x - .56) / .16);
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!ready || !strength || !swimmer.offsetWidth || !swimmer.offsetHeight) continue;
        const cssMatrix = getComputedStyle(swimmer).transform;
        const transform = new DOMMatrix(cssMatrix === 'none' ? undefined : cssMatrix);
        const w = swimmer.offsetWidth, h = swimmer.offsetHeight;
        // The bounding box includes rotation. Recover the transformed top-left.
        transform.e = bounds.left - Math.min(0, transform.a*w, transform.c*h, transform.a*w + transform.c*h);
        transform.f = bounds.top - Math.min(0, transform.b*w, transform.d*h, transform.b*w + transform.d*h);
        ctx.scale(canvas.width / w, canvas.height / h);
        const inv = transform.inverse();
        ctx.transform(inv.a, inv.b, inv.c, inv.d, inv.e, inv.f);
        ctx.globalAlpha = .38 * strength * strength;
        ctx.drawImage(light, room.left, room.top, room.width, room.height);
        ctx.resetTransform();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = dorsal;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (!quiet.matches || !ready) frame = requestAnimationFrame(draw);
    }
    draw();
    signal.addEventListener('abort', () => cancelAnimationFrame(frame), {once: true});
  }

  function addSeaSparkles(layer) {
    // One point per cell keeps open water between glints at every screen size.
    const columns = innerWidth < 650 ? 4 : 7;
    const rows = 4;
    const field = document.createDocumentFragment();
    // Each transparent texture carries distant grains and small luminous clusters.
    // Only the four sheets drift. The foreground glints twinkle individually.
    for (let depth = 1; depth <= 4; depth++) {
      const dust = document.createElement('i');
      dust.className = 'sea-dust sea-dust-' + depth;
      field.append(dust);
    }
    for (let i = 0; i < columns * rows; i++) {
      const row = Math.floor(i / columns);
      const column = i % columns;
      const point = document.createElement('i');
      point.className = 'sea-sparkle';
      if (i === 2 || i === columns * 2 + 1 || (columns === 7 && i === 26)) {
        point.classList.add('sea-sparkle-halo');
      }
      const style = point.style;
      style.left = (column + .22 + Math.random() * .56) / columns * 100 + '%';
      style.top = (row + .24 + Math.random() * .52) / rows * 100 + '%';
      style.setProperty('--diameter', (1.7 + Math.random() * 1.8) + 'px');
      style.setProperty('--period', (3.4 + Math.random() * 4.6) + 's');
      style.setProperty('--phase', (-Math.random() * 8) + 's');
      style.setProperty('--drift', (Math.random() * 8 - 4) + 'px');
      style.setProperty('--tilt', (-38 + Math.random() * 60) + 'deg');
      field.append(point);
    }
    layer.append(field);
  }

  let seaLayer;
  async function toggleSea() {
    if (seaLayer) { seaLayer.dismiss(); return; }
    const layer = document.createElement('div');
    layer.className = 'v2-sea';
    layer.setAttribute('aria-hidden', 'true');
    const still = quiet.matches;
    addSeaSparkles(layer);
    const swimmers = ['dauphin', 'poisson', 'manta'].map(name => {
      const fish = new Image();
      fish.alt = '';
      const swimmer = document.createElement('div');
      swimmer.className = 'sea-swimmer sea-' + name;
      fish.src = folder + 'mer/' + name + (still ? '-repos' : '') + '.webp' +
        (name === 'manta' && !still ? '?v=queue-onde-2' : '');
      if (!still) swimmer.addEventListener('animationend', () => {
        swimmer.remove();
        fish.removeAttribute('src');
      }, {once: true});
      swimmer.append(fish);
      layer.append(swimmer);
      return fish;
    });
    const seaWindow = new Image();
    seaWindow.className = 'sea-window';
    seaWindow.dataset.roomV2Layer = '';
    seaWindow.alt = '';
    seaWindow.src = folder + 'mer/fond-marin.webp';
    const preparation = new AbortController();
    const butterfly = document.getElementById('paprika-butterfly');
    let butterflyFade;
    let timer, lights, resumeBackdrop, enteredAt, leaving = false;
    function dismiss() {
      if (seaLayer !== layer) return;
      preparation.abort();
      butterflyFade?.cancel();
      clearTimeout(timer);
      seaWindow.remove();
      lights?.remove();
      resumeBackdrop?.();
      window.removeEventListener('resize', positionExit);
      if (shield.open) shield.close();
      shield.remove();
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
      butterflyFade?.reverse();

      const fades = [layer, seaWindow, ...lights.surfaces].map(node =>
        node.animate([{opacity: getComputedStyle(node).opacity}, {opacity: 0}],
          {duration, easing: 'ease-in-out', fill: 'forwards'}).finished
      );
      Promise.allSettled(fades).then(() => { if (seaLayer === layer) dismiss(); });
    }
    const mobile = svg.querySelector('[data-object="fish-mobile"]');
    const shield = document.createElement('dialog');
    shield.className = 'sea-interaction-shield';
    const english = document.documentElement.lang.startsWith('en');
    shield.setAttribute('aria-label', english ? 'Underwater room' : 'Chambre sous-marine');
    const exit = document.createElement('button');
    exit.type = 'button';
    exit.setAttribute('aria-label', english ? 'Leave the underwater room' : 'Quitter la chambre sous-marine');
    shield.append(exit);
    function positionExit() {
      const bounds = (mobile.querySelector('.v2-hit') || mobile).getBoundingClientRect();
      Object.assign(exit.style, {
        left: bounds.left + 'px', top: bounds.top + 'px',
        width: bounds.width + 'px', height: bounds.height + 'px'
      });
    }
    exit.addEventListener('click', leave);
    shield.addEventListener('cancel', event => { event.preventDefault(); leave(); });
    shield.addEventListener('close', dismiss);
    for (const type of ['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown', 'keyup']) {
      shield.addEventListener(type, event => event.stopPropagation());
    }
    const app = document.getElementById('app');
    const observer = new MutationObserver(() => {
      if (!app.classList.contains('mode-play')) dismiss();
    });
    observer.observe(app, {attributes:true, attributeFilter:['class']});
    layer.dismiss = leave;
    seaLayer = layer;
    window.addEventListener('pagehide', dismiss);
    try {
      document.body.append(shield);
      positionExit();
      shield.showModal();
      window.addEventListener('resize', positionExit);
      await Promise.all([...swimmers, seaWindow].map(image => image.decode()));
      if (seaLayer !== layer) return;
      layer.classList.toggle('sea-still', still);
      lights = await lightSeaSurfaces(preparation.signal);
      if (seaLayer !== layer) { lights?.remove(); return; }
      resumeBackdrop = pauseSeaBackdrop();
      scene.append(seaWindow);
      seaWindow.animate([{opacity: 0}, {opacity: 1}], {duration: seaFadeMs, easing: 'ease-in-out'});
      document.body.append(layer);
      reflectOnSwimmers(lights.caustics, swimmers, preparation.signal);
      enteredAt = performance.now();
      window.NanaProgress?.feat('fish-mobile-seen');
      butterflyFade = butterfly?.animate([{opacity: getComputedStyle(butterfly).opacity}, {opacity: 0}],
        {duration: seaFadeMs, easing: 'ease-in-out', fill: 'both'});
      layer.animate([{opacity: 0}, {opacity: 1}], {duration: seaFadeMs, easing: 'ease-in-out', fill: 'both'});
      timer = setTimeout(leave, still ? seaFadeMs + 1500 : 14500);
    } catch { dismiss(); }
  }

  function addAlicePlants(artwork, dialog, reducedMotion) {
    // Each atlas column has the same crop in the original illustration.
    const width = 488;
    const height = 632;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = 'position:absolute;display:block;pointer-events:none;';
    canvas.setAttribute('aria-hidden', 'true');
    artwork.after(canvas);
    function align() {
      const w = dialog.clientWidth;
      const h = dialog.clientHeight;
      const scale = Math.max(w / 3072, h / 1732);
      canvas.style.width = width * scale + 'px';
      canvas.style.height = height * scale + 'px';
      canvas.style.left = ((w - 3072 * scale) / 2 + 2216 * scale) + 'px';
      canvas.style.top = (h - 1732 * scale) / 2 + 'px';
    }
    new ResizeObserver(align).observe(dialog);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const atlas = new Image();
    const stems = [
      {height:385, seconds:5.2, reach:22, phase:0.1},
      {height:621, seconds:6.7, reach:34, phase:2.2},
      {height:329, seconds:4.4, reach:18, phase:4.4}
    ];
    let frame = 0;
    let lastDraw = -Infinity;
    function draw(now) {
      frame = 0;
      if (!dialog.open || !atlas.naturalWidth) return;
      if (now - lastDraw >= 32 || reducedMotion.matches) {
        ctx.drawImage(atlas, 0, 0, width, height, 0, 0, width, height);
        stems.forEach((stem, index) => {
          const time = now * .001 * 2 * Math.PI / stem.seconds;
          const offset = y => {
            const progress = y / stem.height;
            return reducedMotion.matches ? 0 : stem.reach * progress ** 1.35 *
              Math.sin(time + stem.phase - .6 * progress);
          };
          for (let y = 0; y < stem.height; y += 12) {
            const band = Math.min(12, stem.height - y);
            const x = offset(y);
            const shear = (offset(y + band) - x) / band;
            ctx.setTransform(1, 0, shear, 1, x - shear * y, 0);
            ctx.drawImage(atlas, width * (index + 1), y, width, band, 0, y, width, band);
          }
        });
        ctx.resetTransform();
        // Window frame and transparent tabletop pass in front of the leaves.
        ctx.drawImage(atlas, width * 4, 0, width, height, 0, 0, width, height);
        lastDraw = now;
      }
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    }
    function refresh() {
      cancelAnimationFrame(frame);
      lastDraw = -Infinity;
      draw(performance.now());
    }
    new MutationObserver(refresh).observe(dialog, {attributes:true, attributeFilter:['open']});
    reducedMotion.addEventListener('change', refresh);
    return night => {
      const file = night ? 'alice-plantes-nuit.webp' : 'alice-plantes.webp?v=murs-1';
      canvas.hidden = true;
      canvas.style.visibility = 'hidden';
      atlas.onload = () => {
        canvas.hidden = false;
        canvas.style.visibility = '';
        refresh();
      };
      atlas.src = folder + file;
    };
  }

  function addAliceNoiraudes(artwork, dialog, button, reducedMotion, expandShadow) {
    function node(tag, parent, attrs = {}) {
      const element = document.createElementNS(artwork.namespaceURI, tag);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      parent.append(element);
      return element;
    }
    const defs = node('defs', artwork);
    // Keep the resting tuft tucked behind the drawn hem.
    function floorClip(id, hem) {
      const clip = node('clipPath', defs, {id});
      node('polygon', clip, {points: hem + ' 3100,1100 3100,2400 0,2400 0,1600'});
      return 'url(#' + id + ')';
    }
    const small = floorClip('alice-small-hem', '790,1551 810,1537 830,1520 840,1511 850,1498 860,1499 880,1504 910,1507 920,1536 940,1559');
    const art = node('g', artwork, {'pointer-events':'none'});
    const hiding = node('g', art, {'clip-path':small, opacity:'.46'});
    const tuft = node('g', hiding);
    const peek = node('image', tuft, {href:folder + 'alice-noiraude-cachee.webp?v=pelage', x:784,y:1404,width:154,height:154});
    const turn = node('animateTransform', peek, {attributeName:'transform',type:'rotate',
      values:'0 861 1481;0 861 1481;-5 861 1481;4 861 1481;-2 861 1481;0 861 1481;0 861 1481',
      keyTimes:'0;.32;.40;.49;.60;.68;1',dur:'2.8s',repeatCount:'indefinite',begin:'indefinite'});
    const twitch = node('animateTransform', tuft, {attributeName:'transform',type:'translate',
      values:'0 0;0 0;3 -1;-2 1;2 0;0 0;0 0;-2 0;0 0',keyTimes:'0;.34;.38;.43;.48;.53;.79;.85;1',dur:'2.8s',repeatCount:'indefinite',begin:'indefinite'});
    function idleMotion() {
      const moving = dialog.open && !reducedMotion.matches && hiding.style.display !== 'none';
      for (const motion of [turn, twitch]) {
        if (moving) motion.beginElement();
        else motion.endElement();
      }
    }
    new MutationObserver(idleMotion).observe(dialog,{attributes:true,attributeFilter:['open']});
    reducedMotion.addEventListener('change', idleMotion);
    const group = node('g', art);
    const names = ['bleue','jaune','rose'];
    const order = [0,1,2,0,2,1,0];
    const delays = [0,.85,2.1,3.8,4.7,6.1,9.3];
    let images, active = false, frame, generation = 0;
    function stop() {
      ++generation;
      cancelAnimationFrame(frame);
      group.replaceChildren();
      active = false;
    }
    dialog.addEventListener('close', () => {
      stop();
      hiding.style.display = '';
      expandShadow(false);
    });
    button.addEventListener('click', async () => {
      if (active) return;
      active = true;
      const run = ++generation;
      images ??= Promise.all(names.flatMap(name => [0,1].map(pose => {
        const image = new Image();
        image.src = folder + 'noiraudes/' + name + '-' + pose + '.png';
        return image.decode().then(() => image);
      })));
      let poses;
      try { poses = await images; } catch { images = null; if (generation === run) stop(); return; }
      if (!dialog.open || generation !== run) return;
      expandShadow(true);
      hiding.style.display = 'none';
      idleMotion();
      const walkers = order.map(() => node('image', group, {display:'none'}));
      const start = performance.now();
      let discovered = false;
      function draw(now) {
        if (!dialog.open || generation !== run) return;
        const t = (now-start)/1000;
        const still = reducedMotion.matches;
        if (t >= (still ? 3 : 16.9)) { stop(); return; }
        walkers.forEach((walker, i) => {
          const p = still ? .16+i*.18 : (t-delays[i])/(6.5+.15*i);
          if (p < 0 || p > 1 || (still && i >= 3)) {
            walker.setAttribute('display','none');
            return;
          }
          walker.removeAttribute('display');
          const emergence = Math.min(1,p/.12);
          const reveal = emergence*emergence*(3-2*emergence);
          const beat = t*(3.25+i*.12)+i;
          const pose = poses[2*order[i]+(still ? i%2 : Math.floor(beat*2)%2)];
          if (walker.getAttribute('href') !== pose.src) walker.setAttribute('href',pose.src);
          // The procession turns towards Alice before reaching the spilled potion at x=1814.
          const x = 845 + 695*(1-(1-p)**1.85)*reveal;
          const feet = 1548 + 26*Math.sin(Math.PI*emergence)**2 - 10*reveal + 120*(1-(1-p)**3) + 505*p**3 + (i%3)*12*Math.sin(Math.PI*p);
          // The whole silhouette fits in the opening, then grows into the foreground.
          const scale = .32 + (1.88*.97-.32)*reveal + 1.88*.86*p;
          const w = pose.naturalWidth*scale, h = pose.naturalHeight*scale;
          walker.setAttribute('x',x-w/2);
          walker.setAttribute('y',feet-h-(still ? 0 : 4*Math.abs(Math.sin(beat*2*Math.PI))));
          walker.setAttribute('width',w);
          walker.setAttribute('height',h);
          walker.setAttribute('opacity',reveal);
          if (!discovered && reveal > .6) {
            discovered = true;
            window.NanaProgress?.feat('noiraudes-seen');
          }
        });
        frame = requestAnimationFrame(draw);
      }
      frame = requestAnimationFrame(draw);
    });
    return night => { art.style.filter = night ? 'url(#room-v2-night-ink)' : ''; };
  }
  function playAliceEntrance(dialog, bottle) {
    const artwork = dialog.querySelector('svg');
    const drawing = artwork.querySelector('image');
    const sceneBox = scene.getBoundingClientRect();
    const bottleBox = bottle.getBoundingClientRect();
    const origin = (bottleBox.left + bottleBox.width/2 - sceneBox.left) + 'px ' +
      (bottleBox.top + bottleBox.height/2 - sceneBox.top) + 'px';
    const animations = [];
    const table = new Image(), vial = new Image();
    const base = document.getElementById('room-redraw-preview');
    for (const layer of [table, vial]) {
      layer.alt = '';
      layer.dataset.roomV2Layer = '';
      layer.style.cssText = 'position:absolute;left:61.84895833%;top:76.50115473%;width:3.41796875%;height:8.37182448%;pointer-events:none;';
      layer.style.zIndex = getComputedStyle(base).zIndex;
      layer.style.filter = getComputedStyle(base).filter;
    }
    table.src = folder + 'alice-table-sans-fiole.webp';
    vial.src = folder + 'alice-fiole-debout.webp';
    vial.style.transformOrigin = '58% 81%';
    const landingArt = new Image();
    landingArt.src = folder + 'alice-rotation-' + (document.documentElement.dataset.theme === 'night' ? 'nuit' : 'jour') + '.webp?v=cordon-3';
    const landing = document.createElement('canvas');
    const stripWidth = 1088, stripHeight = 388;
    landing.width = stripWidth;
    landing.height = stripHeight;
    landing.setAttribute('aria-hidden','true');
    landing.style.cssText = 'position:absolute;pointer-events:none;z-index:1;';
    const ctx = landing.getContext('2d');
    if (ctx) {
      // Show the original paper layer through the motion overlay, including its lettering.
      const glass = new Path2D();
      glass.rect(0,0,stripWidth,stripHeight);
      const paper = [[395,209],[459,163],[561,189],[680,221],[803,237],[915,237],
        [920,280],[967,363],[971,385],[941,400],[392,400],[389,221]];
      glass.moveTo(...paper[0]);
      for (const point of paper.slice(1)) glass.lineTo(...point);
      glass.closePath();
      ctx.clip(glass,'evenodd');
    }
    let rollFrame;
    let finished = false, timeout;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      dialog.removeEventListener('close', finish);
      quiet.removeEventListener('change', finish);
      dialog.classList.remove('alice-entering');
      animations.forEach(animation => animation.cancel());
      table.remove();
      vial.remove();
      cancelAnimationFrame(rollFrame);
      landing.remove();
    }
    dialog.classList.add('alice-entering');
    dialog.addEventListener('close', finish);
    quiet.addEventListener('change', finish);
    const picture = new Image();
    picture.src = drawing.getAttribute('href');
    timeout = setTimeout(finish, 4500);
    Promise.all([picture, table, vial, landingArt].map(image => image.decode())).then(() => {
      if (finished || !dialog.open) return;
      clearTimeout(timeout);
      base.after(table, vial);
      const timing = {duration:3700, fill:'both'};
      const outgoing = scene.animate([
        {transformOrigin:origin, transform:'none', easing:'ease-in-out', offset:0},
        {transformOrigin:origin, transform:'scale(1.38)', easing:'ease-in-out', offset:.38},
        {transformOrigin:origin, transform:'translateY(-2%) scale(1.7)', easing:'ease-in', offset:.62},
        {transformOrigin:origin, transform:'translateY(-13%) scale(2.16)', offset:.79},
        {transformOrigin:origin, transform:'translateY(-13%) scale(2.16)'}
      ], timing);
      animations.push(outgoing);
      // Rock around the foot, hesitate, then tip over the edge with increasing speed.
      const rocks = [[0,0],[.09,0],[.16,-5],[.23,3],[.30,0],[.36,0],
        [.395,-4],[.425,4],[.45,-6],[.48,3],[.52,-8],[.56,-4]];
      animations.push(vial.animate([
        ...rocks.map(([offset, angle]) => ({offset, transform:'rotate('+angle+'deg)', easing:'ease-in-out'})),
        {offset:.64, transform:'translate(-4%,3%) rotate(-32deg)', easing:'ease-in'},
        {offset:.72, transform:'translate(-22%,35%) rotate(-78deg)', easing:'ease-in'},
        {offset:.79, transform:'translate(-40%,118%) rotate(-105deg)'},
        {transform:'translate(-40%,118%) rotate(-105deg)'}
      ], timing));
      // Cut on the fall; the floor view carries the same upward sweep into the landing.
      animations.push(dialog.animate([
        {opacity:0, easing:'steps(1,end)'}, {opacity:1, offset:.76}, {opacity:1}
      ], timing));
      animations.push(artwork.animate([
        {transform:'translateY(7%) scale(1.19)'},
        {offset:.76, transform:'translateY(7%) scale(1.19)', easing:'ease-out'},
        {offset:.92, transform:'translateY(-.45%) scale(1.025)', easing:'ease-in-out'},
        {transform:'none'}
      ], timing));
      // Only the cylinder's surface turns. Its axis, the cork and the puddle stay planted.
      if (!ctx) { outgoing.finished.then(finish, finish); return; }
      dialog.append(landing);
      const poses = [[0,16],[.14,15.2],[.44,9],[.80,3],[1.08,0],[1.22,.5],
        [1.73,9.3],[1.90,10],[2.08,9.3],[2.58,1.7],[2.74,1],
        [2.91,1.65],[3.32,6.6],[3.48,7],[3.64,6.65],[4.05,2.4],[4.22,2],
        [4.38,2.35],[4.69,4.4],[4.84,4.6],[5.00,4.35],[5.33,3.1],[5.48,3]];
      const start = performance.now();
      function drawPose(index, opacity) {
        ctx.globalAlpha = opacity;
        ctx.drawImage(landingArt,(index%4)*816,Math.floor(index/4)*291,816,291,0,0,stripWidth,stripHeight);
      }
      dialog.dispatchEvent(new Event('alice-cat-watches-vial'));
      function drawRoll(now) {
        if (finished) return;
        const elapsed = now-start;
        if (elapsed >= timing.duration*.76) {
          const time = Math.max(0,(elapsed-timing.duration*.94)/1000);
          if (time >= poses[poses.length-1][0]) {
            dialog.dispatchEvent(new Event('alice-cat-notices'));
            finish();
            return;
          }
          // Follow the floor drawing through the last part of the incoming camera move.
          const rect = artwork.getBoundingClientRect();
          const modal = dialog.getBoundingClientRect();
          const scale = Math.max(rect.width/3072,rect.height/1732);
          landing.style.width = stripWidth*scale+'px';
          landing.style.height = stripHeight*scale+'px';
          landing.style.left = (rect.left-modal.left+rect.width/2+(1792-1536)*scale)+'px';
          landing.style.top = (rect.top-modal.top+rect.height/2+(1344-866)*scale)+'px';
          const next = poses.findIndex(([end]) => end>time);
          const [from,lo] = poses[next-1], [to,hi] = poses[next];
          const pose = lo+(hi-lo)*(time-from)/(to-from);
          const index = Math.floor(pose);
          ctx.clearRect(0,0,stripWidth,stripHeight);
          drawPose(index,1);
          if (pose>index) drawPose(index+1,pose-index);
          ctx.globalAlpha = 1;
        }
        rollFrame = requestAnimationFrame(drawRoll);
      }
      rollFrame = requestAnimationFrame(drawRoll);
    }).catch(finish);
  }

  function openAliceView(bottle) {
    let dialog = document.getElementById('alice-floor-view');
    const english = document.documentElement.lang.startsWith('en');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'alice-floor-view';
      dialog.addEventListener('close', () => window.NanaDeepLinks?.sync());
      dialog.style.cssText = 'position:fixed;inset:0;margin:0;padding:0;border:0;width:100%;height:100%;max-width:none;max-height:none;overflow:hidden;background:#fff9ed;';
      const ns = 'http://www.w3.org/2000/svg';
      const artwork = document.createElementNS(ns, 'svg');
      artwork.setAttribute('viewBox', '0 0 3072 1732');
      artwork.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      artwork.setAttribute('aria-hidden', 'true');
      artwork.style.cssText = 'display:block;width:100%;height:100%;';
      const layers = [];
      function addLayer(day, night, x, y, width, height) {
        const image = document.createElementNS(ns, 'image');
        for (const [name, value] of Object.entries({x, y, width, height})) {
          image.setAttribute(name, value);
        }
        layers.push({image, day, night});
        artwork.append(image);
        return image;
      }
      addLayer('alice-vue-sol.webp?v=murs-1', 'alice-vue-nuit.webp', 0, 0, 3072, 1732);
      addLayer('alice-retouches-flacon-jour.webp', 'alice-retouches-flacon-nuit.webp', 2042, 1414, 270, 318);
      const tail = addLayer('alice-queue.webp?v=murs-1', 'alice-queue-nuit.webp', 416, 68, 248, 282);
      const whiskers = addLayer('alice-moustaches.webp?v=murs-1', 'alice-moustaches-nuit.webp', 560, 175, 480, 335);
      const bedWindow = document.createElementNS(ns, 'svg');
      for (const [name, value] of Object.entries({x:668, y:1264, width:412, height:468, overflow:'hidden'})) {
        bedWindow.setAttribute(name, value);
      }
      artwork.append(bedWindow);
      const bed = addLayer('alice-ombre-jour.webp', 'alice-ombre-nuit.webp', 0, 0, 824, 468);
      bedWindow.append(bed);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      // A filmstrip contains only the pixels inside the irises; the center frame is the original drawing.
      const eyesWindow = document.createElementNS(ns,'svg');
      for (const [name,value] of Object.entries({x:730,y:286,width:182,height:112,overflow:'hidden'})) {
        eyesWindow.setAttribute(name,value);
      }
      artwork.insertBefore(eyesWindow,whiskers);
      const eyes = addLayer('alice-regard-jour.webp?v=gauche','alice-regard-nuit.webp?v=gauche',-1638,0,3458,112);
      eyesWindow.append(eyes);
      const setGaze = frame => eyes.setAttribute('x',-182*frame);
      let gazeFrame;
      function restEyes() {
        cancelAnimationFrame(gazeFrame);
        setGaze(9);
      }
      dialog.addEventListener('close',restEyes);
      reducedMotion.addEventListener('change',restEyes);
      dialog.addEventListener('alice-cat-watches-vial',() => {
        if (dialog.open && !reducedMotion.matches) setGaze(18);
      });
      dialog.addEventListener('alice-cat-notices',() => {
        if (reducedMotion.matches || !dialog.open) return;
        const start = performance.now();
        function follow(now) {
          if (!dialog.open || reducedMotion.matches) { restEyes(); return; }
          // Hold the rightward gaze for a beat, then return to the original center frame.
          const p = Math.min(1,Math.max(0,(now-start-260)/230));
          setGaze(Math.round(18-9*p*p*(3-2*p)));
          if (p < 1) gazeFrame = requestAnimationFrame(follow);
        }
        follow(start);
      });
      function updateCatMotion() {
        tail.style.display = reducedMotion.matches ? 'none' : '';
        whiskers.style.display = tail.style.display;
      }
      reducedMotion.addEventListener('change', updateCatMotion);
      updateCatMotion();
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = '×';
      close.style.cssText = 'position:absolute;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));width:44px;height:44px;border:1px solid #ee4564;border-radius:50%;background:#fff9ed;color:#c22348;font:28px/1 sans-serif;cursor:pointer;';
      close.addEventListener('click', () => dialog.close());
      dialog.append(artwork, close);
      const setPlantTheme = addAlicePlants(artwork, dialog, reducedMotion);
      const lamp = document.createElement('button');
      lamp.type = 'button';
      lamp.className = 'alice-lamp';
      lamp.style.cssText = 'position:absolute;transform:translate(-50%,-50%);border:0;border-radius:50%;background:transparent;padding:0;cursor:pointer;min-width:44px;min-height:44px;';
      lamp.addEventListener('click', () => document.getElementById('theme-toggle')?.click());
      dialog.append(lamp);
      const bedCorner = document.createElement('button');
      bedCorner.type = 'button';
      bedCorner.style.cssText = lamp.style.cssText;
      const expandShadow = expanded => {
        bed.setAttribute('x', expanded ? '-412' : '0');
        bedCorner.setAttribute('aria-pressed', String(expanded));
      };
      const setNoiraudeTheme = addAliceNoiraudes(artwork, dialog, bedCorner, reducedMotion, expandShadow);
      expandShadow(false);
      dialog.append(bedCorner);
      function alignControls() {
        const w = dialog.clientWidth, h = dialog.clientHeight;
        const scale = Math.max(w / 3072, h / 1732);
        function position(button, x, y, width, height) {
          button.style.left = (w / 2 + (x - 1536) * scale) + 'px';
          button.style.top = (h / 2 + (y - 866) * scale) + 'px';
          button.style.width = width * scale + 'px';
          button.style.height = height * scale + 'px';
        }
        position(lamp, 1479.5, 223, 145, 160);
        position(bedCorner, 850, 1550, 240, 150);
      }
      new ResizeObserver(alignControls).observe(dialog);
      function syncAliceTheme() {
        const night = document.documentElement.dataset.theme === 'night';
        for (const layer of layers) {
          layer.image.setAttribute('href', folder + (night ? layer.night : layer.day));
        }
        setPlantTheme?.(night);
        setNoiraudeTheme(night);
        bedCorner.setAttribute('aria-label', document.documentElement.lang.startsWith('en')
          ? 'Explore the shadow under the bed' : 'Explorer l’ombre sous le lit');
        lamp.setAttribute('aria-pressed', String(night));
        lamp.setAttribute('aria-label', document.documentElement.lang.startsWith('en')
          ? 'Flower lamp · night mode' : 'Lampe fleur · mode nuit');
      }
      syncAliceTheme();
      new MutationObserver(syncAliceTheme).observe(document.documentElement, {
        attributes:true, attributeFilter:['data-theme','lang']
      });
      document.body.append(dialog);
    }
    dialog.setAttribute('aria-label', english ? 'The room from Alice’s point of view' : 'La chambre vue par Alice au ras du sol');
    dialog.querySelector('button').setAttribute('aria-label', english ? 'Back to the room' : 'Revenir à la chambre');
    if (dialog.open) return;
    dialog.showModal();
    if (bottle?.matches?.('[data-object="alice-bottle"]') && !quiet.matches && scene.animate) {
      playAliceEntrance(dialog, bottle);
    }
  }
  function openZolaQuote(book) {
    if (document.getElementById('zola-reading-stage')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'zola-reading-stage';
    dialog.setAttribute('aria-label', 'Nana — Émile Zola');
    const closeLabel = document.documentElement.lang.startsWith('en') ? 'Close' : 'Refermer';
    dialog.innerHTML = `<div class="zola-on-shelf" aria-hidden="true"><div class="zola-leaf"></div></div>
      <div id="zola-reading" class="nn-paper nn-frame"><button type="button" class="nn-close nn-frame" aria-label="${closeLabel}"><img src="assets/portfolio-ux/IMG_5035.png" alt=""></button>
      <p lang="fr">« […] un tapage de voix montait, dans lequel le nom de Nana sonnait avec la vivacité chantante de deux syllabes. »</p></div>
      <div class="zola-hinge" aria-hidden="true"><div class="zola-cover"><div class="zola-front"></div><div class="zola-back"></div></div></div>`;
    document.body.append(dialog);
    dialog.showModal();
    const paper = dialog.querySelector('#zola-reading');
    const button = paper.querySelector('button');
    const animations = [];
    if (!quiet.matches) {
      // Front cover bounds in the artist's 3072 × 1732 drawing.
      const surface = svg.getBoundingClientRect();
      const left = surface.left + surface.width * 2830 / 3072;
      const top = surface.top + surface.height * 303 / 1732;
      const width = surface.width * 95 / 3072;
      const height = surface.height * 144 / 1732;
      for (const [name,value] of Object.entries({left,top,width,height})) {
        dialog.style.setProperty('--shelf-' + name, value + 'px');
      }
      const page = paper.getBoundingClientRect();
      const x = left + width/2 - page.left - page.width/2;
      const y = top + height/2 - page.top - page.height/2;
      const onShelf = `translate(${x}px,${y}px) scale(${width/page.width},${height/page.height})`;
      const duration = 3400;
      function animate(node, frames) {
        animations.push(node.animate(frames, {duration,fill:'both'}));
      }
      animate(dialog.querySelector('.zola-cover'), [
        {transform:'rotateY(0deg)',easing:'ease-in'},
        {offset:.09,transform:'rotateY(-7deg)',easing:'ease-in-out'},
        {offset:.36,transform:'rotateY(-151deg)'}, {transform:'rotateY(-151deg)'}
      ]);
      // Slide the small page past the bottom edge before bringing it forward.
      // The layer change takes place in clear space, in both playback directions.
      const clearCover = `translate(${x + width*.06}px,${y + height*1.22}px) scale(${width/page.width},${height/page.height})`;
      animate(paper, [
        {transform:onShelf,zIndex:0},
        {offset:.48,transform:onShelf,zIndex:0,easing:'ease-in-out'},
        {offset:.69,transform:clearCover,zIndex:0},
        {offset:.70,transform:clearCover,zIndex:2,easing:'ease-in-out'},
        {transform:'none',zIndex:2}
      ]);
      animate(button,[{opacity:0},{offset:.91,opacity:0},{opacity:1}]);
    }
    const closeNow = () => { if (dialog.open) dialog.close(); };
    let closing = false;
    function dismiss() {
      if (closing) return;
      closing = true;
      if (!animations.length || quiet.matches) { closeNow(); return; }
      for (const animation of animations) {
        animation.updatePlaybackRate(-2.2);
        animation.play();
      }
      Promise.allSettled(animations.map(animation => animation.finished)).then(closeNow);
    }
    dialog.oncancel = event => { event.preventDefault(); dismiss(); };
    button.onclick = dismiss;
    dialog.onclick = event => { if (event.target === dialog) dismiss(); };
    window.addEventListener('hashchange', closeNow);
    dialog.onclose = () => {
      window.removeEventListener('hashchange', closeNow);
      for (const animation of animations) animation.cancel();
      dialog.remove();
      if (book.isConnected) book.focus({preventScroll:true});
    };
  }
  function revealPreacher() {
    if (scene.querySelector('.preacher-light')) return;
    const light = document.createElement('div');
    light.className = 'preacher-light';
    light.dataset.roomV2Layer = '';
    light.setAttribute('aria-hidden', 'true');
    const pane = document.createElement('div');
    const bloom = document.createElement('div');
    const rays = document.createElement('div');
    rays.className = 'preacher-rays';
    light.append(pane, rays, bloom);
    scene.append(light);

    const words = document.createElement('div');
    words.className = 'preacher-words';
    words.setAttribute('role', 'status');
    document.body.append(words);
    const viewport = scene.parentElement;
    const centerWords = () => {
      const room = viewport.getBoundingClientRect();
      words.style.top = (Math.max(0, room.top) + Math.min(innerHeight, room.bottom)) / 2 + 'px';
      words.style.left = (Math.max(0, room.left) + Math.min(innerWidth, room.right)) / 2 + 'px';
    };
    centerWords();
    window.addEventListener('resize', centerWords);
    const timing = {duration:7200, fill:'both'};
    pane.animate([
      {opacity:0}, {offset:.09, opacity:.72}, {offset:.19, opacity:1},
      {offset:.68, opacity:1}, {offset:.84, opacity:.45}, {opacity:0}
    ], timing);

    // Keep the source fixed in the glass as the shafts lengthen into the room.
    const lightFrame = (offset, scale, opacity) => ({
      offset, opacity, transform:`scale(${quiet.matches ? 1 : scale})`, easing:'ease-in-out'
    });
    rays.animate([
      lightFrame(0,.04,0), lightFrame(.065,.04,0), lightFrame(.26,.39,.87),
      lightFrame(.48,.92,1), lightFrame(.63,1.12,.96), lightFrame(.76,1.12,.36),
      lightFrame(1,1.12,0)
    ], timing);
    bloom.animate([
      lightFrame(0,.04,0), lightFrame(.23,.04,0), lightFrame(.43,.29,.46),
      lightFrame(.63,1.25,1), lightFrame(.81,1.25,.84), lightFrame(1,1.25,0)
    ], timing);
    words.textContent = 'Tu as vu Dieu.';
    const caption = words.animate([
      {opacity:0}, {offset:.63, opacity:0}, {offset:.69, opacity:1},
      {offset:.83, opacity:1}, {offset:.89, opacity:0}, {opacity:0}
    ], timing);
    const cleanup = () => {
      window.removeEventListener('resize', centerWords);
      light.remove();
      words.remove();
    };
    caption.finished.then(cleanup, cleanup);
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
    if (['sailor','office'].includes(item.dataset.object))window.NanaProgress?.feat(item.dataset.object);
    if (item.dataset.object === 'night-lamp') window.NanaProgress?.feat('lights');
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
    if (item.dataset.object === 'nana-zola-book') openZolaQuote(item);
    if (item.dataset.object === 'alice-bottle') openAliceView(item);
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
    if (item.dataset.object === 'niki') {
      window.NanaProgress?.feat('niki-nana');
      spinNikiFlower(item);
    }
    if (item.dataset.object === 'fifi') {
      window.NanaProgress?.feat('fifi-horse');
      rearHorse(item);
    }
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
      revealPreacher();
    }
    if (item.dataset.object === 'bell') {
      document.getElementById('nana-kikujiro-chime')?.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    }
  }
  svg.addEventListener('click', activate);
  svg.addEventListener('keydown', activate);
  window.NanaAliceView = {open:openAliceView};
  window.dispatchEvent(new Event('nana-room-v2-ready'));
})().catch(error => console.error('Chambre V2', error));

