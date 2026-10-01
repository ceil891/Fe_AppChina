export interface LessonSummary {
  id: number
  title: string
  description: string
  position: number
  wordCount: number
  published?: boolean
}
export interface Word {
  id: number
  hanzi: string
  pinyin: string
  meaningVi: string
  exampleHanzi: string
  examplePinyin: string
  exampleMeaningVi: string
}
export interface LessonDetail { lesson: LessonSummary; words: Word[] }
