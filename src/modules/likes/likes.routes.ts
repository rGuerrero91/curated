/**
 * Likes module routes.
 *
 * Like and unlike a collection. Uses upsert so repeated likes are idempotent.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { likeCollection, unlikeCollection } from './likes.service.js'

async function likesRoutes(fastify: FastifyInstance) {
  // POST /collections/:id/like [auth]
  fastify.post('/collections/:id/like', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const result = await likeCollection(req.user!.userId, collectionId)
    if (!result) return reply.status(404).send({ error: 'Collection not found' })
    return reply.status(201).send(result)
  })

  // DELETE /collections/:id/like [auth]
  fastify.delete('/collections/:id/like', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    await unlikeCollection(req.user!.userId, collectionId)
    return reply.status(204).send()
  })
}

export default fp(likesRoutes, { name: 'likes' })
