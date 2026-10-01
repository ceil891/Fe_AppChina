import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { homePath } from './roleNavigation'
import { hasManagementAccess, canOpenAdminPath } from './permissions'
export function RequireAdmin() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!hasManagementAccess(user)) return <Navigate to={homePath(user)} replace />
  if (!canOpenAdminPath(user, location.pathname)) return <Navigate to="/admin" replace />
  return <Outlet />
}
