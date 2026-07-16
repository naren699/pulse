import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { toDateId, fromDateId, daysBetween } from '../../../shared/utils/dates'
import { FALLBACK_CHALLENGES } from '../data/seedChallenges'

/**
 * Streak rule: completing on the day after lastCompletedDate extends the
 * streak; any gap resets it to 1; completing twice on one day is a no-op.
 * dateIds are local-timezone "YYYY-MM-DD" strings.
 */
export function calculateStreak(lastCompletedDate, todayId, currentStreak) {
  if (!lastCompletedDate) return 1
  const gap = daysBetween(lastCompletedDate, todayId)
  if (gap === 0) return currentStreak || 1
  if (gap === 1) return (currentStreak || 0) + 1
  return 1
}

/** Deterministic pick: day number since epoch modulo the challenge list. */
export function pickTodaysChallenge(challenges, todayId = toDateId()) {
  if (!challenges.length) return null
  const dayNumber = Math.floor(fromDateId(todayId).getTime() / 86400000)
  return challenges[dayNumber % challenges.length]
}

export async function getChallenges() {
  try {
    // Race against a timeout so an unreachable backend can't hang the page.
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('challenges-fetch-timeout')), 4000),
    )
    const snap = await Promise.race([
      getDocs(query(collection(db, 'challenges'), orderBy('order', 'asc'))),
      timeout,
    ])
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (list.length) return { challenges: list, source: 'firestore' }
  } catch (err) {
    console.warn('Falling back to bundled challenges:', err?.code || err?.message || err)
  }
  return { challenges: FALLBACK_CHALLENGES, source: 'local' }
}

/** Tally completed challenges by difficulty, for the progress breakdown. */
export function difficultyBreakdown(completions, challenges) {
  const byId = new Map(challenges.map((c) => [c.id, c]))
  const counts = { Easy: 0, Medium: 0, Hard: 0 }
  completions.forEach((c) => {
    if (c.status !== 'done') return
    const difficulty = byId.get(c.challengeId)?.difficulty
    if (difficulty && difficulty in counts) counts[difficulty] += 1
  })
  return counts
}

export async function markChallengeDone(uid, challengeId, dateId = toDateId()) {
  const progressRef = doc(db, 'users', uid, 'challengeProgress', dateId)
  const statsRef = doc(db, 'users', uid, 'stats', 'streak')

  return runTransaction(db, async (tx) => {
    const [progressSnap, statsSnap] = await Promise.all([tx.get(progressRef), tx.get(statsRef)])
    const prev = statsSnap.exists()
      ? statsSnap.data()
      : { currentStreak: 0, longestStreak: 0, totalCompleted: 0, lastCompletedDate: null }

    if (progressSnap.exists() && progressSnap.data().status === 'done') return prev

    const currentStreak = calculateStreak(prev.lastCompletedDate, dateId, prev.currentStreak)
    const next = {
      currentStreak,
      longestStreak: Math.max(prev.longestStreak || 0, currentStreak),
      totalCompleted: (prev.totalCompleted || 0) + 1,
      lastCompletedDate: dateId,
    }
    tx.set(progressRef, { challengeId, status: 'done', completedAt: serverTimestamp() })
    tx.set(statsRef, next)
    return next
  })
}
