import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import type { Content, EditorialDetail } from '../../foundations/types'
import audio from '../../foundations/audio.json'
import '../foundation-editor.css'

const blank: Content = { slug: '', title: '', subtitle: '', minutes: 10, symbol: '拼', toneChart: false,
  sections: [{ title: '', text: '' }], groups: [], examples: [{ symbol: '', pinyin: '', hanzi: '', meaning: '', tip: '', audioSrc: '/audio/foundations/ma1.mp3' }],
  questions: [{ prompt: '', options: ['', ''], correct: 0, explanation: '' }] }
const message = (e: unknown) => e instanceof Error ? e.message : 'Không lưu được. Hãy thử lại.'

export function AdminFoundationsPage() {
  const { user } = useAuth()
  const resource = useResource<EditorialDetail[]>('/admin/foundations')
  return <main className="admin-page foundation-management"><header><p className="study-eyebrow">QUẢN LÝ NỘI DUNG</p><h1>Bài nhập môn Pinyin</h1><p>Biên tập bài đọc, bảng âm, ví dụ nghe và câu tự kiểm tra. Bản nháp chỉ hiển thị trong khu quản lý.</p>{can(user, 'foundations.create') && <Link className="study-primary" to="/admin/foundations/new">+ Thêm bài nhập môn</Link>}</header>
    {resource.loading ? <p role="status">Đang tải bài nhập môn…</p> : resource.error ? <p role="alert">{resource.error} <button onClick={resource.reload}>Thử lại</button></p> : <div className="foundation-admin-list">{resource.data?.map(item => <article key={item.content.slug}><div><small>THỨ TỰ {item.position} · {item.published ? 'ĐÃ XUẤT BẢN' : 'BẢN NHÁP / ĐÃ ẨN'}</small><h2>{item.content.title}</h2><p>{item.content.subtitle}</p><span>{item.content.sections.length} phần · {item.content.questions.length} câu hỏi</span></div><Link to={`/admin/foundations/${item.content.slug}`}>Xem / Biên tập →</Link></article>)}{resource.data?.length === 0 && <p>Chưa có bài nhập môn. Hãy tạo bài đầu tiên.</p>}</div>}
  </main>
}

export function AdminFoundationEditorPage({ create = false }: { create?: boolean }) {
  const { slug } = useParams()
  const [notice, setNotice] = useState('')
  const resource = useResource<EditorialDetail>(create ? null : `/admin/foundations/${encodeURIComponent(slug ?? '')}`)
  const reload = (text?: string) => { setNotice(text ?? ''); resource.reload() }
  return <main className="admin-page foundation-management"><Link to="/admin/foundations">← Danh sách bài nhập môn</Link><h1>{create ? 'Thêm bài nhập môn' : 'Biên tập bài nhập môn'}</h1>
    {notice && <p role="status">{notice}</p>}
    {create ? <FoundationEditor key="new" initial={{ content: blank, position: 7, version: 0, published: false }} create onReload={reload} /> : resource.loading ? <p role="status">Đang tải nội dung…</p> : resource.error ? <p role="alert">{resource.error} <button onClick={resource.reload}>Thử lại</button></p> : resource.data && <FoundationEditor key={`${slug}-${resource.data.version}`} initial={resource.data} onReload={reload} />}
  </main>
}

