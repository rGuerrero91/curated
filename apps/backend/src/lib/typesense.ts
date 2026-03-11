/**
 * Typesense search client.
 *
 * Typesense is a fast, typo-tolerant search engine. We use it to power the
 * discovery feed, collection/link search, and trending queries. Documents
 * are kept in sync with Postgres via BullMQ search-sync jobs that fire on
 * every collection or link write.
 */
import Typesense from 'typesense'
import { env } from '../config/env.js'

export const typesense = new Typesense.Client({
  nodes: [
    {
      host: env.TYPESENSE_HOST,
      port: env.TYPESENSE_PORT,
      protocol: env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 5,
})

// ── Collection schema ─────────────────────────────────────────

export const COLLECTIONS_SCHEMA = {
  name: 'collections',
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'description', type: 'string' as const, optional: true },
    { name: 'ownerUsername', type: 'string' as const, facet: true },
    { name: 'tags', type: 'string[]' as const, facet: true },
    { name: 'itemCount', type: 'int32' as const },
    { name: 'likeCount', type: 'int32' as const },
    { name: 'followCount', type: 'int32' as const },
    { name: 'isPublic', type: 'bool' as const, facet: true },
    { name: 'createdAt', type: 'int64' as const },
  ],
  default_sorting_field: 'createdAt',
}

export const LINKS_SCHEMA = {
  name: 'links',
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const, optional: true },
    { name: 'description', type: 'string' as const, optional: true },
    { name: 'url', type: 'string' as const },
    { name: 'domain', type: 'string' as const, facet: true },
    { name: 'createdAt', type: 'int64' as const },
  ],
  default_sorting_field: 'createdAt',
}

/** Idempotently create Typesense collections if they don't exist. */
export async function ensureTypesenseCollections(): Promise<void> {
  const existing = await typesense.collections().retrieve()
  const existingNames = existing.map((c) => c.name)

  if (!existingNames.includes('collections')) {
    await typesense.collections().create(COLLECTIONS_SCHEMA)
    console.log('[typesense] created collections schema')
  }

  if (!existingNames.includes('links')) {
    await typesense.collections().create(LINKS_SCHEMA)
    console.log('[typesense] created links schema')
  }
}
