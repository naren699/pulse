import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, friendlyAuthError } from '../context/AuthContext'
import AuthHero from './AuthHero'
import AnimatedBackground from '../shared/components/AnimatedBackground'
import Button from '../shared/components/Button'
import { Input, Select } from '../shared/components/Input'

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Australia/Sydney',
]

function validate({ displayName, email, password, confirm, agreed }) {
  const errors = {}
  if (!displayName || displayName.trim().length < 2) errors.displayName = 'Display name is required (min 2 characters).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (password !== confirm) errors.confirm = 'Passwords do not match.'
  if (!agreed) errors.agreed = 'You must agree to the Terms of Service.'
  return errors
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirm: '',
    timezone: 'Asia/Kolkata',
    agreed: false,
  })
  const [errors, setErrors] = useState({})
  const [topError, setTopError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setTopError('')
    if (Object.keys(nextErrors).length) return
    setLoading(true)
    try {
      await signup(form)
      navigate('/dashboard')
    } catch (err) {
      setTopError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <AuthHero />
      <div className="mx-auto w-full max-w-[420px] px-4 pb-16">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="card-elevated p-8"
          noValidate>
          <h2 className="mb-6 font-display text-2xl font-semibold">Create Account</h2>
          <Input
            label="Display Name"
            placeholder="Your name"
            value={form.displayName}
            onChange={set('displayName')}
            error={errors.displayName}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            autoComplete="new-password"
          />
          <Select label="Timezone" value={form.timezone} onChange={set('timezone')}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
          <label className="mb-4 flex cursor-pointer items-start gap-2.5 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={set('agreed')}
              className="mt-0.5 h-4 w-4 accent-indigo-500"
            />
            <span>I agree to the Terms of Service</span>
          </label>
          {errors.agreed && <p className="mb-3 -mt-2 text-xs font-medium text-red-300">⚠️ {errors.agreed}</p>}
          {topError && (
            <div className="mb-4 animate-fade-slide-up rounded-lg border border-danger/30 bg-danger/15 px-4 py-2.5 text-xs font-medium text-red-300">
              {topError}
            </div>
          )}
          <Button type="submit" fullWidth loading={loading}>
            Create Account
          </Button>
          <p className="mt-6 text-center text-xs text-text-tertiary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-light hover:underline">
              Sign In
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}
