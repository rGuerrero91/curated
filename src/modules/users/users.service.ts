/**
 * Users service.
 *
 * All database queries for the users module. Route handlers stay thin —
 * they validate input and delegate to this service.
 */
import { prisma } from '../../lib/prisma.js'

const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  websiteUrl: true,
  isPrivate: true,
  createdAt: true,
  _count: { select: { followers: true, following: true, collections: true } },
} as const

export async function getProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: PUBLIC_USER_SELECT,
  })
}

export async function getUserCollections(
  username: string,
  query: { cursor?: string; limit?: string },
) {
  const limit = Math.min(Number(query.limit ?? 20), 50)
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
  if (!user) return { items: [], nextCursor: null }

  const items = await prisma.collection.findMany({
    where: { ownerId: user.id, isPublic: true },
    take: limit + 1,
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      createdAt: true,
      _count: { select: { items: true, likes: true, followers: true } },
    },
  })

  const hasMore = items.length > limit
  return {
    items: hasMore ? items.slice(0, -1) : items,
    nextCursor: hasMore ? items[items.length - 2]!.id : null,
  }
}

export async function getUserFollowers(
  username: string,
  query: { cursor?: string; limit?: string },
) {
  const limit = Math.min(Number(query.limit ?? 20), 50)
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
  if (!user) return { items: [], nextCursor: null }

  const follows = await prisma.follow.findMany({
    where: { followingId: user.id },
    take: limit + 1,
    cursor: query.cursor ? { followerId_followingId: { followerId: query.cursor, followingId: user.id } } : undefined,
    skip: query.cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    select: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } }, createdAt: true },
  })

  const hasMore = follows.length > limit
  return {
    items: hasMore ? follows.slice(0, -1) : follows,
    nextCursor: hasMore ? follows[follows.length - 2]!.follower.id : null,
  }
}

export async function getUserFollowing(
  username: string,
  query: { cursor?: string; limit?: string },
) {
  const limit = Math.min(Number(query.limit ?? 20), 50)
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
  if (!user) return { items: [], nextCursor: null }

  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    take: limit + 1,
    cursor: query.cursor ? { followerId_followingId: { followerId: user.id, followingId: query.cursor } } : undefined,
    skip: query.cursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
    select: { following: { select: { id: true, username: true, displayName: true, avatarUrl: true } }, createdAt: true },
  })

  const hasMore = follows.length > limit
  return {
    items: hasMore ? follows.slice(0, -1) : follows,
    nextCursor: hasMore ? follows[follows.length - 2]!.following.id : null,
  }
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string
    bio?: string
    websiteUrl?: string
    isPrivate?: boolean
    username?: string
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_SELECT,
  })
}
