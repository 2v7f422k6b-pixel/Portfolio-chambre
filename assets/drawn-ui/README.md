# Dessins de Léna — interface et mini-jeux

Les 116 PNG proviennent des cinq planches IMG_5284 à IMG_5288 dessinées par Léna.
Ce sont les découpes originales, sans retracé, lissage ni réduction de résolution.
`manifest.json` conserve la planche, les coordonnées de découpe et le SHA-256 de chaque fichier.

- `lena-drawings.js` remplace les symboles d’interface, y compris après un changement de langue ou de lecture. Les champs éditables, textes ordinaires, SVG artistiques et croix de fermeture originales sont exclus.
- Les lettres et chiffres des perles sont des images SVG centrées, avec proportions conservées ; la couleur aléatoire des perles et leurs positions enregistrées restent indépendantes.
- Les images du ciel, de l’araignée et des pétales utilisent les coordonnées et animations existantes.
- Les quatre couches du latte gardent les identifiants et transitions du jeu.
- Les cadres complets utilisent les PNG découpés en neuf zones par `border-image`, sans modifier la taille des boutons ou des fenêtres. Les séparateurs ouverts restent des tracés structurels.
- Les vrais contenus déjà dessinés (pièces de la chambre, dock, cœurs, croix, perles, coque et expressions du Tamagotchi) restent leurs fichiers d’origine.

Le certificat exporté utilise également le cadre, les ornements et le cœur de Léna.
