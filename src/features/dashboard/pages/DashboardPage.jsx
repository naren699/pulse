import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import { useAttendance } from '../../attendance/hooks/useAttendance'
import { useAttendanceOverview } from '../../attendance/hooks/useAttendanceOverview'
import { attendanceStatus } from '../../attendance/services/attendanceService'
import { useChallenges } from '../../challenges/hooks/useChallenges'
import { useHackathons } from '../../hackathons/hooks/useHackathons'
import { useTasks } from '../../tasks/hooks/useTasks'
import { addTask, toggleTask } from '../../tasks/services/taskService'
import { useGoals } from '../../goals/hooks/useGoals'
import { GoalProgressBar } from '../../goals/pages/GoalsPage'
import ProgressRing from '../../../shared/components/ProgressRing'
import CountUp from '../../../shared/components/CountUp'
import Icon from '../../../shared/components/Icon'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'
import { countdownText, formatDateLong, formatDateRange, toDateId } from '../../../shared/utils/dates'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 26 } },
}

function Bento({ accent, to, className = '', children }) {
  const inner = (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 26 } }}
      className={`card-glass relative flex h-full flex-col p-6 ${className}`}
      style={{ '--accent': accent }}
    >
      {children}
    </motion.div>
  )
  return to ? <Link to={to} className={`block h-full ${className.includes('col-span') ? className : ''}`}>{inner}</Link> : inner
}

