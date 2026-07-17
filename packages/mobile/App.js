import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@pulse/shared/context'
import { bootstrapFirebase } from './src/firebase'
import RootNavigator from './src/navigation/RootNavigator'

// Must run before AuthProvider mounts — it reads `auth` from shared config.
bootstrapFirebase()

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
