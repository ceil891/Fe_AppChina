import { can } from '../../../app/router/permissions'
import { PermissionGate } from '../../../app/router/PermissionGate'
import type { ManagedRole } from '../types/role.types'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { useAuth } from '../../../app/providers/AuthContext'
import { PasswordInput } from '../../auth/components/PasswordInput'
import { adminUserApi } from '../api/adminUserApi'
import type { ManagedUser, UserPage } from '../types/adminUser.types'
import '../management.css'

export function AdminUsersPage() {
  const {user}=useAuth()
  const roles=useResource<ManagedRole[]>('/admin/roles/options')
  const [params,setParams]=useSearchParams()
  const location=useLocation()
  const q=params.get('q') ?? '', role=params.get('role') ?? '', status=params.get('status') ?? ''
  const page=Math.max(0,Number.parseInt(params.get('page') ?? '0') || 0)
  const result=useResource<UserPage>('/admin/users?'+new URLSearchParams({q,role,status,page:String(page),size:'20'}))
  const [pending,setPending]=useState<{user:ManagedUser;action:'delete'|'lock'|'unlock'}|null>(null)
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [message,setMessage]=useState('')
  const confirmation=useRef<HTMLDivElement>(null)
  function filter(key:string,value:string) {const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);if(key!=='page')next.delete('page');setParams(next,{replace:true})}
  async function confirm() {
    if(!pending)return
    setBusy(true);setError('')
    try {
      if(pending.action==='delete')await adminUserApi.delete(pending.user.id)
      else await adminUserApi.status(pending.user.id,pending.action==='unlock')
      setMessage(pending.action==='delete'?'Đã xóa tài khoản.':pending.action==='lock'?'Đã khóa tài khoản và thu hồi phiên đăng nhập.':'Đã mở khóa. Người dùng có thể đăng nhập lại.')
      setPending(null)
      if(page>0 && result.data?.items.length===1)filter('page',String(page-1)); else result.reload()
    }catch(e){setError(e instanceof Error?e.message:'Không cập nhật được tài khoản.')}
    finally{setBusy(false)}
  }
  function ask(target:ManagedUser,action:'delete'|'lock'|'unlock') {
    setPending({user:target,action});setError('')
    requestAnimationFrame(()=>{confirmation.current?.focus();confirmation.current?.scrollIntoView({block:'nearest'})})
  }
  return <main className="admin-page">
    <div className="admin-heading"><div><p className="admin-eyebrow">QUẢN TRỊ HỆ THỐNG</p><h1>Quản lý tài khoản</h1><p className="admin-muted">Quản lý người dùng, quyền truy cập và trạng thái đăng nhập.</p></div><PermissionGate permission="users.create"><Link className="admin-link-primary" to="/admin/users/new">+ Tạo tài khoản</Link></PermissionGate></div>
    <div className="admin-toolbar"><label className="admin-search"><input type="search" maxLength={100} aria-label="Tìm tài khoản" placeholder="Tìm tên hoặc email" value={q} onChange={e=>filter('q',e.target.value)}/></label><select aria-label="Lọc quyền" value={role} onChange={e=>filter('role',e.target.value)}><option value="">Tất cả quyền</option>{roles.data?.map(r=><option value={r.code} key={r.code}>{r.name}</option>)}</select><select aria-label="Lọc trạng thái" value={status} onChange={e=>filter('status',e.target.value)}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="locked">Đã khóa</option></select><button onClick={result.reload} disabled={result.loading}>Tải lại</button></div>
    {roles.error && <div className="admin-error" role="alert"><p>{roles.error}</p><button onClick={roles.reload}>Tải lại vai trò</button></div>}{(message || location.state?.adminSavedMessage) && <p className="admin-success" role="status">{message || location.state.adminSavedMessage}</p>}
    {pending && <div className="admin-delete" ref={confirmation} tabIndex={-1} role="group" aria-label="Xác nhận thao tác tài khoản"><strong>{pending.action==='delete'?'Xóa vĩnh viễn':pending.action==='lock'?'Khóa':'Mở khóa'} tài khoản {pending.user.email}?</strong><p>{pending.action==='delete'?`Toàn bộ dữ liệu học riêng của tài khoản sẽ bị xóa, gồm ${pending.user.learningRecordCount} bài đã lưu/hoàn thành hiện có. Không thể hoàn tác.`:pending.action==='lock'?'Các phiên hiện tại mất hiệu lực. Dữ liệu học được giữ nguyên.':'Người dùng cần đăng nhập lại; các phiên cũ không được khôi phục.'}</p><div className="admin-actions"><button className={pending.action==='delete'?'admin-danger':'admin-primary'} onClick={()=>void confirm()} disabled={busy}>{busy?'Đang xử lý…':'Xác nhận'}</button><button disabled={busy} onClick={()=>setPending(null)}>Hủy</button></div>{error && <p role="alert">{error}</p>}</div>}
    {result.loading?<p role="status">Đang tải tài khoản…</p>:result.error?<div className="admin-error" role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button><button onClick={()=>setParams({})}>Xóa bộ lọc</button></div>:result.data && <>
      <p className="admin-muted" role="status">{result.data.total} tài khoản phù hợp</p>
      <div className="management-table"><table><thead><tr><th scope="col">Tài khoản</th><th scope="col">Quyền</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody>{result.data.items.map(account=><tr key={account.id}><td data-label="Tài khoản"><strong>{account.displayName}{account.id===user?.id?' (Bạn)':''}</strong><small>{account.email}</small><small>Tạo ngày {new Date(account.createdAt).toLocaleDateString('vi-VN')} · {account.learningRecordCount} bài đã lưu</small></td><td data-label="Quyền">{roles.data?.find(r=>r.code===account.role)?.name ?? account.role}</td><td data-label="Trạng thái"><span className={'admin-content-status'+(!account.enabled?' empty':'')}>{account.enabled?'Hoạt động':'Đã khóa'}</span></td><td data-label="Thao tác"><div className="management-actions"><PermissionGate permission="users.skills.read"><Link to={`/admin/users/${account.id}/skills`}>Kỹ năng học viên</Link></PermissionGate>{roles.data?.some(r=>r.code===account.role) && <><PermissionGate permission={['users.update','users.assign_role','users.status']}><Link to={`/admin/users/${account.id}/edit`}>Sửa</Link></PermissionGate><PermissionGate permission="users.password"><Link to={`/admin/users/${account.id}/password`}>Đổi mật khẩu</Link></PermissionGate><PermissionGate permission="users.status"><button disabled={busy || account.id===user?.id} onClick={()=>ask(account,account.enabled?'lock':'unlock')}>{account.enabled?'Khóa':'Mở khóa'}</button></PermissionGate><PermissionGate permission="users.delete"><button className="admin-delete-button" disabled={busy || account.id===user?.id} onClick={()=>ask(account,'delete')}>Xóa</button></PermissionGate></>}</div></td></tr>)}</tbody></table>{result.data.items.length===0 && <p className="admin-empty">Không có tài khoản phù hợp.</p>}</div>
      <div className="admin-pagination"><button disabled={page===0} onClick={()=>filter('page',String(page-1))}>← Trang trước</button><span>Trang {page+1}/{Math.max(1,Math.ceil(result.data.total/20))}</span><button disabled={(page+1)*20>=result.data.total} onClick={()=>filter('page',String(page+1))}>Trang sau →</button></div>
    </>}
  </main>
}

