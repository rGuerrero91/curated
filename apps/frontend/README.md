# Curated — Frontend Quickstart

SvelteKit 2 + Svelte 5 frontend for the Curated social bookmarking app.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs the backend stack
- [Node.js 22+](https://nodejs.org/) and npm
- A Firebase project with **Email/Password** and **Google** sign-in enabled

---

## 1. Install dependencies

From the repo root:

```bash
npm install
```

---

## 2. Configure the frontend environment

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Open `apps/frontend/.env` and fill in your Firebase **browser SDK** credentials (found in Firebase Console → Project Settings → Your apps → Web app):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

`BACKEND_URL` defaults to `http://localhost:3000` and does not need to change for local dev.

---

## 3. Start the backend

The frontend is server-side rendered and calls the Fastify API on every page load. The backend must be running first.

```bash
# In apps/backend/, copy and fill in the backend env (Firebase Admin SDK credentials, SESSION_SECRET, etc.)
cp apps/backend/.env.example apps/backend/.env

# Then from the repo root:
docker-compose build app worker
docker-compose up
```

Wait until you see:

```
app    | Fastify listening on 0.0.0.0:3000
```

First boot pulls Docker images and runs DB migrations — takes about a minute. See the [backend README](../backend/README.md) for full env var details.

**Seed test users and collections (optional):**

```bash
docker-compose exec app npm run db:seed
```

---

## 4. Start the frontend

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173).

> The Vite dev server proxies `/api/*` requests to `http://localhost:3000`, so the Firebase login flow works without CORS issues.

---

## How authentication works

Sign-in is the one client-side flow — Firebase Auth SDK must run in the browser:

1. Click **Sign in with Google** (or email/password) on the login page
2. Firebase SDK authenticates and returns a short-lived ID token
3. The frontend POSTs the token to `/api/v1/auth/session` via the Vite proxy
4. Fastify verifies the token, upserts the user, and sets an HttpOnly `curated_session` cookie
5. All subsequent SSR page loads forward the cookie to the Fastify API automatically

---

## Project structure

```
src/
├── app.html                   # HTML shell
├── app.css                    # Tailwind v4 entry (@import 'tailwindcss')
├── app.d.ts                   # Global type augmentations (App.PageData, App.Superforms)
├── lib/
│   ├── schemas.ts             # Zod schemas for all forms (module-level for Superforms)
│   ├── types.ts               # TypeScript interfaces matching the API response shapes
│   ├── firebase.ts            # Browser-only Firebase helpers (signInWithGoogle, etc.)
│   ├── server/
│   │   └── api.ts             # makeApi() — server-side cookie forwarding to Fastify
│   └── components/
│       ├── Navbar.svelte
│       ├── CollectionCard.svelte
│       ├── LinkCard.svelte
│       ├── TagPill.svelte
│       └── Avatar.svelte
└── routes/
    ├── +layout.server.ts      # Loads current user on every request via /auth/me
    ├── +layout.svelte         # Root layout: Navbar + page content
    ├── +page.server.ts        # Home: trending + discovery feed + tag filter
    ├── +page.svelte
    ├── login/+page.svelte     # Firebase sign-in (client-only)
    ├── logout/+page.server.ts # DELETE /auth/session → redirect
    ├── feed/                  # Personalized feed (auth-gated)
    ├── search/                # Full-text search via Typesense
    ├── collections/
    │   ├── new/               # Create collection (Superforms)
    │   └── [id]/              # Collection detail: like, add link, remove item
    └── users/[username]/      # Public profile: follow/unfollow
```

---

## Key patterns

| Pattern | Where |
|---|---|
| SSR data loading | Every `+page.server.ts` `load()` — runs on the server with cookie access |
| Form actions | Every mutation: create, like, follow, add link |
| Superforms | `collections/new` and `collections/[id]` — typed validation + `$errors` |
| Optimistic UI | Like and follow toggles — plain `use:enhance` with local state rollback |
| URL-driven state | Search `?q=`, tag filter `?tag=`, cursor `?cursor=` |
| Auth guard | `parent()` in `load()` reads layout user; `redirect(303, '/login')` if null |

---

## Useful commands

```bash
# Type-check all Svelte and TS files
npm run check -w @curated/frontend

# Format
npm run format -w @curated/frontend

# Backend: wipe DB and start fresh
docker-compose down -v && docker-compose up
```

---

## Troubleshooting

**`fetch failed` on the home page** — the backend isn't running. Start `docker-compose up` first.

**Firebase popup blocked** — allow popups for `localhost:5173` in your browser settings.

**`curated_session` cookie not set after login** — confirm the Vite proxy is running (dev server only) and `VITE_FIREBASE_*` env vars are correct.

**Type errors in `node_modules`** — there are known declaration conflicts between the hoisted `cookie` package and `@sveltejs/kit`. These don't affect runtime and can be ignored.
