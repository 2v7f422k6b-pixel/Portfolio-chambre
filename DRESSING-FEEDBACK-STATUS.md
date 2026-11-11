# Dressing — suivi à jour, 10 novembre 2026

Référence : retours oraux et quatre lots IMG_6116 à IMG_6150. Ce document remplace les conclusions des passes précédentes : les déformations automatiques ont été rejetées par Léna. Ne plus les réintroduire. Les PNG originaux restent intacts. Les nouveaux dessins arriveront quand Léna pourra les préparer, sans échéance imposée.

## Corrections intégrées dans cette passe

- [x] Retirer la compression horizontale des pantalons, jupes et robes sous les hauts et manteaux. Restaurer les proportions et les motifs d'origine. Les incompatibilités avec le trench restent ouvertes jusqu'aux variantes dessinées.
- [x] Conserver la correction des bras : le calque général ne repeint plus les bras supérieurs par-dessus les hauts, bretelles et volants. Contrôle supplémentaire des robes jean, pois et carreaux.
- [x] Bottes sous pantalons : mesurer l'ourlet de chaque jambe et masquer la tige au-dessus, y compris les contours latéraux et entre les jambes. Conserver le pied visible et le pantalon devant.
- [x] Col Claudine rose : ne plus ajouter le col au premier plan avec GANNI sans manches, pull rose, pull vert anis, gilet bleu, pull ourson, pull bleu à carreaux et nœuds. Le col séparé existe : assets/dressing-lena/IMG_5999.png. Ne pas le redemander.
- [x] Conserver le col au premier plan avec GANNI multicolore, robe en jean et salopette. Le raccord esthétique avec le cardigan reste à affiner.
- [x] Première correction ciblée sous GANNI sans manches/gilet fleuri : épaules suivant les pixels du gilet, retrait du col rose séparé sur la blouse dessous. Masquage du centre du bas de chemise sous GANNI. Aucune déformation des manches.
- [x] Préparer deux registres de sources de bijoux, sac marron / sac crochet, en conservant les identifiants des looks. Les registres attendent les nouveaux PNG ; actuellement les dessins existants restent utilisés.

## Corrections encore ouvertes, ne pas déclarer terminées

- [ ] GANNI sans manches : compléter les masques précis des débordements (George Sand, inspecteur noir, corset clown, blouse à volants, t-shirts, pyjamas). La première correction des épaules ne suffit pas pour tous les volants, côtés et ourlets. Les manches séparées ne remplacent pas ce travail.
- [ ] Gilet fleuri : compléter les masques, notamment encolure et épaules de Miffy, préserver l'ouverture centrale.
- [ ] Col rose + GANNI multicolore : vérifier et nettoyer les raccords autour de l'encolure.
- [ ] Robe en jean : placer toutes les manches devant, raccorder les poignets et les mains avec les exports séparés.
- [ ] Sac crochet : remplacer la découpe approximative de manche par les manches exactes . Ne pas couper arbitrairement la bandoulière : elle est continue avec le sac.
- [ ] Bob et haut-de-forme : utiliser les futures versions chapeau + cheveux visibles sur mannequin chauve. La découpe automatique actuelle ne constitue pas une solution validée.
- [ ] Trench : intégrer les variantes dédiées sans toucher aux originaux utilisés ailleurs.
- [ ] Jupe jaune : intégrer les t-shirts avec bas redessiné ; l'original lui-même ne donnait pas un résultat satisfaisant. Ne pas proposer encore une déformation.
- [ ] Bijoux crochet : boucle fermée ; sac marron : boucle légèrement ouverte. Attache au nouvel anneau/tirette ; deux sources distinctes même si le bijou est visuellement identique.

## Checklist des fichiers à fournir par Léna

- [ ] Variante pour trench du pantalon à rayures roses.
- [ ] Variante pour trench de la jupe en jean évasée.
- [ ] Variante pour trench de la robe en jean.
- [ ] Variante pour trench de la robe bleue courte à col montant.
- [ ] Bas de t-shirt adapté à la taille de la jupe jaune : ourlet/plis redessinés. Un modèle commun d'abord si les coupes sont identiques ; DAMSON est plus long et nécessite une vérification distincte.
- [ ] Blouse blanche grand col et nœuds : buste, manche gauche, manche droite ; col séparé déjà référencé sous IMG_5998.png, ne pas refaire si cet export convient.
- [ ] Blouse rose : buste, manche gauche, manche droite ; col IMG_5999.png déjà fourni.
- [ ] Trench : corps et chaque manche séparés, sans mains.
- [ ] Manteau vert : corps et chaque manche séparés, sans mains.
- [ ] Bob bleu + cheveux visibles, sans visage ni corps.
- [ ] Bob beige + cheveux visibles, sans visage ni corps.
- [ ] Haut-de-forme + cheveux visibles, sans visage ni corps.
- [ ] Sac crochet entier avec anneau ou tirette d'attache. Pas de séparation arbitraire corps/bandoulière.
- [ ] Chaque bijou du sac crochet avec boucle fermée, fichier distinct.
- [x] Conserver les bijoux existants du sac marron avec boucle légèrement ouverte ; aucun nouvel export requis s'ils conviennent.

