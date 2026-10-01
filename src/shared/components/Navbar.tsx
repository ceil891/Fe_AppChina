import { useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { Profile } from '../../features/auth/types/auth.types'
import { Brand } from './Brand'
import { Icon } from './Icon'
import './navbar.css'
import { hasManagementAccess } from '../../app/router/permissions'

export function Navbar({ user, busy, onLogout }: { user: Profile | null; busy: boolean; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const [openedPath, setOpenedPath] = useState(location.pathname)
  const expanded = open && openedPath === location.pathname
  const close = () => setOpen(false)
  const practiceActive = /^\/(practice|skills|flashcards|quizzes|ai)(\/|$)/.test(location.pathname)
  const lessonsActive = /^\/(courses|lessons|foundations|vocabulary|learning)(\/|$)/.test(location.pathname)
  if (hasManagementAccess(user)) return null
  return <><header className="site-header learner-header">
    <a className="skip-link" href="#page-content">Bỏ qua điều hướng</a>
    <nav className="site-nav" aria-label="Điều hướng học tập" onKeyDown={e => {
      if (e.key !== 'Escape') return
      const group = (e.target as HTMLElement).closest('details')
      if (group?.open) { group.open = false; group.querySelector('summary')?.focus(); return }
      if (expanded) { close(); trigger.current?.focus() }
    }}>
      <Brand />
      <button ref={trigger} type="button" className="menu-toggle" aria-controls="nav-content" aria-expanded={expanded}
        aria-label={expanded ? 'Đóng menu' : 'Mở menu'} onClick={() => { setOpenedPath(location.pathname); setOpen(!expanded) }}>
        <Icon name={expanded ? 'close' : 'menu'} />
      </button>
      <div id="nav-content" className="nav-content" data-open={expanded}>
        <div className="nav-links">
            <NavLink to="/home" onClick={close}><Icon name="spark" />Trang chủ</NavLink>
            <details className="nav-group" key={'lessons-' + location.pathname + expanded}>
              <summary className={lessonsActive ? 'active' : ''}><Icon name="book" />Bài học <span aria-hidden="true">⌄</span></summary>
              <div className="nav-dropdown"><NavLink to="/courses" onClick={close}>Khóa học & lộ trình</NavLink><NavLink to="/foundations" onClick={close}>Nhập môn Pinyin</NavLink><NavLink to="/lessons" onClick={close}>Bài theo chủ đề</NavLink><NavLink to="/vocabulary" onClick={close}>Từ vựng</NavLink><NavLink to="/learning" onClick={close}>Bài của tôi</NavLink></div>
            </details>
            <details className="nav-group" key={'practice-' + location.pathname + expanded}>
              <summary className={practiceActive ? 'active' : ''}><Icon name="check" />Luyện tập <span aria-hidden="true">⌄</span></summary>
              <div className="nav-dropdown"><NavLink to="/practice" onClick={close}>Tất cả hoạt động</NavLink><NavLink to="/flashcards" onClick={close}>Flashcard</NavLink><NavLink to="/quizzes" onClick={close}>Quiz</NavLink><NavLink to="/skills" onClick={close}>4 kỹ năng</NavLink><NavLink to="/ai" onClick={close}>AI Tutor</NavLink></div>
            </details>
            <NavLink to="/progress" onClick={close}><Icon name="chart" />Tiến độ</NavLink>
        </div>
        <div className="nav-actions">
          {user ? <details className="nav-group nav-account" key={'account-' + location.pathname + expanded}><summary><Icon name="user" /><span className="nav-user" title={user.displayName}>{user.displayName}</span><span aria-hidden="true">⌄</span></summary><div className="nav-dropdown"><NavLink to="/profile" onClick={close}>Hồ sơ và bảo mật</NavLink><button className="nav-login" disabled={busy} onClick={onLogout}>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button></div></details> :
            <><NavLink className="nav-login" to="/login" onClick={close}>Đăng nhập</NavLink><NavLink className="nav-register" to="/register" onClick={close}>Đăng ký<Icon name="arrow" width="16" /></NavLink></>}
        </div>
      </div>
    </nav>
  </header><nav className="learner-mobile-nav" aria-label="Điều hướng nhanh"><NavLink to="/home"><Icon name="spark" />Trang chủ</NavLink><NavLink to="/lessons" className={lessonsActive ? 'active' : ''}><Icon name="book" />Bài học</NavLink><NavLink to="/practice" className={practiceActive ? 'active' : ''}><Icon name="check" />Luyện tập</NavLink><NavLink to="/progress"><Icon name="chart" />Tiến độ</NavLink></nav></>
}