export function FoundationEditor({ initial, create = false, onReload }: { initial: EditorialDetail; create?: boolean; onReload: (message?: string) => void }) {
  const { user } = useAuth(), navigate = useNavigate()
  const [content, setContent] = useState<Content>(() => structuredClone(initial.content))
  const [position, setPosition] = useState(initial.position)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [preview, setPreview] = useState(false)
  const sending = useRef(false)
  const editable = !initial.published && can(user, create ? 'foundations.create' : 'foundations.update')
  const dirty = position !== initial.position || JSON.stringify(content) !== JSON.stringify(initial.content)
  const change = <K extends keyof Content>(key: K, value: Content[K]) => setContent(current => ({ ...current, [key]: value }))
  async function save() {
    if (sending.current || !editable) return
    sending.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const saved = await mutate<EditorialDetail>(create ? 'POST' : 'PUT', create ? '/admin/foundations' : `/admin/foundations/${initial.content.slug}`, { content, position, version: initial.version })
      if (create) navigate(`/admin/foundations/${saved.content.slug}`, { replace: true })
      else onReload('Đã lưu bản nháp thành công.')
    } catch (e) { setError(message(e)) } finally { sending.current = false; setBusy(false) }
  }
  async function publish() {
    if (sending.current || dirty || !can(user, 'foundations.publish')) return
    if (initial.published && !window.confirm('Gỡ xuất bản bài này? Học viên tạm thời không mở được bài; kết quả đã lưu vẫn được giữ.')) return
    sending.current = true; setBusy(true); setError('')
    try { await mutate('PATCH', `/admin/foundations/${initial.content.slug}/publication`, { version: initial.version, published: !initial.published }); onReload(initial.published ? 'Đã gỡ xuất bản; kết quả học viên vẫn được giữ.' : 'Đã xuất bản bài cho học viên.') }
    catch (e) { setError(message(e)) } finally { sending.current = false; setBusy(false) }
  }
  return <><div className="foundation-editor-toolbar"><strong>{initial.published ? 'Đã xuất bản · Gỡ xuất bản để sửa' : 'Bản nháp / Đã ẩn'}</strong><button onClick={() => setPreview(!preview)}>{preview ? 'Ẩn xem trước' : 'Xem trước nội dung'}</button>
    {!create && can(user, 'foundations.publish') && <button disabled={busy || dirty} onClick={() => void publish()}>{initial.published ? 'Gỡ xuất bản' : 'Xuất bản bài'}</button>}
    {!create && <button disabled={busy} onClick={() => { if (!dirty || window.confirm('Bỏ các thay đổi chưa lưu và tải lại?')) onReload() }}>Tải lại bản đã lưu</button>}
  </div>{dirty && <p role="status">Có thay đổi chưa lưu. Hãy lưu trước khi xuất bản.</p>}{error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {preview && <section className="foundation-editor-preview"><h2>{content.title || 'Chưa có tiêu đề'}</h2><p>{content.subtitle}</p>{content.sections.map((s, i) => <div key={i}><h3>{s.title}</h3><p>{s.text}</p></div>)}{content.groups.map((g, i) => <div key={i}><h3>{g.title}</h3><p>{g.sounds}</p><p>{g.note}</p></div>)}{content.examples.map((e, i) => <p key={i}>{e.symbol} · {e.pinyin} · {e.hanzi} · {e.meaning}<br />{e.tip}</p>)}<h3>Câu tự kiểm tra</h3>{content.questions.map((q, i) => <div key={i}><strong>{q.prompt}</strong><p>{q.options.join(' / ')}</p><p>Đáp án: {q.options[q.correct]} · {q.explanation}</p></div>)}</section>}
    <form className="foundation-editor" onSubmit={e => { e.preventDefault(); void save() }}><fieldset disabled={!editable || busy}><legend>Thông tin bài</legend>
      <label>Đường dẫn (chữ thường, số, dấu gạch nối)<input required pattern="[a-z][a-z0-9-]{1,59}" maxLength={60} disabled={!create} value={content.slug} onChange={e => change('slug', e.target.value)} /></label>
      <label>Tiêu đề<input required maxLength={160} value={content.title} onChange={e => change('title', e.target.value)} /></label>
      <label>Mô tả ngắn<textarea required maxLength={500} value={content.subtitle} onChange={e => change('subtitle', e.target.value)} /></label>
      <div className="foundation-editor-columns"><label>Thứ tự<input type="number" required min={1} max={10000} value={position} onChange={e => setPosition(Number(e.target.value))} /></label><label>Số phút gợi ý<input type="number" required min={1} max={120} value={content.minutes} onChange={e => change('minutes', Number(e.target.value))} /></label><label>Ký hiệu trên thẻ<input required maxLength={20} value={content.symbol} onChange={e => change('symbol', e.target.value)} /></label></div>
      <label className="foundation-editor-checkbox"><input type="checkbox" checked={content.toneChart} onChange={e => change('toneChart', e.target.checked)} />Hiện sơ đồ 4 thanh điệu</label>
    </fieldset>
    <fieldset disabled={!editable || busy}><legend>Các phần bài đọc</legend>{content.sections.map((s, i) => <section className="foundation-editor-item" key={i}><h3>Phần {i + 1}</h3><label>Tiêu đề phần<input required maxLength={160} value={s.title} onChange={e => change('sections', content.sections.map((item, j) => j === i ? { ...item, title: e.target.value } : item))} /></label><label>Nội dung<textarea required maxLength={5000} value={s.text} onChange={e => change('sections', content.sections.map((item, j) => j === i ? { ...item, text: e.target.value } : item))} /></label><button type="button" disabled={content.sections.length <= 1} onClick={() => change('sections', content.sections.filter((_, j) => j !== i))}>Bỏ phần {i + 1}</button></section>)}<button type="button" disabled={content.sections.length >= 20} onClick={() => change('sections', [...content.sections, { title: '', text: '' }])}>+ Thêm phần bài đọc</button></fieldset>
    <fieldset disabled={!editable || busy}><legend>Bảng âm</legend>{content.groups.map((g, i) => <section className="foundation-editor-item" key={i}><h3>Nhóm âm {i + 1}</h3>{(['title', 'sounds', 'note'] as const).map(key => <label key={key}>{({ title: 'Tên nhóm', sounds: 'Các âm, cách nhau bằng khoảng trắng', note: 'Ghi chú' })[key]}<input required maxLength={key === 'title' ? 160 : key === 'sounds' ? 500 : 1000} value={g[key]} onChange={e => change('groups', content.groups.map((item, j) => j === i ? { ...item, [key]: e.target.value } : item))} /></label>)}<button type="button" onClick={() => change('groups', content.groups.filter((_, j) => j !== i))}>Bỏ nhóm âm {i + 1}</button></section>)}<button type="button" disabled={content.groups.length >= 20} onClick={() => change('groups', [...content.groups, { title: '', sounds: '', note: '' }])}>+ Thêm nhóm âm</button></fieldset>
    <fieldset disabled={!editable || busy}><legend>Ví dụ và âm thanh</legend><p>Chọn MP3 có sẵn hoặc nhập đường dẫn trong /audio/foundations/ hay /audio/skills/. Nghe thử trước khi xuất bản.</p><datalist id="foundation-audio-options">{Object.entries(audio).map(([word, path]) => <option key={word} value={path}>{word}</option>)}</datalist>
      {content.examples.map((example, i) => <section className="foundation-editor-item" key={i}><h3>Ví dụ {i + 1}</h3>{(['symbol', 'pinyin', 'hanzi', 'meaning', 'tip', 'audioSrc'] as const).map(key => <label key={key}>{({ symbol: 'Ký hiệu / âm', pinyin: 'Pinyin', hanzi: 'Chữ Hán', meaning: 'Nghĩa tiếng Việt', tip: 'Hướng dẫn đọc', audioSrc: 'Đường dẫn MP3' })[key]}<input required list={key === 'audioSrc' ? 'foundation-audio-options' : undefined} maxLength={key === 'symbol' ? 80 : key === 'tip' ? 1000 : key === 'audioSrc' ? 500 : key === 'meaning' ? 300 : 200} value={example[key]} onChange={e => change('examples', content.examples.map((item, j) => j === i ? { ...item, [key]: e.target.value } : item))} /></label>)}
        {/^\/audio\/(foundations|skills)\/[a-zA-Z0-9_-]+\.mp3$/.test(example.audioSrc) && <audio controls preload="none" src={example.audioSrc} aria-label={`Nghe thử ví dụ ${i + 1}`} />}<button type="button" disabled={content.examples.length <= 1} onClick={() => change('examples', content.examples.filter((_, j) => j !== i))}>Bỏ ví dụ {i + 1}</button>
      </section>)}<button type="button" disabled={content.examples.length >= 30} onClick={() => change('examples', [...content.examples, { ...blank.examples[0] }])}>+ Thêm ví dụ</button></fieldset>
    <fieldset disabled={!editable || busy}><legend>Câu tự kiểm tra</legend>{content.questions.map((question, i) => <section className="foundation-editor-item" key={i}><h3>Câu {i + 1}</h3><label>Câu hỏi<textarea required maxLength={500} value={question.prompt} onChange={e => change('questions', content.questions.map((item, j) => j === i ? { ...item, prompt: e.target.value } : item))} /></label>
      {question.options.map((option, k) => <label key={k}>Lựa chọn {k + 1}<input required maxLength={500} value={option} onChange={e => change('questions', content.questions.map((item, j) => j === i ? { ...item, options: item.options.map((o, n) => n === k ? e.target.value : o) } : item))} /></label>)}
      <div className="foundation-editor-actions"><button type="button" disabled={question.options.length >= 6} onClick={() => change('questions', content.questions.map((item, j) => j === i ? { ...item, options: [...item.options, ''] } : item))}>+ Lựa chọn</button><button type="button" disabled={question.options.length <= 2} onClick={() => change('questions', content.questions.map((item, j) => j === i ? { ...item, options: item.options.slice(0, -1), correct: Math.min(item.correct, item.options.length - 2) } : item))}>Bỏ lựa chọn cuối</button></div>
      <label>Đáp án đúng<select value={question.correct} onChange={e => change('questions', content.questions.map((item, j) => j === i ? { ...item, correct: Number(e.target.value) } : item))}>{question.options.map((option, k) => <option key={k} value={k}>Lựa chọn {k + 1}: {option}</option>)}</select></label><label>Giải thích<textarea required maxLength={1500} value={question.explanation} onChange={e => change('questions', content.questions.map((item, j) => j === i ? { ...item, explanation: e.target.value } : item))} /></label><button type="button" disabled={content.questions.length <= 1} onClick={() => change('questions', content.questions.filter((_, j) => j !== i))}>Bỏ câu {i + 1}</button>
    </section>)}<button type="button" disabled={content.questions.length >= 20} onClick={() => change('questions', [...content.questions, { ...blank.questions[0], options: ['', ''] }])}>+ Thêm câu hỏi</button></fieldset>
    {editable && <button className="study-primary" disabled={busy} type="submit">{busy ? 'Đang lưu…' : 'Lưu bản nháp'}</button>}
    </form></>
}
