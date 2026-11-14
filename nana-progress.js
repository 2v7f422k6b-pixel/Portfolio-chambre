/* Shared, local visitor progress. The room and standalone games use the same keys.
   Collections are derived from real actions; preview/creator sessions never award them. */
(() => {
  'use strict';
  if (window.NanaProgress) return;
  try { if (window.parent !== window && window.parent.NanaProgress) {
    window.NanaProgress = window.parent.NanaProgress; return;
  } } catch (_) {}
  const KEY = 'nana-visitor-progress-v1';
  const ROOM_KEY = 'nana-room-exploration-20261104-v1';
  const CLOWN_KEY = 'nana-clown-outfit-unlocked-v1';
  // Kept separately so older game tabs cannot erase newly read dialogue.
  const DIALOGUE_KEY = 'nana-figurine-dialogue-v1';
  const BADGES_KEY = 'nana-exploration-badges-v1';
  const dialogueLengths = {miffy:6, 'sonny-angel':6};
  const listeners = new Set();
  const pair = (fr, en) => ({fr, en});
  const art = name => 'assets/drawn-ui/' + name + '.png';
  const crop=(src,box,width=3072,height=1732)=>({src,box,width,height});
  const games = [
    ['dressing', 'Dressing', 'Dressing', 'etoile_pleine'],
    ['latte', 'Atelier latte', 'Latte café', 'latte_espresso'],
    ['tamagotchi', 'Prendre soin de moi', 'A little self-care', 'fleur'],
    ['coloring', 'Coloriage', 'Colouring book', 'crayon_pinceau'],
    ['bead-box', 'Boîte à perles', 'Bead box', 'fleur'],
    ['do-nothing', 'Le club du rien', 'Do Nothing Club', 'nuage_jour_01'],
    ['word-lab', 'Le laboratoire des mots', 'Word lab', 'lettre_A'],
    ['mimilab', 'Mimilab', 'Mimilab', 'notes_musique']
  ].map(([id, fr, en, image]) => ({id, name:pair(fr,en), route:'jeu/'+id, image:art(image)}));
  const secrets = [
    {id:'secret-rug', name:pair('Une colocataire sous le tapis','A roommate under the rug'), image:art('araignee_jour'), route:'objet/tapis'},
    {id:'secret-memory-box', name:pair('La boîte à souvenirs','The memory box'), image:art('fleur'), route:'secret/boite-a-souvenirs'},
    {id:'secret-childhood-drawing', name:pair('Un dessin d’enfance','A childhood drawing'), image:art('crayon_pinceau'), route:null, available:false}
  ];
  // Bonus looks use Léna's drawings; exclusive pieces unlock with their matching activity.
  const outfits = [
    {id:'smiley',name:pair('Sourire fleuri','Flower smile'),visit:'objet/lampe-fleur',image:crop('assets/dressing-lena/IMG_6721.png',[640,728,669,840],2048,3072),pieces:['top-smiley'],values:{tops:'top-smiley'},rule:pair('Appuyer sur la lampe fleur.','Press the flower lamp.')},
    {id:'tamagotchi',name:pair('Petit compagnon','Little companion'),featsAny:['care-feed','care-sleep','care-draw','care-music','care-cuddle'],image:crop('assets/dressing-lena/IMG_6726.png',[1216,1650,139,262],2048,3072),pieces:['held-tamagotchi'],values:{handObject:'held-tamagotchi'},rule:pair('Jouer avec le Tamagotchi : effectuer une première action.','Play with the Tamagotchi: try your first action.')},
    {id:'george-sand',image:crop('assets/dressing-lena/IMG_5979.png',[693, 77, 527, 539],2048,3072),name:pair('George Sand','George Sand'),visit:'objet/souvenues',pieces:['head-george-sand','jewelry-george-sand','jacket-george-sand','vest-george-sand','pants-george-sand','top-george-sand','shoes-george-sand'],values:{hat:'head-george-sand',necklace:'jewelry-george-sand',jackets:'jacket-george-sand',vest:'vest-george-sand',pants:'pants-george-sand',tops:'top-george-sand',shoes:'shoes-george-sand'},rule:pair('Ouvrir Les Sous-vêtus, les livres du milieu.','Open Les Sous-vêtus, the middle books.')},
    {id:'inspector',image:crop('assets/dressing-lena/IMG_5990.png',[742, 197, 522, 311],2048,3072),name:pair('Inspectrice','Inspector'),exploration:.75,pieces:['jacket-inspector','pants-inspector','head-inspector-glasses','top-inspector','head-inspector','shoes-inspector'],values:{jackets:'jacket-inspector',pants:'pants-inspector',glasses:'head-inspector-glasses',tops:'top-inspector',hat:'head-inspector',shoes:'shoes-inspector'},rule:pair('Explorer 75 % de la chambre.','Explore 75% of the room.')},

    {id:'sonny',name:pair('Sonny Angel lapin','Bunny Sonny Angel'),dialogue:'sonny-angel',image:crop('assets/dressing-lena/IMG_5719.png',[825,13,348,627],2048,3072),pieces:['head-sonny-rabbit'],values:{hat:'head-sonny-rabbit'},makeup:['makeup-blush'],rule:pair('Lire les six phrases du Sonny Angel dans la chambre.','Read all six Sonny Angel lines in the room.')},
    {id:'night-explorer',name:pair('Exploratrice nocturne','Night explorer'),visit:'night',image:crop('assets/dressing-lena/IMG_5720.png',[801,203,604,560],2048,3072),pieces:['head-headlamp'],values:{headlamp:'head-headlamp',dresses:'dress-celestial'},rule:pair('Découvrir la chambre en mode nuit.','Discover the room at night.')},
    {id:"miffy",name:pair("Miffy clown","Miffy clown"),dialogue:'miffy',image:crop('assets/dressing-lena/IMG_5709.png',[852, 129, 238, 248],2048,3072),pieces:["head-miffy", "suit-miffy", "jewelry-miffy-ruff"],values:{"dresses": "suit-miffy", "hat": "head-miffy", "necklace": "jewelry-miffy-ruff"},rule:pair("Lire les six phrases de Miffy dans la chambre.","Read all six of Miffy's lines in the room.")},
    {id:"dj",name:pair("DJ Minilab","Minilab DJ"),feat:'minilab-composed',image:crop('assets/dressing-lena/IMG_5716.png',[775, 733, 405, 523],2048,3072),pieces:["head-star-headphones", "shoes-dj", "hosiery-dj", "top-dj", "jewelry-dj-bracelets", "skirt-dj"],values:{"headphones":"head-star-headphones", "tops": "top-dj", "skirts": "skirt-dj", "shoes": "shoes-dj", "hosiery": "hosiery-dj", "bracelets": "jewelry-dj-bracelets","clips":"head-stars"},makeup:["makeup-blush","makeup-lipstick"],rule:pair("Enregistrer une piste musicale dans le Minilab.","Record a musical track in the Minilab.")},
    {id:'clown', name:pair('Princesse Clown','Clown Princess'), visit:'livre/la-princesse-clown', image:crop('assets/dressing-lena/IMG_5381.png',[639,724,657,713],2048,3072), pieces:['top-clown','skirt-princess','jewelry-clown-ruff','makeup-clown-nose'], values:{tops:'top-clown',skirts:'skirt-princess',shoes:'shoes-bunny',necklace:'jewelry-clown-ruff'}, makeup:['makeup-clown-nose','makeup-blush'], rule:pair('Ouvrir le conte illustré.','Open the illustrated story.')},
    {id:'cafe', name:pair('Hibernation','Hibernation'), feat:'latte-made', image:crop('assets/dressing-lena/IMG_5724.png',[562,275,875,1359],2048,3072), pieces:['top-bear','hosiery-cafe'], values:{tops:'top-bear',hosiery:'hosiery-cafe',shoes:'shoes-bunny'}, rule:pair('Préparer ton premier latte.','Make your first latte.')},
    {id:'shining',name:pair('Les jumelles de Shining','The Shining twins'),feat:'secret-typewriter',image:crop('assets/dressing-lena/IMG_5726.png',[598,701,826,1407],2048,3072),pieces:['dress-shining','head-shining-flower','shoes-shining','hosiery-shining'],values:{dresses:'dress-shining',clips:'head-shining-flower',shoes:'shoes-shining',hosiery:'hosiery-shining'},rule:pair('Découvrir la machine à écrire de Shining.','Discover the Shining typewriter.')},
    {id:'atelier', name:pair('Atelier en bazar','A messy studio'), visit:'jeu/coloring', image:crop('assets/dressing-lena/IMG_5735.png',[673,740,609,1888],2048,3072), pieces:['suit-paint'], values:{tops:'top-white',overalls:'suit-paint',hat:'head-beret',shoes:'shoes-bambi'}, rule:pair('Découvrir le jeu de coloriage.','Discover the colouring book.')},
    {id:'photographer',name:pair('Souvenirs instantanés','Instant memories'),feat:'polaroids-all',image:crop('assets/dressing-lena/IMG_5739.png',[848,700,253,555],2048,3072),pieces:['accessory-camera'],values:{camera:'accessory-camera',tops:'top-plantasia',pants:'pants-barrel',shoes:'shoes-bambi'},rule:pair('Consulter tous les polaroïds.','View every Polaroid.')},
    {id:'flower',name:pair('Fleur de chambre','Room flower'),available:false,visit:'objet/plante-fleur',image:crop('assets/dressing-lena/IMG_5734.png',[717,724,581,812],2048,3072),pieces:['jacket-floral','dress-floral','bag-blue-floral'],values:{vest:'jacket-floral',dresses:'dress-floral',bags:'bag-blue-floral'},rule:pair('Cliquer sur le pot de fleurs (à venir).','Click the flower pot (coming soon).')},
    {id:'tresors', name:pair('Petits trésors','Little treasures'), feat:'beads-made', image:crop('assets/dressing-lena/IMG_5354.png',[857,720,192,68],2048,3072), pieces:['accessory-phone'], values:{phone:'accessory-phone',tops:'top-pink',skirts:'skirt-floral',necklace:'jewelry-beads',bags:'bag-brown',bagAccessories:'charm-treasures',shoes:'shoes-docs'}, rule:pair('Enfiler au moins trois perles.','Thread at least three beads.')}
  ];
  const roomRoutes = {
    'objet/miffy':'object:miffy', 'jeu/dressing':'mirror', 'jeu/latte':'object:latte', 'jeu/tamagotchi':'object:tamagotchi',
    'jeu/do-nothing':'object:rilakkuma', 'jeu/word-lab':'object:livres-3',
    'jeu/fortune-cookie':'fortune-cookie', 'livre/la-princesse-clown':'object:book',
    'objet/reading-room':'object:livres-1', 'objet/souvenues':'object:livres-2',
    'objet/marshall':'object:marshall', 'objet/music-visuals':'object:cds',
    'objet/phone':'object:iphone', 'objet/gabzilla':'object:gabzilla',
    'objet/gearnews-series':'object:ring-light', 'objet/imac':'object:imac',
    'photos':'object:instax', 'objet/lampe-fleur':'wall-lamp'
  };
  const allowedFeats = new Set(['polaroids-all','minilab-composed','latte-made','beads-made','rested','outfit-styled',...secrets.filter(x=>x.available!==false).map(x=>x.id),'secret-typewriter','secret-twist','secret-cookie',...['feed','sleep','draw','music','cuddle'].map(x=>'care-'+x)]);
  let persistent=true;
  function read(key) { let value;try {value=localStorage.getItem(key);}catch(_){persistent=false;return null;}try{return JSON.parse(value||'null');}catch(_){return null;} }
  function clean(value) {
    return {version:1, visits:Array.isArray(value?.visits)?value.visits.filter(x=>typeof x==='string'&&x.length<100).slice(0,200):[],
      feats:Array.isArray(value?.feats)?value.feats.filter(x=>allowedFeats.has(x)):[], title:typeof value?.title==='string'?value.title:null};
  }
  let state = clean(read(KEY));
  function cleanDialogue(value) {
    return Object.fromEntries(Object.entries(dialogueLengths).map(([id,total])=>[
      id, [...new Set((Array.isArray(value?.[id])?value[id]:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<total))]
    ]));
  }
  let dialogue = cleanDialogue(read(DIALOGUE_KEY));
  function mergeDialogue() {
    const saved=cleanDialogue(read(DIALOGUE_KEY));
    for(const id of Object.keys(dialogueLengths))dialogue[id]=[...new Set([...dialogue[id],...saved[id]])];
  }
  function dialogueProgress(id) {
    return {read:[...(dialogue[id]||[])],total:dialogueLengths[id]||0};
  }
  function hasReadDialogue(id) {
    return !!dialogueLengths[id] && dialogue[id].length===dialogueLengths[id];
  }
  function readDialogueLine(id,index) {
    if(suppressed()||!Object.hasOwn(dialogueLengths,id)||!Number.isInteger(index)||index<0||index>=dialogueLengths[id])return;
    mergeDialogue();
    if(dialogue[id].includes(index))return;
    dialogue[id].push(index);
    try {localStorage.setItem(DIALOGUE_KEY,JSON.stringify(dialogue));} catch (_) {persistent=false;window.NanaAnalytics?.record('error/storage',1,true);}
    emit();
  }
  function isCreator() { try { return sessionStorage.getItem('nana-admin-session-v1') === '1'; } catch (_) { return false; } }
  function suppressed() {
    const flags = new URLSearchParams(location.search);
    return isCreator() || ['previewReward','posterEdit','lampEdit','starsEdit','cookieEdit','ipadClockEdit','zones'].some(x=>flags.has(x));
  }
  function legacy() {
    const room=read(ROOM_KEY);
    return Array.isArray(room?.discovered)?room.discovered.filter(x=>typeof x==='string'&&x!=='flowers'):[];
  }
  function roomSnapshot() {
    const live=window.NanaDiscoveries?.snapshot();
    const saved=read(ROOM_KEY);
    return live || {discovered:legacy(), required:Array.isArray(saved?.required)?saved.required.filter(x=>typeof x==='string'&&x!=='flowers'):[], celebrated:saved?.celebrated===true};
  }
  function hasVisit(route) {
    return state.visits.includes(route) || !!(roomRoutes[route] && roomSnapshot().discovered.includes(roomRoutes[route]));
  }
  function hasFeat(id) { return state.feats.includes(id); }
  function unlockedOutfit(id, preview=false) {
    const outfit=outfits.find(x=>x.id===id);
    return !!outfit && outfit.available!==false && ((preview && isCreator()) || (id==='clown'&&read(CLOWN_KEY)===1) || (outfit.exploration?explorationRatio()>=outfit.exploration:outfit.dialogue?hasReadDialogue(outfit.dialogue):outfit.featsAny?outfit.featsAny.some(hasFeat):outfit.feat?hasFeat(outfit.feat):hasVisit(outfit.visit)));
  }
  function explorationRatio(){const r=roomSnapshot();return r.required.length?r.required.filter(x=>r.discovered.includes(x)).length/r.required.length:0;}
  function fullRoom() { const r=roomSnapshot();return r.required.length>0 && r.required.every(x=>r.discovered.includes(x)); }
  // Five exploration milestones, using exact regions of Léna's original sheet.
  // Keep the historical collection API so old notebook links continue to work.
  const earnedBadges=new Set();
  const stickers = [
    ['glance','Juste un coup d’œil','Just a look',0,[5,226,333,256]],
    ['five-minutes','Je reste cinq minutes','Just five minutes',25,[341,186,303,311]],
    ['at-home','Comme chez moi','Make myself at home',50,[643,195,354,312]],
    ['resident','J’habite ici','I live here',75,[96,499,348,321]],
    ['spare-key','Le double des clés','The spare key',100,[460,519,470,297]]
  ].map(([id,fr,en,percent,box])=>({id,name:pair(fr,en),percent,
    rule:percent?pair('Explorer '+percent+' % de la chambre.','Explore '+percent+'% of the room.'):pair('Découvrir un premier objet.','Discover your first object.'),
    image:crop('assets/IMG_5764.png',box,1000,1000),earned:()=>earnedBadges.has(id)}));
  function collectBadges() {
    const saved=read(BADGES_KEY);
    if(Array.isArray(saved))for(const id of saved)if(stickers.some(b=>b.id===id))earnedBadges.add(id);
    if(suppressed())return;
    const room=roomSnapshot(),required=new Set(room.required),discovered=new Set(room.discovered);
    const count=required.size?[...discovered].filter(id=>required.has(id)).length:discovered.size;
    let changed=false;
    for(const badge of stickers){
      const eligible=room.celebrated || (badge.percent===0?count>0:required.size>0&&count*100>=required.size*badge.percent);
      if(eligible&&!earnedBadges.has(badge.id)){earnedBadges.add(badge.id);changed=true;}
    }
    if(changed)try{localStorage.setItem(BADGES_KEY,JSON.stringify([...earnedBadges]));}catch(_){persistent=false;}
  }
  const titles = [
    {id:'curious',name:pair('Petite âme curieuse','Curious soul'),rule:pair('Découvrir un premier objet.','Discover your first object.'),earned:()=>roomSnapshot().discovered.length>0},
    {id:'sofa',name:pair('Créature de canapé','Sofa creature'),rule:pair('Terminer une pause au club du rien.','Finish a break at the Do Nothing Club.'),earned:()=>hasFeat('rested')},
    {id:'detective',name:pair('Détective de salon','Living-room detective'),rule:pair('Trouver deux secrets.','Find two secrets.'),earned:()=>secrets.filter(x=>hasFeat(x.id)).length>=2},
    {id:'artist',name:pair('Artiste en bazar','Artist in a creative mess'),rule:pair('Découvrir le coloriage et composer un bijou.','Discover colouring and make a charm.'),earned:()=>hasVisit('jeu/coloring')&&hasFeat('beads-made')},
    {id:'care',name:pair('Douceur envers soi','Kind to myself'),rule:pair('Essayer trois gestes différents dans le Tamagotchi.','Try three different self-care actions in the Tamagotchi.'),earned:()=>state.feats.filter(x=>x.startsWith('care-')).length>=3},
    {id:'quests',name:pair('Spécialiste des quêtes secondaires','Side-quest specialist'),rule:pair('Découvrir cinq jeux.','Discover five games.'),earned:()=>games.filter(x=>hasVisit(x.route)).length>=5},
    {id:'resident',name:pair('Locataire honoraire','Honorary resident'),rule:pair('Explorer toute la chambre.','Explore the entire room.'),earned:fullRoom}
  ];
  function earnedIDs() {
    collectBadges();
    return [...stickers.filter(x=>x.earned()).map(x=>'sticker:'+x.id),...titles.filter(x=>x.earned()).map(x=>'title:'+x.id),...outfits.filter(x=>unlockedOutfit(x.id)).map(x=>'outfit:'+x.id),...(fullRoom()?['gift:merci10']:[])];
  }
  let known = new Set(earnedIDs());
  function emit(silent=false,measure=true) {
    const next=earnedIDs(), added=next.filter(x=>!known.has(x));known=new Set(next);
    if(measure&&!silent&&!suppressed())for(const id of added){const [kind,key]=id.split(':');if(kind==='sticker'||kind==='outfit')window.NanaAnalytics?.record('reward/'+kind+'/'+key);}
    for (const listener of listeners) listener({added:silent?[]:added});
  }
  function save() {
    // Merge monotonic discoveries in case another tab progressed since our last action.
    const saved=clean(read(KEY));
    state.visits=[...new Set([...saved.visits,...state.visits])];
    state.feats=[...new Set([...saved.feats,...state.feats])];
    try {localStorage.setItem(KEY,JSON.stringify(state));} catch (_) {persistent=false;window.NanaAnalytics?.record('error/storage',1,true);}
    emit();
  }
  function visit(raw) {
    if (suppressed() || typeof raw!=='string') return;
    let route=raw.replace(/\/page\/\d+$/, '').replace(/^(jeu\/dressing)\/tenue\/[a-z-]+$/, '$1');
    if (route.startsWith('objet/phone/')) route='objet/phone';
    const scene=window.NANA_ROOM_ZONES?.find(x=>'objet/'+x.id===route);
    const knownRoute=route==='night'||games.some(x=>x.route===route)||Object.hasOwn(roomRoutes,route)||scene;
    if (!knownRoute) return;
    const roomId=roomRoutes[route] || (scene?'object:'+scene.id:null);
    if(roomId) window.NanaDiscoveries?.remember(roomId);
    if(state.visits.includes(route))return;
    state.visits.push(route);save();
  }
  function feat(id) {
    if(suppressed()||!allowedFeats.has(id))return;
    if(id==='rested')window.NanaAnalytics?.complete('do-nothing');
    if(hasFeat(id))return;state.feats.push(id);save();
  }
  const POLAROID_KEY='nana-polaroids-viewed-v1';
  let viewedPolaroids=new Set();
  function readPolaroid(id,required){
    if(suppressed()||!Array.isArray(required)||!required.length||!required.includes(id))return;
    const stored=read(POLAROID_KEY);
    if(Array.isArray(stored))for(const value of stored)if(typeof value==='string')viewedPolaroids.add(value);
    viewedPolaroids.add(id);
    try{localStorage.setItem(POLAROID_KEY,JSON.stringify([...viewedPolaroids]));}catch(_){}
    if(required.every(value=>viewedPolaroids.has(value)))feat('polaroids-all');
  }
  function selectTitle(id) { if(id!==null&&!titles.some(x=>x.id===id&&x.earned()))return;state.title=id;save(); }
  window.NanaProgress = {
    games,secrets,outfits,stickers,titles,roomRoutes,KEY,ROOM_KEY,CLOWN_KEY,BADGES_KEY,
    readPolaroid,visit,feat,hasVisit,hasFeat,unlockedOutfit,fullRoom,isCreator,suppressed,selectTitle,
    dialogueProgress,readDialogueLine,hasReadDialogue,DIALOGUE_KEY,
    snapshot:()=>({visits:[...state.visits],feats:[...state.feats],title:state.title,persistent,room:roomSnapshot()}),
    refresh:(silent=false)=>emit(silent),
    subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}
  };
  window.addEventListener('storage',event=>{
    if(event.key===KEY){const incoming=clean(read(KEY));state={...incoming,visits:[...new Set([...state.visits,...incoming.visits])],feats:[...new Set([...state.feats,...incoming.feats])]};emit(false,false);}
    else if(event.key===DIALOGUE_KEY){mergeDialogue();emit(false,false);}
    else if(event.key===ROOM_KEY||event.key===CLOWN_KEY||event.key===BADGES_KEY)emit(false,false);
  });
})();






