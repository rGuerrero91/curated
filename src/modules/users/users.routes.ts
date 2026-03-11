/**
 * Users module routes.
 *
 * Public profile viewing, follow/unfollow, and own-profile editing.
 * All write routes require authentication via the requireAuth preHandler.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { requireAuth } from '../../plugins/auth.js'
import {
  getProfile,
  getUserCollections,
  getUserFollowers,
  getUserFollowing,
  updateProfile,
} from './users.service.js'

async function usersRoutes(fastify: FastifyInstance) {
  // GET /users/:username — public profile
  fastify.get('/users/:username', async (req, reply) => {
    const { username } = req.params as { username: string }
    const user = await getProfile(username)
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return reply.send(user)
  })

  // GET /users/:username/collections
  fastify.get('/users/:username/collections', async (req, reply) => {
    const { username } = req.params as { username: string }
    const query = req.query as { cursor?: string; limit?: string }
    const collections = await getUserCollections(username, query)
    return reply.send(collections)
  })

  // GET /users/:username/followers
  fastify.get('/users/:username/followers', async (req, reply) => {
    const { username } = req.params as { username: string }
    const query = req.query as { cursor?: string; limit?: string }
    const followers = await getUserFollowers(username, query)
    return reply.send(followers)
  })

  // GET /users/:username/following
  fastify.get('/users/:username/following', async (req, reply) => {
    const { username } = req.params as { username: string }
    const query = req.query as { cursor?: string; limit?: string }
    const following = await getUserFollowing(username, query)
    return reply.send(following)
  })

  // PATCH /users/me — update own profile [auth]
  fastify.patch('/users/me', { preHandler: requireAuth }, async (req, reply) => {
    const body = req.body as {
      displayName?: string
      bio?: string
      websiteUrl?: string
      isPrivate?: boolean
      username?: string
    }
    const updated = await updateProfile(req.user!.userId, body)
    return reply.send(updated)
  })
}

export default fp(usersRoutes, { name: 'users' })
