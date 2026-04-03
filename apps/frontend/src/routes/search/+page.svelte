<script lang="ts">
  // Search page — demonstrates URL-driven state with a GET form.
  //
  // The form uses method="GET" so submitting navigates to /search?q=<value>.
  // SvelteKit intercepts the navigation, re-runs the load() with the new URL,
  // and updates the page — no JavaScript required (progressive enhancement).
  //
  // The input is pre-filled with data.q so the query persists across navigations.

  import CollectionCard from '$lib/components/CollectionCard.svelte'
  import type { Collection } from '$lib/types'

  let { data } = $props()

  // Typesense returns flat documents — reshape them into the Collection shape
  // that CollectionCard expects (nested owner, _count, tags array of objects).
  const collections = $derived(() => {
    const r = data.results as any
    const docs: any[] = Array.isArray(r) ? r : (r?.hits?.map((h: any) => h.document) ?? [])
    return docs.map((doc): Collection => ({
      id: doc.id,
      slug: doc.slug ?? '',
      title: doc.title,
      description: doc.description ?? null,
      coverUrl: doc.coverUrl ?? null,
      createdAt: new Date(doc.createdAt * 1000).toISOString(),
      isPublic: doc.isPublic,
      owner: { id: '', username: doc.ownerUsername, displayName: doc.ownerUsername, avatarUrl: null },
      tags: (doc.tags ?? []).map((name: string) => ({ tag: { name } })),
      _count: { items: doc.itemCount ?? 0, likes: doc.likeCount ?? 0, followers: doc.followCount ?? 0 },
    }))
  })
</script>

<svelte:head>
  <title>{data.q ? `"${data.q}" — Search` : 'Search'} — Curated</title>
</svelte:head>

<h1 class="text-2xl font-bold text-gray-900 mb-6">Search</h1>

<!-- GET form — submitting navigates to ?q=<value>.
     SvelteKit re-runs the load() which fetches new results from Typesense.
     Works without JavaScript: the browser handles the form submission natively. -->
<form method="GET" class="mb-8">
  <div class="flex gap-3 max-w-lg">
    <input
      name="q"
      value={data.q}
      placeholder="Search collections…"
      autofocus
      class="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm
             focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
    />
    <button
      type="submit"
      class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white
             hover:bg-indigo-700 transition-colors"
    >
      Search
    </button>
  </div>
</form>

{#if data.q}
  {#if collections().length === 0}
    <p class="text-gray-500 text-sm">No results for "<strong>{data.q}</strong>".</p>
  {:else}
    <p class="text-sm text-gray-500 mb-4">{collections().length} result{collections().length === 1 ? '' : 's'} for "<strong>{data.q}</strong>"</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each collections() as collection (collection.id)}
        <CollectionCard {collection} />
      {/each}
    </div>
  {/if}
{:else}
  <p class="text-gray-400 text-sm">Enter a search term above to find collections.</p>
{/if}
