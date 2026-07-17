import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useFirestoreListener } from './useFirestoreListener'

export function useGoals(uid) {
  const { data, loading, error } = useFirestoreListener(
    uid ? query(collection(db, 'users', uid, 'goals'), orderBy('createdAt', 'desc')) : null,
    null,
    [uid],
  )
  const goals = data || []
  const active = goals
    .filter((g) => (g.currentValue || 0) < g.targetValue)
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
  const completed = goals.filter((g) => (g.currentValue || 0) >= g.targetValue)
  return { goals, active, completed, loading, error }
}
