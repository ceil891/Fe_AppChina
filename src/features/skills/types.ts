export type Skill = 'LISTENING' | 'SPEAKING' | 'READING' | 'WRITING'
export const skillNames: Record<Skill, string> = { LISTENING: 'Nghe', SPEAKING: 'Nói', READING: 'Đọc', WRITING: 'Viết' }
export const skillDescriptions: Record<Skill, string> = {
  LISTENING: 'Nghe câu tiếng Trung và nhận biết ý nghĩa.', SPEAKING: 'Nghe mẫu, thu âm và tự đánh giá phát âm.',
  READING: 'Đọc đoạn văn và tìm thông tin chính.', WRITING: 'Nhập Hán tự và luyện thứ tự từ trong câu.',
}
export const ratingNames: Record<string, string> = { AGAIN: 'Cần luyện thêm', OK: 'Đọc được', CONFIDENT: 'Tự tin' }
export interface Exercise { id: string; skill: Skill; title: string; description: string; questionCount: number }
export interface SkillStat { skill: Skill; attempts: number; completedExercises: number; averageScore: number | null; bestScore: number | null; lastPracticedAt: string | null }
export interface Summary { id: string; exerciseId: string; skill: Skill; title: string; score: number | null; createdAt: string; submittedAt: string | null }
export interface Question { id: string; prompt: string; text: string; hint: string; options: string[]; answer: string | null; correct: boolean | null; accepted: string[] | null; explanation: string | null; audioSrc?: string | null }
export interface Attempt { summary: Summary; description: string; questions: Question[]; draftVersion: number }
export interface History { items: Summary[]; total: number; page: number; size: number }
