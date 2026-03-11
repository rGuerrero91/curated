/**
 * AI suggestions module routes.
 *
 * AI suggestions are generated asynchronously by the ai-suggestions BullMQ
 * worker. These routes expose the stored results and allow owners to dismiss
 * suggestions or re-trigger generation.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { getSuggestions, dismissSuggestion, refreshSuggestions } from './ai.service.js'

async function aiRoutes(fastify: FastifyInstance) {
  // GET /collections/:id/suggestions [auth, owner]
  fastify.get('/collections/:id/suggestions', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const result = await getSuggestions(collectionId, req.user!.userId)
    if (!result) return reply.status(403).send({ error: 'Not the collection owner or not found' })
    return reply.send(result)
  })

  // DELETE /collections/:id/suggestions/:sid — dismiss [auth, owner]
  fastify.delete('/collections/:id/suggestions/:sid', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId, sid } = req.params as { id: string; sid: string }
    const dismissed = await dismissSuggestion(sid, collectionId, req.user!.userId)
    if (!dismissed) return reply.status(403).send({ error: 'Not the collection owner or not found' })
    return reply.status(204).send()
  })

  // POST /collections/:id/suggestions/refresh — re-trigger AI job [auth, owner]
  fastify.post('/collections/:id/suggestions/refresh', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const queued = await refreshSuggestions(collectionId, req.user!.userId)
    if (!queued) return reply.status(403).send({ error: 'Not the collection owner or not found' })
    return reply.status(202).send({ message: 'Suggestion job queued' })
  })
}

export default fp(aiRoutes, { name: 'ai' })
