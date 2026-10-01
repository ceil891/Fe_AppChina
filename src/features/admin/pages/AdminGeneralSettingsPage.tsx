import { useState } from 'react'
import type { FormEvent } from 'react'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import '../management.css'

interface Settings { idleMinutes: number; learnerMinutes: number; managerMinutes: number; bodyLimitKiB: number; version: number }
export function AdminGeneralSettingsPage() {
 const result=useResource<Settings>('/admin/general-settings')
 return <main className="admin-page"><h1>Cài đặt chung</h1><p>Giới hạn phiên đăng nhập và dữ liệu gửi tới máy chủ.</p>
 {result.loading ? <p role="status">Đang tải…</p> : result.error ? <p role="alert">{result.error}</p> : result.data && <SettingsForm key={result.data.version} initial={result.data} />}
 <button disabled={result.loading} onClick={result.reload}>Tải lại cấu hình</button></main>
}
function SettingsForm({initial}:{initial:Settings}) {
 const {user}=useAuth()
 const [saved,setSaved]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('')
 async function save(e:FormEvent<HTMLFormElement>) {
  e.preventDefault(); const form=new FormData(e.currentTarget)
  setBusy(true);setError('');setMessage('')
  try {
   const result=await mutate<Settings>('PUT','/admin/general-settings',{idleMinutes:Number(form.get('idleMinutes')),learnerMinutes:Number(form.get('learnerMinutes')),managerMinutes:Number(form.get('managerMinutes')),bodyLimitKiB:Number(form.get('bodyLimitKiB')),version:saved.version})
   const changed=result.idleMinutes!==saved.idleMinutes || result.learnerMinutes!==saved.learnerMinutes || result.managerMinutes!==saved.managerMinutes
   setSaved(result);setMessage(changed?'Đã lưu. Tất cả phiên đã thu hồi. Vui lòng đăng nhập lại.':'Đã lưu giới hạn request; áp dụng từ yêu cầu tiếp theo.')
  } catch(e) {setError(e instanceof Error?e.message:'Không lưu được cấu hình.')} finally {setBusy(false)}
 }
 return <section className="management-form"><div className="admin-editor"><form onSubmit={save}><fieldset disabled={busy || !can(user,'settings.update')}>
 <label>Không hoạt động (phút)<input name="idleMinutes" type="number" min={5} max={120} required defaultValue={saved.idleMinutes}/></label>
 <label>Phiên học viên tối đa (phút)<input name="learnerMinutes" type="number" min={30} max={1440} required defaultValue={saved.learnerMinutes}/></label>
 <label>Phiên quản lý tối đa (phút)<input name="managerMinutes" type="number" min={15} max={240} required defaultValue={saved.managerMinutes}/></label>
 <p>Không hoạt động ≤ phiên quản lý ≤ phiên học viên. Mặc định: 30 phút, học viên 480 phút (8 giờ), quản lý 120 phút (2 giờ).</p>
 <p>Thay đổi thời hạn sẽ thu hồi mọi phiên, bao gồm phiên của bạn. Mọi người cần đăng nhập lại.</p>
 <label>Dung lượng body tối đa (KiB)<input name="bodyLimitKiB" type="number" min={64} max={4096} required defaultValue={saved.bodyLimitKiB}/></label>
 <p>1024 KiB = 1 MiB. Cho phép từ 64 đến 4096 KiB.</p>
 <button className="admin-primary" type="submit">{busy?'Đang lưu…':'Lưu cài đặt chung'}</button>
 </fieldset></form></div>
 <p>Định dạng API: chỉ JSON. Upload / multipart: đang khóa. Chỉ mở upload khi có kiểm tra loại file, dung lượng và quyền truy cập tại server.</p>
 {error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
 </section>
}
