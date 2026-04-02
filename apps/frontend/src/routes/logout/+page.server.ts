// Logout action — no load() needed, this route only handles a POST.
//
// The Navbar's logout button is inside a <form method="POST" action="/logout">.
// When submitted, SvelteKit routes the POST here. The action calls
// DELETE /api/v1/auth/session which tells Fastify to set the cookie's Max-Age to 0,
// clearing it from the browser. Then we redirect to /.

import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'
import { makeApi } from '$lib/server/api'

export const actions: Actions = {
  default: async ({ cookies }) => {
    const api = makeApi(cookies.get('curated_session'))

    // Ask the backend to invalidate the session (sets Max-Age=0 on the cookie response).
    // We ignore errors — even if the backend is down, we can still clear the local cookie.
    try {
      await api<void>('/auth/session', { method: 'DELETE' })
    } catch {
      // Session may already be invalid — proceed with redirect regardless
    }

    // Belt-and-suspenders: also delete the cookie directly from SvelteKit's side.
    // This handles cases where the backend's Set-Cookie response isn't processed.
    cookies.delete('curated_session', { path: '/' })

    redirect(303, '/')
  },
}
