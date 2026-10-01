import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { useAuth } from '../../../app/providers/AuthContext'
import type { LessonDetail, LessonSummary } from '../types/lesson.types'
import { WordCard } from '../../vocabulary/components/WordCard'
import { learningApi } from '../../progress/api/learningApi'
import type { LearningRecord } from '../../progress/api/learningApi'
import '../../../shared/styles/study.css'
import type { CourseDetail } from '../types/course.types'
import { lessonPath } from '../courseProgress'
import './courses.css'
import { SaveLessonButton } from '../../flashcard/components/SaveFlashcards'

export function LessonDetailPage() {
  const { id } = useParams()
  return <LessonContent key={id} id={id ?? ''} />
}

function LessonContent({ id }: { id: string }) {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const requestedCourse = params.get('courseId') ?? ''
  const courseId = /^[1-9]\d*$/.test(requestedCourse) ? requestedCourse : undefined
  const course = useResource<CourseDetail>(courseId ? '/courses/' + courseId : null)
  const detail = useResource<LessonDetail>('/lessons/' + encodeURIComponent(id ?? ''))
  const all = useResource<LessonSummary[]>('/lessons')
  const records = useResource<LearningRecord[]>(user ? '/learning-records' : null)
  const [completedId, setCompletedId] = useState<number>()
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const lesson = detail.data?.lesson
  const complete = lesson && (completedId === lesson.id || records.data?.some(record => record.lessonId === lesson.id && record.completedAt))
  const inCourse = course.data?.lessons.some(item => item.id === lesson?.id)
  const ordered = courseId ? (inCourse ? course.data?.lessons : undefined) : all.data
  const record = records.data?.find(item => item.lessonId === lesson?.id)
  const index = ordered?.findIndex(item => item.id === lesson?.id) ?? -1
  const previous = index > 0 ? ordered?.[index - 1] : undefined
  const next = index >= 0 ? ordered?.[index + 1] : undefined
  async function start() {
    if (!lesson) return
    setBusy(true); setActionError('')
    try { await learningApi.create(lesson.id, ''); records.reload() }
    catch(e) { setActionError(e instanceof Error ? e.message : 'Chưa lưu được bài học.'); records.reload() }
    finally { setBusy(false) }
  }
  async function finish() {
    if (!lesson) return
    setBusy(true); setActionError('')
    try { await learningApi.complete(lesson.id); setCompletedId(lesson.id); records.reload() }
    catch (e) { setActionError(e instanceof Error ? e.message : 'Chưa lưu được trạng thái hoàn thành.') }
    finally { setBusy(false) }
  }
  return <main className="study-page"><Link className="study-back" to={inCourse ? '/courses/' + courseId : '/lessons'}>← {inCourse ? course.data?.course.title : 'Tất cả bài học'}</Link>
    {courseId && course.data && !inCourse && lesson && <p>Bài này không thuộc khóa học đã chọn. <Link to={'/lessons/' + lesson.id}>Học bài độc lập →</Link></p>}
    {courseId && course.error && <p role="alert">Không tải được lộ trình khóa học. <button onClick={course.reload}>Thử lại</button></p>}
    {detail.loading ? <p role="status">Đang tải bài học…</p> : detail.error ? <div role="alert"><p>{detail.error}</p><button onClick={detail.reload}>Thử lại</button></div> : lesson && detail.data && <>
      <header className="study-heading"><p className="study-eyebrow">BÀI {lesson.position} · {lesson.wordCount} TỪ VỰNG</p><h1>{lesson.title}</h1><p>{lesson.description}</p><p className="lesson-state">{complete ? '✓ Đã hoàn thành' : record ? 'Đang học' : 'Chưa đánh dấu học'}</p>
      {user && !record && !complete && <button disabled={busy || records.loading || !!records.error} onClick={() => void start()}>{busy ? 'Đang lưu…' : 'Lưu vào bài đang học'}</button>}
      <nav className="lesson-sections" aria-label="Nội dung bài học"><a href="#lesson-words">1. Học từ vựng</a><a href="#lesson-practice">2. Luyện & ôn tập</a><a href="#lesson-finish">3. Hoàn thành</a></nav></header>
      <h2 id="lesson-words">Từ vựng trong bài</h2><p className="study-hint">Chọn một từ để xem cách đọc, nghĩa Việt và câu ví dụ.</p>
      <div className="study-grid">{detail.data.words.map((word, i) => <WordCard key={word.id} word={word} position={i + 1} />)}</div>
      {detail.data.words.length === 0 && <p className="study-empty">Bài học đang được biên soạn, chưa có từ vựng.</p>}
      <h2 id="lesson-practice">Luyện và ôn tập</h2><p>Lưu từ vào Flashcard để ôn theo lịch, hoặc hỏi AI về cách dùng từ trong bài.</p><SaveLessonButton lessonId={lesson.id} wordCount={detail.data.words.length} />
      <p><Link to={`/ai?lessonId=${lesson.id}`}>Hỏi AI Tutor về bài này →</Link></p>
      <section id="lesson-finish" className="study-finish"><div><h2>{complete ? 'Bạn đã hoàn thành bài này' : 'Đã học xong các từ trong bài?'}</h2><p>Đánh dấu để lưu vào hồ sơ học tập của riêng bạn.</p></div>
        {user ? <button className="study-primary" disabled={busy || records.loading || !!records.error || !!complete || detail.data.words.length === 0} onClick={() => void finish()}>{busy ? 'Đang lưu…' : complete ? 'Đã hoàn thành' : 'Hoàn thành bài học'}</button> : <Link className="study-primary" to="/login" state={{ from: lessonPath(lesson.id,inCourse ? courseId : undefined) }}>Đăng nhập để lưu kết quả</Link>}
        {complete && <div><p role="status">Kết quả đã được lưu. Bạn có thể quay lại ôn bất cứ lúc nào.</p>{next ? <Link className="study-primary" to={lessonPath(next.id,inCourse ? courseId : undefined)}>Học tiếp: {next.title} →</Link> : <Link className="study-primary" to={inCourse ? '/courses/' + courseId : '/practice'}>{inCourse ? 'Xem tiến độ khóa học' : 'Chuyển sang luyện tập'} →</Link>}</div>}
        {records.error && <p role="alert">Chưa tải được trạng thái học. <button onClick={records.reload}>Thử lại</button></p>}
        {actionError && <p role="alert">{actionError}</p>}
      </section>
      {all.error && <p role="alert">Chưa tải được thứ tự bài học. <button onClick={all.reload}>Thử lại</button></p>}
      <div className="study-pagination">{previous ? <Link to={lessonPath(previous.id,inCourse ? courseId : undefined)}>← {previous.title}</Link> : <span />}{next && <Link to={lessonPath(next.id,inCourse ? courseId : undefined)}>{next.title} →</Link>}</div>
    </>}
  </main>
}
