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
