/**
 * Links service.
 *
 * Creates Link records and CollectionItem join records. On link creation,
 * enqueues a link-scraper job to populate metadata asynchronously.
 */
import { prisma } from '../../lib/prisma.js'
import { linkScraperQueue } from '../../workers/queues.js'

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function submitLink(submittedBy: string, url: string) {
  const link = await prisma.link.create({
    data: { submittedBy, url, domain: extractDomain(url) },
    select: { id: true, url: true, domain: true, title: true, description: true, thumbnailUrl: true, createdAt: true },
  })

  await linkScraperQueue.add('scrape', { linkId: link.id, url: link.url })

  return link
}

export async function getLink(id: string) {
  return prisma.link.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      domain: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      faviconUrl: true,
      scrapedAt: true,
      createdAt: true,
    },
  })
}

export async function addToCollection(
  collectionId: string,
  userId: string,
  linkId: string,
  note?: string,
) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  })
  if (!collection || collection.ownerId !== userId) return null

  // Place new item at the end
  const maxPosition = await prisma.collectionItem.aggregate({
    where: { collectionId },
    _max: { position: true },
  })
  const position = (maxPosition._max.position ?? -1) + 1

  return prisma.collectionItem.create({
    data: { collectionId, linkId, note, position },
    select: {
      id: true,
      note: true,
      position: true,
      addedAt: true,
      link: { select: { id: true, url: true, domain: true, title: true, thumbnailUrl: true } },
    },
  })
}

export async function removeFromCollection(
  collectionId: string,
  itemId: string,
  userId: string,
) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  })
  if (!collection || collection.ownerId !== userId) return null

  await prisma.collectionItem.delete({ where: { id: itemId } })
  return true
}
