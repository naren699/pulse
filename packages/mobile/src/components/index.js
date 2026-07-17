import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { colors, radius, spacing } from '../styles/theme'

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>
}

export function Card({ children, accent = colors.primary, style }) {
  return (
    <View style={[styles.card, style]}>
      {/* Colored top strip — the mobile stand-in for the web card's light bar. */}
      <View style={[styles.cardStrip, { backgroundColor: accent }]} />
      <View style={styles.cardBody}>{children}</View>
    </View>
  )
}

const BUTTON_VARIANTS = {
  primary: { container: 'buttonPrimary', text: colors.text, indicator: colors.text },
  ghost: { container: 'buttonGhost', text: colors.textMuted, indicator: colors.text },
  google: { container: 'buttonGoogle', text: '#1F1F1F', indicator: '#1F1F1F' },
}

export function Button({ label, onPress, disabled, loading, variant = 'primary' }) {
  const { container, text, indicator } = BUTTON_VARIANTS[variant]
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[container],
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={indicator} />
      ) : (
        <Text style={[styles.buttonText, { color: text }]}>{label}</Text>
      )}
    </Pressable>
  )
}

export function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  )
}

export function Field({ label, error, ...props }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, error && { borderColor: colors.error }]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

export function Loading() {
  return (
    <Screen style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </Screen>
  )
}

export function EmptyState({ title, message }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardStrip: { height: 3, opacity: 0.8 },
  cardBody: { padding: spacing.md },

  button: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonGoogle: { backgroundColor: '#FFFFFF' },
  buttonPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, fontWeight: '600' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textSubtle, fontSize: 12, marginHorizontal: spacing.sm },

  field: { marginBottom: spacing.md },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.xs },

  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptyMessage: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
})
