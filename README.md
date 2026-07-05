# TMDB Favorites API

Backend REST API for searching movies on TMDB, managing favorites, marking movies as watched, and rating them.

Built with Node.js and TypeScript.

## Technologies

- Express
- PostgreSQL
- Prisma
- Redis
- Docker Compose
- Swagger (OpenAPI)
- Jest
- ESLint + Prettier

## Prerequisites

- Node.js 20+
- Docker Desktop
- [TMDB API key](https://www.themoviedb.org/settings/api) (required from Commit 2)

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start PostgreSQL and Redis
docker compose up -d

# 4. Run migrations
# Note: Postgres uses host port 5433 (5432 may already be in use on macOS)
npm run db:migrate

# 5. Start the API in development mode
npm run dev
```

## API documentation

With the API running:

- Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)
- OpenAPI JSON: [http://localhost:3000/docs.json](http://localhost:3000/docs.json)

## Environment Variables

Create a `.env` file based on `.env.example` and provide your own TMDB API key.

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | API port (default: `3000`) |
| `NODE_ENV` | Environment (`development`, `production`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `TMDB_API_KEY` | Your TMDB API key — get one at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| `TMDB_BASE_URL` | TMDB API base URL (`https://api.themoviedb.org/3`) |

Example `.env` (use your own values):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/movies_db?schema=public
REDIS_URL=redis://localhost:6379
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
```

Never commit the `.env` file. Credentials stay local only.

## Health check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-07-04T12:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "not_configured"
  }
}
```

## Movie search

```bash
curl "http://localhost:3000/movies/search?q=matrix"
```

Optional pagination:

```bash
curl "http://localhost:3000/movies/search?q=matrix&page=1"
```

## Favorites

Add a favorite (snapshot is saved locally from TMDB):

```bash
curl -X POST http://localhost:3000/favorites \
  -H "Content-Type: application/json" \
  -d '{"tmdbId": 603}'
```

List favorites (enriched from TMDB when available):

```bash
curl http://localhost:3000/favorites
```

When TMDB is unavailable, the API returns local snapshots with `"degraded": true`.
When only a specific movie cannot be enriched (for example, 404 on TMDB), that item
is returned with `"enriched": false` while the rest of the list may still be enriched.

Remove a favorite:

```bash
curl -X DELETE http://localhost:3000/favorites/603
```

Mark as watched:

```bash
curl -X PATCH http://localhost:3000/favorites/603/watched
```

Calling the watched endpoint more than once updates the `watchedAt` timestamp,
keeping the operation idempotent from the client perspective.

Rate a watched movie:

```bash
curl -X PATCH http://localhost:3000/favorites/603/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 9.5}'
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start compiled API |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma Client |

## Architecture

The project follows a modular layered architecture:

```
controller → service → repository
```

### Modules

| Module | Responsibility |
|---|---|
| `movies` | Movie search orchestration |
| `favorites` | Favorites CRUD and business rules |
| `tmdb` | TMDB HTTP client, mapping and error handling |
| `cache` | Redis cache (planned) |

### Request flow

```mermaid
flowchart LR
  Client --> Controller
  Controller --> Service
  Service --> Repository
  Service --> TmdbClient
  Repository --> PostgreSQL
  TmdbClient --> TMDB
```

### Degraded favorites listing

When listing favorites, the API tries to enrich each item from TMDB.
If TMDB is unavailable (timeout, network error, 503), the API returns local
snapshots with `degraded: true` and `enriched: false` for all items.
If only a specific movie fails (for example, 404), only that item is returned
with `enriched: false`.

## Technical decisions

### Stack

- **Express + TypeScript** for a simple and familiar HTTP layer
- **PostgreSQL + Prisma** for relational data and constraints (`tmdbId` unique)
- **Axios + Zod** for TMDB integration and request validation
- **Swagger UI** for API documentation

### Prisma version

This project uses **Prisma 6.x** intentionally. Prisma 7 changed datasource
configuration in a breaking way; for this time-boxed challenge, v6 keeps setup
stable and reproducible without sacrificing a production-ready stack.

## Assumptions

- Single-user API (no authentication)
- Business identifier in routes: `tmdbId`

## Roadmap

- [x] Project setup
- [x] TMDB integration
- [x] Movie search
- [x] Favorites (add / remove / list)
- [x] Watched status
- [x] Rating
- [x] Swagger documentation
- [ ] Unit tests (business rules)
- [ ] Redis cache + retry + structured logs
- [ ] Integration tests + CI
