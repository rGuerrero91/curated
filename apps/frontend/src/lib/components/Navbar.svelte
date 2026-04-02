<script lang="ts">
  // Site-wide navigation bar.
  //
  // Receives the current user from the layout (data.user) and renders:
  // - Logo linking to /
  // - Search form (GET method — submits to /search?q=...)
  // - Auth-conditional right side:
  //   - Unauthenticated: "Sign in" link
  //   - Authenticated: "New collection" link + avatar dropdown with logout form

  import { page } from '$app/stores'
  import Avatar from './Avatar.svelte'
  import type { User } from '$lib/types'

  interface Props {
    user: User | null
  }

  let { user }: Props = $props()

  let dropdownOpen = $state(false)

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen
  }

  function closeDropdown() {
    dropdownOpen = false
  }
</script>

<nav class="border-b border-gray-100 bg-white sticky top-0 z-40">
  <div class="mx-auto max-w-5xl px-4 flex items-center gap-4 h-14">
    <!-- Logo -->
    <a href="/" class="font-bold text-indigo-600 text-lg flex-shrink-0">curated</a>

    <!-- Search form — GET form navigates to /search?q=<value> on submit.
         SvelteKit intercepts and re-runs the load() — no JS required. -->
    <form method="GET" action="/search" class="flex-1 max-w-md">
      <input
        name="q"
        value={$page.url.searchParams.get('q') ?? ''}
        placeholder="Search collections…"
        class="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
      />
    </form>

    <!-- Right side -->
    <div class="flex items-center gap-3 ml-auto flex-shrink-0">
      {#if user}
        <a
          href="/collections/new"
          class="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5
                 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + New collection
        </a>

        <!-- Avatar dropdown -->
        <div class="relative">
          <button
            onclick={toggleDropdown}
            class="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="User menu"
          >
            <Avatar avatarUrl={user.avatarUrl} username={user.username} displayName={user.displayName} size="sm" />
          </button>

          {#if dropdownOpen}
            <!-- Backdrop to close dropdown on outside click -->
            <button
              class="fixed inset-0 z-10"
              onclick={closeDropdown}
              aria-label="Close menu"
              tabindex="-1"
            ></button>

            <div class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
              <a
                href="/users/{user.username}"
                onclick={closeDropdown}
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                @{user.username}
              </a>
              <a
                href="/feed"
                onclick={closeDropdown}
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My feed
              </a>
              <a
                href="/collections/new"
                onclick={closeDropdown}
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
              >
                New collection
              </a>
              <hr class="my-1 border-gray-100" />
              <!-- Logout uses a form POST to the SvelteKit action in logout/+page.server.ts.
                   Using a form (not a link) ensures logout works without JavaScript too. -->
              <form method="POST" action="/logout">
                <button
                  type="submit"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          {/if}
        </div>
      {:else}
        <a
          href="/login"
          class="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium
                 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          Sign in
        </a>
      {/if}
    </div>
  </div>
</nav>
