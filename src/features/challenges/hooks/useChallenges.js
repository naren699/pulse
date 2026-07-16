import { useEffect, useState } from 'react'
import { collection, doc } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import { getChallenges, pickTodaysChallenge } from '../services/challengeService'
import { toDateId } from '../../../shared/utils/dates'

export function useChallenges(uid) {
  const [challenges, setChallenges] = useState([])
  const [challengesLoading, setChallengesLoading] = useState(true)
  const todayId = toDateId()

  useEffect(() => {
    let cancelled = false
    getChallenges().then(({ challenges: list }) => {
      if (!cancelled) {
        setChallenges(list)
        setChallengesLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const { data: progress, loading: progressLoading } = useFirestoreListener(
    uid ? collection(db, 'users', uid, 'challengeProgress') : null,
    null,
    [uid],
  )

  const { data: streakStats, loading: statsLoading } = useFirestoreListener(
    uid ? doc(db, 'users', uid, 'stats', 'streak') : null,
    null,
    [uid],
  )

  const todaysChallenge = pickTodaysChallenge(challenges, todayId)
  const completions = progress || []
  const todaysProgress = completions.find((p) => p.id === todayId) || null

  return {
    challenges,
    todaysChallenge,
    completions,
    todaysProgress,
    isDoneToday: todaysProgress?.status === 'done',
    streakStats: streakStats || { currentStreak: 0, longestStreak: 0, totalCompleted: 0, lastCompletedDate: null },
    loading: challengesLoading || progressLoading || statsLoading,
  }
}

export function useStreak(uid) {
  const { data } = useFirestoreListener(
    uid ? doc(db, 'users', uid, 'stats', 'streak') : null,
    null,
    [uid],
  )
  return data || { currentStreak: 0, longestStreak: 0, totalCompleted: 0 }
}
