import { motion } from 'framer-motion'
import Spinner from './Spinner'

const VARIANTS = {
  primary:
    'btn-gradient text-white border border-white/15 shadow-[0_10px_36px_-8px_rgba(124,108,255,0.65)] hover:shadow-[0_16px_48px_-8px_rgba(168,85,247,0.7)]',
  secondary:
    'bg-white/[0.04] text-primary-light border border-primary-light/35 backdrop-blur-xl hover:bg-primary/15 hover:border-primary-light/60 hover:shadow-[0_8px_32px_-8px_rgba(124,108,255,0.45)]',
  ghost:
    'bg-transparent text-primary-light border border-transparent hover:bg-primary/10 hover:border-primary/25',
  danger:
    'bg-danger/15 text-[#ff8fa3] border border-danger/30 hover:bg-danger/25 hover:border-danger/50 hover:shadow-[0_8px_32px_-8px_rgba(255,94,120,0.4)]',
}

const SIZES = {
  lg: 'px-8 py-3.5 text-base min-w-[120px] rounded-2xl',
  md: 'px-6 py-3 text-sm min-w-[100px] rounded-xl',
  sm: 'px-4 py-2 text-xs min-w-[80px] rounded-[10px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled || loading ? undefined : { y: -2, scale: 1.015 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      disabled={disabled || loading}
      className={[
        'relative inline-flex items-center justify-center gap-2 font-display font-semibold',
        'transition-[box-shadow,background-color,border-color] duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        loading ? 'cursor-wait' : '',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Spinner size={16} />}
      <span className={`inline-flex items-center gap-2 ${loading ? 'opacity-70' : ''}`}>{children}</span>
    </motion.button>
  )
}
