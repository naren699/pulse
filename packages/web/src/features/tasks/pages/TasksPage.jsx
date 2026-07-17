import { useEffect, useState } from 'react'
import { useAuth } from '@pulse/shared/context'
import { useTasks } from '@pulse/shared/hooks'
import { addTask, updateTask, toggleTask, deleteTask } from '@pulse/shared/services'
import Modal, { ConfirmModal } from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input, Select } from '../../../shared/components/Input'
import Icon from '../../../shared/components/Icon'
import EmptyState from '../../../shared/components/EmptyState'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'
import { formatDateShort, fromDateId, toDateId } from '@pulse/shared/utils'

const PRIORITY_STYLE = {
  low: 'bg-slate-200/10 text-text-tertiary border-slate-200/15',
  medium: 'bg-primary/20 text-indigo-300 border-primary/30',
  high: 'bg-danger/20 text-red-300 border-danger/30',
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const overdue = !task.done && task.dueDate && task.dueDate < toDateId()
  return (
    <div className="card-glass group flex items-center gap-3 p-4 transition-all hover:border-primary/20">
      <button
        onClick={() => onToggle(task)}
        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
        className={[
          'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-all duration-300',
          task.done
            ? 'scale-105 border-primary bg-primary text-white'
            : 'border-white/25 hover:border-primary-light',
        ].join(' ')}
      >
        {task.done && <Icon name="check" size={12} strokeWidth={3.2} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm transition-all ${task.done ? 'text-text-subtle line-through opacity-60' : 'text-text-primary'}`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className={`text-xs ${overdue ? 'font-semibold text-red-300' : 'text-text-subtle'}`}>
            {overdue ? 'Overdue · ' : 'Due '}
            {formatDateShort(fromDateId(task.dueDate))}
          </p>
        )}
      </div>
      {task.priority && (
        <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLE[task.priority]}`}>
          {task.priority}
        </span>
      )}
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
        <button onClick={() => onEdit(task)} className="rounded-lg p-1.5 text-text-tertiary hover:bg-slate-200/10 hover:text-text-primary" aria-label="Edit task">
          <Icon name="edit" size={15} />
        </button>
        <button onClick={() => onDelete(task)} className="rounded-lg p-1.5 text-text-tertiary hover:bg-danger/15 hover:text-red-300" aria-label="Delete task">
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  )
}

function TaskModal({ isOpen, onClose, onSubmit, initial }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || '')
      setDueDate(initial?.dueDate || '')
      setPriority(initial?.priority || '')
      setError('')
    }
  }, [isOpen, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return setError('Task title is required.')
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null, priority: priority || null })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit}>
        <Input label="Title" placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} error={error} autoFocus />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} helper="Optional" />
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} helper="Optional">
            <option value="">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initial ? 'Save' : 'Add Task'}</Button>
        </div>
      </form>
    </Modal>
  )
}

const GROUPS = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'noDate', label: 'No Date' },
  { key: 'completed', label: 'Completed' },
]

export default function TasksPage() {
  const { user } = useAuth()
  const showToast = useToast()
  const { tasks, groups, loading } = useTasks(user?.uid)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateTask(user.uid, editing.id, data)
        showToast('Task updated', 'success')
      } else {
        await addTask(user.uid, data)
        showToast('Task added', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast('Could not save task.', 'error')
    }
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteTask(user.uid, deleting.id)
      showToast('Task deleted', 'info')
      setDeleting(null)
    } catch (err) {
      console.error(err)
      showToast('Could not delete task.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="hero-spot mx-auto max-w-[800px]" style={{ '--accent': '#8b5cf6' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">
            {groups.today.length} due today · {groups.completed.length} completed
          </p>
          <h1 className="font-display text-4xl font-bold tracking-[0.02em]">
            <span className="text-gradient-cool">Tasks</span>
          </h1>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Add Task</Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4"><SkeletonCard lines={1} /><SkeletonCard lines={1} /></div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="checkbox"
          title="No tasks yet"
          message="Add one to get started."
          action={<Button onClick={() => setModalOpen(true)}>+ Add Task</Button>}
        />
      ) : (
        GROUPS.map(({ key, label }) =>
          groups[key].length === 0 ? null : (
            <section key={key} className="mb-8">
              <h2 className="label-caps mb-3">{label} · {groups[key].length}</h2>
              <div className="flex flex-col gap-2.5">
                {groups[key].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={(t) => toggleTask(user.uid, t).catch(() => showToast('Could not update task.', 'error'))}
                    onEdit={(t) => { setEditing(t); setModalOpen(true) }}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            </section>
          ),
        )
      )}

      <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initial={editing} />
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete Task"
        message={`Delete "${deleting?.title}"?`}
      />
    </div>
  )
}
