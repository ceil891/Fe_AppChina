import { Link, useLocation, useParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import type { VocabularyDetail } from '../types/vocabulary.types'
import { wordReturnPath } from '../utils/studyNavigation'
import '../../../shared/styles/study.css'
import { SaveWordButton } from '../../flashcard/components/SaveFlashcards'
import { PronunciationButton } from '../components/PronunciationButton'

export function VocabularyDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const returnTo = wordReturnPath(location.state?.from)
  const { data, loading, error, reload } = useResource<VocabularyDetail>('/vocabulary/' + encodeURIComponent(id ?? ''))
  return <main className="study-page">
    <Link className="study-back" to={returnTo}>{returnTo.startsWith('/lessons/') ? '← Về bài học' : '← Về danh sách từ vựng'}</Link>
    {loading ? <p role="status">Đang tải từ vựng…</p> : error ? <div role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button></div> : data && <>
      <section className="study-definition"><p className="study-eyebrow">TỪ VỰNG TIẾNG TRUNG</p><h1 lang="zh">{data.word.hanzi}</h1><p className="study-pinyin">{data.word.pinyin}</p><PronunciationButton text={data.word.hanzi} /><p className="study-meaning">{data.word.meaningVi}</p></section>
      <SaveWordButton key={data.word.id} wordId={data.word.id} />
      <section className="study-example"><h2>Dùng từ trong câu</h2><p lang="zh">{data.word.exampleHanzi}</p><p className="study-pinyin">{data.word.examplePinyin}</p><p>{data.word.exampleMeaningVi}</p></section>
      <section className="study-related"><h2>Học từ này trong bài</h2>{data.lessons.length ? data.lessons.map(lesson => <Link key={lesson.id} to={`/lessons/${lesson.id}`}>Bài {lesson.position} · {lesson.title}<span>Tiếp tục học →</span></Link>) : <p>Từ này chưa được gắn vào bài học.</p>}</section>
    </>}
  </main>
}
