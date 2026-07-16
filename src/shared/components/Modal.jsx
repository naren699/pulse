import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon'

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-[500px]' }) {
  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-bg-dark/70 p-4 backdrop-blur-[14px]"
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`card-elevated w-[92%] ${maxWidth} max-h-[88vh] overflow-y-auto p-8`}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <h3 className="font-display text-xl font-semibold tracking-[-0.01em]">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-text-tertiary transition-all hover:rotate-90 hover:bg-white/[0.06] hover:text-text-primary"
                aria-label="Close"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="pt-6 text-sm leading-relaxed text-text-secondary">{children}</div>
            {footer && (
              <div className="mt-6 flex justify-end gap-3 border-t border-white/[0.07] pt-6">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[420px]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-xl bg-warning/10 p-2 text-warning">
          <Icon name="warning" size={20} />
        </span>
        <p>{message}</p>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-display text-sm font-semibold text-text-secondary backdrop-blur-xl transition-all hover:bg-white/[0.08]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-xl border border-danger/30 bg-danger/20 px-6 py-3 font-display text-sm font-semibold text-[#ff8fa3] transition-all hover:bg-danger/30 hover:shadow-[0_8px_32px_-8px_rgba(255,94,120,0.4)] disabled:opacity-50"
        >
          {loading ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
