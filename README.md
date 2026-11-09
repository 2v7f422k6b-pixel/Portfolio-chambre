# Nana Color Studio — Portfolio

Portfolio statique publié sur GitHub Pages. Aucun build ni dépendance JavaScript
n'est nécessaire pour faire fonctionner le site.

## Organisation

| Fichiers | Responsabilité |
| --- | --- |
| `index.html` | Chambre, accueil et ordre de chargement des composants |
| `app.js` | Navigation Play/Work, fenêtres, galerie, téléphone et lecteur audio |
| `portfolio-layout.css` | Présentation de la chambre, de l'accueil et du bureau |
| `window-system.css`, `window-bounds.js` | Dimensions des fenêtres et espace disponible sous le menu |
| `window-chrome.*` | Barre de titre commune, cœur et PNG de fermeture |
| `sketch-ui.*`, `sketch-lines.css` | Tracés irréguliers de l'interface |
| `room-hover.js`, `pixel-outlines.js` | Contours des objets interactifs |
| `i18n.js`, `i18n-extra.js`, `game-i18n.js` | Traductions du portfolio et des jeux intégrés |
| `portfolio-catalog.js` | Catalogue et règles communes des deux recherches |
| `portfolio-search.js`, `global-search.js` | Interfaces de recherche du bureau et du menu |
| `motion-addon.js`, `pages-addon.js`, `book-addon.js` | Lecteurs d'animations, d'articles et du livre |
| `dreamlab.js`, `dreamlab-multitrack.js` | Instrument Mimilab et enregistrement multipiste |
| `content/`, `nana-site-settings.js` | Contenus et positions enregistrées pour le site |
| `assets/` | Illustrations, photos, typographie et médias originaux |

Les pages `about-me-*.html`, `apercu-*.html` et l'ancien
`assets/motion-addon.js` sont conservés pour les aperçus et anciens liens.
Ils ne sont pas chargés par la chambre principale (sauf l'aperçu de récompense,
accessible avec `?previewReward=1`).

## Modifier sans empiler les corrections

- Modifier la règle existante dans le composant responsable plutôt que rajouter
  un correctif à la fin d'un autre fichier.
- Préserver l'ordre des feuilles de styles et des scripts dans `index.html`.
  `portfolio-layout.css` occupe la position de l'ancien grand bloc de styles inline.
- Garder les variantes mobile, portrait/paysage, jour/nuit et les solutions de
  repli CSS : deux règles similaires dans des conditions différentes peuvent être nécessaires.
- Les lecteurs exposent leur entrée à `app.js` ; éviter de redéfinir leurs
  fonctions ou de modifier les fonctions des autres composants après chargement.
- Utiliser `NanaPortfolioSearch` pour les recherches et `portfolioArtworkByFile`
  pour retrouver une illustration : le catalogue d'images appartient à `app.js`.
- Conserver les clés de stockage existantes pour préserver les réglages et créations.
- Respecter [DESIGN-RULES.md](DESIGN-RULES.md) et actualiser la version des ressources
  modifiées dans leurs liens pour éviter les anciennes copies en cache.

## Carnet de découvertes

Le bouton étoile du menu ouvre le carnet (`#/carnet/chambre`), également accessible
par rubrique : `secrets`, `jeux`, `dressing`, `stickers`, `titres`, `cadeaux`.

- `nana-progress.js` contient les règles des collections et les tenues bonus ;
  `nana-journal.js` / `.css` présentent les compteurs, l’album et les cadeaux.
- Les découvertes existantes et le déblocage Princesse Clown gardent leurs clés.
  Les nouveaux accomplissements utilisent `nana-visitor-progress-v1`, sur le
  navigateur du visiteur. Les jeux intégrés partagent le même état ; leurs pages
  autonomes utilisent le même stockage. Aucun compte ni suivi externe n’est ajouté.
- Les vêtements déjà accessibles restent disponibles. Les quatre pièces Princesse
  Clown sont montrées en silhouette avant l’ouverture du livre. Les autres bonus
  sont des ensembles de vêtements existants : latte préparé, coloriage découvert,
  trois perles enfilées. Ajouter une tenue dans `NanaProgress.outfits` la rend
  disponible à la fois dans le carnet et le dressing.
- Les stickers réutilisent les dessins originaux. Les recadrages sont des fenêtres
  SVG sur les PNG ; aucun dessin source n’est modifié.
