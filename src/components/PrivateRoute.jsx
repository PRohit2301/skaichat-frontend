import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function PrivateRoute({ children }) {
  const isAuth = useAuthStore((s) => s.isAuth)
  const hasToken = isAuth || !!sessionStorage.getItem('skai_token')

  // ── DEV BYPASS ──
  // Remove this line when backend is ready
  if (import.meta.env.DEV) return children

  if (!hasToken) return <Navigate to="/login" replace />
  return children
}