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
  // Stretch only the lower half of the same drawing, keeping the face still.
  function bodySlice(y, height, className) {
    const slice = svg('svg', {x:1408,y,width:695,height,viewBox:'1408 '+y+' 695 '+height,overflow:'hidden',class:className});
    art.append(slice);
    part(8186,1408,340,695,870,'',slice);
  }
  bodySlice(340,491,'');
  bodySlice(830,380,'mokona-belly');
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
    bed.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    const target = bed.getBoundingClientRect();
    const scale = target.width/start.width;
    const dx = target.left-start.left, dy = target.top-start.top;
    floater.style.animation = 'none';
    const flight = floater.animate([
      {transform:'translate(0,0) scale(1)'},
      {transform:'translate(0,5px) scale(1.015,.98)',offset:.13},
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
  dialog.addEventListener('cancel', event => {event.preventDefault();settle();});
  scene.addEventListener('incense:start', () => {
    bed.hidden = true;
    floater.append(art);
    mouth(0);
  });
  scene.addEventListener('incense:reveal', () => {
    if (dialog.open || landing) return;
    lines = words[document.documentElement.lang === 'en' ? 'en' : 'fr'];
    page = 1;
    floater.append(art);
    floater.style.animation = '';
    floater.style.transformOrigin = 'top left';
    dialog.querySelector('.mokona-card').style.visibility = '';
    dialog.querySelector('h2').textContent = lines[0];
    paw.setAttribute('class','mokona-wave');
    dialog.showModal();
    if (!reduced.matches) dialog.querySelector('.mokona-content').animate(
      [{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:680,easing:'ease-out'}
    );
    speak();
  });
})();
