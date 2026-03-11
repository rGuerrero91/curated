/**
 * Firebase Admin SDK singleton.
 *
 * Initializes the Firebase Admin app once using service account credentials
 * from environment variables. Exports `firebaseAuth` which is used by the
 * auth plugin to verify Firebase ID tokens sent from the client.
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { env } from '../config/env.js'

let app: App

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Newlines in the env var are escaped as \n — unescape them here
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
} else {
  app = getApps()[0]!
}

export const firebaseAuth: Auth = getAuth(app)
