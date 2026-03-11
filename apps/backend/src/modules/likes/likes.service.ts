import { prisma } from '../../lib/prisma.js'
import { notificationsQueue } from '../../workers/queues.js'

export async function likeCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  })
  if (!collection) return null

  const like = await prisma.like.upsert({
    where: { userId_collectionId: { userId, collectionId } },
    create: { userId, collectionId },
    update: {},
    select: { userId: true, collectionId: true, createdAt: true },
  })

  if (collection.ownerId !== userId) {
    await notificationsQueue.add('notify', {
      type: 'like',
      actorId: userId,
      targetUserId: collection.ownerId,
      resourceId: collectionId,
    })
  }

  return like
}

export async function unlikeCollection(userId: string, collectionId: string) {
  await prisma.like
    .delete({ where: { userId_collectionId: { userId, collectionId } } })
    .catch(() => {})
}
