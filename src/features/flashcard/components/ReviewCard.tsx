import { useRef, useState } from 'react'
import { flashcardApi } from '../api/flashcardApi'
import { ApiError } from '../../../services/api'
import type { Flashcard, FlashcardReview, Rating, ReviewInput } from '../types/flashcard.types'

export function ReviewCard({ card, onRecorded, onReload }: { card: Flashcard; onRecorded: (r: FlashcardReview) => void; onReload: () => void }) {
  const [revealed, setRevealed] = useState(false)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false)
  const pending = useRef<ReviewInput | null>(null)
  const lock = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  async function submit(rating: Rating) {
    if (lock.current || !revealed) return
    lock.current = true; setBusy(true); setError(''); setConflict(false)
    // A failed/uncertain request retains its key and answer until acknowledged or the queue is reloaded.
    pending.current ??= { requestId: crypto.randomUUID(), rating, version: card.version }
    try { const result = await flashcardApi.review(card.id, pending.current); pending.current = null; onRecorded(result) }
    catch (e) { setError(e instanceof Error ? e.message : 'Chưa xác nhận được lượt ôn.'); setConflict(e instanceof ApiError && e.status === 409) }
    finally { setBusy(false); lock.current = false }
  }
  return <section className="flash-review-card" aria-label="Thẻ ôn tập">
    <p className="study-eyebrow">{revealed ? 'ĐỐI CHIẾU CÂU TRẢ LỜI' : 'BẠN CÒN NHỚ TỪ NÀY KHÔNG?'}</p>
    <h2 lang="zh" ref={heading} tabIndex={-1}>{card.word.hanzi}</h2>
    {!revealed ? <><p className="flash-prompt">Thử nhớ cách đọc và nghĩa tiếng Việt trước khi lật thẻ.</p><button className="study-primary" aria-controls="flash-answer" aria-expanded={false} onClick={() => { setRevealed(true); heading.current?.focus() }}>Lật thẻ · Xem đáp án</button></> : <div id="flash-answer">
      <p className="study-pinyin">{card.word.pinyin}</p><p className="flash-meaning">{card.word.meaningVi}</p>
      <div className="flash-example"><p lang="zh">{card.word.exampleHanzi}</p><p>{card.word.examplePinyin}</p><p>{card.word.exampleMeaningVi}</p></div>
      {!error && <div className="flash-rating"><button disabled={busy} onClick={() => void submit('AGAIN')}>Chưa nhớ<small>Ôn lại sau 10 phút</small></button><button className="study-primary" disabled={busy} onClick={() => void submit('REMEMBER')}>Nhớ<small>Ôn sau {[1, 3, 7, 14, 30][Math.min(card.successStreak, 4)]} ngày</small></button></div>}
      {busy && <p role="status">Đang lưu lượt ôn…</p>}
      {error && <div className="flash-error" role="alert"><p>{error}</p><p>Bạn có thể thử lại; cùng một câu trả lời sẽ chỉ được ghi nhận một lần.</p>{!conflict && <button disabled={busy} onClick={() => void submit(pending.current?.rating ?? 'AGAIN')}>Gửi lại câu trả lời vừa chọn</button>}<button disabled={busy} onClick={onReload}>Tải lại hàng đợi</button></div>}
    </div>}
  </section>
}
