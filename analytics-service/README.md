# Activation des compteurs Nana

Le site ne collecte **rien tant que `NANA_ANALYTICS_ENDPOINT` est vide**.
GitHub Pages ne peut pas héberger un collecteur. Ce dossier fournit un Worker
Cloudflare et une base D1 de compteurs journaliers, sans journal d’événements.
L’accès au compte Cloudflare de Léna reste nécessaire pour le déployer.

## Déploiement

Depuis ce dossier, avec Wrangler et un compte Cloudflare connecté :

1. `npx wrangler d1 create nana-statistics --jurisdiction=eu`
2. Reporter uniquement le `database_id` renvoyé dans `wrangler.jsonc`.
3. `npx wrangler d1 execute nana-statistics --remote --file=schema.sql`
4. `npx wrangler secret put ADMIN_PASSWORD` : entrer un mot de passe aléatoire
   d’au moins 24 caractères. Ne jamais le mettre dans Git ni dans le JavaScript public.
5. `npx wrangler deploy`
6. Vérifier le contrat de sous-traitance et les traitements techniques Cloudflare,
   les journaux désactivés, la juridiction EU de D1, l’absence de réutilisation des
   données, la tâche de purge, puis tester une collecte depuis le vrai site.
7. Mettre l’URL HTTPS du Worker suivie de `/collect` dans
   `../nana-analytics-config.js` et publier ce fichier.
8. Ouvrir l’URL racine du Worker : utilisateur `lena`, mot de passe ci-dessus.
   Vérifier que l’accès sans authentification reste refusé.

L’origine autorisée est `https://2v7f422k6b-pixel.github.io`. Adapter `SITE_ORIGIN`
si le portfolio change de domaine. Ne pas ajouter d’autres sites à la collecte.

## Sélection du 10 novembre 2026

Mesures retenues : **1, 2, 4, 6, 9, 10, 12, 14, 16, 17, 18, 24, 25, 28,
29, 30, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 50, 51, 53**.
Le catalogue partagé `metrics.json` / `nana-analytics-catalog.js` est l’allowlist
exacte. Après modification du JSON, exécuter
`node scripts/sync-analytics-catalog.mjs` depuis la racine. Aucune heure, langue, thème, sauvegarde de look ou profil de visiteur.
Le protocole v2 refuse les anciens événements et tout champ supplémentaire.

- Totaux quotidiens et périodes de 7, 30 ou 90 jours. Les iframes utilisent le
  collecteur parent. Pas de relecture du carnet ni de migration des actions passées.
- Temps actif : page visible et dernière interaction il y a moins de 60 secondes,
  plafond de 30 minutes par ouverture. Le tableau moyenne les périodes observées,
  pas les visiteurs. Les fermetures brutales peuvent perdre la dernière durée.
- Fin et sortie avant fin : latte servi (étape 5) et pause du club du rien terminée.
  Les activités libres n’ont pas de fin inventée. Le fortune cookie est une
  notification temporaire : ouverture comptée, durée non mesurée.
- Vidéo : durée réellement parcourue en lecture, sans compter un saut de lecture ;
  paliers 25/50 % et fin atteinte après au moins 95 % de durée regardée.
- Livre : pages réellement affichées, pas préchargées ; dernière page affichée
  ne signifie pas lecture complète. Pages/onglets/paliers au plus une fois par
  chargement principal pour limiter le bruit.
- Perles : nouvelle composition, reprise, tailles par tranches, accrochage au
  téléphone. Aucun export perles n’existe actuellement. Le poème est composé
  manuellement : compter les nouveaux poèmes sauvegardés, pas une génération IA.
- Export : déclenchement d’un téléchargement, sans confirmation du système.
- Formulaires : succès HTTP ou échec uniquement, jamais contenu ni coordonnées.
- Provenance : catégories de domaines connus, sans chemin, paramètres ou URL
  brute ; absence de référent et navigation interne regroupées en indéterminé.
- Pays : `request.cf.country`, seulement sur `site/open`, sans IP stockée et
  sans association aux autres compteurs. Pays <10 ouvertures regroupés dans
  l’affichage. Ne pas segmenter les activités par pays, appareil ou provenance.
- Erreurs : catégories prédéfinies seulement, aucune URL, exception ou pile.
- **24 CV et 41 achat : à relier.** Le CV n’a pas de document réel lié et le shop
  n’a pas de liens de paiement. Le tableau l’indique au lieu d’afficher de faux
  zéros. Attributs réservés pour leurs futurs vrais liens :
  `data-analytics-cv="open"`, `data-analytics-cv="download"`, `data-analytics-buy`.

Avant activation, déployer le Worker v2 avec le nouveau `schema.sql` (table
`daily_metrics`). Si un prototype a été déployé ailleurs, supprimer son ancienne
table `counters` après export éventuel : ses mesures ne sont plus utilisées.
La configuration publique reste vide. Cette implémentation ne remplace pas la
vérification du contrat et du déploiement effectif du prestataire avant activation.
