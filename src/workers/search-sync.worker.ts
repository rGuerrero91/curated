/**
 * Search sync worker.
 *
 * Keeps Typesense documents in sync with Postgres. Fired after every
 * collection or link write. Upserts or deletes the Typesense document
 * for the given resource.
 */
import { Worker, type Job } from 'bullmq'
import { typesense } from '../lib/typesense.js'
import { prisma } from '../lib/prisma.js'
import { redis } from '../lib/redis.js'
import type { SearchSyncJob } from './queues.js'

async function syncCollection(id: string, action: 'upsert' | 'delete') {
  if (action === 'delete') {
    await typesense.collections('collections').documents(id).delete().catch(() => {})
    return
  }

  const collection = await prisma.collection.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      createdAt: true,
      owner: { select: { username: true } },
      tags: { select: { tag: { select: { name: true } } } },
      _count: { select: { items: true, likes: true, followers: true } },
    },
  })

  if (!collection || !collection.isPublic) return

  await typesense
    .collections('collections')
    .documents()
    .upsert({
      id: collection.id,
      title: collection.title,
      description: collection.description ?? '',
      ownerUsername: collection.owner.username,
      tags: collection.tags.map((t) => t.tag.name),
      itemCount: collection._count.items,
      likeCount: collection._count.likes,
      followCount: collection._count.followers,
      isPublic: collection.isPublic,
      createdAt: Math.floor(collection.createdAt.getTime() / 1000),
    })
}

async function syncLink(id: string, action: 'upsert' | 'delete') {
  if (action === 'delete') {
    await typesense.collections('links').documents(id).delete().catch(() => {})
    return
  }

  const link = await prisma.link.findUnique({
    where: { id },
    select: { id: true, url: true, domain: true, title: true, description: true, createdAt: true },
  })

  if (!link) return

  await typesense
    .collections('links')
    .documents()
    .upsert({
      id: link.id,
      url: link.url,
      domain: link.domain,
      title: link.title ?? '',
      description: link.description ?? '',
      createdAt: Math.floor(link.createdAt.getTime() / 1000),
    })
}

export function createSearchSyncWorker() {
  return new Worker<SearchSyncJob>(
    'search-sync',
    async (job: Job<SearchSyncJob>) => {
      const { type, id, action } = job.data

      if (type === 'collection') {
        await syncCollection(id, action)
      } else {
        await syncLink(id, action)
      }
    },
    { connection: redis, concurrency: 10 },
  )
}
