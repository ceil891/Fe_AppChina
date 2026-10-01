import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname === '/skills' && /^\?skill=(LISTENING|SPEAKING|READING|WRITING)$/.test(location.search) ? location.pathname + location.search : location.pathname }} />
}
