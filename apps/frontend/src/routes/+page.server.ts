// Home page load — public, no auth required.
//
// Reads two URL search params:
// - `tag`: filter collections by tag name (e.g. /?tag=design)
// - `cursor`: for paginating the collection grid
//
// Fires three backend requests in parallel with Promise.all to minimize latency.

import type { PageServerLoad } from './$types'
import { makeApi } from '$lib/server/api'
import type { Collection, PaginatedResponse, Tag } from '$lib/types'

export const load: PageServerLoad = async ({ cookies, url }) => {
  const api = makeApi(cookies.get('curated_session'))

  const tag = url.searchParams.get('tag') ?? undefined
  const cursor = url.searchParams.get('cursor') ?? undefined

  // Build query string for the collections endpoint
  const collectionsParams = new URLSearchParams()
  if (tag) collectionsParams.set('tag', tag)
  if (cursor) collectionsParams.set('cursor', cursor)
  collectionsParams.set('limit', '18')

  const [trending, collections, tags] = await Promise.all([
    // Trending: top collections by like+follow velocity over 7 days (no tag filter)
    api<Collection[]>('/trending?limit=8'),
    // Browse: paginated public collections, optionally filtered by tag
    api<PaginatedResponse<Collection>>(`/collections?${collectionsParams}`),
    // Tags: popular tags ordered by collection count, for the filter bar
    api<Tag[]>('/tags'),
  ])

  return {
    trending,
    collections,
    tags,
    // Pass current filters back so the page can highlight the active tag and pre-fill search
    activeTag: tag ?? null,
  }
}
