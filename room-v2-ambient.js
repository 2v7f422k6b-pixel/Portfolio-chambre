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
  const response = await fetch(folder + 'objets.svg?v=20261118-retours');
  if (!response.ok) throw new Error('Room drawing unavailable');
  const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') throw new Error('Invalid room drawing');
  const [underlay] = await Promise.all([
    loadImage('fond-mouvements.webp?v=20261118-atelier'), loadImage('objets-jour.webp'), loadImage('kero-visages.webp'),
    loadImage('miroir.webp'), loadImage('lampe-fleur.webp'), loadImage('cinq-objets.webp')
  ]);
  underlay.id = 'room-v2-underlay';
  underlay.dataset.roomV2Layer = '';
  underlay.alt = '';
  underlay.draggable = false;
  const responseArt = document.getElementById('cat-response');
  if (responseArt) svg.querySelector('[data-cat-effects]').append(responseArt);
  scene.append(underlay, svg);
  hotspots.dataset.roomV2Layer = '';

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
  let dialAngle = 0;
  function spinDial() {
    const wheel = svg.querySelector('.landscape-wheel');
    if (wheel.getAnimations().some(a => a.playState === 'running')) return;
    const start = dialAngle;
    dialAngle = start + 720 + 90 * Math.floor(Math.random()*4);
    motion(wheel, turns(start,dialAngle), 1700, '1931px 990px','forwards');
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
    if (item.dataset.object === 'sailor') {
      const kicks=[[0,0],[-9,-18],[4,12],[-27,-22],[0,16],[-21,24],[0,-19],[-25,-22],[2,18],[-14,15],[0,-10],[-5,6],[0,0]];
      motion(item.querySelector('.clock-shake'), kicks.map(([y,a])=>({transform:'translateY('+y+'px) rotate('+a+'deg)'})), 1900, '487px 734px');
    }
    if (item.dataset.object === 'office') {
      motion(item.querySelector('.office-words'), [
        {transform:'none',opacity:1},{transform:'translateY(-6px)',opacity:0,offset:.28},
        {transform:'translateY(-6px)',opacity:0,offset:.78},{transform:'none',opacity:1}
      ],1450);
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
