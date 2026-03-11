# Curated

A social network for saving and sharing website links. Users build collections, follow others, and discover content through a curated feed.

## Monorepo Structure

```
apps/
  backend/    # Fastify REST API + BullMQ workers
  frontend/   # (coming soon)
```

## Getting Started

| Role | Start here |
|---|---|
| Frontend dev | [apps/frontend/README.md](apps/frontend/README.md) |
| Backend dev | [CLAUDE.md](CLAUDE.md) |

## Quick Commands

```bash
# Install all workspace dependencies
npm install

# Start the full backend stack (API + workers + DB + Redis + search)
docker-compose up

# Run backend in dev mode (outside Docker)
npm run dev:backend
```

## Stack

TypeScript · Fastify · PostgreSQL · Prisma · Redis · BullMQ · Typesense · Cloudflare R2 · Firebase Auth · OpenAI
