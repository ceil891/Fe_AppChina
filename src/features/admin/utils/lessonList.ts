import type { LessonSummary } from '../../lesson/types/lesson.types'
import { searchText } from './searchText'

export function selectLessons(lessons: LessonSummary[], params: URLSearchParams) {
  const query = searchText(params.get('q') ?? '')
  const publication = params.get('publication')
  const sort = params.get('sort')
  const items = lessons.filter(lesson =>
    (params.get('empty') !== '1' || lesson.wordCount === 0) &&
    (publication !== 'hidden' || lesson.published === false) &&
    (publication !== 'visible' || lesson.published !== false) &&
    searchText(lesson.title + ' ' + lesson.description).includes(query),
  ).sort((a, b) => {
    const order = sort === 'title' ? a.title.localeCompare(b.title, 'vi')
      : sort === 'words' ? a.wordCount - b.wordCount : a.position - b.position
    return order || a.position - b.position || a.id - b.id
  })
  const pages = Math.max(1, Math.ceil(items.length / 20))
  const page = Math.min(Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0), pages - 1)
  return { items, pages, page }
}
