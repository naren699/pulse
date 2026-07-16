import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '../shared/components/Icon'

// Per-module accent colors — each feature owns a hue across the app.
export const MODULE_ACCENTS = {
  '/dashboard': '#7c6cff',
  '/attendance': '#3b82f6',
  '/challenges': '#a855f7',
  '/hackathons': '#ff9d5c',
  '/tasks': '#22d3ee',
  '/notes': '#00e29a',
  '/focus': '#ff7ad9',
  '/goals': '#8b5cf6',
  '/groups': '#6366f1',
}

export const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'home' },
      { to: '/attendance', label: 'Attendance', icon: 'check' },
      { to: '/challenges', label: 'Challenges', icon: 'code' },
      { to: '/hackathons', label: 'Hackathons', icon: 'trophy' },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { to: '/tasks', label: 'Tasks', icon: 'checkbox' },
      { to: '/notes', label: 'Notes', icon: 'note' },
      { to: '/focus', label: 'Focus', icon: 'timer' },
      { to: '/goals', label: 'Goals', icon: 'target' },
    ],
  },
  {
    title: 'Community',
    items: [{ to: '/groups', label: 'Groups', icon: 'users' }],
  },
]

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

function PulseLogo({ size = 26 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9d8fff" />
          <stop offset="100%" stopColor="#ff7ad9" />
        </linearGradient>
      </defs>
      <path
        d="M8 34h12l5-14 8 26 6-18 4 6h13"
        fill="none"
        stroke="url(#logo-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NavItems({ collapsed, onNavigate }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV_SECTIONS.map((section, si) => (
        <div key={si} className={si > 0 ? 'mt-4' : ''}>
          <AnimatePresence initial={false}>
            {section.title && !collapsed && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="label-caps overflow-hidden px-3 pb-1.5 text-[10px]"
              >
                {section.title}
              </motion.p>
            )}
          </AnimatePresence>
          {section.title && collapsed && <div className="mx-3 mb-2 border-t border-white/[0.07]" />}

          {section.items.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            const accent = MODULE_ACCENTS[item.to]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={item.label}
                className="group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-200"
                style={{ color: isActive ? '#f4f6fb' : undefined }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-2xl border"
                    style={{
                      background: `linear-gradient(120deg, ${accent}2e, ${accent}14)`,
                      borderColor: `${accent}45`,
                      boxShadow: `0 0 24px -6px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }}
                  />
                )}
                <span
                  className="relative z-10 transition-transform duration-200 group-hover:scale-110"
                  style={{ color: isActive ? accent : '#8b94ab' }}
                >
                  <Icon name={item.icon} size={19} strokeWidth={isActive ? 2.1 : 1.8} />
                </span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className={`relative z-10 whitespace-nowrap font-display ${isActive ? 'text-text-primary' : 'text-text-tertiary group-hover:text-text-secondary'}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('pulse-sidebar') === 'collapsed')

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem('pulse-sidebar', c ? 'expanded' : 'collapsed')
      return !c
    })
  }

  return (
    <>
      {/* Desktop floating glass panel */}
      <motion.aside
        animate={{ width: collapsed ? 78 : 248 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="glass-panel sticky top-4 z-30 my-4 ml-4 hidden h-[calc(100vh-32px)] shrink-0 flex-col overflow-hidden md:flex"
      >
        <div className={`flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5 ${collapsed ? 'justify-center px-0' : ''}`}>
          <motion.div animate={{ rotate: [0, 0] }} whileHover={{ scale: 1.15, rotate: -6 }}>
            <PulseLogo />
          </motion.div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="font-display text-lg font-bold tracking-[-0.01em]"
              >
                PULSE
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <NavItems collapsed={collapsed} />
        </div>

        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <button
            onClick={toggleCollapsed}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-text-subtle transition-all hover:bg-white/[0.05] hover:text-text-secondary"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <Icon name="collapse" size={18} />
            </motion.span>
            {!collapsed && <span className="font-display text-xs font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-dark/70 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="glass-panel absolute inset-y-3 left-3 flex w-[248px] flex-col rounded-3xl"
            >
              <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-5">
                <span className="flex items-center gap-2 font-display text-lg font-bold">
                  <PulseLogo size={22} /> PULSE
                </span>
                <button onClick={onClose} className="rounded-xl p-2 text-text-tertiary hover:text-text-primary" aria-label="Close menu">
                  <Icon name="x" size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <NavItems collapsed={false} onNavigate={onClose} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
