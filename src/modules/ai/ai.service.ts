import { prisma } from '../../lib/prisma.js'
import { aiSuggestionsQueue } from '../../workers/queues.js'

export async function getSuggestions(collectionId: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  })
  if (!collection || collection.ownerId !== userId) return null

  return prisma.aISuggestion.findMany({
    where: { collectionId, dismissed: false },
    orderBy: { createdAt: 'desc' },
    select: { id: true, url: true, title: true, reasoning: true, createdAt: true },
  })
}

export async function dismissSuggestion(id: string, collectionId: string, userId: string) {
  const suggestion = await prisma.aISuggestion.findUnique({
    where: { id },
    select: { collection: { select: { ownerId: true } } },
  })
  if (!suggestion || suggestion.collection.ownerId !== userId) return null

  await prisma.aISuggestion.update({ where: { id }, data: { dismissed: true } })
  return true
}

export async function refreshSuggestions(collectionId: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { ownerId: true },
  })
  if (!collection || collection.ownerId !== userId) return null

  await aiSuggestionsQueue.add('suggest', { collectionId })
  return true
}
