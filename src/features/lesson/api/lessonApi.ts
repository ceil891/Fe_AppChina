import { get } from '../../../services/api'
import type { LessonSummary, LessonDetail } from '../types/lesson.types'

export const lessonApi = {
  list: (signal?: AbortSignal) => get<LessonSummary[]>('/lessons', signal),
  detail: (id: number, signal?: AbortSignal) => get<LessonDetail>(`/lessons/${id}`, signal),
}
