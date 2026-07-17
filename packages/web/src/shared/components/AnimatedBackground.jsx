// Fixed full-viewport backdrop: slow-drifting gradient orbs over the base
// dark, a faint noise texture, and a soft edge vignette. Pure CSS motion —
// cheap to render and always behind the app (negative z-index).
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg-dark" aria-hidden="true">
      {/* Two restrained gradient layers: warm violet up top, cool slate-teal below */}
      <div
        className="absolute -top-[15%] -left-[10%] h-[55vh] w-[45vw] rounded-full opacity-[0.16] blur-[120px] animate-orb-drift"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, #7c3aed 55%, transparent 75%)' }}
      />
      <div
        className="absolute -bottom-[18%] -right-[12%] h-[50vh] w-[40vw] rounded-full opacity-[0.08] blur-[130px] animate-orb-drift-2"
        style={{ background: 'radial-gradient(circle, #64b6ac 0%, #3d6f6a 55%, transparent 75%)' }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: NOISE_URI }} />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 90% 85% at 50% 45%, transparent 55%, rgba(4, 5, 10, 0.65) 100%)' }}
      />
    </div>
  )
}
