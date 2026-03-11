import { prisma } from '../../lib/prisma.js'

export async function listPopularTags() {
  // Return tags sorted by the number of public collections using them
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { collections: true } },
    },
    orderBy: { collections: { _count: 'desc' } },
    take: 50,
  })
  return tags
}

export async function getCollectionsByTag(
  name: string,
  query: { cursor?: string; limit?: string },
) {
  const limit = Math.min(Number(query.limit ?? 20), 50)

  const tag = await prisma.tag.findUnique({ where: { name }, select: { id: true } })
  if (!tag) return { items: [], nextCursor: null }

  const collectionTags = await prisma.collectionTag.findMany({
    where: { tagId: tag.id, collection: { isPublic: true } },
    take: limit + 1,
    cursor: query.cursor ? { collectionId_tagId: { collectionId: query.cursor, tagId: tag.id } } : undefined,
    skip: query.cursor ? 1 : 0,
    select: {
      collection: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverUrl: true,
          createdAt: true,
          owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { likes: true, followers: true, items: true } },
        },
      },
    },
  })

  const hasMore = collectionTags.length > limit
  return {
    items: (hasMore ? collectionTags.slice(0, -1) : collectionTags).map((ct) => ct.collection),
    nextCursor: hasMore ? collectionTags[collectionTags.length - 2]!.collection.id : null,
  }
}
