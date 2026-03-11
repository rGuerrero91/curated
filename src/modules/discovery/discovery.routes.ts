/**
 * Discovery module routes.
 *
 * - /search   Full-text search via Typesense
 * - /feed     Personalized feed of collections from followed users/collections
 * - /trending Top collections by like+follow velocity over the last 7 days
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { search, getPersonalizedFeed, getTrending } from './discovery.service.js'

async function discoveryRoutes(fastify: FastifyInstance) {
  // GET /search?q=&type=collections|links&tags=&page=
  fastify.get('/search', async (req, reply) => {
    const query = req.query as {
      q?: string
      type?: 'collections' | 'links'
      tags?: string
      page?: string
      limit?: string
    }
    return reply.send(await search(query))
  })

  // GET /feed — personalized feed [auth]
  fastify.get('/feed', { preHandler: requireAuth }, async (req, reply) => {
    const query = req.query as { cursor?: string; limit?: string }
    return reply.send(await getPersonalizedFeed(req.user!.userId, query))
  })

  // GET /trending — public, no auth required
  fastify.get('/trending', async (req, reply) => {
    const query = req.query as { limit?: string }
    return reply.send(await getTrending(query))
  })
}

export default fp(discoveryRoutes, { name: 'discovery' })
