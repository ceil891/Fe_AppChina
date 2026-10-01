import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { PermissionGate } from '../../../app/router/PermissionGate'
import { adminRoleApi } from '../api/adminRoleApi'
import { selectPermission } from '../permissionSelection'
import type { ManagedRole, PermissionDefinition } from '../types/role.types'
import '../management.css'

export function AdminRolesPage() {
  const result = useResource<ManagedRole[]>('/admin/roles')
  const { user } = useAuth()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<ManagedRole | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function remove() {
    if (!pending) return
    setBusy(true); setError('')
    try { await adminRoleApi.delete(pending.code); setPending(null); setMessage('Đã xóa vai trò.'); result.reload() }
    catch (e) { setError(e instanceof Error ? e.message : 'Không xóa được vai trò.') }
    finally { setBusy(false) }
  }
  const filtered = result.data?.filter(r => (r.name + ' ' + r.code).toLocaleLowerCase().includes(query.toLocaleLowerCase())) ?? []
  return <main className="admin-page">
    <div className="admin-heading"><div><p className="admin-eyebrow">PHÂN QUYỀN ĐỘNG</p><h1>Vai trò & quyền</h1><p className="admin-muted">Tạo nhóm quyền, sau đó gán vai trò cho từng tài khoản.</p></div><PermissionGate permission="roles.create"><Link className="admin-link-primary" to="/admin/roles/new">+ Tạo vai trò</Link></PermissionGate></div>
    <div className="admin-toolbar"><label className="admin-search"><input aria-label="Tìm vai trò" type="search" placeholder="Tìm tên hoặc mã vai trò" value={query} onChange={e => setQuery(e.target.value)} /></label><button disabled={result.loading} onClick={result.reload}>Tải lại</button></div>
    {(message || location.state?.adminSavedMessage) && <p className="admin-success" role="status">{message || location.state.adminSavedMessage}</p>}
    {pending && <div className="admin-delete" role="group" aria-label="Xác nhận xóa vai trò"><strong>Xóa vai trò {pending.name}?</strong><p>Chỉ xóa được khi không còn tài khoản sử dụng vai trò này.</p><div className="admin-actions"><button className="admin-danger" disabled={busy} onClick={() => void remove()}>{busy ? 'Đang xóa…' : 'Xác nhận xóa'}</button><button disabled={busy} onClick={() => setPending(null)}>Hủy</button></div>{error && <p role="alert">{error}</p>}</div>}
    {result.loading ? <p role="status">Đang tải vai trò…</p> : result.error ? <div className="admin-error" role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button></div> : <div className="management-table"><table><thead><tr><th>Vai trò</th><th>Quyền</th><th>Tài khoản</th><th>Thao tác</th></tr></thead><tbody>{filtered.map(role => {
      const editable = !role.systemRole && role.permissions.every(p => can(user, p))
      return <tr key={role.code}><td data-label="Vai trò"><strong>{role.name}</strong><small>{role.code}{role.systemRole ? ' · Hệ thống' : ''}</small><small>{role.description}</small></td><td data-label="Quyền">{role.permissions.length} quyền</td><td data-label="Tài khoản">{role.userCount}</td><td data-label="Thao tác"><div className="management-actions"><Link to={'/admin/roles/' + role.code}>Xem quyền</Link>{editable && <><PermissionGate permission="roles.update"><Link to={'/admin/roles/' + role.code + '/edit'}>Sửa</Link></PermissionGate><PermissionGate permission="roles.delete"><button className="admin-delete-button" disabled={busy || role.userCount > 0} onClick={() => { setPending(role); setError('') }}>Xóa</button></PermissionGate></>}</div></td></tr>
    })}</tbody></table>{filtered.length === 0 && <p className="admin-empty">Không có vai trò phù hợp.</p>}</div>}
    <p className="admin-muted">USER và ADMIN là vai trò hệ thống. Vai trò tự tạo không có quyền quản lý sẽ sử dụng giao diện người học.</p>
  </main>
}

