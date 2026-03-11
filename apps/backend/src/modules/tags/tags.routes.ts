/**
 * Tags module routes.
 *
 * Browse popular tags and list collections under a given tag.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { listPopularTags, getCollectionsByTag } from './tags.service.js'

async function tagsRoutes(fastify: FastifyInstance) {
  // GET /tags — popular tags ordered by collection count
  fastify.get('/tags', async (_req, reply) => {
    return reply.send(await listPopularTags())
  })

  // GET /tags/:name/collections
  fastify.get('/tags/:name/collections', async (req, reply) => {
    const { name } = req.params as { name: string }
    const query = req.query as { cursor?: string; limit?: string }
    return reply.send(await getCollectionsByTag(name, query))
  })
}

export default fp(tagsRoutes, { name: 'tags' })
