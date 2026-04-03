<script lang="ts">
  // Create collection form — demonstrates the full Superforms client pattern:
  //
  // - superForm(data.form, { validators }) wraps the server-initialised form into
  //   reactive Svelte stores: $form, $errors, $constraints, $submitting.
  //
  // - bind:value={$form.field} creates two-way binding between the store and the input.
  //
  // - {...$constraints.field} spreads HTML validation attributes (required, minlength,
  //   maxlength) onto the input so the form works without JavaScript too.
  //
  // - $errors.field is populated by Superforms after a failed server action,
  //   or immediately by client-side validation if validators are configured.
  //
  // - $submitting is true between form submit and server response — disables the button.
  //
  // - use:enhance is Superforms' enhanced version: intercepts submit, runs client-side
  //   validation, then submits via fetch and updates stores without a full page reload.

  import { superForm } from 'sveltekit-superforms'
  // zodClient is the browser-optimised version of the zod adapter.
  // It enables client-side validation inside superForm() without pulling in server-only code.
  import { zod4Client as zodClient } from 'sveltekit-superforms/adapters'
  import { createCollectionSchema } from '$lib/schemas'

  let { data } = $props()

  const { form, errors, constraints, enhance, submitting } = superForm(data.form, {
    // validators enables client-side Zod validation on every field change.
    // Without this, validation only happens after the form is submitted to the server.
    validators: zodClient(createCollectionSchema as any),
  })
</script>

<svelte:head>
  <title>New collection — Curated</title>
</svelte:head>

<div class="max-w-lg mx-auto">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">Create a collection</h1>

  <!-- method="POST" with no action defaults to the page's default action. -->
  <!-- use:enhance intercepts the submit — no full page reload on validation errors. -->
  <form method="POST" use:enhance class="space-y-5">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1.5">
        Title <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        name="title"
        type="text"
        bind:value={$form.title}
        {...$constraints.title}
        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
               {$errors.title ? 'border-red-300 bg-red-50' : ''}"
        placeholder="e.g. Design tools I actually use"
      />
      {#if $errors.title}
        <!-- $errors.title?.[0] — Superforms 2.x field errors; use [0] for first message -->
        <p class="mt-1 text-xs text-red-600">{$errors.title?.[0]}</p>
      {/if}
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1.5">
        Description
      </label>
      <textarea
        id="description"
        name="description"
        rows={3}
        bind:value={$form.description}
        {...$constraints.description}
        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
               {$errors.description ? 'border-red-300 bg-red-50' : ''}"
        placeholder="What's this collection about?"
      ></textarea>
      {#if $errors.description}
        <p class="mt-1 text-xs text-red-600">{$errors.description?.[0]}</p>
      {/if}
    </div>

    <!-- Tags -->
    <div>
      <label for="tags" class="block text-sm font-medium text-gray-700 mb-1.5">
        Tags
        <span class="text-gray-400 font-normal">(comma-separated)</span>
      </label>
      <input
        id="tags"
        name="tags"
        type="text"
        bind:value={$form.tags}
        class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        placeholder="design, tools, productivity"
      />
      <p class="mt-1 text-xs text-gray-400">Tags help others discover your collection.</p>
    </div>

    <!-- Public toggle -->
    <div class="flex items-center gap-3">
      <!-- bind:checked for boolean fields instead of bind:value -->
      <input
        id="isPublic"
        name="isPublic"
        type="checkbox"
        bind:checked={$form.isPublic as boolean}
        class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
      />
      <label for="isPublic" class="text-sm text-gray-700">
        Make this collection public
        <span class="text-gray-400">(others can discover and follow it)</span>
      </label>
    </div>

    <!-- Submit -->
    <div class="flex items-center gap-4 pt-2">
      <button
        type="submit"
        disabled={$submitting}
        class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white
               hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        <!-- $submitting is true while the server action is in-flight -->
        {$submitting ? 'Creating…' : 'Create collection'}
      </button>

      <a href="/" class="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
    </div>
  </form>
</div>
