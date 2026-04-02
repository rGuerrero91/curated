// Search page load — reads the `q` query param from the URL.
//
// This demonstrates URL-driven state: the search query lives in the URL (?q=...),
// not in component state. When the GET form submits, SvelteKit navigates to the new
// URL and re-runs this load() with the updated searchParams. No JavaScript required.

import type { PageServerLoad } from './$types'
import { makeApi } from '$lib/server/api'

export const load: PageServerLoad = async ({ url, cookies }) => {
  const api = makeApi(cookies.get('curated_session'))

  const q = url.searchParams.get('q')?.trim() ?? ''

  // Only call the backend if there's an actual query — avoid an empty search on initial load
  if (!q) return { q, results: [] }

  // The Typesense search endpoint supports type=collections|links
  // For the PoC we only search collections
  const results = await api<unknown>(`/search?q=${encodeURIComponent(q)}&type=collections`)

  return { q, results }
}
