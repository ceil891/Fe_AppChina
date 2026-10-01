import { useState } from 'react'
import { useAuth } from '../../app/providers/AuthContext'
import './session-retry.css'

export function SessionRetry() {
  const { refresh } = useAuth()
  const [busy, setBusy] = useState(false)
  async function retry() {
    if (busy) return
    setBusy(true)
    try { await refresh() } finally { setBusy(false) }
  }
  return <section className="session-retry" aria-labelledby="session-retry-title">
    <h2 id="session-retry-title">Chưa kết nối được tài khoản</h2>
    <p role="alert">Kết nối tạm thời bị gián đoạn. Thử lại để tiếp tục trang này.</p>
    <button disabled={busy} onClick={() => void retry()}>{busy ? 'Đang kết nối…' : 'Kết nối lại'}</button>
  </section>
}
