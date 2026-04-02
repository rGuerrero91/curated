// Firebase client-side authentication setup.
//
// WHY browser-only?
// Firebase JS SDK uses browser APIs (localStorage for token persistence, popup windows for OAuth).
// It cannot run in Node.js (SvelteKit's server-side environment). This file should only be
// imported from client-side code: +page.svelte files (not +page.server.ts).
//
// The VITE_ prefix on env vars makes them available in browser bundles via import.meta.env.
// Never put secrets here — Firebase client config is public (it's safe to expose these values).

import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

// Guard against double initialization during hot module replacement (HMR) in dev.
// getApps() returns existing app instances — reuse the first one if it exists.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)

// Sign in with Google using a popup window.
// Returns the Firebase User (which has getIdToken() for the session exchange).
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  return result.user
}

// Sign in with email + password.
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

// Create a new Firebase account with email + password.
export async function signUpWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

// Sign out from Firebase (clears the local token).
// The SvelteKit logout action handles clearing the backend session cookie separately.
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth)
}
