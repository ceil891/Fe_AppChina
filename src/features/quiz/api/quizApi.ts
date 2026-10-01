import { mutate } from '../../../services/api'
import type { QuizAnswer, QuizAttempt, StartQuiz } from '../types/quiz.types'

export const quizApi = {
  start: (input: StartQuiz) => mutate<QuizAttempt>('POST', '/quizzes/attempts', input),
  answer: (id: string, input: QuizAnswer) => mutate<QuizAttempt>('PUT', `/quizzes/attempts/${id}/answers`, input),
  submit: (id: string, version: number) => mutate<QuizAttempt>('POST', `/quizzes/attempts/${id}/submit`, { version }),
}
