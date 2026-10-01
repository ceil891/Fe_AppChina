import { Link, useLocation } from 'react-router-dom'
import type { Word } from '../../lesson/types/lesson.types'

export function WordCard({ word, position }: { word: Word; position?: number }) {
  const location = useLocation()
  return <Link className="study-word" to={`/vocabulary/${word.id}`} state={{ from: location.pathname + location.search }}>
    {position !== undefined && <span className="study-number">{String(position).padStart(2, '0')}</span>}
    <strong lang="zh">{word.hanzi}</strong><span className="study-pinyin">{word.pinyin}</span>
    <span>{word.meaningVi}</span><small>Xem từ & câu ví dụ →</small>
  </Link>
}
