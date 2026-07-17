import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@pulse/shared/context'
import { useAttendance, useAttendanceOverview, useChallenges, useTasks } from '@pulse/shared/hooks'
import { Button, Card, Screen } from '../components'
import { colors, moduleAccents, spacing } from '../styles/theme'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardScreen() {
  const { user, profile, logout } = useAuth()
  const { subjects } = useAttendance(user?.uid)
  const { overall } = useAttendanceOverview(user?.uid, subjects)
  const { streakStats } = useChallenges(user?.uid)
  const { tasks } = useTasks(user?.uid)

  const openTasks = (tasks || []).filter((t) => !t.completed).length
  const name = profile?.displayName || 'there'

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>{greeting()}, {name}</Text>

        <Card accent={moduleAccents.attendance}>
          <Text style={styles.label}>Attendance</Text>
          <Text style={styles.stat}>{Math.round(overall?.overallPercent ?? 0)}%</Text>
          <Text style={styles.meta}>across {overall?.totalSubjects ?? 0} subjects</Text>
        </Card>

        <Card accent={moduleAccents.challenges}>
          <Text style={styles.label}>Streak</Text>
          <Text style={styles.stat}>🔥 {streakStats?.currentStreak ?? 0}</Text>
          <Text style={styles.meta}>day streak</Text>
        </Card>

        <Card accent={moduleAccents.tasks}>
          <Text style={styles.label}>Tasks</Text>
          <Text style={styles.stat}>{openTasks}</Text>
          <Text style={styles.meta}>still open</Text>
        </Card>

        <View style={styles.logout}>
          <Button label="Sign Out" variant="ghost" onPress={logout} />
        </View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stat: { color: colors.text, fontSize: 34, fontWeight: '800', marginTop: spacing.xs },
  meta: { color: colors.textSubtle, fontSize: 13 },
  logout: { marginTop: spacing.md },
})
