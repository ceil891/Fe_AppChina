import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import '../admin-quiz.css'

interface Question { type: string; prompt: string; options: string[]; correctIndex: number; explanation: string }
interface Summary { id: number; title: string; description: string; published: boolean; version: number; questionCount: number }
interface Detail extends Omit<Summary, 'questionCount'> { questions: Question[] }
const blankQuestion = (): Question => ({ type: 'CHOOSE_MEANING', prompt: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })

export function AdminQuizzesPage() {
  const { user } = useAuth()
  const allowed = can(user, 'quizzes.read')
  const { data, error, reload } = useResource<Summary[]>(allowed ? '/admin/quizzes' : null)
  const [search, setSearch] = useState('')
  if (!allowed) return <main className="admin-page"><h1>Bạn không có quyền xem bộ đề.</h1></main>
  return <main className="admin-page admin-quiz"><h1>Quản lý Quiz</h1><p>Soạn bộ đề nháp, kiểm tra đáp án rồi xuất bản cho người học.</p>
    {can(user, 'quizzes.create') && <Link to="/admin/quizzes/new">Tạo bộ đề</Link>}
    <label>Tìm bộ đề<input value={search} onChange={e => setSearch(e.target.value)} /></label>
    {error && <p role="alert">{error} <button onClick={reload}>Thử lại</button></p>}
    {!data && !error && <p role="status">Đang tải…</p>}
    {data && <ul>{data.filter(s => s.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(s => <li key={s.id}>
      <Link to={`/admin/quizzes/${s.id}`}>{s.title}</Link> — {s.questionCount} câu · {s.published ? 'Đã xuất bản' : 'Bản nháp'}
    </li>)}</ul>}
    {data?.length === 0 && <p>Chưa có bộ đề. Tạo bộ đề đầu tiên để bắt đầu.</p>}
  </main>
}

export function AdminQuizEditorPage({ create = false }: { create?: boolean }) {
  const { id } = useParams()
  const { user } = useAuth()
  const allowed = can(user, 'quizzes.read') && (!create || can(user, 'quizzes.create'))
  const { data, error, reload } = useResource<Detail>(allowed && !create ? `/admin/quizzes/${id}` : null)
  if (!allowed) return <main className="admin-page"><h1>Bạn không có quyền xem trang này.</h1></main>
  if (create) return <QuizEditor key="new" initial={{ id: 0, title: '', description: '', published: false, version: 0, questions: [] }} />
  if (error) return <main className="admin-page"><p role="alert">{error}</p><button onClick={reload}>Tải lại</button></main>
  return data ? <QuizEditor key={`${data.id}:${data.version}`} initial={data} /> : <main className="admin-page" role="status">Đang tải…</main>
}

function QuizEditor({ initial }: { initial: Detail }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(initial)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [questions, setQuestions] = useState(initial.questions)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const editable = !saved.published && can(user, saved.id ? 'quizzes.update' : 'quizzes.create')
  const dirty = title !== saved.title || description !== saved.description || JSON.stringify(questions) !== JSON.stringify(saved.questions)
  function change(index: number, patch: Partial<Question>) { setQuestions(qs => qs.map((q, i) => i === index ? { ...q, ...patch } : q)) }
  async function save() {
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await mutate<Detail>(saved.id ? 'PUT' : 'POST', `/admin/quizzes${saved.id ? '/' + saved.id : ''}`, { title, description, version: saved.version, questions })
      setSaved(result); setTitle(result.title); setDescription(result.description); setQuestions(result.questions); setNotice('Đã lưu bộ đề nháp.')
      if (!saved.id) navigate(`/admin/quizzes/${result.id}`, { replace: true })
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được bộ đề.') }
    finally { setBusy(false) }
  }
  async function publication() {
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await mutate<Detail>('PATCH', `/admin/quizzes/${saved.id}/publication`, { version: saved.version, published: !saved.published })
      setSaved(result); setNotice(result.published ? 'Đã xuất bản cho người học.' : 'Đã chuyển về bản nháp.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Không đổi được trạng thái.') }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!window.confirm('Xóa bộ đề nháp này? Lịch sử làm bài của người học vẫn được giữ.')) return
    setBusy(true); setError('')
    try { await mutate<void>('DELETE', `/admin/quizzes/${saved.id}?version=${saved.version}`); navigate('/admin/quizzes') }
    catch (e) { setError(e instanceof Error ? e.message : 'Không xóa được bộ đề.'); setBusy(false) }
  }
  return <main className="admin-page admin-quiz"><Link to="/admin/quizzes">← Danh sách bộ đề</Link><h1>{saved.id ? 'Biên tập Quiz' : 'Tạo bộ đề Quiz'}</h1>
    <p>{saved.published ? 'Đã xuất bản. Gỡ xuất bản để biên tập.' : 'Bản nháp. Cần ít nhất 5 câu hỏi để xuất bản.'}</p>
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    <form onSubmit={e => { e.preventDefault(); void save() }}>
      <fieldset disabled={!editable || busy}><legend>Nội dung bộ đề</legend>
        <label>Tiêu đề<input required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label>Mô tả<textarea required maxLength={500} value={description} onChange={e => setDescription(e.target.value)} /></label>
        {questions.map((q, i) => <fieldset key={i}><legend>Câu {i + 1}</legend>
          <label>Loại câu<select value={q.type} onChange={e => change(i, { type: e.target.value })}><option value="CHOOSE_MEANING">Chọn nghĩa</option><option value="CHOOSE_WORD">Chọn từ</option></select></label>
          <label>Câu hỏi<textarea required maxLength={500} value={q.prompt} onChange={e => change(i, { prompt: e.target.value })} /></label>
          {q.options.map((option, j) => <label key={j}>Lựa chọn {j + 1}<input required maxLength={500} value={option} onChange={e => change(i, { options: q.options.map((o, k) => k === j ? e.target.value : o) })} /></label>)}
          <label>Đáp án đúng<select value={q.correctIndex} onChange={e => change(i, { correctIndex: Number(e.target.value) })}>{[0, 1, 2, 3].map(j => <option key={j} value={j}>Lựa chọn {j + 1}</option>)}</select></label>
          <label>Giải thích<textarea required maxLength={1500} value={q.explanation} onChange={e => change(i, { explanation: e.target.value })} /></label>
          {editable && <button type="button" onClick={() => setQuestions(qs => qs.filter((_, index) => index !== i))}>Bỏ câu {i + 1}</button>}
        </fieldset>)}
        {editable && <><button type="button" disabled={questions.length >= 100} onClick={() => setQuestions(qs => [...qs, blankQuestion()])}>Thêm câu hỏi</button><button type="submit">{busy ? 'Đang lưu…' : 'Lưu bản nháp'}</button></>}
      </fieldset>
    </form>
    {dirty && <p role="status">Có thay đổi chưa lưu. Lưu bản nháp trước khi xuất bản.</p>}
    {saved.id > 0 && can(user, 'quizzes.publish') && <button disabled={busy || dirty || (!saved.published && saved.questions.length < 5)} onClick={() => void publication()}>{saved.published ? 'Gỡ xuất bản' : 'Xuất bản'}</button>}
    {saved.id > 0 && !saved.published && can(user, 'quizzes.delete') && <button disabled={busy} onClick={() => void remove()}>Xóa bộ đề</button>}
  </main>
}
