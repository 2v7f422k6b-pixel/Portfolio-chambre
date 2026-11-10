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

## Périmètre

- Un total par jour (Europe/Paris) et nom de compteur ; purge après 90 jours.
- Pages ouvertes, routes d’ateliers et d’objets reconnues par NanaProgress,
  nouveau look enregistré et quelques étapes d’activité. Les routes non
  répertoriées dans l’allowlist serveur sont refusées.
- `latte-made` signifie que l’étape dessin est atteinte ; `beads-made` signifie
  au moins trois perles enfilées. Ce ne sont pas des compteurs d’envois de latte
  ni de bracelets explicitement terminés.
- Sauf nouveau look, un même compteur compte au plus une fois par chargement
  de la page principale. Les iframes utilisent le collecteur du parent.
- Aucun visiteur unique, session persistante, parcours, provenance, localisation,
  identité, création, vêtement, texte saisi ou adresse mail. Aucun historique
  local de mesure, rattrapage des actions passées ou cookies de mesure.
- Désactivation disponible dans `confidentialite.html`, liée depuis l’aide.
  La préférence locale est le seul stockage de la mesure. DNT/GPC sont respectés.
- Les sessions admin, éditeurs et aperçus connus sont exclus au moment de l’envoi.
- Le tableau ne contient que des sommes. Les requêtes transportent nécessairement
  une IP chez l’hébergeur ; le code ne la lit pas et les logs applicatifs sont
  désactivés. Une base EU ne signifie pas que tout traitement Cloudflare est EU.
- Les compteurs restent approximatifs : bloqueurs, réseau, rechargements, visites
  automatisées, plusieurs appareils. Le contrôle d’origine évite les envois depuis
  d’autres pages web, mais ne constitue pas une protection contre des clients
  malveillants. Configurer les limites de consommation du compte avant activation.

Sources :
- https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience
- https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ
- https://developers.cloudflare.com/d1/configuration/data-location/

L’exemption de consentement dépend du périmètre et du déploiement effectifs ;
l’absence de cookies ne suffit pas à certifier un service conforme. La notice
couvre cette mesure, sans remplacer une politique complète des formulaires et
prestataires du site. Aucun nouveau message ni aucune validation de fin de jeu.
