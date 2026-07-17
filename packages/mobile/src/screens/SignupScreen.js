import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth, friendlyAuthError } from '@pulse/shared/context'
import { Button, Field, OrDivider, Screen } from '../components'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { colors, spacing } from '../styles/theme'

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth()
  const { signIn: signInWithGoogle, ready: googleReady } = useGoogleAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  const handleSignup = async () => {
    setError('')
    setBusy(true)
    try {
      await signup({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  const handleGoogleSignup = async () => {
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
          <Text style={styles.brand}>Create account</Text>
          <Text style={styles.tagline}>Start tracking your heartbeat</Text>
        </View>

        <Field label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Sign Up" onPress={handleSignup} loading={busy} />

        <OrDivider />

        <Button
          label="Sign up with Google"
          variant="google"
          onPress={handleGoogleSignup}
          loading={googleBusy}
          disabled={!googleReady}
        />

        <Pressable onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkAccent}>Sign In</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { color: colors.text, fontSize: 30, fontWeight: '800' },
  tagline: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  error: { color: colors.error, marginBottom: spacing.md },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkAccent: { color: colors.primary, fontWeight: '600' },
})
