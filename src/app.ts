/**
 * Fastify application entry point.
 *
 * Registers all plugins and route modules, then starts the HTTP server.
 * The worker process (src/workers/index.ts) shares lib/ and config/ but
 * does NOT import this file — it runs BullMQ workers independently.
 */
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import { env } from './config/env.js'
import { ensureTypesenseCollections } from './lib/typesense.js'

// Plugins
import swaggerPlugin from './plugins/swagger.js'
import rateLimitPlugin from './plugins/rateLimit.js'
import authPlugin from './plugins/auth.js'

// Route modules
import usersRoutes from './modules/users/users.routes.js'
import collectionsRoutes from './modules/collections/collections.routes.js'
import linksRoutes from './modules/links/links.routes.js'
import commentsRoutes from './modules/comments/comments.routes.js'
import followsRoutes from './modules/follows/follows.routes.js'
import likesRoutes from './modules/likes/likes.routes.js'
import tagsRoutes from './modules/tags/tags.routes.js'
import discoveryRoutes from './modules/discovery/discovery.routes.js'
import aiRoutes from './modules/ai/ai.routes.js'
import uploadRoutes from './modules/upload/upload.routes.js'

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

// ── Plugins ────────────────────────────────────────────────────

await fastify.register(fastifyCors, {
  origin: env.NODE_ENV === 'production' ? ['https://curated.app'] : true,
  credentials: true,
})

await fastify.register(fastifyCookie)
await fastify.register(swaggerPlugin)
await fastify.register(rateLimitPlugin)

// ── Routes ─────────────────────────────────────────────────────

const API_PREFIX = '/api/v1'

await fastify.register(authPlugin, { prefix: API_PREFIX })
await fastify.register(usersRoutes, { prefix: API_PREFIX })
await fastify.register(collectionsRoutes, { prefix: API_PREFIX })
await fastify.register(linksRoutes, { prefix: API_PREFIX })
await fastify.register(commentsRoutes, { prefix: API_PREFIX })
await fastify.register(followsRoutes, { prefix: API_PREFIX })
await fastify.register(likesRoutes, { prefix: API_PREFIX })
await fastify.register(tagsRoutes, { prefix: API_PREFIX })
await fastify.register(discoveryRoutes, { prefix: API_PREFIX })
await fastify.register(aiRoutes, { prefix: API_PREFIX })
await fastify.register(uploadRoutes, { prefix: API_PREFIX })

// ── Health check ───────────────────────────────────────────────

fastify.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

// ── Startup ────────────────────────────────────────────────────

try {
  await ensureTypesenseCollections()
  await fastify.listen({ port: env.PORT, host: env.HOST })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
