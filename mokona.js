(() => {
  const scene = document.querySelector('#play-scene');
  if (!scene || new URLSearchParams(location.search).get('chambreV2') !== '1') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const words = {
    fr: ['Mokona débloqué !', 'Coucou, moi c’est Mokona ! Certains objets de cette chambre cachent un secret. Touche-les pour les découvrir. Tu peux retrouver tes découvertes dans ton carnet.', 'Si tu ne sais plus où chercher, viens me voir sur le lit. Je te donnerai un petit indice. Tu vois le coussin étoile ? C’est là que je t’attends !', 'Continuer', 'À tout à l’heure, Mokona !'],
    en: ['Mokona unlocked!', 'Hi, I’m Mokona! Some objects in this room are hiding secrets. Tap them to explore, then look in your notebook to see what you’ve found.', 'Need a hint? Come find me on the bed. See the star pillow? That’s where I’ll be!', 'Continue', 'See you soon, Mokona!']
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'mokona-dialog';
  dialog.setAttribute('aria-labelledby', 'mokona-title');
  dialog.innerHTML = '<div class="mokona-content"><div class="mokona-float"></div><div class="mokona-card"><h2 id="mokona-title"></h2><p class="mokona-copy"><span aria-hidden="true"></span><span aria-hidden="true"></span></p><button type="button"></button></div></div>';
  const bed = document.createElement('button');
  bed.type = 'button';
  bed.className = 'mokona-bed';
  bed.setAttribute('data-room-v2-layer','mokona');
  bed.setAttribute('data-nana-load-ignore','');
  bed.hidden = true;
  scene.append(bed);
  document.body.append(dialog);
  const floater = dialog.querySelector('.mokona-float');
  const copy = dialog.querySelector('p');
  const next = dialog.querySelector('button');
  const svgNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attributes) {
    const node = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }
  const art = svg('svg', {class:'mokona-art', viewBox:'825 115 1810 1390', 'aria-hidden':'true'});
  function part(id, x, y, width, height, className = '', parent = art) {
    const image = svg('image', {href:'assets/mokona/' + id + '.webp', x, y, width, height, class:className, preserveAspectRatio:'none'});
    parent.append(image);
    return image;
  }
  const trailingFoot = part(8184,1811,965,204,504);
  trailingFoot.style.transformOrigin = '1860px 1015px';
  part(8185,886,185,741,338,'mokona-ear mokona-ear-left');
  part('8185-right',1869,304,701,244,'mokona-ear mokona-ear-right');
  // The jewel and upper outline stay registered with the facial layers.
  const upper = svg('svg',{x:1408,y:340,width:695,height:471,viewBox:'1408 340 695 471',overflow:'hidden'});
  art.append(upper);
  part(8186,1408,340,695,870,'',upper);
  // Each pose widens progressively towards the base and meets the same upper outline.
  const belly = svg('svg',{x:1372.5,y:810,width:765,height:400,viewBox:'0 0 765 400',overflow:'hidden'});
  art.append(belly);
  part('ventre',0,0,765,6400,'mokona-belly',belly);
  const defs = svg('defs',{});
  const light = svg('radialGradient',{id:'mokona-reveal-light'});
  for (const [offset,color,opacity] of [['0%','#fffcef',.95],['22%','#d2f3ff',.74],['54%','#bcb7ff',.34],['100%','#c4bbff',0]]) {
    light.append(svg('stop',{offset,'stop-color':color,'stop-opacity':opacity}));
  }
  defs.append(light);
  art.append(defs);
  const glimmer = svg('g',{class:'mokona-glimmer'});
  glimmer.append(svg('circle',{cx:1762,cy:479,r:173,fill:'url(#mokona-reveal-light)'}));
  glimmer.append(svg('path',{d:'M1762 432 Q1765 474 1787 479 Q1766 481 1762 521 Q1759 484 1736 479 Q1758 474 1762 432Z',fill:'#fffbe5'}));
  art.append(glimmer);
  part(8187,1526,630,462,54);
  const paw = part(8188,1343,614,149,153);
  part(8189,1926,671,142,134);
  part(8190,1263,822,400,372);
  part(8191,1530,537,454,59);
  const mouths = [32,158,219].map((h,i) => part(8192+i,1675,656,168,h));
  function mouth(index) {
    mouths.forEach((node,i) => node.style.display = i === index ? '' : 'none');
  }
  let lines, page, timer, typing, landing;
  function finishLine() {
    clearTimeout(timer);
    typing = false;
    copy.lastChild.textContent = lines[page];
    mouth(0);
  }
  function speak() {
    const line = lines[page];
    copy.firstChild.textContent = line;
    copy.firstChild.setAttribute('aria-hidden','false');
    copy.firstChild.style.visibility = 'visible';
    copy.firstChild.style.opacity = '0';
    copy.lastChild.textContent = '';
    next.textContent = lines[page+2];
    let i = 0;
    typing = true;
    function write() {
      if (i >= line.length || reduced.matches) return finishLine();
      i++;
      const letter = line[i-1];
      copy.lastChild.textContent = line.slice(0,i);
      if (/[!?,.]/.test(letter)) mouth(0);
      else if (i % 3 === 1) mouth([1,2,1,0,1][Math.floor(i/3)%5]);
      timer = setTimeout(write, /[!?,.]/.test(letter) ? 165 : 30);
    }
    write();
  }
  const sleepingArt = svg('svg',{viewBox:'1290 888 330 228','aria-hidden':'true'});
  bed.append(sleepingArt);
  // Both ears share a source layer; hinge each half at its attachment to the head.
  for (const [x,width,side] of [[1296,150,'left'],[1446,170,'right']]) {
    const ear = svg('g',{class:'bed-ear-'+side});
    const clip = svg('svg',{x,y:891,width,height:81,viewBox:x+' 891 '+width+' 81',overflow:'hidden'});
    sleepingArt.append(ear);
    ear.append(clip);
    part(8206,1296,891,320,81,'',clip);
  }
  part(8205,1292,932,304,177,'bed-body',sleepingArt);
  part(8212,1369,1051,175,62,'',sleepingArt);
  part(8207,1424,1028,84,35,'asleep-part',sleepingArt);
  part(8208,1390,1006,145,38,'awake-part',sleepingArt);
  part(8213,1401,977,100,29,'asleep-part',sleepingArt);
  part(8214,1399,973,103,30,'awake-part',sleepingArt);
  const bedMouths = [16,31,44].map((h,i)=>part(8209+i,1438,998,35,h,'',sleepingArt));
  const bedBubble = document.createElement('button');
  bedBubble.type = 'button';
  bedBubble.className = 'mokona-bed-bubble';
  bedBubble.setAttribute('data-room-v2-layer','mokona-bubble');
  bedBubble.hidden = true;
  bedBubble.setAttribute('data-nana-load-ignore','');
  bedBubble.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true" class="hint-space"></span>';
  scene.append(bedBubble);
  const bubbleText = bedBubble.firstChild;
  let bedTimer, hint, letters;
  const french = () => document.documentElement.lang !== 'en';
  function bedMouth(index) {
    bedMouths.forEach((node,i)=>node.style.display=i===index?'':'none');
  }
  function sleep() {
    clearTimeout(bedTimer);
    bedBubble.hidden = true;
    bed.classList.remove('awake');
    bed.setAttribute('aria-expanded','false');
    bed.setAttribute('aria-label',french()?'Réveiller Mokona':'Wake Mokona');
    bedMouth(0);
  }
  function showHint() {
    if (letters >= hint.length || reduced.matches) {
      letters = hint.length;
      bubbleText.textContent = hint;
      bedMouth(0);
      return;
    }
    const ch = hint[letters++];
    bubbleText.textContent = hint.slice(0,letters);
    if (/[.,!?]/.test(ch)) bedMouth(0);
    else if (letters % 3 === 1) bedMouth([1,2,1,0,1][Math.floor(letters/3)%5]);
    bedTimer = setTimeout(showHint,/[.,!?]/.test(ch)?190:40);
  }
  function chooseHint(progress, language) {
    const say = (fr,en) => language === 'fr' ? fr : en;
    if (!progress) return say('Mon carnet fait la sieste… Reviens dans un instant !','My notebook is dozing… Come back in a moment!');
    const kodamaCount = [1,2,3,4,5].filter(n => progress.hasFeat('kodama-'+n)).length;
    if (kodamaCount > 0 && kodamaCount < 5 && !progress.hasFeat('mononoke-kodama')) {
      const left = 5-kodamaCount;
      return left === 1
        ? say('Psst… Encore un petit esprit blanc à trouver !','Psst… One little white spirit is still hiding!')
        : say('Psst… Il reste '+left+' petits esprits blancs à trouver !','Psst… There are '+left+' little white spirits still hiding!');
    }
    const clues = [
      ['noiraudes-seen','Tu as vu ce qui dépasse du coin de la couette ?','Have you peeked under the corner of the duvet?'],
      ['secret-rug','Tu as regardé sous le tapis ? Moi, j’y ai vu des pattes…','Have you peeked under the rug? I saw some little legs…'],
      ['alice-bottle','Cette petite fiole sur la table… Tu crois que c’est pour boire ?','That little bottle on the table… Do you think it’s for drinking?'],
      ['secret-memory-box','Ce carreau sur le mur… Tu crois qu’il cache quelque chose ?','That tile on the wall… Could something be hiding behind it?'],
      ['kero-awake','Hé… Je crois que quelqu’un dort sur l’étagère au-dessus de l’écran.','Hey… I think someone is asleep on the shelf above the screen.'],
      ['olive-van-started','Tu crois que le petit van démarre encore ?','Do you think that little van still runs?'],
      ['nana-zola-book','Tiens, un livre qui s’appelle Nana… Tu l’as ouvert ?','Look, a book called Nana… Have you opened it?'],
      ['mononoke-kodama','Psst… J’ai compté cinq petits esprits blancs dans la chambre. Et toi ?','Psst… I counted five little white spirits in the room. Can you find them?']
    ];
    const clue = clues.find(([id]) => !progress.hasFeat(id));
    if (clue) return say(clue[1],clue[2]);
    const outfit = progress.outfits.find(item => item.available !== false && item.rule && !progress.unlockedOutfit(item.id));
    if (outfit) return outfit.rule[language];
    return say('Tu as suivi toutes mes pistes ! Je retourne à ma sieste…','You followed all my clues! Time for my nap…');
  }
  function wakeOrDismiss(event) {
    event.stopPropagation();
    if (!bedBubble.hidden) {
      if (letters < hint.length) {
        clearTimeout(bedTimer);
        letters = hint.length;
        showHint();
      } else sleep();
      return;
    }
    hint = chooseHint(window.NanaProgress, french() ? 'fr' : 'en');
    letters = 0;
    bedBubble.lastElementChild.textContent = hint;
    bed.setAttribute('aria-expanded','true');
    bed.classList.add('awake');
    bedBubble.setAttribute('aria-label',hint);
    bedBubble.hidden = false;
    showHint();
  }
  bed.onclick = bedBubble.onclick = wakeOrDismiss;
  sleep();
  async function settle() {
    if (landing) return;
    landing = true;
    finishLine();
    const start = art.getBoundingClientRect();
    const card = dialog.querySelector('.mokona-card');
    stage.style.setProperty('--veil','0');
    bed.style.visibility = 'hidden';
    bed.hidden = false;
    const viewport = scene.parentElement;
    const target = bed.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    const margin = 12;
    const dxScroll = target.left < bounds.left + margin ? target.left - bounds.left - margin
      : Math.max(0, target.right - bounds.right + margin);
    const finalScroll = Math.max(0,Math.min(viewport.scrollWidth-viewport.clientWidth,viewport.scrollLeft + dxScroll));
    const pan = finalScroll - viewport.scrollLeft;
    if (pan) viewport.scrollTo({left:finalScroll,behavior:reduced.matches?'instant':'smooth'});
    const scale = target.width/start.width;

    // Hold the exact hovering pose, then blend the drawings on one moving surface.
    const hover = getComputedStyle(floater).transform;
    floater.style.animation = 'none';
    floater.style.transform = hover;
    const seated = sleepingArt;
    seated.classList.add('mokona-landing-pose');
    seated.style.height = (target.height / scale) + 'px';
    floater.append(seated);
    const duration = reduced.matches ? 0 : 2250;
    const options = {duration,fill:'forwards'};
    const base = floater.getBoundingClientRect();
    const move = (x,y,k) => 'translate('+x+'px,'+y+'px) scale('+k+')';
    floater.style.transform = 'none';
    const unshifted = floater.getBoundingClientRect();
    const hoverY = base.top-unshifted.top;
    const dx = target.left - pan + target.width/2 - unshifted.left - start.width/2;
    const dy = target.bottom - unshifted.top - start.height;
    const frames = Array.from({length:31},(_,i)=>{
      const t=i/30, f=t*t*(3-2*t);
      const k = Math.pow(scale,f);
      // Follow the centre of the feet while the drawing recedes in perspective.
      return {offset:t,transform:move(dx*f + start.width*(1-k)/2, hoverY*(1-f) + dy*f + start.height*(1-k) - Math.min(95,innerHeight*.11)*Math.sin(Math.PI*f), k)};
    });
    const transition = [
      floater.animate(frames,options),
      card.animate([{opacity:1},{opacity:0,offset:.24},{opacity:0}],options),
      // Tuck the hanging foot around its hip while the silhouette is still clear.
      trailingFoot.animate([
        {offset:0,transform:'none'},
        {offset:.22,transform:'none',easing:'ease-in-out'},
        {offset:.84,transform:'translate(-80px,-26px) rotate(-46deg) scale(.8)'},
        {transform:'translate(-80px,-26px) rotate(-46deg) scale(.8)'}
      ],options),
      // Align the two forehead jewels before the seated drawing takes over.
      art.animate([{transform:'none'},{offset:.47,transform:'none'},
        {offset:.78,transform:'translate(-1.5%,4%) scale(1.13)'},{transform:'translate(-1.5%,4%) scale(1.13)'}],options),
      art.animate([{opacity:1},{opacity:1,offset:.80},{opacity:0,offset:.91},{opacity:0}],options),
      seated.animate([{opacity:0},{opacity:0,offset:.80},{opacity:1,offset:.91},{opacity:1}],options)

    ];
    try { await transition[0].finished; }
    finally {
      seated.classList.remove('mokona-landing-pose');
      seated.style.height='';
      bed.append(seated);
      sleep();
      bed.style.visibility = '';
      dialog.close();
      stage.hidden = true;
      stage.classList.remove('hovering');
      transition.forEach(animation=>animation.cancel());
      floater.style.transform='';
      landing = false;
    }
  }
  next.onclick = () => {
    if (landing) return;
    if (typing) return finishLine();
    if (page === 1) { page++; speak(); }
    else settle();
  };
  dialog.addEventListener('cancel', event => {event.preventDefault();if (!dialog.classList.contains('revealing')) settle();});
  scene.addEventListener('incense:start', () => {
    sleep();
    bed.hidden = true;
    floater.append(art);
    mouth(0);
  });
  // Stage only the character under the existing smoke. Moving the live canvas
  // between the room and a modal interrupts its observer and compositor on iPad.
  const stage = document.createElement('div');
  stage.className = 'mokona-stage';
  stage.setAttribute('data-room-v2-layer','mokona-reveal');
  stage.setAttribute('data-nana-load-ignore','');
  stage.hidden = true;
  scene.append(stage);
  // Keep the illustration in room coordinates for the whole encounter. The native
  // dialog contains the controls and a same-size spacer for the drawing.
  const space = document.createElement('div');
  space.className = 'mokona-float mokona-art mokona-spacer';
  floater.replaceWith(space);
  const sceneLayout = document.createElement('div');
  sceneLayout.className = 'mokona-content';
  const cardSpace = document.createElement('div');
  cardSpace.className = 'mokona-card mokona-spacer';
  sceneLayout.append(floater,cardSpace);
  stage.append(sceneLayout);
  function pinStage() {
    if (stage.hidden) return;
    const rect = scene.getBoundingClientRect();
    Object.assign(stage.style,{left:-rect.left+'px',top:-rect.top+'px',width:innerWidth+'px',height:innerHeight+'px'});
  }
  scene.parentElement.addEventListener('scroll',pinStage,{passive:true});
  window.addEventListener('resize',pinStage);
  const heldImages = [];
  scene.addEventListener('incense:start', () => {
    if (heldImages.length) return;
    const urls = new Set([...art.querySelectorAll('image'),...sleepingArt.querySelectorAll('image')].map(image=>image.getAttribute('href')));
    for (const url of urls) {
      const image = new Image();
      image.src = url;
      heldImages.push(image);
      image.decode().catch(()=>{});
    }
  });
  scene.addEventListener('incense:start', () => {
    if (dialog.open || landing) return;
    lines = words[document.documentElement.lang === 'en' ? 'en' : 'fr'];
    page = 1;
    floater.append(art);
    floater.style.animation = '';
    floater.style.transformOrigin = 'top left';
    dialog.querySelector('.mokona-card').style.visibility = '';
    dialog.querySelector('h2').textContent = lines[0];
    dialog.classList.add('revealing');
    stage.style.setProperty('--veil','0');
    glimmer.style.opacity = '0';
    floater.style.setProperty('--extent','-24%');
    next.disabled = true;
    stage.classList.add('revealing');
    floater.style.opacity = '0';
    stage.hidden = false;
    pinStage();
  });
  scene.addEventListener('incense:clearing', ({detail:{clearing}}) => {
    if (!dialog.classList.contains('revealing')) return;
    const t = Math.min(1,Math.max(0,(clearing-2.65)/4.55));
    const unveiling = t*t*(3-2*t);
    floater.style.opacity = String(unveiling);
    floater.style.setProperty('--extent',(-30+170*unveiling)+'%');
    const pulse = Math.sin(Math.PI*t);
    glimmer.style.opacity = String(reduced.matches ? 0 : .38*pulse*pulse);
    const veil = String(.24 * unveiling * unveiling);
    stage.style.setProperty('--veil',veil);
    if (clearing < 7.8) return;
    stage.classList.remove('revealing');
    stage.classList.add('hovering');
    dialog.classList.remove('revealing');
    paw.setAttribute('class','mokona-wave');
    next.disabled = false;
    dialog.showModal();
    next.focus({preventScroll:true});
    if (!reduced.matches) dialog.querySelector('.mokona-card').animate([{opacity:0},{opacity:1}],{duration:420});
    speak();
  });
})();

