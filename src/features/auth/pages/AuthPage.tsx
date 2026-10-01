import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuth } from '../../../app/providers/AuthContext'
import { AuthLayout } from '../components/AuthLayout'
import { LoginForm } from '../components/LoginForm'
import { loginDestination } from '../../../app/router/roleNavigation'
import { useRequestCooldown } from '../../../shared/hooks/useRequestCooldown'

export function AuthPage({ register = false }: { register?: boolean }) {
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cooldown = useRequestCooldown()
  if (user) return <Navigate to={loginDestination(user, location.state?.from)} replace />
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || cooldown.remaining > 0) return
    const form = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      const credentials = { email: String(form.get('email')), password: String(form.get('password')) }
      if (register) {
        await authApi.register({ ...credentials, displayName: String(form.get('displayName')) })
        navigate('/login', { replace: true, state: { registered: true } })
      } else {
        const profile = await authApi.login(credentials)
        setUser(profile)
        navigate(loginDestination(profile, location.state?.from), { replace: true })
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thực hiện được yêu cầu.'); cooldown.apply(e) }
    finally { setBusy(false) }
  }
  return <AuthLayout><LoginForm register={register} busy={busy} error={error}
    registered={!!location.state?.registered} passwordChanged={!!location.state?.passwordChanged} retryIn={cooldown.remaining} onSubmit={submit} /></AuthLayout>
}
