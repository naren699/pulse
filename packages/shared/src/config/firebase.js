import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { isSupported as analyticsIsSupported, getAnalytics } from 'firebase/analytics'

const DEMO_CONFIG = {
  apiKey: 'demo-api-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo-pulse',
  storageBucket: 'demo-pulse.appspot.com',
  messagingSenderId: '0',
  appId: 'demo-app-id',
}

// Each platform reads credentials its own way — Vite exposes import.meta.env,
// Metro does not — so the host app injects them via initFirebase() instead of
// this module reaching for a bundler-specific global. Consumers keep importing
// { db } etc. directly; ESM live bindings hand them the real instance once
// initFirebase has run, which every host does before rendering.
export let app = null
export let auth = null
export let db = null
export let storage = null
export let googleProvider = null
export let analytics = null

// True once real credentials are supplied — the app boots either way, but
// auth/data calls only succeed against a real project.
export let isFirebaseConfigured = false

// `createAuth` lets a host swap in its own auth instance — React Native needs
// initializeAuth() with AsyncStorage persistence, which would pull a native-only
// dependency into this file if it were hardcoded here.
export function initFirebase(config = {}, { createAuth } = {}) {
  if (app) return app

  const supplied = stripEmpty(config)
  const merged = { ...DEMO_CONFIG, ...supplied }
  isFirebaseConfigured = Boolean(supplied.apiKey)

  app = initializeApp(merged)
  auth = createAuth ? createAuth(app) : getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  googleProvider = new GoogleAuthProvider()

  // Analytics needs a real measurementId and browser support (no-op in dev
  // previews, SSR, React Native, or unsupported environments).
  if (merged.measurementId) {
    analyticsIsSupported()
      .then((supported) => {
        if (supported) analytics = getAnalytics(app)
      })
      .catch(() => {})
  }

  return app
}

function stripEmpty(config) {
  return Object.fromEntries(
    Object.entries(config).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}
