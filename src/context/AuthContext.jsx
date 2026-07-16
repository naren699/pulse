import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'

const AuthContext = createContext(null)

// Owner account — always granted admin rights (hackathon posting, etc.).
const ADMIN_EMAILS = ['pnarendhiran6@gmail.com']

const FRIENDLY_ERRORS = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password should be at least 8 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and retry.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before finishing.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Firebase is not configured yet — add your project keys to .env.local.',
}

export function friendlyAuthError(err) {
  return FRIENDLY_ERRORS[err?.code] || 'Something went wrong. Please try again.'
}

async function ensureUserProfile(user, extra = {}) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  const isAdminEmail = ADMIN_EMAILS.includes((user.email || '').toLowerCase())

  if (!snap.exists()) {
    const profile = {
      displayName: user.displayName || extra.displayName || 'Student',
      email: user.email,
      role: isAdminEmail ? 'admin' : 'student',
      timezone: extra.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, profile)
    return { id: user.uid, ...profile }
  }

  const existing = { id: snap.id, ...snap.data() }
  if (isAdminEmail && existing.role !== 'admin') {
    await updateDoc(ref, { role: 'admin' })
    return { ...existing, role: 'admin' }
  }
  return existing
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          setProfile(await ensureUserProfile(firebaseUser))
        } catch (err) {
          console.error('Failed to load user profile:', err)
          setProfile({ id: firebaseUser.uid, displayName: firebaseUser.displayName, email: firebaseUser.email, role: 'student' })
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signup = async ({ email, password, displayName, timezone }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    setProfile(await ensureUserProfile(cred.user, { displayName, timezone }))
    return cred.user
  }

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider)
    setProfile(await ensureUserProfile(cred.user))
    return cred.user
  }

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const logout = () => signOut(auth)

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signup,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
