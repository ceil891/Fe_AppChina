import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { LoadingState } from '../../shared/components/LoadingState'
import { SessionRetry } from '../../shared/components/SessionRetry'
export function RequireAuth() {
  const { user, checking, error, sessionExpired } = useAuth()
  const location = useLocation()
  if (!user && error) return <main className="study-page"><SessionRetry /></main>
  if (!user && checking) return <main className="study-page" data-route-loading><LoadingState label="Đang tải nội dung…" /></main>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search, sessionExpired }} />
}
