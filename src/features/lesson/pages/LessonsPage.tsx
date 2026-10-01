import { LoadingState } from '../../../shared/components/LoadingState'
import { Link, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import type { LessonSummary } from '../types/lesson.types'
import '../../../shared/styles/study.css'

export function LessonsPage() {
  const { data, loading, error, reload } = useResource<LessonSummary[]>('/lessons')
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const filtered = data?.filter(lesson => `${lesson.title} ${lesson.description}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')))
  return <main className="study-page">
    <header className="study-heading"><p className="study-eyebrow">TỪ NHỮNG ĐIỀU QUEN THUỘC</p><h1>Học tiếng Trung từng chút một.</h1><p>Mỗi bài một chủ đề. Đọc từ, hiểu câu, rồi ôn lại theo nhịp của bạn.</p><Link to="/vocabulary" className="study-text-link">Khám phá kho từ vựng →</Link></header>
    <p><Link className="study-text-link" to="/courses">Khám phá khóa học theo lộ trình →</Link></p><section className="study-finish"><div><h2>Mới bắt đầu học tiếng Trung?</h2><p>Học các bài nhập môn: Pinyin, bảng thanh mẫu, vận mẫu và thanh điệu trước khi vào các chủ đề dưới đây.</p></div><Link className="study-primary" to="/foundations">Bắt đầu từ phát âm →</Link></section>
    <label className="study-lesson-search">Tìm bài học<input type="search" value={query} maxLength={100} placeholder="Ví dụ: gia đình, đồ ăn, thời gian…" onChange={event => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} /></label>
    {loading ? <LoadingState label="Đang tải bài học…" /> : error ? <div role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button></div> : <>
      <p className="study-count" role="status">{filtered?.length ?? 0} bài học · Lộ trình nhập môn</p>
      <div className="study-lesson-grid">{filtered?.map(lesson => <Link to={`/lessons/${lesson.id}`} className="study-lesson-card" key={lesson.id}><span className="study-number">BÀI {String(lesson.position).padStart(2, '0')}</span><h2>{lesson.title}</h2><p>{lesson.description}</p><footer><span>{lesson.wordCount} từ vựng</span><strong>Bắt đầu học →</strong></footer></Link>)}</div>
      {filtered?.length === 0 && <p className="study-empty">Chưa có bài phù hợp. Hãy thử từ khóa khác.</p>}
    </>}
  </main>
}
