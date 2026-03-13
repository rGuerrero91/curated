/**
 * BullMQ queue definitions (shared between web process and worker process).
 *
 * The web server enqueues jobs here; the worker process consumes them.
 * Both processes import from this file so the queue names are always in sync.
 *
 * Queues:
 *   - linkScraper      Scrape OG metadata for a newly submitted link
 *   - aiSuggestions    Generate AI link suggestions for a collection
 *   - searchSync       Sync a collection or link document to Typesense
 *   - notifications    Fan-out follow/like/comment events to followers
 */
import { Queue } from 'bullmq'
import { bullmqConnection } from '../lib/redis.js'

const connection = bullmqConnection

// ── Job payload types ──────────────────────────────────────────

export interface LinkScraperJob {
  linkId: string
  url: string
}

export interface AiSuggestionsJob {
  collectionId: string
}

export interface SearchSyncJob {
  type: 'collection' | 'link'
  id: string
  action: 'upsert' | 'delete'
}

export interface NotificationsJob {
  type: 'follow' | 'like' | 'comment'
  actorId: string
  targetUserId: string
  resourceId: string
}

// ── Queue instances ────────────────────────────────────────────

export const linkScraperQueue = new Queue<LinkScraperJob>('link-scraper', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
})

export const aiSuggestionsQueue = new Queue<AiSuggestionsJob>('ai-suggestions', {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
  },
})

export const searchSyncQueue = new Queue<SearchSyncJob>('search-sync', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 200 },
  },
})

export const notificationsQueue = new Queue<NotificationsJob>('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 3000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
})
