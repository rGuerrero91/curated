// Root layout server load — runs on every navigation (SSR + client-side).
//
// By fetching the current user here and returning it as { user }, every child
// +page.server.ts can call `await parent()` to access it without making a
// second /auth/me request. Child +page.svelte files receive it via `data.user`.
//
// On 401 (no cookie, expired session) we return { user: null } — the layout
// and pages display the unauthenticated state instead of throwing.

import type { LayoutServerLoad } from './$types'
import { makeApi, ApiError } from '$lib/server/api'
import type { User } from '$lib/types'

export const load: LayoutServerLoad = async ({ cookies }) => {
  const api = makeApi(cookies.get('curated_session'))

  try {
    const user = await api<User>('/auth/me')
    return { user }
  } catch (err) {
    // 401 = no session; any other error (network, 500) also treated as unauthenticated
    if (err instanceof ApiError && err.status !== 401) {
      console.error('Unexpected error fetching current user:', err.message)
    }
    return { user: null }
  }
}
