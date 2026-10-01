import { useState } from 'react'
import type { LessonSummary } from '../../lesson/types/lesson.types'

interface Props {
  initialQuery: string
  initialLesson: string
  lessons: LessonSummary[]
  loadingLessons: boolean
  onSearch: (query: string, lesson: string) => void
}

export function VocabularySearchForm({ initialQuery, initialLesson, lessons, loadingLessons, onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [lesson, setLesson] = useState(initialLesson)
  const missingSelection = lesson && !lessons.some(item => String(item.id) === lesson)
  return <form className="study-search" onSubmit={event => { event.preventDefault(); onSearch(query.trim(), lesson) }}>
    <label>Tìm từ vựng<input type="search" value={query} onChange={event => setQuery(event.target.value)} maxLength={100} placeholder="Hán tự, pinyin hoặc nghĩa Việt…" /></label>
    <label>Theo bài học<select value={lesson} onChange={event => setLesson(event.target.value)} disabled={loadingLessons}>
      <option value="">Tất cả bài học</option>
      {missingSelection && <option value={lesson}>{loadingLessons ? 'Đang tải bài đã chọn…' : 'Bài đã chọn không có trong danh sách'}</option>}
      {lessons.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select></label>
    <button className="study-primary" type="submit">Tìm kiếm</button>
  </form>
}
