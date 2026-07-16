import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useAttendance, useSubjectSessions } from '../hooks/useAttendance'
import { markAttendance, clearAttendance } from '../services/attendanceService'
import CalendarGrid from '../components/CalendarGrid'
import { Select } from '../../../shared/components/Input'
import EmptyState from '../../../shared/components/EmptyState'
import { useToast } from '../../../shared/components/Toast'

export default function MonthlyReportPage() {
  const { user } = useAuth()
  const showToast = useToast()
  const { subjects, loading } = useAttendance(user?.uid)
  const [subjectId, setSubjectId] = useState('')
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  const activeSubjectId = subjectId || subjects[0]?.id || null
  const { sessions, stats } = useSubjectSessions(user?.uid, activeSubjectId)

  const sessionsByDate = useMemo(() => {
    const map = {}
    sessions.forEach((s) => { map[s.id] = s })
    return map
  }, [sessions])

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
  }
  const goNext = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
  }

  // Cycle none → present → absent → none on click.
  const handleDayClick = async (dateId, currentStatus) => {
    try {
      if (currentStatus === 'none') {
        await markAttendance(user.uid, activeSubjectId, dateId, 'present')
        showToast(`Marked present on ${dateId}`, 'success')
      } else if (currentStatus === 'present') {
        await markAttendance(user.uid, activeSubjectId, dateId, 'absent')
        showToast(`Marked absent on ${dateId}`, 'info')
      } else {
        await clearAttendance(user.uid, activeSubjectId, dateId)
        showToast(`Cleared mark on ${dateId}`, 'info')
      }
    } catch (err) {
      console.error(err)
      showToast('Could not update attendance.', 'error')
    }
  }

  if (!loading && subjects.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="No subjects to report on"
        message="Add a subject on the Attendance page first."
        action={<Link to="/attendance" className="text-primary-light hover:underline">← Back to Attendance</Link>}
      />
    )
  }

  return (
    <div className="hero-spot mx-auto max-w-[720px]" style={{ '--accent': '#3b82f6' }}>
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em]">Monthly Report</h1>
        <Link to="/attendance" className="mt-1 inline-block text-sm text-primary-light hover:underline">
          ← Back to Attendance
        </Link>
      </div>

      <Select label="Subject" value={activeSubjectId || ''} onChange={(e) => setSubjectId(e.target.value)}>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </Select>

      <div className="card-glass mb-6 grid grid-cols-4 gap-4 p-6 text-center">
        <div>
          <p className="label-caps mb-1">Sessions</p>
          <p className="font-brand-mono text-xl font-bold">{stats.presentCount} / {stats.totalSessions}</p>
        </div>
        <div>
          <p className="label-caps mb-1">Present</p>
          <p className="font-brand-mono text-xl font-bold text-emerald-300">{stats.presentCount}</p>
        </div>
        <div>
          <p className="label-caps mb-1">Absent</p>
          <p className="font-brand-mono text-xl font-bold text-red-300">{stats.absentCount}</p>
        </div>
        <div>
          <p className="label-caps mb-1">Percentage</p>
          <p className="font-brand-mono text-xl font-bold text-primary-light">{Math.round(stats.percentage)}%</p>
        </div>
      </div>

      <CalendarGrid
        month={month}
        year={year}
        sessionsByDate={sessionsByDate}
        onPrev={goPrev}
        onNext={goNext}
        onDayClick={handleDayClick}
      />
      <p className="mt-3 text-center text-xs text-text-subtle">
        Click a day to cycle: no mark → present → absent → no mark
      </p>
    </div>
  )
}
