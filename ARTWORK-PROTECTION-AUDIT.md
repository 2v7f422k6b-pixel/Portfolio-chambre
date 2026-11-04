# Protection des illustrations — audit du 4 novembre 2026

## Modifications appliquées au dépôt
- `index.html`, `polaroids/index.html` et `coloring-book/index.html` contiennent la balise officielle `<meta name="pinterest" content="nopin">`. Pinterest est censé respecter cette instruction; les extensions non coopératives peuvent l'ignorer.
- `artwork-protection.js` pose les attributs `nopin`, `data-pin-nopin` et `draggable=false` sur les œuvres, y compris dans les fenêtres créées en JavaScript. Le clic droit et le glisser-déposer sont découragés pour les images concernées.
- Le script `scripts/generate-artwork-previews.py` crée des aperçus WebP de 1 200 pixels de grand côté au maximum, qualité 78, sans redessiner ni recadrer les originaux. `.github/workflows/artwork-previews.yml` les régénère après modification du script.
- Aperçus générés et conservés dans `assets/previews/`: **19 illustrations JPEG**, **2 PNG importés** et **3 images GABZILLA**.
- `app.js` utilise les aperçus pour la galerie, les fenêtres agrandies, les miniatures et GABZILLA; `index.html` les utilise pour les affiches de la chambre; `content/presentation.json` utilise l'aperçu pour le portrait.
- Les dessins originaux n'ont pas été supprimés ni remplacés.

## Limites de sécurité encore importantes
**Ce n'est pas une protection contre le téléchargement direct.** Les anciens JPEG/PNG demeurent dans le dépôt GitHub public, accessibles via URL, historique Git et potentiellement caches. Le remplacement des URL dans l'interface ne rend donc pas les originaux privés. Même avec un dépôt entièrement nettoyé, une œuvre affichée peut être copiée par capture d'écran.

## À réaliser pour une véritable boutique numérique
1. Vérifier les fichiers maîtres et leur sauvegarde dans un stockage **privé** hors GitHub Pages, à accès strictement contrôlé.
2. Après vérification de la sauvegarde, retirer les sources haute définition de la branche publique et de l'historique si nécessaire; attention aux liens/caches déjà diffusés. Une réécriture d'historique est une opération sensible et ne garantit pas l'effacement des copies déjà obtenues.
3. Faire livrer les achats depuis ce stockage par un prestataire de vente de fichiers numériques ou une application serveur validant le paiement et générant des liens courts, signés et expirables.
4. Dans Nana Studio, ne télécharger vers `assets/uploads/` que des images déjà réduites et destinées à être publiques; l'interface d'administration peut actuellement publier les originaux sans conversion privée.

**Ne jamais publier les masters destinés à la vente sous `assets/` dans ce dépôt public**, même si une interface masque leur URL.
