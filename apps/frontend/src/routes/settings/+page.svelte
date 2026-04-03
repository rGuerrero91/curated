<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters'
  import { profileSchema } from '$lib/schemas'

  let { data } = $props()

  const { form, errors, constraints, enhance, submitting, message } = superForm(data.form, {
    validators: zodClient(profileSchema as any),
  })
</script>

<svelte:head>
  <title>Edit profile — Curated</title>
</svelte:head>

<div class="max-w-lg mx-auto">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit profile</h1>

  <form method="POST" use:enhance class="space-y-5">
    <div>
      <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
      <input
        id="displayName"
        name="displayName"
        type="text"
        bind:value={$form.displayName}
        {...$constraints.displayName}
        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
               {$errors.displayName ? 'border-red-300 bg-red-50' : ''}"
      />
      {#if $errors.displayName}<p class="mt-1 text-xs text-red-600">{$errors.displayName?.[0]}</p>{/if}
    </div>

    <div>
      <label for="username" class="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
      <div class="flex items-center rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-transparent {$errors.username ? 'border-red-300 bg-red-50' : ''}">
        <span class="pl-4 text-sm text-gray-400">@</span>
        <input
          id="username"
          name="username"
          type="text"
          bind:value={$form.username}
          {...$constraints.username}
          class="flex-1 px-2 py-2.5 text-sm bg-transparent focus:outline-none"
        />
      </div>
      {#if $errors.username}<p class="mt-1 text-xs text-red-600">{$errors.username?.[0]}</p>{/if}
    </div>

    <div>
      <label for="bio" class="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
      <textarea
        id="bio"
        name="bio"
        rows={3}
        bind:value={$form.bio}
        {...$constraints.bio}
        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
               {$errors.bio ? 'border-red-300 bg-red-50' : ''}"
        placeholder="Tell people a bit about yourself…"
      ></textarea>
      {#if $errors.bio}<p class="mt-1 text-xs text-red-600">{$errors.bio?.[0]}</p>{/if}
    </div>

    <div>
      <label for="websiteUrl" class="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
      <input
        id="websiteUrl"
        name="websiteUrl"
        type="url"
        bind:value={$form.websiteUrl}
        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
               {$errors.websiteUrl ? 'border-red-300 bg-red-50' : ''}"
        placeholder="https://yoursite.com"
      />
      {#if $errors.websiteUrl}<p class="mt-1 text-xs text-red-600">{$errors.websiteUrl?.[0]}</p>{/if}
    </div>

    <div class="flex items-center gap-3">
      <input
        id="isPrivate"
        name="isPrivate"
        type="checkbox"
        bind:checked={$form.isPrivate as boolean}
        class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
      />
      <label for="isPrivate" class="text-sm text-gray-700">
        Private account
        <span class="text-gray-400">(only approved followers see your collections)</span>
      </label>
    </div>

    {#if $message}
      <p class="text-sm text-green-600">{$message}</p>
    {/if}

    <div class="flex items-center gap-4 pt-2">
      <button
        type="submit"
        disabled={$submitting}
        class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white
               hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {$submitting ? 'Saving…' : 'Save changes'}
      </button>
      <a href="/" class="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
    </div>
  </form>
</div>
