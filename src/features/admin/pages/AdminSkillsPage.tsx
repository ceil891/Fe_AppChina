import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import { skillNames } from '../../skills/types'
import type { Skill } from '../../skills/types'
import '../admin-quiz.css'
import '../management.css'

interface Item { id?: string; prompt: string; text: string; hint: string; options: string[]; accepted: string[]; explanation: string; audioSrc: string }
interface Detail { exercise: { id: string; skill: Skill; title: string; description: string; questions: Item[] }; published: boolean; version: number }
interface Results { items: { id: string; userId: string; displayName: string; title: string; score: number | null; submittedAt: string }[]; total: number; page: number; size: number }
const validSkill = (value?: string): value is Skill => !!value && Object.hasOwn(skillNames, value)
const blank = (skill: Skill): Item => ({ prompt: '', text: '', hint: '', options: ['LISTENING', 'READING'].includes(skill) ? ['', '', '', ''] : [], accepted: skill === 'SPEAKING' ? [] : [''], explanation: '', audioSrc: '' })
function SkillTabs() { return <nav className="management-actions" aria-label="Quản lý từng kỹ năng">{(Object.keys(skillNames) as Skill[]).map(skill => <NavLink key={skill} to={`/admin/skills/${skill}`}>{skillNames[skill]}</NavLink>)}</nav> }

export function AdminSkillsPage() {
  const { skill } = useParams(), { user } = useAuth()
  const allowed = can(user, 'skills.read') && validSkill(skill)
  const result = useResource<Detail[]>(allowed ? `/admin/skills/${skill}` : null)
  const [search, setSearch] = useState(''), [status, setStatus] = useState('')
  if (!allowed) return <main className="admin-page"><h1>Không có quyền hoặc kỹ năng không hợp lệ.</h1></main>
  const visible = result.data?.filter(d => d.exercise.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (!status || String(d.published) === status))
  return <main className="admin-page admin-quiz"><SkillTabs /><h1>Quản lý kỹ năng {skillNames[skill]}</h1>
    <p>Tạo bài luyện, biên tập nội dung và xuất bản cho học viên. Ẩn bài trước khi chỉnh sửa; lịch sử đã làm được giữ nguyên.</p>
    {can(user, 'skills.create') && <Link className="admin-link-primary" to={`/admin/skills/${skill}/new`}>+ Tạo bài {skillNames[skill]}</Link>}
    <div className="admin-toolbar"><label>Tìm bài<input type="search" value={search} onChange={e => setSearch(e.target.value)} /></label><label>Trạng thái<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả</option><option value="true">Đang xuất bản</option><option value="false">Nháp / đã ẩn</option></select></label><button onClick={result.reload}>Tải lại</button></div>
    {result.loading && <p role="status">Đang tải bài luyện…</p>}{result.error && <p role="alert">{result.error}</p>}
    <ul>{visible?.map(d => <li key={d.exercise.id}><Link to={`/admin/skills/${skill}/${d.exercise.id}`}>{d.exercise.title}</Link><p>{d.exercise.description}</p><small>{d.exercise.questions.length} câu · {d.published ? 'Đang xuất bản' : 'Nháp / đã ẩn'}</small></li>)}</ul>
    {!result.loading && !result.error && visible?.length === 0 && <p>Không có bài phù hợp.</p>}
  </main>
}

export function AdminSkillEditorPage({ create = false }: { create?: boolean }) {
  const { skill, id } = useParams(), { user } = useAuth()
  const allowed = validSkill(skill) && can(user, 'skills.read') && (!create || can(user, 'skills.create'))
  const result = useResource<Detail>(allowed && !create ? `/admin/skills/${skill}/${id}` : null)
  if (!allowed) return <main className="admin-page"><h1>Không có quyền hoặc kỹ năng không hợp lệ.</h1></main>
  if (create) return <SkillEditor key={skill} initial={{ exercise: { id: '', skill, title: '', description: '', questions: [blank(skill)] }, published: false, version: 0 }} />
  if (result.error) return <main className="admin-page"><p role="alert">{result.error}</p><button onClick={result.reload}>Thử lại</button></main>
  return result.data ? <SkillEditor key={`${result.data.exercise.id}:${result.data.version}`} initial={result.data} /> : <main className="admin-page" role="status">Đang tải…</main>
}

