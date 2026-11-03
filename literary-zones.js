(function literaryModule() {
  'use strict';
  /* Source : Top 10 public de @lenastarduweb, vérifié le 3 novembre 2026.
     Les tags d'ambiance et résumés sont des aides de navigation rédigées pour le site,
     et non des critiques personnelles signées Léna. */
  const readingExamples = [
    {
      "rank": 1,
      "title": "À l’est d’Eden",
      "author": "John Steinbeck",
      "rating": 10,
      "moods": [
        "bouleversant",
        "intense"
      ],
      "line": "Une grande fresque familiale dans la vallée de Salinas, entre héritage, rivalités et liberté de choisir.",
      "url": "https://www.senscritique.com/livre/a_l_est_d_eden/80960",
      "cover": "https://media.senscritique.com/media/000000051366/300/a_l_est_d_eden.jpg"
    },
    {
      "rank": 2,
      "title": "Les Raisins de la colère",
      "author": "John Steinbeck",
      "rating": 10,
      "moods": [
        "bouleversant",
        "voyage"
      ],
      "line": "L’exode d’une famille pendant la Grande Dépression. Une histoire de solidarité et d’injustice sociale.",
      "url": "https://www.senscritique.com/livre/les_raisins_de_la_colere/179454",
      "cover": "https://media.senscritique.com/media/000017233178/300/les_raisins_de_la_colere.jpg"
    },
    {
      "rank": 3,
      "title": "Les Royaumes du Nord",
      "author": "Philip Pullman",
      "rating": 10,
      "moods": [
        "aventure",
        "étrange"
      ],
      "line": "Lyra part vers le Grand Nord dans un monde où les âmes prennent forme animale. Un voyage entre mystère et imaginaire.",
      "url": "https://www.senscritique.com/livre/les_royaumes_du_nord/210435",
      "cover": "https://media.senscritique.com/media/000019133118/300/les_royaumes_du_nord.jpg"
    },
    {
      "rank": 4,
      "title": "Aquarium",
      "author": "David Vann",
      "rating": 10,
      "moods": [
        "bouleversant",
        "intense"
      ],
      "line": "Un roman sur une relation mère-fille et les secrets de famille, avec une tension qui ne lâche pas.",
      "url": "https://www.senscritique.com/livre/aquarium/12727862",
      "cover": "https://media.senscritique.com/media/000020361439/300/aquarium.jpg"
    },
    {
      "rank": 5,
      "title": "Dans la forêt",
      "author": "Jean Hegland",
      "rating": 10,
      "moods": [
        "aventure",
        "bouleversant"
      ],
      "line": "Deux sœurs apprennent à vivre dans la forêt quand le monde extérieur cesse de fonctionner.",
      "url": "https://www.senscritique.com/livre/dans_la_foret/22541510",
      "cover": "https://media.senscritique.com/media/000021733141/300/dans_la_foret.jpg"
    },
    {
      "rank": 6,
      "title": "Les Autonautes de la cosmoroute",
      "author": "Carol Dunlop et Julio Cortázar",
      "rating": null,
      "moods": [
        "voyage",
        "poétique",
        "étrange"
      ],
      "line": "Une expédition tendre et décalée sur l’autoroute Paris–Marseille, transformée en terrain d’exploration.",
      "url": "https://www.senscritique.com/livre/les_autonautes_de_la_cosmoroute/11891193",
      "cover": "https://media.senscritique.com/media/000007228227/300/les_autonautes_de_la_cosmoroute.jpg"
    },
    {
      "rank": 7,
      "title": "Orgueil et Préjugés",
      "author": "Jane Austen",
      "rating": 10,
      "moods": [
        "amour",
        "drôle"
      ],
      "line": "Elizabeth Bennet et Mr Darcy se rencontrent dans une société où les apparences et les conventions font obstacle aux sentiments.",
      "url": "https://www.senscritique.com/livre/orgueil_et_prejuges/262879",
      "cover": "https://media.senscritique.com/media/000007027428/300/orgueil_et_prejuges.jpg"
    },
    {
      "rank": 8,
      "title": "La vie est ailleurs",
      "author": "Milan Kundera",
      "rating": 10,
      "heart": true,
      "moods": [
        "poétique",
        "intense",
        "étrange"
      ],
      "line": "Une épopée ironique de la jeunesse et de la poésie, à travers le destin d’un jeune poète.",
      "url": "https://www.senscritique.com/livre/la_vie_est_ailleurs/60888",
      "cover": "https://media.senscritique.com/media/000000036970/300/la_vie_est_ailleurs.jpg"
    },
    {
      "rank": 9,
      "title": "Belle du Seigneur",
      "author": "Albert Cohen",
      "rating": 10,
      "moods": [
        "amour",
        "intense"
      ],
      "line": "Un amour aussi absolu que tourmenté, au cœur d’un grand roman sur le désir et ses illusions.",
      "url": "https://www.senscritique.com/livre/belle_du_seigneur/72039",
      "cover": "https://media.senscritique.com/media/000018638489/300/belle_du_seigneur.jpg"
    },
    {
      "rank": 10,
      "title": "L’Usage du monde",
      "author": "Nicolas Bouvier",
      "rating": 10,
      "moods": [
        "voyage",
        "poétique"
      ],
      "line": "Le récit d’une traversée du monde où les rencontres comptent autant que les paysages.",
      "url": "https://www.senscritique.com/livre/l_usage_du_monde/419641",
      "cover": "https://media.senscritique.com/media/000000045043/300/l_usage_du_monde.jpg"
    }
  ];
    /* Extraits retrouvés de Les Souvenues par Léna, novembre 2026.
     Les textes non libres de droits restent des références bibliographiques :
     aucune citation protégée n'est reproduite sur ce site public. */
  const souvenuesEntries = [
    {
      "id": "morrison",
      "name": "Toni Morrison",
      "dates": "1931–2019",
      "title": "Desdemona",
      "kind": "Théâtre",
      "kindNote": "Dialogue autour d’Othello",
      "note": "Une voix sur la mémoire, la mort et les femmes qui reprennent la parole.",
      "status": "reference",
      "source": "https://www.laparafe.fr/2012/01/desdemona-dialogue-autour-dothello-de-shakespeare/"
    },
    {
      "id": "pozzi",
      "name": "Catherine Pozzi",
      "dates": "1882–1934",
      "title": "Sonnet moral sur les rimes d’un poème de mon amant impossible",
      "kind": "Poésie",
      "kindNote": "Très haut amour",
      "note": "Un sonnet dont les rimes sont visuellement rejetées au bout de la ligne.",
      "status": "full",
      "source": "https://francais.agonia.net/index.php/poetry/14106426/SONNET_MORAL_SUR_LES_RIMES_D%E2%80%99UN_PO%C3%88ME_DE_MON_AMANT_IMPOSSIBLE",
      "aligned": [
        [
          "J’aime les roses qui se",
          "meurent"
        ],
        [
          "Les caprices",
          "inachevés"
        ],
        [
          "Et le long regret qui",
          "demeure"
        ],
        [
          "Au bout des refus",
          "énervés."
        ],
        [
          "J’aime aussi les promesses",
          "lentes"
        ],
        [
          "De paradis",
          "vertigineux"
        ],
        [
          "Qui (soulevant sa main",
          "ardente)"
        ],
        [
          "Raidissent le monsieur",
          "nerveux."
        ],
        [
          "Mais ma belle âme",
          "renversée"
        ],
        [
          "Sur l’alme sagesse",
          "irisée"
        ],
        [
          "Que les dieux éternels m’ont",
          "fait [sic]"
        ],
        [
          "Goûte la chasteté",
          "Fervente"
        ],
        [
          "Cher flirt, Bagdad, valse",
          "Indolente"
        ],
        [
          "Et rit de vos sexes",
          "défaits."
        ]
      ]
    },
    {
      "id": "noailles",
      "name": "Anna de Noailles",
      "dates": "1876–1933",
      "title": "J’espère de mourir…",
      "kind": "Poésie",
      "kindNote": "Les Vivants et les morts · extrait",
      "note": "Un cœur débordant, un corps trop étroit : quatre vers conservés de ton ancienne sélection.",
      "status": "full",
      "source": "https://www.gutenberg.org/cache/epub/22054/pg22054-images.html",
      "poem": "Prenez ce coeur puissant qu'un faible corps opprime,\nEt qui, heurtant sans fin ses étroites parois,\nEut l'attrait du divin et le pouvoir des cimes,\nEt s'élevait aux cieux comme la pierre choit."
    },
    {
      "id": "hegland",
      "name": "Jean Hegland",
      "dates": "née en 1956",
      "title": "Dans la forêt",
      "kind": "Roman",
      "kindNote": "Extrait sur la lune",
      "note": "Le fragment que tu avais choisi parle de la lune et de ce qu’on apprend en vivant près de la nature.",
      "status": "reference",
      "source": "https://www.senscritique.com/livre/dans_la_foret/22541510"
    },
    {
      "id": "gauthier",
      "name": "Xavière Gauthier",
      "dates": "née en 1942",
      "title": "Pourquoi sorcières ?",
      "kind": "Revue",
      "kindNote": "Sorcières",
      "note": "Un manifeste sur la danse, le corps, la nature et la liberté des femmes.",
      "status": "reference",
      "source": "https://musees-occitanie.fr/assets/uploads/2021/03/dossier-de-presse-magies-compresse.pdf"
    },
    {
      "id": "ziade",
      "name": "May Ziadé",
      "dates": "1886–1941",
      "title": "Capricieuse",
      "kind": "Poésie",
      "kindNote": "Fleurs de rêve · signé Isis Copia",
      "note": "Le Caire au couchant, les pyramides, et une voix qui interroge les monuments.",
      "status": "full",
      "source": "https://fr.wikisource.org/wiki/Fleurs_de_r%C3%AAve/Texte_entier",
      "poem": "Grandiose, imposant dans la voûte profonde,\nLe soleil saluait d'un coutumier adieu\nLe fleuve les palmiers, les sables de ce lieu\nEt cheminait vers l'autre monde.\n\nAlors tout l'horizon laisse monter un cri,\nLe firmament se teint de lilas et de rose\n(Frémissantes couleurs où l'azur doux repose),\nEt le zéphire souffle attendri.\n\nLe Caire était caché sous une vague brume,\nLes arbres tournoyant sur les bords bruns du Nil\nL'ombre tombait partout, sans trouver de péril,\nEt couvrait la plaine et l'écume.\n\nO Pyramides! C’est alors\nQue, levant ma tête pensive,\nJ'entends errer sur vos flancs forts\nL'écho de quelque voix plaintive;\nMais quoi! Serait-ce en votre sein\nQ'un orphelin pleure sa mère?\nEst-ce un hymne, est-ce une prière,\nEst-ce un gémissement divin?\n\nMais déjà revient le silence\nAutour du grand monument noir.\nUn temps - Mon coeur frémit, s'élance,\nPlane avec la brise du soir...\n\nSoudain les sons se font entendre,\nO dieux! Mais d'où viennent-ils donc?\nUne douce harmonie y fond...\nEst-ce de la voix d'Alexandre\nUn écho? De Napoléon\nEst-ce le sabre qui miroite?\nEst-ce ta statue, o Memnon,\nQui tombe en une vapeur moite?\nEst-ce le soupir d'un soldat\nDéfunt? Un cheval qui se cabre?\nEst-ce un craquement d'un marbre\nQui depuis des siècles gît là?\n\nRépondez, Monuments! Pyramides altières,\nDes siècles révolus ô souvenir muet!\nSont-ce des chants d'amour, des commandes guerrières\nQue vos entrailles jettent net?\n\nNon, sur vos côtes délabrées\nCe n'est plus l'aigle Impérial\nQui marque vos terres sacrées\nDes pas de son fougueux cheval;\nOh! Baissez vos armes françaises\nVos drapeaux sont à peine vus...\nEt Mohamed Ali n'est plus,\nToutes les choses sont anglaises.\n\n…\n\nCes longs échos flottants et chatouillant mon âme\nComme un souffle de brise, une haleine d'azur,\nUn baiser maternel, un regard triste et pur,\nL'éclair d'une subtile flamme,\n\nUn doigt câlin d'enfant qui caresse mon front,\nUn gazouillis d'oiseau, d'un fleuve le murmure,\nUn sourire amical, un cri de la nature\nOu du soleil un rayon blond,\n\nC'était la fanfare lointaine\nQui jouait Dieu sauve le Roi\nC'était la vibration certaine\nDe coeurs vaillants et pleins de foi;\n\nDe tes moelleux flots nostalgiques\nHarmonie, ô nectar divin,\nJe laisse couler dans mon sein\nLes tiédeurs mélancoliques....\n\nMuses, Beautés, Beaux-Arts aimés,\nOcéans, rivière, verdures,\nAzur immense, astres dorés\nQui du ciel êtes la parure\n\nA vous, à vous mes jeunes ans,\nA vous ma jeune intelligence,\nMon amour et ma confiance,\nA vous mes rêves bleus et blancs!\n\nMais trêve de transports. A bientôt, Pyramides,\nEt vous, Liban, Beyrouth, cher Antoura, salut!\nMa Syrie, Salut! Dès qu je l'aurai pu\nJ'irai revoir tes horizons limpides."
    }
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
  let selection = -1;
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
  const moodOptions = [
    ['surprise','Surprends-moi !'],
    ['bouleversant','Bouleversant'],
    ['aventure','Aventure'],
    ['amour','Amour'],
    ['voyage','Voyage'],
    ['poétique','Poétique'],
    ['étrange','Étrange'],
    ['intense','Intense']
  ];
  const profileUrl = 'https://www.senscritique.com/lenastarduweb/collection?universe=2';
  const topUrl = 'https://www.senscritique.com/liste/top_10_livres/1875108';
  const coverBlock = (book,small=false) => `<span class="lit-cover${small?' lit-cover-small':''}" aria-hidden="true">
    <span class="lit-cover-fallback"><strong>${escape(book.title)}</strong><small>${escape(book.author)}</small></span>
    <img src="${escape(book.cover)}" alt="" loading="lazy" decoding="async">
  </span>`;
  function readingHtml() {
    return `<div class="lit-app lit-reading">
      ${header('La libraire vous conseille', 'Quelques livres que j’ai vraiment aimés. Tu cherches quoi, aujourd’hui ?')}
      <div class="lit-notice" role="note">Ma sélection personnelle : les 10 livres de mon <a href="${topUrl}" target="_blank" rel="noopener noreferrer">Top 10 SensCritique</a>. Neuf sont notés 10/10 ; le sixième est classé sans note affichée.</div>
      <div class="lit-row"><span>De quoi as-tu envie ?</span>
        <div class="lit-moods" role="group" aria-label="Choisir une ambiance de lecture">
          ${moodOptions.map(([m,label]) => `<button type="button" class="lit-button" data-lit-mood="${m}" aria-pressed="${m===selectedMood}">${label}</button>`).join('')}
        </div>
      </div>
      <article class="lit-card lit-book-card" id="lit-reading-result" aria-live="polite"><div class="lit-card-body"></div></article>
      <button type="button" class="lit-button lit-primary" data-lit-random>✦ Un autre livre, s’il te plaît</button>
      <section class="lit-library" aria-label="Mes 10 livres préférés">
        <p class="lit-micro-title">Les dix livres du rayon</p>
        <div class="lit-shelf">${readingExamples.map(book=>`<button type="button" class="lit-shelf-book" data-lit-book="${book.rank}" aria-label="Voir la fiche : ${escape(book.title)}" aria-pressed="false">
          ${coverBlock(book,true)}
          <span class="lit-shelf-rank">Nº ${book.rank}</span>
        </button>`).join('')}</div>
      </section>
      <p class="lit-caption">Notes : ${'<a href="'+profileUrl+'" target="_blank" rel="noopener noreferrer">mon profil SensCritique</a>'}. Les petites descriptions et les catégories d’ambiance sont rédigées pour cette bibliothèque, pas extraites de mes critiques.</p>
    </div>`;
  }
  function souvenuesHtml() {
    return `<div class="lit-app lit-souvenues">
      ${header('Les Souvenues', 'Quelques poèmes, fragments et voix de femmes que j’avais réunis sur mon ancien blog.')}
      <div class="lit-notice" role="note">Six textes retrouvés dans les anciennes archives des Souvenues. Les textes anciens sont reproduits ici ; les œuvres plus récentes sont référencées avec un lien vers leur source.</div>
      <p class="lit-souvenues-original"><a class="lit-text-link" href="https://www.facebook.com/lessouvenues" target="_blank" rel="noopener noreferrer">Retrouver Les Souvenues sur Facebook ↗</a></p>
      <div class="lit-souvenues-toolbar">
        <p class="lit-micro-title">Choisis une autrice</p>
        <button type="button" class="lit-button" data-lit-pick-poet>✦ Cueille un texte</button>
      </div>
      <div class="lit-poets">${souvenuesEntries.map((p,i)=>`<button type="button" class="lit-card lit-poet" data-lit-poet="${i}" aria-pressed="${poet===i}">
        <span class="lit-poet-number">0${i+1} · ${escape(p.kind)}</span>
        <strong>${escape(p.name)}</strong><small>${escape(p.title)}</small>
      </button>`).join('')}</div>
      <article class="lit-card lit-poet-detail" id="lit-poet-detail" aria-live="polite"><div class="lit-card-body"></div></article>
      <p class="lit-caption">Sélection historique retrouvée, pas un inventaire complet du blog. La typographie du sonnet de Catherine Pozzi conserve ses mots décalés ; les graphies de l’archive sont conservées.</p>
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
  function drawReadingBook(book){
    const root=appRoot(),result=root?.querySelector('#lit-reading-result .lit-card-body');
    if(!result || !book)return;
    selection=readingExamples.findIndex(item=>item.rank===book.rank);
    root.querySelectorAll('[data-lit-book]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.litBook)===book.rank)));
    root.querySelectorAll('[data-lit-mood]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.litMood===selectedMood)));
    const rating=book.rating===null ? 'Dans mon Top 10 · Sans note affichée' : 'Ma note : '+book.rating+'/10';
    result.innerHTML=`<div class="lit-featured-layout">
      ${coverBlock(book)}
      <div class="lit-featured-copy">
        <span class="lit-book-ribbon">MON TOP 10 · Nº ${book.rank}</span>
        <h3>${escape(book.title)}</h3>
        <p class="lit-byline">${escape(book.author)}</p>
        <p class="lit-rating">${escape(rating)}${book.heart?' · Coup de cœur':''}</p>
        <p class="lit-book-summary">${escape(book.line)}</p>
        <span class="lit-book-mood">À lire pour : ${book.moods.map(escape).join(' · ')}</span>
        <a class="lit-text-link" href="${escape(book.url)}" target="_blank" rel="noopener noreferrer">Voir la fiche sur SensCritique ↗</a>
      </div>
    </div>`;
  }
  function showReading(){
    if(!appRoot())return;
    const available=readingExamples.filter(book=>selectedMood==='surprise'||book.moods.includes(selectedMood));
    if(!available.length)return;
    const previous=readingExamples[selection];
    const options=available.length>1 ? available.filter(book=>book.rank!==previous?.rank):available;
    drawReadingBook(options[Math.floor(Math.random()*options.length)]);
  }
  function showPoet() {
    const root=appRoot(), result=root?.querySelector('#lit-poet-detail .lit-card-body');
    if(!result)return;
    const p=souvenuesEntries[poet];
    root.querySelectorAll('[data-lit-poet]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.litPoet)===poet)));
    let poem='';
    if(p.aligned){
      poem=`<div class="lit-archive-poem lit-archive-aligned" lang="fr">${p.aligned.map(([left,right],i)=>`
        <div class="lit-archive-verse${i===4||i===8||i===11?' lit-archive-new-stanza':''}">
          <span>${escape(left)}</span><span>${escape(right)}</span>
        </div>`).join('')}</div>`;
    }else if(p.poem){
      poem=`<details class="lit-archive-expand" ${p.id==='noailles'?'open':''}>
        <summary>${p.id==='noailles'?'Lire les quatre vers':'Lire le poème retrouvé'}</summary>
        <div class="lit-archive-poem">${escape(p.poem)}</div>
      </details>`;
    }else{
      poem=`<div class="lit-archive-reference">Cet extrait est conservé dans ton archive personnelle. Pour respecter les droits des œuvres contemporaines, la fenêtre publique présente sa référence, sans reproduire le passage intégral.</div>`;
    }
    result.innerHTML=`<span class="lit-book-ribbon">LES SOUVENUES · ${escape(p.kind)} · ARCHIVE Nº ${String(poet+1).padStart(2,'0')}</span>
      <h3>${escape(p.title)}</h3>
      <p class="lit-byline">${escape(p.name)} <small>${escape(p.dates)}</small></p>
      <p class="lit-archive-source">${escape(p.kindNote)}</p>
      <p class="lit-archive-note">${escape(p.note)}</p>
      ${poem}
      <a class="lit-text-link" href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">Consulter la source ↗</a>`;
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
    if(name==='reading-room'){selectedMood='surprise';selection=-1;showReading();}
    if(name==='souvenues'){poet=0;showPoet();}
    if(name==='word-lab'){if(!bank.length)freshBank();renderPoem();}
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-lit-mood],[data-lit-random],[data-lit-book],[data-lit-poet],[data-lit-pick-poet],[data-lit-add],[data-lit-remove],[data-lit-shift],[data-lit-shuffle],[data-lit-clear],[data-lit-export]');
    if(!target||!target.closest('#window-content .lit-app'))return;
    if(target.hasAttribute('data-lit-mood')){selectedMood=target.dataset.litMood;selection=-1;showReading();}
    else if(target.hasAttribute('data-lit-random'))showReading();
    else if(target.hasAttribute('data-lit-book')){
      selectedMood='surprise';
      drawReadingBook(readingExamples.find(b=>b.rank===Number(target.dataset.litBook)));
    }
    else if(target.hasAttribute('data-lit-poet')){poet=Number(target.dataset.litPoet);showPoet();}
    else if(target.hasAttribute('data-lit-pick-poet')){poet=(poet+1+Math.floor(Math.random()*(souvenuesEntries.length-1)))%souvenuesEntries.length;showPoet();}
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
  document.addEventListener('error',event=>{
    if(event.target.matches?.('#window-content .lit-cover img')) event.target.hidden=true;
  },true);
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