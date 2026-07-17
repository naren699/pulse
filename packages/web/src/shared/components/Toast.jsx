import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

const TONES = {
  success: 'border-success/25 bg-surface/95 text-success',
  error: 'border-danger/25 bg-surface/95 text-danger/80',
  info: 'border-primary/25 bg-surface/95 text-primary-light',
  streak: 'border-primary/25 bg-surface/95 text-primary-light',
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
                'rounded-xl border px-5 py-3 text-sm font-medium shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl',
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