Tous les PNG : transparents, toile complète d'origine, mêmes dimensions et coordonnées, sans recadrage ni déplacement. Exporter les variantes seules : le trench ou la jupe sert de repère mais ne doit pas être fusionné dedans. Garder tous les originaux. Suffixes suggérés : pour-trench, pour-jupe-jaune, manche-gauche, manche-droite, sac-crochet.

## Vérification de cette passe

129 tests automatisés passent. Tests actualisés pour garantir l'absence de déformation des bas et le masquage des tiges de bottes par jambe. Contrôle dans Chrome de douze combinaisons : blouse rose/pull rose, blouse rose/GANNI sans manches, blouse rose/GANNI multicolore, trois robes seules, pantalon inspecteur/bottes marron et roses, pantalon rayé/trench, jupe jean/trench, jupe jaune/Plantasia, blouse à nœuds/robe jean. Les cas en attente ont été observés mais ne sont pas validés comme résolus. Aucun test sur iPad physique, aucune promesse de correction exhaustive de toutes les combinaisons.

## Complément — deux sacs sur toute la garde-robe

- [x] Sac coussin marron : point de contact mesuré sur les pixels opaques de l'épaule, toutes les couches portées prises en compte.
- [x] Sac crochet : déplacement du dessin entier pour suivre l'épaule, sans séparer ni déformer sa bandoulière continue. Les bijoux suivent ce déplacement.
- [x] Écarter les pixels isolés et les espaces transparents ; ne pas confondre la capuche ourson avec une épaule.
- [x] Vérification des 47 vêtements du buste, épaules nues et 30 superpositions pour chacun des deux sacs : 156 rendus, aucune erreur de génération. Contrôle visuel dans Chrome. 20 tests ciblés passent, dont la régression capuche.
- [ ] Les masques des manches devant le crochet restent à remplacer par les exports exacts. Ce contrôle valide le placement sur l'épaule, pas toutes les découpes ni toutes les combinaisons possibles.


## Intégration des 35 exports du 11 novembre 2026

La précision de Léna prévaut : les hauts raccourcis sont pour la **jupe jaune**, pas les jupes longues.

- [x] 19 variantes de bas/robes/salopette utilisées sous le trench, le manteau vert et le manteau George Sand ; dessins originaux conservés sans ces manteaux.
- [x] GANNI, DAMSON, Gabzilla, Plantasia et Pink Floyd corrigés uniquement avec la jupe jaune.
- [x] Sac crochet avec zip, six sources de charms dédiées ; bijoux du sac coussin inchangés. Petit trésor conservé à sa taille et à sa position dessinées sur l’anse ; seul le déplacement global du sac est appliqué.
- [x] Mannequin chauve tatoué avec les trois chapeaux + cheveux fournis et les oreilles Sonny Angel.
- [x] Suppression de la découpe automatique des cheveux pour ces trois chapeaux.
- [x] Cache de composition invalidé au changement de variante ; mêmes identifiants pour les looks et même composition pour l’export PNG.

Les cases historiques « à fournir » pour ces fichiers sont désormais satisfaites. Restent ouverts : exports de manches, raccords GANNI/gilet fleuri et autres cas non couverts par ces 35 fichiers. Ne pas déclarer toute la garde-robe terminée.

### Correspondance des fichiers (Illustration_sans_titre-N.png)

- [x] 1 : Bob beige + cheveux
- [x] 2 : Haut-de-forme + cheveux
- [x] 3 : Bob bleu + cheveux
- [x] 4 : Robe bustier rose sous manteaux
- [x] 5 : Cargo rose sous manteaux
- [x] 6 : Jupe jaune sous manteaux
- [x] 7 : Robe bleue courte sous manteaux
- [x] 8 : Jean barrel sous manteaux
- [x] 9 : Pantalon inspecteur sous manteaux
- [x] 10 : Salopette peinture sous manteaux
- [x] 11 : Pantalon léopard sous manteaux
- [x] 12 : Jean bleu clair sous manteaux
- [x] 13 : Pantalon vert sous manteaux
- [x] 14 : Pantalon rayé rose sous manteaux
- [x] 15 : Jupe jean sous manteaux
- [x] 16 : Jupe marron sous manteaux
- [x] 17 : Robe rayée sous manteaux
- [x] 18 : Robe à pois sous manteaux
- [x] 19 : Robe vichy sous manteaux
- [x] 20 : Robe carreaux lilas sous manteaux
- [x] 21 : Robe fleurie sous manteaux
- [x] 22 : Robe jean sous manteaux
- [x] 23 : Sac crochet avec zip
- [x] 24 : Charme poupée ourson crochet
- [x] 25 : Charme Kuromi crochet
- [x] 26 : Charme Hello Kitty crochet
- [x] 27 : Charme My Melody crochet
- [x] 28 : Charme Pompompurin crochet
- [x] 29 : Charme perlé crochet
- [x] 30 : GANNI sur jupe jaune
- [x] 31 : DAMSON sur jupe jaune
- [x] 32 : Gabzilla sur jupe jaune
- [x] 33 : Plantasia sur jupe jaune
- [x] 34 : Pink Floyd sur jupe jaune
- [x] 35 : Body chauve tatoué

Validation : 24 tests ciblés passent ; 71 compositions PNG produites dans Chrome sans erreur de génération. Contrôle visuel des variantes, sans test sur iPad physique.

