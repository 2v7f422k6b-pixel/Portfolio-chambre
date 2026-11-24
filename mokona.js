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
  const bed = document.createElement('div');
  bed.className = 'mokona-bed';
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
  part(8184,1811,965,204,504);
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
  async function settle() {
    if (landing) return;
    landing = true;
    finishLine();
    const start = art.getBoundingClientRect();
    dialog.querySelector('.mokona-card').style.visibility = 'hidden';
    bed.hidden = false;
    const landingBox = bed.getBoundingClientRect();
    if (landingBox.right < 0 || landingBox.left > innerWidth) bed.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    const target = bed.getBoundingClientRect();
    const scale = target.width/start.width;
    const dx = target.left-start.left, dy = target.top-start.top;
    floater.style.animation = 'none';
    const flight = floater.animate([
      {transform:'translate(0,0) scale(1)'},
      {transform:'translate(0,5px) scale(1)',offset:.13},
      {transform:'translate('+dx*.46+'px,'+(dy*.40-55)+'px) scale('+(scale*.45+.55)+')',offset:.52},
      {transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')'}
    ],{duration:reduced.matches?0:780,easing:'ease-in-out',fill:'forwards'});
    await flight.finished;
    bed.append(art);
    flight.cancel();
    dialog.close();
    landing = false;
  }
  next.onclick = () => {
    if (landing) return;
    if (typing) return finishLine();
    if (page === 1) { page++; speak(); }
    else settle();
  };
  dialog.addEventListener('cancel', event => {event.preventDefault();if (!dialog.classList.contains('revealing')) settle();});
  scene.addEventListener('incense:start', () => {
    bed.hidden = true;
    floater.append(art);
    mouth(0);
  });
  const foreground = document.createElement('div');
  foreground.className = 'mokona-smoke';
  foreground.inert = true;
  dialog.append(foreground);
  scene.addEventListener('incense:reveal', event => {
    if (dialog.open || landing) return;
    lines = words[document.documentElement.lang === 'en' ? 'en' : 'fr'];
    page = 1;
    floater.append(art);
    floater.style.animation = '';
    floater.style.transformOrigin = 'top left';
    dialog.querySelector('.mokona-card').style.visibility = '';
    dialog.querySelector('h2').textContent = lines[0];
    dialog.classList.add('revealing');
    dialog.style.setProperty('--veil','0');
    glimmer.style.opacity = '0';
    floater.style.setProperty('--extent','-24%');
    next.disabled = true;
    dialog.showModal();
    foreground.append(event.detail);
  });
  scene.addEventListener('incense:clearing', ({detail:{rect, clearing}}) => {
    if (!dialog.classList.contains('revealing')) return;
    // Keep the original running smoke canvas in its room coordinates above the character.
    Object.assign(foreground.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    const progress = Math.min(1,clearing/6.6);
    const unveiling = Math.max(0,(progress-.16)/.84);
    floater.style.setProperty('--extent',(-10+145*unveiling)+'%');
    const pulse = Math.sin(Math.PI * Math.min(1,clearing/5.4));
    glimmer.style.opacity = String(reduced.matches ? 0 : pulse * pulse);
    dialog.style.setProperty('--veil',String(.24 * progress * progress));
    if (clearing < 7.8) return;
    scene.append(foreground.firstElementChild);
    dialog.classList.remove('revealing');
    paw.setAttribute('class','mokona-wave');
    next.disabled = false;
    next.focus({preventScroll:true});
    if (!reduced.matches) dialog.querySelector('.mokona-card').animate([{opacity:0},{opacity:1}],{duration:420});
    speak();
  });
})();
