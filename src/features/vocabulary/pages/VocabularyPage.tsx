import { LoadingState } from '../../../shared/components/LoadingState'
import { useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import type { LessonSummary } from '../../lesson/types/lesson.types'
import type { VocabularyResult } from '../types/vocabulary.types'
import { WordCard } from '../components/WordCard'
import { VocabularySearchForm } from '../components/VocabularySearchForm'
import '../../../shared/styles/study.css'

export function VocabularyPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const lesson = params.get('lessonId') ?? ''
  const page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const search = new URLSearchParams({ q: query, page: String(page), size: '20' })
  if (lesson) search.set('lessonId', lesson)
  const result = useResource<VocabularyResult>('/vocabulary?' + search)
  const lessons = useResource<LessonSummary[]>('/lessons')
  function submit(q: string, id: string) {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (id) next.set('lessonId', id)
    setParams(next)
  }
  function changePage(next: number) {
    const updated = new URLSearchParams(params)
    updated.set('page', String(next)); setParams(updated)
  }
  return <main className="study-page">
    <header className="study-heading"><p className="study-eyebrow">KHÁM PHÁ TIẾNG TRUNG</p><h1>Mỗi ngày, thêm một từ mới.</h1><p>Tìm hiểu Hán tự, cách đọc và cách dùng qua những câu gần gũi.</p></header>
    <VocabularySearchForm key={query + ':' + lesson} initialQuery={query} initialLesson={lesson}
      lessons={lessons.data ?? []} loadingLessons={lessons.loading} onSearch={submit} />
    <p className="study-hint">Có thể nhập pinyin không dấu, ví dụ “xue” hoặc “ni hao”. Dùng “v” cho âm “ü”.</p>
    {lessons.error && <p role="alert">Chưa tải được bộ lọc bài học. <button onClick={lessons.reload}>Thử lại</button></p>}
    {result.loading ? <LoadingState label="Đang tìm từ vựng…" /> : result.error ? <div className="study-error" role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button><button onClick={() => setParams({})}>Xóa bộ lọc</button></div> : result.data && <>
      <p role="status" className="study-count">{result.data.total} từ phù hợp{query && ` với “${query}”`}</p>
      <div className="study-grid">{result.data.items.map(word => <WordCard key={word.id} word={word} />)}</div>
      {result.data.items.length === 0 && <div className="study-empty"><h2>Chưa tìm thấy từ phù hợp</h2><p>Thử một từ khóa ngắn hơn hoặc chọn tất cả bài học.</p><button onClick={() => setParams({})}>Xem tất cả từ</button></div>}
      <div className="study-pagination" aria-label="Phân trang từ vựng"><button disabled={page === 0} onClick={() => changePage(page - 1)}>← Trang trước</button><span>Trang {page + 1} / {Math.max(1, Math.ceil(result.data.total / result.data.size))}</span><button disabled={(page + 1) * result.data.size >= result.data.total} onClick={() => changePage(page + 1)}>Trang sau →</button></div>
    </>}
  </main>
}
