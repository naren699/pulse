import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, friendlyAuthError } from '../context/AuthContext'
import { isFirebaseConfigured } from '../config/firebase'
import AuthHero from './AuthHero'
import AnimatedBackground from '../shared/components/AnimatedBackground'
import Button from '../shared/components/Button'
import { Input } from '../shared/components/Input'
import { useToast } from '../shared/components/Toast'

export default function LoginPage() {
  const { login, loginWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const showToast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyAuthError(err))
    }
  }

  const handleForgot = async () => {
    if (!email) return setError('Enter your email first, then click "Forgot Password?"')
    try {
      await resetPassword(email)
      showToast('Password reset email sent ✉️', 'success')
    } catch (err) {
      setError(friendlyAuthError(err))
    }
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <AuthHero />
      <div className="mx-auto w-full max-w-[420px] px-4 pb-16">
        {!isFirebaseConfigured && (
          <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-[#ffdf9e]">
            Firebase isn't configured yet — copy <code className="font-brand-mono">.env.example</code> to{' '}
            <code className="font-brand-mono">.env.local</code> and add your project keys to enable sign-in.
          </div>
        )}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="card-elevated p-8">
          <h2 className="mb-6 font-display text-2xl font-semibold">Sign In</h2>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="-mt-2 mb-4 text-right">
            <button type="button" onClick={handleForgot} className="text-xs text-primary-light hover:underline">
              Forgot Password?
            </button>
          </div>
          {error && (
            <div className="mb-4 animate-fade-slide-up rounded-lg border border-danger/30 bg-danger/15 px-4 py-2.5 text-xs font-medium text-red-300">
              {error}
            </div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
          <Button type="button" variant="secondary" fullWidth className="mt-3" onClick={handleGoogle}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
            </svg>
            Continue with Google
          </Button>
          <p className="mt-6 text-center text-xs text-text-tertiary">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-light hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}
