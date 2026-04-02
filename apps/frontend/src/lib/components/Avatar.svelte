<script lang="ts">
  // Displays a user avatar image with an initials fallback.
  // When avatarUrl is null (new users haven't uploaded one yet), renders
  // a colored circle with the first letter of username or displayName.

  interface Props {
    avatarUrl: string | null
    username: string
    displayName?: string | null
    size?: 'sm' | 'md' | 'lg'
    class?: string
  }

  let { avatarUrl, username, displayName, size = 'md', class: className = '' }: Props = $props()

  // Derive initials: prefer first char of displayName, fall back to username
  const initial = $derived((displayName ?? username).charAt(0).toUpperCase())

  // Consistent color from username — makes the same user always the same color
  const colors = [
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
  ]
  const color = $derived(colors[username.charCodeAt(0) % colors.length])

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-xl',
  }
</script>

{#if avatarUrl}
  <img
    src={avatarUrl}
    alt={displayName ?? username}
    class="rounded-full object-cover {sizeClasses[size]} {className}"
  />
{:else}
  <div
    class="rounded-full flex items-center justify-center font-semibold text-white {color} {sizeClasses[size]} {className}"
    aria-label={displayName ?? username}
  >
    {initial}
  </div>
{/if}
