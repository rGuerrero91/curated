<script lang="ts">
  import CollectionCard from '$lib/components/CollectionCard.svelte'

  let { data } = $props()
</script>

<svelte:head>
  <title>Your feed — Curated</title>
</svelte:head>

<h1 class="text-2xl font-bold text-gray-900 mb-6">Your feed</h1>

{#if data.feedData.items.length === 0}
  <div class="text-center py-20 text-gray-400">
    <p class="text-lg mb-1">Nothing here yet</p>
    <p class="text-sm">Follow some users or collections to see their content here.</p>
    <a href="/" class="mt-4 inline-block text-indigo-600 hover:underline text-sm">
      Browse collections →
    </a>
  </div>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each data.feedData.items as collection (collection.id)}
      <CollectionCard {collection} />
    {/each}
  </div>

  {#if data.feedData.nextCursor}
    <div class="mt-8 text-center">
      <a
        href="/feed?cursor={data.feedData.nextCursor}"
        class="inline-flex items-center rounded-full border border-gray-200 px-5 py-2 text-sm
               font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        Load more
      </a>
    </div>
  {/if}
{/if}
