<script lang="ts">
  // Login page — client-side only (no +page.server.ts).
  //
  // WHY client-side?
  // Firebase Auth uses browser APIs: Google OAuth requires a popup window, and email
  // sign-in uses Firebase's own client SDK. Neither can run in Node.js (server-side).
  //
  // FLOW:
  // 1. User signs in with Firebase (Google popup or email/password form)
  // 2. Firebase returns a short-lived ID token (JWT, ~1h TTL)
  // 3. We POST to /api/v1/auth/session with Authorization: Bearer <token>
  //    → Vite proxies this to Fastify → Fastify verifies token, upserts user,
  //      sets curated_session HttpOnly cookie on the browser response
  // 4. goto('/') — subsequent SSR loads will find the cookie and auth the user

  import { goto } from '$app/navigation'
  import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '$lib/firebase'

  let mode = $state<'signin' | 'signup'>('signin')
  let email = $state('')
  let password = $state('')
  let error = $state<string | null>(null)
  let loading = $state(false)

  // Exchange the Firebase ID token for an iron-session cookie via the Fastify backend.
  // The fetch goes to /api/v1/auth/session — the Vite proxy rewrites this to
  // http://localhost:3000/api/v1/auth/session. The backend's Set-Cookie response header
  // is forwarded by the proxy and attributed to localhost:5173 (the SvelteKit origin).
  async function exchangeToken(idToken: string) {
    const res = await fetch('/api/v1/auth/session', {
      method: 'POST',
      credentials: 'include', // ensure the browser stores the Set-Cookie response
      headers: { Authorization: `Bearer ${idToken}` },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? 'Failed to create session')
    }
  }

  async function handleGoogle() {
    error = null
    loading = true
    try {
      const firebaseUser = await signInWithGoogle()
      const idToken = await firebaseUser.getIdToken()
      await exchangeToken(idToken)
      await goto('/')
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign in failed'
    } finally {
      loading = false
    }
  }

  async function handleEmailSubmit(e: SubmitEvent) {
    e.preventDefault()
    error = null
    loading = true
    try {
      const firebaseUser =
        mode === 'signin'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password)
      const idToken = await firebaseUser.getIdToken()
      await exchangeToken(idToken)
      await goto('/')
    } catch (err) {
      error = err instanceof Error ? err.message : 'Authentication failed'
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Sign in — Curated</title>
</svelte:head>

<div class="min-h-[70vh] flex items-center justify-center">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        {mode === 'signin' ? 'Welcome back' : 'Create an account'}
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        {mode === 'signin' ? 'Sign in to your Curated account' : 'Join Curated today'}
      </p>
    </div>

    <!-- Google sign-in -->
    <button
      onclick={handleGoogle}
      disabled={loading}
      class="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200
             bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm
             hover:bg-gray-50 disabled:opacity-50 transition-colors mb-4"
    >
      <!-- Google logo SVG -->
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>

    <div class="relative mb-4">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-xs text-gray-400 bg-white px-2">
        <span class="bg-white px-2">or</span>
      </div>
    </div>

    <!-- Email/password form -->
    <!-- Note: this is a plain HTML form with an onsubmit handler — not a Superforms form.
         Superforms is designed for server-side form actions, but login must be client-side
         (Firebase token is obtained in the browser). -->
    <form onsubmit={handleEmailSubmit} class="space-y-3">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          autocomplete="email"
          class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
          class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      {#if error}
        <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white
               hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-gray-500">
      {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
      <button
        onclick={() => { mode = mode === 'signin' ? 'signup' : 'signin'; error = null }}
        class="text-indigo-600 hover:underline font-medium"
      >
        {mode === 'signin' ? 'Sign up' : 'Sign in'}
      </button>
    </p>
  </div>
</div>
