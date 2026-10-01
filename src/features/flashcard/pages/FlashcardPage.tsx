import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useResource } from '../../../shared/hooks/useResource'
import { flashcardApi } from '../api/flashcardApi'
import type { Flashcard, FlashcardPage as CardPage, FlashcardReview, ReviewHistory } from '../types/flashcard.types'
import type { LessonSummary } from '../../lesson/types/lesson.types'
import { ReviewCard } from '../components/ReviewCard'
import '../../../shared/styles/study.css'
import '../flashcard.css'

function date(value: string) { return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) }
function FlashLinks() {
  return <div className="flash-links"><Link to="/flashcards">Bộ thẻ của tôi</Link><Link to="/flashcards/review">Ôn đến hạn</Link><Link to="/flashcards/history">Lịch sử ôn</Link></div>
}
export function FlashcardPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? '', lesson = params.get('lessonId') ?? '', dueOnly = params.get('dueOnly') === 'true'
  const page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const query = new URLSearchParams({ q, dueOnly: String(dueOnly), page: String(page), size: '20' })
  if (lesson) query.set('lessonId', lesson)
  const result = useResource<CardPage>('/flashcards?' + query)
  const lessons = useResource<LessonSummary[]>('/lessons')
  const [pending, setPending] = useState<Flashcard | null>(null)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('')
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }
  async function remove() {
    if (!pending) return
    setBusy(true); setError('')
    try {
      await flashcardApi.archive(pending.id); setPending(null); setMessage('Đã bỏ lưu. Lịch sử và lịch ôn được giữ nếu bạn lưu lại từ này.')
      if (page > 0 && result.data?.items.length === 1) filter('page', String(page - 1)); else result.reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa bỏ lưu được thẻ.') }
    finally { setBusy(false) }
  }
  return <main className="study-page flash-page"><header className="study-heading"><p className="study-eyebrow">MỖI NGÀY MỘT CHÚT</p><h1>Flashcard của tôi</h1><p>Nhớ từ theo nhịp của bạn, ôn lại khi đến hạn.</p></header><FlashLinks />
    {result.data && <div className="flash-stats"><div><strong>{result.data.stats.saved}</strong><span>Từ đã lưu</span></div><div><strong>{result.data.stats.due}</strong><span>Đến hạn ôn</span></div><div><strong>{result.data.stats.reviewed}</strong><span>Thẻ đã ôn ít nhất một lần</span></div></div>}
    <div className="flash-start"><Link className="study-primary" to={'/flashcards/review' + (lesson ? '?lessonId=' + encodeURIComponent(lesson) : '')}>Bắt đầu ôn tập →</Link><Link to="/vocabulary">Thêm từ vào bộ thẻ</Link></div>
    <div className="flash-filters"><label>Tìm trong bộ thẻ<input type="search" maxLength={100} placeholder="Hán tự, pinyin hoặc nghĩa Việt" value={q} onChange={e => filter('q', e.target.value)} /></label><label>Bài học<select value={lesson} onChange={e => filter('lessonId', e.target.value)}><option value="">Tất cả bài học</option>{lessons.data?.map(l => <option value={l.id} key={l.id}>{l.title}</option>)}</select></label><label>Trạng thái<select value={String(dueOnly)} onChange={e => filter('dueOnly', e.target.value)}><option value="false">Tất cả từ đã lưu</option><option value="true">Chỉ thẻ đến hạn</option></select></label></div>
    {lessons.error && <p role="alert">{lessons.error} <button onClick={lessons.reload}>Tải lại bài học</button></p>}
    {message && <p role="status" className="flash-notice">{message}</p>}
    {pending && <div className="flash-notice" role="group" aria-label="Xác nhận bỏ lưu"><p>Bỏ “{pending.word.hanzi}” khỏi bộ thẻ? Thẻ sẽ không còn trong hàng đợi; nhật ký ôn vẫn được giữ.</p><button disabled={busy} onClick={() => void remove()}>Bỏ lưu</button><button disabled={busy} onClick={() => setPending(null)}>Hủy</button>{error && <p role="alert">{error}</p>}</div>}
    {result.loading ? <p role="status">Đang tải bộ thẻ…</p> : result.error ? <div role="alert"><p>{result.error}</p><button onClick={result.reload}>Thử lại</button><button onClick={() => setParams({})}>Xóa bộ lọc</button></div> : result.data && <>
      <p className="study-hint">{result.data.total} thẻ phù hợp. Số liệu phía trên tính theo từ khóa và bài đang lọc.</p>
      <div className="flash-collection">{result.data.items.map(card => <article className="flash-list-card" key={card.id}><div><Link to={`/vocabulary/${card.word.id}`} className="flash-word" lang="zh">{card.word.hanzi}</Link><p className="study-pinyin">{card.word.pinyin}</p><p>{card.word.meaningVi}</p><small>{new Date(card.nextReviewAt) <= new Date(result.data!.serverTime) ? 'Đến hạn ôn' : 'Ôn tiếp: ' + date(card.nextReviewAt)} · {card.reviewCount} lượt ôn</small></div><button disabled={busy} onClick={() => { setPending(card); setError('') }}>Bỏ lưu</button></article>)}</div>
      {result.data.total === 0 && <div className="study-empty"><h2>Chưa có thẻ phù hợp</h2><p>Lưu từ ở trang chi tiết từ hoặc lưu các từ trong một bài học để bắt đầu.</p><Link to="/vocabulary">Mở kho từ vựng →</Link></div>}
      <div className="study-pagination"><button disabled={page === 0} onClick={() => filter('page', String(page - 1))}>← Trang trước</button><span>Trang {page + 1}/{Math.max(1, Math.ceil(result.data.total / 20))}</span><button disabled={(page + 1) * 20 >= result.data.total} onClick={() => filter('page', String(page + 1))}>Trang sau →</button></div>
    </>}
  </main>
}

