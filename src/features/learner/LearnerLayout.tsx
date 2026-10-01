import { Link, Outlet, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { useAuth } from '../../app/providers/AuthContext'
import { Navbar } from '../../shared/components/Navbar'
import './learner.css'
import '../../shared/styles/learner-ui.css'
import { LoadingState } from '../../shared/components/LoadingState'

export function LearnerLayout({ busy, logoutError, onLogout }: { busy: boolean; logoutError: string; onLogout: () => void }) {
  const { user, sessionExpired } = useAuth()
  const location = useLocation()
  return <div className="learner-shell"><Navbar user={user} busy={busy} onLogout={onLogout} />
    {sessionExpired && <aside className="session-expired-notice" role="status"><span className="session-expired-icon" aria-hidden="true">◷</span><div><strong>Phiên đăng nhập đã hết hạn</strong><p>Trang đang xem vẫn mở. Đăng nhập lại để tiếp tục lưu tiến độ học.</p></div><Link to="/login" state={{ from: location.pathname + location.search, sessionExpired: true }}>Đăng nhập lại →</Link></aside>}
    {logoutError && <p className="learner-logout-error" role="alert">{logoutError}</p>}
    <Suspense fallback={<main className="study-page" data-route-loading><LoadingState label="Đang mở trang…" /></main>}><Outlet /></Suspense>
    <footer className="learner-footer"><strong>ChinaNN</strong><span>Mỗi ngày một chút, tiếng Trung gần hơn.</span><span>为自己加油 · Cố lên nhé!</span></footer>
  </div>
}
