export interface Section { title: string; text: string }
export interface SoundGroup { title: string; sounds: string; note: string }
export interface Example { symbol: string; pinyin: string; hanzi: string; meaning: string; tip: string; audioSrc: string }
export interface Question { prompt: string; options: string[] }
export interface EditorialQuestion extends Question { correct: number; explanation: string }
export interface FoundationCard { slug: string; title: string; subtitle: string; minutes: number; symbol: string; position: number; version: number }
export interface Lesson extends Omit<FoundationCard, 'position'> { sections: Section[]; groups: SoundGroup[]; examples: Example[]; questions: Question[]; toneChart: boolean }
export interface Content extends Omit<Lesson, 'version' | 'questions'> { questions: EditorialQuestion[] }
export interface EditorialDetail { content: Content; position: number; published: boolean; version: number }
export interface Review extends Question { selected: number; correct: number; explanation: string }
export interface QuizResult { requestId: string; slug: string; title: string; lessonVersion: number; correctCount: number; total: number; score: number; submittedAt: string; saved: boolean; questions: Review[] }
export interface FoundationProgress { slug: string; sectionIndex: number; lessonVersion: number; version: number; bestScore: number | null; lastScore: number | null; attempts: number; completedAt: string | null; updatedAt: string; lastResult: QuizResult | null }
export const foundationPath = (slug: string) => `/foundations/${slug}`
