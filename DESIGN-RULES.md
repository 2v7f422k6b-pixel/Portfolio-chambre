# Nana Color Studio — règle de tracé des interfaces

## Règle permanente : aucune ligne d'interface parfaitement droite

Tous les éléments graphiques **de l'interface** (fenêtres, séparateurs, cadres, cartes, boutons, onglets, champs, navigation, lecteur) doivent utiliser un **trait rouge vif très légèrement irrégulier**, comme décalqué à la main au stylet.

### Application obligatoire aux prochaines modifications
1. Vérifier systématiquement les **lignes structurelles** : séparation des colonnes, en-têtes, pieds de fenêtre, lecteur inférieur, règles horizontales et verticales.
2. Remplacer les bordures CSS droites par **un seul** contour ou séparateur dessiné. Ne jamais superposer le trait dessiné à une bordure native visible.
3. Garder les angles carrés, la finesse du trait et une irrégularité **subtile**, sans oscillations exagérées. Valeur de référence : amplitude ~1 à 1,25 px sur l'interface (voir `sketch-ui.js`), à ajuster selon la densité de pixels.
4. Ne jamais changer les dimensions, l'ordre des enfants, le flux CSS, le texte ou les interactions pour obtenir cet effet. Les SVG de tracé sont décoratifs, en position absolue et `pointer-events:none`.
5. Exclure les **illustrations, photographies, vidéos, typographies, icônes dessinées et contenus artistiques** : cette règle ne concerne que le chrome de l'interface.
6. Contrôler les rendus iPad et desktop. Si un nouveau tracé crée un double cadre, écrase un texte ou casse une carte, corriger le composant individuellement, sans élargir aveuglément les sélecteurs.
7. Toute nouvelle section doit suivre cette règle dès sa création ; aucune nouvelle bordure géométrique CSS visible ne doit être introduite.

### Implémentation
Le moteur partagé est `sketch-ui.js`, stylé dans `sketch-ui.css`. Il dessine des chemins SVG déterministes pour les cadres et les règles, y compris les contenus ajoutés dynamiquement. Pour chaque nouveau composant, déclarer explicitement les cibles pertinentes dans ce moteur, masquer les bordures natives correspondantes et vérifier que les textes et les images restent intacts.

**Important :** Cette charte est une règle de développement et de design, pas une garantie automatique que toutes les bordures historiques du site ont déjà été converties. Toute ligne droite restante doit être traitée lors des audits et des prochaines retouches.
