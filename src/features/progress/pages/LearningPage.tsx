import { LoadingState } from '../../../shared/components/LoadingState'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { learningApi } from '../api/learningApi'
import type { LearningRecord } from '../api/learningApi'
import { lessonApi } from '../../lesson/api/lessonApi'
import type { LessonSummary } from '../../lesson/types/lesson.types'
import { Link } from 'react-router-dom'
import '../../../shared/styles/study.css'
import './learning.css'
import { useAuth } from '../../../app/providers/AuthContext'
import { readNoteDraft, writeNoteDraft, removeNoteDraft } from '../noteDrafts'

function RecordEditor({ record, title, available, onSave }: { record: LearningRecord; title: string; available: boolean; onSave: (r: LearningRecord) => void }) {
  const { user } = useAuth()
  const owner = user!.id
  const [note, setNote] = useState(() => readNoteDraft(owner, record.id) ?? record.note)
  const dirty = note !== record.note
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setSaved(false)
    try { onSave(await learningApi.update(record.id, note)); removeNoteDraft(owner, record.id); setSaved(true) }
    catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được.') }
    finally { setBusy(false) }
  }
  return <article className="study-record"><div className="record-heading"><h2>{available ? <Link to={`/lessons/${record.lessonId}`}>{title}</Link> : title}</h2><span className={record.completedAt ? 'record-badge completed' : 'record-badge'}>{record.completedAt ? 'Đã hoàn thành' : 'Đang học'}</span></div>
    {available && <Link className="study-primary" to={'/lessons/' + record.lessonId}>{record.completedAt ? 'Ôn lại bài học' : 'Tiếp tục học'} →</Link>}
    {!available && <p>Bài học tạm ẩn. Kết quả và ghi chú của bạn vẫn được giữ lại.</p>}
    {record.completedAt && <p className="study-completed">Đã hoàn thành · {new Date(record.completedAt).toLocaleDateString('vi-VN')}</p>}<details className="record-notes" open={dirty || undefined}><summary>Ghi chú riêng{dirty ? ' · Chưa lưu' : record.note ? ' · Đã có ghi chú' : ''}</summary><form onSubmit={submit}>
    <label>Ghi chú riêng<textarea disabled={busy} value={note} onChange={e => { setNote(e.target.value); setSaved(false); if(e.target.value === record.note) removeNoteDraft(owner,record.id); else writeNoteDraft(owner,record.id,e.target.value) }} maxLength={2000} /></label>
    <p className="study-hint">{note.length}/2000 ký tự. Bản nháp giữ tối đa 30 phút trong tab này khi đăng nhập lại cùng tài khoản; tải lại hoặc đóng tab sẽ mất bản nháp.</p><button disabled={busy || !dirty}>{busy ? 'Đang lưu…' : 'Lưu ghi chú'}</button>
  </form></details>{saved && <p role="status">Đã lưu ghi chú.</p>}{error && <p role="alert">{error}</p>}</article>
}

export function LearningPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [records, setRecords] = useState<LearningRecord[]>([])
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([learningApi.list(controller.signal), lessonApi.list(controller.signal)])
      .then(([r, l]) => { if (!controller.signal.aborted) { setRecords(r); setLessons(l) } })
      .catch(e => { if (!controller.signal.aborted) setLoadError(e instanceof Error ? e.message : 'Không tải được dữ liệu.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry])
  const completed = records.filter(record => record.completedAt).length
  const normalize = (text: string) => text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g,'d')
  const visible = records.filter(record => (filter === 'all' || (filter === 'completed' ? !!record.completedAt : !record.completedAt)) && normalize(lessons.find(lesson => lesson.id === record.lessonId)?.title ?? 'Bài ' + record.lessonId).includes(normalize(query.trim())))
  const available = lessons.filter(l => !records.some(r => r.lessonId === l.id))
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setBusy(true); setError('')
    try {
      const record = await learningApi.create(Number(form.get('lessonId')), String(form.get('note')))
      setRecords(r => [...r, record]); formElement.reset()
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được bài học.') }
    finally { setBusy(false) }
  }
  if (loading) return <main className="study-page"><LoadingState label="Đang tải dữ liệu học…" /></main>
  if (loadError) return <main className="study-page"><p role="alert">{loadError}</p><button onClick={() => { setLoading(true); setLoadError(''); setRetry(r => r + 1) }}>Thử lại</button></main>
  return <main className="study-page"><header className="study-heading"><p className="study-eyebrow">GÓC HỌC TẬP CỦA BẠN</p><h1>Bài học của tôi</h1><p>Tiếp tục bài đang học, ôn lại kiến thức và giữ ghi chú riêng.</p><div className="learning-counts"><span><strong>{records.length - completed}</strong> đang học</span><span><strong>{completed}</strong> đã hoàn thành</span><Link to="/courses">Khám phá khóa học →</Link></div></header>
    <section className="learning-filters" aria-label="Lọc bài đã lưu"><label>Tìm bài đã lưu<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nhập tên bài học…" /></label><label>Trạng thái<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả ({records.length})</option><option value="started">Đang học ({records.length - completed})</option><option value="completed">Đã hoàn thành ({completed})</option></select></label></section>
    <p role="status" className="study-count">{visible.length} bài phù hợp</p>
    {available.length > 0 && <details className="learning-add"><summary>Lưu thêm bài học</summary><form onSubmit={create}>
      <label>Bài học<select name="lessonId">{available.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
      <label>Ghi chú ban đầu<textarea name="note" maxLength={2000} /></label>
      <button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu bài học'}</button>
      {error && <p role="alert">{error}</p>}
    </form></details>}
    {records.length === 0 ? <section className="study-empty"><h2>Bắt đầu bộ bài học của bạn</h2><p>Mở một bài và chọn “Lưu vào bài đang học” để dễ tiếp tục lần sau.</p><Link className="study-primary" to="/lessons">Chọn bài học →</Link></section> : visible.length === 0 && <section className="study-empty"><h2>Không có bài phù hợp</h2><button onClick={() => {setQuery('');setFilter('all')}}>Xóa bộ lọc</button></section>}
    {visible.map(r => <RecordEditor key={r.id} record={r} available={lessons.some(l => l.id === r.lessonId)} title={lessons.find(l => l.id === r.lessonId)?.title ?? 'Bài ' + r.lessonId}
      onSave={updated => setRecords(previous => previous.map(item => item.id === updated.id ? updated : item))} />)}
  </main>
}
