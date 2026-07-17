import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-dark text-center">
      <h1 className="font-brand-mono text-7xl font-bold text-gradient">404</h1>
      <p className="text-text-tertiary">Page not found</p>
      <Link
        to="/dashboard"
        className="rounded-[10px] bg-gradient-to-r from-primary to-primary-light px-6 py-3 font-display text-sm font-semibold text-text-primary transition-transform hover:scale-[1.02]"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
