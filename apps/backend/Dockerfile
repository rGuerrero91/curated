FROM node:22-alpine AS base
WORKDIR /app
# Copy workspace manifests only — layer-cached until deps change
COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/

# ── Development ───────────────────────────────────────────────
FROM base AS development
RUN npm ci
COPY apps/backend/prisma/ ./apps/backend/prisma/
RUN npx prisma generate --schema ./apps/backend/prisma/schema.prisma
COPY apps/backend/ ./apps/backend/
EXPOSE 3000

# ── Builder ───────────────────────────────────────────────────
FROM base AS builder
RUN npm ci
COPY apps/backend/ ./apps/backend/
RUN npm run build -w @curated/backend
RUN npm run db:generate -w @curated/backend

# ── Production ────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --omit=dev

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
WORKDIR /app/apps/backend
CMD ["node", "dist/app.js"]
