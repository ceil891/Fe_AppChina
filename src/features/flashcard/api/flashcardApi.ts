import { mutate } from '../../../services/api'
import type { Flashcard, FlashcardReview, ReviewInput } from '../types/flashcard.types'
export const flashcardApi = {
  save: (vocabularyId: number) => mutate<Flashcard>('POST', '/flashcards', { vocabularyId }),
  saveLesson: (lessonId: number) => mutate<{ wordCount: number }>('POST', `/flashcards/lessons/${lessonId}`),
  archive: (id: string) => mutate<void>('DELETE', '/flashcards/' + id),
  review: (id: string, body: ReviewInput) => mutate<FlashcardReview>('POST', `/flashcards/${id}/reviews`, body),
}
