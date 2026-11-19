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
  const response = await fetch(folder + 'objets.svg?v=20261119-aiguilles');
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
      html[data-theme="night"] #play-scene:not([data-landscape="pink"]) > .v2-sky-sparkles { display:block; }
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
  function showTime() {
    const now = new Date();
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
  const desertTemplate = document.getElementById('v2-desert-template');
  desertTemplate.replaceWith(desertTemplate.content);
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
  const landscapes = ['marseille', 'japon', 'pink', 'marseille'];
  let dialAngle = landscape === 'desert-rose' ? 180 : landscape === 'japon' ? 90 : 0;
  function showLandscape() {
    scene.dataset.landscape = landscapes[(dialAngle % 360) / 90];
  }
  wheel.style.transformBox = 'view-box';
  wheel.style.transformOrigin = '1931px 990px';
  wheel.style.transform = 'rotate(' + dialAngle + 'deg)';
  showLandscape();
  function spinDial() {
    if (wheel.getAnimations().some(a => a.playState === 'running')) return;
    const start = dialAngle;
    const currentSlot = (start % 360) / 90;
    const steps = landscapes.map((_, step) => step).filter(step =>
      landscapes[(currentSlot + step) % landscapes.length] !== scene.dataset.landscape
    );
    dialAngle = start + 720 + 90 * steps[Math.floor(Math.random() * steps.length)];
    const spin = motion(wheel, turns(start,dialAngle), 1700, '1931px 990px','forwards');
    spin.onfinish = showLandscape;
  }
  const machine = svg.querySelector('[data-object="gashapon"]');
  const prize = machine.querySelector('.gasha-prize');
  let capsuleState = 'idle';
  function capsuleLabel(open) {
    machine.dataset.labelFr = open ? 'Ouvrir la capsule dans le bac' : 'Tourner la poignée du Gashapon';
    machine.dataset.labelEn = open ? 'Open the capsule in the tray' : 'Turn the capsule machine handle';
    setLabels();
  }
  function drawCapsule() {
    if (capsuleState === 'ready') {
      capsuleState = 'opening';
      const dialog=document.createElement('dialog');
      dialog.className='gacha-open-dialog v2-capsule-dialog';
      const english=document.documentElement.lang==='en';
      dialog.setAttribute('aria-label',english?'Capsule close-up':'Capsule en gros plan');
      const artwork=document.createElementNS('http://www.w3.org/2000/svg','svg');
      artwork.setAttribute('viewBox','-31 -38 62 76');
      artwork.append(...Array.from(prize.children,n=>n.cloneNode(true)));
      const open=document.createElement('button'), close=document.createElement('button');
      const result=document.createElement('p'); result.setAttribute('role','status');
      open.textContent=english?'Open the capsule':'Ouvrir la capsule';
      close.textContent=english?'Close':'Fermer';
      dialog.append(artwork,open,result,close);
      document.body.append(dialog);
      open.onclick=()=>{
        open.hidden=true;
        artwork.querySelector('.gasha-upper').setAttribute('transform','translate(-2 -10) rotate(-12)');
        artwork.querySelector('.gasha-lower').setAttribute('transform','translate(1 8)');
        result.textContent=english?'The figurines are coming soon.':'Les figurines arrivent bientôt.';
        close.focus();
      };
      close.onclick=()=>dialog.close();
      const dismiss=()=>dialog.close();
      window.addEventListener('hashchange',dismiss);
      dialog.addEventListener('close',()=>{
        window.removeEventListener('hashchange',dismiss);
        dialog.remove(); prize.setAttribute('visibility','hidden');
        capsuleState='idle'; machine.classList.remove('capsule-ready'); capsuleLabel(false);
        machine.focus({preventScroll:true});
      },{once:true});
      dialog.showModal(); open.focus();
      return;
    }
    if (capsuleState !== 'idle') return;
    capsuleState='mixing';
    motion(machine.querySelector('.gasha-handle'),turns(0,180,360),650,'2412px 875px');
    machine.querySelectorAll('.gasha-ball').forEach((ball,i) => {
      if(quiet.matches)return;
      ball.style.transformBox='fill-box'; ball.style.transformOrigin='center';
      ball.animate([{transform:'translate(-3px,0) rotate(-8deg)'},{transform:'translate(3px,-5px) rotate(8deg)'}],
        {duration:260,iterations:4,direction:'alternate',delay:i*13,easing:'ease-in-out'});
    });
    const href='#gasha-capsule-'+(24+Math.floor(Math.random()*12));
    prize.querySelectorAll('use').forEach(n=>n.setAttribute('href',href));
    setTimeout(() => {
      prize.setAttribute('visibility','visible');
      motion(prize,[{transform:'translateY(-28px)',opacity:0},{transform:'translateY(3px)',opacity:1},{transform:'none',opacity:1}],600);
      capsuleState='ready'; machine.classList.add('capsule-ready'); capsuleLabel(true);
    },quiet.matches?0:700);
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
