/**
 * Discovery service.
 *
 * search() queries Typesense for fast full-text results.
 * getPersonalizedFeed() and getTrending() query Postgres directly.
 */
import { typesense } from '../../lib/typesense.js'
import { prisma } from '../../lib/prisma.js'

export async function search(query: {
  q?: string
  type?: 'collections' | 'links'
  tags?: string
  page?: string
  limit?: string
}) {
  const q = query.q ?? '*'
  const type = query.type ?? 'collections'
  const page = Math.max(Number(query.page ?? 1), 1)
  const perPage = Math.min(Number(query.limit ?? 20), 50)

  const searchParams: Record<string, unknown> = {
    q,
    query_by: type === 'collections' ? 'title,description,ownerUsername,tags' : 'title,description,url',
    page,
    per_page: perPage,
    filter_by: type === 'collections' ? 'isPublic:=true' : undefined,
  }

  if (query.tags && type === 'collections') {
    searchParams['filter_by'] = `isPublic:=true && tags:=[${query.tags}]`
  }

  const results = await typesense.collections(type).documents().search(searchParams)
  return results
}

export async function getPersonalizedFeed(
  userId: string,
  query: { cursor?: string; limit?: string },
) {
  const limit = Math.min(Number(query.limit ?? 20), 50)

  // Get IDs of users and collections the current user follows
  const [followedUsers, followedCollections] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
    prisma.collectionFollow.findMany({ where: { userId }, select: { collectionId: true } }),
  ])

  const followedUserIds = followedUsers.map((f) => f.followingId)
  const followedCollectionIds = followedCollections.map((f) => f.collectionId)

  const items = await prisma.collection.findMany({
    where: {
      isPublic: true,
      OR: [
        { ownerId: { in: followedUserIds } },
        { id: { in: followedCollectionIds } },
      ],
    },
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
      owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      tags: { select: { tag: { select: { name: true } } } },
      _count: { select: { likes: true, followers: true, items: true } },
    },
  })

  const hasMore = items.length > limit
  return {
    items: hasMore ? items.slice(0, -1) : items,
    nextCursor: hasMore ? items[items.length - 2]!.id : null,
  }
}

export async function getTrending(query: { limit?: string }) {
  const limit = Math.min(Number(query.limit ?? 20), 50)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days

  // Count likes + follows in the window per collection
  const [likeGroups, followGroups] = await Promise.all([
    prisma.like.groupBy({
      by: ['collectionId'],
      where: { createdAt: { gte: since } },
      _count: { collectionId: true },
    }),
    prisma.collectionFollow.groupBy({
      by: ['collectionId'],
      where: { createdAt: { gte: since } },
      _count: { collectionId: true },
    }),
  ])

  // Merge scores
  const scores = new Map<string, number>()
  for (const r of likeGroups) scores.set(r.collectionId, (scores.get(r.collectionId) ?? 0) + r._count.collectionId)
  for (const r of followGroups) scores.set(r.collectionId, (scores.get(r.collectionId) ?? 0) + r._count.collectionId)

  const topIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (!topIds.length) return []

  const collections = await prisma.collection.findMany({
    where: { id: { in: topIds }, isPublic: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      createdAt: true,
      owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      tags: { select: { tag: { select: { name: true } } } },
      _count: { select: { likes: true, followers: true, items: true } },
    },
  })

  // Re-sort by score
  return collections.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))
}
