import { AccountSecurityPanel } from '../../auth/pages/AccountEmailPage'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../../app/providers/AuthContext'
import { authApi } from '../../auth/api/authApi'
import { Link } from 'react-router-dom'
import '../../../shared/styles/study.css'
import { ChangePasswordForm } from '../../auth/components/ChangePasswordForm'
import '../profile.css'

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
  return <main className="study-page profile-page"><header className="profile-header"><div className="profile-avatar" aria-hidden="true">{user?.displayName.trim().slice(0,1).toLocaleUpperCase('vi')}</div><div><p className="study-eyebrow">TÀI KHOẢN CỦA BẠN</p><h1>{user?.displayName}</h1><p>{user?.email}</p></div><span className="profile-role">Học viên ChinaNN</span></header><div className="profile-grid"><aside className="profile-sidebar"><h2>Góc học tập</h2><Link to="/progress"><strong>Tiến độ học tập ↗</strong><span>Theo dõi kết quả và chuỗi ngày học</span></Link><Link to="/skills"><strong>Luyện bốn kỹ năng ↗</strong><span>Nghe, nói, đọc và viết mỗi ngày</span></Link><div className="profile-timezone"><strong>Giờ Việt Nam · UTC+7</strong><p>Chuỗi ngày học được tính theo múi giờ cố định của bạn.</p></div></aside><div className="profile-content"><section className="profile-details"><h2>Thông tin cá nhân</h2><p>Tên của bạn sẽ xuất hiện trong không gian học tập.</p><form onSubmit={save} aria-busy={busy}>
    <label>Tên hiển thị<input name="displayName" defaultValue={user?.displayName} required maxLength={80} autoComplete="nickname" /></label>
    <button className="study-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </form></section><AccountSecurityPanel /><ChangePasswordForm /></div></div></main>
}