export function FlashcardReviewPage() {
  const [params] = useSearchParams()
  const lesson = params.get('lessonId')
  const queue = useResource<CardPage>('/flashcards?dueOnly=true&size=20' + (lesson ? '&lessonId=' + encodeURIComponent(lesson) : ''))
  const [last, setLast] = useState<FlashcardReview>()
  return <main className="study-page flash-page"><FlashLinks /><header className="study-heading"><p className="study-eyebrow">ÔN TẬP CÓ KHOẢNG CÁCH</p><h1>Một thẻ, một bước tiến</h1><p>Nhìn Hán tự, tự nhớ cách đọc và nghĩa, rồi lật thẻ để đối chiếu.</p></header>
    {last && <p className="flash-notice" role="status">Đã ghi nhận “{last.hanzi}” · {last.rating === 'REMEMBER' ? 'Nhớ' : 'Chưa nhớ'}. Ôn tiếp: {date(last.nextReviewAt)}.</p>}
    {queue.loading ? <p role="status">Đang lấy thẻ đến hạn…</p> : queue.error ? <div role="alert"><p>{queue.error}</p><button onClick={queue.reload}>Thử lại</button></div> : queue.data && <>
      {queue.data.items[0] ? <><p className="flash-queue-count">{queue.data.stats.due} thẻ đến hạn{lesson ? ' trong bài đã chọn' : ''}</p><ReviewCard key={queue.data.items[0].id + ':' + queue.data.items[0].version} card={queue.data.items[0]} onRecorded={r => { setLast(r); queue.reload() }} onReload={queue.reload} /></> : <section className="flash-review-card"><p className="study-eyebrow">BẠN ĐÃ BẮT KỊP LỊCH ÔN</p><h2>Chưa có thẻ đến hạn</h2><p>{queue.data.stats.nextDueAt ? 'Lần ôn gần nhất: ' + date(queue.data.stats.nextDueAt) : 'Lưu thêm từ từ kho hoặc bài học để bắt đầu.'}</p><button onClick={queue.reload}>Kiểm tra lại</button><Link to="/vocabulary">Khám phá từ vựng →</Link></section>}
    </>}
    <p className="study-hint">“Chưa nhớ”: 10 phút. “Nhớ” liên tiếp: 1, 3, 7, 14, tối đa 30 ngày. Đây là lịch ôn đơn giản, không phải đánh giá mức thành thạo.</p>
  </main>
}

export function FlashcardHistoryPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const history = useResource<ReviewHistory>(`/flashcards/reviews?page=${page}&size=20`)
  return <main className="study-page flash-page"><FlashLinks /><header className="study-heading"><p className="study-eyebrow">NHÌN LẠI HÀNH TRÌNH</p><h1>Lịch sử ôn tập</h1><p>Mỗi câu trả lời đã lưu là một lượt ôn riêng của bạn.</p></header>
    {history.loading ? <p role="status">Đang tải lịch sử…</p> : history.error ? <div role="alert"><p>{history.error}</p><button onClick={history.reload}>Thử lại</button></div> : history.data && <><p>{history.data.total} lượt ôn đã ghi nhận</p><div className="flash-collection">{history.data.items.map(review => <article className="flash-history-row" key={review.requestId}><div><strong lang="zh">{review.hanzi}</strong><span>{review.pinyin} · {review.meaningVi}</span><small>{date(review.reviewedAt)} · Lịch đã đặt: {date(review.nextReviewAt)}</small></div><span className={'flash-rating-label ' + review.rating.toLowerCase()}>{review.rating === 'REMEMBER' ? 'Nhớ' : 'Chưa nhớ'}</span></article>)}</div>{history.data.total === 0 && <p className="study-empty">Chưa có lượt ôn. Bắt đầu với các thẻ đến hạn của bạn.</p>}<div className="study-pagination"><button disabled={page === 0} onClick={() => setParams({ page: String(page - 1) })}>← Trang trước</button><span>Trang {page + 1}/{Math.max(1, Math.ceil(history.data.total / 20))}</span><button disabled={(page + 1) * 20 >= history.data.total} onClick={() => setParams({ page: String(page + 1) })}>Trang sau →</button></div></>}
  </main>
}
