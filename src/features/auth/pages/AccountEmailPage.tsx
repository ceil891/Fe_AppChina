import '../account-security.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { mutate } from '../../../services/api'
import { useResource } from '../../../shared/hooks/useResource'
import { useRequestCooldown } from '../../../shared/hooks/useRequestCooldown'
import { useAuth } from '../../../app/providers/AuthContext'
import { hasManagementAccess } from '../../../app/router/permissions'

type EmailMode = 'forgot' | 'reset' | 'verify'

export function AccountEmailPage({ mode }: { mode: EmailMode }) {
  const location = useLocation()
  const token = new URLSearchParams(location.hash.slice(1)).get('token') ?? ''
  // A different email link must never reuse the previous link's form or result.
  return <AccountEmailForm key={`${mode}:${token}`} mode={mode} token={token} />
}

function AccountEmailForm({ mode, token }: { mode: EmailMode; token: string }) {
  const { user, refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const cooldown = useRequestCooldown()
  const finished = mode !== 'forgot' && !!message
  const disabled = busy || cooldown.remaining > 0 || (mode !== 'forgot' && (!token || finished))
  const securityPath = hasManagementAccess(user) ? '/admin/security' : '/profile'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return
    setError('')
    setMessage('')
    if (mode === 'reset' && password !== confirm) {
      setError('Hai mật khẩu chưa khớp.')
      event.currentTarget.querySelector<HTMLInputElement>('[name="confirmPassword"]')?.focus()
      return
    }
    setBusy(true)
    try {
      await mutate('POST', `/account/${mode}`, mode === 'forgot' ? { email: email.trim() } : mode === 'reset' ? { token, password } : { token })
      setMessage(mode === 'forgot'
        ? 'Nếu tài khoản có thể khôi phục, hướng dẫn sẽ được gửi qua email.'
        : mode === 'reset'
          ? 'Đã đổi mật khẩu và thu hồi các phiên cũ. Hãy đăng nhập lại.'
          : 'Email đã được xác minh.')
      setPassword('')
      setConfirm('')
      if (mode === 'reset') await refresh()
    } catch (failure) {
      cooldown.apply(failure)
      setError(failure instanceof Error ? failure.message : 'Không thực hiện được. Vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="study-page account-page">
    <Link to="/login">← Đăng nhập</Link>
    <h1>{mode === 'forgot' ? 'Quên mật khẩu' : mode === 'reset' ? 'Đặt lại mật khẩu' : 'Xác minh email'}</h1>
    {mode === 'forgot' && <p>Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu. Kiểm tra cả thư mục thư rác.</p>}
    <form onSubmit={submit} aria-busy={busy}>
      {mode === 'forgot' ? <label>Email tài khoản<input name="email" type="email" autoComplete="email" required maxLength={254} readOnly={busy} value={email} onChange={event => { setEmail(event.target.value); setMessage(''); setError('') }} /></label>
        : !token ? <p role="alert">Liên kết thiếu mã xác nhận. Hãy yêu cầu email mới.</p>
          : finished ? null
            : mode === 'reset' ? <>
              <p id="reset-password-hint">Dùng 8–128 ký tự. Đổi mật khẩu sẽ đăng xuất tất cả phiên và giữ nguyên dữ liệu học.</p>
              <label>Mật khẩu mới<input name="newPassword" type="password" autoComplete="new-password" aria-describedby="reset-password-hint" required minLength={8} maxLength={128} readOnly={busy} value={password} onChange={event => setPassword(event.target.value)} /></label>
              <label>Nhập lại mật khẩu mới<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} readOnly={busy} value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
            </> : <p>Bấm xác nhận để xác minh địa chỉ email của bạn.</p>}
      {!finished && <button disabled={disabled}>{busy ? 'Đang xử lý…' : mode === 'forgot' ? 'Gửi hướng dẫn' : 'Xác nhận'}</button>}
      {cooldown.remaining > 0 && <p role="status">Có thể thử lại sau {cooldown.remaining} giây.</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      {finished && <Link to={mode === 'verify' && user ? securityPath : '/login'}>{mode === 'verify' && user ? 'Về bảo mật tài khoản' : 'Đăng nhập lại'}</Link>}
      {mode === 'reset' && !finished && <Link to="/account/forgot">Yêu cầu liên kết đặt lại mật khẩu mới</Link>}
      {mode === 'verify' && !finished && <Link to={user ? securityPath : '/login'}>{user ? 'Về tài khoản để gửi lại email xác minh' : 'Đăng nhập để yêu cầu email xác minh mới'}</Link>}
    </form>
  </main>
}

interface Session { id: string; device: string; createdAt: string; lastSeenAt: string; current: boolean }

export function AccountSecurityPanel() {
  const { refresh } = useAuth()
  const status = useResource<{ verified: boolean }>('/account/status')
  const sessions = useResource<Session[]>('/account/sessions')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const cooldown = useRequestCooldown()

  async function action(path: string, method: 'POST' | 'DELETE', current = false) {
    if (busy || (method === 'POST' && cooldown.remaining > 0)) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await mutate(method, path)
      setMessage(method === 'POST' ? 'Đã yêu cầu email xác minh. Kiểm tra hộp thư và thư mục thư rác.' : 'Đã thu hồi phiên.')
      if (current) await refresh()
      else { status.reload(); sessions.reload() }
    } catch (failure) {
      cooldown.apply(failure)
      setError(failure instanceof Error ? failure.message : 'Không thực hiện được.')
    } finally { setBusy(false) }
  }

  return <section className="account-security" aria-busy={busy}>
    <h2>Email và phiên đăng nhập</h2>
    {status.loading && <p role="status">Đang kiểm tra email…</p>}
    {status.data && <p>{status.data.verified ? 'Email đã xác minh' : 'Email chưa xác minh'}</p>}
    {status.data && !status.data.verified && <button disabled={busy || cooldown.remaining > 0} onClick={() => void action('/account/verification-email', 'POST')}>Gửi email xác minh</button>}
    {cooldown.remaining > 0 && <p role="status">Có thể gửi lại email sau {cooldown.remaining} giây.</p>}
    <button disabled={busy} onClick={() => { status.reload(); sessions.reload() }}>Cập nhật</button>
    <h3>Phiên hoạt động gần đây</h3>
    <p>Thu hồi phiên sẽ chặn yêu cầu tiếp theo từ trình duyệt đó. Tên thiết bị do trình duyệt cung cấp.</p>
    {sessions.loading && <p role="status">Đang tải phiên…</p>}
    {sessions.data?.length === 0 && <p>Không có phiên hoạt động gần đây.</p>}
    <ul>{sessions.data?.map(session => <li key={session.id}>
      <p>{session.current ? 'Phiên hiện tại · ' : ''}{session.device}</p>
      <p>Đăng nhập: {new Date(session.createdAt).toLocaleString('vi-VN')}</p>
      <p>Hoạt động: {new Date(session.lastSeenAt).toLocaleString('vi-VN')}</p>
      <button disabled={busy} onClick={() => {
        if (window.confirm(session.current ? 'Đăng xuất phiên hiện tại?' : 'Thu hồi phiên đăng nhập này?')) void action(`/account/sessions/${session.id}`, 'DELETE', session.current)
      }}>{session.current ? 'Đăng xuất phiên này' : 'Thu hồi phiên'}</button>
    </li>)}</ul>
    {(error || status.error || sessions.error) && <p role="alert">{error || status.error || sessions.error}</p>}
    {message && <p role="status">{message}</p>}
  </section>
}
