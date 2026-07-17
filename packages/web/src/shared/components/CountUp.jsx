import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue } from 'framer-motion'

/** Apple-widget style number that counts up when it scrolls into view. */
export default function CountUp({ value = 0, duration = 1.1, suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)

  useEffect(() => {
    if (!inView) return undefined
    const controls = animate(mv, Number(value) || 0, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, suffix, mv])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      0{suffix}
    </span>
  )
}
