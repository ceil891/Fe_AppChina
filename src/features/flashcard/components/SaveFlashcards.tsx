import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { useResource } from '../../../shared/hooks/useResource'
import { flashcardApi } from '../api/flashcardApi'
import type { Flashcard } from '../types/flashcard.types'
import '../flashcard.css'

export function SaveWordButton({ wordId }: { wordId: number }) {
  const { user } = useAuth(), location = useLocation()
  const saved = useResource<{ card: Flashcard | null }>(user ? `/flashcards/by-word/${wordId}` : null)
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function save() {
    setBusy(true); setError('')
    try { await flashcardApi.save(wordId); saved.reload() }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được từ.') }
    finally { setBusy(false) }
  }
  if (!user) return <Link className="study-primary" to="/login" state={{ from: location.pathname }}>Đăng nhập để lưu ôn tập</Link>
  return <div className="flash-save"><button className="study-primary" disabled={busy || saved.loading || !!saved.error || !!saved.data?.card} onClick={() => void save()}>{busy ? 'Đang lưu…' : saved.loading ? 'Đang kiểm tra…' : saved.data?.card ? 'Đã lưu vào Flashcard' : 'Lưu vào Flashcard'}</button>{saved.data?.card && <Link to="/flashcards">Mở bộ thẻ →</Link>}{(error || saved.error) && <p role="alert">{error || saved.error}{saved.error && <button onClick={saved.reload}>Thử lại</button>}</p>}</div>
}

export function SaveLessonButton({ lessonId, wordCount }: { lessonId: number; wordCount: number }) {
  const { user } = useAuth(), location = useLocation()
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState<number>()
  async function save() {
    setBusy(true); setError('')
    try { const result = await flashcardApi.saveLesson(lessonId); setSaved(result.wordCount) }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa lưu được các từ trong bài.') }
    finally { setBusy(false) }
  }
  if (!wordCount) return null
  return <section className="flash-save-lesson"><div><h2>Ôn lại bằng Flashcard</h2><p>Lưu {wordCount} từ trong bài vào bộ thẻ riêng. Từ đã lưu giữ nguyên lịch ôn.</p></div>{user ? <button className="study-primary" disabled={busy} onClick={() => void save()}>{busy ? 'Đang lưu…' : 'Lưu các từ trong bài'}</button> : <Link className="study-primary" to="/login" state={{ from: location.pathname }}>Đăng nhập để lưu từ</Link>}{saved !== undefined && <p role="status">Đã lưu {saved} từ trong bài. <Link to={`/flashcards/review?lessonId=${lessonId}`}>Ôn ngay →</Link></p>}{error && <p role="alert">{error}</p>}</section>
}
