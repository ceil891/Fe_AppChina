import { Outlet } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthContext'
import { Navbar } from '../../shared/components/Navbar'
import './learner.css'

export function LearnerLayout({ busy, logoutError, onLogout }: { busy: boolean; logoutError: string; onLogout: () => void }) {
  const { user } = useAuth()
  return <div className="learner-shell"><Navbar user={user} busy={busy} onLogout={onLogout} />
    {logoutError && <p className="learner-logout-error" role="alert">{logoutError}</p>}
    <Outlet />
    <footer className="learner-footer"><strong>ChinaNN</strong><span>Mỗi ngày một chút, tiếng Trung gần hơn.</span><span>为自己加油 · Cố lên nhé!</span></footer>
  </div>
}
