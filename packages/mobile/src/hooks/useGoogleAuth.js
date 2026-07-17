import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import Constants from 'expo-constants'
import { useAuth } from '@pulse/shared/context'

// Completes the OAuth redirect back into the app when the browser tab closes.
WebBrowser.maybeCompleteAuthSession()

// Requires OAuth client IDs from Google Cloud Console (see .env.example) —
// without them `request` stays null and the button disables itself rather
// than throwing on tap.
export function useGoogleAuth() {
  const { androidClientId, webClientId } = Constants.expoConfig?.extra?.googleAuth ?? {}
  const { loginWithGoogleCredential } = useAuth()

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId,
    webClientId,
  })

  const signIn = async () => {
    const result = await promptAsync()
    if (result?.type !== 'success') return null
    return loginWithGoogleCredential(result.params.id_token)
  }

  return { signIn, ready: Boolean(request) }
}
