// Server-side API helper — cookie forwarding to the Fastify backend.
//
// WHY $lib/server/?
// SvelteKit enforces that files in $lib/server/ can only be imported by server-side code
// (+page.server.ts, +layout.server.ts, +server.ts). If a client component accidentally
// imports this file, the build fails with a clear error. This prevents BACKEND_URL and
// session cookie values from leaking to the browser bundle.
//
// WHY NOT use event.fetch()?
// SvelteKit's event.fetch() only forwards cookies automatically for same-origin requests.
// Our backend runs on a different port (3000), so we must add the Cookie header manually.
// The Vite proxy (/api → localhost:3000) only works for browser requests — server-side
// Node.js fetch bypasses it entirely and talks directly to the backend URL.

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function makeApi(sessionCookie: string | undefined) {
  // Build the Cookie header once. If the user is unauthenticated (no cookie),
  // no Cookie header is sent — public endpoints still work fine without it.
  const cookieHeader = sessionCookie ? `curated_session=${sessionCookie}` : ''

  // Returns a typed fetch wrapper. The generic T tells TypeScript what shape to cast the response to.
  return async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BACKEND}/api/v1${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        // Spread cookie header only when we have one — avoids sending an empty Cookie: header
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        // Caller-provided headers are spread last so they can override defaults
        // (e.g. a DELETE request may omit Content-Type)
        ...init.headers,
      },
    })

    // 204 No Content — returned by DELETE endpoints; cast to T (callers type these as Promise<void>)
    if (res.status === 204) return undefined as T

    if (!res.ok) {
      // Fastify returns { error: "message" } on 4xx/5xx
      const body = await res.json().catch(() => ({ error: res.statusText }))
      throw new ApiError(res.status, body.error ?? res.statusText)
    }

    return res.json() as Promise<T>
  }
}
