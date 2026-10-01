import { AccountSecurityPanel } from '../../auth/pages/AccountEmailPage'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { authApi } from '../../auth/api/authApi'
import { Link } from 'react-router-dom'
import '../../../shared/styles/study.css'
import { ChangePasswordForm } from '../../auth/components/ChangePasswordForm'

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = String(new FormData(event.currentTarget).get('displayName'))
    setBusy(true); setMessage(''); setError('')
    try { setUser(await authApi.updateProfile(name)); setMessage('Đã lưu hồ sơ.') }
    catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được hồ sơ.') }
    finally { setBusy(false) }
  }
  return <main className="study-page"><header className="study-heading"><h1>Hồ sơ cá nhân</h1><p>Email: {user?.email}</p><p>Múi giờ học: {user?.timeZone} (giờ Việt Nam, UTC+7)</p><small>Múi giờ học được cố định để tính chuỗi ngày nhất quán.</small></header><p><Link className="study-back" to="/progress">Xem tiến độ và chuỗi ngày học →</Link></p><p><Link to="/skills">Luyện và theo dõi bốn kỹ năng →</Link></p><form onSubmit={save}>
    <label>Tên hiển thị<input name="displayName" defaultValue={user?.displayName} required maxLength={80} autoComplete="nickname" /></label>
    <button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu hồ sơ'}</button>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </form><AccountSecurityPanel /><ChangePasswordForm /></main>
}
