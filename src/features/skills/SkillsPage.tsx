import { LoadingState } from '../../shared/components/LoadingState'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../shared/hooks/useResource'
import { ApiError, mutate } from '../../services/api'
import { ListenButton, Recorder } from './AudioPractice'
import { ratingNames, skillDescriptions, skillNames } from './types'
import type { Attempt, Exercise, History, Question, Skill, SkillStat } from './types'
import '../../shared/styles/study.css'
import './skills.css'

const skills = Object.keys(skillNames) as Skill[]
const message = (e: unknown) => e instanceof Error ? e.message : 'Không thực hiện được. Hãy thử lại.'
const dateLabel = (date: string) => new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' })

export function SkillsPage() {
  const catalogue = useResource<Exercise[]>('/skills/exercises')
  const stats = useResource<SkillStat[]>('/skills/stats')
  const [filters, setFilters] = useSearchParams()
  const initialSkill = filters.get('skill') as Skill
  const selected: Skill = skills.includes(initialSkill) ? initialSkill : 'LISTENING'
  const exerciseId = filters.get('exercise')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const requests = useRef<Record<string, string>>({})
  const navigate = useNavigate()
  async function start(id: string) {
    setBusy(id); setError('')
    const requestId = requests.current[id] ??= crypto.randomUUID()
    try { const result = await mutate<Attempt>('POST', '/skills/attempts', { exerciseId: id, requestId }); navigate('/skills/attempts/' + result.summary.id) }
    catch (e) { setError(message(e)) } finally { setBusy('') }
  }
  return <main className="study-page skills-page"><header className="study-heading"><p className="study-eyebrow">LUYỆN ĐỀU MỖI NGÀY</p><h1>Bốn kỹ năng của tôi</h1><p>Nghe rõ hơn, nói tự tin hơn, đọc hiểu và viết đúng từng câu.</p><Link to="/skills/history">Lịch sử luyện tập →</Link></header>
    {stats.loading && <LoadingState label="Đang tải tiến độ riêng của bạn…" />}
    {stats.error && <p role="alert">{stats.error} <button onClick={stats.reload}>Tải lại tiến độ</button></p>}
    <section className="skill-grid" aria-label="Tiến độ từng kỹ năng">{skills.map(skill => {
      const stat = stats.data?.find(s => s.skill === skill)
      const total = catalogue.data?.filter(e => e.skill === skill).length
      return <article key={skill} className="skill-tile" data-selected={selected === skill}><span className="skill-symbol" aria-hidden="true">{{ LISTENING: '听', SPEAKING: '说', READING: '读', WRITING: '写' }[skill]}</span><h2>{skillNames[skill]}</h2><p>{skillDescriptions[skill]}</p>
        {stat && <><strong>{stat.completedExercises}{total != null ? `/${total}` : ''} bài đã luyện</strong><p>{stat.attempts} lượt hoàn thành</p>
          <p>{skill === 'SPEAKING' ? 'Tự đánh giá · chưa chấm phát âm tự động' : stat.averageScore == null ? 'Chưa có điểm' : `Trung bình ${stat.averageScore}/100 · cao nhất ${stat.bestScore}/100`}</p></>}
        <button aria-pressed={selected === skill} onClick={() => setFilters({ skill })}>Luyện {skillNames[skill].toLowerCase()}</button>
      </article>
    })}</section>
    <section aria-label={`Bài luyện ${skillNames[selected]}`}><h2>Bài luyện {skillNames[selected].toLowerCase()} · Nhập môn</h2>
      {selected === 'LISTENING' && <p>Nghe âm thanh mẫu tiếng Trung, có thể phát lại và chọn tốc độ chậm.</p>}
      {selected === 'WRITING' && <p>Luyện nhập Hán tự bằng bàn phím và thứ tự câu. <Link to="/practice#strokes">Mở ô luyện nét chữ Hán →</Link></p>}
      {exerciseId && <p>Đang mở bài được chọn từ lộ trình. <button onClick={() => setFilters({ skill: selected })}>Xem tất cả bài cùng kỹ năng</button></p>}
      {catalogue.data && exerciseId && !catalogue.data.some(e => e.id === exerciseId && e.skill === selected) && <p role="status">Bài luyện này không còn trong danh sách đã xuất bản. Hãy chọn bài khác.</p>}
      {catalogue.loading && <LoadingState label="Đang tải bài luyện…" />}
      {catalogue.error && <p role="alert">{catalogue.error} <button onClick={catalogue.reload}>Thử lại</button></p>}
      {error && <p role="alert">{error}</p>}
      <div className="skill-lessons">{catalogue.data?.filter(e => e.skill === selected && (!exerciseId || e.id === exerciseId)).map(e => <article key={e.id}><div><h3>{e.title}</h3><p>{e.description}</p><small>{e.questionCount} câu · {selected === 'SPEAKING' ? 'Tự đánh giá' : 'Chấm theo đáp án'}</small></div><button disabled={!!busy} onClick={() => void start(e.id)}>{busy === e.id ? 'Đang mở…' : 'Bắt đầu →'}</button></article>)}</div>
    </section><p className="skill-note">Hoàn thành và nộp bài để lưu kết quả và tính ngày học. Tiến độ thuộc riêng tài khoản của bạn; điểm bài luyện không phải chứng nhận trình độ HSK.</p>
  </main>
}

