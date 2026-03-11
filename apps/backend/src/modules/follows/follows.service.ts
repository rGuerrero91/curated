import { prisma } from '../../lib/prisma.js'
import { notificationsQueue } from '../../workers/queues.js'

export async function followUser(followerId: string, targetUsername: string) {
  const target = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true },
  })
  if (!target || target.id === followerId) return null

  const follow = await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId: target.id } },
    create: { followerId, followingId: target.id },
    update: {},
    select: { followerId: true, followingId: true, createdAt: true },
  })

  await notificationsQueue.add('notify', {
    type: 'follow',
    actorId: followerId,
    targetUserId: target.id,
    resourceId: target.id,
  })

  return follow
}

export async function unfollowUser(followerId: string, targetUsername: string) {
  const target = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true },
  })
  if (!target) return

  await prisma.follow
    .delete({ where: { followerId_followingId: { followerId, followingId: target.id } } })
    .catch(() => {}) // ignore if not following
}

export async function followCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { id: true, ownerId: true },
  })
  if (!collection) return null

  return prisma.collectionFollow.upsert({
    where: { userId_collectionId: { userId, collectionId } },
    create: { userId, collectionId },
    update: {},
    select: { userId: true, collectionId: true, createdAt: true },
  })
}

export async function unfollowCollection(userId: string, collectionId: string) {
  await prisma.collectionFollow
    .delete({ where: { userId_collectionId: { userId, collectionId } } })
    .catch(() => {})
}
