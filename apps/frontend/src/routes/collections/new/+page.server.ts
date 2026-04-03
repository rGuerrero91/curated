// Create collection page — demonstrates the full Superforms server cycle:
//
// load():   superValidate(zod(schema)) → empty form with HTML constraints
// action(): superValidate(request, zod(schema)) → validate → fail() or redirect()
//
// Auth guard: uses parent() to read layout's user without a second /auth/me call.
//
// NOTE on `as any` casts: sveltekit-superforms is hoisted to the monorepo root
// node_modules where it resolves Zod types from the root (3.25.x). The frontend
// workspace installs a separate Zod (3.25.x as well) but TypeScript's module
// resolution can cause a ZodObjectType incompatibility. The `as any` cast on the
// schema is a pragmatic workaround — runtime behaviour is correct, only the TS
// type of the adapter call needs silencing. We restore the form.data type with
// an explicit `SuperValidated<Infer<...>>` annotation.

import { fail, redirect } from '@sveltejs/kit'
import { superValidate, type SuperValidated, type Infer } from 'sveltekit-superforms'
// zod4 adapter required: this workspace installs Zod v4 (^4.0.0) locally.
// Superforms detects the version and throws if the v3 `zod` adapter is used instead.
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import type { PageServerLoad, Actions } from './$types'
import { makeApi, ApiError } from '$lib/server/api'
import { createCollectionSchema } from '$lib/schemas'
import type { CollectionDetail } from '$lib/types'

// Explicit return type restores field-level type inference for form.data
// after the `as any` cast on the schema suppresses the ZodObjectType error.
type CollectionForm = SuperValidated<Infer<typeof createCollectionSchema>>

export const load: PageServerLoad = async ({ parent }) => {
  // parent() reads the root layout's load result (which contains { user }).
  // This avoids making a second /auth/me request — the layout already fetched it.
  const { user } = await parent()

  if (!user) {
    // Redirect unauthenticated users to login.
    redirect(303, '/login')
  }

  // superValidate with no data creates an empty form populated with default values
  // (empty strings, `true` for isPublic). It also derives HTML constraint attributes
  // (required, minlength, maxlength) from the Zod schema for native browser validation.
  const form = (await superValidate(zod(createCollectionSchema as any))) as unknown as CollectionForm
  return { form }
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    // superValidate(request, ...) parses the FormData from the POST body
    // and runs the Zod schema against it. Returns { valid, data, errors }.
    const form = (await superValidate(request, zod(createCollectionSchema as any))) as unknown as CollectionForm

    // If any field fails validation, return fail(400, { form }).
    // Superforms on the client receives this and populates $errors automatically.
    // The form field values are also preserved so the user doesn't lose their input.
    if (!form.valid) return fail(400, { form })

    const api = makeApi(cookies.get('curated_session'))

    // Parse the comma-separated tags string into a string array
    const tags =
      form.data.tags
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean) ?? []

    let collection: CollectionDetail
    try {
      collection = await api<CollectionDetail>('/collections', {
        method: 'POST',
        body: JSON.stringify({
          title: form.data.title,
          description: form.data.description,
          isPublic: form.data.isPublic,
          tags,
        }),
      })
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, { form })
      }
      return fail(500, { form })
    }

    // redirect() throws a special SvelteKit Response with status 303.
    // SvelteKit catches it and sends the redirect to the browser.
    // The browser navigates to the new collection's detail page.
    redirect(303, `/collections/${collection.id}`)
  },
}
