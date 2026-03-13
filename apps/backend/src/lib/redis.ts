import Redis from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('[redis] connection error:', err.message)
})

redis.on('connect', () => {
  console.log('[redis] connected')
})

// Plain options for BullMQ — avoids the ioredis version conflict between the
// top-level ioredis package and BullMQ's bundled ioredis copy.
const { hostname, port } = new URL(env.REDIS_URL)
export const bullmqConnection = {
  host: hostname,
  port: Number(port) || 6379,
  maxRetriesPerRequest: null as null,
}
