import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../../shared/components/Icon'
import { PasswordInput } from './PasswordInput'
export function LoginForm({ register, busy, error, registered, passwordChanged = false, retryIn = 0, onSubmit }: {
  register: boolean; busy: boolean; error: string; registered: boolean; passwordChanged?: boolean; retryIn?: number; onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const emailError = (input: HTMLInputElement) => !input.value.trim() ? 'Vui lòng nhập địa chỉ email.' : input.validity.typeMismatch ? 'Địa chỉ email chưa hợp lệ. Ví dụ: ban@example.com.' : ''
  const passwordError = () => !password.trim() ? 'Vui lòng nhập mật khẩu.' : register && password.length < 8 ? 'Mật khẩu cần ít nhất 8 ký tự.' : ''
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const emailInput = e.currentTarget.elements.namedItem('email') as HTMLInputElement
    const next = { email: emailError(emailInput), password: passwordError(), displayName: register && !displayName.trim() ? 'Vui lòng nhập tên hiển thị.' : '' }
    setErrors(next)
    const first = Object.entries(next).find(([, message]) => message)
    if (first) { (e.currentTarget.elements.namedItem(first[0]) as HTMLInputElement)?.focus(); return }
    if (!busy && retryIn === 0) await onSubmit(e)
  }
  const empty = !email.trim() || !password.trim() || (register && !displayName.trim())
  return <div className="auth-card">
    <div className="card-welcome-icon"><Icon name={register ? 'spark' : 'book'} width="23" height="23" /></div>
    <h2>{register ? 'Tạo tài khoản học viên' : 'Chào mừng trở lại'}</h2>
    <p className="card-description">{register ? 'Tạo tài khoản để cùng học tiếng Trung mỗi ngày' : 'Đăng nhập để tiếp tục hành trình học tập'}</p>
    {registered && !register && <div className="auth-alert success" role="status"><Icon name="check" /><span>Đã tạo tài khoản. Bạn có thể đăng nhập.</span></div>}
    {passwordChanged && !register && <div className="auth-alert success" role="status"><Icon name="check" /><span>Đã đổi mật khẩu và đăng xuất các phiên cũ. Hãy đăng nhập bằng mật khẩu mới.</span></div>}
    <form className="auth-form" onSubmit={submit} noValidate aria-busy={busy}>
      {register && <div className="auth-field"><label htmlFor="displayName">Tên hiển thị</label><div className="auth-input-wrap"><Icon name="user" className="input-icon" /><input id="displayName" name="displayName" placeholder="Bạn muốn được gọi là gì?" required maxLength={80} autoComplete="nickname" value={displayName} readOnly={busy}
        aria-invalid={!!errors.displayName} aria-describedby={errors.displayName ? 'name-error' : undefined}
        onChange={e => { setDisplayName(e.target.value); setErrors(v => ({ ...v, displayName: '' })) }} onBlur={() => setErrors(v => ({ ...v, displayName: displayName.trim() ? '' : 'Vui lòng nhập tên hiển thị.' }))} /></div>
        {errors.displayName && <p className="field-error" id="name-error">{errors.displayName}</p>}</div>}
      <div className="auth-field"><label htmlFor="email">Địa chỉ email</label><div className="auth-input-wrap"><Icon name="mail" className="input-icon" /><input id="email" name="email" type="email" placeholder="Nhập địa chỉ email của bạn" required maxLength={254} autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} readOnly={busy}
        aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
        onChange={e => { setEmail(e.target.value); if (errors.email) { const message = emailError(e.target); setErrors(v => ({ ...v, email: message })) } }}
        onBlur={e => { const message = emailError(e.target); setErrors(v => ({ ...v, email: message })) }} /></div>
        {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}</div>
      <div className="auth-field"><label htmlFor="password">Mật khẩu</label><PasswordInput id="password" name="password" placeholder={register ? 'Tạo mật khẩu của bạn' : 'Nhập mật khẩu của bạn'} required maxLength={128} minLength={register ? 8 : undefined}
        autoComplete={register ? 'new-password' : 'current-password'} value={password} readOnly={busy} aria-invalid={!!errors.password}
        aria-describedby={errors.password ? 'password-error' : register ? 'password-hint' : undefined}
        onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: '' })) }} onBlur={() => setErrors(v => ({ ...v, password: passwordError() }))} />
        {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
        {register && !errors.password && <p className="field-hint" id="password-hint">Tối thiểu 8 ký tự, tối đa 128 ký tự.</p>}</div>
      {!register && <div className="auth-options">
        <Link className="text-button" to="/account/forgot">Quên mật khẩu?</Link></div>}
      {error && <div className="auth-alert" role="alert"><Icon name="info" /><span>{error}</span></div>}
      {retryIn > 0 && <p className="field-hint">Có thể thử lại sau {retryIn} giây.</p>}
      <button className="auth-submit" type="submit" disabled={busy || empty || retryIn > 0}>{busy ? <><span className="loading-spinner" />{register ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...'}</> : <>{register ? 'Tạo tài khoản' : 'Đăng nhập'}<Icon name="arrow" width="19" /></>}</button>
      <span className="sr-only" role="status">{busy ? register ? 'Đang tạo tài khoản' : 'Đang đăng nhập' : ''}</span>
    </form>
    <div className="signup-prompt">{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link to={register ? '/login' : '/register'}>{register ? 'Đăng nhập ngay' : 'Đăng ký ngay'}<Icon name="arrow" width="14" /></Link></div>
  </div>
}
