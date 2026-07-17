import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useFirestoreListener } from './useFirestoreListener'
import { groupTasks } from '../services/tasks/taskService'

export function useTasks(uid) {
  const { data, loading, error } = useFirestoreListener(
    uid ? query(collection(db, 'users', uid, 'tasks'), orderBy('createdAt', 'desc')) : null,
    null,
    [uid],
  )
  const tasks = data || []
  return { tasks, groups: groupTasks(tasks), loading, error }
}
