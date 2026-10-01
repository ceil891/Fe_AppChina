import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { PermissionGate } from '../../../app/router/PermissionGate'
import { Link } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { Icon } from '../../../shared/components/Icon'
import type { Word, LessonSummary } from '../../lesson/types/lesson.types'
import type { UserPage } from '../types/adminUser.types'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const words = useResource<Word[]>(can(user, 'vocabulary.read') ? '/admin/vocabulary' : null)
  const lessons = useResource<LessonSummary[]>(can(user, 'lessons.read') ? '/admin/lessons' : null)
  const users = useResource<UserPage>(can(user, 'users.read') ? '/admin/users?size=1' : null)
  const loading = words.loading || lessons.loading || users.loading
  const error = words.error || lessons.error || users.error
  const emptyLessons = lessons.data?.filter(lesson => lesson.wordCount === 0).length ?? 0
  const ordered = [...(lessons.data ?? [])].sort((a, b) => a.position - b.position)
  function reload() { words.reload(); lessons.reload(); users.reload() }
  return <main className="admin-page admin-dashboard">
    <div className="admin-heading"><div><p className="admin-eyebrow">CHINANN / QUẢN TRỊ</p><h1>Tổng quan quản lý</h1><p className="admin-muted">Một nơi để chăm chút kho từ vựng và các bài học.</p></div><button onClick={reload} disabled={loading}><Icon name="clock" />{loading ? 'Đang cập nhật…' : 'Cập nhật số liệu'}</button></div>
    {loading ? <p className="admin-dashboard-state" role="status">Đang tải tổng quan…</p> : error ? <div className="admin-error" role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button></div> : <>
      <section className="admin-stat-grid" aria-label="Thống kê quản lý">
        {words.data && <Link to="/admin/vocabulary" className="admin-stat"><span className="admin-stat-icon"><Icon name="cards" /></span><span>Tổng số từ vựng</span><strong>{words.data.length.toLocaleString('vi-VN')}</strong><small>Mở kho từ vựng <Icon name="arrow" /></small></Link>}
        {lessons.data && <Link to="/admin/lessons" className="admin-stat"><span className="admin-stat-icon"><Icon name="book" /></span><span>Tổng số bài học</span><strong>{lessons.data.length.toLocaleString('vi-VN')}</strong><small>Quản lý lộ trình <Icon name="arrow" /></small></Link>}
        {lessons.data && <Link to="/admin/lessons?empty=1" className="admin-stat"><span className="admin-stat-icon"><Icon name="info" /></span><span>Bài chưa có từ</span><strong>{emptyLessons.toLocaleString('vi-VN')}</strong><small>{emptyLessons ? 'Bổ sung nội dung' : 'Các bài đều đã có từ'} <Icon name="arrow" /></small></Link>}
        {users.data && <Link to="/admin/users" className="admin-stat"><span className="admin-stat-icon"><Icon name="user" /></span><span>Tổng số tài khoản</span><strong>{users.data.total.toLocaleString('vi-VN')}</strong><small>Quản lý người dùng <Icon name="arrow" /></small></Link>}
        {lessons.data && <Link to="/admin/lessons?publication=hidden" className="admin-stat"><span className="admin-stat-icon"><Icon name="book" /></span><span>Bài đang ẩn</span><strong>{lessons.data.filter(lesson => lesson.published === false).length.toLocaleString('vi-VN')}</strong><small>Rà soát trước khi hiển thị <Icon name="arrow" /></small></Link>}
      </section>
      <section className="admin-quick-actions" aria-label="Thêm nội dung"><div><p className="admin-eyebrow">TIẾP TỤC BIÊN SOẠN</p><h2>Thêm kiến thức, mở rộng hành trình.</h2><p>Kiểm tra nội dung và trạng thái hiển thị trước khi đưa bài tới người học.</p></div><div className="admin-quick-buttons"><PermissionGate permission="vocabulary.create"><Link className="admin-link-primary" to="/admin/vocabulary/new">+ Thêm từ vựng</Link></PermissionGate><PermissionGate permission="lessons.create"><Link className="admin-link-secondary" to="/admin/lessons/new">+ Tạo bài học</Link></PermissionGate><PermissionGate permission="roles.read"><Link className="admin-link-secondary" to="/admin/roles">Vai trò & quyền</Link></PermissionGate></div></section>
      {lessons.data && <section className="admin-overview-panel"><header><div><h2>Nội dung bài học</h2><p>Các bài đầu tiên trong lộ trình hiện tại.</p></div><Link to="/admin/lessons">Xem tất cả <Icon name="arrow" /></Link></header>
        {ordered.length === 0 ? <p className="admin-empty">Chưa có bài học. Tạo bài đầu tiên để bắt đầu biên soạn.</p> : <div className="admin-overview-list">{ordered.slice(0, 6).map(lesson => <Link to={'/admin/lessons/' + lesson.id} key={lesson.id}><span className="admin-lesson-position">{String(lesson.position).padStart(2, '0')}</span><div><strong>{lesson.title}</strong><small>{lesson.description}</small></div><span className={'admin-content-status' + (lesson.wordCount === 0 ? ' empty' : '')}>{lesson.wordCount} từ</span><Icon name="arrow" /></Link>)}</div>}
      </section>}
    </>}
  </main>
}