export function AdminRoleEditorPage({ readOnly = false }: { readOnly?: boolean }) {
  const { code } = useParams()
  const role = useResource<ManagedRole>(code ? '/admin/roles/' + encodeURIComponent(code) : null)
  const catalog = useResource<PermissionDefinition[]>('/admin/roles/permissions')
  const loading = role.loading || catalog.loading, error = role.error || catalog.error
  return <main className="admin-page"><Link className="management-back" to="/admin/roles">← Danh sách vai trò</Link><div className="admin-heading"><h1>{readOnly ? 'Chi tiết vai trò' : code ? 'Chỉnh sửa vai trò' : 'Tạo vai trò'}</h1></div>
    {loading ? <p role="status">Đang tải quyền…</p> : error ? <div role="alert" className="admin-error"><p>{error}</p><button onClick={() => { role.reload(); catalog.reload() }}>Thử lại</button></div> : <RoleForm key={(code ?? 'new') + readOnly} role={role.data} catalog={catalog.data ?? []} readOnly={readOnly} />}
  </main>
}

function RoleForm({ role, catalog, readOnly }: { role?: ManagedRole; catalog: PermissionDefinition[]; readOnly: boolean }) {
  const { user, setUser } = useAuth(), navigate = useNavigate()
  const locked = readOnly || !!role?.systemRole || !!role?.permissions.some(p => !can(user, p))
  const [selected, setSelected] = useState<string[]>(role?.permissions ?? [])
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const groups = [...new Set(catalog.map(p => p.module))]
  function toggle(code: string, checked: boolean) {
    setSelected(previous => selectPermission(previous, code, checked))
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = { name: String(data.get('name')).trim(), description: String(data.get('description')).trim(), permissions: selected }
    if (!body.name) { setError('Tên vai trò không được để trống.'); return }
    setBusy(true); setError('')
    try {
      if (role) await adminRoleApi.update(role.code, body)
      else await adminRoleApi.create({ ...body, code: String(data.get('code')).trim() })
      if (role?.code === user?.role && (selected.length !== role?.permissions.length || selected.some(p => !role?.permissions.includes(p)))) {
        setUser(null); navigate('/login', { replace: true }); return
      }
      navigate('/admin/roles', { replace: true, state: { adminSavedMessage: 'Đã lưu vai trò. Tài khoản bị thay đổi quyền cần đăng nhập lại.' } })
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được vai trò.') }
    finally { setBusy(false) }
  }
  return <div className="management-form"><section className="admin-editor"><form onSubmit={save}><fieldset disabled={locked || busy}>
    <label>Mã vai trò<input name="code" defaultValue={role?.code ?? ''} readOnly={!!role} pattern="[A-Z][A-Z0-9_]{1,39}" maxLength={40} required placeholder="Ví dụ: EDITOR" /></label>
    <p className="admin-muted">2–40 ký tự in hoa, số hoặc gạch dưới; bắt đầu bằng chữ. Mã giữ cố định sau khi tạo.</p>
    <label>Tên vai trò<input name="name" defaultValue={role?.name ?? ''} maxLength={80} required placeholder="Ví dụ: Biên tập viên" /></label>
    <label>Mô tả<textarea name="description" defaultValue={role?.description ?? ''} maxLength={300} /></label>
    <h2>Quyền được cấp · {selected.length}</h2><p className="admin-muted">Chọn thao tác sẽ chọn kèm quyền xem cần thiết. Bỏ quyền xem sẽ bỏ các thao tác phụ thuộc. Bạn chỉ có thể cấp quyền mình đang có.</p>
    <div className="permission-groups">{groups.map(group => <section className="permission-group" key={group}><h3>{group}</h3>{catalog.filter(p => p.module === group).map(p => <label className="permission-choice" key={p.code}><input type="checkbox" checked={selected.includes(p.code)} disabled={!can(user, p.code)} onChange={e => toggle(p.code, e.target.checked)} /><span>{p.name}<small>{p.code}</small></span></label>)}</section>)}</div>
    {!locked && <><p className="admin-muted">Lưu thay đổi quyền sẽ thu hồi phiên của {role?.userCount ?? 0} tài khoản đang dùng vai trò này.</p><button className="admin-primary">{busy ? 'Đang lưu…' : 'Lưu vai trò'}</button></>}
    </fieldset>{error && <p role="alert">{error}</p>}</form>{role?.systemRole && <p className="admin-muted">Vai trò hệ thống được bảo vệ. Tạo vai trò mới để tùy chỉnh quyền.</p>}<div className="admin-actions"><button disabled={busy} onClick={() => navigate('/admin/roles')}>Quay lại</button></div></section></div>
}
