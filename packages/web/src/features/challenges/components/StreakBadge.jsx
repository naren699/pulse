import { motion } from 'framer-motion'
import CountUp from '../../../shared/components/CountUp'

function StatCard({ value, label, icon, subtext, highlight = false, bouncing = false, flame = false }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`card-glass flex-1 p-6 text-center ${highlight ? '' : ''}`}
      style={{ '--accent': '#8b5cf6' }}
    >
      <div className={`flex items-center justify-center gap-2 ${bouncing ? 'animate-bounce-pop' : ''}`}>
        <CountUp value={value} className="font-brand-mono text-5xl font-bold text-text-primary" />
        <motion.span
          animate={flame && value > 0 ? { scale: [1, 1.15, 0.96, 1], rotate: [-2, 3, -1, -2] } : undefined}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-2xl"
          style={highlight ? { filter: 'drop-shadow(0 0 18px rgba(255,122,217,0.55))' } : undefined}
        >
          {icon}
        </motion.span>
      </div>
      <p className="label-caps mt-2.5">{label}</p>
      {subtext && <p className="mt-1 text-xs text-text-subtle">{subtext}</p>}
    </motion.div>
  )
}

export default function StreakBadge({ currentStreak, longestStreak, totalCompleted, celebrating = false }) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 sm:flex-row">
      <StatCard
        value={currentStreak}
        label="Day Streak"
        icon="🔥"
        subtext={currentStreak > 0 ? 'Keep it going!' : 'Start today!'}
        highlight
        flame
        bouncing={celebrating}
      />
      <StatCard value={longestStreak} label="Longest" icon="🏆" />
      <StatCard value={totalCompleted} label="Solved" icon="✓" />
    </div>
  )
}
