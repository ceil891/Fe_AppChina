import { PermissionGate } from '../../../app/router/PermissionGate'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../../../shared/components/Icon'
import { adminApi } from '../api/adminApi'
import { WordEditor } from '../components/WordEditor'
import { LessonEditor } from '../components/LessonEditor'
import type { Word, LessonSummary, LessonDetail } from '../../lesson/types/lesson.types'
import { searchText } from '../utils/searchText'
import '../admin.css'
export function AdminPage({section, create=false}:{section:'vocabulary'|'lessons'; create?:boolean}) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const confirmation = useRef<HTMLDivElement>(null)
  const [words,setWords]=useState<Word[]>([])
  const [lessons,setLessons]=useState<LessonSummary[]>([])
  const [loading,setLoading]=useState(true)
  const [loadError,setLoadError]=useState('')
  const [retry,setRetry]=useState(0)
  const [query,setQuery]=useState(params.get('q') ?? '')
  const [emptyOnly,setEmptyOnly]=useState(params.get('empty') === '1')
  const [page,setPage]=useState(0)
  const [editingWord,setEditingWord]=useState<Word|null|undefined>(create && section==='vocabulary' ? null : undefined)
  const [editingLesson,setEditingLesson]=useState<LessonDetail|null|undefined>(create && section==='lessons' ? null : undefined)
  const [pendingDelete,setPendingDelete]=useState<{id:number;name:string}|null>(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState(typeof location.state?.adminSavedMessage === 'string' ? location.state.adminSavedMessage : '')
  const [actionError,setActionError]=useState('')
  useEffect(() => {
    if (pendingDelete) { confirmation.current?.focus(); confirmation.current?.scrollIntoView({ block: 'nearest' }) }
  }, [pendingDelete])
  useEffect(()=>{
    const controller=new AbortController()
    Promise.all([adminApi.words(controller.signal),section === 'lessons' ? adminApi.lessons(controller.signal) : Promise.resolve([] as LessonSummary[])])
      .then(([w,l])=>{if(!controller.signal.aborted){setWords(w);setLessons(l)}})
      .catch(e=>{if(!controller.signal.aborted)setLoadError(e instanceof Error?e.message:'Không tải được dữ liệu.')})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return()=>controller.abort()
  },[retry, section])
  function resetMessages(){setActionError('');setMessage('');setPendingDelete(null)}
  function closeEditor() {
    setEditingWord(undefined); setEditingLesson(undefined)
    if (create) navigate(`/admin/${section}`, { replace: true })
  }
  function finishEditing(savedMessage:string, savedName:string) {
    setEditingWord(undefined); setEditingLesson(undefined); setMessage(savedMessage)
    if (create) navigate(`/admin/${section}?q=${encodeURIComponent(savedName)}`, { replace: true, state: { adminSavedMessage: savedMessage } })
  }
  async function editLesson(id:number) {
    resetMessages();setBusy(true)
    try{setEditingLesson(await adminApi.lesson(id))}
    catch(e){setActionError(e instanceof Error?e.message:'Không tải được bài học.')}
    finally{setBusy(false)}
  }
  async function remove() {
    if(!pendingDelete)return
    setBusy(true);setActionError('');setMessage('')
    try {
      if(section==='vocabulary'){await adminApi.deleteWord(pendingDelete.id);setWords(current=>current.filter(w=>w.id!==pendingDelete.id))}
      else{await adminApi.deleteLesson(pendingDelete.id);setLessons(current=>current.filter(l=>l.id!==pendingDelete.id))}
      setMessage('Đã xóa nội dung.');setPendingDelete(null)
    }catch(e){setActionError(e instanceof Error?e.message:'Không xóa được nội dung.')}
    finally{setBusy(false)}
  }
  const isWords=section==='vocabulary'
  const filteredWords=words.filter(w=>searchText([w.hanzi,w.pinyin,w.meaningVi].join(' ')).includes(searchText(query)))
  const filteredLessons=lessons.filter(l=>(!emptyOnly || l.wordCount===0) && searchText([l.title,l.description].join(' ')).includes(searchText(query))).sort((a,b)=>a.position-b.position)
  const resultCount=isWords?filteredWords.length:filteredLessons.length
  const pageCount=Math.max(1,Math.ceil(resultCount/20))
  const currentPage=Math.min(page,pageCount-1)
  const visibleWords=filteredWords.slice(currentPage*20,(currentPage+1)*20)
  const visibleLessons=filteredLessons.slice(currentPage*20,(currentPage+1)*20)
  const editing=editingWord!==undefined||editingLesson!==undefined
  return <main className="admin-page">
    <div className="admin-heading"><div><p className="admin-eyebrow">CHINANN / QUẢN TRỊ NỘI DUNG</p><h1>{isWords?'Quản lý từ vựng':'Quản lý bài học'}</h1><p className="admin-muted">Biên tập nội dung học tiếng Trung cho người Việt.</p></div><span className="admin-badge"><Icon name="shield"/>NỘI DUNG</span></div>
    {loading?<p role="status">Đang tải dữ liệu…</p>:loadError?<div role="alert"><p>{loadError}</p><button onClick={()=>{setLoading(true);setLoadError('');setRetry(v=>v+1)}}>Thử lại</button></div>:<>
      <div className="admin-toolbar"><label className="admin-search"><Icon name="search" className="admin-search-icon"/><input type="search" aria-label={isWords?'Tìm từ vựng':'Tìm bài học'} placeholder={isWords?'Tìm Hán tự, pinyin, nghĩa Việt…':'Tìm tên bài học…'} value={query} onChange={e=>{setQuery(e.target.value);setPage(0)}}/></label>
        {!isWords && <select aria-label="Lọc nội dung bài học" value={emptyOnly?'empty':'all'} onChange={e=>{setEmptyOnly(e.target.value==='empty');setPage(0)}}><option value="all">Tất cả bài học</option><option value="empty">Bài chưa có từ</option></select>}
        <span className="admin-muted" role="status">{resultCount}/{isWords?words.length:lessons.length} {isWords?'từ vựng':'bài học'}</span>
        <PermissionGate permission={section+'.create'}><button className="admin-primary" disabled={busy||editing} onClick={()=>{resetMessages();if(isWords)setEditingWord(null);else setEditingLesson(null)}}>+ {isWords?'Thêm từ vựng':'Thêm bài học'}</button></PermissionGate>
      </div>
      {message&&<p className="admin-success" role="status">{message}</p>}{actionError&&<p className="admin-error" role="alert">{actionError}</p>}
      {pendingDelete&&<div ref={confirmation} tabIndex={-1} className="admin-delete" role="group" aria-label="Xác nhận xóa"><p>Xóa “{pendingDelete.name}”? Thao tác này không thể hoàn tác.</p><div className="admin-actions"><button className="admin-danger" disabled={busy} onClick={remove}>{busy?'Đang xóa…':'Xác nhận xóa'}</button><button disabled={busy} onClick={()=>setPendingDelete(null)}>Hủy</button></div></div>}
      <div className={'admin-workspace'+(editing?' editing':'')}>
        <div><section className="admin-list" aria-label={isWords?'Danh sách từ vựng':'Danh sách bài học'}>
          {isWords?visibleWords.map(w=><article key={w.id} className="admin-row"><div className="admin-word"><strong lang="zh">{w.hanzi}</strong><span>{w.pinyin}</span><p>{w.meaningVi}</p></div><div className="admin-row-actions"><PermissionGate permission="vocabulary.update"><button disabled={busy||editing} onClick={()=>{resetMessages();setEditingWord(w)}} aria-label={'Sửa từ '+w.hanzi}>Sửa</button></PermissionGate><PermissionGate permission="vocabulary.delete"><button className="admin-delete-button" disabled={busy||editing} aria-label={'Xóa từ '+w.hanzi} onClick={()=>{resetMessages();setPendingDelete({id:w.id,name:w.hanzi})}}>Xóa</button></PermissionGate></div></article>):
          visibleLessons.map(l=><article key={l.id} className="admin-row"><div><span className="admin-muted">BÀI {l.position} · {l.wordCount} TỪ</span><h2>{l.title}</h2><p>{l.description}</p></div><div className="admin-row-actions"><button disabled={busy||editing} aria-label={'Sửa bài '+l.title} onClick={()=>void editLesson(l.id)}>Sửa</button><button className="admin-delete-button" disabled={busy||editing} aria-label={'Xóa bài '+l.title} onClick={()=>{resetMessages();setPendingDelete({id:l.id,name:l.title})}}>Xóa</button></div></article>)}
          {(isWords?filteredWords.length:filteredLessons.length)===0&&<p className="admin-empty">Không có nội dung phù hợp. Bạn có thể thêm mới hoặc thay đổi từ khóa.</p>}
        </section><div className="admin-pagination" aria-label="Phân trang quản lý"><button disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>← Trang trước</button><span>Trang {currentPage+1}/{pageCount} · {resultCount} kết quả</span><button disabled={currentPage+1>=pageCount} onClick={()=>setPage(currentPage+1)}>Trang sau →</button></div></div>
        {editingWord!==undefined&&<WordEditor key={editingWord?.id??'new'} word={editingWord??undefined} onCancel={closeEditor} onSaved={w=>{setWords(previous=>[...previous.filter(item=>item.id!==w.id),w].sort((a,b)=>a.id-b.id));finishEditing('Đã lưu từ vựng.',w.hanzi)}}/>}
        {editingLesson!==undefined&&<LessonEditor key={editingLesson?.lesson.id??'new'} lesson={editingLesson??undefined} words={words} nextPosition={Math.max(0,...lessons.map(l=>l.position))+1} onCancel={closeEditor}
          onSaved={detail=>{setLessons(previous=>[...previous.filter(l=>l.id!==detail.lesson.id),detail.lesson]);finishEditing('Đã lưu bài học và thứ tự từ.',detail.lesson.title)}}/>}
      </div>
    </>}
  </main>
}
