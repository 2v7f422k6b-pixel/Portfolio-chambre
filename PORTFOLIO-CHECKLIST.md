# Portfolio — vérifications du 5 novembre 2026

Cette passe porte sur Mimilab, le mini DAW, la reprise après rafraîchissement et les traductions des mini-jeux. Les dessins et PNG d’origine sont conservés.

## Corrections livrées

- Mimilab suit l’orientation de la fenêtre qui le contient. Un iPad en portrait ne déclenche plus la mise en page paysage à cause des dimensions de la fenêtre interne.
- Le dessin garde une hauteur naturelle. Suppression des scripts concurrents qui réduisaient toute l’interface ou déplaçaient le clavier.
- En portrait : clavier puis DAW. En paysage sur grand écran : clavier à gauche, DAW à droite. Défilement vertical disponible sur petit écran.
- Commandes du DAW plus lisibles, messages d’état visibles et changement de langue cohérent pendant l’enregistrement.
- Suppression d’une piste au clavier réparée. Restauration d’une piste désactivée pendant une prise pour éviter de remplacer son contenu.
- Mimilab peut se fermer avec Échap depuis son clavier, sans renvoyer le portfolio à l’accueil.
- Rafraîchissement : conservation de la fenêtre ouverte après un clic dans son contenu ; réouverture de Mimilab ; restauration de l’illustration consultée. Les prises audio ne sont pas conservées après rechargement.
- Traduction des sept cartes de mini-jeux, des messages et de plusieurs commandes accessibles. Correction d’une substitution qui appelait les photos Polaroïd « illustrations ».
- Les traducteurs évitent de reparcourir plusieurs fois le même sous-arbre pendant une mise à jour. Aucun gain de vitesse chiffré n’est revendiqué.

## Contrôles réalisés

Tests dans Chrome, avec fenêtres intégrées de dimensions contrôlées. Ce ne sont pas des tests sur un iPad physique.

| Contrôle | Résultat |
| --- | --- |
| Téléphone portrait 390 × 740 | Clavier visible, DAW dessous, aucun débordement horizontal du document |
| iPad portrait 820 × 1050 | Clavier visible, DAW dessous |
| iPad Pro portrait 1024 × 1366 | Orientation du parent respectée |
| iPad paysage 1024 × 700 | Clavier et DAW côte à côte |
| Ordinateur 1280 × 780 | Rendu final inspecté, DAW sur la hauteur disponible |
| Téléphone paysage 740 × 360 | Interface empilée et défilable |
| Mimilab : notes avec Entrée/Espace | Validé |
| Mimilab : changement FR/EN pendant une prise | Validé |
| DAW : supprimer au clavier, annuler, enregistrer une deuxième piste | Validé |
| DAW : lecture et export WAV de deux pistes | Fichier récupéré en page autonome, stéréo 44,1 kHz, signal audio non nul |
| Reprise du catalogue de jeux après rafraîchissement | Validé, y compris après clic dans le contenu |
| Reprise de Mimilab après rafraîchissement | Validé |
| Échap dans Mimilab | Fenêtre fermée, mode Work conservé |
| Reprise de l’illustration Bubbles après rafraîchissement | Validé |
| Catalogue des sept jeux, aller-retour FR/EN | Validé |
| Coloriage | Ouverture, sélection d’un dessin et du pinceau vérifiées |
| Tamagotchi | Ouverture, action nourrir et fermeture vérifiées |
| Atelier latte | Parcours expresso, vanille, lait, versement, décoration et service terminé |
| Laboratoire des mots | Ajout de mots et changement de leur ordre vérifiés |

Les quatre derniers contrôles de jeu ont été faits sur la version publique de départ ; les mécaniques de ces jeux n’ont pas été modifiées.

## À vérifier sur les appareils réels

- [ ] Safari iPad : ouvrir Mimilab en portrait, tourner l’iPad puis revenir en portrait.
- [ ] Safari iPad : jouer plusieurs touches au doigt et déplacer pads, potentiomètres et faders.
- [ ] Safari iPad : enregistrer deux pistes et télécharger le WAV depuis la fenêtre du portfolio.
- [ ] Safari iPhone : vérifier le défilement, le clavier et la fermeture avec les barres du navigateur affichées.
- [ ] Vérifier les exports PNG du coloriage, du Laboratoire des mots et du jeu d’habillage. L’export du poème affiche sa confirmation, mais le téléchargement du fichier n’a pas pu être confirmé par le navigateur de test.
- [ ] Parcourir le jeu d’habillage et la minute complète du Club du rien ; ils n’ont pas été testés intégralement dans cette passe.
- [ ] Repasser les animations jour/nuit et l’effet du bretzel sur iPad. Leurs fichiers n’ont pas été modifiés.

## Contrôles techniques reproductibles

```sh
node --test scripts/check-studio-layout.mjs
```

Quatre tests couvrent l’orientation du parent, le changement d’orientation, le cas autonome, le repli pour un parent inaccessible et le message de fermeture. La syntaxe des scripts JavaScript modifiés a été vérifiée. Les références littérales `src`/`href` de six pages d’entrée ont également été contrôlées contre l’inventaire du dépôt (125 références, aucun chemin manquant).
