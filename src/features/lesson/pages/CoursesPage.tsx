import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import '../../../shared/styles/study.css'
import './courses.css'
import type { Course, CourseDetail } from '../types/course.types'
import { courseProgress, lessonPath } from '../courseProgress'
import { useAuth } from '../../../app/providers/AuthContext'
import type { LearningRecord } from '../../progress/api/learningApi'
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi')
export function CoursesPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const records = useResource<LearningRecord[]>(user && id ? '/learning-records' : null)
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const list = useResource<Course[]>(id ? null : '/courses')
  const detail = useResource<CourseDetail>(id ? '/courses/' + encodeURIComponent(id) : null)
  const result = id ? detail : list
  const progress = courseProgress(detail.data?.lessons ?? [], records.data ?? [])
  const target = progress.next ?? detail.data?.lessons[0]
  const filtered = list.data?.filter(course => normalize(course.title + ' ' + course.description).includes(normalize(query.trim())))
  return <main className="study-page courses-page">
    <Link className="study-back" to={id ? '/courses' : '/home'}>← {id ? 'Tất cả khóa học' : 'Không gian học tập'}</Link>
    <header className="study-heading"><p className="study-eyebrow">HỌC TỪNG BƯỚC · 学习</p><h1>{detail.data?.course.title ?? (id ? 'Lộ trình khóa học' : 'Tìm lộ trình dành cho bạn')}</h1><p>{detail.data?.course.description ?? 'Các bài học được sắp xếp theo thứ tự để bạn dễ bắt đầu và tiếp tục mỗi ngày.'}</p>
    {detail.data && detail.data.lessons.length > 0 && <div className="course-heading-actions"><span>{detail.data.lessons.length} bài học trong lộ trình</span><Link className="study-primary" to={lessonPath(target!.id,id)}>{user && records.data ? progress.next ? 'Tiếp tục học →' : 'Ôn lại khóa học →' : 'Khám phá bài học →'}</Link></div>}
    {user && detail.data && (records.loading ? <p role="status">Đang tải tiến độ…</p> : records.error ? <p role="alert">Chưa tải được tiến độ. <button onClick={records.reload}>Thử lại</button></p> : <div className="course-progress"><label htmlFor="course-progress">Đã hoàn thành {progress.count}/{detail.data.lessons.length} bài</label><progress id="course-progress" max={100} value={progress.percent} /><p>Tiến độ tính trên các bài đang hiển thị trong khóa học.</p></div>)}
    </header>
    {!id && <form className="study-search" role="search" onSubmit={e => e.preventDefault()}><label htmlFor="course-search">Tìm khóa học<input id="course-search" type="search" placeholder="Tên khóa học hoặc chủ đề…" value={query} onChange={e => { const next = new URLSearchParams(params); if(e.target.value) next.set('q',e.target.value); else next.delete('q'); setParams(next,{replace:true}) }} /></label>{query && <button type="button" onClick={() => { const next = new URLSearchParams(params); next.delete('q'); setParams(next,{replace:true}) }}>Xóa tìm kiếm</button>}</form>}
    {result.loading ? <div className="course-loading" role="status" aria-live="polite"><span className="course-loading-mark" aria-hidden="true">学</span><p>Đang chuẩn bị lộ trình học…</p></div> : result.error ? <div className="study-error" role="alert"><h2>Chưa tải được khóa học</h2><p>{result.error}</p><button onClick={result.reload}>Thử lại</button><Link className="study-text-link" to="/lessons">Khám phá bài học</Link></div> : <>
    {!id && <><p className="study-count" role="status">{filtered?.length ?? 0} khóa học{query ? ' phù hợp' : ' đang mở'}</p><div className="study-lesson-grid">{filtered?.map((course,index) => <Link className="study-lesson-card course-card" to={'/courses/' + course.id} key={course.id}><div className="course-cover" aria-hidden="true"><span>学</span><small>LỘ TRÌNH {String(index + 1).padStart(2,'0')}</small></div><h2>{course.title}</h2><p>{course.description}</p><footer><span>Học theo từng bài</span><strong>Xem lộ trình →</strong></footer></Link>)}</div>{filtered?.length === 0 && <section className="study-empty"><h2>{query ? 'Chưa tìm thấy khóa học phù hợp' : 'Lộ trình mới đang được chuẩn bị'}</h2><p>{query ? 'Thử một từ khóa ngắn hơn hoặc bỏ dấu tiếng Việt.' : 'Trong lúc chờ, bạn có thể bắt đầu với Pinyin hoặc các bài theo chủ đề.'}</p><Link className="study-primary" to="/foundations">Bắt đầu với Pinyin</Link><Link className="study-text-link" to="/lessons">Xem bài theo chủ đề →</Link></section>}</>}
    {detail.data && <section aria-labelledby="course-outline"><div className="learner-section-heading"><div><p className="study-eyebrow">LỘ TRÌNH CỦA BẠN</p><h2 id="course-outline">Từng bài, từng bước tiến</h2><p>Chọn một bài để học. Bạn có thể quay lại ôn bất cứ lúc nào.</p></div></div><ol className="course-outline">{detail.data.lessons.map((lesson,index) => <li key={lesson.id}><Link to={lessonPath(lesson.id,id)}><span className="course-step" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><div><small>BÀI {index + 1}</small><h3>{lesson.title}</h3></div><span className="course-open">{user && records.data ? progress.completed.has(lesson.id) ? 'Đã hoàn thành · Ôn lại' : records.data.some(r => r.lessonId === lesson.id) ? 'Đang học · Tiếp tục' : 'Bắt đầu' : 'Vào học'} <span aria-hidden="true">→</span></span></Link></li>)}</ol>{detail.data.lessons.length === 0 && <div className="study-empty"><h3>Các bài học đang được cập nhật</h3><p>Bạn có thể khám phá các bài theo chủ đề trước.</p><Link className="study-primary" to="/lessons">Xem bài học →</Link></div>}</section>}
    </>}
  </main>
}
