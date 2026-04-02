<script lang="ts">
  import CollectionCard from '$lib/components/CollectionCard.svelte'
  import TagPill from '$lib/components/TagPill.svelte'

  let { data } = $props()
</script>

<svelte:head>
  <title>Curated — Discover collections</title>
</svelte:head>

<!-- Trending section -->
{#if data.trending.length > 0}
  <section class="mb-10">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Trending this week</h2>
    <!-- Horizontal scroll row on mobile, 4-col grid on larger screens -->
    <div class="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
      {#each data.trending as collection (collection.id)}
        <div class="flex-shrink-0 w-72 sm:w-auto">
          <CollectionCard {collection} />
        </div>
      {/each}
    </div>
  </section>
{/if}

<!-- Tag filter bar -->
{#if data.tags.length > 0}
  <div class="flex gap-2 flex-wrap mb-6">
    <!-- "All" pill clears the tag filter -->
    <a
      href="/"
      class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors
             {!data.activeTag
               ? 'bg-indigo-600 text-white'
               : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}"
    >
      All
    </a>
    {#each data.tags as tag (tag.id)}
      <TagPill name={tag.name} active={data.activeTag === tag.name} />
    {/each}
  </div>
{/if}

<!-- Collections grid -->
<section>
  <h2 class="text-lg font-semibold text-gray-900 mb-4">
    {data.activeTag ? `#${data.activeTag}` : 'Browse collections'}
  </h2>

  {#if data.collections.items.length === 0}
    <p class="text-gray-500 text-sm">
      {data.activeTag ? `No collections tagged "${data.activeTag}" yet.` : 'No collections yet.'}
    </p>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.collections.items as collection (collection.id)}
        <CollectionCard {collection} />
      {/each}
    </div>

    <!-- Pagination — cursor-based: link to next page if nextCursor is set -->
    {#if data.collections.nextCursor}
      <div class="mt-8 text-center">
        <a
          href="?{data.activeTag ? `tag=${data.activeTag}&` : ''}cursor={data.collections.nextCursor}"
          class="inline-flex items-center rounded-full border border-gray-200 px-5 py-2 text-sm
                 font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          Load more
        </a>
      </div>
    {/if}
  {/if}
</section>
