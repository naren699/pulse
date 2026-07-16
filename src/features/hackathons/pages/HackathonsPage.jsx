import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useHackathons } from '../hooks/useHackathons'
import { createHackathon, deleteHackathon } from '../services/hackathonService'
import HackathonCard from '../components/HackathonCard'
import PostHackathonModal from '../components/PostHackathonModal'
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
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const handlePost = async (data, imageFile) => {
    try {
      await createHackathon(user.uid, data, imageFile)
      showToast('Hackathon posted 🎉', 'success')
    } catch (err) {
      console.error(err)
      showToast('Could not post hackathon.', 'error')
      throw err
    }
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteHackathon(deleting)
      showToast('Hackathon deleted', 'info')
      setDeleting(null)
    } catch (err) {
      console.error(err)
      showToast('Could not delete hackathon.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  const grid = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'

  return (
    <div className="hero-spot" style={{ '--accent': '#ff9d5c' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">Browse & register for upcoming events</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">Hackathons</h1>
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
                  <HackathonCard key={h.id} hackathon={h} isAdmin={isAdmin} onDelete={setDeleting} />
                ))}
              </div>
            )}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="label-caps mb-4">Past</h2>
              <div className={grid}>
                {past.map((h) => (
                  <HackathonCard key={h.id} hackathon={h} isAdmin={isAdmin} onDelete={setDeleting} past />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <PostHackathonModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handlePost} />
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
