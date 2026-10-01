import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../../services/api'
import { quizApi } from '../api/quizApi'
import type { QuizAnswer, QuizAttempt } from '../types/quiz.types'
import { QuizQuestionCard } from './QuizQuestionCard'

type Pending = { kind: 'answer'; input: QuizAnswer } | { kind: 'submit'; version: number }
export function QuizAttemptForm({ initial, onReload }: { initial: QuizAttempt; onReload: () => void }) {
  const [data, setData] = useState(initial)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false)
  const [wrongOnly, setWrongOnly] = useState(false)
  const [operation, setOperation] = useState<'answer' | 'submit'>('answer')
  const pending = useRef<Pending | null>(null), lock = useRef(false)
  const notice = useRef<HTMLDivElement>(null)
  const { attempt, questions } = data
  const submitted = attempt.status === 'SUBMITTED'
  async function send(action: Pending) {
    if (lock.current) return
    lock.current = true; pending.current = action; setOperation(action.kind); setBusy(true); setError(''); setConflict(false)
    try {
      const result = action.kind === 'answer' ? await quizApi.answer(attempt.id, action.input) : await quizApi.submit(attempt.id, action.version)
      setData(result); pending.current = null
      if (result.attempt.status === 'SUBMITTED') window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa lưu được thay đổi.'); setConflict(e instanceof ApiError && e.status === 409)
      requestAnimationFrame(() => notice.current?.focus())
    } finally { setBusy(false); lock.current = false }
  }
  function select(questionId: string, optionId: string) {
    if (pending.current || submitted) return
    void send({ kind: 'answer', input: { requestId: crypto.randomUUID(), questionId, optionId, version: attempt.version } })
  }
  return <>
    <header className="study-heading"><p className="study-eyebrow">{submitted ? 'KẾT QUẢ QUIZ' : 'LUYỆN TẬP TỪNG CÂU'}</p><h1>{attempt.title}</h1>
      <p>{submitted ? 'Xem lại câu trả lời và giải thích để củng cố những từ vừa học.' : 'Mỗi lựa chọn được lưu ngay. Bạn có thể đổi đáp án trước khi nộp bài.'}</p></header>
    {submitted ? <section className="quiz-result" aria-label="Kết quả"><div><strong>{attempt.score}<small>/100</small></strong><span>Điểm bài làm</span></div><p>Đúng {attempt.correctCount}/{attempt.questionCount} câu<br /><small>Nộp lúc {new Date(attempt.submittedAt!).toLocaleString('vi-VN')}</small></p><Link className="study-primary" to="/quizzes">Làm lượt mới</Link></section> :
      <div className="quiz-progress"><label htmlFor="quiz-progress">Đã lưu {attempt.answeredCount}/{attempt.questionCount} câu</label><progress id="quiz-progress" max={attempt.questionCount} value={attempt.answeredCount} /><p>Bạn có thể rời trang và mở lại lượt này trong lịch sử để làm tiếp.</p></div>}
    {submitted && <label className="quiz-filter"><input type="checkbox" checked={wrongOnly} onChange={e => setWrongOnly(e.target.checked)} /> Chỉ xem câu sai</label>}
    <div className="quiz-question-list">{questions.filter(q => !submitted || !wrongOnly || !q.correct).map(question => <QuizQuestionCard key={question.id} question={question} submitted={submitted} busy={busy || !!error} onSelect={option => select(question.id, option)} />)}</div>
    {submitted && wrongOnly && attempt.correctCount === attempt.questionCount && <p className="study-empty">Bạn đã trả lời đúng tất cả câu hỏi trong lượt này.</p>}
    {!submitted && <div className="quiz-actionbar">
      {busy && <p role="status">{operation === 'submit' ? 'Đang nộp bài…' : 'Đang lưu câu trả lời…'}</p>}
      {error && <div ref={notice} tabIndex={-1} role="alert" className="quiz-error"><p>{error}</p><p>{conflict ? 'Tải lại để xem phiên bản đã lưu mới nhất.' : 'Thử lại giữ nguyên yêu cầu vừa gửi và không tạo kết quả trùng.'}</p>{!conflict && <button disabled={busy} onClick={() => pending.current && void send(pending.current)}>Thử lại thao tác vừa gửi</button>}<button disabled={busy} onClick={onReload}>Tải lại bài làm</button></div>}
      <div><span>{attempt.questionCount - attempt.answeredCount > 0 ? `Còn ${attempt.questionCount - attempt.answeredCount} câu chưa trả lời` : 'Đã trả lời đủ. Nộp bài để xem điểm và giải thích.'}</span><button className="study-primary" disabled={busy || !!error || attempt.answeredCount !== attempt.questionCount} onClick={() => void send({ kind: 'submit', version: attempt.version })}>Nộp bài</button></div>
    </div>}
  </>
}
