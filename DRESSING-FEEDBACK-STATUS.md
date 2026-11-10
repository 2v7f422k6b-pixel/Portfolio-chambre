# Dressing — reprise après les trois séries de captures du 10 novembre 2026

Les anciennes validations étaient insuffisantes : elles avaient accepté des déformations et des découpes qui ne respectaient pas les dessins. Ce bilan les remplace. Aucun PNG source n'a été retouché.

## Corrections de cette passe

- [x] Supprimer le rééchantillonnage horizontal des rangées des vêtements. Les pantalons, jupes et salopettes conservent leur source, leurs dimensions et leur placement, y compris sous les manteaux.
- [x] Utiliser IMG_5453, la jupe Princesse entière, sur le mannequin. L'ancienne source IMG_5382 comportait déjà deux encoches pour les bras.
- [x] Rétablir la continuité des bras et des mains avec IMG_5495, masqué par les vêtements réellement portés. Le calque des seules mains provoquait un raccord visible au-dessus des poignets.
- [x] Conserver les dessins portés des hauts et manteaux avec leurs encolures transparentes. Les variantes de catalogue ne les remplacent pas.
- [x] Autoriser une seule maille extérieure (pull, cardigan ou GANNI sans manches). Seul le col roulé Inspecteur peut constituer une seconde maille en dessous. La dernière sélection remplace la maille incompatible.
- [x] Restreindre le gilet George Sand aux pièces de torse George Sand ; les autres chaussures, bijoux et bas restent sélectionnables.
- [x] Exclure yukata + autre veste, sauf manteau rayé. Le gilet fleuri reste autorisé. La veste à badges est retirée avec ses badges lorsqu'on choisit le yukata.
- [x] Rendre les écharpes incompatibles avec les deux collerettes et le nœud George Sand. La dernière sélection remplace l'autre accessoire.
- [x] Retirer les extractions approximatives de cols. Seuls les deux cols fournis séparément sont remis au premier plan.
- [x] Masquer les couches supérieures couvertes sans les étirer ; conserver le bas visible de Miffy et des robes. Masquer les débordements des manches de Miffy jusqu'au bas des manches de la veste.
- [x] Conserver le top scintillant entier sous la robe en jean ; rendre les gants au-dessus du scintillant et sous les manches opaques, sans raccord blanc aux poignets.
- [x] Recomposer le bras et la manche au-dessus du crochet, sans réintroduire le torse ni le bras nu à travers une manche. Déplacer l'ancrage des bijoux sur le sac.
- [x] Masquer la dragonne avec la silhouette de la manche visible, sans longueur de découpe fixe au poignet.
- [x] Supprimer la découpe rectangulaire des cheveux sous les bobs et le haut-de-forme. Les chapeaux recouvrent maintenant les cheveux originaux.

## Vérifications

124 tests automatisés locaux réussis, dont les ordres de sélection des mailles, George Sand, yukata et accessoires de cou ; restauration d'un état contenant trop de mailles ; conservation des sources des bas sous tee-shirts, pulls et manteaux ; sauvegarde des looks et déblocages.

Contrôles visuels ciblés dans le navigateur et dans les exports du même compositeur :

- Pull vert anis + jupes jean/Princesse/marron et pantalons rayé/léopard/cargo/George Sand ; ourson + jean barrel.
- Papillon + pantalon rayé ; GABZILLA + jupe Princesse ; pyjama + gilet bleu + mini-jupe ; scintillant + robe en jean + gants.
- Crochet avec trench, cardigan oversize, GABZILLA et pull à nœuds avec bijou.
- Gants avec chemise de pyjama ; téléphone avec GANNI multicolore, pull à nœuds et manteau vert.
- Miffy avec GANNI multicolore, cardigan oversize, manteau rayé et Take a Trip.
- Deux bobs et haut-de-forme sans masque de cheveux ; écharpe avec trench.

Ces contrôles couvrent les cas signalés, pas toutes les combinaisons du catalogue. La hauteur visible d'une mini-jupe sous un tee-shirt long dépend désormais de leurs deux dessins d'origine ; aucune réduction de la jupe n'est appliquée.

Les contrôles de ressources complets doivent être exécutés par GitHub Actions sur le dépôt intégral : la copie locale utilisée pour travailler ne contient pas toutes les images de la chambre.
