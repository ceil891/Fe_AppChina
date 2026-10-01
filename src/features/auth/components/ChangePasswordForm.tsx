import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { useRequestCooldown } from '../../../shared/hooks/useRequestCooldown'
import { ApiError } from '../../../services/api'
import { authApi } from '../api/authApi'
import { PasswordInput } from './PasswordInput'
import '../auth.css'
import '../password-settings.css'

export function ChangePasswordForm() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const cooldown = useRequestCooldown()
  const disabled = busy || cooldown.remaining > 0 || Object.values(values).some(value => !value.trim())
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return
    const errors: Record<string, string> = {}
    if (values.newPassword.length < 12 || values.newPassword.length > 128) errors.newPassword = 'Mật khẩu mới cần 12–128 ký tự.'
    else if (values.newPassword === values.currentPassword) errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.'
    if (values.confirmPassword !== values.newPassword) errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.'
    setFields(errors); setError('')
    const first = Object.keys(errors)[0]
    if (first) { (event.currentTarget.elements.namedItem(first) as HTMLInputElement)?.focus(); return }
    setBusy(true)
    try {
      await authApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setUser(null)
      navigate('/login', { replace: true, state: { passwordChanged: true } })
    } catch (failure) {
      cooldown.apply(failure)
      if (failure instanceof ApiError) setFields(failure.fields)
      setError(failure instanceof Error ? failure.message : 'Chưa xác nhận được kết quả. Nếu phiên đã hết, hãy đăng nhập bằng mật khẩu mới; nếu chưa đổi được, dùng mật khẩu cũ.')
    } finally { setBusy(false) }
  }
  const inputs = [
    { name: 'currentPassword', label: 'Mật khẩu hiện tại', complete: 'current-password' },
    { name: 'newPassword', label: 'Mật khẩu mới', complete: 'new-password' },
    { name: 'confirmPassword', label: 'Nhập lại mật khẩu mới', complete: 'new-password' },
  ] as const
  return <section className="password-settings" aria-labelledby="password-settings-title">
    <h2 id="password-settings-title">Đổi mật khẩu</h2>
    <p>Sau khi đổi, bạn sẽ cần đăng nhập lại trên tất cả thiết bị. Dữ liệu học tập được giữ nguyên.</p>
    <form className="auth-form" noValidate onSubmit={submit} aria-busy={busy}>
      <input type="text" name="username" autoComplete="username" value={user?.email ?? ''} readOnly hidden />
      {inputs.map(input => <div className="auth-field" key={input.name}>
        <label htmlFor={`change-${input.name}`}>{input.label}</label>
        <PasswordInput id={`change-${input.name}`} name={input.name} placeholder={input.label} required maxLength={128}
          autoComplete={input.complete} value={values[input.name]} readOnly={busy} aria-invalid={!!fields[input.name]}
          aria-describedby={fields[input.name] ? `change-${input.name}-error` : input.name === 'newPassword' ? 'new-password-hint' : undefined}
          onChange={event => { setValues(previous => ({ ...previous, [input.name]: event.target.value })); setFields(previous => ({ ...previous, [input.name]: '' })) }} />
        {fields[input.name] && <p className="field-error" id={`change-${input.name}-error`}>{fields[input.name]}</p>}
      </div>)}
      <p className="field-hint" id="new-password-hint">Dùng 12–128 ký tự và khác mật khẩu hiện tại.</p>
      {error && <div className="auth-alert" role="alert">{error}</div>}
      {cooldown.remaining > 0 && <p className="field-hint">Có thể thử lại sau {cooldown.remaining} giây.</p>}
      <button className="auth-submit" disabled={disabled}>{busy ? 'Đang đổi mật khẩu…' : 'Đổi mật khẩu và đăng nhập lại'}</button>
    </form>
  </section>
}
