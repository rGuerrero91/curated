FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Development ───────────────────────────────────────────────
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000

# ── Builder ───────────────────────────────────────────────────
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

# ── Production ────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "dist/app.js"]
