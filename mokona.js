(() => {
  const scene = document.querySelector('#play-scene');
  if (!scene || !window.NanaRoomV2) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const words = {
    fr: ['Mokona débloqué !', 'Coucou, moi c’est Mokona ! Bienvenue dans la chambre de Léna, alias Nana ! C’est elle qui a tout dessiné. Elle a glissé quelques secrets parmi ses affaires… Tu en as déjà trouvé un : moi ! Tes découvertes t’attendent dans ton carnet.', 'Tiens, ton premier badge ! Chaque découverte fait grimper le pourcentage en haut de l’écran. À certains paliers, ou quand tu termines une collection, j’ai un nouveau badge pour toi.', 'Si tu ne sais plus où chercher, viens me voir sur le lit. Je te donnerai un petit indice. Tu vois le coussin étoile ? C’est là que je t’attends !', 'Continuer', 'À tout à l’heure, Mokona !'],
    en: ['Mokona unlocked!', 'Hi, I’m Mokona! Welcome to Léna’s room! She also goes by Nana. She drew everything here and tucked a few secrets among her things… You’ve already found one: me! Your discoveries go in your notebook.', 'Here’s your first badge! Each discovery raises the percentage at the top. Reach a milestone or complete a collection and I’ll have another badge for you.', 'Need a hint? Come find me on the bed. See the star pillow? That’s where I’ll be!', 'Continue', 'See you soon, Mokona!']
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
  part('ventre-padded',0,-12.5,765,6800,'mokona-belly',belly);
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
  let handBadge, gift;
  let lines, page, timer, typing, landing;
  function offerFirstBadge(){
    if(!handBadge){
      const badge=window.NanaProgress.stickers.find(b=>b.id==='glance');
      handBadge=window.NanaBadgeArt(badge);
      for(const [key,value] of Object.entries({x:1285,y:553,width:210,height:210}))handBadge.setAttribute(key,value);
      paw.after(handBadge);
      document.dispatchEvent(new Event('mokona-first-badge'));
    }
  }
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
    if(page===2 && !gift)offerFirstBadge();
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
    const badge=window.NanaJournal?.pendingBadge?.();
    if(badge){presentGift(badge);return;}
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
  async function presentGift(badge) {
    if(gift || landing || dialog.open)return;
    glimmer.style.opacity='0';
    gift=badge;
    landing=true;
    sleep();
    const lang=french()?'fr':'en';
    const name=badge.name[lang];
    lines=[lang==='fr'?'Un cadeau de Mokona !':'A gift from Mokona!', '',
      lang==='fr'?'Tiens, le badge « '+name+' » est à toi !':'Here, the “'+name+'” badge is yours!', '',
      lang==='fr'?'Merci, Mokona !':'Thanks, Mokona!'];
    page=2;
    const origin=bed.getBoundingClientRect();
    bed.style.visibility='hidden';
    handBadge?.remove();
    handBadge=window.NanaBadgeArt(badge);
    for(const [key,value] of Object.entries({x:1285,y:553,width:210,height:210}))handBadge.setAttribute(key,value);
    handBadge.style.display='none';
    paw.after(handBadge);
    floater.append(art);
    floater.style.animation='none';
    floater.style.transformOrigin='top left';
    stage.hidden=false;
    pinStage();
    stage.style.setProperty('--veil','.24');
    const card=dialog.querySelector('.mokona-card');
    card.style.visibility='hidden';
    dialog.querySelector('h2').textContent=lines[0];
    next.disabled=true;
    dialog.showModal();
    const dest=floater.getBoundingClientRect();
    const scale=origin.width/dest.width;
    const dx=origin.left+origin.width/2-dest.left-dest.width*scale/2;
    const dy=origin.bottom-dest.top-dest.height*scale;
    const jump=floater.animate([
      {transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')'},
      {transform:'translate('+dx*.35+'px,'+(dy*.35-innerHeight*.12)+'px) scale('+(.65+.35*scale)+')',offset:.65},
      {transform:'none'}
    ],{duration:reduced.matches?0:850,easing:'ease-in-out'});
    await jump.finished;
    floater.style.animation='';
    stage.classList.add('hovering');
    card.style.visibility='';
    landing=false;
    next.disabled=false;
    speak();
    window.NanaJournal.giveBadge(badge.id);
    next.focus({preventScroll:true});
  }
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
      gift=null;
      landing = false;
    }
  }
  next.onclick = () => {
    if (landing) return;
    if (typing) return finishLine();
    if (!gift && page < 3) { page++; speak(); }
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
    ['#nana-phone-charm','J’ai beau pendouiller, le téléphone ne décroche pas. Essaie de faire signe au bol.','I keep dangling, but the phone never picks up. Try waving to the bowl.'],
    ['button[aria-label="Soulever le coin de la couette"],button[aria-label*="duvet" i]','On chatouille mes coins depuis ce matin. Essaie plutôt la spirale qui sort du bol !','People have been tickling my corners all morning. Try the spiral coming out of the bowl instead!'],
    ['.memory-marble','Je ferais bien la course avec la volute. Moi, je prends la pente !','I’d race that wisp. I call the downhill route!'],
    ['[data-open="latte"]','Hé, moi je refroidis ! Ce qui fume encore, c’est le bol.','Hey, I’m getting cold! It’s the bowl that’s still smoking.'],
    ['[data-open="phone"]','Allô ? Ça capte mal… Essaie du côté du bol qui fume.','Hello? Bad reception… Try the little smoking bowl.'],
    ['[data-open="do-nothing"]','Encore cinq minutes… Tu peux t’occuper de la fumée ?','Five more minutes… Could you see to the smoke?'],
    ['[data-open="tamagotchi"]','Bip. Bip. BOL DÉTECTÉ. Bip.','Beep. Beep. SMOKING BOWL DETECTED. Beep.'],
    ['#nana-zola-book,[data-object="nana-zola-book"]','Au premier chapitre, une main effleure la fumée…','In the first chapter, a hand brushes against the smoke…'],
    ['[data-open="work-zoom"]','Un instant… Le bol essaie de se connecter.','One moment… The incense bowl is trying to connect.'],
    ['[data-open="polaroids"]','Bouge un peu le doigt vers la fumée… Oui, joli cadrage !','Move your finger towards the smoke… Yes, lovely framing!'],
    ['#room-hanging-plant,[data-open="plantasia"],[data-object="plant"]','Ça me chatouille les feuilles, cette fumée…','That smoke tickles my leaves…'],
    ['[data-open="music"]','Tu vois la fumée ? Elle danse même quand je me tais.','See the smoke? It dances even when I’m quiet.'],
    ['#cat-cv-hit,[data-room-zone-id="chat"]','Mrrr… Une patte dans la fumée ? Après ma sieste.','Mrrr… A paw in the smoke? After my nap.'],
    ["[data-room-zone-id=\"livres-1\"]","La libraire conseille de commencer par le petit bol. Page un, tout en bas.","The bookseller recommends starting with the little bowl. Page one, at the bottom."],
    ["[data-room-zone-id=\"livres-2\"]","J’avais gardé le souvenir d’un parfum… Oui, c’est celui de l’encens.","I kept the memory of a scent… Yes, that’s the incense."],
    ["[data-room-zone-id=\"livres-3\"]","« Volute ». J’avais le mot sur le bout de la couverture ! Tu vois celle du bol ?","“Wisp.” It was on the tip of my cover! See the one above the bowl?"],
    ["[data-open=\"book\"]","Mon marque-page frétille chaque fois que la fumée passe.","My bookmark flutters whenever the smoke goes by."],
    ["[data-room-zone-id=\"cds\"],[data-mv-open]","Sur ma face argentée, je vois le reflet du bol. Quelque chose y danse.","I can see the bowl in my silver side. Something’s dancing in it."],
    ["[data-object=\"night-lamp\"][data-label-en^=\"Star\"],[data-room-zone-id=\"guirlande\"]","On a compté nos étoiles. Cette petite lumière dans le bol n’est pas à nous.","We counted our stars. That little glow in the bowl isn’t one of ours."],
    ["[data-object=\"night-lamp\"][data-label-en^=\"Jelly\"],[data-room-zone-id=\"jelly\"]","Cette volute ferait une jolie tentacule. Tu crois qu’elle pique ?","That wisp would make a lovely tentacle. Do you think it stings?"],
    ["[data-object=\"night-lamp\"][data-label-en^=\"Desk\"],[data-room-zone-id=\"lampe-bureau\"]","Je me pencherais bien pour éclairer le bol. Mon cou est trop court.","I’d lean over to light up the bowl, but my neck’s too short."],
    ["[data-object=\"night-lamp\"][data-label-en^=\"Fawn\"],[data-room-zone-id=\"bambi-lampe\"]","J’ai dressé les oreilles. Il y a quelqu’un dans cette fumée ?","My ears pricked up. Is someone in that smoke?"],
    ["[data-object=\"dog\"],[data-room-zone-id=\"preacher-dog\"]","Wouf ! J’ai suivi la piste avec ma truffe. Elle s’arrête au bol.","Woof! I followed the trail with my nose. It ends at the bowl."],
    ["[data-object=\"fish-mobile\"]","Je nage dans l’air depuis si longtemps… Tiens, un nouveau courant monte du bol.","I’ve been swimming in air for ages… Oh, a new current rising from the bowl."],
    ["[data-object=\"bell\"],#nana-kikujiro-chime","Ding… Ce filet de fumée vient de me frôler.","Ding… That little wisp just brushed past me."],
    ["[data-object=\"sailor\"]","D’habitude, c’est moi qui réveille tout le monde. À toi de réveiller le bol !","Usually I wake everyone up. Your turn to wake the bowl!"],
    ["[data-object=\"landscape\"]","Pas la peine de partir bien loin. Regarde sur la table basse.","No need to travel far. Look on the coffee table."],
    ["[data-object=\"kokeshi\"],#nana-kokeshi","Je me suis inclinée pour saluer la fumée. À ton tour.","I bowed to greet the smoke. Your turn."],
    ["[data-object=\"gashapon\"]","Je garde mes surprises en capsule. Le bol, lui, les emballe dans la fumée.","I keep my surprises in capsules. The bowl wraps its surprises in smoke."],
    ["[data-object=\"happy-berry\"],[data-room-zone-id=\"happy-berry\"]","Avec deux ailes, j’irais me poser sur cette volute. Ah, mais… j’en ai deux !","With two wings I could land on that wisp. Oh, wait… I have two!"],
    ["[data-object=\"office\"]","Note de service. Toute fumée suspecte est à signaler au responsable du bol.","Office memo. Report suspicious smoke to the Assistant to the Bowl Manager."],
    ["[data-object=\"kero\"],[data-room-zone-id=\"kero\"]","Ça sent le goûter ? Ah non, de l’encens. Vas-y, je garde ta part.","Is that a snack I smell? Oh, incense. Go on, I’ll save you a bite."],
    ["[data-open=\"mini-games\"]","Niveau 1. Un bol. Une volute. À toi de jouer.","Level one. One bowl. One wisp. Your move."],
    ["[data-open=\"bead-box\"]","J’aimerais enfiler cette boucle de fumée entre deux perles.","I’d love to thread that loop of smoke between two beads."],
    ["[data-open=\"pokemon\"],[data-room-zone-id=\"pokeball\"]","Quelque chose se cache dans le bol. Tu crois que ça rentrerait dans une Pokéball ?","Something’s hiding in the bowl. Think it would fit in a Poké Ball?"],
    ["[data-room-zone-id=\"miffy\"]","J’ai répété mon numéro. La fumée a fait une meilleure pirouette.","I rehearsed my act. The smoke did a better twirl."],
    ["[data-room-zone-id=\"sonny-angel\"]","Mes oreilles dépassent quand je me cache. Regarde si tu en vois dans la fumée.","My ears stick out when I hide. See any ears in the smoke?"],
    ["[data-object=\"van\"],[data-room-zone-id=\"volkswagen\"]","Mon moteur est coupé ! Va voir le bol avant de m’accuser.","My engine’s off! Check the bowl before you blame me."],
    ["[data-room-zone-id=\"blast\"]","Tu es sur la liste. L’entrée du concert ? Suis la fumée.","You’re on the list. The way to the gig? Follow the smoke."],
    ["[data-open=\"gabzilla\"]","J’espère que cette odeur d’encens part au lavage.","I hope that incense smell comes out in the wash."],
    ["[data-room-zone-id=\"bretzel\"]","Je parie qu’elle n’arrive pas à faire mon nœud, la fumée.","Bet that smoke can’t tie itself into my knot."],
    ["a[href$=\"shop.html\"],#nana-shop-bag","Si tu réussis à attraper un peu de fumée, je te la porte.","If you manage to catch a little smoke, I’ll carry it for you."],
    ["[data-open=\"mimilab\"]","Une touche pour chaque note… Je me demande quel son ferait la fumée.","One key for each note… I wonder what the smoke would sound like."],
    ["[data-room-zone-id=\"vase\"]","Mes coquelicots penchent tous vers le bol. Même les plus timides.","My poppies are leaning towards the bowl. Even the shy ones."],
    ["[data-room-zone-id=\"fortune-cookie\"],[data-open=\"fortune-cookie\"]","Ton présage du jour tient en trois mots. Effleure la fumée.","Your fortune fits in three words. Touch the smoke."],
    ["[data-object=\"alice-bottle\"]","Bois-moi… Oh, pardon, j’avais promis de laisser le bol commencer.","Drink me… Oh, sorry, I promised the bowl could go first."],
    ["#nana-wall-mirror,#wall-mirror-hit","D’ici je la vois à l’envers, mais je suis sûre que cette fumée te fait signe.","It’s backwards from here, but I’m sure that smoke is waving at you."],
    ["#nana-wall-lamp,#wall-lamp-hit","Mes pétales restent au mur. Ceux du bol se déplient dans l’air.","My petals stay on the wall. The bowl’s petals unfold in the air."],
    ["[data-guitar-play],[data-open=\"contact\"]","Fais glisser ton doigt sur la volute, comme sur une corde.","Run your finger along the wisp like it’s a string."],
    ["#nana-fifi-horse,[data-object='fifi']","Au galop jusqu’au bol ! Je te laisse passer devant.","Gallop to the bowl! I’ll let you lead."],
    ["#paprika-butterfly","Si tu perds mes ailes de vue, suis les boucles de fumée.","If you lose sight of my wings, follow the curls of smoke."],
    [".v2-meteor","Vite, un vœu ! Confie-le au bol avant que je file.","Quick, make a wish! Whisper it to the bowl before I fly past."],
    ["#window-ufo","Ici la soucoupe. Le petit bol émet un signal. À toi, la Terre.","Saucer calling. The little bowl is sending a signal. Come in, Earth."],
    ["[data-room-zone-id=\"ring-light\"],[data-open=\"gearnews-series\"]","Il y a un rond de fumée qui essaie de m’imiter.","There’s a smoke ring trying to look like me."],
    ["[data-room-zone-id=\"crayons-2\"]","Tu as vu ce trait dans l’air ? Même bien taillé, je n’y arrive pas.","See that line in the air? Even freshly sharpened, I can’t draw that."],
    ["[data-room-zone-id=\"crayons-3\"]","J’ai toutes les couleurs. Il me manque juste ce blanc de fumée.","I have every colour except that smoky white."],
    ["[data-room-zone-id=\"ipad\"]","Tu peux dessiner dessus avec le doigt, tu sais. Sur la fumée aussi, peut-être ?","You can draw on me with your finger. Maybe on the smoke too?"],
    ["[data-room-zone-id=\"tapis\"]","De là-dessous, je vois le bol par transparence. Penche-toi un peu.","From down here I see the bowl through the glass. Lean in a little."],
    ["[data-cv-paper],[data-room-zone-id=\"cv\"]","Compétence particulière du jour : lire les signes de fumée.","Today’s special skill: reading smoke signals."],
    ["[data-type=\"poster\"][data-index=\"0\"]","Si je fais une bulle assez grosse, je peux y garder un peu d’encens ?","If I blow a big enough bubble, could I keep some incense in it?"],
    ["[data-type=\"poster\"][data-index=\"1\"]","Mes bulles éclatent quand on les touche. Essaie sur cette volute pour voir.","My bubbles pop when you touch them. Try that on the wisp."],
    ["[data-type=\"poster\"][data-index=\"2\"]","Les papillons se sont tous posés. Ce qui flotte au-dessus du bol doit être autre chose.","The butterflies have all landed. That thing floating above the bowl must be something else."],
    ["[data-type=\"poster\"][data-index=\"4\"]","Ça mijote ? J’ai vérifié toutes mes casseroles. Essaie la table basse.","Something simmering? I checked all my pots. Try the coffee table."],
    ["[data-type=\"poster\"][data-index=\"5\"]","J’ai perdu un pétale. S’il passe près du bol, regarde comment il remonte !","I lost a petal. Watch it lift if it drifts near the bowl!"],
    ["[data-type=\"poster\"][data-index=\"6\"]","Vu de dos, on me prend pour une paire d’ailes. De face, tu verrais ce que je regarde…","From behind I look like a pair of wings. From the front you’d see what I’m watching…"],
    ["[data-type=\"poster\"][data-index=\"7\"]","Promis, je n’ai rien allumé. La petite braise était déjà là.","I swear I didn’t light anything. That ember was already there."],
    ["[data-type=\"poster\"][data-index=\"8\"]","Encore un gros plan ? Cette fois, cadre juste le bord du bol.","Another close-up? Frame the rim of the bowl this time."],
    ["[data-type=\"poster\"][data-index=\"10\"]","Je cherche un partenaire pour mon numéro. La fumée sait déjà faire des anneaux !","I need a partner for my act. The smoke already knows how to make rings!"],
    ["[data-type=\"poster\"][data-index=\"11\"]","Du haut de ma tour rose, j’aperçois un panache. Juste entre le lit et la fenêtre.","From my pink tower I can see a plume down below. Beside the bed!"],
    ["[data-type=\"poster\"][data-index=\"12\"]","Dans mes rues, on verrait ton souffle. Ici, seul le bol fait de la buée.","On my streets you could see your breath. Here, only the bowl breathes out a cloud."],
    ["[data-type=\"poster\"][data-index=\"13\"]","Une nature morte avec un bol qui gigote ? Comment veux-tu que je prenne la pose ?","A still life with a wriggling bowl? How am I supposed to hold this pose?"],
    ["[data-type=\"poster\"][data-index=\"14\"]","Contact coupé. Si tu vois de la fumée, elle ne sort pas de mon pot.","Ignition’s off. That smoke isn’t coming from my exhaust."],
    ["[data-type=\"poster\"][data-index=\"15\"]","J’enregistrerais bien le silence juste avant que tu touches le bol. Chut…","I’d love to record the silence just before you touch the bowl. Shh…"],
    ["[data-type=\"poster\"][data-index=\"17\"]","Même le mistral n’arrive pas à déloger cette volute. Essaie avec ton doigt.","Even the mistral can’t shift that wisp. Try your finger."]
  ];

  // Some objects live in the room painting and have no normal Play action.
  // Keep their temporary silhouettes behind the interactive SVG cutouts.
  const paintedVoices=[
    ["Étagère du haut à gauche","0,90 307,153 309,172 0,107","Je tiens tout ce petit monde à bout de planche. La fumée, elle, tient toute seule.","I hold everyone up on one plank. The smoke holds itself up."],
    ["Étagère du milieu à gauche","0,230 308,255 309,270 0,245","Si ça sent le brûlé, vérifie le bol. Je tiens à mon bois.","If you smell something burning, check the bowl. I’m rather fond of my wood."],
    ["Étagère du bas à gauche","0,371 310,375 310,388 0,383","Personne n’a bougé sur ma planche. Ce qui gigote est sur la table basse.","Nobody on my shelf has budged. The wriggly thing is on the coffee table."],
    ["Étagère du haut à droite","1194,150 1486,125 1485,145 1196,168","De mon étage, la fumée est minuscule. Tu peux te rapprocher pour moi ?","The smoke looks tiny from up here. Could you get closer for me?"],
    ["Étagère du bas à droite","1199,242 1487,219 1487,237 1201,259","J’ai fait de la place pour la volute. Impossible de la ranger, elle file !","I made room for the wisp. I can’t shelve it. It keeps slipping away!"],
    ["Poignée de fenêtre","951,198 969,199 970,234 958,234","Je tourne quand on me le demande. La fumée tourne quand ça lui chante.","I turn when someone asks me to. The smoke turns whenever it pleases."],
    ["Embrasse du rideau","1098,374 1154,357 1166,400 1113,421","Je retiens déjà le rideau. Tu peux retenir la fumée une seconde ?","I’m already holding the curtain. Can you hold the smoke for a second?"],
    ["Coussin étoile","611,485 643,483 657,449 675,482 713,477 696,508 708,549 676,538 651,550 647,522 616,515","J’ai gardé une place à côté de moi. Tu veux voir qui j’attends ? Approche du bol.","I saved a spot next to me. Want to see who I’m waiting for? Go to the bowl."],
    ["Chaise","1192,527 1227,491 1320,480 1382,509 1403,591 1380,659 1302,679 1232,661 1186,608","Quelqu’un veut s’asseoir ? Je crois que notre invité est encore dans le bol.","Anyone need a seat? I think our guest is still in the bowl."],
    ["Rideau","1079,0 1169,0 1153,279 1142,380 1158,386 1151,407 1174,537 1130,550 1098,528 1117,408 1104,386 1118,380","J’ai beau me tenir tranquille, cette fumée danse. Ce n’est donc pas le vent.","I’m hanging perfectly still and the smoke is dancing. So it can’t be the wind."],
    ["Fenêtre","828,66 1070,15 1074,435 825,446","Je suis ouverte. Si tu veux attraper la fumée, dépêche-toi avant qu’elle sorte !","I’m open. Catch the smoke before it drifts outside!"],
    ["Souris","1388,495 1407,486 1424,488 1421,502 1396,508","Clic. C’est le bol que je pointais, là-bas !","Click. I was pointing at the bowl, over there!"],
    ["Bureau","1118,493 1534,491 1527,532 1135,519","Enfin un peu de place sur mon plateau. C’est la table basse qui reçoit aujourd’hui.","Finally, some space on my desk. The coffee table is hosting today."],
    ["Table en verre","652,699 782,648 1072,658 1154,690 1198,764 1148,797 757,778 633,750","Tu vois à travers moi ? Alors regarde un peu plus haut. Ça fume sur mon plateau.","Can you see through me? A little higher. There’s smoke rising from my glass top."],
    ["Couette","16,629 113,594 329,575 611,546 753,556 847,597 771,640 654,692 572,760 548,829 390,852 14,849","Je suis déjà bien bordée. Va donc voir ce qui se déroule sur la table.","I’m all tucked in. Go see what’s unrolling on the table."],
    ["Oreiller vert","81,491 328,468 352,540 122,574","Pose la tête ici et tu verras la fumée de profil. On dirait un petit nez.","Rest your head here and look at the smoke sideways. It has a little nose."],
    ["Oreiller rayé","188,443 438,428 481,541 429,558 228,554","J’ai des rayures bien sages. Celle qui s’échappe du bol fait des loopings.","My stripes behave. The one escaping from the bowl keeps looping."],
    ["Oreiller à franges","195,479 311,465 375,548 225,569","Mes franges me chatouillent moins que cette odeur d’encens.","My fringe tickles less than that incense does."],
    ["Coussin rouge","352,469 443,463 471,536 368,548","Je garde mes vagues cousues sur le ventre. Celles du bol sont en liberté.","My waves are stitched onto my tummy. The bowl lets its waves roam free."],
    ["Câble","287,725 384,760 436,755 467,715 482,713 444,766 388,770 287,734","Minute ! Cette boucle-là est à moi. La boucle qui flotte appartient au bol.","Hang on! That loop is mine. The floating loop belongs to the bowl."],
    ["Livre de coloriage","523,573 610,564 663,584 635,629 516,618","J’ai gardé un peu de blanc pour dessiner la fumée. Tu me prêtes ton doigt ?","I saved a little white for the smoke. Can I borrow your finger?"],
    ["Crayon du lit","584,561 655,564 655,574 584,568","Je sais tracer un trait sur une page. Toi, tu saurais en tracer un dans la fumée ?","I can draw a line on paper. Could you draw one in the smoke?"],
    ["Pot à crayons","1469,414 1511,409 1532,445 1528,495 1474,498","Mes crayons dépassent du pot. Du bol, c’est un drôle de tortillon qui dépasse.","Pencils stick out of my pot. There’s a funny curl sticking out of the bowl."],
    ["Ring light","0,333 37,317 74,335 95,380 83,448 59,486 32,491 4,465","Il y a un rond de fumée qui essaie de m’imiter.","There’s a smoke ring trying to look like me."],
    ["Tabouret","221,743 302,732 337,753 318,808 269,844 166,821","De mon perchoir, je vois très bien la petite braise dans le bol.","From my perch I can see the little ember in the bowl."],
    ["Tapis","625,760 1156,764 1177,814 1098,851 695,827 578,783","De là-dessous, je vois le bol par transparence. Penche-toi un peu.","From down here I see the bowl through the glass. Lean in a little."],
    ["Nana de Niki de Saint Phalle","225,7 226,7 228,7 229,8 230,10 232,14 234,16 235,18 236,19 238,24 237,31 237,33 237,35 237,36 236,39 236,40 236,42 235,44 235,44 238,48 239,50 239,51 239,58 238,60 234,64 234,66 235,68 237,70 239,72 240,79 241,84 245,104 245,106 244,110 244,112 244,113 243,114 243,132 243,136 243,137 244,138 249,140 249,142 248,143 244,143 243,142 242,143 240,143 239,144 236,143 236,143 235,142 235,139 236,138 232,131 231,126 232,121 233,116 233,115 232,113 226,106 226,106 225,108 224,108 224,110 223,110 222,113 220,117 219,118 219,119 216,121 215,121 214,121 214,122 212,122 212,122 211,122 210,122 209,123 208,123 207,123 206,123 205,124 203,124 202,125 194,125 191,128 188,130 186,130 185,128 186,127 186,126 187,124 188,123 188,122 189,120 189,119 190,118 195,118 196,116 199,114 200,113 202,113 202,112 207,111 209,111 209,111 208,109 207,108 205,103 204,101 204,100 204,99 203,98 203,97 203,96 202,94 197,88 198,81 198,80 198,79 199,78 200,76 204,72 206,71 208,71 208,68 208,65 207,64 207,64 207,63 204,58 202,57 200,56 199,56 198,56 196,55 195,54 194,54 192,53 188,52 184,48 182,48 178,44 174,43 172,40 172,39 174,37 177,37 181,40 184,41 186,41 187,41 190,42 192,43 194,44 194,45 199,45 200,44 210,44 210,43 211,42 210,40 208,38 208,37 208,36 208,32 208,32 211,29 212,28 214,28 217,32 218,37 218,40 219,41 220,41 223,38 223,36 224,32 226,30 226,29 228,26 228,26 228,25 228,24 228,23 228,22 227,20 227,18 227,16 227,15 226,14 225,12 225,8 225,7 225,7","Un bras en l’air, un pied levé… La fumée du bol essaie de prendre la pose !","One arm up, one foot in the air… The smoke from the bowl is trying my pose!"],
    ["Soucoupe du mug","763,675 795,665 875,677 891,689 871,704 774,695","Attention à ne pas nous confondre. Moi, j’attends les miettes. Le bol attend ta visite.","Don’t mix us up. I’m waiting for crumbs. The bowl is waiting for you."],
  ];
  const paintedHints=svg('svg',{viewBox:'0 0 1536 866',preserveAspectRatio:'none','data-room-v2-layer':'object-hints'});
  paintedHints.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;display:none';
  for(const [index,[name,points]] of paintedVoices.entries()){
    const area=svg('polygon',{points,fill:'transparent','pointer-events':'all','data-painted-hint':index,'aria-label':name,role:'button',tabindex:'0'});
    paintedHints.append(area);
  }
  scene.append(paintedHints);
  // Paint large background surfaces first so their small details receive the tap.
  const footprint=area=>{
    const points=Array.from(area.points);
    return Math.abs(points.reduce((sum,p,i)=>{
      const q=points[(i+1)%points.length];
      return sum+p.x*q.y-q.x*p.y;
    },0));
  };
  paintedHints.append(...Array.from(paintedHints.children).sort((a,b)=>footprint(b)-footprint(a)));
  function hideHint(){clearTimeout(promptTimer);objectBubble.hidden=true;}
  function objectHint(event){
    if(!stage.hidden)return;
    const rect=scene.getBoundingClientRect();
    const keyboard=event.type==='keydown'||(event.type==='click' && event.detail===0);
    const box=event.target.getBoundingClientRect();
    const x=keyboard?box.left+box.width/2:event.clientX;
    const y=keyboard?box.top+box.height/2:event.clientY;
    const targets=keyboard?[event.target]:document.elementsFromPoint(x,y).filter(el=>scene.contains(el));
    let voice;
    for(const el of targets){
      if(el.hasAttribute('data-painted-hint')){
        const [name,,fr,en]=paintedVoices[Number(el.dataset.paintedHint)];
        voice=[name,fr,en];
      }else{
        voice=objectVoices.find(([selector])=>el.closest(selector));
      }
      if(voice)break;
    }
    if(!voice)return hideHint();
    objectBubble.textContent=voice[document.documentElement.lang.startsWith('en')?2:1];
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
    paintedHints.style.display=gate?'block':'none';
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
  // Let the activity close and the room paint before Mokona leaves the bed.
  let giftTimer;
  function checkPendingGift(){
    if(!discovered || gift || landing || document.hidden || !app.classList.contains('mode-play') ||
       bed.hidden || !stage.hidden || document.querySelector('dialog[open], #window-shade:not([hidden]), #special-shade:not([hidden])'))return;
    if(!document.getElementById('play-viewport')?.getClientRects().length)return;
    const badge=window.NanaJournal?.pendingBadge?.();
    if(badge)presentGift(badge);
  }
  function schedulePendingGift(){
    clearTimeout(giftTimer);
    giftTimer=setTimeout(checkPendingGift,350);
  }
  const roomChanges=new MutationObserver(schedulePendingGift);
  roomChanges.observe(app,{attributes:true,attributeFilter:['class']});
  for(const id of ['play-viewport','window-shade','special-shade']){
    const node=document.getElementById(id);
    if(node)roomChanges.observe(node,{attributes:true,attributeFilter:['hidden']});
  }
  document.addEventListener('close',schedulePendingGift,true);
  document.addEventListener('visibilitychange',schedulePendingGift);
  window.addEventListener('pageshow',schedulePendingGift);
  window.NanaProgress?.subscribe(schedulePendingGift);
  schedulePendingGift();
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



