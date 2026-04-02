// Personalized feed — requires authentication.
// Shows collections from followed users and followed collections.
//
// Auth guard: reads user from parent() (layout's load result).
// Redirect to /login if not authenticated — no redirect_to param for simplicity.

import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { makeApi } from '$lib/server/api'
import type { PaginatedResponse, Collection } from '$lib/types'

export const load: PageServerLoad = async ({ parent, cookies, url }) => {
  const { user } = await parent()

  // Server-side auth guard — redirect() throws a special Response, SvelteKit catches it.
  if (!user) redirect(303, '/login')

  const api = makeApi(cookies.get('curated_session'))

  const cursor = url.searchParams.get('cursor') ?? undefined
  const feedData = await api<PaginatedResponse<Collection>>(
    `/feed${cursor ? `?cursor=${cursor}` : ''}`,
  )

  return { feedData }
}
