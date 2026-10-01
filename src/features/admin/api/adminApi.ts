import { get, mutate } from '../../../services/api'
import type { Word, LessonSummary, LessonDetail } from '../../lesson/types/lesson.types'
export type WordInput = Omit<Word, 'id'>
export interface LessonInput { title: string; description: string; position: number; wordIds: number[] }
export const adminApi = {
  words: (signal?: AbortSignal) => get<Word[]>('/admin/vocabulary', signal),
  lessons: (signal?: AbortSignal) => get<LessonSummary[]>('/admin/lessons', signal),
  lesson: (id: number) => get<LessonDetail>(`/admin/lessons/${id}`),
  saveWord: (id: number | undefined, body: WordInput) => mutate<Word>(id ? 'PUT' : 'POST', `/admin/vocabulary${id ? '/' + id : ''}`, body),
  deleteWord: (id: number) => mutate<void>('DELETE', `/admin/vocabulary/${id}`),
  saveLesson: (id: number | undefined, body: LessonInput) => mutate<LessonDetail>(id ? 'PUT' : 'POST', `/admin/lessons${id ? '/' + id : ''}`, body),
  deleteLesson: (id: number) => mutate<void>('DELETE', `/admin/lessons/${id}`),
}
