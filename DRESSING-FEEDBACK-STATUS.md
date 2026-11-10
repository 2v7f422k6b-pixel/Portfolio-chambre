# Retour dressing — publication du 10 novembre 2026

Trois passes de corrections ont été réalisées. Les demandes qui nécessitent de nouveaux dessins ou un choix esthétique restent ouvertes. Aucun PNG source n'a été modifié.

## Changements livrés

- Séparation des emplacements portés : pulls, gilets, pièces sans manches et hauts scintillants. Les catégories du catalogue restent indépendantes.
- Les pulls rose ample, vert anis ample, ourson et bleu à carreaux conservent les robes. Le pull sans manches GANNI et les gilets sans manches peuvent aussi se superposer aux robes.
- Correction des niveaux CSS décimaux : les gilets GANNI et George Sand passent devant le mannequin. Le rendu écran et l'export PNG utilisent le même ordre.
- Suppression du masque du corps qui découpait le cou sous les pulls amples.
- Gilet bleu sous les manteaux ou le gilet fleuri ; exclusion des autres pulls volumineux. Le col roulé Inspecteur reste une couche de base.
- Manteau rayé rose/vert/bleu et gilet oversize rose/bordeaux dans Vestes. Gilet George Sand dans Pulls. Manteau rayé incompatible avec les autres grosses mailles.
- Caraco en dentelle et top papillon compatibles avec les hauts scintillants. Hauts scintillants sous la robe rose à pois et la robe bustier.
- Colliers remontés au-dessus du top papillon, des hauts scintillants, de la chemise George Sand, du col roulé Inspecteur et du gilet bleu. Les grosses mailles restent au-dessus des colliers.
- Collerettes et nœud George Sand au premier plan ; appareil photo au-dessus des vêtements et écharpes. Bracelets derrière les manches opaques.
- Extraction existante des cols étendue aux pulls/gilets ; dessin séparé encore préférable pour un contour parfait.
- Début de correction des bras sur les robes à bretelles : restauration des bras seulement sous les épaules pour les robes en jean et à carreaux.
- Masquage des tiges des bottes roses sous les pantalons, incluant cargo rose, George Sand et Inspecteur. Ajustement fin à contrôler.
- Lampe frontale dans un emplacement distinct, sous le casque, compatible avec les étoiles ; exclusion des bobs. Lunettes Inspecteur dans Bijoux.
- Renommages : Top vert anis, Jupe midi marron, blouse à grand col sans « rentrée », manteau rayé.
- Tenues : Stylée blush + rouge à lèvres ; Sonny blush ; DJ blush + rouge à lèvres + étoiles. Souvenirs instantanés : Plantasia/jean barrel/appareil photo ; Fleur de chambre : robe à pois/gilet fleuri/Docs.
- Sauvegarde/restauration par identifiants stables, migration des anciens emplacements ; description accessible des nouveaux calques. Rafraîchissement du script des tenues sur la page d'accueil.

## Deuxième passe — corrections indépendantes des nouveaux dessins

- [x] Ajouter un compositeur commun à l'écran, aux miniatures sauvegardées et à l'export PNG ; attendre le chargement des images nécessaires avant l'export.
- [x] Ajuster les couches intérieures à la silhouette de la couche extérieure, en comprimant localement les rangées du dessin existant et son contour rouge ; conserver le bas visible sous les manteaux courts.
- [x] Traiter les manteaux ouverts jusqu'à leur véritable ourlet, sans confondre l'ouverture centrale avec la fin du vêtement.
- [x] Masquer les manches et ornements d'épaule couverts par les pulls et vestes ; préserver les manches sous les pièces sans manches et la robe en jean.
- [x] Remplacer les restaurations horizontales des poignets par des bras masqués selon les manches réellement portées.
- [x] Retirer l'ancien calque de poignets de la robe rayée qui repassait devant les gilets.
- [x] Remonter la lanière du sac marron pour les 16 pièces signalées comme trop basses : trench, redingote, veste à badges, gilet fleuri, Miffy, robes jean/carreaux/bustier, manteau rayé, GANNI multicolore, col roulé, papillon, grand col, deux scintillants et chemise George Sand. Recalage supplémentaire du corsage clown.
- [x] Préparer un passage de manche et bras devant le sac crochet, sans remettre tout le torse devant.
- [x] Autoriser les cinq bijoux de sac existants sur le crochet avec leur propre ancrage et leur propre échelle.
- [x] Masquer la partie de la dragonne croisant les manches longues ; laisser le téléphone visible.
- [x] Utiliser la base sans cheveux sous les deux bobs et le haut-de-forme, puis rétablir seulement les mèches du côté du visage avec le dessin original.
- [x] Mesurer les épaules des nouvelles pièces pour adapter les écharpes lorsque l'ancien tableau ne contient pas leur profil.
- [x] Ne plus appliquer le masque d'écharpe aux collerettes et au nœud George Sand placés au premier plan.
- [x] Limiter le cache de compositions à huit canevas de travail et éviter leur agrandissement en mémoire sur tablette.

