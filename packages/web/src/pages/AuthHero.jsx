import { motion } from 'framer-motion'

export default function AuthHero() {
  return (
    <div className="relative overflow-hidden py-16 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]" />
      <div className="pointer-events-none absolute -top-10 left-[30%] h-40 w-64 rounded-full bg-accent/15 blur-[90px]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-3xl border border-primary/30 bg-bg-primary/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <svg viewBox="0 0 64 64" width="42" height="42" aria-hidden="true">
            <path
              d="M8 34h12l5-14 8 26 6-18 4 6h13"
              fill="none"
              stroke="url(#hero-pulse-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="hero-pulse-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <h1 className="font-display text-6xl font-bold tracking-[-0.03em]">
          <span className="text-gradient">PULSE</span>
        </h1>
        <p className="mt-3 text-base text-text-secondary">Keep your academic heartbeat</p>
      </motion.div>
    </div>
  )
}
