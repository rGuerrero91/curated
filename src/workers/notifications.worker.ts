/**
 * Notifications worker.
 *
 * Handles fan-out for follow, like, and comment events.
 * Currently logs the event — replace the placeholder with your actual
 * notification delivery mechanism (push via FCM, in-app via Postgres, etc.).
 *
 * Fan-out is intentionally kept simple here. For users with very large
 * follower counts, consider a separate fan-out strategy.
 */
import { Worker, type Job } from 'bullmq'
import { redis } from '../lib/redis.js'
import type { NotificationsJob } from './queues.js'

export function createNotificationsWorker() {
  return new Worker<NotificationsJob>(
    'notifications',
    async (job: Job<NotificationsJob>) => {
      const { type, actorId, targetUserId, resourceId } = job.data

      // TODO: implement delivery — push notification via Firebase Cloud Messaging,
      // write to an in-app notifications table, send an email, etc.
      console.log(`[notifications] ${type} | actor=${actorId} target=${targetUserId} resource=${resourceId}`)
    },
    { connection: redis, concurrency: 20 },
  )
}
