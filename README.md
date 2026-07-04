# TMDB Favorites API

Backend REST API for searching movies on TMDB, managing favorites, marking movies as watched, and rating them.

Built with Node.js and TypeScript.

## Technologies

- Express
- PostgreSQL
- Prisma
- Redis
- Docker Compose
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

```
controller → service → repository
```

Modules: `movies`, `favorites`, `tmdb`, `cache`.

Detailed architecture documentation will be added as the project evolves.

## Technical decisions

### Prisma version

This project uses **Prisma 6.x** intentionally. Prisma 7 changed datasource
configuration in a breaking way; for this time-boxed challenge, v6 keeps setup
stable and reproducible without sacrificing a production-ready stack.

## Assumptions

- Single-user API (no authentication)
- Business identifier in routes: `tmdbId`

## Roadmap

- [x] Project setup
- [ ] TMDB integration
- [ ] Movie search
- [ ] Favorites (add / remove / list)
- [ ] Watched status
- [ ] Rating
- [ ] Swagger documentation
- [ ] Unit tests (business rules)
- [ ] Redis cache + retry + structured logs
- [ ] Integration tests + CI
