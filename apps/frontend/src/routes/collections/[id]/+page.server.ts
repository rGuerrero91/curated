// Collection detail page — loads full collection data and handles all mutations.
//
// Named actions on this page:
//   like / unlike   — toggle the current user's like on the collection
//   addLink         — submit a URL + note; creates a Link then adds it as a CollectionItem
//   removeItem      — remove a CollectionItem (owner only)

import { fail, error } from '@sveltejs/kit'
import { superValidate, message, type SuperValidated, type Infer } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import type { PageServerLoad, Actions } from './$types'
import { makeApi, ApiError } from '$lib/server/api'
import { addLinkSchema } from '$lib/schemas'
import type { CollectionDetail, Link, CollectionItem } from '$lib/types'

// Explicit form type preserves field-level inference after the `as any` schema cast.
// See collections/new/+page.server.ts for a full explanation of the cast rationale.
type AddLinkForm = SuperValidated<Infer<typeof addLinkSchema>>

export const load: PageServerLoad = async ({ params, cookies }) => {
  const api = makeApi(cookies.get('curated_session'))

  let collection: CollectionDetail
  try {
    collection = await api<CollectionDetail>(`/collections/${params.id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      error(404, 'Collection not found')
    }
    throw err
  }

  // Initialize the add-link form with default empty values + Zod-derived HTML constraints.
  // Superforms requires this to be returned from load() so the client-side superForm()
  // call has the initial form data to bind to.
  // Double cast: `zod(schema as any)` silences the ZodObjectType parameter error,
  // then `as unknown as AddLinkForm` restores field-level types for form.data.
  // Runtime is correct — TypeScript just can't prove it across the monorepo Zod versions.
  const addLinkForm = (await superValidate(zod(addLinkSchema as any))) as unknown as AddLinkForm

  return { collection, addLinkForm }
}

export const actions: Actions = {
  // POST ?/like — add a like for the current user
  like: async ({ params, cookies }) => {
    const api = makeApi(cookies.get('curated_session'))
    try {
      await api<void>(`/collections/${params.id}/like`, { method: 'POST' })
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, { error: err.message })
      }
      return fail(500, { error: 'Failed to like' })
    }
    return { success: true }
  },

  // POST ?/unlike — remove the current user's like
  unlike: async ({ params, cookies }) => {
    const api = makeApi(cookies.get('curated_session'))
    try {
      await api<void>(`/collections/${params.id}/like`, { method: 'DELETE' })
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, { error: err.message })
      }
      return fail(500, { error: 'Failed to unlike' })
    }
    return { success: true }
  },

  // POST ?/addLink — submit a URL, scrape it, then add it to this collection
  addLink: async ({ params, request, cookies }) => {
    // superValidate(request, zod(schema)) reads the FormData from the POST body
    // and validates it against the Zod schema. Returns { valid, data, errors }.
    const form = (await superValidate(request, zod(addLinkSchema as any))) as unknown as AddLinkForm

    // fail(400, { form }) returns the form object with errors back to the client.
    // Superforms on the client automatically populates $errors without a page reload.
    if (!form.valid) return fail(400, { form })

    const api = makeApi(cookies.get('curated_session'))

    try {
      // Step 1: Submit the URL — the backend deduplicates by URL and queues a scraper job.
      // The link id is returned immediately (scraping happens asynchronously in the worker).
      const link = await api<Link>('/links', {
        method: 'POST',
        body: JSON.stringify({ url: form.data.url }),
      })

      // Step 2: Add the (possibly unscraped) link to this collection.
      await api<CollectionItem>(`/collections/${params.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ linkId: link.id, note: form.data.note }),
      })
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, { form })
      }
      return fail(500, { form })
    }

    // message(form, ...) sets form.message on the returned result.
    // The client reads this via the $message store to show a success notification.
    return message(form, 'Link added!')
  },

  // POST ?/removeItem — remove a link from this collection (owner only)
  removeItem: async ({ params, request, cookies }) => {
    const data = await request.formData()
    const itemId = data.get('itemId') as string

    if (!itemId) return fail(400, { error: 'Missing itemId' })

    const api = makeApi(cookies.get('curated_session'))
    try {
      await api<void>(`/collections/${params.id}/items/${itemId}`, { method: 'DELETE' })
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, { error: err.message })
      }
      return fail(500, { error: 'Failed to remove link' })
    }
    return { success: true }
  },
}
