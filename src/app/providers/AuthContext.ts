import { createContext, useContext } from 'react'
import type { Profile } from '../../features/auth/types/auth.types'
export interface AuthState {
  user: Profile | null
  checking: boolean
  error: string
  refresh: () => Promise<void>
  setUser: (user: Profile | null) => void
  logout: () => Promise<void>
}
export const AuthContext = createContext<AuthState | null>(null)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider is required')
  return context
}
