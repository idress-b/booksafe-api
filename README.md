# BookSafe API

API REST de réservation de ressources partagées : salles de réunion,
véhicules et bureaux.

Le projet répond à un problème métier simple, mais sensible : empêcher qu’une
même ressource soit réservée deux fois sur des créneaux qui se chevauchent.
BookSafe est conçu comme un projet portfolio NestJS, avec une attention
particulière portée à la cohérence des données sous concurrence.

## Le point technique clé : zéro double réservation

La règle de non-chevauchement est garantie par PostgreSQL, pas seulement par
une vérification applicative. La table `reservations` possède une contrainte
d’exclusion GiST :

```sql
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
)
```

- `resource_id WITH =` limite la règle à une même ressource ;
- `tstzrange(..., '[)')` représente un créneau avec début inclus et fin
  exclue ;
- `&&` détecte l’intersection entre deux créneaux.

Ainsi, `09:00–10:00` et `10:00–11:00` sont autorisés, tandis que
`09:00–10:00` et `09:30–10:30` sont refusés.

Cette garantie reste fiable même si plusieurs requêtes arrivent simultanément :
PostgreSQL accepte une réservation et refuse les autres. L’erreur SQLSTATE
`23P01` (`exclusion_violation`) est traduite par l’API en `409 Conflict`.

L’extension PostgreSQL `btree_gist` est requise pour combiner l’égalité sur la
ressource et la plage temporelle dans l’index GiST. La migration initiale la
crée avec `CREATE EXTENSION IF NOT EXISTS "btree_gist"`.

## Stack

- Node.js 24 LTS
- NestJS 12, TypeScript strict et ESM
- PostgreSQL 17 avec Docker Compose
- TypeORM et migrations versionnées
- Vitest
- `class-validator` et `class-transformer`

## Démarrage local

### Prérequis

- Node.js 24 LTS
- Docker et Docker Compose

### Installation

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:migration:run
npm run start:dev
```

L’API écoute par défaut sur `http://localhost:3000`.

Vérifier son état :

```bash
curl http://localhost:3000/health
```

> Ne versionnez jamais `.env`, `node_modules` ou `dist`.

## Configuration

Le fichier `.env` est ignoré par Git. Il doit contenir les variables suivantes :

```dotenv
POSTGRES_DB=booksafe
POSTGRES_USER=booksafe
POSTGRES_PASSWORD=change_me
POSTGRES_PORT=5432
```

`POSTGRES_HOST` est optionnel et vaut `localhost` par défaut.

## Endpoints disponibles

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | État de l’API |
| `POST` | `/resources` | Crée une ressource |
| `GET` | `/resources` | Liste les ressources |
| `GET` | `/resources/:id` | Récupère une ressource |
| `POST` | `/reservations` | Crée une réservation |
| `GET` | `/reservations` | Liste les réservations |

### Créer une ressource

```bash
curl -X POST http://localhost:3000/resources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Salle Atlas",
    "type": "meeting_room",
    "capacity": 8
  }'
```

Les valeurs possibles pour `type` sont `meeting_room`, `vehicle` et `desk`.

### Créer une réservation

```bash
curl -X POST http://localhost:3000/reservations \
  -H 'Content-Type: application/json' \
  -d '{
    "resourceId": 1,
    "startAt": "2026-10-25T09:00:00Z",
    "endAt": "2026-10-25T10:00:00Z"
  }'
```

Les dates sont validées et `startAt` doit être strictement antérieur à `endAt`.
Une ressource inexistante retourne `404 Not Found` ; un chevauchement retourne
`409 Conflict`.

## Migrations

Le schéma n’est jamais synchronisé automatiquement :
`synchronize: false`. Toute évolution de structure passe par une migration
versionnée.

```bash
# Voir l’état des migrations
npm run db:migration:show

# Générer une migration après modification des entités
npm run db:migration:generate -- src/database/migrations/DescriptiveName

# Appliquer les migrations en attente
npm run db:migration:run

# Annuler la dernière migration appliquée
npm run db:migration:revert
```

`db:migration:revert` peut supprimer ou modifier des données selon le contenu
de la migration : à utiliser avec prudence, en particulier en production.

## Tests et qualité

```bash
npm test
npm run lint
npm run build
```

Les tests unitaires couvrent notamment la traduction de la violation
d’exclusion PostgreSQL (`23P01`) en réponse HTTP `409`.

## Évolutions prévues

- Authentification et autorisation
- Annulation et modification de réservations
- Tests end-to-end avec PostgreSQL
- Pagination et filtres de disponibilité
- CI et déploiement
