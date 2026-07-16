import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useAuth } from '../../../context/AuthContext'
import { useGoals } from '../hooks/useGoals'
import Modal, { ConfirmModal } from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import Icon from '../../../shared/components/Icon'
import EmptyState from '../../../shared/components/EmptyState'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'
import { formatDateShort, fromDateId, toDateId } from '../../../shared/utils/dates'

export function GoalProgressBar({ current, target }) {
  const pct = target > 0 ? Math.min(100, ((current || 0) / target) * 100) : 0
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_14px_rgba(168,85,247,0.5)] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function GoalCard({ goal, onEdit, onDelete, onQuickUpdate, done = false }) {
  const [value, setValue] = useState('')
  const overdue = !done && goal.dueDate && goal.dueDate < toDateId()
  return (
    <div className={`card-glass group p-6 transition-all hover:border-primary/20 ${done ? 'opacity-60' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold">
            {goal.title} {done && <span className="ml-1 text-emerald-300">✓</span>}
          </h3>
          {goal.dueDate && (
            <p className={`text-xs ${overdue ? 'font-semibold text-red-300' : 'text-text-subtle'}`}>
              {overdue ? '⚠ Past due · ' : 'Due '}
              {formatDateShort(fromDateId(goal.dueDate))}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
          <button onClick={() => onEdit(goal)} className="rounded-lg p-1.5 text-text-tertiary hover:bg-slate-200/10 hover:text-text-primary" aria-label="Edit goal">
            <Icon name="edit" size={15} />
          </button>
          <button onClick={() => onDelete(goal)} className="rounded-lg p-1.5 text-text-tertiary hover:bg-danger/15 hover:text-red-300" aria-label="Delete goal">
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>

      <GoalProgressBar current={goal.currentValue} target={goal.targetValue} />
      <p className="mt-2 font-brand-mono text-sm text-text-secondary">
        {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
      </p>

      {!done && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (value === '') return
            onQuickUpdate(goal, Number(value))
            setValue('')
          }}
        >
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Update progress (${goal.unit})`}
            className="min-w-0 flex-1 rounded-[10px] border border-slate-200/15 bg-bg-primary/60 px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle outline-none transition-all focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
          />
          <Button type="submit" size="sm" variant="secondary">Save</Button>
        </form>
      )}
    </div>
  )
}

function GoalModal({ isOpen, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({ title: '', targetValue: '', currentValue: '', unit: '', dueDate: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: initial?.title || '',
        targetValue: initial?.targetValue ?? '',
        currentValue: initial?.currentValue ?? '',
        unit: initial?.unit || '',
        dueDate: initial?.dueDate || '',
      })
      setErrors({})
    }
  }, [isOpen, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Goal title is required.'
    if (!form.targetValue || Number(form.targetValue) <= 0) next.targetValue = 'Target must be greater than 0.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await onSubmit({
        title: form.title.trim(),
        targetValue: Number(form.targetValue),
        currentValue: Number(form.currentValue) || 0,
        unit: form.unit.trim() || 'units',
        dueDate: form.dueDate || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Goal'}>
      <form onSubmit={handleSubmit}>
        <Input label="Title" placeholder="e.g. Solve 50 LeetCode problems" value={form.title} onChange={set('title')} error={errors.title} autoFocus />
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Input label="Target" type="number" min="1" placeholder="50" value={form.targetValue} onChange={set('targetValue')} error={errors.targetValue} />
          <Input label="Current Progress" type="number" min="0" placeholder="0" value={form.currentValue} onChange={set('currentValue')} />
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Input label="Unit" placeholder="problems" value={form.unit} onChange={set('unit')} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={set('dueDate')} helper="Optional" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initial ? 'Save' : 'Add Goal'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function GoalsPage() {
  const { user } = useAuth()
  const showToast = useToast()
  const { goals, active, completed, loading } = useGoals(user?.uid)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateDoc(doc(db, 'users', user.uid, 'goals', editing.id), data)
        showToast('Goal updated', 'success')
      } else {
        await addDoc(collection(db, 'users', user.uid, 'goals'), {
          ...data,
          linkedMetric: null,
          createdAt: serverTimestamp(),
        })
        showToast('Goal added 🎯', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast('Could not save goal.', 'error')
    }
  }

  const handleQuickUpdate = async (goal, currentValue) => {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', goal.id), { currentValue })
      if (currentValue >= goal.targetValue) showToast(`Goal completed: ${goal.title} 🎉`, 'streak')
      else showToast('Progress saved', 'success')
    } catch (err) {
      console.error(err)
      showToast('Could not update progress.', 'error')
    }
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', deleting.id))
      showToast('Goal deleted', 'info')
      setDeleting(null)
    } catch (err) {
      console.error(err)
      showToast('Could not delete goal.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="hero-spot mx-auto max-w-[800px]" style={{ '--accent': '#8b5cf6' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">
            {active.length} active · {completed.length} completed
          </p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">
            <span className="text-gradient">Goals</span>
          </h1>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Add Goal</Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon="target"
          title="No goals yet"
          message="Set your first goal to get started."
          action={<Button onClick={() => setModalOpen(true)}>+ Add Goal</Button>}
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={(g) => { setEditing(g); setModalOpen(true) }}
                onDelete={setDeleting}
                onQuickUpdate={handleQuickUpdate}
              />
            ))}
          </div>
          {completed.length > 0 && (
            <section className="mt-10">
              <h2 className="label-caps mb-4">Completed</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {completed.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    done
                    onEdit={(g) => { setEditing(g); setModalOpen(true) }}
                    onDelete={setDeleting}
                    onQuickUpdate={handleQuickUpdate}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <GoalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} initial={editing} />
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete Goal"
        message={`Delete "${deleting?.title}"?`}
      />
    </div>
  )
}
