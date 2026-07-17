import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@pulse/shared/context'
import Icon from '../shared/components/Icon'
import { NAV_ITEMS, MODULE_ACCENTS } from './Sidebar'

/** Centered quick-nav: type a page name, Enter jumps there. Ctrl/⌘K focuses. */
function CommandSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 5)
  }, [query])

  const go = (to) => {
    navigate(to)
    setQuery('')
    inputRef.current?.blur()
  }

  return (
    <div className="relative hidden w-full max-w-[380px] sm:block">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle">
        <Icon name="search" size={15} />
      </span>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && matches[0]) go(matches[0].to)
          if (e.key === 'Escape') inputRef.current?.blur()
        }}
        placeholder="Jump to…"
        className="field-glass h-10 rounded-full py-0 pl-10 pr-16 text-[13px]"
      />
      <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-brand-mono text-[10px] text-text-subtle">
        ⌘K
      </kbd>

      <AnimatePresence>
        {focused && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="glass-panel absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl p-1.5"
          >
            {matches.map((m) => (
              <button
                key={m.to}
                onMouseDown={(e) => { e.preventDefault(); go(m.to) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
              >
                <span style={{ color: MODULE_ACCENTS[m.to] }}>
                  <Icon name={m.icon} size={16} />
                </span>
                {m.label}
                <span className="ml-auto text-[10px] text-text-subtle">↵</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar({ onOpenMobileMenu }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initial = (profile?.displayName || 'S').charAt(0).toUpperCase()

  return (
    <header className="sticky top-4 z-30 px-4 md:px-6">
      <div className="glass-panel flex h-14 items-center justify-between gap-3 rounded-full px-3 pl-4">
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 text-text-tertiary hover:text-text-primary md:hidden"
            onClick={onOpenMobileMenu}
            aria-label="Open menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
            <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden="true">
              <path d="M8 34h12l5-14 8 26 6-18 4 6h13" fill="none" stroke="#a78bfa" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-base font-bold">PULSE</span>
          </Link>
        </div>

        <div className="flex flex-1 justify-center">
          <CommandSearch />
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="relative rounded-full p-2.5 text-text-tertiary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
            aria-label="Notifications"
            title="Notifications"
          >
            <Icon name="bell" size={18} />
          </motion.button>

          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white"
              aria-label="User menu"
            >
              {initial}
            </motion.button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="glass-panel absolute right-0 mt-3 w-56 rounded-2xl p-2"
                >
                  <div className="border-b border-white/[0.07] px-3 py-2.5">
                    <p className="truncate font-display text-sm font-semibold">{profile?.displayName}</p>
                    <p className="truncate text-xs text-text-subtle">{profile?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-danger/15 hover:text-danger/80"
                  >
                    <Icon name="logout" size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
