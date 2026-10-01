import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { homePath } from './roleNavigation'
import { hasManagementAccess, canOpenAdminPath } from './permissions'
import { LoadingState } from '../../shared/components/LoadingState'
import { SessionRetry } from '../../shared/components/SessionRetry'
export function RequireAdmin() {
  const { user, checking, error } = useAuth()
  const location = useLocation()
  if (!user && error) return <main><SessionRetry /></main>
  if (!user && checking) return <main data-route-loading><LoadingState label="Đang tải nội dung…" /></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!hasManagementAccess(user)) return <Navigate to={homePath(user)} replace />
  if (!canOpenAdminPath(user, location.pathname)) return <Navigate to="/admin" replace />
  return <Outlet />
}
