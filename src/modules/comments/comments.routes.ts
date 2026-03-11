/**
 * Comments module routes.
 *
 * Comments are attached to collections. One level of threading is supported
 * via parentId. Authors and collection owners can delete comments.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { listComments, postComment, deleteComment } from './comments.service.js'

async function commentsRoutes(fastify: FastifyInstance) {
  // GET /collections/:id/comments — cursor paginated
  fastify.get('/collections/:id/comments', async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const query = req.query as { cursor?: string; limit?: string }
    return reply.send(await listComments(collectionId, query))
  })

  // POST /collections/:id/comments [auth]
  fastify.post('/collections/:id/comments', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId } = req.params as { id: string }
    const { body, parentId } = req.body as { body: string; parentId?: string }
    const comment = await postComment(collectionId, req.user!.userId, body, parentId)
    return reply.status(201).send(comment)
  })

  // DELETE /collections/:id/comments/:cid [auth, author or collection owner]
  fastify.delete('/collections/:id/comments/:cid', { preHandler: requireAuth }, async (req, reply) => {
    const { id: collectionId, cid } = req.params as { id: string; cid: string }
    const deleted = await deleteComment(cid, collectionId, req.user!.userId)
    if (!deleted) return reply.status(403).send({ error: 'Not authorized to delete this comment' })
    return reply.status(204).send()
  })
}

export default fp(commentsRoutes, { name: 'comments' })
