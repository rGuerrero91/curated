/**
 * Collections module routes.
 *
 * CRUD for collections, cover photo management, reordering items,
 * and like/follow actions. Owner-only write operations are checked
 * in the service layer after requireAuth confirms a session exists.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderItems,
  setCollectionCover,
  removeCollectionCover,
} from './collections.service.js'

async function collectionsRoutes(fastify: FastifyInstance) {
  // GET /collections — discovery feed (cursor-paginated, filterable by tag)
  fastify.get('/collections', async (req, reply) => {
    const query = req.query as { cursor?: string; limit?: string; tag?: string }
    return reply.send(await listCollections(query))
  })

  // POST /collections [auth]
  fastify.post('/collections', { preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as { title: string; description?: string; isPublic?: boolean; tags?: string[] }
    const collection = await createCollection(req.user!.userId, body)
    return reply.status(201).send(collection)
  })

  // GET /collections/:id
  fastify.get('/collections/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const collection = await getCollection(id)
    if (!collection) return reply.status(404).send({ error: 'Collection not found' })
    return reply.send(collection)
  })

  // PATCH /collections/:id [auth, owner]
  fastify.patch('/collections/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as { title?: string; description?: string; isPublic?: boolean; aiEnabled?: boolean; tags?: string[] }
    const updated = await updateCollection(id, req.user!.userId, body)
    if (!updated) return reply.status(404).send({ error: 'Collection not found or not owner' })
    return reply.send(updated)
  })

  // DELETE /collections/:id [auth, owner]
  fastify.delete('/collections/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const deleted = await deleteCollection(id, req.user!.userId)
    if (!deleted) return reply.status(404).send({ error: 'Collection not found or not owner' })
    return reply.status(204).send()
  })

  // PATCH /collections/:id/items — bulk reorder [auth, owner]
  fastify.patch('/collections/:id/items', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { order } = req.body as { order: Array<{ id: string; position: number }> }
    await reorderItems(id, req.user!.userId, order)
    return reply.status(204).send()
  })

  // PATCH /collections/:id/cover — set cover photo URL after R2 upload [auth, owner]
  fastify.patch('/collections/:id/cover', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { coverUrl } = req.body as { coverUrl: string }
    const updated = await setCollectionCover(id, req.user!.userId, coverUrl)
    if (!updated) return reply.status(404).send({ error: 'Collection not found or not owner' })
    return reply.send(updated)
  })

  // DELETE /collections/:id/cover [auth, owner]
  fastify.delete('/collections/:id/cover', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const updated = await removeCollectionCover(id, req.user!.userId)
    if (!updated) return reply.status(404).send({ error: 'Collection not found or not owner' })
    return reply.send(updated)
  })
}

export default fp(collectionsRoutes, { name: 'collections' })
