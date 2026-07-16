import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { toDateId, fromDateId } from '../../../shared/utils/dates'

const subjectsCol = (uid) => collection(db, 'users', uid, 'subjects')
const sessionsCol = (uid, subjectId) => collection(db, 'users', uid, 'subjects', subjectId, 'sessions')

// presentCount / totalSessions on the subject doc are the single source of
// truth for attendance numbers — the Present/Absent buttons and the Edit
// modal both read and write these two fields directly (no separate ledger
// to keep in sync), so what you type in Edit is exactly what the card shows.
export async function addSubject(uid, { name, colorAccent, targetPercent = 80, presentCount = 0, totalSessions = 0 }) {
  const ref = await addDoc(subjectsCol(uid), {
    name: name.trim(),
    colorAccent,
    targetPercent: Number(targetPercent),
    presentCount: Number(presentCount) || 0,
    totalSessions: Number(totalSessions) || 0,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSubject(uid, subjectId, updates) {
  const allowed = {}
  if (updates.name !== undefined) allowed.name = updates.name.trim()
  if (updates.colorAccent !== undefined) allowed.colorAccent = updates.colorAccent
  if (updates.targetPercent !== undefined) allowed.targetPercent = Number(updates.targetPercent)
  if (updates.presentCount !== undefined) allowed.presentCount = Number(updates.presentCount) || 0
  if (updates.totalSessions !== undefined) allowed.totalSessions = Number(updates.totalSessions) || 0
  allowed.updatedAt = serverTimestamp()
  await updateDoc(doc(db, 'users', uid, 'subjects', subjectId), allowed)
}

export async function deleteSubject(uid, subjectId) {
  // Delete all session docs first (Firestore doesn't cascade), then the subject.
  const sessions = await getDocs(sessionsCol(uid, subjectId))
  const batch = writeBatch(db)
  sessions.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, 'users', uid, 'subjects', subjectId))
  await batch.commit()
  return true
}

/**
 * Quick Present/Absent buttons: atomically bump the subject's own counters.
 * Present adds to both attended and total; Absent adds to total only.
 */
export async function markQuickAttendance(uid, subjectId, status) {
  await updateDoc(doc(db, 'users', uid, 'subjects', subjectId), {
    totalSessions: increment(1),
    presentCount: increment(status === 'present' ? 1 : 0),
    updatedAt: serverTimestamp(),
  })
}

// Date-keyed marking used by the Monthly Report calendar — a separate,
// optional day-by-day history view, independent of the quick counters above.
export async function markAttendance(uid, subjectId, date, status) {
  const dateId = typeof date === 'string' ? date : toDateId(date)
  await setDoc(doc(db, 'users', uid, 'subjects', subjectId, 'sessions', dateId), {
    date: fromDateId(dateId),
    status,
    createdAt: serverTimestamp(),
  })
  return dateId
}

export async function clearAttendance(uid, subjectId, dateId) {
  await deleteDoc(doc(db, 'users', uid, 'subjects', subjectId, 'sessions', dateId))
}

/** Attendance numbers straight from the subject doc's own counters. */
export function subjectStats(subject) {
  const totalSessions = Number(subject?.totalSessions) || 0
  const presentCount = Number(subject?.presentCount) || 0
  const percentage = totalSessions === 0 ? 0 : (presentCount / totalSessions) * 100
  return { totalSessions, presentCount, absentCount: totalSessions - presentCount, percentage }
}

/** Session-doc-derived stats, for the Monthly Report calendar view only. */
export function computeAttendance(sessions) {
  const totalSessions = sessions.length
  const presentCount = sessions.filter((s) => s.status === 'present').length
  const percentage = totalSessions === 0 ? 0 : (presentCount / totalSessions) * 100
  return { totalSessions, presentCount, absentCount: totalSessions - presentCount, percentage }
}

export function attendanceStatus(percentage, targetPercent = 80, totalSessions = 1) {
  if (totalSessions === 0) return { status: 'info', statusText: 'No sessions yet' }
  if (percentage >= targetPercent) return { status: 'success', statusText: 'On track' }
  if (percentage >= targetPercent - 10) return { status: 'warning', statusText: 'Below target' }
  return { status: 'danger', statusText: 'Urgent' }
}

/**
 * How many more classes can be skipped (while staying >= target) or must be
 * attended consecutively (to reach target) for this subject.
 */
export function classesRemaining(presentCount, totalSessions, targetPercent = 80) {
  const target = Number(targetPercent)
  if (!target || totalSessions === 0) return { type: 'none', count: 0 }
  const percentage = (presentCount / totalSessions) * 100

  if (percentage >= target) {
    if (target <= 0) return { type: 'canSkip', count: Infinity }
    const canSkip = Math.floor((presentCount * 100) / target - totalSessions)
    return { type: 'canSkip', count: Math.max(0, canSkip) }
  }

  if (target >= 100) return { type: 'needAttend', count: Infinity }
  const needAttend = Math.ceil((target * totalSessions - 100 * presentCount) / (100 - target))
  return { type: 'needAttend', count: Math.max(0, needAttend) }
}
