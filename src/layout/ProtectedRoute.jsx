import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSpinner } from '../shared/components/Spinner'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-dark">
        <PageSpinner label="Checking your session…" />
      </div>
    )
  }
  // VITE_UI_PREVIEW lets you browse the UI without Firebase in local dev only.
  const uiPreview = import.meta.env.DEV && import.meta.env.VITE_UI_PREVIEW
  if (!user && !uiPreview) return <Navigate to="/login" replace />
  return children
}
