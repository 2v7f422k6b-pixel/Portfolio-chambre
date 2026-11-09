/* Public directory. Reuse the same catalogs as the gallery, shop and room. */
(() => {
  'use strict';
  const fr = () => document.documentElement.lang !== 'en';
  let photos = [], catalogsReady;
  function loadCatalogs() {
    if (!catalogsReady) catalogsReady = Promise.allSettled([
      fetch('content/polaroids.json').then(r => r.ok ? r.json() : {}).then(data => { photos = data.photos || []; }),
      import('./shop-book-catalog.js').then(() => import('./shop-products.js'))
    ]);
    return catalogsReady;
  }
  const staticItems = items => items.map(([route,french,english]) => ({route,title:fr() ? french : english || french}));
  function groups() {
    const nav = staticItems([
      ['accueil','Accueil','Welcome'],['room','La chambre','The room'],['work','Le bureau','The desktop'],
      ['illustrations','Illustrations'],['photos','Polaroïds','Polaroids'],['animations','Animations'],
      ['musique/home','Musique et visuels','Music & Visual Design'],['fenetre/projets','Projets','Projects'],
      ['fenetre/illustration','Projets d’illustration','Illustration projects'],['fenetre/social','Réseaux sociaux','Social media'],
      ['fenetre/interactive','Projets interactifs','Interactive projects'],['fenetre/articles','Articles'],
      ['fenetre/bibliotheque','Bibliothèque','Bookshelf'],['fenetre/souvenues','Les Souvenues'],
      ['fenetre/gearnews','Série GearNews','GearNews series'],['objet/carte-pokemon','La carte de Léna','Léna’s character card'],
      ['fenetre/contact','Contact'],['fenetre/mail','Mail'],['fenetre/aide','Aide','Help'],
      ['newsletter','La newsletter de Léna','Letters from Léna'],
      ['livre/la-princesse-clown','Lire La Princesse Clown','Read La Princesse Clown']
    ]);
    const games = staticItems([
      ['jeux','Tous les jeux','All games'],['jeu/dressing','Le dressing','The dressing room'],
      ['jeu/mimilab','MimiLab'],['jeu/fortune-cookie','Fortune cookie'],['jeu/do-nothing','Le Club du rien','Do Nothing Club'],
      ['jeu/latte','Atelier latte','Latte Lab'],['jeu/tamagotchi','Tamagotchi'],['jeu/coloring','Coloriage','Coloring book'],
      ['jeu/bead-box','La boîte à perles','The bead box'],['jeu/word-lab','Le laboratoire des mots','Word lab']
    ]);
    const objects = (window.NANA_ROOM_ZONES || []).map(z => ({route:'objet/'+z.id,title:z.label}));
    objects.push(...staticItems([['objet/machine-a-ecrire','Machine à écrire','Typewriter'],
      ['objet/miroir','Miroir','Mirror'],['objet/fleurs','Fleurs','Flowers'],['objet/lampe-fleur','Lampe fleur','Flower lamp'],
      ['objet/post-it','Post-it'],['objet/corbeille','Corbeille','Trash'],['telephone/contacts','Contacts du téléphone','Phone contacts'],
      ['telephone/mail','Mail du téléphone','Phone mail']]));
    const art = ART.map(a => ({route:'illu/'+a.filename.replace(/\.[^.]+$/,''),title:a.title}));
    art.push(...GABZILLA.map(a => ({route:'projet/gabzilla/'+a.src.split('/').pop().replace(/\.[^.]+$/,''),title:'GABZILLA — '+a.title})));
    const shots = photos.filter(p=>p.src).map(p=>({route:'photos/'+p.src.split('/').pop().replace(/\.[^.]+$/,''),title:p.title}));
    const videos = (window.NanaMotionItems || []).filter(v=>v.published).map(v=>({route:'animation/'+v.file,title:v.title}));
    const music = window.NanaMusicVisuals;
    const visuals = [...(music?.artists || []).map(a=>({route:'musique/artiste/'+a.id,title:a.title})),
      ...(music?.items || []).map(a=>({route:'musique/illustration/'+a.id,title:a.title}))];
    const shop = window.NanaShopCatalog?.entries(fr()?'fr':'en') || staticItems([['shop','Boutique','Shop']]);
    return [
      [fr()?'Pages du portfolio':'Portfolio pages', nav], [fr()?'Jeux':'Games',games],
      [fr()?'Objets de la chambre':'Room objects',objects],['Illustrations',art],
      ['Polaroids',shots],['Animations',videos],[fr()?'Visuels musicaux':'Music artwork',visuals],
      [fr()?'Livres et textes':'Books and writing',window.NanaLiterary?.links || []],
      [fr()?'Boutique':'Shop',shop]
    ];
  }
  function render(host) {
    const expanded = new Set([...host.querySelectorAll('details[open]')].map(d=>d.dataset.group));
    const nodes = groups().map(([name,items],index) => {
      const section = document.createElement('details');
      section.dataset.group = String(index);
      section.open = expanded.has(String(index));
      const title = document.createElement('summary');
      title.textContent = name+' ('+items.length+')';
      const list = document.createElement('ul');
      for (const item of items) {
        const row = document.createElement('li'), link = document.createElement('a');
        link.href = '#/'+item.route.split('/').map(encodeURIComponent).join('/');
        link.textContent = item.title;
        row.append(link);
        list.append(row);
      }
      section.append(title,list);
      return section;
    });
    host.replaceChildren(...nodes);
  }
  function open() {
    const name = fr() ? 'Liens directs' : 'Direct links';
    const intro = fr() ? 'Choisis une rubrique pour retrouver un lien à partager.' : 'Choose a section to find a link to share.';
    openWindow(name, '<p>'+intro+'</p><div id="nana-link-index" data-no-translate></div>', 'links');
    const host = document.getElementById('nana-link-index');
    render(host);
    loadCatalogs().then(() => { if (host.isConnected) render(host); });
  }
  document.addEventListener('portfolio-language-change', () => {
    if (document.getElementById('nana-link-index')) open();
  });
  window.NanaLinkDirectory = {open, entries:() => groups().flatMap(([,items])=>items)};
})();

