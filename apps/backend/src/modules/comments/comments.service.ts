import { prisma } from '../../lib/prisma.js'

export async function listComments(
  collectionId: string,
  query: { cursor?: string; limit?: string },
) {
  const limit = Math.min(Number(query.limit ?? 20), 50)

  const items = await prisma.comment.findMany({
    where: { collectionId, parentId: null }, // top-level only; replies nested below
    take: limit + 1,
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  })

  const hasMore = items.length > limit
  return {
    items: hasMore ? items.slice(0, -1) : items,
    nextCursor: hasMore ? items[items.length - 2]!.id : null,
  }
}

export async function postComment(
  collectionId: string,
  authorId: string,
  body: string,
  parentId?: string,
) {
  return prisma.comment.create({
    data: { collectionId, authorId, body, parentId },
    select: {
      id: true,
      body: true,
      parentId: true,
      createdAt: true,
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  })
}

export async function deleteComment(id: string, collectionId: string, userId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { authorId: true, collection: { select: { ownerId: true } } },
  })
  if (!comment) return null

  const isAuthor = comment.authorId === userId
  const isCollectionOwner = comment.collection.ownerId === userId
  if (!isAuthor && !isCollectionOwner) return null

  await prisma.comment.delete({ where: { id } })
  return true
}
