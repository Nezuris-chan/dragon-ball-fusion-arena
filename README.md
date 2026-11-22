# Dragon Ball Fusion Arena

Jeu de combat 2D jouable dans un navigateur, construit en JavaScript natif, Canvas et Web Audio. Aucun bundler ni framework n'est nécessaire.

## Lancer en local

Depuis la racine du dépôt :

```bash
python -m http.server 8000
```

Ouvre ensuite https://nezuris-chan.github.io/dragon-ball-fusion-arena/ dans ton navigateur. Utilise un serveur HTTP local plutôt que d'ouvrir directement `index.html`.

## Organisation

- `index.html` : point d'entrée et ordre de chargement des scripts.
- `css/` : interface, menus et styles.
- `js/core/` : initialisation, sauvegarde locale et configuration Supabase publique.
- `js/characters/` : roster et données des combattants.
- `js/combat/` : simulation du combat et données de combat.
- `js/story/` : sagas, chapitres et progression histoire.
- `js/systems/` : progression, commandes, rendu et systèmes transverses.
- `js/online/` : compte, matchmaking, classement et réseau.
- `supabase/migrations/` : historique SQL versionné.
- `supabase/functions/online-match/` : Edge Function des matchs classés.

## Supabase

Le navigateur utilise uniquement l'URL du projet et sa clé publishable, dans `js/core/bootstrap.js`. Ces valeurs publiques ne remplacent jamais RLS. **Ne place jamais la clé `service_role` dans le navigateur, le dépôt ou un fichier public.**

Projet lié : `djxbhgqggthruibiccss`.

```bash
supabase login
supabase link --project-ref djxbhgqggthruibiccss
supabase functions deploy online-match
```

Avant toute migration, compare les versions locales et distantes avec `supabase migration list`. L'historique local est réaligné sur les versions de production connues : `20261121133222`, `20261121133251`, `20261121165600`, `20261121165714`, puis `20261122091024`. N'utilise pas `supabase db push` si une version est inattendue ou manquante : arrête-toi et réconcilie l'historique.

## Progression et limites

- La sauvegarde d'histoire et d'aventure, les RP locaux et leur XP restent dans le navigateur.
- L'XP et le niveau **en ligne** sont stockés dans un registre serveur et calculés après confirmation concordante d'un match classé. Le navigateur ne peut plus écrire ces champs.
- Le serveur vérifie l'existence des profils avant de créer un match et n'attribue les récompenses qu'une seule fois par match.
- Limite importante : les deux clients simulent encore leur propre combat et s'accordent sur le résultat. Le serveur vérifie leur accord, pas chaque action de combat. Une collusion reste donc possible ; le combat en ligne n'est pas encore autoritaire côté serveur.
- Les gains XP d'histoire/aventure ne sont pas synchronisés avec l'XP en ligne, car ces victoires et récompenses ne sont pas vérifiées côté serveur.

## Tests manuels

1. Ouvrir le jeu en local, parcourir les menus et lancer un combat local.
2. Vérifier les commandes personnalisées et le rendu en qualité normale/réduite.
3. Créer un compte, se connecter, modifier le pseudo et ouvrir le classement mondial.
4. Tester un match classé avec deux comptes : inscription, deux confirmations concordantes, rating, victoires/défaites et XP en ligne.
5. Vérifier qu'un match ne distribue jamais deux fois ses XP et qu'un adversaire inexistant est refusé.
