import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useResource } from '../../shared/hooks/useResource'
import { useAuth } from '../../app/providers/AuthContext'

import { nextRoadmapStep } from './roadmap'
import type { RoadmapStep } from './roadmap'
const stages = ['Pinyin', 'Lời chào', 'Từ vựng chủ đề', '4 kỹ năng']

export function LearningRoadmap() {
  const { user } = useAuth()
  const result = useResource<RoadmapStep[]>('/roadmap')
  useEffect(() => {
    window.addEventListener('focus', result.reload)
    return () => window.removeEventListener('focus', result.reload)
  }, [result.reload])
  return <section className="learner-foundations" aria-label="Lộ trình học toàn diện">
    <h2>Lộ trình của bạn</h2>
    <p>Pinyin → lời chào → từ vựng chủ đề → 4 kỹ năng. Bạn có thể học theo thứ tự hoặc chọn bài phù hợp.</p>
    {!user && <p>Đăng nhập để theo dõi bài đang học và bài hoàn thành.</p>}
    {result.loading && <p role="status">Đang tải lộ trình…</p>}
    {result.error && <p role="alert">{result.error} <button onClick={result.reload}>Thử lại</button></p>}
    {result.data && <RoadmapContent steps={result.data} signedIn={!!user} />}
  </section>
}

export function RoadmapContent({ steps, signedIn }: { steps: RoadmapStep[]; signedIn: boolean }) {
  const next = nextRoadmapStep(steps)
  const completed = steps.filter(step => step.status === 'COMPLETED').length
  if (!steps.length) return <p>Chưa có bài học được xuất bản. Bạn hãy quay lại sau.</p>
  return <>
    {signedIn && <p>Đã hoàn thành {completed}/{steps.length} bài trong lộ trình hiện tại.</p>}
    {next && <p><Link className="study-primary" to={next.path}>{next.status === 'STARTED' ? 'Tiếp tục bài đang học' : 'Gợi ý tiếp theo'}: {next.title} →</Link></p>}
    {!next && signedIn && <p role="status">Bạn đã hoàn thành tất cả bài trong lộ trình hiện tại. Chọn một bài bên dưới để ôn lại.</p>}
    {stages.map((stage, index) => {
      const items = steps.filter(step => step.stage === stage)
      const done = items.filter(step => step.status === 'COMPLETED').length
      return <details key={stage} open={next?.stage === stage}>
        <summary>{index + 1}. {stage} · {signedIn ? `${done}/${items.length} bài hoàn thành` : `${items.length} bài`}</summary>
        {!items.length && <p>Nội dung chặng này đang được chuẩn bị.</p>}
        <ol>{items.map((step, itemIndex) => <li key={`${step.path}:${itemIndex}`}>
          <Link to={step.path}>{step.title}</Link>
          {signedIn && <> — {step.status === 'COMPLETED' ? 'Đã hoàn thành' : step.status === 'STARTED' ? 'Đang học' : 'Chưa bắt đầu'}</>}
        </li>)}</ol>
      </details>
    })}
  </>
}
