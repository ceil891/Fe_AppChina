export interface QuizSet { id: number; title: string; description: string; lessonId: number | null; questionCount: number }
export interface QuizChoice { id: string; text: string }
export interface QuizQuestion {
  id: string; position: number; type: 'CHOOSE_MEANING' | 'CHOOSE_WORD'; prompt: string; options: QuizChoice[]
  selectedOptionId?: string; correctOptionId?: string; correct?: boolean; explanation?: string
}
export interface QuizSummary {
  id: string; setId: number; title: string; status: 'IN_PROGRESS' | 'SUBMITTED'; questionCount: number; answeredCount: number
  version: number; createdAt: string; submittedAt: string | null; correctCount: number | null; score: number | null
}
export interface QuizAttempt { attempt: QuizSummary; questions: QuizQuestion[] }
export interface QuizAttemptPage { items: QuizSummary[]; total: number; page: number; size: number }
export interface StartQuiz { requestId: string; setId: number; questionCount: number }
export interface QuizAnswer { requestId: string; questionId: string; optionId: string; version: number }
