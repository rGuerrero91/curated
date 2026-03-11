/**
 * Collections service.
 *
 * Handles all Prisma queries for collections. Also enqueues BullMQ jobs
 * for search sync on writes.
 */
import { prisma } from '../../lib/prisma.js'
import { searchSyncQueue } from '../../workers/queues.js'

const COLLECTION_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverUrl: true,
  isPublic: true,
  aiEnabled: true,
  createdAt: true,
  updatedAt: true,
  owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  tags: { select: { tag: { select: { id: true, name: true } } } },
  items: {
    orderBy: { position: 'asc' as const },
    select: {
      id: true,
      note: true,
      position: true,
      addedAt: true,
      link: {
        select: {
          id: true,
          url: true,
          domain: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          faviconUrl: true,
        },
      },
    },
  },
  _count: { select: { likes: true, followers: true, items: true, comments: true } },
} as const

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

export async function listCollections(query: { cursor?: string; limit?: string; tag?: string }) {
  const limit = Math.min(Number(query.limit ?? 20), 50)

  const items = await prisma.collection.findMany({
    where: {
      isPublic: true,
      ...(query.tag
        ? { tags: { some: { tag: { name: query.tag } } } }
        : {}),
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

export async function getCollection(id: string) {
  return prisma.collection.findUnique({ where: { id }, select: COLLECTION_SELECT })
}

export async function createCollection(
  ownerId: string,
  data: { title: string; description?: string; isPublic?: boolean; tags?: string[] },
) {
  const slug = toSlug(data.title)

  const collection = await prisma.collection.create({
    data: {
      ownerId,
      slug,
      title: data.title,
      description: data.description,
      isPublic: data.isPublic ?? true,
      tags: data.tags?.length
        ? {
            create: data.tags.map((name) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          }
        : undefined,
    },
    select: COLLECTION_SELECT,
  })

  await searchSyncQueue.add('sync', { type: 'collection', id: collection.id, action: 'upsert' })

  return collection
}

export async function updateCollection(
  id: string,
  ownerId: string,
  data: { title?: string; description?: string; isPublic?: boolean; aiEnabled?: boolean; tags?: string[] },
) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { ownerId: true } })
  if (!existing || existing.ownerId !== ownerId) return null

  const collection = await prisma.collection.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      isPublic: data.isPublic,
      aiEnabled: data.aiEnabled,
      ...(data.tags !== undefined
        ? {
            tags: {
              deleteMany: {},
              create: data.tags.map((name) => ({
                tag: { connectOrCreate: { where: { name }, create: { name } } },
              })),
            },
          }
        : {}),
    },
    select: COLLECTION_SELECT,
  })

  await searchSyncQueue.add('sync', { type: 'collection', id, action: 'upsert' })

  return collection
}

export async function deleteCollection(id: string, ownerId: string) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { ownerId: true } })
  if (!existing || existing.ownerId !== ownerId) return null

  await prisma.collection.delete({ where: { id } })
  await searchSyncQueue.add('sync', { type: 'collection', id, action: 'delete' })

  return true
}

export async function reorderItems(
  collectionId: string,
  ownerId: string,
  order: Array<{ id: string; position: number }>,
) {
  const existing = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  })
  if (!existing || existing.ownerId !== ownerId) return

  await prisma.$transaction(
    order.map(({ id, position }) =>
      prisma.collectionItem.update({ where: { id }, data: { position } }),
    ),
  )
}

export async function setCollectionCover(id: string, ownerId: string, coverUrl: string) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { ownerId: true } })
  if (!existing || existing.ownerId !== ownerId) return null

  return prisma.collection.update({
    where: { id },
    data: { coverUrl },
    select: { id: true, coverUrl: true },
  })
}

export async function removeCollectionCover(id: string, ownerId: string) {
  const existing = await prisma.collection.findUnique({ where: { id }, select: { ownerId: true } })
  if (!existing || existing.ownerId !== ownerId) return null

  return prisma.collection.update({
    where: { id },
    data: { coverUrl: null },
    select: { id: true, coverUrl: true },
  })
}
