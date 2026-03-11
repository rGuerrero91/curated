# Curated — Monorepo

Social network where users save website links to an Instagram-like profile feed. Users create collections, discover/follow/comment on others' collections, and like content. AI-powered link suggestions within collections is a stretch goal.

## Repo Structure

```
curated/
├── apps/
│   ├── backend/          # Fastify API + BullMQ workers
│   └── frontend/         # (not yet scaffolded)
├── docker-compose.yml    # local dev: postgres, redis, typesense, app, worker
├── package.json          # npm workspaces root
└── .prettierrc
```

Root scripts: `dev:backend`, `dev:frontend`, `build`, `test`, `lint`, `format`
Backend workspace name: `@curated/backend`

## Backend Stack (`apps/backend/`)

| Concern | Choice |
|---|---|
| Language | TypeScript / Node.js |
| Framework | Fastify 5 |
| Database | PostgreSQL + Prisma ORM |
| Auth | Firebase Admin (token verify) + iron-session (encrypted HttpOnly cookie) |
| Cache | Redis via ioredis |
| Job queue | BullMQ on Redis |
| Search | Typesense |
| File storage | Cloudflare R2 (S3-compatible) |
| AI | OpenAI gpt-4o-mini |
| Validation | TypeBox for route schemas; Zod only for `env.ts` |

**Auth note:** iron-session is used instead of Auth.js/@auth/core — simpler Fastify pairing, no adapter layer. Firebase handles identity; iron-session seals `{ userId, username }` into a stateless cookie. No Redis session store needed.

**Validation note:** TypeBox generates JSON Schema natively for Fastify route schemas (no runtime Zod parse per request). Zod is only used in `src/config/env.ts` for startup env validation.

## Backend Source Layout (`apps/backend/src/`)

```
config/env.ts               # zod-validated env vars (fail-fast at startup)
lib/
  prisma.ts                 # singleton PrismaClient
  redis.ts                  # singleton ioredis
  r2.ts                     # S3Client → Cloudflare R2
  typesense.ts
  openai.ts
  firebase-admin.ts
plugins/
  auth.ts                   # Firebase token verify + iron-session cookie
  rateLimit.ts
  swagger.ts
modules/
  users/ collections/ links/ comments/ follows/ likes/ tags/ discovery/ ai/ upload/
  # each: routes.ts + service.ts; exported as fastify-plugin
workers/
  index.ts                  # worker process entry (separate from web)
  queues.ts                 # shared BullMQ queue definitions
  link-scraper.worker.ts
  ai-suggestions.worker.ts
  search-sync.worker.ts
  notifications.worker.ts
app.ts                      # Fastify composition root
```

## Database Schema (Key Entities)

- **User** — id (cuid), firebaseUid, username (citext), displayName, bio, avatarUrl, isPrivate
- **Collection** — id, ownerId→User, slug, title, description, coverUrl, isPublic, aiEnabled
- **Link** — id, submittedBy→User, url, domain, title, description, thumbnailUrl, scrapedAt *(de-duplicated — one Link can belong to many collections)*
- **CollectionItem** — collectionId, linkId, note, position *(join table with ordering)*
- **Comment** — id, authorId, collectionId, parentId? (one level of threading), body
- **Like** — composite PK (userId, collectionId)
- **Follow** — composite PK (followerId, followingId)
- **CollectionFollow** — composite PK (userId, collectionId)
- **Tag + CollectionTag** — many-to-many, citext names
- **AISuggestion** — id, collectionId, url, title, reasoning, dismissed

DB image: `pgvector/pgvector:pg17` (embeddings-ready from day one).

## API Routes (`/api/v1`)

```
# Auth
POST   /auth/session          Exchange Firebase ID token → session cookie
DELETE /auth/session          Logout
GET    /auth/me               Current user

# Users
GET    /users/:username
GET    /users/:username/collections
PATCH  /users/me
POST/DELETE /users/:username/follow

# Collections
GET    /collections           Discovery feed (tag filter, cursor paginated)
POST   /collections           [auth]
GET/PATCH/DELETE /collections/:id
POST/DELETE /collections/:id/like
POST   /collections/:id/follow
PATCH  /collections/:id/items   Reorder [auth, owner]

# Links
POST   /links                 Submit → triggers scraper job [auth]
POST   /collections/:id/items
DELETE /collections/:id/items/:itemId

# Comments
GET/POST /collections/:id/comments   (cursor paginated)
DELETE   /collections/:id/comments/:cid

# Discovery
GET /search?q=&type=&tags=    Typesense search
GET /feed                     Personalized feed (followed users/collections)
GET /trending                 Top collections by like+follow velocity (7d)

# AI
GET    /collections/:id/suggestions
DELETE /collections/:id/suggestions/:sid
POST   /collections/:id/suggestions/refresh

# Upload
GET /upload/signed-url?resource=   Returns R2 presigned PUT URL
```

## Auth Flow

1. Client authenticates via Firebase Auth SDK → Firebase ID token (JWT, 1h TTL)
2. `POST /auth/session` with `Authorization: Bearer <token>`
3. Server: `firebaseAdmin.auth().verifyIdToken()` → `{ uid, email }`
4. Server: upsert User in Postgres
5. Server: iron-session seals `{ userId, username }` into HttpOnly encrypted cookie
6. Subsequent requests: cookie → iron-session unseals → `req.user` attached
7. Token refresh: Firebase refreshes silently on client; client re-calls `POST /auth/session`

## BullMQ Worker Queues

| Queue | Trigger | Job |
|---|---|---|
| `link-scraper` | Link created | Scrape OG metadata, download+WebP thumbnail → R2, update Link row |
| `ai-suggestions` | Collection reaches 3+ links | Send context to OpenAI, store AISuggestion rows |
| `search-sync` | Collection/link write | Upsert Typesense document |
| `notifications` | Follow/like/comment | Fan-out to followers (capped for large accounts) |

One Docker image, two container roles: `app` (web, `npm run dev`) and `worker` (`npm run worker`).

## Dev Commands

```bash
# from repo root
npm run dev:backend       # start backend (tsx watch)
docker-compose up         # start postgres, redis, typesense, app, worker

# from apps/backend/
npm run db:migrate        # prisma migrate dev
npm run db:studio         # prisma studio
npm run db:seed           # prisma/seed.ts
npm run test              # vitest run
npm run build             # tsc
```

## Implementation Order (Backend)

1. `prisma/schema.prisma`
2. `src/config/env.ts`
3. `src/lib/*.ts` (singleton clients)
4. `src/plugins/auth.ts`
5. `src/workers/queues.ts`
6. `src/app.ts`
7. Modules: users → collections → links → comments → discovery → ai

## Production

- Postgres + Redis: managed services
- Typesense: Typesense Cloud
- App/worker: Railway or Fly.io with `prisma migrate deploy` as release command
