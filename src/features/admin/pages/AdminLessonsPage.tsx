import { PermissionGate } from '../../../app/router/PermissionGate'
import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import { adminApi } from '../api/adminApi'
import { LessonEditor } from '../components/LessonEditor'
import { selectLessons } from '../utils/lessonList'
import type { LessonSummary, LessonDetail, Word } from '../../lesson/types/lesson.types'
import '../management.css'

export function AdminLessonsPage() {
  const result=useResource<LessonSummary[]>('/admin/lessons')
  const [params,setParams]=useSearchParams()
  const location=useLocation()
  const query=params.get('q') ?? '', emptyOnly=params.get('empty')==='1'
  const [pending,setPending]=useState<LessonSummary|null>(null)
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [message,setMessage]=useState('')
  const confirmation=useRef<HTMLDivElement>(null)
  const { items: filtered, pages, page } = selectLessons(result.data ?? [], params)
  const publicationFilter = ['visible','hidden'].includes(params.get('publication') ?? '') ? params.get('publication')! : ''
  const sort = ['title','words'].includes(params.get('sort') ?? '') ? params.get('sort')! : ''
  function filter(key:string,value:string) { const next=new URLSearchParams(params); if(value) next.set(key,value); else next.delete(key); if(key!=='page') next.delete('page'); setParams(next,{replace:true}) }
  async function publication(lesson: LessonSummary) {
    setBusy(true); setError(''); setMessage('')
    try {
      const published = lesson.published === false
      await mutate('PATCH', `/admin/lessons/${lesson.id}/publication`, { published })
      setMessage((published ? 'Đã hiện bài “' : 'Đã ẩn bài “') + lesson.title + '”.'); result.reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Không đổi được trạng thái bài.') }
    finally { setBusy(false) }
  }
  async function remove() {
    if(!pending)return
    setBusy(true);setError('')
    try { await adminApi.deleteLesson(pending.id);setMessage('Đã xóa bài học “'+pending.title+'”.');setPending(null);result.reload() }
    catch(e){setError(e instanceof Error?e.message:'Không xóa được bài học.')}
    finally{setBusy(false)}
  }
  return <main className="admin-page">
    <div className="admin-heading"><div><p className="admin-eyebrow">QUẢN LÝ NỘI DUNG</p><h1>Quản lý bài học</h1><p className="admin-muted">Tạo bài, xem nội dung, chỉnh sửa và sắp xếp từ vựng.</p></div><PermissionGate permission="lessons.create"><Link className="admin-link-primary" to="/admin/lessons/new">+ Thêm bài học</Link></PermissionGate></div>
    <div className="admin-toolbar"><label className="admin-search"><input type="search" value={query} onChange={e=>filter('q',e.target.value)} placeholder="Tìm tên hoặc mô tả bài học" aria-label="Tìm bài học"/></label><select aria-label="Lọc nội dung bài học" value={emptyOnly?'empty':'all'} onChange={e=>filter('empty',e.target.value==='empty'?'1':'')}><option value="all">Tất cả bài học</option><option value="empty">Bài chưa có từ</option></select><select aria-label="Lọc trạng thái hiển thị" value={publicationFilter} onChange={e=>filter('publication',e.target.value)}><option value="">Mọi trạng thái</option><option value="visible">Đang hiển thị</option><option value="hidden">Đã ẩn</option></select><select aria-label="Sắp xếp bài học" value={sort} onChange={e=>filter('sort',e.target.value)}><option value="">Thứ tự lộ trình</option><option value="title">Tên bài A–Z</option><option value="words">Ít từ vựng trước</option></select><button disabled={result.loading} onClick={result.reload}>Tải lại</button>{(query || emptyOnly || publicationFilter || sort) && <button onClick={()=>setParams({},{replace:true})}>Xóa bộ lọc</button>}</div>
    {(message || location.state?.adminSavedMessage) && <p role="status" className="admin-success">{message || location.state.adminSavedMessage}</p>}
    {error && !pending && <p role="alert" className="admin-error">{error}</p>}
    {pending && <div className="admin-delete" ref={confirmation} tabIndex={-1} role="group" aria-label="Xác nhận xóa bài"><strong>Xóa bài “{pending.title}”?</strong><p>Gỡ liên kết từ trong bài, không xóa từ khỏi kho. Bài đã được người học lưu sẽ được giữ lại.</p><div className="admin-actions"><button className="admin-danger" disabled={busy} onClick={()=>void remove()}>{busy?'Đang xóa…':'Xác nhận xóa'}</button><button disabled={busy} onClick={()=>{setPending(null);setError('')}}>Hủy</button></div>{error && <p role="alert">{error}</p>}</div>}
    {result.loading?<p role="status">Đang tải bài học…</p>:result.error?<div role="alert" className="admin-error"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button></div>:<>
      <p className="admin-muted" role="status">{filtered.length} bài học</p>
      <div className="management-table"><table><thead><tr><th scope="col">Thứ tự</th><th scope="col">Bài học</th><th scope="col">Từ vựng</th><th scope="col">Thao tác</th></tr></thead><tbody>{filtered.slice(page*20,(page+1)*20).map(lesson=><tr key={lesson.id}><td data-label="Thứ tự">{lesson.position}</td><td data-label="Bài học"><Link className="management-title" to={`/admin/lessons/${lesson.id}`}>{lesson.title}</Link><small>{lesson.description}</small><small>{lesson.published === false ? 'Đã ẩn' : 'Đang hiển thị'}</small></td><td data-label="Từ vựng">{lesson.wordCount} từ</td><td data-label="Thao tác"><div className="management-actions"><Link to={`/admin/lessons/${lesson.id}`}>Xem</Link><PermissionGate permission="lessons.update"><Link to={`/admin/lessons/${lesson.id}/edit`}>Sửa</Link></PermissionGate><PermissionGate permission="lessons.update"><button disabled={busy} aria-label={(lesson.published === false ? 'Hiện bài ' : 'Ẩn bài ') + lesson.title} onClick={() => void publication(lesson)}>{lesson.published === false ? 'Hiện bài' : 'Ẩn bài'}</button></PermissionGate><PermissionGate permission="lessons.delete"><button className="admin-delete-button" disabled={busy} aria-label={'Xóa bài '+lesson.title} onClick={()=>{setError('');setPending(lesson);requestAnimationFrame(()=>{confirmation.current?.focus();confirmation.current?.scrollIntoView({block:'nearest'})})}}>Xóa</button></PermissionGate></div></td></tr>)}</tbody></table>{filtered.length===0 && <p className="admin-empty">Chưa có bài phù hợp. Thay đổi bộ lọc hoặc thêm bài mới.</p>}</div>
      <div className="admin-pagination"><button disabled={page===0} onClick={()=>filter('page',String(page-1))}>← Trang trước</button><span>Trang {page+1}/{pages}</span><button disabled={page+1>=pages} onClick={()=>filter('page',String(page+1))}>Trang sau →</button></div>
    </>}
  </main>
}

export function AdminLessonFormPage() {
  const {id}=useParams()
  return <LessonFormContent key={id ?? 'new'} id={id}/>
}
function LessonFormContent({id}:{id?:string}) {
  const navigate=useNavigate()
  const words=useResource<Word[]>('/admin/vocabulary')
  const lessons=useResource<LessonSummary[]>('/admin/lessons')
  const detail=useResource<LessonDetail>(id?'/admin/lessons/'+encodeURIComponent(id):null)
  const loading=words.loading||lessons.loading||detail.loading
  const error=words.error||lessons.error||detail.error
  function retry(){words.reload();lessons.reload();detail.reload()}
  return <main className="admin-page"><Link className="management-back" to="/admin/lessons">← Danh sách bài học</Link><div className="admin-heading"><div><h1>{id?'Chỉnh sửa bài học':'Tạo bài học mới'}</h1><p className="admin-muted">Điền thông tin và chọn các từ theo thứ tự muốn hiển thị.</p></div></div>
    {loading?<p role="status">Đang tải dữ liệu…</p>:error?<div role="alert" className="admin-error"><p>{error}</p><button onClick={retry}>Thử lại</button></div>:<div className="management-form"><LessonEditor lesson={detail.data} words={words.data ?? []} nextPosition={Math.max(0,...(lessons.data ?? []).map(l=>l.position))+1} onCancel={()=>navigate('/admin/lessons')} onSaved={saved=>navigate(`/admin/lessons/${saved.lesson.id}`,{replace:true,state:{adminSavedMessage:'Đã lưu bài học và danh sách từ.'}})}/></div>}
  </main>
}

export function AdminLessonDetailPage() {
  const {id}=useParams(), location=useLocation()
  const detail=useResource<LessonDetail>('/admin/lessons/'+encodeURIComponent(id ?? ''))
  return <main className="admin-page"><Link className="management-back" to="/admin/lessons">← Danh sách bài học</Link>
    {detail.loading?<p role="status">Đang tải bài học…</p>:detail.error?<div role="alert" className="admin-error"><p>{detail.error}</p><button onClick={detail.reload}>Thử lại</button></div>:detail.data && <>
      <div className="admin-heading"><div><p className="admin-eyebrow">BÀI {detail.data.lesson.position} · {detail.data.words.length} TỪ</p><h1>{detail.data.lesson.title}</h1><p>{detail.data.lesson.description}</p></div><PermissionGate permission="lessons.update"><Link className="admin-link-primary" to={`/admin/lessons/${id}/edit`}>Sửa bài học</Link></PermissionGate></div>
      {location.state?.adminSavedMessage && <p role="status" className="admin-success">{location.state.adminSavedMessage}</p>}
      {detail.data.words.length===0 && <p className="admin-empty">Bài chưa có từ. Chọn “Sửa bài học” để bổ sung.</p>}
      <div className="management-word-grid">{detail.data.words.map((word,index)=><article className="management-word-preview" key={word.id}><small>TỪ {index+1}</small><h2 lang="zh">{word.hanzi} <span>{word.pinyin}</span></h2><strong>{word.meaningVi}</strong><p lang="zh">{word.exampleHanzi}</p><p>{word.examplePinyin}</p><p>{word.exampleMeaningVi}</p></article>)}</div>
    </>}
  </main>
}
