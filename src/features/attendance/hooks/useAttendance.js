import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import { computeAttendance, attendanceStatus } from '../services/attendanceService'

export function useAttendance(uid) {
  const { data, loading, error } = useFirestoreListener(
    uid ? query(collection(db, 'users', uid, 'subjects'), orderBy('createdAt', 'asc')) : null,
    null,
    [uid],
  )
  return { subjects: data || [], loading, error }
}

export function useSubjectSessions(uid, subjectId) {
  const { data, loading, error } = useFirestoreListener(
    uid && subjectId ? collection(db, 'users', uid, 'subjects', subjectId, 'sessions') : null,
    null,
    [uid, subjectId],
  )
  const sessions = data || []
  const stats = computeAttendance(sessions)
  return { sessions, stats, loading, error }
}

export function useAttendancePercent(presentCount, totalSessions, targetPercent = 80) {
  const percentage = totalSessions === 0 ? 0 : (presentCount / totalSessions) * 100
  return { percentage, ...attendanceStatus(percentage, targetPercent, totalSessions) }
}
