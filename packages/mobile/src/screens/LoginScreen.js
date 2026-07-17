import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth, friendlyAuthError } from '@pulse/shared/context'
import { isFirebaseConfigured } from '@pulse/shared/config'
import { Button, Field, OrDivider, Screen } from '../components'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { colors, spacing } from '../styles/theme'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const { signIn: signInWithGoogle, ready: googleReady } = useGoogleAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  const handleLogin = async () => {
    setError('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      // No navigation call — RootNavigator swaps stacks off the auth state.
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setGoogleBusy(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>PULSE</Text>
          <Text style={styles.tagline}>Keep your academic heartbeat</Text>
        </View>

        {!isFirebaseConfigured && (
          <Text style={styles.warning}>Firebase isn't configured yet.</Text>
        )}

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Sign In" onPress={handleLogin} loading={busy} />

        <OrDivider />

        <Button
          label="Continue with Google"
          variant="google"
          onPress={handleGoogleLogin}
          loading={googleBusy}
          disabled={!googleReady}
        />

        <Pressable onPress={() => navigation.navigate('Signup')} style={styles.link}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkAccent}>Sign Up</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 40, fontWeight: '800', letterSpacing: 4 },
  tagline: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  warning: { color: colors.warning, textAlign: 'center', marginBottom: spacing.md },
  error: { color: colors.error, marginBottom: spacing.md },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkAccent: { color: colors.primary, fontWeight: '600' },
})
