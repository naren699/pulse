import { motion } from 'framer-motion'
import Spinner from './Spinner'

const VARIANTS = {
  // Solid accent, no glow — hover gets +5% brightness via btn-gradient utility.
  primary: 'btn-gradient text-white',
  // Outlined accent that fills on hover.
  secondary:
    'bg-transparent text-primary-light border border-primary/40 hover:bg-primary hover:text-white hover:border-primary',
  // Text button: underline on hover only, no background.
  ghost: 'bg-transparent text-primary-light hover:underline underline-offset-4',
  // Muted destructive.
  danger: 'bg-danger/15 text-danger/80 border border-danger/30 hover:bg-danger/25',
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
      whileHover={disabled || loading ? undefined : { scale: 1.02 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.09, ease: [0.34, 1.56, 0.64, 1] }}
      disabled={disabled || loading}
      className={[
        'relative inline-flex items-center justify-center gap-2 font-display font-semibold',
        'transition-[background-color,border-color,color,filter] duration-200',
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
