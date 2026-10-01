import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { homePath } from './roleNavigation'
import { hasManagementAccess } from './permissions'

export function RequireLearner() {
  const { user } = useAuth()
  return hasManagementAccess(user) ? <Navigate to={homePath(user)} replace /> : <Outlet />
}
