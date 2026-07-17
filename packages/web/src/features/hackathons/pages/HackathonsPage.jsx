import { useState } from 'react'
import { useAuth } from '@pulse/shared/context'
import { useHackathons } from '@pulse/shared/hooks'
import { createHackathon, deleteHackathon, updateHackathon } from '@pulse/shared/services'
import HackathonCard from '../components/HackathonCard'
import PostHackathonModal from '../components/PostHackathonModal'
import HackathonDetailModal from '../components/HackathonDetailModal'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import { ConfirmModal } from '../../../shared/components/Modal'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'

export default function HackathonsPage() {
  const { user, isAdmin } = useAuth()
  const showToast = useToast()
  const { upcoming, past, loading } = useHackathons()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const handlePost = async (data, imageFile) => {
    try {
      if (editing) {
        await updateHackathon(editing.id, data, imageFile)
        showToast('Hackathon updated', 'success')
      } else {
        await createHackathon(user.uid, data, imageFile)
        showToast('Hackathon posted 🎉', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast(editing ? 'Could not update hackathon.' : 'Could not post hackathon.', 'error')
      throw err
    }
  }

  const openEdit = (hackathon) => {
    setViewing(null)
    setEditing(hackathon)
    setModalOpen(true)
  }

  const closeFormModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteHackathon(deleting)
      showToast('Hackathon deleted', 'info')
      setDeleting(null)
      setViewing(null)
    } catch (err) {
      console.error(err)
      showToast('Could not delete hackathon.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  const grid = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'

  return (
    <div className="hero-spot" style={{ '--accent': '#8b5cf6' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">Browse & register for upcoming events</p>
          <h1 className="font-display text-4xl font-bold tracking-[0.02em]">Hackathons</h1>
        </div>
        {isAdmin && <Button onClick={() => setModalOpen(true)}>+ Post Hackathon</Button>}
      </div>

      {loading ? (
        <div className={grid}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No hackathons yet"
          message={isAdmin ? 'Post the first one!' : 'Check back soon — new hackathons get posted here.'}
          action={isAdmin ? <Button onClick={() => setModalOpen(true)}>+ Post Hackathon</Button> : null}
        />
      ) : (
        <>
          <section className="mb-10">
            <h2 className="label-caps mb-4">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-text-subtle">Nothing upcoming right now.</p>
            ) : (
              <div className={grid}>
                {upcoming.map((h) => (
                  <HackathonCard key={h.id} hackathon={h} isAdmin={isAdmin} onOpen={setViewing} onEdit={openEdit} onDelete={setDeleting} />
                ))}
              </div>
            )}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="label-caps mb-4">Past</h2>
              <div className={grid}>
                {past.map((h) => (
                  <HackathonCard key={h.id} hackathon={h} isAdmin={isAdmin} onOpen={setViewing} onEdit={openEdit} onDelete={setDeleting} past />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <PostHackathonModal isOpen={modalOpen} onClose={closeFormModal} onSubmit={handlePost} hackathon={editing} />
      <HackathonDetailModal
        hackathon={viewing}
        isAdmin={isAdmin}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={setDeleting}
      />
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete Hackathon"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
