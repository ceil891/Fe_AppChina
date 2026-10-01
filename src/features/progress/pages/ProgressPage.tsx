import { LoadingState } from '../../../shared/components/LoadingState'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { ActivityList, ProgressDashboard } from '../components/ProgressDashboard'
import { activityNames } from '../utils/progressDisplay'
import type { ActivityPage, ProgressData } from '../types/progress.types'
import '../../../shared/styles/study.css'
import '../progress.css'
import { FoundationProgressOverview } from '../../foundations/FoundationsPage'

export function ProgressPage() {
  const result = useResource<ProgressData>('/progress')
  const { reload } = result
  useEffect(() => {
    if (!result.data) return
    const delay = Math.max(1000, new Date(result.data.nextDayAt).getTime() - new Date(result.data.serverTime).getTime() + 100)
    const timer = window.setTimeout(reload, delay)
    window.addEventListener('focus', reload)
    return () => { window.clearTimeout(timer); window.removeEventListener('focus', reload) }
  }, [result.data, reload])
  return <main className="study-page progress-page"><div className="progress-links"><Link to="/progress/history">Lịch sử hoạt động</Link><Link to="/learning">Bài của tôi</Link><Link to="/skills">Tiến độ 4 kỹ năng</Link><button onClick={reload} disabled={result.loading}>Cập nhật</button></div>
    {result.loading ? <LoadingState label="Đang tổng hợp tiến độ…" /> : result.error ? <div className="study-error" role="alert"><p>{result.error}</p><button onClick={reload}>Thử lại</button></div> : result.data && <ProgressDashboard data={result.data} />}
    <FoundationProgressOverview />
  </main>
}
export function ProgressHistoryPage() {
  const [params, setParams] = useSearchParams()
  const kind = params.get('kind') ?? '', date = params.get('date') ?? '', page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const query = new URLSearchParams({ kind, date, page: String(page), size: '20' })
  const result = useResource<ActivityPage>('/progress/events?' + query)
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }
  return <main className="study-page progress-page"><Link className="study-back" to="/progress">← Tiến độ của tôi</Link><header className="study-heading"><p className="study-eyebrow">NHÌN LẠI HÀNH TRÌNH</p><h1>Lịch sử hoạt động</h1><p>Bài đã hoàn thành, lượt ôn và Quiz đã nộp của riêng bạn. Ngày và giờ hiển thị theo giờ Việt Nam.</p></header>
    <div className="progress-filters"><label>Hoạt động<select value={kind} onChange={e => filter('kind', e.target.value)}><option value="">Tất cả</option>{Object.entries(activityNames).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label><label>Ngày học<input type="date" value={date} onChange={e => filter('date', e.target.value)} /></label><button onClick={() => setParams({})}>Xóa bộ lọc</button></div>
    {result.loading ? <LoadingState label="Đang tải hoạt động…" /> : result.error ? <div className="study-error" role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button></div> : result.data && <><p>{result.data.total} hoạt động phù hợp</p>{result.data.items.length ? <ActivityList items={result.data.items} timeZone={result.data.timeZone} /> : <p className="study-empty">Chưa có hoạt động phù hợp với bộ lọc này.</p>}
      <div className="study-pagination"><button disabled={page === 0} onClick={() => filter('page', String(page - 1))}>← Trang trước</button><span>Trang {page + 1}/{Math.max(1, Math.ceil(result.data.total / 20))}</span><button disabled={(page + 1) * 20 >= result.data.total} onClick={() => filter('page', String(page + 1))}>Trang sau →</button></div></>}
  </main>
}
