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
    ['severance', 'Lumon · Severance', 'Lumon · Severance', 'lettre_A'],
    ['mimilab', 'Mimilab', 'Mimilab', 'notes_musique']
  ].map(([id, fr, en, image]) => ({id, name:pair(fr,en), route:'jeu/'+id, image:art(image)}));
  const secrets = [
    {id:'secret-rug', name:pair('Une colocataire sous le tapis','A roommate under the rug'), image:art('araignee_jour'), route:'objet/tapis'},
    {id:'secret-memory-box', name:pair('La boîte à souvenirs','The memory box'), image:art('fleur'), route:'secret/boite-a-souvenirs'},
    {id:'secret-childhood-drawing', name:pair('Un dessin d’enfance','A childhood drawing'), image:art('crayon_pinceau'), route:null, available:false}
  ];
  // Bonus looks use Léna's drawings; exclusive pieces unlock with their matching activity.
  const outfits = [
    {id:'gabzilla',name:pair('T-shirt Gabzilla','Gabzilla T-shirt'),visit:'objet/gabzilla',pieces:['top-gabzilla'],values:{tops:'top-gabzilla'},image:crop('assets/dressing-lena/IMG_5450.png',[536,712,865,850],2048,3072),rule:pair('Découvrir le t-shirt sur la chaise.','Discover the T-shirt on the chair.')},
    // Artwork pending: the existing discovery also credits visitors who already found the box.
    {id:'amelie-poulain',image:crop('assets/IMG_7247.png',[692,745,630,1281],2048,3072),name:pair('Amélie Poulain','Amélie Poulain'),feat:'secret-memory-box',pieces:["shoes-amelie", "dress-amelie", "jacket-amelie", "held-amelie-umbrella"],values:{shoes:'shoes-amelie',dresses:'dress-amelie',cardigan:'jacket-amelie',handObject:'held-amelie-umbrella'},rule:pair('Découvrir la boîte à souvenirs cachée derrière le carreau du mur.','Discover the memory box hidden behind the wall tile.')},
    {id:'severance',name:pair('Helly R. — Severance','Helly R. — Severance'),feat:'severance-refined',image:crop('assets/dressing-lena/IMG_7108.png',[927,1239,95,205],2048,3072),pieces:['hosiery-helly','shoes-helly','top-helly','skirt-helly','jewelry-helly-badge'],values:{hosiery:'hosiery-helly',shoes:'shoes-helly',tops:'top-helly',skirts:'skirt-helly',necklace:'jewelry-helly-badge'},rule:pair('Terminer les quatre catégories de Macrodata Refinement en mode Work.','Complete the four Macrodata Refinement categories in Work mode.')},
    {id:'mononoke',name:pair('San — Princesse Mononoké','San — Princess Mononoke'),feat:'mononoke-kodama',image:crop('assets/dressing-lena/IMG_7088.png',[860,244,332,263],2048,3072),pieces:["cape-mononoke", "dress-mononoke", "top-mononoke-tabard", "shoes-mononoke", "held-mononoke-knife", "makeup-mononoke", "head-mononoke-band", "jewelry-mononoke-earrings", "jewelry-mononoke-ashitaka", "jewelry-mononoke-teeth", "jewelry-mononoke-armbands", "head-mononoke-mask"],values:{"cape": "cape-mononoke", "dresses": "dress-mononoke", "vest": "top-mononoke-tabard", "shoes": "shoes-mononoke", "handObject": "held-mononoke-knife", "clips": "head-mononoke-band", "earrings": "jewelry-mononoke-earrings", "pendant": "jewelry-mononoke-ashitaka", "necklace": "jewelry-mononoke-teeth", "bracelets": "jewelry-mononoke-armbands", "hat": "head-mononoke-mask"},makeup:['makeup-mononoke'],rule:pair('Trouver et toucher les cinq Kodama dans la chambre.','Find and touch all five Kodama in the bedroom.')},
    {id:'sakura-main',name:pair('Cardcaptor Sakura — Tenue principale','Cardcaptor Sakura — Main outfit'),feat:'kero-awake',image:crop('assets/dressing-lena/IMG_7054.png',[379,698,1241,1115],2048,3072),pieces:["dress-sakura-main", "jewelry-sakura-bow", "hosiery-sakura-main", "shoes-sakura-main", "accessory-sakura-gloves", "accessory-sakura-wings", "held-sakura-scepter", "head-sakura-main"],values:{"dresses": "dress-sakura-main", "necklace": "jewelry-sakura-bow", "socks": "hosiery-sakura-main", "shoes": "shoes-sakura-main", "gloves": "accessory-sakura-gloves", "wings": "accessory-sakura-wings", "handObject": "held-sakura-scepter", "hat": "head-sakura-main"},rule:pair('Cliquer sur Kéro posé sur l’étagère au-dessus de l’iMac.','Click Kero on the shelf above the iMac.')},
    {id:'little-miss-sunshine',name:pair('Olive Hoover — Little Miss Sunshine','Olive Hoover — Little Miss Sunshine'),feat:'olive-van-started',image:crop('assets/dressing-lena/IMG_7043.png',[653,727,649,830],2048,3072),pieces:["shoes-olive", "pants-olive-shorts", "top-olive", "jewelry-olive-wristbands", "head-olive-glasses"],values:{"tops": "top-olive", "pants": "pants-olive-shorts", "shoes": "shoes-olive", "bracelets": "jewelry-olive-wristbands", "glasses": "head-olive-glasses"},rule:pair('Cliquer sur le van Volkswagen miniature de la chambre.','Click the miniature Volkswagen van in the room.')},
    {id:'gokinjo',name:pair('Mikako — Gokinjo','Mikako — Gokinjo'),feat:'gokinjo-happy-berry',image:crop('assets/dressing-lena/IMG_7031.png',[725,738,512,979],2048,3072),pieces:["hosiery-gokinjo", "shoes-gokinjo", "top-gokinjo", "dress-gokinjo", "accessory-gokinjo-gloves", "head-gokinjo-bobbles"],values:{"tops": "top-gokinjo", "dresses": "dress-gokinjo", "hosiery": "hosiery-gokinjo", "shoes": "shoes-gokinjo", "gloves": "accessory-gokinjo-gloves", "clips": "head-gokinjo-bobbles"},rule:pair('Cliquer sur le coussin Happy Berry du lit.','Click the Happy Berry cushion on the bed.')},
    {id:'sakura-pyjama',name:pair('Cardcaptor Sakura — Pyjama','Cardcaptor Sakura — Pyjamas'),feat:'kero-awake',image:crop('assets/dressing-lena/IMG_7004.png',[627,675,713,889],2048,3072),pieces:['top-sakura-pyjama','pants-sakura-pyjama'],values:{tops:'top-sakura-pyjama',pants:'pants-sakura-pyjama'},rule:pair('Cliquer sur Kéro posé sur l’étagère au-dessus de l’iMac.','Click Kero on the shelf above the iMac.')},
    {id:'paprika',name:pair('Paprika','Paprika'),feat:'paprika-butterfly',image:crop('assets/dressing-lena/IMG_7020.png',[657,750,628,697],2048,3072),pieces:["pants-paprika", "jewelry-paprika-belt", "top-paprika", "shoes-paprika"],values:{"tops": "top-paprika", "pants": "pants-paprika", "belt": "jewelry-paprika-belt", "shoes": "shoes-paprika"},rule:pair('Cliquer sur le papillon qui se promène dans la chambre.','Click the butterfly flying around the room.')},
    // BLAST unlocks Hachi and Nana Osaki; retain the old toast discovery for existing Hachi owners.
    {id:'preacher',name:pair('Dieu — Preacher','God — Preacher'),feat:'preacher-dog',image:crop('assets/dressing-lena/IMG_7241.png',[767,334,411,483],2048,3072),pieces:["suit-preacher", "head-preacher-dog", "shoes-preacher", "jewelry-preacher-leash", "head-preacher-goggles", "accessory-preacher-gloves"],values:{"dresses": "suit-preacher", "hat": "head-preacher-dog", "shoes": "shoes-preacher", "necklace": "jewelry-preacher-leash", "glasses": "head-preacher-goggles", "gloves": "accessory-preacher-gloves"},rule:pair('Cliquer sur le petit chien de la chambre.','Click the small dog in the bedroom.')},
    {id:'nana-osaki',name:pair('Nana Osaki — Nana','Nana Osaki — Nana'),feat:'nana-blast',image:crop('assets/dressing-lena/IMG_7234.png',[665,708,644,847],2048,3072),pieces:["top-nana-bustier", "hosiery-nana-fishnet", "shoes-nana-platforms", "skirt-nana-tartan", "jewelry-nana-belt", "jacket-nana-heart", "jewelry-nana-choker", "bag-nana-guitar"],values:{"tops": "top-nana-bustier", "hosiery": "hosiery-nana-fishnet", "shoes": "shoes-nana-platforms", "skirts": "skirt-nana-tartan", "belt": "jewelry-nana-belt", "jackets": "jacket-nana-heart", "necklace": "jewelry-nana-choker", "bags": "bag-nana-guitar"},rule:pair('Cliquer sur le billet BLAST au mur.','Click the BLAST ticket on the wall.')},
    {id:'hachi',name:pair('Hachi — Nana','Hachi — Nana'),featsAny:['nana-blast','nana-toast'],image:crop('assets/dressing-lena/IMG_6989.png',[670,743,596,627],2048,3072),pieces:["hosiery-hachi-stripes", "shoes-hachi-pompoms", "hosiery-hachi-legwarmers", "skirt-hachi", "held-hachi-vivienne", "top-hachi-turtleneck", "top-hachi-seven", "jewelry-hachi-belt", "scarf-hachi"],values:{"sheer": "top-hachi-turtleneck", "tops": "top-hachi-seven", "skirts": "skirt-hachi", "socks": "hosiery-hachi-stripes", "legwarmers": "hosiery-hachi-legwarmers", "shoes": "shoes-hachi-pompoms", "handObject": "held-hachi-vivienne", "belt": "jewelry-hachi-belt", "scarves": "scarf-hachi"},rule:pair('Cliquer sur le billet BLAST au mur.','Click the BLAST ticket on the wall.')},
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
    {id:'yukata',name:pair('Yukata rose à libellules','Pink dragonfly yukata'),feat:'kokeshi-yukata',image:crop('assets/dressing-lena/IMG_5638.png',[516,680,923,1969],2048,3072),pieces:['jacket-yukata'],values:{wrap:'jacket-yukata'},rule:pair('Cliquer sur la kokeshi sur la nouvelle étagère.','Click the kokeshi on the new shelf.')},
    {id:'plantasia',name:pair('T-shirt Plantasia','Plantasia T-shirt'),visit:'objet/plante-fleur',image:crop('assets/dressing-lena/IMG_5593.png',[544,720,849,834],2048,3072),pieces:['top-plantasia'],values:{tops:'top-plantasia'},rule:pair('Toucher la plante suspendue dans la chambre.','Touch the hanging plant in the bedroom.')},
    {id:'flower',available:false,name:pair('Fleur de chambre','Room flower'),visit:'objet/plante-fleur',image:crop('assets/dressing-lena/IMG_5734.png',[717,724,581,812],2048,3072),pieces:['jacket-floral','dress-floral','bag-blue-floral'],values:{vest:'jacket-floral',dresses:'dress-floral',bags:'bag-blue-floral'},rule:pair('Toucher la plante suspendue dans la chambre.','Touch the hanging plant in the bedroom.')},
    {id:'tresors', name:pair('Petits trésors','Little treasures'), feat:'beads-made', image:crop('assets/dressing-lena/IMG_5354.png',[857,720,192,68],2048,3072), pieces:['accessory-phone'], values:{phone:'accessory-phone',tops:'top-pink',skirts:'skirt-floral',necklace:'jewelry-beads',bags:'bag-brown',bagAccessories:'charm-treasures',shoes:'shoes-docs'}, rule:pair('Enfiler au moins trois perles.','Thread at least three beads.')}
  ];
  const roomRoutes = {
    'objet/kokeshi':'kokeshi',
    'objet/plante-fleur':'object:plante-fleur',
    'objet/miffy':'object:miffy', 'jeu/dressing':'mirror', 'jeu/latte':'object:latte', 'jeu/tamagotchi':'object:tamagotchi',
    'jeu/do-nothing':'object:rilakkuma', 'jeu/word-lab':'object:livres-3',
    'jeu/fortune-cookie':'fortune-cookie', 'livre/la-princesse-clown':'object:book',
    'objet/reading-room':'object:livres-1', 'objet/souvenues':'object:livres-2',
    'objet/marshall':'object:marshall', 'objet/music-visuals':'object:cds',
    'objet/phone':'object:iphone', 'objet/gabzilla':'object:gabzilla',
    'objet/gearnews-series':'object:ring-light', 'objet/imac':'object:imac',
    'objet/clochette-kikujiro':'kikujiro-chime', 'objet/papillon-paprika':'paprika-butterfly', 'photos':'object:instax', 'objet/lampe-fleur':'wall-lamp'
  };
  // Future Kikujiro outfit pieces use feat:'kikujiro-chime'; discovery is saved before their release.
  const allowedFeats = new Set(['kokeshi-yukata','ufo-encounter','kodama-1','kodama-2','kodama-3','kodama-4','kodama-5','preacher-dog','kikujiro-chime','nana-blast','severance-refined','mononoke-kodama','olive-van-started','gokinjo-happy-berry','kero-awake','paprika-butterfly','nana-toast','polaroids-all','minilab-composed','latte-made','beads-made','rested','outfit-styled',...secrets.filter(x=>x.available!==false).map(x=>x.id),'secret-typewriter','secret-twist','secret-cookie',...['feed','sleep','draw','music','cuddle'].map(x=>'care-'+x)]);
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
    if(hasFeat(id))return;state.feats.push(id);
    if([1,2,3,4,5].every(n=>hasFeat('kodama-'+n))&&!hasFeat('mononoke-kodama'))state.feats.push('mononoke-kodama');
    save();
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
    if(event.key===KEY){const incoming=clean(read(KEY));state={...incoming,visits:[...new Set([...state.visits,...incoming.visits])],feats:[...new Set([...state.feats,...incoming.feats])]};if(!suppressed()&&[1,2,3,4,5].every(n=>hasFeat('kodama-'+n))&&!hasFeat('mononoke-kodama')){state.feats.push('mononoke-kodama');save();}else emit(false,false);}
    else if(event.key===DIALOGUE_KEY){mergeDialogue();emit(false,false);}
    else if(event.key===ROOM_KEY||event.key===CLOWN_KEY||event.key===BADGES_KEY)emit(false,false);
  });
})();











