import { redirect, fail } from '@sveltejs/kit'
import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms'
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import type { PageServerLoad, Actions } from './$types'
import { makeApi, ApiError } from '$lib/server/api'
import { profileSchema } from '$lib/schemas'
import type { User } from '$lib/types'

type ProfileForm = SuperValidated<Infer<typeof profileSchema>>

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent()
  if (!user) redirect(303, '/login')

  // Pre-fill the form with current profile values
  const form = (await superValidate(
    { displayName: user.displayName ?? '', bio: user.bio ?? '', websiteUrl: user.websiteUrl ?? '', username: user.username, isPrivate: user.isPrivate ?? false },
    zod(profileSchema as any),
  )) as unknown as ProfileForm

  return { form }
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = (await superValidate(request, zod(profileSchema as any))) as unknown as ProfileForm
    if (!form.valid) return fail(400, { form })

    const api = makeApi(cookies.get('curated_session'))
    try {
      await api<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: form.data.displayName || undefined,
          bio: form.data.bio || undefined,
          websiteUrl: form.data.websiteUrl || undefined,
          username: form.data.username || undefined,
          isPrivate: form.data.isPrivate,
        }),
      })
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, { form })
      return fail(500, { form })
    }

    // Redirect to their (possibly renamed) profile
    const username = form.data.username
    redirect(303, username ? `/users/${username}` : '/')
  },
}
