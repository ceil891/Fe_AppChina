import { get, mutate } from '../../../services/api'
export interface LearningRecord { id: string; lessonId: number; note: string; completedAt: string | null }
export const learningApi = {
  list: (signal?: AbortSignal) => get<LearningRecord[]>('/learning-records', signal),
  create: (lessonId: number, note: string) => mutate<LearningRecord>('POST', '/learning-records', { lessonId, note }),
  update: (id: string, note: string) => mutate<LearningRecord>('PATCH', '/learning-records/' + id, { note }),
  complete: (lessonId: number) => mutate<LearningRecord>('POST', '/learning-records/complete', { lessonId }),
}
