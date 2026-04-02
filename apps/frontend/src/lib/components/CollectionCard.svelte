<script lang="ts">
  // Collection card used in grids (home, feed, search, user profile).
  // Links to /collections/:id. Shows a cover image or gradient placeholder,
  // owner info, item/like counts, and tag pills.

  import Avatar from './Avatar.svelte'
  import TagPill from './TagPill.svelte'
  import type { Collection } from '$lib/types'

  interface Props {
    collection: Collection
  }

  let { collection }: Props = $props()

  // Generate a deterministic gradient for collections without a cover image.
  // Uses the collection id's char codes to pick gradient colors.
  const gradients = [
    'from-indigo-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-pink-400 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-green-400 to-teal-500',
    'from-violet-400 to-indigo-500',
  ]
  const gradient = $derived(
    gradients[collection.id.charCodeAt(collection.id.length - 1) % gradients.length],
  )
</script>

<a
  href="/collections/{collection.id}"
  class="group block rounded-2xl overflow-hidden border border-gray-100 bg-white
         shadow-sm hover:shadow-md transition-shadow"
>
  <!-- Cover image or gradient placeholder -->
  <div class="aspect-video overflow-hidden">
    {#if collection.coverUrl}
      <img
        src={collection.coverUrl}
        alt={collection.title}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    {:else}
      <div class="w-full h-full bg-linear-to-br {gradient} group-hover:opacity-90 transition-opacity" />
    {/if}
  </div>

  <div class="p-4">
    <!-- Collection title -->
    <h3 class="font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
      {collection.title}
    </h3>

    {#if collection.description}
      <p class="text-sm text-gray-500 line-clamp-2 mb-3">{collection.description}</p>
    {/if}

    <!-- Owner row -->
    <div class="flex items-center gap-2 mb-3">
      <Avatar
        avatarUrl={collection.owner.avatarUrl}
        username={collection.owner.username}
        displayName={collection.owner.displayName}
        size="sm"
      />
      <span class="text-xs text-gray-500">
        {collection.owner.displayName ?? collection.owner.username}
      </span>
    </div>

    <!-- Stats row -->
    <div class="flex items-center justify-between text-xs text-gray-400">
      <div class="flex items-center gap-3">
        <span>{collection._count.items} links</span>
        <span>❤️ {collection._count.likes}</span>
      </div>

      <!-- Tags (show max 2 to keep card compact) -->
      {#if collection.tags.length > 0}
        <div class="flex gap-1">
          {#each collection.tags.slice(0, 2) as collectionTag}
            <TagPill name={collectionTag.tag.name} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</a>
