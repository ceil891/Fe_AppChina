import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { useResource } from '../../shared/hooks/useResource'
import { Icon } from '../../shared/components/Icon'
import { LoadingState } from '../../shared/components/LoadingState'
import { foundationAccess } from '../../features/foundations/access'
import { foundationPath } from '../../features/foundations/types'
import type { FoundationCard } from '../../features/foundations/types'
import '../../shared/styles/study.css'

export function RequireFoundation() {
  const { user } = useAuth()
  const lessons = useResource<FoundationCard[]>('/foundations')
  if (lessons.loading) return <main className="study-page"><LoadingState label="Đang kiểm tra lộ trình Pinyin…" /></main>
  if (lessons.error) return <main className="study-page"><div className="study-error" role="alert"><h1>Chưa tải được tiến độ Pinyin</h1><p>{lessons.error}</p><button onClick={lessons.reload}>Thử lại</button></div></main>
  if (user && foundationAccess(lessons.data).unlocked) return <Outlet />
  return <FoundationGate lessons={lessons.data ?? []} signedIn={!!user} />
}

export function FoundationGate({ lessons, signedIn }: { lessons: FoundationCard[]; signedIn: boolean }) {
  const access = foundationAccess(lessons)
  return <main className="study-page foundation-gate"><section className="foundation-gate-card"><span className="foundation-gate-icon"><Icon name="lock" width="28" height="28" /></span><p className="study-eyebrow">VỮNG NỀN TẢNG TRƯỚC KHI ĐI TIẾP</p><h1>Hoàn thành Pinyin<br />để mở phần học này.</h1><p>Học lần lượt vận mẫu, thanh mẫu, thanh điệu và ghép âm. Hoàn thành toàn bộ bài nhập môn để mở khóa học chủ đề, từ vựng và các hoạt động luyện tập.</p>
    {access.total > 0 ? <><div className="foundation-gate-progress"><strong>{access.completed}/{access.total} bài đã hoàn thành</strong><progress aria-label="Tiến độ mở khóa" max={access.total} value={access.completed} /></div><ol>{lessons.map((lesson, index) => <li key={lesson.slug} data-completed={lesson.completed}><span>{lesson.completed ? <Icon name="check" width="16" height="16" /> : String(index + 1).padStart(2, '0')}</span><strong>{lesson.title}</strong>{lesson.locked && <Icon name="lock" width="16" height="16" />}</li>)}</ol></> : <p>Nội dung nhập môn đang được chuẩn bị. Bạn hãy quay lại sau.</p>}
    <div className="foundation-gate-actions"><Link className="study-primary" to={access.next ? foundationPath(access.next.slug) : '/foundations'}>{access.completed ? 'Tiếp tục nhập môn' : 'Bắt đầu từ Pinyin'} <Icon name="arrow" /></Link><Link to="/foundations">Xem toàn bộ lộ trình</Link></div>{!signedIn && <p><Link to="/login" state={{ from: '/foundations' }}>Đăng nhập để lưu kết quả và mở khóa các bài tiếp theo →</Link></p>}
  </section></main>
}
