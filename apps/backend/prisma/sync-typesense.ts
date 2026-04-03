/**
 * Bulk-syncs all public collections from Postgres into Typesense.
 *
 * Runs automatically after db:seed. Can also be run standalone:
 *   tsx prisma/sync-typesense.ts
 */

import { PrismaClient } from '@prisma/client'
import Typesense from 'typesense'

const prisma = new PrismaClient()

const typesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST ?? 'localhost',
      port: Number(process.env.TYPESENSE_PORT ?? 8108),
      protocol: (process.env.TYPESENSE_PROTOCOL ?? 'http') as 'http' | 'https',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? 'local-dev-key',
  connectionTimeoutSeconds: 5,
})

const collections = await prisma.collection.findMany({
  where: { isPublic: true },
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

const docs = collections.map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description ?? '',
  ownerUsername: c.owner.username,
  tags: c.tags.map((t) => t.tag.name),
  itemCount: c._count.items,
  likeCount: c._count.likes,
  followCount: c._count.followers,
  isPublic: c.isPublic,
  createdAt: Math.floor(c.createdAt.getTime() / 1000),
}))

await typesense.collections('collections').documents().import(docs, { action: 'upsert' })
console.log(`🔍  Synced ${docs.length} collections to Typesense`)

await prisma.$disconnect()
