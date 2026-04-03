<script lang="ts">
  // Collection detail page — demonstrates two forms with two different patterns:
  //
  // 1. Like toggle: plain use:enhance from $app/forms with manual optimistic update.
  //    No Superforms needed — there's no user-entered data to validate.
  //
  // 2. Add-link form: superForm with Zod validation, $errors, $message, and an
  //    onUpdated callback to refresh the page data after a successful add.

  import { enhance } from '$app/forms'
  import { superForm } from 'sveltekit-superforms'
  // zodClient is the browser-optimised adapter — same validation logic as zod() but
  // tree-shaken to exclude server-only code. Use this in superForm() validators option.
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters'
  import { invalidateAll } from '$app/navigation'
  import Avatar from '$lib/components/Avatar.svelte'
  import LinkCard from '$lib/components/LinkCard.svelte'
  import TagPill from '$lib/components/TagPill.svelte'
  import { addLinkSchema } from '$lib/schemas'
  import {fly, slide, fade} from 'svelte/transition';

  let { data } = $props()

  // Optimistic like state — initialised from server data.
  // We don't know if the current user has liked this collection (the backend doesn't
  // return a viewerHasLiked field in the PoC), so we default to false.
  // likeCount is initialised from the server value then managed locally for optimistic updates.
  let liked = $state(false)
  let likeCount = $state(data.collection._count.likes)

  // Add-link superForm setup.
  // validators: zodClient(addLinkSchema) enables client-side pre-validation before the
  // POST reaches the server — catches invalid URLs immediately without a round-trip.
  // onUpdated fires after $form/$errors/$message stores update post-server-response.
  const {
    form: linkForm,
    errors: linkErrors,
    constraints: linkConstraints,
    enhance: linkEnhance,
    submitting: linkSubmitting,
    message: linkMessage,
  } = superForm(data.addLinkForm, {
    validators: zodClient(addLinkSchema as any),
    onUpdated: ({ form }) => {
      // Re-run all load() functions to refresh the items list when a link was added.
      // invalidateAll() is the SvelteKit way to trigger a full data refresh.
      if (form.valid) invalidateAll()
    },
  })

  // $derived keeps isOwner reactive to data prop changes on client navigation
  const isOwner = $derived(data.user?.id === data.collection.owner.id)

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
</script>

<svelte:head>
  <title>{data.collection.title} — Curated</title>
</svelte:head>

