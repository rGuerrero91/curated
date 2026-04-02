// See https://svelte.dev/docs/kit/types#app.d.ts
// This file extends SvelteKit's type system for App.PageData and App.Locals.

import type { User } from './lib/types'

declare global {
  namespace App {
    // PageData is merged into every page's data — layout load results appear here.
    interface PageData {
      user?: User | null
      // Required by sveltekit-superforms/dist/actionResult.d.ts for flash message support.
      // Declare as unknown if not using sveltekit-flash-message.
      flash?: unknown
    }
    // Required by sveltekit-superforms for its internal type system.
    // Superforms uses App.Superforms.Message for typed messages — declaring both an
    // interface (augmentation point) and a namespace (member access) via declaration merging.
    interface Superforms {}
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Superforms {
      type Message = unknown
    }
    // interface Error {}
    // interface Locals {}
    // interface Platform {}
  }
}

export {}
