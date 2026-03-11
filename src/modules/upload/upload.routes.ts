/**
 * Upload module routes.
 *
 * Returns R2 presigned PUT URLs so the client can upload files directly
 * to Cloudflare R2 without routing the binary through the API server.
 *
 * Flow:
 *   1. Client → GET /upload/signed-url?resource=avatar|collection-cover
 *   2. Server → returns { uploadUrl, key, publicUrl }
 *   3. Client → PUT <uploadUrl> with the file binary
 *   4. Client → PATCH /users/me { avatarUrl } or PATCH /collections/:id/cover { coverUrl }
 *      to persist the resulting publicUrl in the database
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import { getSignedUploadUrl } from './upload.service.js'

async function uploadRoutes(fastify: FastifyInstance) {
  fastify.get('/upload/signed-url', { preHandler: requireAuth }, async (req, reply) => {
    const { resource } = req.query as { resource?: string }

    if (resource !== 'avatar' && resource !== 'collection-cover') {
      return reply.status(400).send({ error: 'resource must be "avatar" or "collection-cover"' })
    }

    const result = await getSignedUploadUrl(req.user!.userId, resource)
    return reply.send(result)
  })
}

export default fp(uploadRoutes, { name: 'upload' })
