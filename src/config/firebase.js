import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { isSupported as analyticsIsSupported, getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-pulse',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-pulse.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '0',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

// True once real credentials are supplied via .env.local — the app boots
// either way, but auth/data calls only succeed against a real project.
export const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// Analytics needs a real measurementId and browser support (no-op in dev
// previews, SSR, or unsupported environments), so it's initialized lazily.
export let analytics = null
if (firebaseConfig.measurementId) {
  analyticsIsSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app)
    })
    .catch(() => {})
}

export default app
