export type ActivityKind = 'LESSON_COMPLETED' | 'FLASHCARD_REVIEWED' | 'QUIZ_SUBMITTED' | 'SKILL_PRACTICED' | 'FOUNDATION_SUBMITTED'
export interface StudyDay { date: string; completedLessons: number; flashcardReviews: number; submittedQuizzes: number; totalActivities: number }
export interface Activity { id: number; kind: ActivityKind; sourceId: string; occurredAt: string; studyDate: string; label: string; lessonId: number | null; score: number | null; rating: 'REMEMBER' | 'AGAIN' | null }
export interface ActivityPage { items: Activity[]; total: number; page: number; size: number; timeZone: string }
export interface ProgressData {
  timeZone: string; today: string; serverTime: string; nextDayAt: string
  streak: { current: number; longest: number; activeDays: number; lastStudyDate: string | null; studiedToday: boolean }
  totals: { completedLessons: number; flashcardReviews: number; submittedQuizzes: number; averageQuizScore: number | null }
  totalLessons: number
  flashcards: { saved: number; due: number; reviewed: number; nextDueAt: string | null }
  todayActivity: StudyDay; calendar: StudyDay[]; recentActivities: Activity[]
  nextAction: { kind: 'LESSON' | 'QUIZ' | 'FLASHCARDS' | 'FOUNDATION'; label: string; description: string; path: string }
}
