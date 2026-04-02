<script lang="ts">
  // A clickable tag pill that links to /?tag=<name> to filter the home collection grid.
  // `active` highlights the pill when the current page is already filtered by this tag.

  interface Props {
    name: string
    active?: boolean
  }

  let { name, active = false }: Props = $props()
</script>

<a
  href="/?tag={encodeURIComponent(name)}"
  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors
         {active
           ? 'bg-indigo-600 text-white'
           : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}"
>
  {name}
</a>
