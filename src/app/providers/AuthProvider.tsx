import { clearNoteDrafts } from '../../features/progress/noteDrafts'
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { authApi } from '../../features/auth/api/authApi'
import type { Profile } from '../../features/auth/types/auth.types'
import { ApiError } from '../../services/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    try { setUser(await authApi.me()); setError('') }
    catch (e) {
      if (e instanceof ApiError && e.status === 401) { setUser(null); setError('') }
      else setError('Chưa kiểm tra được phiên đăng nhập. Hãy thử lại.')
    } finally { setChecking(false) }
  }, [])
  useEffect(() => {
    // Read the server session after every page load; never trust localStorage for identity.
    let active = true
    authApi.me().then(profile => { if (active) setUser(profile) })
      .catch(e => {
        if (active && !(e instanceof ApiError && e.status === 401)) {
          setError('Chưa kiểm tra được phiên đăng nhập. Hãy thử lại.')
        }
      }).finally(() => { if (active) setChecking(false) })
    const expired = () => setUser(null)
    window.addEventListener('auth-expired', expired)
    return () => { active = false; window.removeEventListener('auth-expired', expired) }
  }, [])
  const logout = async () => {
    await authApi.logout()
    clearNoteDrafts()
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, checking, error, refresh, setUser, logout }}>{children}</AuthContext.Provider>
}