function CardHeader({ icon, title, accent, cta }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl border"
          style={{ color: accent, borderColor: `${accent}35`, background: `${accent}14` }}
        >
          <Icon name={icon} size={16} />
        </span>
        <h3 className="font-display text-sm font-semibold tracking-[0.01em]">{title}</h3>
      </div>
      {cta && <span className="text-xs font-medium text-text-subtle transition-colors group-hover:text-text-secondary">{cta} →</span>}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Burning the midnight oil'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const showToast = useToast()
  const { subjects, loading: attLoading } = useAttendance(user?.uid)
  const { getStats, overall } = useAttendanceOverview(user?.uid, subjects)
  const { streakStats, isDoneToday, loading: chLoading } = useChallenges(user?.uid)
  const { upcoming, loading: hackLoading } = useHackathons()
  const { groups, loading: tasksLoading } = useTasks(user?.uid)
  const { goals, active, loading: goalsLoading } = useGoals(user?.uid)
  const [quick, setQuick] = useState('')

  const loading = attLoading || chLoading || hackLoading || tasksLoading || goalsLoading
  const nextHackathon = upcoming[0] || null

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!quick.trim()) return
    const title = quick.trim()
    setQuick('')
    try {
      await addTask(user.uid, { title, dueDate: toDateId() })
      showToast('Task added for today', 'success')
    } catch (err) {
      console.error(err)
      showToast('Could not add task.', 'error')
    }
  }

  return (
    <div className="hero-spot" style={{ '--accent': '#7c6cff' }}>
      {/* ── Hero greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-wrap items-end justify-between gap-6 pt-2"
      >
        <div>
          <p className="label-caps mb-2">{formatDateLong()}</p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
            {greeting()},{' '}
            <span className="text-gradient">{profile?.displayName?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="mt-2 text-sm text-text-tertiary">
            {isDoneToday ? 'Challenge done — the streak lives on. 🔥' : 'Your mission control is ready.'}
          </p>
        </div>
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent font-display text-2xl font-bold text-white shadow-[0_16px_48px_-10px_rgba(168,85,247,0.7)] sm:flex"
        >
          {(profile?.displayName || 'S').charAt(0).toUpperCase()}
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:row-span-2"><SkeletonCard lines={6} /></div>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid auto-rows-[minmax(150px,auto)] gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {/* ── Attendance — large tile ── */}
          <Link to="/attendance" className="group block md:col-span-2 xl:row-span-2">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col p-7"
              style={{ '--accent': '#3b82f6' }}
            >
              <CardHeader icon="check" title="Attendance" accent="#3b82f6" cta="Open" />
              {subjects.length === 0 ? (
                <p className="text-sm text-text-subtle">No subjects yet. Add one to start tracking.</p>
              ) : (
                <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
                  <ProgressRing percent={overall.overallPercent} size="xl" label="overall" from="#3b82f6" to="#22d3ee" />
                  <div className="min-w-0 flex-1 space-y-3">
                    {subjects.slice(0, 4).map((s) => {
                      const stats = getStats(s.id)
                      const { status } = attendanceStatus(stats.percentage, s.targetPercent, stats.totalSessions)
                      const barColor = status === 'success' ? '#00e29a' : status === 'warning' ? '#ffc857' : status === 'danger' ? '#ff5e78' : '#8b94ab'
                      return (
                        <div key={s.id}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                            <span className="truncate text-text-secondary">{s.name}</span>
                            <span className="font-brand-mono text-xs text-text-tertiary">
                              {stats.presentCount}/{stats.totalSessions} · {Math.round(stats.percentage)}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, stats.percentage)}%` }}
                              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`, boxShadow: `0 0 12px ${barColor}66` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {subjects.length > 4 && (
                      <p className="text-xs text-text-subtle">+{subjects.length - 4} more subjects</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </Link>

          {/* ── Streak ── */}
          <Link to="/challenges" className="group block">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col p-6"
              style={{ '--accent': '#a855f7' }}
            >
              <CardHeader icon="code" title="Streak" accent="#a855f7" cta="Solve" />
              <div className="flex flex-1 items-center gap-4">
                <motion.span
                  animate={{ scale: isDoneToday ? [1, 1.14, 1] : 1, rotate: isDoneToday ? [-2, 3, -2] : 0 }}
                  transition={{ duration: 1.6, repeat: isDoneToday ? Infinity : 0, ease: 'easeInOut' }}
                  className="text-5xl drop-shadow-[0_0_18px_rgba(255,122,217,0.6)]"
                >
                  🔥
                </motion.span>
                <div>
                  <CountUp value={streakStats.currentStreak} className="font-brand-mono text-5xl font-bold text-text-primary" />
                  <p className="mt-1 text-xs text-text-tertiary">
                    day streak · best {streakStats.longestStreak}
                  </p>
                  <p className={`mt-1 text-xs font-semibold ${isDoneToday ? 'text-[#7df0c8]' : 'text-[#ffdf9e]'}`}>
                    {isDoneToday ? '✓ Done today' : 'Not done yet'}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* ── Hackathons ── */}
          <Link to="/hackathons" className="group block">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col p-6"
              style={{ '--accent': '#ff9d5c' }}
            >
              <CardHeader icon="trophy" title="Hackathons" accent="#ff9d5c" cta="Browse" />
              {nextHackathon ? (
                <div className="flex flex-1 flex-col justify-center">
                  <p className="truncate font-display text-base font-semibold">{nextHackathon.title}</p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-[#ffb98a]">
                    {countdownText(nextHackathon.startAt, nextHackathon.endAt)}
                  </p>
                  <p className="mt-1 text-xs text-text-subtle">{formatDateRange(nextHackathon.startAt, nextHackathon.endAt)}</p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-sm text-text-subtle">No upcoming hackathons</p>
                  <p className="mt-1 text-xs text-text-subtle">Check back soon</p>
                </div>
              )}
            </motion.div>
          </Link>

          {/* ── Goals ── */}
          <Link to="/goals" className="group block">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col p-6"
              style={{ '--accent': '#8b5cf6' }}
            >
              <CardHeader icon="target" title="Goals" accent="#8b5cf6" cta="View" />
              {goals.length === 0 ? (
                <p className="text-sm text-text-subtle">Set your first goal to get started.</p>
              ) : (
                <div className="flex flex-1 flex-col justify-center space-y-3.5">
                  <p className="text-xs text-text-tertiary">
                    {goals.length - active.length} of {goals.length} completed
                  </p>
                  {active.slice(0, 2).map((goal) => (
                    <div key={goal.id}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="truncate text-text-secondary">{goal.title}</span>
                        <span className="font-brand-mono text-text-subtle">
                          {goal.currentValue || 0}/{goal.targetValue}
                        </span>
                      </div>
                      <GoalProgressBar current={goal.currentValue} target={goal.targetValue} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </Link>

          {/* ── Focus CTA ── */}
          <Link to="/focus" className="group block">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
              style={{ '--accent': '#ff7ad9' }}
            >
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent shadow-[0_0_32px_-6px_rgba(255,122,217,0.6)]"
              >
                <Icon name="play" size={22} />
              </motion.span>
              <div>
                <p className="font-display text-sm font-semibold">Focus Session</p>
                <p className="mt-0.5 text-xs text-text-subtle">Start a deep work sprint</p>
              </div>
            </motion.div>
          </Link>

          {/* ── Tasks — wide tile ── */}
          <motion.div
            variants={item}
            whileHover={{ y: -5 }}
            className="card-glass relative flex flex-col p-6 md:col-span-2 xl:col-span-3"
            style={{ '--accent': '#22d3ee' }}
          >
            <div className="flex items-center justify-between">
              <CardHeader icon="checkbox" title="Today's Tasks" accent="#22d3ee" />
              {groups.today.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-blue px-1.5 font-brand-mono text-[11px] font-bold text-bg-dark">
                  {groups.today.length}
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {groups.today.length === 0 ? (
                <p className="text-sm text-text-subtle">Nothing due today. Enjoy the calm. 🎉</p>
              ) : (
                groups.today.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(user.uid, task).catch(() => showToast('Could not update task.', 'error'))}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20 transition-all hover:border-cyan hover:shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                      aria-label={`Complete ${task.title}`}
                    >
                      {task.done && <Icon name="check" size={12} strokeWidth={3} />}
                    </button>
                    <span className="truncate text-sm text-text-secondary">{task.title}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleQuickAdd} className="mt-4 flex gap-2">
              <input
                value={quick}
                onChange={(e) => setQuick(e.target.value)}
                placeholder="+ Quick add a task for today…"
                className="field-glass min-h-[40px] flex-1 rounded-xl py-2 text-[13px]"
                style={{ '--accent': '#22d3ee' }}
              />
            </form>
            <Link to="/tasks" className="mt-3 font-display text-xs font-semibold text-[#7ee4f5] transition-colors hover:text-cyan">
              View all tasks →
            </Link>
          </motion.div>

          {/* ── Solved total ── */}
          <Link to="/challenges" className="group block">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col items-center justify-center p-6 text-center"
              style={{ '--accent': '#00e29a' }}
            >
              <CountUp value={streakStats.totalCompleted} className="font-brand-mono text-5xl font-bold text-[#7df0c8]" />
              <p className="label-caps mt-2">Challenges solved</p>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
