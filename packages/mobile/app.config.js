const path = require('node:path')

// Read the same repo-root .env.local the web app uses (via Vite's envDir), so
// credentials live in exactly one gitignored file for both platforms.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') })

module.exports = ({ config }) => ({
  ...config,
  name: 'PULSE',
  slug: 'pulse',
  extra: {
    ...config.extra,
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    },
    googleAuth: {
      androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    },
  },
})