<!-- Collection header -->
<div class="mb-8">
  {#if data.collection.coverUrl}
    <img
      src={data.collection.coverUrl}
      alt={data.collection.title}
      class="w-full h-48 object-cover rounded-2xl mb-6"
    />
  {/if}

  <!-- Tags -->
  {#if data.collection.tags.length > 0}
    <div class="flex gap-2 flex-wrap mb-3">
      {#each data.collection.tags as collectionTag}
        <TagPill name={collectionTag.tag.name} />
      {/each}
    </div>
  {/if}

  <h1 class="text-2xl font-bold text-gray-900 mb-2">{data.collection.title}</h1>

  {#if data.collection.description}
    <p class="text-gray-600 mb-4">{data.collection.description}</p>
  {/if}

  <!-- Owner + stats row -->
  <div class="flex items-center justify-between flex-wrap gap-4">
    <a href="/users/{data.collection.owner.username}" class="flex items-center gap-2 group">
      <Avatar
        avatarUrl={data.collection.owner.avatarUrl}
        username={data.collection.owner.username}
        displayName={data.collection.owner.displayName}
        size="md"
      />
      <div>
        <p class="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
          {data.collection.owner.displayName ?? data.collection.owner.username}
        </p>
        <p class="text-xs text-gray-400">@{data.collection.owner.username}</p>
      </div>
    </a>

    <div class="flex items-center gap-3 text-sm text-gray-500">
      <span>{data.collection._count.items} links</span>
      <span>·</span>
      <span>{formatDate(data.collection.createdAt)}</span>

      <!-- Like toggle — uses plain use:enhance (no user data = no Superforms needed).
           The enhance callback function runs BEFORE the form submits:
           - We flip `liked` and update `likeCount` immediately (optimistic update).
           - The returned async function runs AFTER the server responds:
             - On failure: revert both state values.
             - On success: call update() to sync SvelteKit's page data. -->
      <form
        method="POST"
        action={liked ? '?/unlike' : '?/like'}
        use:enhance={() => {
          liked = !liked
          likeCount += liked ? 1 : -1
          return async ({ result, update }) => {
            if (result.type !== 'success') {
              liked = !liked
              likeCount += liked ? 1 : -1
            }
            // reset:false prevents Svelte from clearing other form fields on the page
            await update({ reset: false })
          }
        }}
      >
        <button
          type="submit"
          class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
                 transition-colors border
                 {liked
                   ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                   : 'border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500'}"
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {liked ? '❤️' : '🤍'} {likeCount}
        </button>
      </form>
    </div>
  </div>
</div>

<!-- Delete collection (owner only) -->
{#if isOwner}
  <div class="mb-6 flex justify-end">
    <form
      method="POST"
      action="?/deleteCollection"
      use:enhance={({ cancel }) => {
        if (!confirm('Delete this collection? This cannot be undone.')) {
          cancel()
        }
      }}
    >
      <button
        type="submit"
        class="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600
               hover:bg-red-50 transition-colors"
      >
        Delete collection
      </button>
    </form>
  </div>
{/if}

<!-- Add-link form (visible to collection owner only) -->
{#if isOwner}
  <div class="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
    <h2 class="text-sm font-semibold text-gray-700 mb-3">Add a link</h2>

    <!-- use:linkEnhance is Superforms' enhanced version of use:enhance.
         It runs client-side validation (via the validators option) before submitting,
         and updates $linkForm/$linkErrors/$linkMessage stores without a page reload. -->
    <form method="POST" action="?/addLink" use:linkEnhance class="space-y-3">
      <div>
        <input
          name="url"
          type="url"
          bind:value={$linkForm.url}
          {...$linkConstraints.url}
          placeholder="https://example.com"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
                 {$linkErrors.url ? 'border-red-300' : ''}"
        />
        {#if $linkErrors.url}
          <!-- $linkErrors.url is a string[] — join for display -->
          <!-- In Superforms 2.x, field errors is a string[] — access first error with [0] -->
          <p class="mt-1 text-xs text-red-600">{$linkErrors.url?.[0]}</p>
        {/if}
      </div>

      <div>
        <input
          name="note"
          bind:value={$linkForm.note}
          placeholder="Add a note… (optional)"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        />
      </div>

      <div class="flex items-center gap-3">
        <button
          type="submit"
          disabled={$linkSubmitting}
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {$linkSubmitting ? 'Adding…' : 'Add link'}
        </button>

        {#if $linkMessage}
          <!-- $linkMessage is set by message(form, 'Link added!') in the server action -->
          <p class="text-sm text-green-600 font-medium">{$linkMessage}</p>
        {/if}
      </div>
    </form>
  </div>
{/if}

<!-- Links list -->
{#if data.collection.items.length === 0}
  <div class="text-center py-16 text-gray-400">
    <p class="text-lg mb-1">No links yet</p>
    {#if isOwner}
      <p class="text-sm">Add your first link above.</p>
    {/if}
  </div>
{:else}
  <div class="space-y-3">
    {#each data.collection.items as item (item.id)}
      <div class="relative group" in:fly={{ y: 20 }} out:slide>
        <LinkCard {item} />

        <!-- Remove button — only shown to the collection owner on hover -->
        {#if isOwner}
          <form
            method="POST"
            action="?/removeItem"
            use:enhance
            class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              class="rounded-full w-7 h-7 flex items-center justify-center
                     bg-white border border-gray-200 text-gray-400 hover:text-red-500
                     hover:border-red-200 shadow-sm text-xs transition-colors"
              aria-label="Remove link"
            >
              ✕
            </button>
          </form>
        {/if}
      </div>
    {/each}
  </div>
{/if}
