import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { quizApi } from '../api/quizApi'
import type { QuizAttempt, QuizAttemptPage, QuizSet, StartQuiz } from '../types/quiz.types'
import { QuizAttemptForm } from '../components/QuizAttemptForm'
import '../../../shared/styles/study.css'
import '../quiz.css'

function QuizLinks() { return <nav className="quiz-links" aria-label="Điều hướng Quiz"><Link to="/quizzes">Chọn bài Quiz</Link><Link to="/quizzes/history">Lịch sử và bài đang làm</Link></nav> }
function StartSet({ set }: { set: QuizSet }) {
  const [count, setCount] = useState(5), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const pending = useRef<StartQuiz | null>(null), lock = useRef(false)
  const navigate = useNavigate()
  async function start() {
    if (lock.current) return
    lock.current = true; setBusy(true); setError('')
    pending.current ??= { requestId: crypto.randomUUID(), setId: set.id, questionCount: count }
    try { const data = await quizApi.start(pending.current); navigate('/quizzes/attempts/' + data.attempt.id) }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa tạo được lượt làm bài.') }
    finally { setBusy(false); lock.current = false }
  }
  return <article className="quiz-set"><p className="study-eyebrow">{set.questionCount} CÂU TRONG BỘ</p><h2>{set.title}</h2><p>{set.description}</p>
    <label>Số câu mỗi lượt<select disabled={busy || !!error} value={count} onChange={e => setCount(Number(e.target.value))}><option value={5}>5 câu · Ôn nhanh</option>{set.questionCount >= 10 && <option value={10}>10 câu · Luyện đầy đủ</option>}</select></label>
    <button className="study-primary" disabled={busy} onClick={() => void start()}>{busy ? 'Đang tạo bài…' : error ? 'Thử lại tạo lượt này' : 'Bắt đầu làm bài'}</button>
    {set.lessonId && <Link to={'/lessons/' + set.lessonId}>Ôn lại bài học →</Link>}
    {error && <div role="alert"><p>{error}</p><Link to="/quizzes/history">Kiểm tra các lượt đã tạo</Link></div>}
  </article>
}
export function QuizPage() {
  const sets = useResource<QuizSet[]>('/quizzes/sets')
  return <main className="study-page quiz-page"><QuizLinks /><header className="study-heading"><p className="study-eyebrow">HỌC XONG, THỬ SỨC</p><h1>Quiz tiếng Trung</h1><p>Mỗi lượt 5 hoặc 10 câu. Chọn nghĩa, chọn từ và hiểu vì sao sau khi nộp bài.</p></header>
    {sets.loading ? <p role="status">Đang tải bộ câu hỏi…</p> : sets.error ? <div role="alert"><p>{sets.error}</p><button onClick={sets.reload}>Thử lại</button></div> : <div className="quiz-sets">{sets.data?.map(set => <StartSet key={set.id} set={set} />)}</div>}
    {sets.data?.length === 0 && <p className="study-empty">Chưa có bộ câu hỏi khả dụng.</p>}
    <p className="study-hint">Bộ câu hỏi nhập môn hiện dành cho hai bài đầu. Điểm của một lượt giúp bạn tự ôn tập, chưa phải đánh giá trình độ HSK.</p>
  </main>
}
export function QuizAttemptPage() {
  const { id } = useParams()
  const result = useResource<QuizAttempt>('/quizzes/attempts/' + encodeURIComponent(id ?? ''))
  return <main className="study-page quiz-page"><QuizLinks />{result.loading ? <p role="status">Đang tải bài làm…</p> : result.error ? <div role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button><Link to="/quizzes/history">Về lịch sử</Link></div> : result.data && <QuizAttemptForm key={result.data.attempt.id} initial={result.data} onReload={result.reload} />}</main>
}
export function QuizHistoryPage() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? '', page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const result = useResource<QuizAttemptPage>(`/quizzes/attempts?status=${encodeURIComponent(status)}&page=${page}&size=20`)
  return <main className="study-page quiz-page"><QuizLinks /><header className="study-heading"><p className="study-eyebrow">HÀNH TRÌNH CỦA BẠN</p><h1>Lịch sử Quiz</h1><p>Làm tiếp bài còn dở hoặc xem lại kết quả đã nộp.</p></header>
    <label className="quiz-filter">Trạng thái<select value={status} onChange={e => setParams(e.target.value ? { status: e.target.value } : {})}><option value="">Tất cả lượt</option><option value="IN_PROGRESS">Đang làm</option><option value="SUBMITTED">Đã nộp</option></select></label>
    {result.loading ? <p role="status">Đang tải lịch sử…</p> : result.error ? <div role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button><button onClick={() => setParams({})}>Xóa bộ lọc</button></div> : result.data && <><p>{result.data.total} lượt làm bài</p><div className="quiz-history">{result.data.items.map(a => <article key={a.id}><div><h2>{a.title}</h2><p>{a.status === 'SUBMITTED' ? `Đã nộp · ${a.score}/100 điểm · Đúng ${a.correctCount}/${a.questionCount} câu` : `Đang làm · Đã lưu ${a.answeredCount}/${a.questionCount} câu`}</p><small>Bắt đầu {new Date(a.createdAt).toLocaleString('vi-VN')}</small></div><Link className="study-primary" to={'/quizzes/attempts/' + a.id}>{a.status === 'SUBMITTED' ? 'Xem kết quả' : 'Làm tiếp'}</Link></article>)}</div>{result.data.total === 0 && <p className="study-empty">Chưa có lượt phù hợp. Chọn bộ câu hỏi để bắt đầu.</p>}
      <div className="study-pagination"><button disabled={page === 0} onClick={() => setParams({ status, page: String(page - 1) })}>← Trang trước</button><span>Trang {page + 1}/{Math.max(1, Math.ceil(result.data.total / 20))}</span><button disabled={(page + 1) * 20 >= result.data.total} onClick={() => setParams({ status, page: String(page + 1) })}>Trang sau →</button></div></>}
  </main>
}
