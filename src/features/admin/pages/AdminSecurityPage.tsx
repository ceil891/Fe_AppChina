import { AccountSecurityPanel } from '../../auth/pages/AccountEmailPage'
import { ChangePasswordForm } from '../../auth/components/ChangePasswordForm'

export function AdminSecurityPage() {
  return <main className="admin-page"><header className="admin-heading"><div><h1>Bảo mật tài khoản</h1><p>Quản lý mật khẩu của tài khoản đang đăng nhập.</p></div></header><AccountSecurityPanel /><ChangePasswordForm /></main>
}