export function SkillAttemptPage() {
  const { id } = useParams()
  const result = useResource<Attempt>(`/skills/attempts/${id}`)
  return <main className="study-page skills-page"><Link className="study-back" to="/skills">← Bốn kỹ năng</Link>
    {result.loading ? <LoadingState label="Đang tải lượt luyện…" /> : result.error ? <p role="alert">{result.error} <button onClick={result.reload}>Thử lại</button></p> : result.data && <Practice key={result.data.summary.id} initial={result.data} />}
  </main>
}

export function Practice({ initial }: { initial: Attempt }) {
  const [attempt, setAttempt] = useState(initial)
  const [answers, setAnswers] = useState<Record<string, string>>(() => Object.fromEntries(initial.questions.filter(q => q.answer != null).map(q => [q.id, q.answer!])))
  const [ready, setReady] = useState<Record<string, boolean>>(() => Object.fromEntries(initial.questions.filter(q => q.answer).map(q => [q.id, true])))
  const [savedAnswers, setSavedAnswers] = useState(() => JSON.stringify(initial.questions.map(q => q.answer ?? '')))
  const [draftMessage, setDraftMessage] = useState('')
  const [draftRetry, setDraftRetry] = useState(false)
  const draftPending = useRef<{ version: number; answers: { questionId: string; value: string }[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Retain the identical payload after an uncertain response, so retry cannot overwrite a submitted attempt.
  const pending = useRef<{ answers: { questionId: string; value: string }[] } | null>(null)
  const [retrying, setRetrying] = useState(false)
  const skill = attempt.summary.skill
  const submitted = !!attempt.summary.submittedAt
  const complete = attempt.questions.every(q => answers[q.id]?.trim() && (!['LISTENING', 'SPEAKING'].includes(skill) || ready[q.id]))
  const dirty = !submitted && JSON.stringify(attempt.questions.map(q => answers[q.id] ?? '')) !== savedAnswers
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  async function saveDraft() {
    if (busy || retrying) return
    setBusy(true); setError(''); setDraftMessage('')
    const payload = draftPending.current ?? { version: attempt.draftVersion ?? 0, answers: attempt.questions.filter(q => answers[q.id]?.trim()).map(q => ({ questionId: q.id, value: answers[q.id] })) }
    draftPending.current = payload; setDraftRetry(true)
    try {
      const result = await mutate<Attempt>('PUT', '/skills/attempts/' + attempt.summary.id + '/draft', payload)
      setAttempt(result)
      const restored = Object.fromEntries(result.questions.filter(q => q.answer != null).map(q => [q.id, q.answer!]))
      setAnswers(restored)
      setSavedAnswers(JSON.stringify(result.questions.map(q => q.answer ?? '')))
      setDraftMessage('Đã lưu bản nháp vào tài khoản. Bạn có thể quay lại từ lộ trình hoặc lịch sử.')
      draftPending.current = null; setDraftRetry(false)
    } catch (e) {
      setError(message(e))
      if (e instanceof ApiError && e.status >= 400 && e.status < 500) { draftPending.current = null; setDraftRetry(false) }
    } finally { setBusy(false) }
  }
  async function submit() {
    if (busy || draftRetry || submitted) return
    if (!complete && !pending.current) return
    setBusy(true); setError('')
    const payload = pending.current ?? { answers: attempt.questions.map(q => ({ questionId: q.id, value: answers[q.id] })) }
    pending.current = payload; setRetrying(true)
    try { const result = await mutate<Attempt>('POST', `/skills/attempts/${attempt.summary.id}/submit`, payload); setAttempt(result); pending.current = null; setRetrying(false) }
    catch (e) {
      setError(message(e))
      if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 409) { pending.current = null; setRetrying(false) }
    } finally { setBusy(false) }
  }
  return <><header className="study-heading"><p className="study-eyebrow">LUYỆN {skillNames[skill].toUpperCase()}</p><h1>{attempt.summary.title}</h1><p>{attempt.description}</p>
    {submitted ? <p role="status">{skill === 'SPEAKING' ? 'Đã lưu lượt luyện nói và mức tự đánh giá.' : `Kết quả: ${attempt.summary.score}/100 điểm`}</p> : <p>Bấm Lưu bản nháp trước khi rời trang để giữ câu trả lời trong tài khoản. Bản nháp chưa tính điểm hoặc ngày học. Bản thu âm chỉ ở trang hiện tại và không được lưu.</p>}
  </header>
    {skill === 'SPEAKING' && <aside className="skill-note">Phần này chưa chấm thanh điệu hoặc phát âm bằng AI. Sau khi thu âm và nghe lại, bạn tự đánh giá từng câu; hệ thống lưu mức tự đánh giá, không lưu âm thanh.</aside>}
    <form onSubmit={e => { e.preventDefault(); void submit() }}><fieldset className="skill-form" disabled={busy || retrying || draftRetry}>
      {attempt.questions.map((q, i) => <section className="skill-question" key={q.id} aria-labelledby={`question-${q.id}`}><h2 id={`question-${q.id}`}>Câu {i + 1}</h2><p>{q.prompt}</p>
        {skill === 'READING' && <blockquote lang="zh-CN">{q.text}</blockquote>}
        {skill === 'SPEAKING' && <><p className="skill-hanzi" lang="zh-CN">{q.text}</p><p>{q.hint}</p></>}
        {['LISTENING', 'SPEAKING'].includes(skill) && <ListenButton text={q.text} audioSrc={q.audioSrc ?? `/audio/skills/${attempt.summary.exerciseId}-${q.id}.mp3`} onHeard={() => { if (skill === 'LISTENING') setReady(values => ({ ...values, [q.id]: true })) }} />}
        {submitted ? <Feedback q={q} skill={skill} /> : <>
          {q.options.length > 0 && <fieldset disabled={skill === 'LISTENING' && !ready[q.id]}><legend>{skill === 'LISTENING' && !ready[q.id] ? 'Nghe hết câu mẫu để chọn đáp án' : 'Chọn một đáp án'}</legend>{q.options.map(option => <label className="skill-option" key={option}><input type="radio" name={q.id} required value={option} checked={answers[q.id] === option} onChange={() => setAnswers(values => ({ ...values, [q.id]: option }))} />{option}</label>)}</fieldset>}
          {skill === 'WRITING' && <><p className="skill-hint">{q.hint}</p><label>Câu trả lời bằng Hán tự<input aria-label={`Câu trả lời câu ${i + 1}`} lang="zh-CN" required maxLength={500} value={answers[q.id] ?? ''} onChange={e => setAnswers(values => ({ ...values, [q.id]: e.target.value }))} autoComplete="off" spellCheck={false} /></label></>}
          {skill === 'SPEAKING' && <><Recorder onReady={value => { setReady(values => ({ ...values, [q.id]: value })); if (!value) setAnswers(values => ({ ...values, [q.id]: '' })) }} /><label>Tự đánh giá sau khi nghe lại<select aria-label={`Tự đánh giá câu ${i + 1}`} required disabled={!ready[q.id]} value={answers[q.id] ?? ''} onChange={e => setAnswers(values => ({ ...values, [q.id]: e.target.value }))}><option value="">Chọn mức phù hợp</option>{Object.entries(ratingNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></>}
        </>}
      </section>)}
    </fieldset>
      {error && <p className="study-error" role="alert">{error} Câu trả lời vẫn được giữ. Bạn có thể gửi lại hoặc mở lại lượt luyện từ lịch sử để kiểm tra kết quả.</p>}
      {!submitted && <><p role="status">{dirty ? 'Có câu trả lời chưa lưu.' : draftMessage || 'Bản nháp đã đồng bộ với tài khoản.'}</p><button type="button" disabled={busy || retrying || (!dirty && !draftRetry)} onClick={() => void saveDraft()}>{draftRetry ? 'Thử lưu lại bản nháp' : 'Lưu bản nháp'}</button></>}
      {!submitted && <button className="study-primary" type="submit" disabled={busy || draftRetry || (!complete && !retrying)}>{busy ? 'Đang lưu…' : retrying ? 'Gửi lại bài' : 'Nộp bài và lưu kết quả'}</button>}
    </form>
    {submitted && <div className="skill-result-links"><Link className="study-primary" to="/skills">Chọn bài luyện tiếp</Link><Link to="/skills/history">Xem lịch sử của tôi</Link><Link to="/progress">Xem chuỗi ngày học</Link></div>}
  </>
}

function Feedback({ q, skill }: { q: Question; skill: Skill }) {
  return <div className="skill-feedback" data-correct={q.correct === true}>
    {skill === 'LISTENING' && <p lang="zh-CN">Nội dung đã nghe: {q.text}</p>}
    <p>{skill === 'SPEAKING' ? `Tự đánh giá: ${ratingNames[q.answer ?? ''] ?? 'Chưa có'}` : `Bạn trả lời: ${q.answer ?? ''} · ${q.correct ? 'Đúng' : 'Chưa đúng'}`}</p>
    {q.accepted && q.accepted.length > 0 && <p>Đáp án: <strong>{q.accepted.join(' / ')}</strong></p>}<p>{q.explanation}</p>
  </div>
}

export function SkillHistoryPage() {
  const [params, setParams] = useSearchParams()
  const skill = params.get('skill') ?? ''
  const page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const result = useResource<History>(`/skills/attempts?${new URLSearchParams({ skill, page: String(page), size: '20' })}`)
  return <main className="study-page skills-page"><Link className="study-back" to="/skills">← Bốn kỹ năng</Link><header className="study-heading"><h1>Lịch sử luyện kỹ năng</h1><p>Kết quả và lượt chưa nộp của riêng bạn · Giờ Việt Nam.</p></header>
    <label>Lọc kỹ năng<select value={skill} onChange={e => setParams(e.target.value ? { skill: e.target.value } : {})}><option value="">Tất cả kỹ năng</option>{skills.map(s => <option value={s} key={s}>{skillNames[s]}</option>)}</select></label>
    {result.loading ? <LoadingState label="Đang tải…" /> : result.error ? <p role="alert">{result.error} <button onClick={result.reload}>Thử lại</button></p> : result.data && <>
      {result.data.items.length === 0 ? <p className="study-empty">Chưa có lượt luyện phù hợp. Chọn một bài để bắt đầu.</p> : <ol className="skill-history">{result.data.items.map(item => <li key={item.id}><div><small>{skillNames[item.skill]} · {dateLabel(item.createdAt)}</small><h2>{item.title}</h2><p>{!item.submittedAt ? 'Chưa nộp bài' : item.skill === 'SPEAKING' ? 'Đã luyện · tự đánh giá' : `${item.score}/100 điểm`}</p></div><Link to={'/skills/attempts/' + item.id}>{item.submittedAt ? 'Xem kết quả' : 'Tiếp tục'}</Link></li>)}</ol>}
      <div className="study-pagination"><button disabled={page === 0} onClick={() => setParams({ skill, page: String(page - 1) })}>← Trang trước</button><span>Trang {page + 1} / {Math.max(1, Math.ceil(result.data.total / 20))}</span><button disabled={(page + 1) * 20 >= result.data.total} onClick={() => setParams({ skill, page: String(page + 1) })}>Trang sau →</button></div>
    </>}
  </main>
}
