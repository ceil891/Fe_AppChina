import type { Word, LessonSummary } from '../../lesson/types/lesson.types'
export interface VocabularyResult { items: Word[]; total: number; page: number; size: number }
export interface VocabularyDetail { word: Word; lessons: LessonSummary[] }
