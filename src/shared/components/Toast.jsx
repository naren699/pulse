import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

const TONES = {
  success: 'border-success/30 bg-[#0a1f18]/90 text-[#7df0c8] shadow-[0_12px_40px_-8px_rgba(0,226,154,0.35)]',
  error: 'border-danger/30 bg-[#241118]/90 text-[#ff9fb0] shadow-[0_12px_40px_-8px_rgba(255,94,120,0.35)]',
  info: 'border-primary/30 bg-[#151228]/90 text-[#bdb2ff] shadow-[0_12px_40px_-8px_rgba(124,108,255,0.4)]',
  streak: 'border-accent/30 bg-gradient-to-r from-[#241326]/95 to-[#261a12]/95 text-[#ffb3e6] shadow-[0_12px_40px_-8px_rgba(255,122,217,0.4)]',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const showToast = useCallback((message, tone = 'info', duration = 3000) => {
    const id = ++idRef.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={[
                'rounded-2xl border px-5 py-3 font-display text-sm font-semibold backdrop-blur-2xl',
                TONES[t.tone] || TONES.info,
              ].join(' ')}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) throw new Error('useToast must be used inside <ToastProvider>')
  return showToast
}
