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
      "note": "",
      "status": "transcribed",
      "source": "https://www.laparafe.fr/2012/01/desdemona-dialogue-autour-dothello-de-shakespeare/",
      "section": "Premières retrouvailles",
      "bg": "#f3e2f4",
      "ink": "#a34a79",
      "format": "theatre",
      "poem": "What bless to know I will never die again. – We will never die again.\n\n« Quelle bénédiction de savoir que je ne mourrai plus jamais. – Nous ne mourrons plus jamais. »"
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
      ],
      "section": "Premières retrouvailles",
      "bg": "#f9edf0",
      "ink": "#9e3152",
      "format": "poesie"
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
      "poem": "Prenez ce coeur puissant qu'un faible corps opprime,\nEt qui, heurtant sans fin ses étroites parois,\nEut l'attrait du divin et le pouvoir des cimes,\nEt s'élevait aux cieux comme la pierre choit.",
      "section": "Premières retrouvailles",
      "bg": "#fff1e5",
      "ink": "#c45c78",
      "format": "poesie"
    },
    {
      "id": "hegland",
      "name": "Jean Hegland",
      "dates": "née en 1956",
      "title": "Dans la forêt",
      "kind": "Roman",
      "kindNote": "Extrait sur la lune",
      "note": "",
      "status": "transcribed",
      "source": "https://www.senscritique.com/livre/dans_la_foret/22541510",
      "section": "Premières retrouvailles",
      "bg": "#ffefd7",
      "ink": "#35938c",
      "format": "recit",
      "poem": "Mais j’ai appris quelque chose que l’encyclopédie ne sait pas\n— quand la lune est croissante, on peut l’atteindre\net tenir délicatement sa courbe externe dans la paume\nde la main droite. Quand elle est décroissante,\nelle remplit la paume de la main gauche."
    },
    {
      "id": "gauthier",
      "name": "Xavière Gauthier",
      "dates": "née en 1942",
      "title": "Pourquoi sorcières ?",
      "kind": "Revue",
      "kindNote": "Sorcières",
      "note": "",
      "status": "transcribed",
      "source": "https://musees-occitanie.fr/assets/uploads/2021/03/dossier-de-presse-magies-compresse.pdf",
      "section": "Premières retrouvailles",
      "bg": "#fbdada",
      "ink": "#7b2348",
      "format": "essai",
      "poem": "« Pourquoi sorcières ? Parce qu’elles dansent. Elles dansent à la pleine lune. Femmes lunaires, lunatiques, atteintes – disent-ils – de folie périodique. […]\n\nPourquoi sorcières ? Parce qu’elles vivent. Parce qu’elles sont en contact direct avec la vie de leur corps, avec la vie de la nature, avec la vie du corps des autres. Les sorcières respiraient, palpaient, appelaient chaque fleur, chaque herbe, chaque plante. […]\n\nPourquoi sorcières ? Parce qu’elles jouissent. Elles éclatent, leur corps entier est désir... leur jouissance est si violente, si transgressante, si ouverte, si mortelle que les hommes n’en sont pas encore revenus »"
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
      "poem": "Grandiose, imposant dans la voûte profonde,\nLe soleil saluait d'un coutumier adieu\nLe fleuve les palmiers, les sables de ce lieu\nEt cheminait vers l'autre monde.\n\nAlors tout l'horizon laisse monter un cri,\nLe firmament se teint de lilas et de rose\n(Frémissantes couleurs où l'azur doux repose),\nEt le zéphire souffle attendri.\n\nLe Caire était caché sous une vague brume,\nLes arbres tournoyant sur les bords bruns du Nil\nL'ombre tombait partout, sans trouver de péril,\nEt couvrait la plaine et l'écume.\n\nO Pyramides! C’est alors\nQue, levant ma tête pensive,\nJ'entends errer sur vos flancs forts\nL'écho de quelque voix plaintive;\nMais quoi! Serait-ce en votre sein\nQ'un orphelin pleure sa mère?\nEst-ce un hymne, est-ce une prière,\nEst-ce un gémissement divin?\n\nMais déjà revient le silence\nAutour du grand monument noir.\nUn temps - Mon coeur frémit, s'élance,\nPlane avec la brise du soir...\n\nSoudain les sons se font entendre,\nO dieux! Mais d'où viennent-ils donc?\nUne douce harmonie y fond...\nEst-ce de la voix d'Alexandre\nUn écho? De Napoléon\nEst-ce le sabre qui miroite?\nEst-ce ta statue, o Memnon,\nQui tombe en une vapeur moite?\nEst-ce le soupir d'un soldat\nDéfunt? Un cheval qui se cabre?\nEst-ce un craquement d'un marbre\nQui depuis des siècles gît là?\n\nRépondez, Monuments! Pyramides altières,\nDes siècles révolus ô souvenir muet!\nSont-ce des chants d'amour, des commandes guerrières\nQue vos entrailles jettent net?\n\nNon, sur vos côtes délabrées\nCe n'est plus l'aigle Impérial\nQui marque vos terres sacrées\nDes pas de son fougueux cheval;\nOh! Baissez vos armes françaises\nVos drapeaux sont à peine vus...\nEt Mohamed Ali n'est plus,\nToutes les choses sont anglaises.\n\n…\n\nCes longs échos flottants et chatouillant mon âme\nComme un souffle de brise, une haleine d'azur,\nUn baiser maternel, un regard triste et pur,\nL'éclair d'une subtile flamme,\n\nUn doigt câlin d'enfant qui caresse mon front,\nUn gazouillis d'oiseau, d'un fleuve le murmure,\nUn sourire amical, un cri de la nature\nOu du soleil un rayon blond,\n\nC'était la fanfare lointaine\nQui jouait Dieu sauve le Roi\nC'était la vibration certaine\nDe coeurs vaillants et pleins de foi;\n\nDe tes moelleux flots nostalgiques\nHarmonie, ô nectar divin,\nJe laisse couler dans mon sein\nLes tiédeurs mélancoliques....\n\nMuses, Beautés, Beaux-Arts aimés,\nOcéans, rivière, verdures,\nAzur immense, astres dorés\nQui du ciel êtes la parure\n\nA vous, à vous mes jeunes ans,\nA vous ma jeune intelligence,\nMon amour et ma confiance,\nA vous mes rêves bleus et blancs!\n\nMais trêve de transports. A bientôt, Pyramides,\nEt vous, Liban, Beyrouth, cher Antoura, salut!\nMa Syrie, Salut! Dès qu je l'aurai pu\nJ'irai revoir tes horizons limpides.",
      "section": "Premières retrouvailles",
      "bg": "#fff1df",
      "ink": "#8b5365",
      "format": "poesie"
    },
    {
      "id": "sappho",
      "name": "Sappho",
      "dates": "",
      "title": "Fragment attribué à Sappho",
      "kind": "Poésie",
      "kindNote": "Traduction et source non indiquées",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#faede6",
      "ink": "#d2799a",
      "format": "poesie",
      "poem": "Mais je désire encor... Mon âme désolée\nGoûte encor le soleil et les fleurs printanières.\nLes bêtes vont mourir au fond de leurs tanières,\nMais je veux jusqu’au bout savourer la clarté\nEt vous aimer..."
    },
    {
      "id": "estes",
      "name": "Clarissa Pinkola Estés",
      "dates": "",
      "title": "Femmes qui courent avec les loups",
      "kind": "Essai",
      "kindNote": "Extrait sur le rire",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#dce6f2",
      "ink": "#855929",
      "format": "essai",
      "poem": "Le rire est un aspect secret de la sexualité féminine, un aspect physique, primitif, passionné, vitalisant et donc excitant. C'est le genre de sexualité dépourvue de but, au contraire de l'excitation génitale. C'est une sexualité joyeuse, une sexualité du moment, un véritable amour sensuel qui se libère, vit, meurt et revit de par sa propre énergie. Il est sacré parce qu'il a valeur de guérison. Il est sensuel parce qu'il réveille le corps et les émotions, parce qu'il excite et fait naître des ondes de plaisir. Il n'est pas unidimensionnel, car le rire se partage. C'est la sexualité la plus sauvage de la femme."
    },
    {
      "id": "diallo",
      "name": "Koumanthio Zeinab Diallo Kazédi",
      "dates": "",
      "title": "Abstinence",
      "kind": "Poésie",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#edeacc",
      "ink": "#8f2546",
      "format": "poesie",
      "poem": "Abandonner...\nLes caresses charnelles\nDe tes paumes brûlantes\nAu secours de mes délires\nDans la frénésie des corps en sursaut\n\nOublier...\nLe souvenir de ton regard enflammé\nCaressant mon souffle effréné\nLe rire fascinant de tes yeux\nEt la virilité de ton corps éveillé\n\nPour m'abstenir\nJe m'offre à ces douces heures\nCes heures immortelles\nSuspendues au souvenir têtu\nDes ultimes confidences"
    },
    {
      "id": "ziade-lacrymosa",
      "name": "May Ziadé",
      "dates": "",
      "title": "Lacrymosa",
      "kind": "Poésie",
      "kindNote": "Extrait",
      "note": "Un rêve traversé par la nuit, l’absence et le souvenir d’un être aimé.",
      "status": "full",
      "source": "https://fr.wikisource.org/wiki/Fleurs_de_r%C3%AAve/Texte_entier",
      "section": "Archives 1/2",
      "bg": "#eaf2df",
      "ink": "#317d86",
      "format": "poesie",
      "poem": "J'ai caressé ma lyre avec mes mains lassées\nEt j'ai gravi la côte où j'ai souvent marché,\nEt j'ai baisé les fleurs des branches enlacées,\nEt j'ai suivi mon rêve, allant au but cherché.\n\nLe cœur battant à coups précipités, dans l'ombre;\nUn seul désir dans l'âme, une larme à mon cil,\nVoyant le ciel trop noir et la cité trop sombre,\nJe t'ai suivi, mon rêve angoissant et subtil!\n\n(…)\n\n…Le ciel est noir, mais quelque chose,\nUn point à reflets chatouillants,\nUn semblant de prunelle rose,\nUn astre aux feux doux, ondoyants…\nAinsi que l'étoile, naguère,\nBethlehem aux Mages montrant,\nL'astre qui me guide m'attend\nÀ la porte du cimetière.\n\nEnfant depuis longtemps parti,\nO frère devenu bel ange,\nPardonne à ma voix, mon petit,\nMa triste voix qui te dérange!\nQue ta forme, sans s'attarder,\nReprenne la robe éphémère\nDe son enfance et de sa terre\nEt vienne un peu me regarder!"
    },
    {
      "id": "bachmann",
      "name": "Ingeborg Bachmann",
      "dates": "",
      "title": "Ombres roses ombres",
      "kind": "Poésie",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#ae6070",
      "ink": "#fff0f0",
      "format": "poesie",
      "poem": "Sous un ciel étranger\nombres roses\nombres\nsur une terre étrangère\nentre roses et ombres\ndans une eau étrangère\nmon ombre"
    },
    {
      "id": "gagnon",
      "name": "Madeleine Gagnon",
      "dates": "",
      "title": "Venue à l’écriture",
      "kind": "Essai",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#dff2fc",
      "ink": "#cb6f97",
      "format": "essai",
      "poem": "Mon corps est nuit. Opaque et liquide, il a été caché pendant des siècles. Pour compenser ce manque-à-être, les hommes l’ont élevé au rang d’objet d’art, puis ils l’ont exhibé plus que tout autre corps vivant ou inerte. Ils en ont reproduit tellement d’exemplaires qu’il en devint marchandise d’une grande industrie."
    },
    {
      "id": "koltz",
      "name": "Anise Koltz",
      "dates": "",
      "title": "Poème (titre non indiqué)",
      "kind": "Poésie",
      "kindNote": "Extrait sans titre sur la carte",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#f9eced",
      "ink": "#dd801b",
      "format": "poesie",
      "poem": "J’aime te sentir\nSur moi\nComme un pont écroulé\n\nMa rivière\nPolira tes pierres"
    },
    {
      "id": "miano",
      "name": "Léonora Miano",
      "dates": "",
      "title": "La Saison de l’ombre",
      "kind": "Roman",
      "kindNote": "Extrait sur la nuit",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 1/2",
      "bg": "#807dbe",
      "ink": "#fff4dc",
      "format": "recit",
      "poem": "La nuit tombe d'un coup, comme un fruit trop mûr. Elle s'écrase sur le marais, la rivière, les cases sur pilotis.\n\nLa nuit a une texture : celle de la pulpe du kasimangolo, dont on ne peut savourer toute la douceur sucrée qu'en suçant prudemment les piquants du noyau.\n\nLa nuit est faite pour le repos, mais elle n'est pas si tranquille. Il faut rester sur ses gardes.\n\nLa nuit a une odeur : elle sent la peau de ceux qui sont ensemble par la force des choses. Ceux qui ne se seraient jamais rencontrés, s'il n'avait pas fallu s'enfuir, courir sans savoir où pour rester en vie, trouver une vie.\n\nLa nuit sent les souvenirs que le jour éloigne parce que l'on s'occupe l'esprit à assembler les parties d'une case sur pilotis, à chasser, à piler, à écailler, à soigner le nouveau venu, à caresser la joue de l'enfant qui ne parle pas, à lui chercher un nom pour le maintenir dans la famille des hommes.\n\nLa nuit charrie les réminiscences du dernier jour de la vie d'avant, dans le monde d'antan, sur la terre natale."
    },
    {
      "id": "matlwa",
      "name": "Kopano Matlwa",
      "dates": "",
      "title": "Règles douloureuses",
      "kind": "Roman",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#e5f1fb",
      "ink": "#df6491",
      "format": "recit",
      "poem": "J’ai décidé d’arrêter tous mes traitements. Je suis fatiguée. J’ai fini par aimer ce mince filet de sang qui s’écoule de mon corps jour après jour. Il teinte l’eau du bain d’une jolie couleur rose. Parfois, quand un petit caillot s’échappe, l’eau devient marron foncé.\n\nLa partie molle de mon ventre est chaude et me picote. Je me sens si mal que je suis souvent obligée de m’asseoir pour ne pas m’évanouir. C’est une sorte de douleur, une sorte de plaisir, une sorte de liberté que j’aime et que le traitement du docteur Phakama a essayé de me dérober. Mais cette sensation est à moi, et elle est agréable, et je la veux.\n\nLes murmures qui m’accompagnent ne me gênent pas non plus. Ils me tiennent compagnie, me chantent des chansons et me racontent des histoires qui font passer le temps. Ton silence était de toute façon bien trop assourdissant."
    },
    {
      "id": "delpastre",
      "name": "Marcelle Delpastre",
      "dates": "",
      "title": "Lune",
      "kind": "Poésie",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#d9edf9",
      "ink": "#324962",
      "format": "poesie",
      "poem": "Couteau de sel, lame d'argent,\nla lune est blanche à l'horizon.\nQue sais-tu de la lune ?\nLame de cuivre, goutte de sang,\nla lune est rouge à l'horizon.\nQue de fois je l'ai vue sur le sillon noirci\nluire comme une eau vive, et sur les feuilles des tilleuls.\nFrange de sel, vague d'argent,\nLa lune est blanche à l'horizon.\nLa lune et la nuit se ressemblent.\nPlume de givre, flaque de sang,\nla lune est rouge à l'horizon.\nQue de fois je l'ai vue au milieu de l'étang\nplonger sa face endolorie, comme un noyé, comme un pendu\npour quel supplice méconnu,\nquelle figure et quelle solitude,\nquel symbole et quelle similitude.\nCouteau de feu, face d'argent,\nla lune est blanche à l'horizon.\nLame d'acier, face de sang,\nla lune est rouge à l'horizon."
    },
    {
      "id": "real",
      "name": "Grisélidis Réal",
      "dates": "",
      "title": "Le Noir est une couleur",
      "kind": "Récit",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#ec9299",
      "ink": "#fff3eb",
      "format": "recit",
      "poem": "À pas de louves, à pas de tigresses et d’oiseaux, nous marcherons sur la lune s’il le faut, nous gagnerons l’espace qui nous revient, à nous qui sommes le baume sur les blessures, et l’eau dans le désert, parfumées, étincelantes, offertes et blessées, douces et violentes, femmes et magiciennes, princesses de nos sens et du désir des hommes."
    },
    {
      "id": "kane",
      "name": "Sarah Kane",
      "dates": "",
      "title": "4.48 Psychose",
      "kind": "Théâtre",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#e2f0e9",
      "ink": "#255a59",
      "format": "theatre",
      "poem": "J'ai peur de perdre celle que jamais je n'ai touchée, l'amour me tient en esclavage dans une cage de larmes, je me mords la langue qui jamais ne peut lui parler, une femme me manque qui n'est jamais née, j'embrasse une femme par-delà les ans qui disent que jamais on ne se rencontrera. Tout passe. Tout périt. Tout pâlit. Ma pensée s'éloigne avec un sourire meurtrier et laisse la discordante anxiété rugir dans mon âme. Pas d'espoir. Pas d'espoir. Pas d'espoir. Pas d'espoir. Pas d'espoir. Pas d'espoir. Pas d'espoir.\n\nUne chanson pour mon aimée, touchant à son absence, aux marées de son cœur, l'éclat de son sourire. Dans dix ans elle sera toujours morte. Pendant que je vivrai avec, que je me débrouillerai avec, pendant que des jours passeront où je n'y penserai même pas, elle sera toujours morte. Pendant que je serai une vieille dame sans abri en train d'oublier mon nom elle sera toujours morte, elle sera toujours morte, c'est terminé, putain, c'est tout, et je dois tenir toute seule.\n\nMon amour, mon amour, pourquoi m'as-tu abandonnée ? Elle est la couche où jamais je ne m'étendrai, et la vie n'a aucun sens à la lumière de ma perte. Bâtie pour la solitude, pour aimer l'absente. Trouve-moi. Libère-moi du doute corrosif, désespoir futile, horreur du repos. Je peux remplir ma place, remplir mon temps, mais rien ne peut remplir ce vide-là dans mon cœur. Ce besoin vital pour lequel je mourrais."
    },
    {
      "id": "chedid",
      "name": "Andrée Chedid",
      "dates": "",
      "title": "Rythmes",
      "kind": "Poésie",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#f9eced",
      "ink": "#94536f",
      "format": "poesie",
      "poem": "Pour mieux tenir debout\nL’homme inventa la fable\nSe vêtit de légendes\nPeupla le ciel d’idoles\nMultiplia ses panthéons\nCumula ses utopies\n\nSe voulant éternel\nIl fixa son oreille\nSur la coquille du monde\nÀ l’écoute\nD’une voix souterraine\nQui l’escorte le guide\nEt l’agrandit\n\nAlors\nDe nuits en nuits\nEt d’aubes en aubes\nTantôt le jour s’éclaire\nTantôt le jour moisit\n\n(…)\n\nToute vie\nAmorça\nLe mystère\nTout mystère\nSe voilà\nDe ténèbres\nToute ténèbre\nSe chargea\nD’espérance\nToute espérance\nFut soumise\nÀ la Vie"
    },
    {
      "id": "cleyre",
      "name": "Voltairine de Cleyre",
      "dates": "",
      "title": "La Vie ou la Mort",
      "kind": "Prose",
      "kindNote": "Dialogue poétique",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#e9ddf7",
      "ink": "#403850",
      "format": "recit",
      "poem": "Une âme qui franchissait le Portail s’arrêta à mi-chemin et dit à la Vie :\n— « Qu’as-tu à m’offrir ? »\nLa Vie répondit :\n— « De la tristesse, un incessant combat, des déceptions.\nPuis le Silence et la Nuit. »\nL’âme dit à la Mort :\n— « Et toi, qu’as-tu à m’offrir ? »\n— « Je te donnerai tout de suite ce que la Vie ne t’accordera qu’à la fin. »\nL’âme se tourna vers la Vie :\n— « Et si je vis ? Et si je me bats ? »\n— « D’autres vivront et se battront après toi.\nEt leurs combats seront plus faciles là où tu auras combattu. »\n— « Mais à quoi bon leurs luttes à eux ? »\n— « Elles rendront plus léger le fardeau de tous ceux qui naîtront ensuite à la douleur et qui la combattront à leur tour. »\n— « Mais qu’ai-je à voir avec ces autres ? Qui sont-ils donc ? »\n— « Ils sont toi. »\n— « Et ceux qui sont venus avant moi, qui sont-ils ? »\n— « Eux aussi, ils sont toi. »\n— « Le Silence et la Nuit auraient donc une fin ? »\n— « Ils finiront en chant et en lumière.\nEt la douleur s’achèvera en Paix\nPuisque la Mort meurt en moi\nTandis que tu passes de toi aux autres\nQue la lumière s’ombrage et que l’ombre s’illumine. Choisis ! »\nL’âme, en larmes, répondit :\n— « Je vivrai ! »"
    },
    {
      "id": "duras",
      "name": "Marguerite Duras",
      "dates": "",
      "title": "Hiroshima mon amour",
      "kind": "Scénario",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#e7f4f0",
      "ink": "#167e8b",
      "format": "recit",
      "poem": "Je te rencontre. Je me souviens de toi. Qui es-tu ? Tu me tues. Tu me fais du bien. Comment me serais-je doutée que cette ville était faite à la taille de l’amour ? Comment me serais-je doutée que tu étais fait à la taille de mon corps même ? Tu me plais. Quel événement. Tu me plais. Quelle lenteur tout à coup. Quelle douceur. Tu ne peux pas savoir. Tu me tues. Tu me fais du bien. Tu me tues. Tu me fais du bien. J’ai le temps. Je t’en prie. Dévore-moi. Déforme-moi jusqu’à la laideur."
    },
    {
      "id": "woolf",
      "name": "Virginia Woolf",
      "dates": "",
      "title": "Les Vagues",
      "kind": "Roman",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#294c9c",
      "ink": "#fff6ec",
      "format": "recit",
      "poem": "J’ai voulu dilater la nuit, et y faire entrer sans cesse de plus en plus de rêves."
    },
    {
      "id": "nelson",
      "name": "Maggie Nelson",
      "dates": "",
      "title": "Les Argonautes",
      "kind": "Essai",
      "kindNote": "Extrait",
      "note": "",
      "status": "transcribed",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#bbcef0",
      "ink": "#242849",
      "format": "essai",
      "poem": "D’un point de vue empirique, on est fait de poussière d’étoiles. Pourquoi est-ce qu’on n’en parle pas davantage ?"
    },
    {
      "id": "sauvage",
      "name": "Cécile Sauvage",
      "dates": "",
      "title": "Le Cœur tremblant, la joue en feu",
      "kind": "Poésie",
      "kindNote": "Extrait",
      "note": "Des baisers et des sensations qui restent suspendus dans le souvenir.",
      "status": "full",
      "source": "https://www.facebook.com/lessouvenues",
      "section": "Archives 2/2",
      "bg": "#ee6971",
      "ink": "#fff5ec",
      "format": "poesie",
      "poem": "Le cœur tremblant, la joue en feu,\nJ’emporte dans mes cheveux\nTes lèvres encore tièdes.\n\nTes baisers restent suspendus\nSur mon front et mes bras nus\nComme des papillons humides."
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
  let archiveFilter = 'toutes';
  let archiveQuery = '';
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
 return `<div class="lit-app lit-souvenues lit-archive-gallery lit-archive-reader">
   ${header('Les Souvenues','Des textes de femmes à lire, tout simplement.')}
   <div class="lit-reader-head">
     <span class="lit-reader-kicker">ARCHIVES LITTÉRAIRES · 24 TEXTES RETROUVÉS</span>
     <button type="button" class="lit-button" data-lit-pick-poet>✦ Cueille un texte au hasard</button>
   </div>
   <article class="lit-card lit-poet-detail" id="lit-poet-detail" aria-live="polite" aria-label="Extrait à lire">
     <div class="lit-card-body"></div>
   </article>
   <nav class="lit-reader-nav" aria-label="Parcourir les textes">
     <button type="button" class="lit-button" data-lit-prev>← Texte précédent</button>
     <span class="lit-reader-count" data-lit-position>1 / 24</span>
     <button type="button" class="lit-button" data-lit-next>Texte suivant →</button>
   </nav>
   <section class="lit-reader-index" aria-label="Index des textes">
     <h3 class="lit-micro-title">Choisir un texte</h3>
     <label class="lit-archive-searchlabel" for="lit-archive-search">Chercher une autrice ou un titre</label>
     <input id="lit-archive-search" class="lit-archive-search" data-lit-query type="search" autocomplete="off" placeholder="Autrice, titre, œuvre…">
     <div class="lit-archive-filters" role="group" aria-label="Filtrer les textes">
       ${[['toutes','Tous'],['poesie','Poèmes'],['recit','Récits'],['essai','Essais'],['theatre','Théâtre']].map(([key,label])=>
         `<button type="button" class="lit-button" data-lit-filter="${key}" aria-pressed="${archiveFilter===key}">${label}</button>`).join('')}
     </div>
     <p class="lit-reader-indexcount" data-lit-archive-count>24 textes</p>
     <div class="lit-poets" aria-label="Liste des textes"></div>
     <p class="lit-archive-noresult" data-lit-noresult hidden>Aucun résultat pour cette recherche.</p>
   </section>
   <p class="lit-caption">Textes retranscrits à partir des archives retrouvées. Certaines graphies et traductions méritent une relecture. <a href="https://www.facebook.com/lessouvenues" target="_blank" rel="noopener noreferrer">Ancienne page Facebook ↗</a></p>
 </div>`;
}
  function archiveVisible() {
  const query=archiveQuery.toLocaleLowerCase('fr').trim();
  return souvenuesEntries.map((entry,index)=>({entry,index})).filter(({entry})=>
    (archiveFilter==='toutes'||entry.format===archiveFilter) &&
    (!query||[entry.name,entry.title,entry.kind,entry.kindNote].join(' ').toLocaleLowerCase('fr').includes(query))
  );
}
    function renderSouvenuesGrid() {
 const root=appRoot(),grid=root?.querySelector('.lit-poets');
 if(!root||!grid)return;
 const visible=archiveVisible();
 grid.innerHTML=visible.map(({entry:p,index:i})=>
  `<button type="button" class="lit-index-item" data-lit-poet="${i}" aria-pressed="${poet===i}">
    <span class="lit-index-num">${String(i+1).padStart(2,'0')}</span>
    <span class="lit-index-copy"><strong>${escape(p.name)}</strong><small>${escape(p.title)}</small></span>
    <span class="lit-index-arrow" aria-hidden="true">↗</span>
  </button>`).join('');
 const counter=root.querySelector('[data-lit-archive-count]');
 if(counter)counter.textContent=visible.length+' texte'+(visible.length!==1?'s':'');
 const noresult=root.querySelector('[data-lit-noresult]');
 if(noresult)noresult.hidden=visible.length>0;
 root.querySelectorAll('[data-lit-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.litFilter===archiveFilter)));
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
 const root=appRoot(),result=root?.querySelector('#lit-poet-detail .lit-card-body');
 if(!root||!result)return;
 const p=souvenuesEntries[poet];
 if(!p)return;
 const lines=p.aligned ?
   p.aligned.map(([left,right],index)=>([4,8,11].includes(index)?'\n':'')+left+' '+right).join('\n') :
   (p.poem||'Texte en attente de retranscription.');
 const countRoot=root.querySelector('[data-lit-position]');
 const filtered=archiveVisible();
 const position=filtered.findIndex(({index})=>index===poet)+1;
 if(countRoot)countRoot.textContent=(position||'–')+' / '+filtered.length;
 root.querySelectorAll('[data-lit-poet]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.litPoet)===poet)));
 const isFb=p.source==='https://www.facebook.com/lessouvenues';
 result.innerHTML=`<div class="lit-readable-paper">
   <p class="lit-readable-eyebrow">LES SOUVENUES · ${escape(p.kind)} · ARCHIVE Nº ${String(poet+1).padStart(2,'0')}</p>
   <h3 class="lit-readable-title">${escape(p.title)}</h3>
   <p class="lit-readable-author">${escape(p.name)}</p>
   <p class="lit-readable-origin">${escape(p.kindNote)}</p>
   <div class="lit-readable-excerpt" lang="fr">${escape(lines)}</div>
   <a class="lit-readable-source" href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">${isFb?'Voir l’ancienne page Les Souvenues ↗':'Consulter la référence de l’œuvre ↗'}</a>
 </div>`;
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
    if(name==='souvenues'){poet=0;archiveFilter='toutes';archiveQuery='';renderSouvenuesGrid();showPoet();}
    if(name==='word-lab'){if(!bank.length)freshBank();renderPoem();}
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-lit-mood],[data-lit-random],[data-lit-book],[data-lit-poet],[data-lit-pick-poet],[data-lit-filter],[data-lit-add],[data-lit-remove],[data-lit-shift],[data-lit-shuffle],[data-lit-clear],[data-lit-export]');
    if(!target||!target.closest('#window-content .lit-app'))return;
    if(target.hasAttribute('data-lit-mood')){selectedMood=target.dataset.litMood;selection=-1;showReading();}
    else if(target.hasAttribute('data-lit-random'))showReading();
    else if(target.hasAttribute('data-lit-book')){
      selectedMood='surprise';
      drawReadingBook(readingExamples.find(b=>b.rank===Number(target.dataset.litBook)));
    }
    else if(target.hasAttribute('data-lit-poet')){
      poet=Number(target.dataset.litPoet);
      showPoet();
      scrollToPoet();
    }
    else if(target.hasAttribute('data-lit-pick-poet')){
      const candidates=archiveVisible().map(x=>x.index);
      const options=candidates.length>1?candidates.filter(i=>i!==poet):candidates;
      if(options.length){poet=options[Math.floor(Math.random()*options.length)];showPoet();scrollToPoet();}
    }
    else if(target.hasAttribute('data-lit-filter')){
      archiveFilter=target.dataset.litFilter;
      renderSouvenuesGrid();
      const next=archiveVisible()[0];
      if(next){poet=next.index;showPoet();}
      else appRoot()?.querySelector('#lit-poet-detail .lit-card-body')?.replaceChildren();
    }
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
    function scrollToPoet() {
  appRoot()?.querySelector('#lit-poet-detail')?.scrollIntoView({block:'nearest',behavior:'smooth'});
}
  document.addEventListener('input',event=>{
    if(!event.target.matches?.('#window-content .lit-archive-search'))return;
    archiveQuery=event.target.value;
    renderSouvenuesGrid();
    const next=archiveVisible()[0];
    if(next){poet=next.index;showPoet();}
    else appRoot()?.querySelector('#lit-poet-detail .lit-card-body')?.replaceChildren();
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