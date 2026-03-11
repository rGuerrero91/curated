# Curated — Frontend Quickstart

This guide gets the backend API running locally so you can develop the frontend against it.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose)
- [Node.js 22+](https://nodejs.org/) and npm
- Firebase project credentials (ask your backend collaborator)

## 1. Clone & install

```bash
git clone <repo-url> curated
cd curated
npm install
```

## 2. Configure the backend environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Open `apps/backend/.env` and fill in:

| Variable                | Where to get it                                                   |
| ----------------------- | ----------------------------------------------------------------- |
| `SESSION_SECRET`        | Run `openssl rand -hex 32` in your terminal                       |
| `FIREBASE_PROJECT_ID`   | Firebase Console → Project Settings                               |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Service Accounts → Generate key                |
| `FIREBASE_PRIVATE_KEY`  | Same JSON file as above                                           |
| `OPENAI_API_KEY`        | Ask your backend collaborator (or skip — AI features won't work)  |
| `R2_*`                  | Ask your backend collaborator (or skip — file uploads won't work) |

Everything else (`DATABASE_URL`, `REDIS_URL`, `TYPESENSE_*`) is pre-configured for the local Docker setup and does not need to change.

## 3. Start the backend

```bash
docker-compose up
```

This starts five services:

| Service     | URL                   | Purpose                                          |
| ----------- | --------------------- | ------------------------------------------------ |
| `app`       | http://localhost:3000 | Fastify REST API                                 |
| `postgres`  | localhost:5432        | Database                                         |
| `redis`     | localhost:6379        | Cache + job queue                                |
| `typesense` | localhost:8108        | Search engine                                    |
| `worker`    | —                     | Background jobs (link scraping, AI, search sync) |

First boot takes a minute while Docker pulls images. Wait until you see:

```
app    | Fastify listening on 0.0.0.0:3000
```

## 4. Run the database migration

In a second terminal (only needed the first time, or after schema changes):

```bash
cd apps/backend
npm run db:migrate
```

## 5. Verify everything is working

```bash
# Health check
curl http://localhost:3000/health

# API docs (Swagger UI)
open http://localhost:3000/docs
```

The Swagger UI at `/docs` documents every endpoint and lets you test them interactively.

## Useful commands

```bash
# Stop all services
docker-compose down

# Stop and wipe the database (fresh start)
docker-compose down -v

# View backend logs only
docker-compose logs -f app

# View worker logs
docker-compose logs -f worker

# Open Prisma Studio (database browser)
cd apps/backend && npm run db:studio
```

## API Overview

Base URL: `http://localhost:3000/api/v1`

**Auth flow:**

1. Authenticate with Firebase on the client → receive a Firebase ID token
2. `POST /api/v1/auth/session` with `Authorization: Bearer <token>` → receives a session cookie
3. All subsequent requests use the cookie automatically

**Key endpoints:**

```
POST   /api/v1/auth/session         Log in (exchange Firebase token for session cookie)
DELETE /api/v1/auth/session         Log out
GET    /api/v1/auth/me              Current user

GET    /api/v1/users/:username      Public profile
PATCH  /api/v1/users/me             Update your profile

GET    /api/v1/collections          Discovery feed
POST   /api/v1/collections          Create a collection [auth]
GET    /api/v1/collections/:id      Collection detail

GET    /api/v1/feed                 Personalized feed [auth]
GET    /api/v1/trending             Trending collections
GET    /api/v1/search?q=            Search collections and links

POST   /api/v1/links                Submit a link [auth]
GET    /api/v1/upload/signed-url    Get R2 presigned URL for file upload [auth]
```

See `/docs` for the full reference.

## Troubleshooting

**Port already in use** — stop any local Postgres/Redis instances, or change the host ports in `docker-compose.yml`.

**`db:migrate` fails** — make sure `docker-compose up` is running first (the app container needs the database to be healthy).

**Firebase errors on `POST /auth/session`** — double-check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` in `apps/backend/.env`. The private key must preserve literal `\n` newlines (keep it quoted as in the example).