export function SkillEditor({ initial }: { initial: Detail }) {
  const { user } = useAuth(), navigate = useNavigate()
  const [saved, setSaved] = useState(initial), [exercise, setExercise] = useState(initial.exercise)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const { skill, id } = exercise, base = `/admin/skills/${skill}`
  const editable = !saved.published && can(user, id ? 'skills.update' : 'skills.create')
  const dirty = JSON.stringify(exercise) !== JSON.stringify(saved.exercise)
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  function change(index: number, patch: Partial<Item>) { setExercise(previous => ({ ...previous, questions: previous.questions.map((q, i) => i === index ? { ...q, ...patch } : q) })) }
  async function save() {
    setBusy(true); setError(''); setNotice('')
    try {
      const questions = exercise.questions.map(({ prompt, text, hint, options, accepted, explanation, audioSrc }) => ({ prompt, text, hint, options, accepted, explanation, audioSrc }))
      const result = await mutate<Detail>(id ? 'PUT' : 'POST', base + (id ? '/' + id : ''), { title: exercise.title, description: exercise.description, questions, version: saved.version })
      setSaved(result); setExercise(result.exercise); setNotice('Đã lưu bản nháp.')
      if (!id) navigate(`${base}/${result.exercise.id}`, { replace: true })
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được bài.') } finally { setBusy(false) }
  }
  async function publish() {
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await mutate<Detail>('PATCH', `${base}/${id}/publication`, { version: saved.version, published: !saved.published })
      setSaved(result); setExercise(result.exercise); setNotice(result.published ? 'Đã xuất bản cho học viên.' : 'Đã ẩn bài. Bạn có thể sửa nội dung.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Không đổi được trạng thái.') } finally { setBusy(false) }
  }
  return <main className="admin-page admin-quiz"><Link to={base} onClick={e => { if (dirty && !window.confirm('Rời trang và bỏ thay đổi chưa lưu?')) e.preventDefault() }}>← Danh sách bài {skillNames[skill]}</Link><h1>{id ? 'Biên tập' : 'Tạo bài'} {skillNames[skill]}</h1>
    <p>{saved.published ? 'Đang xuất bản. Ẩn bài để sửa nội dung.' : 'Nháp / đã ẩn. Lưu bài rồi xuất bản để học viên nhìn thấy.'}</p>
    {skill === 'SPEAKING' && <p>Bài Nói dùng tự đánh giá sau khi thu âm và nghe lại; chưa chấm phát âm tự động.</p>}
    {error && <p role="alert">{error} Giữ lại nội dung đang nhập; nếu có xung đột phiên bản, hãy sao chép nội dung rồi tải lại trang.</p>}{notice && <p role="status">{notice}</p>}
    <form onSubmit={e => { e.preventDefault(); void save() }}><fieldset disabled={!editable || busy}><legend>Nội dung bài luyện</legend>
      <label>Tiêu đề<input required maxLength={160} value={exercise.title} onChange={e => setExercise({ ...exercise, title: e.target.value })} /></label>
      <label>Mô tả<textarea required maxLength={500} value={exercise.description} onChange={e => setExercise({ ...exercise, description: e.target.value })} /></label>
      {exercise.questions.map((q, i) => <fieldset key={i}><legend>Câu {i + 1}</legend>
        <label>Đề bài / hướng dẫn<textarea required maxLength={500} value={q.prompt} onChange={e => change(i, { prompt: e.target.value })} /></label>
        {skill !== 'WRITING' && <label>{skill === 'READING' ? 'Đoạn văn tiếng Trung' : 'Lời đọc tiếng Trung'}<textarea required maxLength={4000} lang="zh-CN" value={q.text} onChange={e => change(i, { text: e.target.value })} /></label>}
        <label>Gợi ý / Pinyin<textarea maxLength={1000} value={q.hint} onChange={e => change(i, { hint: e.target.value })} /></label>
        {['LISTENING', 'SPEAKING'].includes(skill) && <><label>Liên kết âm thanh mẫu<input required maxLength={1000} placeholder="https://…/audio.mp3" value={q.audioSrc} onChange={e => change(i, { audioSrc: e.target.value })} /></label><p>Dùng liên kết HTTPS phát trực tiếp hoặc giữ file mẫu có sẵn. Nghe thử và kiểm tra âm thanh khớp với lời đọc trước khi xuất bản.</p></>}
        {q.options.map((option, j) => <label key={j}>Lựa chọn {j + 1}<input required maxLength={500} value={option} onChange={e => { const options = q.options.map((o, k) => k === j ? e.target.value : o); change(i, { options, accepted: q.accepted[0] === option ? [e.target.value] : q.accepted }) }} /></label>)}
        {q.options.length > 0 && <label>Đáp án đúng<select required value={q.accepted[0] || ''} onChange={e => change(i, { accepted: [e.target.value] })}><option value="" disabled>Chọn đáp án</option>{q.options.map((o, j) => <option key={j} value={o}>{j + 1}. {o || '(chưa nhập)'}</option>)}</select></label>}
        {skill === 'WRITING' && <label>Đáp án chấp nhận (mỗi dòng một đáp án, tối đa 10)<textarea required value={q.accepted.join('\n')} onChange={e => change(i, { accepted: e.target.value.split('\n') })} /></label>}
        <label>{skill === 'SPEAKING' ? 'Tiêu chí tự đánh giá' : 'Giải thích đáp án'}<textarea required maxLength={1500} value={q.explanation} onChange={e => change(i, { explanation: e.target.value })} /></label>
        {editable && <button type="button" disabled={exercise.questions.length <= 1} onClick={() => setExercise({ ...exercise, questions: exercise.questions.filter((_, index) => index !== i) })}>Bỏ câu {i + 1}</button>}
      </fieldset>)}
      {editable && <><button type="button" disabled={exercise.questions.length >= 20} onClick={() => setExercise({ ...exercise, questions: [...exercise.questions, blank(skill)] })}>Thêm câu hỏi</button><button type="submit">{busy ? 'Đang lưu…' : 'Lưu bản nháp'}</button></>}
    </fieldset></form>
    {['LISTENING', 'SPEAKING'].includes(skill) && <section aria-label="Nghe thử âm thanh"><h2>Nghe thử âm thanh mẫu</h2>{exercise.questions.map((q, i) => q.audioSrc && /^(https:\/\/|\/audio\/skills\/)/.test(q.audioSrc) ? <div key={`${i}:${q.audioSrc}`}><p>Câu {i + 1}</p><audio controls preload="none" src={q.audioSrc} aria-label={`Nghe thử câu ${i + 1}`} /></div> : null)}</section>}
    {dirty && <p role="status">Có thay đổi chưa lưu. Lưu bản nháp trước khi xuất bản hoặc rời trang.</p>}
    {id && can(user, 'skills.publish') && <button disabled={busy || dirty} onClick={() => void publish()}>{saved.published ? 'Ẩn bài' : 'Xuất bản'}</button>}
    {id && can(user, 'users.read') && can(user, 'users.skills.read') && <ExerciseResults key={id} base={`${base}/${id}`} speaking={skill === 'SPEAKING'} />}
  </main>
}

