/**
 * Rate limiting plugin.
 *
 * Uses @fastify/rate-limit backed by Redis. Applies a global limit of
 * 200 req/min per IP. Individual routes can override this with their own
 * config (e.g. the auth session endpoint uses a stricter 10 req/min).
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import fastifyRateLimit from '@fastify/rate-limit'
import { redis } from '../lib/redis.js'

async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyRateLimit, {
    max: 200,
    timeWindow: '1 minute',
    redis,
    keyGenerator: (req) =>
      req.user?.userId ?? req.headers['x-forwarded-for']?.toString() ?? req.ip,
  })
}

export default fp(rateLimitPlugin, { name: 'rateLimit' })
