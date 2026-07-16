import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useAuth } from '../../../context/AuthContext'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import { createGroup, joinGroup, joinGroupByCode } from '../services/groupService'
import Modal from '../../../shared/components/Modal'
import Button from '../../../shared/components/Button'
import { Input, Textarea, Select } from '../../../shared/components/Input'
import Icon from '../../../shared/components/Icon'
import EmptyState from '../../../shared/components/EmptyState'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'

function GroupCard({ group, isMember, onJoin, joining }) {
  const inner = (
    <div className="card-glass flex h-full flex-col p-5 transition-all hover:scale-[1.02] hover:border-primary/25 hover:shadow-[0_20px_48px_rgba(99,102,241,0.12)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{group.name}</h3>
        {group.privacy === 'private' && (
          <span className="text-text-subtle" title="Private group"><Icon name="lock" size={15} /></span>
        )}
      </div>
      {group.description && <p className="line-clamp-2 flex-1 text-xs text-text-tertiary">{group.description}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-text-subtle">
          <Icon name="users" size={14} /> {group.memberIds?.length || 0} member{(group.memberIds?.length || 0) === 1 ? '' : 's'}
        </span>
        {isMember ? (
          <span className="font-display text-xs font-semibold text-primary-light">Open chat →</span>
        ) : (
          <Button size="sm" variant="secondary" loading={joining} onClick={(e) => { e.preventDefault(); onJoin(group) }}>
            Join
          </Button>
        )}
      </div>
    </div>
  )
  return isMember ? <Link to={`/groups/${group.id}`}>{inner}</Link> : inner
}

function CreateGroupModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', privacy: 'public' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) { setForm({ name: '', description: '', privacy: 'public' }); setError('') }
  }, [isOpen])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.name.trim().length < 3) return setError('Group name is required (min 3 characters).')
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Study Group">
      <form onSubmit={handleSubmit}>
        <Input label="Group Name" placeholder="e.g. DSA Grinders" value={form.name} onChange={set('name')} error={error} autoFocus />
        <Textarea label="Description" placeholder="What's this group about?" value={form.description} onChange={set('description')} className="min-h-[80px]" />
        <Select label="Privacy" value={form.privacy} onChange={set('privacy')} helper={form.privacy === 'private' ? 'Private groups are join-code only — a code is generated automatically.' : 'Public groups are discoverable, and also get a join code to share directly.'}>
          <option value="public">Public</option>
          <option value="private">Private (join code)</option>
        </Select>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Create Group</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function GroupsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joiningId, setJoiningId] = useState(null)
  const [joiningByCode, setJoiningByCode] = useState(false)

  const { data: myGroups, loading: myLoading } = useFirestoreListener(
    user ? query(collection(db, 'groups'), where('memberIds', 'array-contains', user.uid)) : null,
    null,
    [user?.uid],
  )
  const { data: publicGroups, loading: publicLoading } = useFirestoreListener(
    query(collection(db, 'groups'), where('privacy', '==', 'public')),
    null,
    [],
  )

  const mine = myGroups || []
  const discover = (publicGroups || []).filter((g) => !g.memberIds?.includes(user?.uid))
  const loading = myLoading || publicLoading

  const handleCreate = async (form) => {
    try {
      const id = await createGroup(user.uid, form)
      showToast('Group created 🎉', 'success')
      navigate(`/groups/${id}`)
    } catch (err) {
      console.error(err)
      showToast('Could not create group.', 'error')
    }
  }

  const handleJoin = async (group) => {
    setJoiningId(group.id)
    try {
      await joinGroup(user.uid, group)
      showToast(`Joined ${group.name}`, 'success')
    } catch (err) {
      console.error(err)
      showToast('Could not join group.', 'error')
    } finally {
      setJoiningId(null)
    }
  }

  const handleJoinByCode = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoiningByCode(true)
    try {
      const id = await joinGroupByCode(user.uid, joinCode)
      showToast('Joined private group 🎉', 'success')
      setJoinCode('')
      navigate(`/groups/${id}`)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Could not join with that code.', 'error')
    } finally {
      setJoiningByCode(false)
    }
  }

  const grid = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="hero-spot" style={{ '--accent': '#6366f1' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">Learn together, stay accountable</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">
            Study <span className="text-gradient">Groups</span>
          </h1>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Create Group</Button>
      </div>

      <form onSubmit={handleJoinByCode} className="mb-8 flex max-w-md gap-2">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Have a join code? e.g. K7PQ2M"
          maxLength={6}
          className="field-glass min-w-0 flex-1 rounded-full font-brand-mono text-sm tracking-[0.2em] placeholder:font-body placeholder:tracking-normal"
        />
        <Button type="submit" variant="secondary" loading={joiningByCode}>Join</Button>
      </form>

      {loading ? (
        <div className={grid}><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="label-caps mb-4">My Groups · {mine.length}</h2>
            {mine.length === 0 ? (
              <p className="text-sm text-text-subtle">You haven't joined any groups yet.</p>
            ) : (
              <div className={grid}>
                {mine.map((g) => <GroupCard key={g.id} group={g} isMember />)}
              </div>
            )}
          </section>
          <section>
            <h2 className="label-caps mb-4">Discover Public Groups</h2>
            {discover.length === 0 ? (
              <EmptyState icon="users" title="Nothing to discover" message="No public groups yet — create the first one!" />
            ) : (
              <div className={grid}>
                {discover.map((g) => (
                  <GroupCard key={g.id} group={g} isMember={false} onJoin={handleJoin} joining={joiningId === g.id} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <CreateGroupModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
    </div>
  )
}
