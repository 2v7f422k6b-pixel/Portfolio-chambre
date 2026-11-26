(() => {
  const scene = document.querySelector('#play-scene');
  if (!scene || !window.NanaRoomV2) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const words = {
    fr: ['Mokona débloqué !', 'Coucou, moi c’est Mokona ! Certains objets de cette chambre cachent un secret. Touche-les pour les découvrir. Tu peux retrouver tes découvertes dans ton carnet.', 'Tiens, ton premier badge ! Chaque découverte fait grimper le pourcentage en haut de l’écran. À certains paliers, ou quand tu termines une collection, j’ai un nouveau badge pour toi.', 'Si tu ne sais plus où chercher, viens me voir sur le lit. Je te donnerai un petit indice. Tu vois le coussin étoile ? C’est là que je t’attends !', 'Continuer', 'À tout à l’heure, Mokona !'],
    en: ['Mokona unlocked!', 'Hi, I’m Mokona! Some objects in this room are hiding secrets. Tap them to explore, then look in your notebook to see what you’ve found.', 'Here’s your first badge! Each discovery raises the percentage at the top. Reach a milestone or complete a collection and I’ll have another badge for you.', 'Need a hint? Come find me on the bed. See the star pillow? That’s where I’ll be!', 'Continue', 'See you soon, Mokona!']
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
  let handBadge;
  let lines, page, timer, typing, landing;
  function offerFirstBadge(){
    if(!handBadge){
      const badge=window.NanaProgress.stickers.find(b=>b.id==='glance');
      handBadge=window.NanaBadgeArt(badge);
      for(const [key,value] of Object.entries({x:1185,y:454,width:248,height:248}))handBadge.setAttribute(key,value);
      paw.before(handBadge);
      document.dispatchEvent(new Event('mokona-first-badge'));
    }
  }
  function finishLine() {
    clearTimeout(timer);
    typing = false;
    copy.lastChild.textContent = lines[page];
    mouth(0);
    if(page===1)offerFirstBadge();
  }
  function speak() {
    const line = lines[page];
    copy.firstChild.textContent = line;
    copy.firstChild.setAttribute('aria-hidden','false');
    copy.firstChild.style.visibility = 'visible';
    copy.firstChild.style.opacity = '0';
    copy.lastChild.textContent = '';
    if(handBadge)handBadge.style.display=page===2?'':'none';
    next.textContent = lines[page===3?5:4];
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
  const bedClues = [
    ["kodamaPartial","Chut… Tu entends ce petit clac ? Il y en a encore un qui te regarde.","Shh… Hear that little click? One of them is still watching you."],
    ["miffyPartial","Miffy m’a fait promettre de garder la suite pour moi. Demande-lui, à elle !","Miffy made me promise to keep the rest a secret. Ask her yourself!"],
    ["sonnyPartial","Les grandes oreilles, ça aide à écouter. Lui, il s’en sert surtout pour se faire écouter…","Big ears are handy for listening. That little fellow prefers an audience…"],
    ["polaroidPartial","Tu as retourné toutes les photos ? Même celle qui avait l’air bien sage ?","Have you turned over every photo? Even the innocent-looking one?"],
    ["feat:fish-mobile-seen","Les poissons au mur jurent qu’ils savent nager. Moi, j’aimerais bien voir ça.","Those fish on the wall swear they can swim. I’d like to see that."],
    ["feat:noiraudes-seen","Ça chatouille sous la couette. Moi ? Mais tu vois bien mes deux pattes !","Something tickles under the duvet. Me? You can see both my paws!"],
    ["visit:jeu/word-lab","Un mot est tombé de l’étagère du haut. Tu crois qu’on peut le remettre dans une autre phrase ?","A word fell off the top shelf. Think we could slip it into a different sentence?"],
    ["feat:secret-cookie","Un biscuit qui connaît ton avenir… Est-ce qu’il sait aussi ce qui va lui arriver ?","A biscuit that knows your future… I wonder if it knows its own."],
    ["feat:alice-bottle","Sur la table, il y a une toute petite fiole. Enfin… petite, de mon point de vue.","There’s a tiny bottle on the table. Well… tiny from where I’m sitting."],
    ["visit:jeu/bead-box","J’ai essayé d’enfiler une perle. Tu as déjà essayé avec des pattes comme ça ?","I tried threading a bead. Ever tried it with paws like these?"],
    ["feat:secret-memory-box","Ce carreau sonne creux. Comment je le sais ? Oh, comme ça…","That tile sounds hollow. How would I know? Oh, just a hunch…"],
    ["visit:jeu/mimilab","Je connais une chanson à une seule touche. Tu me prêtes le petit clavier ?","I know a one-key tune. May I borrow that little keyboard?"],
    ["visit:jeu/do-nothing","L’ours du lit a fondé un club. Il paraît que j’y suis très doué.","The bear on the bed started a club. Apparently I’m very good at it."],
    ["feat:secret-twist","Ce bretzel me donne le tournis. Et je n’y ai même pas goûté.","That pretzel makes my head spin. I haven’t even had a bite."],
    ["visit:photos","L’appareil rose m’a tiré le portrait. Tu crois qu’il a gardé mon bon profil ?","The pink camera took my picture. Think it got my good side?"],
    ["visit:jeu/tamagotchi","Quelqu’un réclame de l’attention dans une petite coquille rose. Pour une fois, ce n’est pas moi.","Someone in a little pink shell wants attention. For once, it isn’t me."],
    ["feat:kero-awake","Il paraît que je suis le seul à faire la sieste ici. Va donc vérifier au-dessus de l’écran.","I’m told I’m the only one napping here. Have a peek above the screen."],
    ["visit:jeu/coloring","Si tu prends un crayon, je te promets de rester dans les lignes. Enfin… je vais essayer.","Pick a pencil and I promise to stay inside the lines. Well… I’ll try."],
    ["feat:mononoke-kodama","On joue à cache-cache. J’ai fermé les yeux et cinq petites têtes ont disparu.","We’re playing hide-and-seek. I shut my eyes and five little heads vanished."],
    ["visit:jeu/latte","Tu vois quelque chose dans la mousse du café ? Moi, deux longues oreilles. Étrange, hein ?","See anything in the milk foam? I see two long ears. Funny, that."],
    ["gachaEmpty","Si tu tournes la poignée, je devine la surprise. Mais seulement après toi.","Turn the handle and I’ll guess the surprise. You go first, though."],
    ["feat:olive-van-started","J’ai réservé la place près de la fenêtre. Il manque juste quelqu’un pour démarrer le van.","I’ve claimed the window seat. All we need is someone to start the van."],
    ["feat:nana-zola-book","Nana est sur l’étagère. Si, si. Cette Nana-là tient entre deux couvertures.","Nana’s on the shelf. Really. This Nana fits between two covers."],
    ["feat:paprika-butterfly","Ce papillon vient de passer devant mon nez. Il te connaît, toi ?","That butterfly just flew past my nose. Is it a friend of yours?"],
    ["dialogue:miffy","Miffy a mis son costume de clown. Tu lui demandes qui ouvre le spectacle ?","Miffy’s got her clown costume on. Ask her who opens the show."],
    ["dialogue:sonny-angel","Le petit aux oreilles de lapin veut te dire un truc. J’ai essayé d’écouter, mais il t’attend.","The little fellow with bunny ears has something to say. I listened in, but he’s waiting for you."],
    ["feat:secret-typewriter","Une touche de la machine à écrire me démange. Je te laisse appuyer ?","One of those typewriter keys is begging to be pressed. After you?"],
    ["visit:objet/plante-fleur","J’ai dit bonjour à la plante suspendue. À toi de voir si elle est polie.","I said hello to the hanging plant. You can find out if it has manners."],
    ["feat:kikujiro-chime","Tu crois qu’on peut chatouiller une clochette ? Moi, je tends l’oreille.","Think you can tickle a little bell? I’m all ears."],
    ["feat:preacher-dog","Le petit chien a l’air d’en savoir long. Demande-lui ce qu’il a vu.","That little dog looks like he knows things. Ask him what he saw."],
    ["feat:gokinjo-happy-berry","Cette baie sur le lit est bien dodue. Trop grosse pour mon goûter, tu crois ?","That berry on the bed looks rather plump. Too big for my afternoon snack?"],
    ["feat:nana-blast","Quelqu’un a gardé son billet de concert. Moi, j’aurais gardé le groupe aussi.","Someone kept their concert ticket. I’d have kept the band too."],
    ["visit:jeu/dressing","Si tu vois deux Mokona, c’est que tu as trouvé le miroir. Et après ?","If you see two of me, you’ve found the mirror. What happens next?"],
    ["feat:kokeshi-yukata","La poupée de bois est bien silencieuse. Essaie toujours, tu es peut-être sa personne préférée.","That wooden doll is awfully quiet. Try your luck. Maybe you’re her favourite."],
    ["visit:night","Tu éteins ? J’aimerais vérifier une petite théorie sur ce qui brille dans le noir.","Lights out? I have a little theory about things that glow in the dark."],
    ["feat:shooting-star-encounter","La nuit, prépare ton vœu avant de regarder le ciel. Là-haut, personne ne t’attend.","At night, have your wish ready before you look up. The sky won’t wait."],
    ["feat:ufo-encounter","Si tu vois quelque chose d’étrange par la fenêtre cette nuit… fais-lui coucou de ma part.","If you spot anything odd outside the window tonight… give it a wave from me."],
    ["feat:beads-made","Une perle, c’est joli. Deux, ça se discute. Et si tu en essayais trois ?","One bead is pretty. Two, I’m not sure. What about three?"],
    ["feat:minilab-composed","Le petit clavier a de la mémoire. Quelle mélodie vas-tu lui confier ?","That little keyboard can remember things. What tune will you trust it with?"],
    ["feat:latte-made","Je prendrai un café avec mon portrait dans la mousse. Les oreilles tiendront dans la tasse ?","I’ll have a coffee with my portrait in the foam. Will the ears fit in the cup?"],
    ["feat:outfit-styled","Le miroir m’a demandé de changer de tenue. Tu lui montres comment tu fais ?","The mirror asked me to change outfits. Will you show it how it’s done?"],
    ["visit:jeu/severance","Du côté Work, des chiffres attendent sagement. Beaucoup trop sagement, si tu veux mon avis.","Over in Work, some numbers are behaving themselves. Suspiciously well, if you ask me."],
    ["visit:livre/la-princesse-clown","Une princesse avec un nez de clown ? Ça, j’aimerais bien qu’on me le lise.","A princess with a clown nose? Now that’s a bedtime story I’d listen to."],
    ["visit:objet/marshall","Tu entends ce silence sur l’étagère ? Je parie que la petite enceinte peut faire mieux.","Hear that silence on the shelf? I bet the little speaker can do better."],
    ["visit:objet/music-visuals","De la musique pour les yeux ? Regarde du côté des CD, tu me diras si j’invente.","Music for your eyes? Have a look at the CDs and tell me if I made that up."],
    ["visit:objet/souvenues","Les livres du milieu se serrent comme s’ils gardaient un secret à plusieurs.","Those books in the middle are huddled together. A shared secret, perhaps?"],
    ["visit:objet/reading-room","Pour savoir quoi lire au lit, je demande à l’étagère du bas. Elle a bon goût.","For a good bedtime read, I ask the bottom shelf. It has excellent taste."],
    ["visit:objet/gabzilla","Tu as vu qui s’est installé sur le t-shirt de la chaise ? Moi, je lui laisse la place.","Seen who’s on the T-shirt draped over the chair? They can keep that seat."],
    ["feat:rested","L’ours et moi faisons un concours de rien du tout. Tu restes un peu avec nous ?","The bear and I are having a do-nothing contest. Care to stay a while?"],
    ["feat:severance-refined","Les chiffres de Lumon sont très pointilleux sur le rangement. Quatre catégories, vraiment ?","Those Lumon numbers are terribly fussy about sorting. Four categories, really?"],
    ["landscapePartial","Le cadran a quatre paysages en tête. Tu les as tous vus, toi ?","That dial has four places in mind. Have you seen them all?"],
    ["gachaPartial","Il manque quelqu’un à l’appel des figurines. La machine fait semblant de ne rien savoir.","Someone’s missing at figurine roll call. The machine is pretending it knows nothing."]
  ];
  function chooseHint(progress, language) {
    const english = language === 'en';
    if (!progress) return ["Mon carnet dort sur la page qui m’intéresse. Tu reviens dans un instant ?","My notebook fell asleep on the very page I wanted. Come back in a moment?"][Number(english)];
    const count = (prefix, first, total) => Array.from({length:total},(_,i)=>progress.hasFeat(prefix+(first+i))).filter(Boolean).length;
    const kodama = count('kodama-',1,5);
    const figures = count('charm-gacha-',7545,15);
    const reading = id => {
      const {read,total} = progress.dialogueProgress(id);
      return read.length > 0 && read.length < total;
    };
    const started = {
      kodamaPartial:kodama > 0 && kodama < 5 && !progress.hasFeat('mononoke-kodama'),
      miffyPartial:reading('miffy'), sonnyPartial:reading('sonny-angel'),
      polaroidPartial:progress.hasVisit('photos') && !progress.hasFeat('polaroids-all'),
      landscapePartial:progress.snapshot().room.counters.landscapes[0]<4,
      gachaEmpty:figures === 0, gachaPartial:figures > 0 && figures < 15
    };
    const clue = bedClues.find(([key]) => {
      const [type,id] = key.split(':');
      if (type === 'feat') return !progress.hasFeat(id);
      if (type === 'visit') return !progress.hasVisit(id);
      if (type === 'dialogue') return !progress.hasReadDialogue(id);
      return started[key];
    });
    if (clue) return clue[english ? 2 : 1];
    return ["Plus un secret dans ma manche. D’ailleurs… où est ma manche ?","Not a secret left up my sleeve. Come to think of it… where’s my sleeve?"][Number(english)];
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
    if(window.NanaJournal?.offerBadge?.()) return;
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
      discovered=true;
      try{localStorage.setItem(discoveryKey,'1');}catch{}
      syncEntry();
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
    if (page < 3) { page++; speak(); }
    else settle();
  };
  dialog.addEventListener('cancel', event => {event.preventDefault();if (!dialog.classList.contains('revealing')) next.click();});
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
  const discoveryKey = 'nana-mokona-discovered-v1';
  let discovered = false;
  function restoreDiscovery() {
    try { discovered ||= localStorage.getItem(discoveryKey) === '1'; }
    catch (_) { /* Keep the current visit working without storage. */ }
    syncEntry();
    if (!discovered || dialog.open || landing) return;
    dialog.classList.remove('revealing');
    stage.classList.remove('revealing');
    stage.hidden = true;
    bed.hidden = false;
  }
  const app=document.getElementById('app');
  let gate=false, promptTimer;
  function centerBowl(){
    const button=scene.querySelector('.incense-entry');
    if(!gate || !button)return;
    const viewport=scene.parentElement;
    const b=button.getBoundingClientRect(),v=viewport.getBoundingClientRect();
    if(b.width && (b.left<v.left+16 || b.right>v.right-16))
      viewport.scrollLeft+=b.left+b.width/2-v.left-v.width/2;
  }
  const objectBubble=document.createElement('div');
  objectBubble.dataset.roomV2Layer='mokona-hint';
  objectBubble.className='mokona-object-hint';objectBubble.hidden=true;objectBubble.setAttribute('role','status');
  scene.append(objectBubble);
  const objectVoices=[
    ['[data-open="latte"]','Hé, moi je refroidis ! Ce qui fume encore, c’est le bol.','Hey, I’m getting cold! It’s the bowl that’s still smoking.'],
    ['[data-open="phone"]','Allô ? Ça capte mal… Essaie du côté du bol qui fume.','Hello? Bad reception… Try the little smoking bowl.'],
    ['[data-open="do-nothing"]','Encore cinq minutes… Tu peux t’occuper de la fumée ?','Five more minutes… Could you see to the smoke?'],
    ['[data-open="tamagotchi"]','Bip. Bip. BOL DÉTECTÉ. Bip.','Beep. Beep. SMOKING BOWL DETECTED. Beep.'],
    ['[data-open="book"],#nana-zola-book,[data-object="nana-zola-book"],[data-room-zone-id^="livres-"]','Au premier chapitre, une main effleure la fumée…','In the first chapter, a hand brushes against the smoke…'],
    ['[data-open="work-zoom"]','Un instant… Le bol essaie de se connecter.','One moment… The incense bowl is trying to connect.'],
    ['[data-open="polaroids"]','Bouge un peu le doigt vers la fumée… Oui, joli cadrage !','Move your finger towards the smoke… Yes, lovely framing!'],
    ['#room-hanging-plant,[data-open="plantasia"],[data-object="plant"]','Ça me chatouille les feuilles, cette fumée…','That smoke tickles my leaves…'],
    ['[data-type="poster"]','Psst. D’ici, je vois quelque chose bouger au-dessus du bol.','Psst. From up here I can see something moving above the bowl.'],
    ['[data-open="music"],[data-mv-open],[data-room-zone-id="cds"]','Tu vois la fumée ? Elle danse même quand je me tais.','See the smoke? It dances even when I’m quiet.'],
    ['#cat-cv-hit,[data-room-zone-id="chat"]','Mrrr… Une patte dans la fumée ? Après ma sieste.','Mrrr… A paw in the smoke? After my nap.']
  ];
  function hideHint(){clearTimeout(promptTimer);objectBubble.hidden=true;}
  function objectHint(event){
    if(!stage.hidden)return;
    const rect=scene.getBoundingClientRect();
    const keyboard=event.type==='keydown'||(event.type==='click' && event.detail===0);
    const box=event.target.getBoundingClientRect();
    const x=keyboard?box.left+box.width/2:event.clientX;
    const y=keyboard?box.top+box.height/2:event.clientY;
    const targets=keyboard?[event.target]:document.elementsFromPoint(x,y).filter(el=>scene.contains(el));
    const voice=targets.map(el=>objectVoices.find(([selector])=>el.closest(selector))).find(Boolean);
    if(!voice && !targets.some(el=>el.closest('button,[role="button"],[tabindex="0"],[data-open],[data-object],[data-room-zone-id],.new-room-object')))return hideHint();
    const en=document.documentElement.lang.startsWith('en');
    objectBubble.textContent=voice?voice[en?2:1]:(en?'Psst… Have you tried touching the smoke?':'Psst… Tu as essayé de toucher la fumée ?');
    objectBubble.hidden=false;
    const viewport=scene.parentElement.getBoundingClientRect();
    const left=Math.max(viewport.left+6,Math.min(x-objectBubble.offsetWidth/2,viewport.right-objectBubble.offsetWidth-6));
    objectBubble.style.left=(left-rect.left)+'px';
    objectBubble.style.top=(Math.max(viewport.top+4,y-objectBubble.offsetHeight-12)-rect.top)+'px';
    objectBubble.style.setProperty('--tail',Math.min(objectBubble.offsetWidth-12,Math.max(8,x-left))+'px');
    clearTimeout(promptTimer);promptTimer=setTimeout(hideHint,3900);
  }
  function syncEntry(){
    const lock=!discovered && app.classList.contains('mode-play') && !window.NanaProgress?.suppressed?.();
    if(lock===gate)return;
    gate=lock;
    scene.classList.toggle('mokona-first',gate);
    hideHint();
    if(gate)requestAnimationFrame(centerBowl);
  }
  new ResizeObserver(centerBowl).observe(scene.parentElement);
  new MutationObserver(syncEntry).observe(app,{attributes:true,attributeFilter:['class']});
  let touchStart=null,lastTap=null;
  for(const type of ['pointerdown','pointerup','pointercancel','mousedown','touchstart','touchend','click','keydown']){
    window.addEventListener(type,event=>{
      if(!gate || !scene.contains(event.target) || event.target.closest('.incense-entry'))return;
      if(type==='keydown' && !['Enter',' '].includes(event.key))return;
      event.stopImmediatePropagation();
      if(event.pointerType==='touch' && type.startsWith('pointer')){
        if(type==='pointerdown'){touchStart={id:event.pointerId,x:event.clientX,y:event.clientY};return;}
        const start=touchStart;touchStart=null;
        if(type!=='pointerup'||start?.id!==event.pointerId||Math.hypot(event.clientX-start.x,event.clientY-start.y)>12)return;
        lastTap={x:event.clientX,y:event.clientY,time:performance.now()};
      }
      if(type==='click'||type==='keydown'||(type==='pointerup'&&event.pointerType==='touch')){
        event.preventDefault();
        if(type==='click'&&lastTap&&performance.now()-lastTap.time<700&&Math.hypot(event.clientX-lastTap.x,event.clientY-lastTap.y)<12)return;
        const incense=scene.querySelector('.incense-entry');
        if(type!=='keydown' && stage.hidden && incense?.hitsSmoke?.(event.clientX,event.clientY))incense.click();
        else objectHint(event);
      }
    },{capture:true,passive:false});
  }
  restoreDiscovery();
  window.addEventListener('pageshow',restoreDiscovery);
  window.addEventListener('storage',event => {
    if (event.key === discoveryKey && event.newValue === '1') restoreDiscovery();
  });
  const heldImages = [];
  scene.addEventListener('incense:start', () => {
    if (discovered || heldImages.length) return;
    const urls = new Set([...art.querySelectorAll('image'),...sleepingArt.querySelectorAll('image')].map(image=>image.getAttribute('href')));
    for (const url of urls) {
      const image = new Image();
      image.src = url;
      heldImages.push(image);
      image.decode().catch(()=>{});
    }
  });
  scene.addEventListener('incense:start', () => {
    restoreDiscovery();
    if (discovered || dialog.open || landing) return;
    mouth(0);
    lines = words[document.documentElement.lang === 'en' ? 'en' : 'fr'];
    page = 1;
    hideHint();
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
    window.NanaProgress?.feat('mokona');
    next.focus({preventScroll:true});
    if (!reduced.matches) dialog.querySelector('.mokona-card').animate([{opacity:0},{opacity:1}],{duration:420});
    speak();
  });
})();



