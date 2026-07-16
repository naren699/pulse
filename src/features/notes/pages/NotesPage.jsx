import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useAuth } from '../../../context/AuthContext'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import Modal, { ConfirmModal } from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input, Textarea } from '../../../shared/components/Input'
import Icon from '../../../shared/components/Icon'
import EmptyState from '../../../shared/components/EmptyState'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'

function formatEdited(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function NoteEditor({ isOpen, onClose, onSubmit, initial }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(initial?.title || '')
      setBody(initial?.body || '')
      setError('')
    }
  }, [isOpen, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required.')
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), body })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Note' : 'New Note'} maxWidth="max-w-[640px]">
      <form onSubmit={handleSubmit}>
        <Input label="Title" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} error={error} autoFocus />
        <Textarea
          label="Body"
          placeholder="Write anything… markdown welcome"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-[220px] font-body"
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initial ? 'Save' : 'Create Note'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function NotesPage() {
  const { user } = useAuth()
  const showToast = useToast()
  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const { data, loading } = useFirestoreListener(
    user ? query(collection(db, 'users', user.uid, 'notes'), orderBy('updatedAt', 'desc')) : null,
    null,
    [user?.uid],
  )
  const notes = data || []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.title?.toLowerCase().includes(q))
  }, [notes, search])

  const handleSubmit = async ({ title, body }) => {
    try {
      if (editing) {
        await updateDoc(doc(db, 'users', user.uid, 'notes', editing.id), { title, body, updatedAt: serverTimestamp() })
        showToast('Note saved', 'success')
      } else {
        await addDoc(collection(db, 'users', user.uid, 'notes'), {
          title,
          body,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        showToast('Note created', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast('Could not save note.', 'error')
    }
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', deleting.id))
      showToast('Note deleted', 'info')
      setDeleting(null)
    } catch (err) {
      console.error(err)
      showToast('Could not delete note.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="hero-spot" style={{ '--accent': '#00e29a' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">Quick capture for everything worth remembering</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">Notes</h1>
        </div>
        <Button onClick={() => { setEditing(null); setEditorOpen(true) }}>+ New Note</Button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle">
          <Icon name="search" size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes by title…"
          className="field-glass rounded-full py-2.5 pl-10 pr-4"
        />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="note"
          title={search ? 'No matching notes' : 'No notes yet'}
          message={search ? 'Try a different search.' : 'Create your first note to get started.'}
          action={!search && <Button onClick={() => setEditorOpen(true)}>+ New Note</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <button
              key={note.id}
              onClick={() => { setEditing(note); setEditorOpen(true) }}
              className="card-glass group relative flex min-h-[160px] flex-col p-5 text-left transition-all hover:scale-[1.02] hover:border-primary/25 hover:shadow-[0_20px_48px_rgba(99,102,241,0.12)]"
            >
              <h3 className="pr-8 font-display text-base font-semibold">{note.title}</h3>
              <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-wrap text-xs leading-relaxed text-text-tertiary">
                {note.body || 'Empty note'}
              </p>
              <p className="mt-3 text-[11px] text-text-subtle">Edited {formatEdited(note.updatedAt)}</p>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setDeleting(note) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setDeleting(note) } }}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-text-tertiary opacity-0 transition-all hover:bg-danger/15 hover:text-red-300 group-hover:opacity-100 max-md:opacity-100"
                aria-label="Delete note"
              >
                <Icon name="trash" size={15} />
              </span>
            </button>
          ))}
        </div>
      )}

      <NoteEditor isOpen={editorOpen} onClose={() => setEditorOpen(false)} onSubmit={handleSubmit} initial={editing} />
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete Note"
        message={`Delete "${deleting?.title}"?`}
      />
    </div>
  )
}
