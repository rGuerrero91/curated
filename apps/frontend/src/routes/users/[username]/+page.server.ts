// User profile page load + follow/unfollow actions.

import { error, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { makeApi, ApiError } from '$lib/server/api'
import type { UserProfile, PaginatedResponse, Collection } from '$lib/types'

export const load: PageServerLoad = async ({ params, cookies }) => {
  const api = makeApi(cookies.get('curated_session'))

  let profile: UserProfile
  try {
    profile = await api<UserProfile>(`/users/${params.username}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      error(404, `@${params.username} not found`)
    }
    throw err
  }

  // Fetch the user's public collections in parallel with the profile
  const collections = await api<PaginatedResponse<Collection>>(
    `/users/${params.username}/collections?limit=12`,
  )

  return { profile, collections }
}

export const actions: Actions = {
  // POST ?/follow — follow this user
  follow: async ({ params, cookies }) => {
    const api = makeApi(cookies.get('curated_session'))
    try {
      await api<void>(`/users/${params.username}/follow`, { method: 'POST' })
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, { error: err.message })
      return fail(500, { error: 'Failed to follow' })
    }
    return { success: true }
  },

  // POST ?/unfollow — unfollow this user
  unfollow: async ({ params, cookies }) => {
    const api = makeApi(cookies.get('curated_session'))
    try {
      await api<void>(`/users/${params.username}/follow`, { method: 'DELETE' })
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, { error: err.message })
      return fail(500, { error: 'Failed to unfollow' })
    }
    return { success: true }
  },
}
