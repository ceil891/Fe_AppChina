import type { ActivityKind } from '../types/progress.types'

export const activityNames: Record<ActivityKind, string> = { LESSON_COMPLETED: 'Hoàn thành bài', FLASHCARD_REVIEWED: 'Ôn Flashcard', QUIZ_SUBMITTED: 'Nộp Quiz', SKILL_PRACTICED: 'Luyện kỹ năng', FOUNDATION_SUBMITTED: 'Luyện nhập môn Pinyin' }
export function studyDateLabel(date: string) { return new Date(date + 'T00:00:00Z').toLocaleDateString('vi-VN', { timeZone: 'UTC', day: '2-digit', month: '2-digit' }) }
