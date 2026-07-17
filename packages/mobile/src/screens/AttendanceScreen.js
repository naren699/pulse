import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@pulse/shared/context'
import { useAttendance, useAttendanceOverview } from '@pulse/shared/hooks'
import { markQuickAttendance, classesRemaining } from '@pulse/shared/services'
import { Button, Card, EmptyState, Loading, Screen } from '../components'
import { colors, moduleAccents, spacing } from '../styles/theme'

export default function AttendanceScreen() {
  const { user } = useAuth()
  const { subjects, loading } = useAttendance(user?.uid)
  const { getStats } = useAttendanceOverview(user?.uid, subjects)

  if (loading) return <Loading />

  if (!subjects.length) {
    return (
      <Screen>
        <EmptyState
          title="No subjects yet"
          message="Add one on the web app to start tracking."
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubjectCard subject={item} stats={getStats(item.id)} uid={user.uid} />
        )}
      />
    </Screen>
  )
}

function SubjectCard({ subject, stats, uid }) {
  const percentage = Math.round(stats?.percentage ?? 0)
  const target = subject.targetPercent ?? 80
  const remaining = classesRemaining(
    subject.presentCount ?? 0,
    subject.totalSessions ?? 0,
    target,
  )

  const mark = (status) => markQuickAttendance(uid, subject.id, status)

  return (
    <Card accent={subject.colorAccent || moduleAccents.attendance}>
      <View style={styles.row}>
        <Text style={styles.name}>{subject.name}</Text>
        <Text style={[styles.percent, { color: percentage >= target ? colors.green : colors.warning }]}>
          {percentage}%
        </Text>
      </View>

      <Text style={styles.meta}>
        {subject.presentCount ?? 0} / {subject.totalSessions ?? 0} classes attended
      </Text>
      {remaining > 0 ? (
        <Text style={styles.meta}>Attend {remaining} more to reach {target}%</Text>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="Present" onPress={() => mark('present')} />
        </View>
        <View style={styles.action}>
          <Button label="Absent" variant="ghost" onPress={() => mark('absent')} />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontSize: 17, fontWeight: '700', flexShrink: 1 },
  percent: { fontSize: 20, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
})
