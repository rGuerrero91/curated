/**
 * Links module routes.
 *
 * Submitting a new link triggers the link-scraper BullMQ job which
 * fetches Open Graph metadata asynchronously. Adding a link to a
 * collection creates a CollectionItem join record.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { submitLink, getLink, addToCollection, removeFromCollection } from './links.service.js'

async function linksRoutes(fastify: FastifyInstance) {
  // POST /links — submit a new link [auth]
  fastify.post('/links', { preHandler: requireAuth }, async (req, reply) => {
    const { url } = req.body as { url: string }
    const link = await submitLink(req.user!.userId, url)
    return reply.status(201).send(link)
  })

  // GET /links/:id
  fastify.get('/links/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const link = await getLink(id)
    if (!link) return reply.status(404).send({ error: 'Link not found' })
    return reply.send(link)
  })

  // POST /collections/:id/items — add a link to a collection [auth, owner]
  fastify.post('/collections/:id/items', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const { linkId, note } = req.body as { linkId: string; note?: string }
    const item = await addToCollection(collectionId, req.user!.userId, linkId, note)
    if (!item) return reply.status(403).send({ error: 'Not the collection owner or not found' })
    return reply.status(201).send(item)
  })

  // DELETE /collections/:id/items/:itemId [auth, owner]
  fastify.delete('/collections/:id/items/:itemId', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId, itemId } = req.params as { id: string; itemId: string }
    const removed = await removeFromCollection(collectionId, itemId, req.user!.userId)
    if (!removed) return reply.status(403).send({ error: 'Not the collection owner or not found' })
    return reply.status(204).send()
  })
}

export default fp(linksRoutes, { name: 'links' })
