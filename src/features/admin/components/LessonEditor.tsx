import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { adminApi } from '../api/adminApi'
import type { Word, LessonDetail } from '../../lesson/types/lesson.types'
import { searchText } from '../utils/searchText'
export function LessonEditor({ lesson, words, nextPosition, onSaved, onCancel }: {
  lesson?: LessonDetail; words: Word[]; nextPosition: number; onSaved:(l:LessonDetail)=>void; onCancel:()=>void
}) {
  const heading=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{heading.current?.focus();heading.current?.scrollIntoView({block:'nearest'})},[])
  const [ids,setIds]=useState<number[]>(lesson?.words.map(w=>w.id)??[])
  const [search,setSearch]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const choices=words.filter(w=>!ids.includes(w.id)&&searchText([w.hanzi,w.pinyin,w.meaningVi].join(' ')).includes(searchText(search)))
  function move(index:number,delta:number) {
    setIds(current=>{const copy=[...current]; [copy[index],copy[index+delta]]=[copy[index+delta],copy[index]]; return copy})
  }
  async function save(e:FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form=new FormData(e.currentTarget)
    const body={title:String(form.get('title')).trim(),description:String(form.get('description')).trim(),position:Number(form.get('position')),wordIds:ids}
    if(!body.title||!body.description){setError('Tiêu đề và mô tả không được để trống.');return}
    setBusy(true);setError('')
    try {onSaved(await adminApi.saveLesson(lesson?.lesson.id,body))}
    catch(e){setError(e instanceof Error?e.message:'Không lưu được bài học.')}
    finally{setBusy(false)}
  }
  return <section className="admin-editor" aria-label={lesson?'Sửa bài học':'Thêm bài học'}>
    <h2 ref={heading} tabIndex={-1}>{lesson?'Sửa bài học':'Thêm bài học'}</h2>
    <form onSubmit={save}><fieldset disabled={busy}>
      <label>Tiêu đề<input name="title" defaultValue={lesson?.lesson.title??''} required maxLength={160}/></label>
      <label>Mô tả<textarea name="description" defaultValue={lesson?.lesson.description??''} required maxLength={500}/></label>
      <label>Thứ tự bài<input type="number" name="position" min={1} max={2147483647} step={1} required defaultValue={lesson?.lesson.position??nextPosition}/></label>
      <p className="admin-muted">Thứ tự bài phải là số duy nhất. Dùng vị trí trống khi muốn chuyển bài.</p>
      <h3>Từ trong bài ({ids.length}/200)</h3>
      {ids.length===0&&<p className="admin-muted">Chọn từ ở kho bên dưới để thêm vào bài.</p>}
      <ol className="selected-words">{ids.map((id,i)=><li key={id}><span><strong lang="zh">{words.find(w=>w.id===id)?.hanzi??'Từ #'+id}</strong><small>{words.find(w=>w.id===id)?.pinyin}</small></span><div>
        <button type="button" aria-label={'Đưa từ '+(i+1)+' lên'} disabled={i===0} onClick={()=>move(i,-1)}>↑</button>
        <button type="button" aria-label={'Đưa từ '+(i+1)+' xuống'} disabled={i===ids.length-1} onClick={()=>move(i,1)}>↓</button>
        <button type="button" aria-label={'Gỡ từ '+(i+1)+' khỏi bài'} onClick={()=>setIds(previous=>previous.filter(x=>x!==id))}>Gỡ</button>
      </div></li>)}</ol>
      <label>Tìm từ để thêm<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Hán tự, pinyin hoặc nghĩa Việt"/></label>
      <div className="word-picker">{choices.map(w=><button type="button" key={w.id} disabled={ids.length>=200} onClick={()=>setIds(previous=>[...previous,w.id])}><strong lang="zh">{w.hanzi}</strong><span>{w.pinyin} · {w.meaningVi}</span><b>+</b></button>)}
      {choices.length===0&&<p>Không có từ phù hợp để thêm.</p>}</div>
      {error&&<p role="alert">{error}</p>}<div className="admin-actions"><button className="admin-primary">{busy?'Đang lưu…':'Lưu bài học'}</button><button type="button" onClick={onCancel}>Hủy</button></div>
    </fieldset></form>
  </section>
}
