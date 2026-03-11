/**
 * Follows module routes.
 *
 * User-to-user follows and user-to-collection follows.
 * All actions require authentication.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { followUser, unfollowUser, followCollection, unfollowCollection } from './follows.service.js'

async function followsRoutes(fastify: FastifyInstance) {
  // POST /users/:username/follow [auth]
  fastify.post('/users/:username/follow', { preHandler: requireAuth }, async (req, reply) => {
    const { username } = req.params as { username: string }
    const result = await followUser(req.user!.userId, username)
    if (!result) return reply.status(404).send({ error: 'User not found' })
    return reply.status(201).send(result)
  })

  // DELETE /users/:username/follow [auth]
  fastify.delete('/users/:username/follow', { preHandler: requireAuth }, async (req, reply) => {
    const { username } = req.params as { username: string }
    await unfollowUser(req.user!.userId, username)
    return reply.status(204).send()
  })

  // POST /collections/:id/follow [auth]
  fastify.post('/collections/:id/follow', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const result = await followCollection(req.user!.userId, collectionId)
    if (!result) return reply.status(404).send({ error: 'Collection not found' })
    return reply.status(201).send(result)
  })

  // DELETE /collections/:id/follow [auth]
  fastify.delete('/collections/:id/follow', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    await unfollowCollection(req.user!.userId, collectionId)
    return reply.status(204).send()
  })
}

export default fp(followsRoutes, { name: 'follows' })