export function AdminUserEditorPage({passwordOnly=false}:{passwordOnly?:boolean}) {
  const {id}=useParams()
  const result=useResource<ManagedUser>(id?'/admin/users/'+encodeURIComponent(id):null)
  return <main className="admin-page"><Link className="management-back" to="/admin/users">← Danh sách tài khoản</Link><div className="admin-heading"><div><h1>{passwordOnly?'Đặt lại mật khẩu':id?'Chỉnh sửa tài khoản':'Tạo tài khoản'}</h1></div></div>
    {result.loading?<p role="status">Đang tải tài khoản…</p>:result.error?<div className="admin-error" role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button></div>:<UserForm key={(id ?? 'new')+String(passwordOnly)} account={result.data} passwordOnly={passwordOnly}/>}
  </main>
}
function UserForm({account,passwordOnly}:{account?:ManagedUser;passwordOnly:boolean}) {
  const navigate=useNavigate(), {user,setUser,refresh}=useAuth()
  const roles=useResource<ManagedRole[]>('/admin/roles/options')
  const [role,setRole]=useState(account?.role ?? 'USER')
  const [enabled,setEnabled]=useState(account?.enabled ?? true)
  const [busy,setBusy]=useState(false), [error,setError]=useState('')
  const self=account?.id===user?.id
  const outsideScope=!!account && !!roles.data && !roles.data.some(r=>r.code===account.role)
  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setError('')
    const form=new FormData(event.currentTarget)
    const password=String(form.get('password') ?? ''), displayName=String(form.get('displayName') ?? '').trim()
    if(!passwordOnly && !displayName){setError('Tên hiển thị không được để trống.');return}
    if((passwordOnly || !account) && (password.length<12 || password.length>128 || !password.trim())){setError('Mật khẩu cần 12–128 ký tự.');return}
    setBusy(true)
    try {
      if(passwordOnly && account) {
        if(password!==String(form.get('confirmation'))){setError('Mật khẩu xác nhận chưa khớp.');return}
        await adminUserApi.password(account.id,password)
        if(self){setUser(null);navigate('/login',{replace:true});return}
      } else if(account) { await adminUserApi.update(account.id,{displayName,role,enabled});if(self)await refresh() }
      else await adminUserApi.create({email:String(form.get('email')).trim(),displayName,password,role})
      navigate('/admin/users',{replace:true,state:{adminSavedMessage:passwordOnly?'Đã đổi mật khẩu và thu hồi phiên cũ.':'Đã lưu tài khoản.'}})
    }catch(e){setError(e instanceof Error?e.message:'Không lưu được tài khoản.')}
    finally{setBusy(false)}
  }
  return <div className="management-form"><section className="admin-editor"><form onSubmit={save}><fieldset disabled={busy || roles.loading || !!roles.error || outsideScope}>
    {outsideScope && <p role="alert">Vai trò của tài khoản này vượt quyền quản lý của bạn.</p>}{roles.loading && <p role="status">Đang tải vai trò…</p>}
    {roles.error && <p role="alert">{roles.error}</p>}
    {account && <p className="management-account-email">{account.email}</p>}
    {!passwordOnly && <>
      {!account && <label>Email đăng nhập<input name="email" type="email" maxLength={254} required autoComplete="off"/></label>}
      <label>Tên hiển thị<input name="displayName" readOnly={!!account && !can(user,'users.update')} defaultValue={account?.displayName ?? ''} maxLength={80} required autoComplete="off"/></label>
      <label>Quyền<select value={role} onChange={e=>setRole(e.target.value)} disabled={self || !can(user,'users.assign_role')}>{account && !roles.data?.some(r=>r.code===account.role) && <option value={account.role}>{account.role}</option>}{roles.data?.map(r=><option value={r.code} key={r.code}>{r.name}</option>)}</select></label>
      {account && <label>Trạng thái<select value={enabled?'active':'locked'} onChange={e=>setEnabled(e.target.value==='active')} disabled={self || !can(user,'users.status')}><option value="active">Hoạt động</option><option value="locked">Đã khóa</option></select></label>}
      <p className="admin-muted">Vai trò quyết định menu và các thao tác được phép. Đổi vai trò hoặc trạng thái sẽ thu hồi các phiên hiện tại.</p>
      {self && <p className="admin-muted">Bạn không thể tự đổi vai trò hoặc khóa tài khoản đang dùng.</p>}
    </>}
    {(!account || passwordOnly) && <><label htmlFor="managed-password">{passwordOnly?'Mật khẩu mới':'Mật khẩu ban đầu'}</label><PasswordInput id="managed-password" name="password" minLength={12} maxLength={128} required autoComplete="new-password" disabled={busy}/><p className="admin-muted">12–128 ký tự. Mật khẩu không được hiển thị lại sau khi lưu.</p></>}
    {passwordOnly && <><label htmlFor="managed-confirmation">Nhập lại mật khẩu mới</label><PasswordInput id="managed-confirmation" name="confirmation" minLength={12} maxLength={128} required autoComplete="new-password" disabled={busy}/><p className="admin-muted">Tất cả phiên cũ mất hiệu lực. Nếu đây là tài khoản của bạn, bạn sẽ cần đăng nhập lại.</p></>}
    {error && <p role="alert">{error}</p>}<div className="admin-actions"><button className="admin-primary">{busy?'Đang lưu…':passwordOnly?'Đặt lại mật khẩu':'Lưu tài khoản'}</button><button type="button" onClick={()=>navigate('/admin/users')}>Hủy</button></div>
  </fieldset></form>{roles.error && <button onClick={roles.reload}>Tải lại vai trò</button>}</section></div>
}
