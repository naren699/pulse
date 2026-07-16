import { motion } from 'framer-motion'
import Icon from './Icon'

export default function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card-glass flex flex-col items-center justify-center gap-3 p-14 text-center"
    >
      <motion.span
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-3xl border border-primary/20 bg-primary/10 p-5 text-primary-light shadow-[0_0_40px_-10px_rgba(124,108,255,0.5)]"
      >
        <Icon name={icon} size={32} />
      </motion.span>
      {title && <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>}
      {message && <p className="max-w-sm text-sm text-text-tertiary">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
