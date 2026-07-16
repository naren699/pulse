import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useAttendance } from '../hooks/useAttendance'
import { useAttendanceOverview } from '../hooks/useAttendanceOverview'
import {
  addSubject,
  updateSubject,
  deleteSubject,
  markQuickAttendance,
} from '../services/attendanceService'
import AttendanceCard from '../components/AttendanceCard'
import AddSubjectModal from '../components/AddSubjectModal'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import { ConfirmModal } from '../../../shared/components/Modal'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'
import { formatDateLong } from '../../../shared/utils/dates'

function OverallStats({ overall }) {
  const items = [
    { label: 'Overall Attendance', value: `${Math.round(overall.overallPercent)}%`, icon: '📊' },
    { label: 'Subjects Tracked', value: overall.totalSubjects, icon: '📚' },
    { label: 'Best Subject', value: overall.best ? `${overall.best.name} (${Math.round(overall.best.percentage)}%)` : '—', icon: '🏅' },
    { label: 'Needs Attention', value: overall.worst ? `${overall.worst.name} (${Math.round(overall.worst.percentage)}%)` : '—', icon: '⚠️' },
  ]
  return (
    <div className="card-elevated mb-8 grid grid-cols-2 gap-6 p-7 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="label-caps mb-1.5">{item.icon} {item.label}</p>
          <p className="truncate font-display text-2xl font-bold tracking-[-0.01em] text-text-primary" title={String(item.value)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function AttendancePage() {
  const { user } = useAuth()
  const showToast = useToast()
  const { subjects, loading } = useAttendance(user?.uid)
  const { getStats, overall } = useAttendanceOverview(user?.uid, subjects)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateSubject(user.uid, editing.id, data)
        showToast('Subject updated', 'success')
      } else {
        await addSubject(user.uid, data)
        showToast('Subject added 🎉', 'success')
      }
    } catch (err) {
      console.error(err)
      showToast('Could not save subject. Are Firebase keys configured?', 'error')
    }
  }

  const handleMark = async (subject, status) => {
    try {
      await markQuickAttendance(user.uid, subject.id, status)
      showToast(`Marked ${status} for ${subject.name}`, status === 'present' ? 'success' : 'info')
    } catch (err) {
      console.error(err)
      showToast('Could not mark attendance.', 'error')
    }
  }

  const handleDelete = async () => {
    setDeletingBusy(true)
    try {
      await deleteSubject(user.uid, deleting.id)
      showToast('Subject deleted', 'info')
      setDeleting(null)
    } catch (err) {
      console.error(err)
      showToast('Could not delete subject.', 'error')
    } finally {
      setDeletingBusy(false)
    }
  }

  return (
    <div className="hero-spot" style={{ '--accent': '#3b82f6' }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps mb-2">{formatDateLong()}</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">
            Attendance <span className="text-gradient-cool">Manager</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/attendance/monthly">
            <Button variant="secondary">Monthly Report</Button>
          </Link>
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>+ Add Subject</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No subjects yet"
          message="Add one to get started tracking your attendance."
          action={<Button onClick={() => setModalOpen(true)}>+ Add Subject</Button>}
        />
      ) : (
        <>
          <OverallStats overall={overall} />
          <div className="grid gap-6 md:grid-cols-2">
            {subjects.map((subject) => (
              <AttendanceCard
                key={subject.id}
                subject={subject}
                stats={getStats(subject.id)}
                onMarkPresent={(s) => handleMark(s, 'present')}
                onMarkAbsent={(s) => handleMark(s, 'absent')}
                onEdit={(s) => { setEditing(s); setModalOpen(true) }}
                onDelete={(s) => setDeleting(s)}
              />
            ))}
          </div>
        </>
      )}

      <AddSubjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Delete Subject"
        message={`Delete "${deleting?.name}" and all its attendance records? This cannot be undone.`}
      />
    </div>
  )
}
