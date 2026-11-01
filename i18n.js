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
const originalText=new WeakMap(),originalAttr=new WeakMap();
let lang='en',busy=false;
try{lang=localStorage.getItem('portfolio-language')==='fr'?'fr':'en'}catch(e){}
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
if(button){button.textContent=lang==='en'?'FR':'EN';button.title=lang==='en'?'Passer en français':'Switch to English';button.setAttribute('aria-label',button.title)}
update(document.body);
document.dispatchEvent(new CustomEvent('portfolio-language-change',{detail:{language:lang}}));
}
function init(){
const button=document.getElementById('language-toggle');if(!button)return;
button.addEventListener('click',()=>{lang=lang==='en'?'fr':'en';try{localStorage.setItem('portfolio-language',lang)}catch(e){}apply()});
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