/**
 * Auth plugin for Fastify.
 *
 * This plugin handles two responsibilities:
 *
 * 1. Session creation — `POST /api/v1/auth/session` accepts a Firebase ID
 *    token from the client, verifies it with Firebase Admin, upserts the user
 *    in Postgres, and seals the session into an HttpOnly encrypted cookie
 *    using iron-session.
 *
 * 2. Request authentication — `requireAuth` is a Fastify preHandler hook that
 *    unseals the session cookie and attaches `req.user` to the request. Import
 *    and use it on any route that requires a logged-in user.
 *
 * Auth flow:
 *   Client (Firebase SDK) → Firebase ID token (1h JWT)
 *   → POST /auth/session → verifyIdToken → upsert User → iron-session cookie
 *   → Subsequent requests → unseal cookie → req.user = { id, username }
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { getIronSession, type IronSession } from 'iron-session'
import { firebaseAuth } from '../lib/firebase-admin.js'
import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'

// ── Session data shape ─────────────────────────────────────────

export interface SessionData {
  userId: string
  username: string
}

// ── iron-session options ───────────────────────────────────────

export const sessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: 'curated_session',
  cookieOptions: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  },
}

// ── Extend FastifyRequest with req.user ────────────────────────

declare module 'fastify' {
  interface FastifyRequest {
    user?: SessionData
  }
}

// ── requireAuth preHandler ─────────────────────────────────────

/**
 * Fastify preHandler hook. Unseals the session cookie and attaches
 * `req.user`. Returns 401 if no valid session is found.
 */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const session = await getIronSession<SessionData>(req.raw, reply.raw, sessionOptions)

  if (!session.userId) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  req.user = { userId: session.userId, username: session.username }
}

// ── Auth plugin ────────────────────────────────────────────────

async function authPlugin(fastify: FastifyInstance) {
  /**
   * POST /api/v1/auth/session
   * Exchange a Firebase ID token for an iron-session cookie.
   */
  fastify.post('/auth/session', async (req, reply) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(400).send({ error: 'Missing Bearer token' })
    }

    const idToken = authHeader.slice(7)

    let decodedToken: Awaited<ReturnType<typeof firebaseAuth.verifyIdToken>>
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken)
    } catch {
      return reply.status(401).send({ error: 'Invalid Firebase ID token' })
    }

    const { uid, email } = decodedToken

    // Upsert the user — first login creates the row, subsequent logins are no-ops
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      create: {
        firebaseUid: uid,
        // Generate a default username from the email prefix; user can change later
        username: (email ?? uid).split('@')[0]!.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        displayName: decodedToken.name ?? null,
        avatarUrl: decodedToken.picture ?? null,
      },
      update: {},
      select: { id: true, username: true },
    })

    const session = await getIronSession<SessionData>(req.raw, reply.raw, sessionOptions)
    session.userId = user.id
    session.username = user.username
    await session.save()

    return reply.status(200).send({ userId: user.id, username: user.username })
  })

  /**
   * DELETE /api/v1/auth/session
   * Destroy the session cookie (logout).
   */
  fastify.delete('/auth/session', async (req, reply) => {
    const session = await getIronSession<SessionData>(req.raw, reply.raw, sessionOptions)
    session.destroy()
    return reply.status(204).send()
  })

  /**
   * GET /api/v1/auth/me
   * Return the current session user. 401 if not logged in.
   */
  fastify.get('/auth/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        websiteUrl: true,
        isPrivate: true,
        createdAt: true,
      },
    })

    if (!user) return reply.status(404).send({ error: 'User not found' })
    return reply.send(user)
  })
}

export default fp(authPlugin, { name: 'auth' })
