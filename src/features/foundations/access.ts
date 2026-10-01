import type { FoundationCard } from './types'

export function foundationAccess(lessons: FoundationCard[] = []) {
  return {
    total: lessons.length,
    completed: lessons.filter(lesson => lesson.completed).length,
    unlocked: lessons.length > 0 && lessons.every(lesson => lesson.completed && !lesson.locked),
    next: lessons.find(lesson => !lesson.locked && !lesson.completed),
  }
}