- L’atelier créatrice permet d’essayer les tenues sans attribuer de succès.
  Les aperçus et éditeurs de placement sont exclus de la progression.
- Le cadeau conserve le code `MERCI10` existant. Son application à une commande
  dépend du paramétrage de la boutique ; le carnet ne crée pas de coupon côté paiement.

## Newsletter

- `nana-newsletter.js` / `.css` proposent un petit courrier mensuel, en FR/EN.
  Le formulaire est accessible dans le carnet et par `#/newsletter`.
- Une invitation non modale apparaît une seule fois par navigateur, après au
  moins une minute de Play visible et une activité réalisée (dressing, latte,
  perles, musique, repos ou tous les polaroïds), ou 25 % des objets explorés.
  Elle attend le retour à la chambre, sans jeu, fenêtre ni récompense ouverte.
  Les sessions de création et d’aperçu sont exclues.
- Les demandes utilisent le formulaire Formspree existant `mbggaaqo`, avec un
  sujet Newsletter, le consentement affiché, sa version, sa date et la langue.
  Le succès est affiché uniquement après acceptation HTTP. Aucune donnée de jeu
  n’est transmise et l’adresse n’est jamais enregistrée dans localStorage.
- Il s’agit de **demandes d’inscription reçues par Léna**, pas d’une intégration
  à un service d’envoi de newsletters. Ajouter les adresses consentantes dans
  l’outil choisi pour les envois et traiter les demandes de désinscription avant
  chaque campagne. Le formulaire fournit déjà le contact pour ces demandes.
- `nana-newsletter-v1` conserve uniquement l’invitation vue et la demande envoyée.
  Les tests simulent les réponses de Formspree ; aucun email de test n’est envoyé.

## La boîte dans le mur

- Les trois secrets retenus sont l’araignée, la boîte à souvenirs et le dessin
  d’enfance. Le dessin est annoncé « À venir » tant que Léna ne l’a pas fourni.
  Les anciens accomplissements restent conservés, mais ne comptent plus comme secrets.
- Une petite bille, sur le coin gauche du bureau, tombe et déloge un carreau
  au pied du mur, à gauche du rideau.
  La boîte apparaît derrière ; cliquer dessus ouvre son contenu. Le lien direct
  `#/secret/boite-a-souvenirs` joue la scène puis ouvre la boîte.
- `memory-box.js` / `.css` portent l’interaction ; les éléments graphiques
  réutilisent les perles et cadres dessinés existants. Les PNG restent intacts.
- Ajouter uniquement les souvenirs choisis par Léna dans `memory-box-content.js` :
  `type` (`image` ou `audio`), `src`, `title`, `caption` et `alt`, les textes en
  `{fr, en}`. `thumbnail` peut désigner le PNG transparent de l’accessoire ;
  `crop` règle le cadrage visuel du PNG sans modifier le dessin source ;
  `x`, `y`, `width`, `height` (pourcentages du fond) et `rotation` règlent sa position.
  Toucher un accessoire affiche son contenu ; « Reposer dans la boîte » revient
  au fond. La fenêtre utilise la boîte dessinée `assets/memorybox/IMG_5749.png`,
  accompagnée des six souvenirs fournis (cassette, Playmobil, Jojo, bracelet,
  cocotte et médiator). Aucun faux souvenir n’est publié.
- La découverte est attribuée après la chute complète, une seule fois. La sortie
  de la scène annule les animations ; fermer la boîte arrête l’audio. Navigation
  clavier, préférence de mouvement réduit, FR/EN et jour/nuit sont pris en compte.

## Vérifications

Avec Node.js 22 ou plus récent, depuis la racine du dépôt :

```sh
node scripts/verify-source.mjs
node --test scripts/check-*.mjs
```

Le premier contrôle vérifie la syntaxe des scripts, les JSON, les ressources
locales et les identifiants/imports des pages actives. Les tests couvrent les
traductions du latte, les contours, les dimensions des fenêtres, l'orientation
de Mimilab et les destinations de recherche. GitHub Actions relance ces contrôles.

Pour une modification visuelle, comparer aussi les vues Play/Work, les deux
langues et les deux thèmes aux formats téléphone, iPad portrait/paysage et ordinateur.
Les contrôles automatisés ne remplacent pas cette comparaison ni un essai sur Safari iOS.

