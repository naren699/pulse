import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import { groupTasks } from '../services/taskService'

export function useTasks(uid) {
  const { data, loading, error } = useFirestoreListener(
    uid ? query(collection(db, 'users', uid, 'tasks'), orderBy('createdAt', 'desc')) : null,
    null,
    [uid],
  )
  const tasks = data || []
  return { tasks, groups: groupTasks(tasks), loading, error }
}
