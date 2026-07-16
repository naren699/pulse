import { useMemo } from 'react'
import { subjectStats } from '../services/attendanceService'

const EMPTY_STATS = { totalSessions: 0, presentCount: 0, absentCount: 0, percentage: 0 }

/**
 * Subjects already carry their own presentCount/totalSessions counters (kept
 * live by the parent `useAttendance` listener), so this just derives
 * per-subject and aggregate numbers — no extra Firestore listeners needed.
 */
export function useAttendanceOverview(uid, subjects) {
  const statsBySubject = useMemo(() => {
    const map = {}
    subjects.forEach((subject) => { map[subject.id] = subjectStats(subject) })
    return map
  }, [subjects])

  const overall = useMemo(() => {
    let present = 0
    let total = 0
    let best = null
    let worst = null
    subjects.forEach((subject) => {
      const stats = statsBySubject[subject.id]
      if (!stats || stats.totalSessions === 0) return
      present += stats.presentCount
      total += stats.totalSessions
      if (!best || stats.percentage > best.percentage) best = { ...subject, percentage: stats.percentage }
      if (!worst || stats.percentage < worst.percentage) worst = { ...subject, percentage: stats.percentage }
    })
    return {
      overallPercent: total === 0 ? 0 : (present / total) * 100,
      totalSubjects: subjects.length,
      totalSessions: total,
      best,
      worst,
    }
  }, [subjects, statsBySubject])

  const getStats = (subjectId) => statsBySubject[subjectId] || EMPTY_STATS

  return { statsBySubject, getStats, overall }
}
