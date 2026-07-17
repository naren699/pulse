import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import { initFirebase } from '@pulse/shared/config'

// app.config.js reads the repo-root .env.local and forwards the values here.
const firebaseConfig = Constants.expoConfig?.extra?.firebase ?? {}

export function bootstrapFirebase() {
  return initFirebase(firebaseConfig, {
    // Without explicit persistence, React Native signs the user out on every
    // app restart (web gets this for free from browser storage).
    createAuth: (app) =>
      initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      }),
  })
}
