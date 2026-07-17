import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@pulse/shared/context'
import { useAttendance } from '@pulse/shared/hooks'
import { useAttendanceOverview } from '@pulse/shared/hooks'
import { attendanceStatus } from '@pulse/shared/services'
import { useChallenges } from '@pulse/shared/hooks'
import { useHackathons } from '@pulse/shared/hooks'
import { useTasks } from '@pulse/shared/hooks'
import { addTask, toggleTask } from '@pulse/shared/services'
import { useGoals } from '@pulse/shared/hooks'
import { GoalProgressBar } from '../../goals/pages/GoalsPage'
import ProgressRing from '../../../shared/components/ProgressRing'
import CountUp from '../../../shared/components/CountUp'
import Icon from '../../../shared/components/Icon'
import { SkeletonCard } from '../../../shared/components/Skeleton'
import { useToast } from '../../../shared/components/Toast'
import { countdownText, formatDateLong, formatDateRange, toDateId } from '@pulse/shared/utils'

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
    <div className="hero-spot" style={{ '--accent': '#8b5cf6' }}>
      {/* ── Hero greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-wrap items-end justify-between gap-6 pt-2"
      >
        <div>
          <p className="label-caps mb-3">{formatDateLong()}</p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-[0.02em] md:text-[3.5rem]">
            {greeting()},{' '}
            <span className="text-primary-light">{profile?.displayName?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="mt-3 text-sm text-text-tertiary">
            {isDoneToday ? 'Challenge done — the streak lives on. 🔥' : 'Your mission control is ready.'}
          </p>
        </div>
        <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-white sm:flex">
          {(profile?.displayName || 'S').charAt(0).toUpperCase()}
        </div>
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
              style={{ '--accent': '#8b5cf6' }}
            >
              <CardHeader icon="check" title="Attendance" accent="#8b5cf6" cta="Open" />
              {subjects.length === 0 ? (
                <p className="text-sm text-text-subtle">No subjects yet. Add one to start tracking.</p>
              ) : (
                <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
                  <ProgressRing percent={overall.overallPercent} size="xl" label="overall" from="#8b5cf6" to="#a78bfa" />
                  <div className="min-w-0 flex-1 space-y-3">
                    {subjects.slice(0, 4).map((s) => {
                      const stats = getStats(s.id)
                      const { status } = attendanceStatus(stats.percentage, s.targetPercent, stats.totalSessions)
                      const barColor = status === 'success' ? '#34d399' : status === 'warning' ? '#d9a854' : status === 'danger' ? '#ef4444' : '#8a91a5'
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
                              style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, boxShadow: `0 2px 8px ${barColor}33` }}
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
              style={{ '--accent': '#8b5cf6' }}
            >
              <CardHeader icon="code" title="Streak" accent="#8b5cf6" cta="Solve" />
              <div className="flex flex-1 items-center gap-4">
                <motion.span
                  animate={{ scale: isDoneToday ? [1, 1.14, 1] : 1, rotate: isDoneToday ? [-2, 3, -2] : 0 }}
                  transition={{ duration: 1.6, repeat: isDoneToday ? Infinity : 0, ease: 'easeInOut' }}
                  className="text-5xl"
                >
                  🔥
                </motion.span>
                <div>
                  <CountUp value={streakStats.currentStreak} className="font-display text-5xl font-bold text-text-primary" />
                  <p className="mt-1 text-xs text-text-tertiary">
                    day streak · best {streakStats.longestStreak}
                  </p>
                  <p className={`mt-1 text-xs font-semibold ${isDoneToday ? 'text-success' : 'text-warning'}`}>
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
              style={{ '--accent': '#8b5cf6' }}
            >
              <CardHeader icon="trophy" title="Hackathons" accent="#8b5cf6" cta="Browse" />
              {nextHackathon ? (
                <div className="flex flex-1 flex-col justify-center">
                  <p className="truncate font-display text-base font-semibold">{nextHackathon.title}</p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-primary-light">
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
              style={{ '--accent': '#8b5cf6' }}
            >
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary-light"
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
            style={{ '--accent': '#8b5cf6' }}
          >
            <div className="flex items-center justify-between">
              <CardHeader icon="checkbox" title="Today's Tasks" accent="#8b5cf6" />
              {groups.today.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 font-display text-[11px] font-bold text-white">
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
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20 transition-colors hover:border-primary-light"
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
                style={{ '--accent': '#8b5cf6' }}
              />
            </form>
            <Link to="/tasks" className="mt-3 text-xs font-medium text-primary-light transition-colors hover:underline hover:underline-offset-4">
              View all tasks →
            </Link>
          </motion.div>

          {/* ── Solved total ── */}
          <Link to="/challenges" className="group block">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="card-glass relative flex h-full flex-col items-center justify-center p-6 text-center"
              style={{ '--accent': '#8b5cf6' }}
            >
              <CountUp value={streakStats.totalCompleted} className="font-display text-5xl font-bold text-primary-light" />
              <p className="label-caps mt-2">Challenges solved</p>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
