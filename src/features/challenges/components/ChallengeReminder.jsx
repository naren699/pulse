import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { doc } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useAuth } from '../../../context/AuthContext'
import { useFirestoreListener } from '../../../shared/hooks/useFirestoreListener'
import { toDateId } from '../../../shared/utils/dates'
import Icon from '../../../shared/components/Icon'

// Global banner shown below the navbar while today's challenge is unsolved.
export default function ChallengeReminder() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const todayId = toDateId()

  const { data: todaysProgress, loading } = useFirestoreListener(
    user ? doc(db, 'users', user.uid, 'challengeProgress', todayId) : null,
    null,
    [user?.uid, todayId],
  )

  const isDone = todaysProgress?.status === 'done'
  if (loading || isDone || dismissed || location.pathname === '/challenges') return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-gradient-to-r from-warning/15 to-accent/10 px-5 py-3.5 shadow-[0_0_32px_rgba(245,158,11,0.1)] animate-slide-down-in">
      <span className="text-amber-300"><Icon name="clock" size={20} /></span>
      <p className="flex-1 text-sm font-medium text-amber-100">
        Today's challenge isn't done yet. Solve it to keep your streak! 🔥
      </p>
      <button
        onClick={() => navigate('/challenges')}
        className="rounded-lg border border-warning/40 bg-warning/15 px-4 py-1.5 font-display text-xs font-semibold text-amber-200 transition-all hover:scale-[1.02] hover:bg-warning/25"
      >
        Solve Now →
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-lg p-1.5 text-amber-200/60 transition-colors hover:text-amber-100"
        aria-label="Dismiss reminder"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}
