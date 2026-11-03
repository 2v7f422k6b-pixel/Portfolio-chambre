(function literaryModule() {
  'use strict';
  /* Draft content: replace these examples with Léna's own reading choices and archives. */
  const readingExamples = [
    { title: 'Frankenstein', author: 'Mary Shelley', mood: 'étrange', line: 'Une créature, son créateur, et la question de ce qui nous rend humains.' },
    { title: 'Jane Eyre', author: 'Charlotte Brontë', mood: 'intense', line: 'Une héroïne qui refuse de renoncer à elle-même.' },
    { title: 'La Princesse de Clèves', author: 'Madame de Lafayette', mood: 'intense', line: 'Des sentiments impossibles à faire entrer dans les règles.' },
    { title: 'Les Vagues', author: 'Virginia Woolf', mood: 'poétique', line: 'Six voix, des fragments de vie, un roman qui ressemble à une marée.' },
    { title: 'Les Fleurs bleues', author: 'Raymond Queneau', mood: 'étrange', line: 'Un voyage loufoque à travers le temps et le langage.' },
    { title: 'Une chambre à soi', author: 'Virginia Woolf', mood: 'poétique', line: 'Un essai essentiel sur la liberté de créer et la place des femmes dans la littérature.' }
  ];
  /* These poets are public-domain discovery examples, NOT a recovered blog archive. */
  const poetExamples = [
    { name: 'Louise Labé', dates: 'XVIe siècle', note: 'Une voix de la Renaissance, passionnée et directe.' },
    { name: 'Marceline Desbordes-Valmore', dates: '1786–1859', note: 'Une poésie de l’émotion, de la tendresse et de la perte.' },
    { name: 'Renée Vivien', dates: '1877–1909', note: 'Une poésie à la fois sensuelle et mélancolique.' }
  ];
  const dictionary = [
    'je', 'tu', 'nous', 'elle', 'les', 'une', 'mon', 'ton', 'ce', 'dans',
    'sous', 'avec', 'sans', 'entre', 'comme', 'encore', 'jamais', 'parfois',
    'nuit', 'lune', 'soleil', 'papier', 'coeur', 'silence', 'bizarre', 'rouge',
    'doux', 'secret', 'étoiles', 'sommeil', 'souvenir', 'océan', 'fantôme',
    'fleur', 'fenêtre', 'enfance', 'orage', 'velours', 'ville', 'oiseaux',
    'danse', 'tombe', 'respire', 'attend', 'murmure', 'oublie', 'cherche',
    'brille', 'aime', 'écrit', 'revient', 'demain', 'hier', 'ailleurs',
    'soudain', 'tendre', 'croquant', 'invisible', 'mystère', 'ciel'
  ];
  const titles = {
    'reading-room': 'La libraire vous conseille',
    'souvenues': 'Les Souvenues',
    'word-lab': 'Le laboratoire des mots'
  };
  let current = null;
  let selectedMood = 'surprise';
  let selection = 0;
  let poet = 0;
  let bank = [];
  let poem = [];
  let nextId = 0;
  let dragItem = null;
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);
  const shuffle = items => [...items].sort(() => Math.random() - .5);
  const appRoot = () => document.querySelector('#window-content .lit-app');
  const header = (label, intro) => `<header class="lit-header">
    <p class="lit-overline">NANA COLOR STUDIO / PETITS MONDES LITTÉRAIRES</p>
    <h2>${label}</h2><p class="lit-intro">${intro}</p></header>`;
  function readingHtml() {
    return `<div class="lit-app lit-reading">
      ${header('La libraire vous conseille', 'Un petit comptoir de librairie pour les jours où l’on ne sait pas quoi lire.')}
      <div class="lit-notice" role="note"><strong>Version de préparation.</strong> Les titres ci-dessous sont des exemples de fonctionnement, pas encore les coups de cœur de Léna.</div>
      <div class="lit-row"><span>De quoi as-tu envie ?</span>
        <div class="lit-moods" role="group" aria-label="Ambiance de lecture">
          ${['surprise','étrange','intense','poétique'].map(m => `<button type="button" class="lit-button" data-lit-mood="${m}" aria-pressed="${m===selectedMood}">${m==='surprise'?'Surprends-moi !':m}</button>`).join('')}
        </div>
      </div><article class="lit-card lit-book-card" id="lit-reading-result" aria-live="polite"><div class="lit-card-body"></div></article>
      <button type="button" class="lit-button lit-primary" data-lit-random>Un autre livre, s’il te plaît</button>
      <p class="lit-caption">Bientôt : tes vrais favoris, tes notes de libraire et tes avis personnels.</p>
    </div>`;
  }
  function souvenuesHtml() {
    return `<div class="lit-app lit-souvenues">
      ${header('Les Souvenues', 'Des voix de femmes à lire, retrouver et transmettre.')}
      <div class="lit-notice" role="note">Le nom du blog est authentique. Ses archives n’ont pas encore été importées : les autrices ci-dessous sont des exemples pour préparer la présentation.</div>
      <p class="lit-micro-title">Ouvre une fiche</p>
      <div class="lit-poets">${poetExamples.map((p,i)=>`<button type="button" class="lit-card lit-poet" data-lit-poet="${i}" aria-pressed="${poet===i}">
          <span class="lit-poet-number">0${i+1}</span><strong>${escape(p.name)}</strong><small>${escape(p.dates)}</small></button>`).join('')}</div>
      <article class="lit-card lit-poet-detail" id="lit-poet-detail" aria-live="polite"><div class="lit-card-body"></div></article>
      <p class="lit-caption">Les textes et les autrices de ton ancien blog remplaceront ces exemples. Les poèmes seront publiés uniquement lorsqu’ils sont libres de droits ou avec autorisation.</p>
    </div>`;
  }
  function wordLabHtml() {
    return `<div class="lit-app lit-lab">
      ${header('Le laboratoire des mots', 'Découpe, déplace, mélange. Il n’y a pas de mauvaise poésie ici.')}
      <p class="lit-caption">Clique ou touche un mot pour le placer sur la feuille. Sur ordinateur, glisse les mots pour les déplacer. Sur mobile, utilise les petites flèches pour les réordonner.</p>
      <section class="lit-card lit-paper">
        <p class="lit-paper-label">POÈME Nº <span id="lit-poem-number">01</span></p>
        <div class="lit-poem" id="lit-poem" aria-label="Ton poème, dans l’ordre de lecture" aria-live="polite"></div>
        <p class="lit-paper-footnote">Signé : un·e inconnu·e dans la chambre de Léna</p>
      </section>
      <p class="lit-micro-title">La boîte à mots</p><div class="lit-wordbank" id="lit-wordbank"></div>
      <div class="lit-actions">
        <button type="button" class="lit-button" data-lit-shuffle>↻ D'autres mots</button>
        <button type="button" class="lit-button" data-lit-clear>Effacer la feuille</button>
        <button type="button" class="lit-button lit-primary" data-lit-export>Enregistrer en PNG</button>
      </div>
      <p class="lit-caption" id="lit-lab-status" role="status" aria-live="polite"></p>
    </div>`;
  }
  function view(name) {
    return { title: titles[name] || 'Livres', html: name === 'reading-room' ? readingHtml() : name === 'souvenues' ? souvenuesHtml() : wordLabHtml() };
  }
  function showReading() {
    const root=appRoot(), result=root?.querySelector('#lit-reading-result .lit-card-body');
    if(!result)return;
    root.querySelectorAll('[data-lit-mood]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.litMood===selectedMood)));
    const available=readingExamples.filter(book=>selectedMood==='surprise'||book.mood===selectedMood);
    if(!available.length)return;
    selection=(selection+1)%available.length;
    const b=available[selection];
    result.innerHTML=`<span class="lit-book-ribbon">FICHE DE LECTURE • DÉMO</span>
      <h3>${escape(b.title)}</h3><p class="lit-byline">${escape(b.author)}</p><p>${escape(b.line)}</p><span class="lit-book-mood">Pour une envie ${escape(b.mood)}</span>`;
  }
  function showPoet() {
    const root=appRoot(), result=root?.querySelector('#lit-poet-detail .lit-card-body');
    if(!result)return;
    const p=poetExamples[poet];
    root.querySelectorAll('[data-lit-poet]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.litPoet)===poet)));
    const link='https://fr.wikisource.org/w/index.php?search='+encodeURIComponent(p.name);
    result.innerHTML=`<span class="lit-book-ribbon">FICHE D’AUTRICE • EXEMPLE</span>
      <h3>${escape(p.name)}</h3><p class="lit-byline">${escape(p.dates)}</p><p>${escape(p.note)}</p>
      <a class="lit-text-link" href="${escape(link)}" target="_blank" rel="noopener noreferrer">Chercher ses poèmes sur Wikisource ↗</a>
      <p class="lit-caption">Aucun poème de l’ancien blog n’est reproduit ici pour le moment.</p>`;
  }
  function freshBank() {
    // Avoid duplicating currently placed words in the palette.
    const active=new Set(poem.map(item=>item.word));
    bank=shuffle(dictionary.filter(word=>!active.has(word))).slice(0,20).map(word=>({id:++nextId,word}));
  }
  function renderPoem() {
    const root=appRoot();if(!root||current!=='word-lab')return;
    const plate=root.querySelector('#lit-poem'), tray=root.querySelector('#lit-wordbank');
    plate.innerHTML=poem.length ? poem.map((item,i)=>`
      <span class="lit-poem-item" draggable="true" data-lit-drag="poem:${i}" data-lit-index="${i}">
        <button type="button" class="lit-word lit-placed" data-lit-remove="${i}" title="Retirer ce mot">${escape(item.word)}</button>
        <span class="lit-order">
          <button type="button" data-lit-shift="${i}:-1" aria-label="Déplacer ${escape(item.word)} à gauche" ${i===0?'disabled':''}>‹</button>
          <button type="button" data-lit-shift="${i}:1" aria-label="Déplacer ${escape(item.word)} à droite" ${i===poem.length-1?'disabled':''}>›</button>
        </span></span>`).join('') : `<span class="lit-placeholder">Ton poème commence ici…</span>`;
    tray.innerHTML=bank.map((item,i)=>`
      <button type="button" class="lit-word" draggable="true" data-lit-add="${i}" data-lit-drag="bank:${i}">${escape(item.word)}</button>`).join('');
    root.querySelector('#lit-lab-status').textContent=poem.length ? `${poem.length} mot${poem.length>1?'s':''} sur la feuille.` : 'La feuille est vide. Choisis ton premier mot.';
  }
  function insertFromBank(index, at=poem.length) {
    if(!Number.isInteger(index)||index<0||index>=bank.length)return;
    const item=bank.splice(index,1)[0];
    poem.splice(Math.max(0,Math.min(at,poem.length)),0,item);
    renderPoem();
  }
  function moveInPoem(from,to) {
    if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>=poem.length)return;
    const [item]=poem.splice(from,1);
    poem.splice(Math.max(0,Math.min(to,poem.length)),0,item);
    renderPoem();
  }
  function exportPoem() {
    if(!poem.length){const status=appRoot()?.querySelector('#lit-lab-status');if(status)status.textContent='Ajoute quelques mots avant de sauvegarder ton poème.';return;}
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.fillStyle='#fff5e9';ctx.fillRect(0,0,1200,1500);
    ctx.strokeStyle='#ff173b';ctx.lineWidth=4;ctx.beginPath();
    ctx.moveTo(60,66);ctx.quadraticCurveTo(620,58,1140,67);
    ctx.quadraticCurveTo(1145,740,1136,1430);
    ctx.quadraticCurveTo(580,1440,64,1432);
    ctx.quadraticCurveTo(55,800,60,66);ctx.stroke();
    ctx.fillStyle='#ff173b';ctx.font='bold 28px Georgia,serif';
    ctx.fillText('LE LABORATOIRE DES MOTS',114,151);
    ctx.font='italic 25px Georgia,serif';
    ctx.fillText('Un poème trouvé dans la chambre de Léna',114,198);
    ctx.fillStyle='#4d2e42';ctx.font='42px Georgia,serif';
    let x=114,y=325;const max=1080;
    for(const entry of poem) {
      const w=ctx.measureText(entry.word).width+28;
      if(x+w>max){x=114;y+=82;}
      if(y>1310)break;
      ctx.fillText(entry.word,x,y);
      x+=w+18;
    }
    ctx.fillStyle='#ff173b';ctx.font='24px Georgia,serif';
    ctx.fillText('Nana Color Studio · poésie de hasard',114,1383);
    const a=document.createElement('a');a.download='mon-poeme-nana-color-studio.png';
    a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
    const status=appRoot()?.querySelector('#lit-lab-status');
    if(status)status.textContent='Ton poème est prêt à être enregistré en PNG.';
  }
  function activate(name) {
    current=name;
    if(name==='reading-room'){selectedMood='surprise';selection=Math.floor(Math.random()*readingExamples.length)-1;showReading();}
    if(name==='souvenues'){poet=0;showPoet();}
    if(name==='word-lab'){if(!bank.length)freshBank();renderPoem();}
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-lit-mood],[data-lit-random],[data-lit-poet],[data-lit-add],[data-lit-remove],[data-lit-shift],[data-lit-shuffle],[data-lit-clear],[data-lit-export]');
    if(!target||!target.closest('#window-content .lit-app'))return;
    if(target.hasAttribute('data-lit-mood')){selectedMood=target.dataset.litMood;selection=-1;showReading();}
    else if(target.hasAttribute('data-lit-random'))showReading();
    else if(target.hasAttribute('data-lit-poet')){poet=Number(target.dataset.litPoet);showPoet();}
    else if(target.hasAttribute('data-lit-add'))insertFromBank(Number(target.dataset.litAdd));
    else if(target.hasAttribute('data-lit-remove')){
      const pos=Number(target.dataset.litRemove);
      if(poem[pos])bank.push(poem.splice(pos,1)[0]);renderPoem();
    }
    else if(target.hasAttribute('data-lit-shift')){
      const [from,offset]=target.dataset.litShift.split(':').map(Number);
      moveInPoem(from,from+offset);
    }
    else if(target.hasAttribute('data-lit-shuffle')){freshBank();renderPoem();}
    else if(target.hasAttribute('data-lit-clear')){bank.push(...poem.splice(0));renderPoem();}
    else if(target.hasAttribute('data-lit-export'))exportPoem();
  });
  document.addEventListener('dragstart',event=>{
    const tile=event.target.closest('[data-lit-drag]');
    if(!tile||!tile.closest('#window-content .lit-app'))return;
    dragItem=tile.dataset.litDrag;
    if(event.dataTransfer){event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragItem);}
  });
  document.addEventListener('dragover',event=>{
    if(dragItem&&event.target.closest('#lit-poem,#lit-wordbank'))event.preventDefault();
  });
  document.addEventListener('drop',event=>{
    if(!dragItem||!event.target.closest('#window-content .lit-lab'))return;
    event.preventDefault();
    const target=event.target.closest('[data-lit-index]');
    const targetIndex=target?Number(target.dataset.litIndex):poem.length;
    const [source,indexText]=dragItem.split(':');const index=Number(indexText);
    if(event.target.closest('#lit-wordbank')&&source==='poem'){
      if(poem[index])bank.push(poem.splice(index,1)[0]);renderPoem();
    }else if(event.target.closest('#lit-poem')){
      if(source==='bank')insertFromBank(index,targetIndex);
      else moveInPoem(index,targetIndex);
    }
    dragItem=null;
  });
  document.addEventListener('dragend',()=>{dragItem=null;});
  window.NanaLiterary={view,activate};
})();