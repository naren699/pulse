import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { toDateId } from '../../../shared/utils/dates'

const tasksCol = (uid) => collection(db, 'users', uid, 'tasks')

export async function addTask(uid, { title, dueDate = null, priority = null }) {
  const ref = await addDoc(tasksCol(uid), {
    title: title.trim(),
    done: false,
    dueDate: dueDate || null, // "YYYY-MM-DD" string or null
    priority,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTask(uid, taskId, updates) {
  await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export const toggleTask = (uid, task) => updateTask(uid, task.id, { done: !task.done })

export const deleteTask = (uid, taskId) => deleteDoc(doc(db, 'users', uid, 'tasks', taskId))

export function groupTasks(tasks) {
  const todayId = toDateId()
  const groups = { today: [], upcoming: [], noDate: [], completed: [] }
  tasks.forEach((task) => {
    if (task.done) groups.completed.push(task)
    else if (!task.dueDate) groups.noDate.push(task)
    else if (task.dueDate <= todayId) groups.today.push(task) // overdue tasks surface under Today
    else groups.upcoming.push(task)
  })
  const byDue = (a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
  groups.today.sort(byDue)
  groups.upcoming.sort(byDue)
  return groups
}
