import type { Word } from '../../lesson/types/lesson.types'
export interface Flashcard {
  id: string; word: Word; nextReviewAt: string; lastReviewedAt: string | null
  successStreak: number; reviewCount: number; version: number
}
export interface FlashcardPage {
  items: Flashcard[]; total: number; page: number; size: number; serverTime: string
  stats: { saved: number; due: number; reviewed: number; nextDueAt: string | null }
}
export type Rating = 'REMEMBER' | 'AGAIN'
export interface ReviewInput { requestId: string; rating: Rating; version: number }
export interface FlashcardReview {
  requestId: string; cardId: string; vocabularyId: number; hanzi: string; pinyin: string; meaningVi: string
  rating: Rating; requestVersion: number; resultVersion: number; reviewedAt: string; nextReviewAt: string
  successStreak: number; reviewCount: number
}
export interface ReviewHistory { items: FlashcardReview[]; total: number; page: number; size: number }
