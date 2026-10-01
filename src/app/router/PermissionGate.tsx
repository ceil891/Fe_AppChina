import type { ReactNode } from 'react'
import { useAuth } from '../providers/AuthContext'
import { can } from './permissions'

export function PermissionGate({ permission, children }: { permission: string | string[]; children: ReactNode }) {
  const { user } = useAuth()
  return can(user, permission) ? children : null
}
