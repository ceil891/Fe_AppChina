import { LoadingState } from '../../../shared/components/LoadingState'
import { aiModes } from '../modes'
import type { AiMode } from '../modes'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { ApiError, get, mutate } from '../../../services/api'
import type { LessonSummary } from '../../lesson/types/lesson.types'
import type { AiTurn, ConversationDetail, ConversationPage, SendInput } from '../types/ai.types'
import { ChatTranscript } from '../components/ChatTranscript'
import { ChatComposer } from '../components/ChatComposer'
import '../../../shared/styles/study.css'
import '../ai.css'
import { Availability } from '../components/Availability'
import { useAiStatus } from '../useAiStatus'

export function AiTutorPage() {
  const { id } = useParams()
  return id ? <ConversationContent key={id} id={id} /> : <TutorHome />
}
function TutorHome() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const [lessonId, setLessonId] = useState(params.get('lessonId') ?? '')
  const [mode, setMode] = useState<AiMode>('EXPLAIN')
  const status = useAiStatus()
  const list = useResource<ConversationPage>(`/ai/conversations?page=${page}&size=10`)
  const lessons = useResource<LessonSummary[]>('/lessons')
  const request = useRef<{ requestId: string; lessonId: number | null; mode: AiMode } | null>(null)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const navigate = useNavigate()
  async function start() {
    if (busy) return
    setBusy(true); setError('')
    const selected = lessonId ? Number(lessonId) : null
    if (!request.current || request.current.lessonId !== selected || request.current.mode !== mode) request.current = { requestId: crypto.randomUUID(), lessonId: selected, mode }
    try { const data = await mutate<ConversationDetail>('POST', '/ai/conversations', request.current); navigate('/ai/conversations/' + data.conversation.id) }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa tạo được hội thoại.') }
    finally { setBusy(false) }
  }
  return <main className="study-page ai-page"><header className="study-heading"><p className="study-eyebrow">HỌC CÙNG GEMINI</p><h1>AI Tutor</h1><p>Một người bạn để hỏi từ, sửa câu và luyện hội thoại tiếng Trung bằng tiếng Việt.</p></header>
    {status.loading && <LoadingState label="Đang kiểm tra khả năng sử dụng AI…" />}
    {status.data && <Availability status={status.data} />}
    {status.error && <p role="alert">{status.error} <button onClick={status.reload}>Thử lại</button></p>}
    <section className="ai-start"><div><h2>Bắt đầu một cuộc trò chuyện</h2><p>Chọn mục tiêu và bài để AI hỗ trợ đúng nội dung bạn đang học.</p><label>Cách học với AI<select value={mode} disabled={busy} onChange={e => setMode(e.target.value as AiMode)}>{Object.entries(aiModes).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></label><p>{aiModes[mode].description}</p><label>Bài học<select value={lessonId} disabled={busy || lessons.loading || !!lessons.error} onChange={e => setLessonId(e.target.value)}><option value="">Hỏi đáp tiếng Trung chung</option>{lessons.data?.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
      {lessons.error && <p role="alert">{lessons.error} <button onClick={lessons.reload}>Tải lại bài</button></p>}
      <p className="ai-privacy">Khi gửi câu hỏi, nội dung bạn nhập, ngữ cảnh bài và tối đa 3 lượt trao đổi gần nhất sẽ được gửi tới Google Gemini. Không nhập mật khẩu hoặc thông tin nhạy cảm.</p>
      <button className="study-primary" disabled={busy || !status.data?.available || status.data.remainingToday === 0 || lessons.loading || !!lessons.error} onClick={() => void start()}>{busy ? 'Đang tạo…' : 'Bắt đầu hội thoại'}</button>
      {error && <p role="alert">{error}</p>}
    </div><div className="ai-intro" aria-hidden="true"><span lang="zh">你好</span><p>Hiểu từ mới.<br />Tự tin đặt câu.<br />Luyện tập mỗi ngày.</p></div></section>
    <section className="ai-history"><h2>Hội thoại của bạn</h2>
      {list.loading ? <LoadingState label="Đang tải hội thoại…" /> : list.error ? <p role="alert">{list.error} <button onClick={list.reload}>Thử lại</button></p> : list.data && <>
        {!list.data.items.length ? <p>Chưa có hội thoại ở trang này.</p> : <ul>{list.data.items.map(c => <li key={c.id}><Link to={'/ai/conversations/' + c.id}>{c.title}</Link><small>{aiModes[c.mode ?? 'EXPLAIN'].label}</small><time dateTime={c.updatedAt}>{new Date(c.updatedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</time></li>)}</ul>}
        <div className="study-pagination"><button disabled={page === 0} onClick={() => setParams({ page: String(page - 1) })}>← Trang trước</button><span>Trang {page + 1}</span><button disabled={(page + 1) * 10 >= list.data.total} onClick={() => setParams({ page: String(page + 1) })}>Trang sau →</button></div>
      </>}
    </section><p className="ai-footnote">AI có thể trả lời sai. Hãy đối chiếu nội dung quan trọng với tài liệu hoặc giáo viên. Trò chuyện không tăng streak.</p>
  </main>
}
function ConversationContent({ id }: { id: string }) {
  const path = '/ai/conversations/' + encodeURIComponent(id)
  const detail = useResource<ConversationDetail>(path), status = useAiStatus()
  const [question, setQuestion] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [uncertain, setUncertain] = useState<SendInput | null>(null), [confirmDelete, setConfirmDelete] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false), [title, setTitle] = useState('')
  const navigate = useNavigate()
  const pending = detail.data?.turns.some(t => t.status === 'PENDING') ?? false
  const full = (detail.data?.turns.length ?? 0) >= (status.data?.maxTurnsPerConversation ?? 20)
  useEffect(() => {
    if (!pending) return
    const timer = window.setTimeout(detail.reload, 2500)
    return () => window.clearTimeout(timer)
  }, [pending, detail.data, detail.reload])
  async function send(input: SendInput) {
    if (busy || pending) return
    setBusy(true); setError(''); setQuestion(input.question)
    try {
      await mutate<AiTurn>('POST', path + '/turns', input)
      setQuestion(''); setUncertain(null); detail.reload(); status.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kết nối bị gián đoạn. Câu hỏi vẫn được giữ để kiểm tra và gửi lại.')
      setUncertain(e instanceof ApiError && e.status < 500 ? null : input)
      detail.reload(); status.reload()
    } finally { setBusy(false) }
  }
  async function submit() {
    if (uncertain) {
      setBusy(true); setError('')
      try {
        const current = await get<ConversationDetail>(path)
        if (current.turns.some(t => t.requestId === uncertain.requestId)) { setUncertain(null); setQuestion(''); detail.reload(); status.reload(); return }
      } catch (e) { setError(e instanceof Error ? e.message : 'Chưa kiểm tra được kết quả.'); return }
      finally { setBusy(false) }
      await send(uncertain)
    } else await send({ requestId: crypto.randomUUID(), question: question.trim() })
  }
  async function rename() {
    if (busy || !title.trim()) return
    setBusy(true); setError('')
    try { await mutate('PATCH', path, { title: title.trim() }); setEditingTitle(false); detail.reload() }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa đổi được tên hội thoại.') }
    finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true); setError('')
    try { await mutate('DELETE', path); navigate('/ai', { replace: true }) }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa xóa được hội thoại.') }
    finally { setBusy(false) }
  }
  const disabled = busy || pending || detail.loading || !!detail.error || !status.data?.available || status.data.remainingToday === 0 || full
  return <main className="study-page ai-page"><Link className="study-back" to="/ai">← Hội thoại của tôi</Link>
    {detail.loading && <LoadingState label="Đang tải hội thoại…" />}
    {detail.error && <p role="alert">{detail.error} <button onClick={detail.reload}>Thử lại</button></p>}
    {status.error && <p role="alert">{status.error} <button onClick={status.reload}>Thử lại</button></p>}
    {detail.data && <><header className="study-heading"><p className="study-eyebrow">AI TUTOR · GEMINI</p><h1>{detail.data.conversation.title}</h1><p>{aiModes[detail.data.conversation.mode ?? 'EXPLAIN'].label}</p>
      {detail.data.conversation.lessonId && <Link to={'/lessons/' + detail.data.conversation.lessonId}>Mở bài học liên quan</Link>}
      <p>AI dùng nội dung bài được lưu lúc tạo hội thoại và tối đa 3 lượt trao đổi gần nhất.</p></header>
      {editingTitle && <form onSubmit={e => { e.preventDefault(); void rename() }}><label>Tên hội thoại<input value={title} maxLength={120} required readOnly={busy} onChange={e => setTitle(e.target.value)} /></label><button disabled={busy || !title.trim()}>Lưu tên</button><button type="button" disabled={busy} onClick={() => setEditingTitle(false)}>Hủy</button></form>}
      <div className="ai-toolbar"><button disabled={busy} onClick={() => { setTitle(detail.data!.conversation.title); setEditingTitle(true) }}>Đổi tên</button><Link to="/ai">Hội thoại mới</Link><button disabled={busy} onClick={() => { detail.reload(); status.reload() }}>Cập nhật</button><button disabled={busy || pending} onClick={() => setConfirmDelete(true)}>Xóa hội thoại</button></div>
      {confirmDelete && <div className="ai-delete" role="alert"><p>Xóa vĩnh viễn câu hỏi và câu trả lời của hội thoại này khỏi ứng dụng? Hạn mức đã dùng không được hoàn lại.</p><button disabled={busy} onClick={() => void remove()}>Xác nhận xóa</button><button disabled={busy} onClick={() => setConfirmDelete(false)}>Hủy</button></div>}
      <ChatTranscript turns={detail.data.turns} busy={disabled || !!uncertain} onRetry={t => void send({ requestId: crypto.randomUUID(), question: t.question, retryOf: t.id })} />
    </>}
    {status.data && <Availability status={status.data} />}
    {full && <p>Hội thoại đã đủ lượt. <Link to="/ai">Bắt đầu hội thoại mới</Link> để tiếp tục.</p>}
    {error && <p className="study-error" role="alert">{error}</p>}
    <ChatComposer mode={detail.data?.conversation.mode ?? 'EXPLAIN'} value={question} onChange={setQuestion} onSubmit={() => void submit()} disabled={uncertain ? busy || detail.loading || !!detail.error : disabled} busy={busy} uncertain={!!uncertain} />
    <p className="ai-footnote">Câu hỏi và ngữ cảnh sẽ gửi tới Google Gemini. AI có thể sai; tránh chia sẻ thông tin nhạy cảm. Mỗi lần thử lại cũng tính vào hạn mức.</p>
  </main>
}
