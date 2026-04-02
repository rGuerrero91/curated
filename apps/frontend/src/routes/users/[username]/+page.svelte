<script lang="ts">
  import { enhance } from '$app/forms'
  import Avatar from '$lib/components/Avatar.svelte'
  import CollectionCard from '$lib/components/CollectionCard.svelte'

  let { data } = $props()

  const { profile } = data

  // Optimistic follow state — same pattern as the like button.
  // Default to not-following; in a full app you'd track this server-side.
  let following = $state(false)
  let followerCount = $state(profile._count.followers)

  const isOwnProfile = $derived(data.user?.username === profile.username)
</script>

<svelte:head>
  <title>@{profile.username} — Curated</title>
</svelte:head>

<!-- Profile header -->
<div class="mb-8">
  <div class="flex items-start gap-5">
    <Avatar
      avatarUrl={profile.avatarUrl}
      username={profile.username}
      displayName={profile.displayName}
      size="lg"
    />

    <div class="flex-1 min-w-0">
      <h1 class="text-xl font-bold text-gray-900">
        {profile.displayName ?? profile.username}
      </h1>
      <p class="text-sm text-gray-500 mb-2">@{profile.username}</p>

      {#if profile.bio}
        <p class="text-sm text-gray-600 mb-3">{profile.bio}</p>
      {/if}

      {#if profile.websiteUrl}
        <a
          href={profile.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-indigo-600 hover:underline"
        >
          {profile.websiteUrl.replace(/^https?:\/\//, '')}
        </a>
      {/if}
    </div>

    <!-- Follow / unfollow button (not shown on own profile) -->
    {#if data.user && !isOwnProfile}
      <form
        method="POST"
        action={following ? '?/unfollow' : '?/follow'}
        use:enhance={() => {
          following = !following
          followerCount += following ? 1 : -1
          return async ({ result, update }) => {
            if (result.type !== 'success') {
              following = !following
              followerCount += following ? 1 : -1
            }
            await update({ reset: false })
          }
        }}
      >
        <button
          type="submit"
          class="rounded-full px-5 py-2 text-sm font-medium border transition-colors
                 {following
                   ? 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-600'
                   : 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'}"
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </form>
    {:else if isOwnProfile}
      <a
        href="/settings"
        class="rounded-full px-5 py-2 text-sm font-medium border border-gray-200
               text-gray-700 hover:border-gray-300 transition-colors"
      >
        Edit profile
      </a>
    {/if}
  </div>

  <!-- Stats row -->
  <div class="flex gap-6 mt-5 text-sm text-gray-600">
    <div>
      <span class="font-semibold text-gray-900">{profile._count.collections}</span>
      <span class="ml-1 text-gray-500">collections</span>
    </div>
    <div>
      <span class="font-semibold text-gray-900">{followerCount}</span>
      <span class="ml-1 text-gray-500">followers</span>
    </div>
    <div>
      <span class="font-semibold text-gray-900">{profile._count.following}</span>
      <span class="ml-1 text-gray-500">following</span>
    </div>
  </div>
</div>

<!-- Collections grid -->
{#if data.collections.items.length === 0}
  <p class="text-gray-500 text-sm">No public collections yet.</p>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each data.collections.items as collection (collection.id)}
      <CollectionCard {collection} />
    {/each}
  </div>

  {#if data.collections.nextCursor}
    <div class="mt-8 text-center">
      <a
        href="/users/{profile.username}?cursor={data.collections.nextCursor}"
        class="inline-flex items-center rounded-full border border-gray-200 px-5 py-2 text-sm
               font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
      >
        Load more
      </a>
    </div>
  {/if}
{/if}