## Validation de la deuxième passe

120 tests automatisés réussis localement. Vérification visuelle des exports sur 40 associations, regroupées ci-dessous. Ces cas vérifiés ne constituent pas une validation exhaustive des milliers de combinaisons possibles.

- [x] Gilet bleu avec robes à fleurs et à rayures ; robe en jean avec Claudine et scintillant rose.
- [x] Manteau vert avec robe bustier ; trench avec robe en jean et cargo ; redingote avec jupe Princesse clown.
- [x] GANNI multicolore avec robe à fleurs ; manteau rayé avec robe rayée ; gilet fleuri avec GABZILLA ; GANNI sans manches avec col roulé Inspecteur.
- [x] Sac marron avec trench et blouse à grand col ; crochet avec GABZILLA ; téléphone avec GANNI multicolore.
- [x] Quatre associations de bijoux de sac sur crochet, dont gilet bleu et top vert anis.
- [x] Deux bobs, haut-de-forme et écharpe à carreaux avec trench.
- [x] Miffy avec ourson ; dentelle blanche avec pull rose ; GABZILLA sous robe en jean ; robe bleue courte sous manteau vert.
- [x] Bottes roses sous cargo, léopard, pantalon Inspecteur et pantalon George Sand.
- [x] Miffy sous GANNI multicolore, gilet oversize, manteau rayé et Take a Trip.
- [x] Grand col sous robe en jean ; Claudine sous GANNI sans manches ; col roulé et chemise George Sand sous gilet fleuri.
- [ ] Finalisation des cols avec les nouveaux dessins séparés.

## Troisième passe — dessins et captures fournis

- [x] Intégrer le mannequin sans soutien-gorge IMG_5993 et le soutien-gorge bleu séparé IMG_5995 (visible sans vêtement de torse ou sous le scintillant seul). Les variantes rose/noire restent disponibles dans Assets, sans nouveau sélecteur ajouté.
- [x] Remplacer les anciens calques de bras par les mains seules IMG_5994 pour les raccords aux poignets ; préserver la tête sans cheveux des coiffes concernées.
- [x] Utiliser les cols séparés IMG_5998 et IMG_5999 au-dessus des robes salopettes et des mailles.
- [x] Intégrer le top papillon IMG_6018 sans rustine et le sac crochet complet IMG_6001.
- [x] Rétablir l'avant-bras devant le sac crochet sans rétablir le torse du t-shirt.
- [x] Ajouter le bijou Petits trésors IMG_6017 aux accessoires de sac, adapté au sac marron et au crochet.
- [x] Resserrement local de la jupe Princesse sous les t-shirts GABZILLA, Plantasia, Pink Floyd et DAMSON ; enlever l'ancien double traitement DAMSON.
- [x] Rehausser encore la lanière marron sur le trench et la déplacer légèrement à gauche sur le corsage clown.
- [x] Corriger la vignette de la blouse à grand col en utilisant son dessin complet.
- [x] Permettre le manteau rayé sous le yukata grâce à un emplacement de superposition distinct ; conserver le yukata dans Vestes en attendant le choix de rangement.
- [x] Vérifier le col roulé Inspecteur sous le manteau rayé, la frontale avec Kangol, les scintillants sous robe à pois / robe en jean / salopette / bustier. La robe à carreaux reste exclue.
- [x] Gilet fleuri au-dessus du pull rose ou du GANNI multicolore, avec manches visibles et torse contenu.

121 tests automatisés. Contrôle visuel ciblé : nouveaux dessins, gilet bleu avec deux robes, deux blouses sous robe en jean, scintillants avec robe en jean/à pois/salopette, manches de pyjama sous robe en jean, chemise George Sand sous gilet fleuri, deux sacs, deux t-shirts avec jupe Princesse, ourson avec pantalon rayé, yukata avec manteau rayé, gilet fleuri avec deux mailles, frontale avec Kangol.

## À valider avec Léna

- [ ] Jugement esthétique sur les volumes du gilet fleuri sur les deux grosses mailles ; le dessin reste inchangé, les couches du dessous sont contenues localement.
- [ ] Choix de rangement du yukata dans Pyjamas ou Vestes. Le rangement peut être changé sans modifier son comportement de couche extérieure.
- [ ] Passage précis de la lanière marron entre les volants de dentelle et de la robe vichy, si un défaut subsiste.
- [ ] Validation finale des petits raccords après rechargement ; les captures ont été traitées comme cas de contrôle, sans supposer que toutes les combinaisons possibles sont parfaites.

Les dessins demandés ont été reçus. Aucun redessin général des manches n'est requis à ce stade. Les PNG originaux sont conservés intacts.