function ExerciseResults({ base, speaking }: { base: string; speaking: boolean }) {
  const [page, setPage] = useState(0), result = useResource<Results>(`${base}/results?page=${page}&size=20`)
  return <section aria-label="Kết quả học viên"><h2>Kết quả học viên</h2><p>Lịch sử các lượt đã nộp, bao gồm phiên bản nội dung trước đây.</p><button onClick={result.reload}>Cập nhật kết quả</button>
    {result.loading && <p role="status">Đang tải kết quả…</p>}{result.error && <p role="alert">{result.error}</p>}
    {result.data && <><p>{result.data.total} lượt đã nộp</p><ul>{result.data.items.map(r => <li key={r.id}><Link to={`/admin/users/${r.userId}/skills?attempt=${r.id}`}>{r.displayName} — Xem chi tiết</Link><p>{r.title} · {speaking ? 'Tự đánh giá' : r.score == null ? 'Chưa có điểm' : `${r.score}/100`} · {new Date(r.submittedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p></li>)}</ul>
      <button disabled={page === 0 || result.loading} onClick={() => setPage(p => p - 1)}>Trang trước</button><span>Trang {page + 1}</span><button disabled={(page + 1) * 20 >= result.data.total || result.loading} onClick={() => setPage(p => p + 1)}>Trang sau</button></>}
  </section>
}
