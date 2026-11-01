/* English/French presentation layer for the entire interactive portfolio.
   Original English strings are retained so switching never stacks translations. */
(()=>{
const translations={
'Choose your mood':'Choisis ton univers','Browse selected projects':'Découvrir mes projets','Explore my world':'Explorer mon univers','Made with care':'Fait avec amour',
'Work':'Travail','Play':'Jouer','Work Mode':'Mode travail','Play Mode':'Mode jeu','Switch Mode':'Changer de mode','About Me':'À propos','Help':'Aide','Contact':'Contact',
'Night':'Nuit','Day':'Jour','Portfolio':'Portfolio','Léna’s creative world ♡':'L’univers créatif de Léna ♡',
'Illustration · Animation · Music & Visuals · Writing · Mini Games':'Illustration · Animation · Musique & visuels · Écriture · Mini-jeux',
'Illustration · Animation · Writing':'Illustration · Animation · Écriture',
'Search my work':'Rechercher dans mes créations','Search projects, illustrations, animations…':'Chercher des projets, illustrations, animations…',
'Search my portfolio':'Rechercher dans mon portfolio','Search artworks, projects, games…':'Rechercher des dessins, projets, jeux…',
'Selected Work':'Projets choisis','Illustration':'Illustration','Animation':'Animation','Music & Visuals':'Musique & visuels','Writing & Editorial':'Écriture & articles',
'Mini Games':'Mini-jeux','About':'À propos','← Back to my room':'← Retour dans ma chambre',
'Currently working on…':'En ce moment…','Scrapped Ideas':'Idées abandonnées','Latest additions':'Derniers ajouts','Get Info':'Informations',
'A place for work in progress. New updates coming soon.':'Un espace pour mes projets en cours. À suivre bientôt.',
'Sketches, unfinished experiments and ideas to revisit.':'Croquis, essais inachevés et idées à reprendre.',
'This archive is waiting for its first entries.':'Cette archive attend ses premiers éléments.',
'Selected creations currently available in the portfolio.':'Une sélection de créations déjà présentes dans le portfolio.',
'Select a project to see its category and related work.':'Choisis un projet pour voir sa catégorie et ses créations associées.',
'No matching projects yet.':'Aucun projet correspondant pour le moment.','No matching results.':'Aucun résultat.','No matching work yet.':'Aucune création trouvée.',
'Original illustrations':'Illustrations originales','Drawings, visual storytelling & collaborations':'Dessins, récits visuels et collaborations',
'Illustrated stories, artworks and visual collaborations.':'Histoires illustrées, dessins et collaborations visuelles.',
'Explore the gallery':'Explorer la galerie','Illustrated book · 66 pages':'Livre illustré · 66 pages',
'Interactive illustrated book · 66 pages':'Livre illustré interactif · 66 pages',
'Turn the pages of the illustrated book':'Feuilleter le livre illustré',
'Articles, music & culture':'Articles, musique et culture','Creative communication & community management':'Communication créative et gestion de communautés',
'Animation & moving images':'Animation et images en mouvement','Motion':'Animation','Editorial':'Éditorial','Social Media':'Réseaux sociaux',
'Interactive':'Interactif','Illustrated stories and playful web experiments':'Histoires illustrées et expériences web ludiques',
'See all four playable games':'Découvrir les quatre mini-jeux',
'My Polaroids':'Mes Polaroïds','Move, turn and explore my instant photographs':'Déplacer, retourner et découvrir mes photos instantanées',
'Coloring Book':'Coloriage','Dress-up':'Habillage','Latte Lab':'Atelier latte','Get in touch ♡':'Me contacter ♡',
'Let’s work together':'Travaillons ensemble','Let\'s work together':'Travaillons ensemble',
'Write an email':'Écrire un e-mail','Email':'E-mail','Name':'Nom','Category':'Catégorie','Year':'Année','Role':'Rôle','Tools':'Outils',
'Close':'Fermer','Open':'Ouvrir','Open project':'Ouvrir le projet','More from this project':'Du même projet',
'Projects':'Projets','Pages':'Écriture','Music':'Musique','Gallery':'Galerie','Photos':'Photos',
'Back':'Retour','Next':'Suivant','Previous':'Précédent','Start':'Commencer','Restart':'Recommencer',
'Continue':'Continuer','Save':'Enregistrer','Cancel':'Annuler','Done':'Terminé','Loading…':'Chargement…',
'Coming soon':'Bientôt','Read more':'Lire la suite','View project':'Voir le projet','All':'Tout',
'Search':'Rechercher','Search portfolio':'Rechercher dans le portfolio','Switch between Work and Play modes':'Passer du mode travail au mode jeu',
'Enter Work Mode':'Entrer en mode travail','Enter Play Mode':'Entrer en mode jeu',
'Return to mode selection':'Retour au choix du mode','Toggle night mode':'Activer ou désactiver le mode nuit',
'Enable night mode':'Activer le mode nuit','Enable day mode':'Activer le mode jour',
'Illustration · Motion · Social Media · Editorial · Mini Games':'Illustration · Animation · Réseaux sociaux · Éditorial · Mini-jeux',
'Made with love':'Fait avec amour','Let’s talk':'Discutons','LET\'S TALK':'DISCUTONS',
'Original illustration with swans and lotus flowers':'Illustration originale avec cygnes et fleurs de lotus'
};
Object.assign(translations,{"Search the archive":"Rechercher dans les archives","Search articles":"Rechercher des articles","All artists":"Tous les artistes","Selected visuals":"Visuels sélectionnés","Favorites":"Favoris","Covers":"Pochettes","Music visuals":"Visuels musicaux","Visual gallery":"Galerie visuelle","Search artists & artworks":"Rechercher des artistes et des œuvres","Social media & community":"Réseaux sociaux et communautés","Little worlds to explore":"De petits mondes à explorer","Explore the room":"Explorer la chambre","Sending…":"Envoi en cours…","✓ Message sent!":"✓ Message envoyé !","Originally written in French.":"Rédigé à l’origine en français.","Article rédigé à l’origine en français.":"Article rédigé à l’origine en français.","WORDS, IDEAS & CULTURE":"MOTS, IDÉES & CULTURE","WRITING ARCHIVE":"ARCHIVES ÉDITORIALES","CURATED EDITORIAL ARCHIVE":"SÉLECTION D’ARTICLES","ISSUE 001 — SELECTED WRITING":"NUMÉRO 001 — ARTICLES CHOISIS","MADE OF WORDS":"FAIT DE MOTS","Original publications open in a new tab. La Ppite uses preserved web archives.":"Les publications originales s’ouvrent dans un nouvel onglet. Les articles de La Ppite utilisent des archives web.","A selection of published writing, from music and philosophy to Japanese society and pop culture.":"Une sélection d’articles publiés, de la musique et de la philosophie à la société japonaise et à la pop culture.","Collected ":"Recueil de ","Pages.":"Pages.","All":"Tout","READ ↗":"LIRE ↗","ARCHIVE ↗":"ARCHIVE ↗","Read article":"Lire l’article","Music, ideas & creative practice":"Musique, idées et pratique créative","Japanese culture, society & history":"Culture, société et histoire japonaises","Rap, interviews & music criticism":"Rap, entretiens et critiques musicales","Rap, music & pop culture":"Rap, musique et pop culture"});
Object.assign(translations,{"CONTACT / LET'S TALK":"CONTACT / DISCUTONS","You can contact me directly, or use the Mail application to write a message without leaving this website.":"Tu peux me contacter directement ou utiliser l’application Mail pour m’écrire sans quitter ce site.","Hello, I’m Léna":"Bonjour, moi c’est Léna","Hello, I'm Léna":"Bonjour, moi c’est Léna","I'm a freelance illustrator, social media manager and writer. I move between visual storytelling, music, moving images and editorial projects.":"Je suis illustratrice, social media manager et rédactrice indépendante. Je navigue entre récits visuels, musique, animation et projets éditoriaux.","SKILLS":"COMPÉTENCES","TOOLS":"OUTILS","Illustration · Animation · Content creation · Writing":"Illustration · Animation · Création de contenu · Écriture","Procreate · Procreate Dreams · Video editing":"Procreate · Procreate Dreams · Montage vidéo","Get in touch ♥":"Me contacter ♥","Get in touch ❤️":"Me contacter ❤️","PROFILE / ABOUT ME":"PROFIL / À PROPOS","PORTFOLIO / HELP":"PORTFOLIO / AIDE","How to explore":"Comment explorer","Play Mode: tap the objects in the illustrated bedroom. Posters open original artwork, the iPhone opens Contacts and Mail, the Tamagotchi is a mini-game, and the pink mug opens the Latte Lab.":"Mode jeu : touche les objets de la chambre illustrée. Les affiches ouvrent mes dessins, l’iPhone donne accès aux contacts et aux e-mails, le Tamagotchi est un mini-jeu et le mug rose ouvre l’atelier latte.","Work Mode: browse projects, illustrations, writing and motion through the desktop folders.":"Mode travail : découvre mes projets, illustrations, articles et animations dans les dossiers du bureau.","Click the iMac in Play Mode to enter Work Mode. Use Switch Mode in the menu bar to move between them at any time.":"Clique sur l’iMac en mode jeu pour accéder au mode travail. Tu peux passer de l’un à l’autre à tout moment depuis la barre de menu.","CONTACTS":"CONTACTS","HELP":"AIDE","LÉNA ♥ ABOUT":"LÉNA ♥ À PROPOS","MOTION — REELS":"ANIMATION — REELS","All videos":"Toutes les vidéos","2D Animation · Moving image":"Animation 2D · Image en mouvement","Write an email":"Écrire un e-mail","Let's talk":"Discutons","ABOUT ME":"À PROPOS","CONTACT / LET’S TALK":"CONTACT / DISCUTONS","Motion — Reels":"Animation — Reels"});
Object.assign(translations,{"New message":"Nouveau message","MAIL — NEW MESSAGE":"MAIL — NOUVEAU MESSAGE","Send a message directly from the portfolio using a secure Formspree form.":"Envoie-moi un message directement depuis le portfolio grâce à un formulaire sécurisé.","Your name":"Ton nom","Your email":"Ton e-mail","Subject":"Objet","Message":"Message","Write your message here...":"Écris ton message ici…","Send message ↗":"Envoyer le message ↗","Hello!":"Bonjour !","TO / LENA.DEFIRMAS@GMAIL.COM":"À / LENA.DEFIRMAS@GMAIL.COM","Back":"Retour","‹ Back":"‹ Retour","↑ Send":"↑ Envoyer","New Message":"Nouveau message","From:":"De :","Name:":"Nom :","To:":"À :","Subject:":"Objet :","Your message...":"Ton message…","your@email.com":"ton@email.com","Mobile":"Téléphone","Mail":"E-mail","✉️ Write an email":"✉️ Écrire un e-mail","Write an email":"Écrire un e-mail","PORTFOLIO / HELP":"PORTFOLIO / AIDE","Play Mode: tap the objects in the illustrated bedroom. Posters open original artwork, the iPhone opens Contacts and Mail, the Tamagotchi is a mini-game, and the pink mug opens the Latte Lab.":"Mode jeu : touche les objets de la chambre illustrée. Les affiches ouvrent mes dessins, l’iPhone donne accès aux contacts et aux e-mails, le Tamagotchi est un mini-jeu et le mug rose ouvre l’atelier latte.","Work Mode: browse projects, illustrations, writing and motion through the desktop folders.":"Mode travail : explore les projets, illustrations, articles et animations dans les dossiers du bureau.","Click the iMac in Play Mode to enter Work Mode. Use Changer de mode in the menu bar to move between them at any time.":"Clique sur l’iMac en mode jeu pour passer en mode travail. Utilise « Changer de mode » dans la barre supérieure pour basculer à tout moment.","Choose a category to explore my illustrated, moving and written worlds.":"Choisis une catégorie pour découvrir mes univers illustrés, animés et écrits.","Swipe through original animations":"Fais défiler mes animations originales","5 artists · 14 original artworks":"5 artistes · 14 créations originales","Four little games to explore, color and play with. Click a card to start ♥":"Quatre petits jeux pour explorer, colorier et s’amuser. Touche une carte pour commencer ♥","Color five of my drawings using the paint bucket and freehand brush.":"Colorie cinq de mes dessins avec le pot de peinture et le pinceau.","Take care of a tiny digital companion in my little room.":"Prends soin d’un petit compagnon virtuel dans ma chambre.","Make your own tiny coffee and finish it with a foam heart.":"Prépare ton petit café et décore sa mousse.","Explore my illustrated wardrobe and dress the character.":"Explore ma garde-robe illustrée et habille le personnage.","♥ Illustrated and coded with care ♥":"♥ Illustré et codé avec amour ♥","Dress-up Game":"Jeu d’habillage","MINI GAMES":"MINI-JEUX","WORK MODE / MINI GAMES":"MODE TRAVAIL / MINI-JEUX","PAGES — EDITORIAL LIBRARY":"PAGES — BIBLIOTHÈQUE ÉDITORIALE","Collected Pages.":"Pages choisies.","the written word":"les mots écrits","Music & Visual Design":"Musique et création visuelle","Original drawings by Léna":"Dessins originaux de Léna"});
Object.assign(translations,{"Pull 2 shots ♥":"Préparer deux expressos ♥","your cup is waiting ♥":"ta tasse t’attend ♥","double espresso ♥":"double expresso ♥","vanilla espresso ♥":"expresso vanille ♥","silky oat milk ♥":"lait d’avoine onctueux ♥","latte base ready ♥":"base du latte prête ♥","36–40 ml of warm espresso.":"36 à 40 ml d’expresso chaud.","Lovely! Let’s add a hint of vanilla next.":"Parfait ! Ajoutons maintenant une touche de vanille.","Add vanilla syrup ♥":"Ajouter le sirop de vanille ♥","Add 15 ml vanilla syrup ♥":"Ajouter 15 ml de sirop de vanille ♥","Vanilla added! Time for the silky milk.":"Vanille ajoutée ! Passons au lait onctueux.","Oat milk ♥":"Lait d’avoine ♥","Whole milk ♥":"Lait entier ♥","Faire mousser · 0/3":"Faire mousser · 0/3","Make latte art ♥":"Créer un latte art ♥","Optional foam heart ♥":"Cœur en mousse (facultatif) ♥","My dreamy latte":"Mon latte de rêve","Serve my custom latte ♥":"Servir mon latte personnalisé ♥","The foam is your canvas! Draw anything you like.":"La mousse est ta toile ! Dessine ce qui te plaît.","Perfect microfoam! Slide to pour 160 ml.":"Mousse parfaite ! Fais glisser le curseur pour verser 160 ml.","15 ml vanilla syrup stirred into your espresso.":"15 ml de sirop de vanille mélangés à ton expresso.","BARISTA TIP ♥":"CONSEIL DU BARISTA ♥","RECIPE NOTE ♥":"NOTE DE RECETTE ♥","Keep the tip just below the surface for a smooth, glossy foam.":"Garde la buse juste sous la surface pour une mousse lisse et brillante.","Pour slowly, then bring the pitcher closer to the surface.":"Verse lentement, puis rapproche le pichet de la surface.","Vanilla goes in before the milk so it blends right into your latte.":"Ajoute la vanille avant le lait pour bien la mélanger au latte.","36–40 ml espresso + 15 ml vanilla syrup + approximately 160 ml silky steamed milk.":"36 à 40 ml d’expresso + 15 ml de sirop de vanille + environ 160 ml de lait chaud et mousseux.","NANA'S LITTLE CAFÉ ♥":"LE PETIT CAFÉ DE NANA ♥","Add vanilla syrup":"Ajouter le sirop de vanille","Oat milk":"Lait d’avoine","Whole milk":"Lait entier","Pull 2 shots":"Préparer deux expressos","Make latte art":"Créer un latte art","Serve my custom latte":"Servir mon latte personnalisé","Optional foam heart":"Cœur en mousse (facultatif)","your cup is waiting":"ta tasse t’attend","double espresso":"double expresso","vanilla espresso":"expresso vanille","silky oat milk":"lait d’avoine onctueux","latte base ready":"base du latte prête","Your message…":"Ton message…","✉ Write an email":"✉ Écrire un e-mail","Write an email":"Écrire un e-mail","Send message":"Envoyer le message","New message":"Nouveau message","Your name":"Ton nom","Your email":"Ton e-mail","Write your message here...":"Écris ton message ici…","Color five of my drawings using the paint bucket and freehand brush.":"Colorie cinq de mes dessins avec le pot de peinture et le pinceau."});
const originalText=new WeakMap(),originalAttr=new WeakMap();
let lang='fr',busy=false;
try{const saved=localStorage.getItem('portfolio-language-v2');lang=saved==='en'?'en':'fr'}catch(e){}
const attrs=['placeholder','title','aria-label','alt'];
function translateString(str){const leading=str.match(/^\s*/)?.[0]||'',trailing=str.match(/\s*$/)?.[0]||'',key=str.trim();return translations[key]===undefined?str:leading+translations[key]+trailing}
function update(root){
if(busy)return;busy=true;
try{
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(node.parentElement?.closest('script,style,textarea,code,[contenteditable],#language-toggle'))continue;
  const stored=originalText.get(node);
  const base=stored===undefined?node.nodeValue:(node.nodeValue===stored||node.nodeValue===translateString(stored)?stored:node.nodeValue);
  originalText.set(node,base);
  const value=lang==='fr'?translateString(base):base;
  if(node.nodeValue!==value)node.nodeValue=value;
 }
 const elements=[...(root.nodeType===1?[root]:[]),...(root.querySelectorAll?.('*')||[])];
 for(const el of elements){if(el.closest('script,style,#language-toggle'))continue;
  for(const attr of attrs){if(!el.hasAttribute(attr))continue;let records=originalAttr.get(el);if(!records){records={};originalAttr.set(el,records)}
   const current=el.getAttribute(attr),old=records[attr];
   const base=old===undefined?current:(current===old||current===translateString(old)?old:current);
   records[attr]=base;const value=lang==='fr'?translateString(base):base;
   if(current!==value)el.setAttribute(attr,value);
  }
 }
}finally{busy=false}
}
function apply(){
document.documentElement.lang=lang;
const button=document.getElementById('language-toggle');
if(button){button.textContent=lang==='en'?'EN · FR':'FR · EN';button.title=lang==='en'?'Langue actuelle : anglais. Passer en français':'Langue actuelle : français. Switch to English';button.setAttribute('aria-label',button.title)}
update(document.body);
document.dispatchEvent(new CustomEvent('portfolio-language-change',{detail:{language:lang}}));
for(const frame of document.querySelectorAll('iframe')){try{frame.contentWindow?.postMessage({type:'portfolio-language',language:lang},location.origin)}catch(e){}}
}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='portfolio-language-request')return;event.source?.postMessage({type:'portfolio-language',language:lang},location.origin)});
function init(){
const button=document.getElementById('language-toggle');if(!button)return;
button.addEventListener('click',()=>{lang=lang==='en'?'fr':'en';try{localStorage.setItem('portfolio-language-v2',lang)}catch(e){}apply()});
apply();
const observer=new MutationObserver(records=>{
 if(busy)return;
 const nodes=new Set();
 for(const r of records){if(r.type==='childList'){r.addedNodes.forEach(n=>{if(n.nodeType===1)nodes.add(n);else if(n.nodeType===3)nodes.add(n.parentElement)})}
 else if(r.type==='characterData')nodes.add(r.target.parentElement);
 else if(r.type==='attributes')nodes.add(r.target)}
 if(!nodes.size)return;
 observer.disconnect();
 for(const n of nodes)if(n&&document.body.contains(n))update(n);
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();