<script lang="ts">
  // Root layout component — wraps every page.
  //
  // Imports app.css (Tailwind) and renders the Navbar with the current user.
  // In Svelte 5, the <slot /> becomes {@render children()} via the Snippet API.
  // `data` is typed from +layout.server.ts return value (includes `user`).

  import '../app.css'
  import Navbar from '$lib/components/Navbar.svelte'

  let { data, children } = $props()
</script>

<Navbar user={data.user ?? null} />

<main class="mx-auto max-w-5xl px-4 py-8">
  {@render children()}
</main>
