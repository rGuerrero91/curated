<script lang="ts">
  // A single link item row within a collection detail view.
  // Shows: favicon, title + domain, optional thumbnail, and note.

  import type { CollectionItem } from '$lib/types'

  interface Props {
    item: CollectionItem
  }

  let { item }: Props = $props()

  const { link } = item

  // Fallback favicon from Google's public favicon service when the backend hasn't provided one
  const faviconSrc = $derived(
    link.faviconUrl ?? `https://www.google.com/s2/favicons?domain=${link.domain}&sz=32`,
  )
</script>

<div class="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-colors group">
  <!-- Favicon -->
  <div class="flex-shrink-0 mt-0.5">
    <img
      src={faviconSrc}
      alt=""
      class="w-5 h-5 rounded"
      onerror={(e) => {
        // If both favicon sources fail, hide the image gracefully
        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
      }}
    />
  </div>

  <!-- Main content -->
  <div class="flex-1 min-w-0">
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      class="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
    >
      {link.title ?? link.url}
    </a>

    <p class="text-xs text-gray-400 mt-0.5 truncate">{link.domain}</p>

    {#if link.description}
      <p class="text-sm text-gray-500 mt-1.5 line-clamp-2">{link.description}</p>
    {/if}

    {#if item.note}
      <!-- User's personal note on this link — visually distinct from the link description -->
      <p class="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5 mt-2 italic">
        "{item.note}"
      </p>
    {/if}
  </div>

  <!-- Thumbnail -->
  {#if link.thumbnailUrl}
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      class="flex-shrink-0 hidden sm:block"
    >
      <img
        src={link.thumbnailUrl}
        alt={link.title ?? link.domain}
        class="w-20 h-14 object-cover rounded-lg"
      />
    </a>
  {/if}
</div>
