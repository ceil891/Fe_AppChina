import { useState } from 'react'
import type { FormEvent } from 'react'
import { useResource } from '../../../shared/hooks/useResource'
import { mutate } from '../../../services/api'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import '../management.css'

interface Settings { enabled: boolean; model: string; dailyTurns: number; globalDailyTurns: number; version: number }
interface View { settings: Settings; keyConfigured: boolean; models: string[] }
export function AdminAiSettingsPage() {
  const result = useResource<View>('/admin/ai-settings')
  return <main className="admin-page"><h1>Cấu hình AI Tutor</h1><p>Quản lý hoạt động và hạn mức Gemini cho người học.</p>
    {result.loading ? <p role="status">Đang tải cấu hình…</p> : result.error ? <p role="alert">{result.error}</p> : result.data && <AiSettingsForm key={result.data.settings.version} view={result.data} />}
    <button disabled={result.loading} onClick={result.reload}>Tải lại cấu hình</button>
  </main>
}
export function AiSettingsForm({ view }: { view: View }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(view.settings)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('')
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget)
    setBusy(true); setError(''); setMessage('')
    try {
      const result = await mutate<View>('PUT', '/admin/ai-settings', { enabled: form.get('enabled') === 'on', model: form.get('model'), dailyTurns: Number(form.get('dailyTurns')), globalDailyTurns: Number(form.get('globalDailyTurns')), version: saved.version })
      setSaved(result.settings); setMessage('Đã lưu. Cấu hình áp dụng cho lượt gửi mới; lượt đang xử lý được hoàn tất.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được cấu hình.') } finally { setBusy(false) }
  }
  return <section className="management-form"><p role="status">{view.keyConfigured ? 'Máy chủ đã có khóa API. Chưa xác minh phản hồi Gemini tại đây.' : 'Máy chủ chưa có khóa API: cần cấu hình GEMINI_API_KEY để AI trả lời.'}</p>
    <p>Khóa API chỉ được cấu hình trên máy chủ. Trang này không đọc hoặc hiển thị khóa.</p>
    <div className="admin-editor"><form onSubmit={save}><fieldset disabled={busy || !can(user, 'ai.update')}>
      <label className="management-toggle"><input name="enabled" type="checkbox" defaultChecked={saved.enabled} /> Cho phép AI Tutor hoạt động</label>
      <label>Model<select name="model" defaultValue={saved.model}>{view.models.map(model => <option key={model}>{model}</option>)}</select></label>
      <label>Lượt mỗi học viên mỗi ngày<input name="dailyTurns" type="number" min={1} max={100} required defaultValue={saved.dailyTurns} /></label>
      <label>Lượt toàn hệ thống mỗi ngày<input name="globalDailyTurns" type="number" min={1} max={10000} required defaultValue={saved.globalDailyTurns} /></label>
      <p>Đặt lại theo ngày Việt Nam. Giảm hạn mức không xóa số lượt đã dùng. Hạn mức là số lượt, không phải ngân sách tiền.</p>
      <button className="admin-primary" type="submit">{busy ? 'Đang lưu…' : 'Lưu cấu hình AI'}</button>
    </fieldset></form></div>{error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
  </section>
}
