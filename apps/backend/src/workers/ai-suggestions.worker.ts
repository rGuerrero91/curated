/**
 * AI suggestions worker.
 *
 * Fired when a collection reaches 3+ links (or manually via the refresh
 * endpoint). Sends the collection title + link titles/descriptions to
 * OpenAI gpt-4o-mini and asks for 5 related URL suggestions with reasoning.
 * Results are stored in the AISuggestion table.
 *
 * Old non-dismissed suggestions for the collection are cleared before
 * inserting new ones to avoid accumulation.
 */
import { Worker, type Job } from 'bullmq'
import { openai } from '../lib/openai.js'
import { prisma } from '../lib/prisma.js'
import { bullmqConnection } from '../lib/redis.js'
import type { AiSuggestionsJob } from './queues.js'

interface Suggestion {
  url: string
  title: string
  reasoning: string
}

async function generateSuggestions(collectionId: string): Promise<Suggestion[]> {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      title: true,
      description: true,
      items: {
        take: 10,
        orderBy: { position: 'asc' },
        select: {
          link: { select: { title: true, description: true, url: true, domain: true } },
        },
      },
    },
  })

  if (!collection || collection.items.length < 3) return []

  const linkSummaries = collection.items
    .map((item, i) => {
      const l = item.link
      return `${i + 1}. "${l.title ?? l.url}" (${l.domain})${l.description ? ` — ${l.description.slice(0, 100)}` : ''}`
    })
    .join('\n')

  const prompt = `You are a research assistant helping users discover related content.

Collection: "${collection.title}"${collection.description ? `\nDescription: ${collection.description}` : ''}

Existing links:
${linkSummaries}

Suggest 5 additional URLs the user might want to add to this collection. Focus on variety — mix articles, videos, tools, and documentation where relevant.

Respond with a JSON array of exactly 5 objects:
[{ "url": "...", "title": "...", "reasoning": "one sentence explaining relevance" }]

Only return valid JSON. No markdown, no explanation.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content ?? '[]'

  try {
    return JSON.parse(content) as Suggestion[]
  } catch {
    return []
  }
}

export function createAiSuggestionsWorker() {
  return new Worker<AiSuggestionsJob>(
    'ai-suggestions',
    async (job: Job<AiSuggestionsJob>) => {
      const { collectionId } = job.data

      const suggestions = await generateSuggestions(collectionId)
      if (!suggestions.length) return

      // Clear old non-dismissed suggestions before inserting fresh ones
      await prisma.aISuggestion.deleteMany({
        where: { collectionId, dismissed: false },
      })

      await prisma.aISuggestion.createMany({
        data: suggestions.map((s) => ({
          collectionId,
          url: s.url,
          title: s.title,
          reasoning: s.reasoning,
        })),
      })
    },
    { connection: bullmqConnection, concurrency: 2 },
  )
}
