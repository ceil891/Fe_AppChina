import type { LearningRecord } from '../progress/api/learningApi'
export function courseProgress<T extends { id: number }>(lessons: T[], records: LearningRecord[]) {
 const completed = new Set(records.filter(r => r.completedAt).map(r => r.lessonId))
 const started = records.find(r => !r.completedAt && lessons.some(l => l.id === r.lessonId))
 const next = lessons.find(l => l.id === started?.lessonId) ?? lessons.find(l => !completed.has(l.id))
 const count = lessons.filter(l => completed.has(l.id)).length
 return { completed, next, count, percent: lessons.length ? Math.round(count / lessons.length * 100) : 0 }
}
export function lessonPath(id: number, courseId?: string) {
 return '/lessons/' + id + (courseId && /^[1-9]\d*$/.test(courseId) ? '?courseId=' + courseId : '')
}
