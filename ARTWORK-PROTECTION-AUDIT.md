# Audit de protection des illustrations — 4 novembre 2026

## État constaté
- Dépôt public GitHub Pages : les images publiées restent téléchargeables par URL, même si le clic droit est désactivé.
- 19 JPEG dans `assets/photos/`, utilisés notamment par les affiches de la chambre.
- 2 PNG dans `assets/uploads/`, à examiner avant toute conversion.
- Les dimensions en pixels et l'historique des versions n'ont **pas** été validés. La taille du fichier ne prouve pas la qualité imprimable.

## Mesure préparée sur cette branche
- Blocage du menu contextuel et du glisser-déposer sur les images des dossiers `assets/photos/` et `assets/uploads/`.
- Pas de blocage du clic normal, du zoom, des interactions ou du défilement.
- **Protection légère seulement** : ne bloque ni captures d'écran ni accès réseau.

## Mesures indispensables avant commercialisation
1. Sauvegarder tous les originaux dans un stockage privé, hors GitHub public.
2. Mesurer les dimensions réelles et identifier les images effectivement proposées à la vente.
3. Générer des aperçus WebP/JPEG de qualité écran, sans recadrage, et modifier leurs références dans les pages.
4. Vérifier l'historique Git : les anciens originaux peuvent rester accessibles après suppression de la branche principale.
5. Héberger les fichiers vendus dans un stockage privé, avec liens temporaires délivrés après vérification du paiement.

Ne pas supprimer ni écraser les originaux avant sauvegarde et validation visuelle.
