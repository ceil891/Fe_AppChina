import { useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { Brand } from '../../../shared/components/Brand'
import { Icon } from '../../../shared/components/Icon'
import '../../../shared/components/navbar.css'
import '../admin.css'
import '../admin-layout.css'
import { hasManagementAccess } from '../../../app/router/permissions'
import { PermissionGate } from '../../../app/router/PermissionGate'
import { skillNames } from '../../skills/types'
import type { Skill } from '../../skills/types'

export function AdminLayout({ busy, logoutError, onLogout }: { busy: boolean; logoutError: string; onLogout: () => void }) {
  const { user } = useAuth()
  const location = useLocation()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const open = openPath === location.pathname
  const section = location.pathname === '/admin/general-settings' ? 'Cài đặt chung' : location.pathname.startsWith('/admin/courses') ? 'Khóa học' : location.pathname === '/admin/ai-settings' ? 'Cấu hình AI' : location.pathname.startsWith('/admin/skills/') ? 'Kỹ năng ' + (skillNames[location.pathname.split('/')[3] as Skill] ?? '') : location.pathname === '/admin/learner-progress' ? 'Tiến độ học viên' : location.pathname === '/admin/security' ? 'Bảo mật tài khoản' : location.pathname.startsWith('/admin/vocabulary') ? 'Từ vựng' : location.pathname.startsWith('/admin/lessons') ? 'Bài học' : location.pathname.startsWith('/admin/foundations') ? 'Nhập môn Pinyin' : location.pathname.startsWith('/admin/quizzes') ? 'Quiz' : location.pathname.startsWith('/admin/users') ? 'Tài khoản' : location.pathname.startsWith('/admin/roles') ? 'Vai trò & quyền' : 'Tổng quan'
  if (!user || !hasManagementAccess(user)) return null
  return <div className="admin-shell">
    <a className="skip-link" href="#admin-content">Bỏ qua điều hướng</a>
    <aside className="admin-sidebar" aria-label="Khu quản trị" onKeyDown={event => {
      if (event.key === 'Escape' && open) { setOpenPath(null); trigger.current?.focus() }
    }}>
      <div className="admin-brand-row"><Brand admin /><button ref={trigger} className="admin-menu-toggle" aria-label={open ? 'Đóng menu quản lý' : 'Mở menu quản lý'} aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpenPath(open ? null : location.pathname)}><Icon name={open ? 'close' : 'menu'} /></button></div>
      <div className="admin-sidebar-content" id="admin-navigation" data-open={open}>
        <p className="admin-nav-label">KHÔNG GIAN QUẢN LÝ</p>
        <nav className="admin-sidebar-nav" aria-label="Điều hướng quản lý">
          <NavLink end to="/admin" onClick={() => setOpenPath(null)}><Icon name="chart" />Tổng quan</NavLink>
          <PermissionGate permission="courses.read"><NavLink to="/admin/courses" onClick={() => setOpenPath(null)}><Icon name="book" />Quản lý khóa học</NavLink></PermissionGate>
          <PermissionGate permission="settings.read"><NavLink to="/admin/general-settings" onClick={() => setOpenPath(null)}><Icon name="shield" />Cài đặt chung</NavLink></PermissionGate>
          <PermissionGate permission="ai.read"><NavLink to="/admin/ai-settings" onClick={() => setOpenPath(null)}><Icon name="shield" />Cấu hình AI</NavLink></PermissionGate>
          <PermissionGate permission="vocabulary.read"><NavLink to="/admin/vocabulary" onClick={() => setOpenPath(null)}><Icon name="cards" />Quản lý từ vựng</NavLink></PermissionGate>
          <PermissionGate permission="lessons.read"><NavLink to="/admin/lessons" onClick={() => setOpenPath(null)}><Icon name="book" />Quản lý bài học</NavLink></PermissionGate>
          <PermissionGate permission="foundations.read"><NavLink to="/admin/foundations" onClick={() => setOpenPath(null)}><Icon name="book" />Nhập môn Pinyin</NavLink></PermissionGate>
          <PermissionGate permission="quizzes.read"><NavLink to="/admin/quizzes" onClick={() => setOpenPath(null)}><Icon name="cards" />Quản lý Quiz</NavLink></PermissionGate>
          <PermissionGate permission="skills.read">{(Object.keys(skillNames) as Skill[]).map(skill => <NavLink key={skill} to={`/admin/skills/${skill}`} onClick={() => setOpenPath(null)}><Icon name="book" />Quản lý {skillNames[skill]}</NavLink>)}</PermissionGate>
          <PermissionGate permission="users.read"><PermissionGate permission="users.progress.read"><NavLink to="/admin/learner-progress">Tiến độ học viên</NavLink></PermissionGate></PermissionGate>
          <PermissionGate permission="users.read"><NavLink to="/admin/users" onClick={() => setOpenPath(null)}><Icon name="user" />Quản lý tài khoản</NavLink></PermissionGate>
          <PermissionGate permission="roles.read"><NavLink to="/admin/roles" onClick={() => setOpenPath(null)}><Icon name="shield" />Vai trò & quyền</NavLink></PermissionGate>
          <NavLink to="/admin/security" onClick={() => setOpenPath(null)}><Icon name="lock" />Bảo mật tài khoản</NavLink>
        </nav>
        <div className="admin-sidebar-note"><Icon name="shield" /><strong>Dành cho quản trị viên</strong><p>Biên tập nội dung và quản lý tài khoản trong ứng dụng.</p></div>
      </div>
    </aside>
    <div className="admin-body">
      <header className="admin-topbar"><div className="admin-breadcrumb">Quản trị <span>/</span> <strong>{section}</strong></div><div className="admin-account"><span className="admin-avatar" aria-hidden="true">{user.displayName.trim().charAt(0).toUpperCase() || 'A'}</span><div><strong>{user.displayName}</strong><small>{user.roleName}</small></div><button className="admin-logout" disabled={busy} onClick={onLogout}>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button></div></header>
      {logoutError && <p className="admin-shell-error" role="alert">{logoutError}</p>}
      <div id="admin-content" tabIndex={-1}><Outlet /></div>
    </div>
  </div>
}
