/**
 * Worker process entry point.
 *
 * This is a separate long-running process from the Fastify web server.
 * In docker-compose it runs as the `worker` service using the same image
 * but with the command `npm run worker`.
 *
 * All four BullMQ workers are started here and run concurrently.
 */
import { createLinkScraperWorker } from './link-scraper.worker.js'
import { createAiSuggestionsWorker } from './ai-suggestions.worker.js'
import { createSearchSyncWorker } from './search-sync.worker.js'
import { createNotificationsWorker } from './notifications.worker.js'

const workers = [
  createLinkScraperWorker(),
  createAiSuggestionsWorker(),
  createSearchSyncWorker(),
  createNotificationsWorker(),
]

console.log('[workers] started:', workers.map((w) => w.name).join(', '))

process.on('SIGTERM', async () => {
  console.log('[workers] shutting down...')
  await Promise.all(workers.map((w) => w.close()))
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('[workers] shutting down...')
  await Promise.all(workers.map((w) => w.close()))
  process.exit(0)
})
