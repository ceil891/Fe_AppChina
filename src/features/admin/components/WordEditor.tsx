import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { adminApi } from '../api/adminApi'
import type { WordInput } from '../api/adminApi'
import type { Word } from '../../lesson/types/lesson.types'
const fields: { name: keyof WordInput; label: string; max: number; placeholder: string }[] = [
  {name:'hanzi',label:'Hán tự',max:80,placeholder:'你好'},
  {name:'pinyin',label:'Pinyin',max:160,placeholder:'nǐ hǎo'},
  {name:'meaningVi',label:'Nghĩa tiếng Việt',max:300,placeholder:'Xin chào'},
  {name:'exampleHanzi',label:'Ví dụ bằng tiếng Trung',max:300,placeholder:'你好，我叫小明。'},
  {name:'examplePinyin',label:'Pinyin câu ví dụ',max:500,placeholder:'Nǐ hǎo, wǒ jiào Xiǎomíng.'},
  {name:'exampleMeaningVi',label:'Nghĩa câu ví dụ',max:500,placeholder:'Xin chào, tôi tên là Tiểu Minh.'},
]
export function WordEditor({ word, onSaved, onCancel }: { word?: Word; onSaved: (w: Word) => void; onCancel: () => void }) {
  const heading=useRef<HTMLHeadingElement>(null)
  useEffect(()=>{heading.current?.focus();heading.current?.scrollIntoView({block:'nearest'})},[])
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form=new FormData(e.currentTarget)
    const input=Object.fromEntries(fields.map(f=>[f.name,String(form.get(f.name)).trim()])) as unknown as WordInput
    if(fields.some(f=>!input[f.name])) { setError('Vui lòng điền đầy đủ các trường, không chỉ nhập khoảng trắng.'); return }
    setBusy(true); setError('')
    try { onSaved(await adminApi.saveWord(word?.id,input)) }
    catch(e) { setError(e instanceof Error?e.message:'Không lưu được từ vựng.') }
    finally { setBusy(false) }
  }
  return <section className="admin-editor" aria-label={word?'Sửa từ vựng':'Thêm từ vựng'}>
    <h2 ref={heading} tabIndex={-1}>{word?'Sửa từ vựng':'Thêm từ vựng'}</h2><p className="admin-muted">Nội dung được lưu trực tiếp vào kho từ vựng.</p>
    <form onSubmit={save}><fieldset disabled={busy}>{fields.map(f=><label key={f.name}>{f.label}<input name={f.name} defaultValue={word?.[f.name]??''} required maxLength={f.max} placeholder={f.placeholder} /></label>)}
    {error&&<p role="alert">{error}</p>}<div className="admin-actions"><button className="admin-primary">{busy?'Đang lưu…':'Lưu từ vựng'}</button><button type="button" onClick={onCancel}>Hủy</button></div></fieldset></form>
  </section>
}
