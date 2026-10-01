import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { PermissionGate } from '../../../app/router/PermissionGate'
import type { LessonSummary } from '../../lesson/types/lesson.types'
import { searchText } from '../utils/searchText'
import '../management.css'

export interface Course { id: number; title: string; description: string; published: boolean; version: number }
export interface CourseDetail { course: Course; lessons: { id: number; title: string; published: boolean }[] }
export function AdminCoursesPage() {
  const result = useResource<Course[]>('/admin/courses')
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? '', status = params.get('status') ?? ''
  const filtered = result.data?.filter(c => searchText(c.title + ' ' + c.description).includes(searchText(q)) && (!status || (status === 'published' ? c.published : !c.published)))
  function filter(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next, { replace: true }) }
  return <main className="admin-page"><div className="admin-heading"><div><h1>Quản lý khóa học</h1><p>Gom bài học thành lộ trình có thứ tự. Khóa mới được lưu nháp.</p></div><PermissionGate permission="courses.create"><Link to="/admin/courses/new" className="admin-link-primary">Tạo khóa học</Link></PermissionGate></div>
    <div className="admin-toolbar"><label>Tìm khóa học<input type="search" value={q} onChange={e => filter('q', e.target.value)} /></label><label>Trạng thái<select value={status} onChange={e => filter('status', e.target.value)}><option value="">Tất cả</option><option value="published">Đã xuất bản</option><option value="draft">Nháp / đã ẩn</option></select></label><button onClick={result.reload} disabled={result.loading}>Tải lại</button></div>
    {result.loading ? <p role="status">Đang tải khóa học…</p> : result.error ? <p role="alert">{result.error}</p> : <div className="management-table"><table><thead><tr><th>Khóa học</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{filtered?.map(c => <tr key={c.id}><td data-label="Khóa học"><strong>{c.title}</strong><small>{c.description}</small></td><td data-label="Trạng thái">{c.published ? 'Đã xuất bản' : 'Nháp / đã ẩn'}</td><td data-label="Thao tác"><Link to={`/admin/courses/${c.id}`}>Xem và quản lý</Link></td></tr>)}</tbody></table>{filtered?.length === 0 && <p className="admin-empty">Chưa có khóa học phù hợp.</p>}</div>}
  </main>
}
export function AdminCourseEditorPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const result = useResource<CourseDetail>(id ? '/admin/courses/' + encodeURIComponent(id) : null)
  const lessons = useResource<LessonSummary[]>(can(user, 'lessons.read') ? '/admin/lessons' : null)
  return <main className="admin-page course-editor-page"><Link className="course-back" to="/admin/courses">← Danh sách khóa học</Link><header className="course-editor-heading"><p className="admin-eyebrow">THIẾT KẾ LỘ TRÌNH HỌC</p><h1>{id ? 'Chi tiết khóa học' : 'Tạo khóa học mới'}</h1><p>Sắp xếp từng bài học thành một hành trình rõ ràng cho học viên.</p></header>
    {result.loading || lessons.loading ? <p role="status">Đang tải…</p> : result.error || lessons.error ? <p role="alert">{result.error || lessons.error}</p> : <CourseForm key={`${id ?? 'new'}-${result.data?.course.version}`} detail={result.data} lessons={lessons.data ?? []} />}
    <button onClick={() => { result.reload(); lessons.reload() }}>Tải lại dữ liệu</button>
  </main>
}
function CourseForm({ detail, lessons }: { detail?: CourseDetail; lessons: LessonSummary[] }) {
  const { user } = useAuth(), navigate = useNavigate()
  const [current, setCurrent] = useState(detail)
  const [ids, setIds] = useState<number[]>(detail?.lessons.map(l => l.id) ?? [])
  const [choice, setChoice] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState(''), [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const editable = can(user, current ? 'courses.update' : 'courses.create') && can(user, 'lessons.read') && !current?.course.published
  async function action(task: () => Promise<void>) { setBusy(true); setError(''); setMessage(''); try { await task() } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được khóa học.') } finally { setBusy(false) } }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget)
    void action(async () => {
      const saved = await mutate<CourseDetail>(current ? 'PUT' : 'POST', '/admin/courses' + (current ? '/' + current.course.id : ''), { title: form.get('title'), description: form.get('description'), lessonIds: ids, version: current?.course.version ?? 0 })
      if (!current) navigate(`/admin/courses/${saved.course.id}`, { replace: true })
      setCurrent(saved); setDirty(false); setMessage('Đã lưu khóa học nháp.')
    })
  }
  function move(index: number, direction: number) { setDirty(true); setIds(old => { const next = [...old]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next }) }
  return <section className="management-form course-form"><div className="course-status"><span>{ids.length} bài học</span><p>{current?.course.published ? 'Đã xuất bản. Ẩn khóa học trước khi sửa.' : 'Bản nháp · Chỉ hiển thị với học viên sau khi xuất bản.'}</p></div>
    <div className="admin-editor"><form onSubmit={save} onChange={() => setDirty(true)}><fieldset disabled={busy || !editable}>
      <h2>01. Thông tin khóa học</h2><p className="course-help">Đặt tên dễ hiểu và mô tả những gì học viên sẽ học được.</p><label>Tên khóa học<input placeholder="Ví dụ: Tiếng Trung giao tiếp cơ bản" name="title" required maxLength={120} defaultValue={detail?.course.title ?? ''} /></label>
      <label>Mô tả<textarea name="description" maxLength={2000} defaultValue={detail?.course.description ?? ''} /></label>
      <h2>02. Lộ trình bài học</h2><p className="course-help">Thêm bài và sắp xếp theo thứ tự học. Tối đa 100 bài mỗi khóa.</p><label>Chọn bài học<select value={choice} onChange={e => setChoice(e.target.value)}><option value="">Chọn bài để thêm</option>{lessons.filter(l => !ids.includes(l.id)).map(l => <option key={l.id} value={l.id}>{l.title}{l.published === false ? ' (đã ẩn)' : ''}</option>)}</select></label>
      <button type="button" disabled={!choice || ids.length >= 100} onClick={() => { setDirty(true); setIds([...ids, Number(choice)]); setChoice('') }}>Thêm vào khóa</button>
      {ids.length === 0 && <div className="course-empty"><strong>Khóa học chưa có bài nào</strong><p>Chọn một bài ở trên rồi bấm “Thêm vào khóa” để bắt đầu.</p></div>}<ol className="course-lesson-list">{ids.map((id, index) => <li key={id}><p>{lessons.find(l => l.id === id)?.title ?? current?.lessons.find(l => l.id === id)?.title ?? `Bài ${id}`}</p><div className="management-actions"><button type="button" aria-label={`Đưa bài ${index + 1} lên`} disabled={index === 0} onClick={() => move(index, -1)}>↑ Lên</button><button type="button" aria-label={`Đưa bài ${index + 1} xuống`} disabled={index === ids.length - 1} onClick={() => move(index, 1)}>↓ Xuống</button><button type="button" onClick={() => { setDirty(true); setIds(ids.filter(value => value !== id)) }}>Gỡ khỏi khóa</button></div></li>)}</ol>
      <button type="submit" className="admin-primary">{busy ? 'Đang lưu…' : 'Lưu khóa học'}</button>
    </fieldset></form></div>
    {dirty && <p role="status">Có thay đổi chưa lưu. Lưu khóa học trước khi xuất bản.</p>}
    {current && <div className="admin-actions"><PermissionGate permission="courses.publish"><button disabled={busy || dirty} onClick={() => void action(async () => { const saved = await mutate<CourseDetail>('PATCH', `/admin/courses/${current.course.id}/publication`, { published: !current.course.published, version: current.course.version }); setCurrent(saved); setIds(saved.lessons.map(l => l.id)); setMessage(saved.course.published ? 'Đã xuất bản nội dung đã lưu.' : 'Đã ẩn khóa học.') })}>{current.course.published ? 'Ẩn khóa học' : 'Xuất bản bản đã lưu'}</button></PermissionGate><PermissionGate permission="courses.delete"><button disabled={busy || current.course.published} onClick={() => setDeleting(true)}>Xóa khóa học</button></PermissionGate></div>}
    {deleting && current && <div role="group" aria-label="Xác nhận xóa khóa học"><p>Xóa khóa “{current.course.title}”? Các bài học và tiến độ học vẫn được giữ.</p><button disabled={busy} onClick={() => void action(async () => { await mutate('DELETE', `/admin/courses/${current.course.id}?version=${current.course.version}`); navigate('/admin/courses', { replace: true }) })}>Xác nhận xóa</button><button disabled={busy} onClick={() => setDeleting(false)}>Hủy</button></div>}
    {error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
  </section>
}
