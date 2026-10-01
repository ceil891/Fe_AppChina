import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthContext'
import { useResource } from '../../shared/hooks/useResource'
import { ApiError, mutate } from '../../services/api'
import { ListenButton } from '../skills/AudioPractice'
import { foundationPath } from './types'
import type { Lesson, FoundationCard, FoundationProgress, QuizResult } from './types'
import '../../shared/styles/study.css'
import './foundations.css'

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Không thực hiện được. Hãy thử lại.'

export function FoundationCards() {
  const { user } = useAuth()
  const lessons = useResource<FoundationCard[]>('/foundations')
  const progress = useResource<FoundationProgress[]>(user ? '/foundation-progress' : null)
  if (lessons.loading) return <p role="status">Đang tải lộ trình nhập môn…</p>
  if (lessons.error) return <p role="alert">{lessons.error} <button onClick={lessons.reload}>Thử lại</button></p>
  return <>{progress.error && <p role="alert">Chưa tải được tiến độ. <button onClick={progress.reload}>Thử lại</button></p>}
    {!lessons.data?.length && <p>Chưa có bài nhập môn được xuất bản.</p>}
    <div className="foundation-cards">{lessons.data?.map((lesson, index) => {
      const saved = progress.data?.find(item => item.slug === lesson.slug)
      return <Link className="foundation-card" to={foundationPath(lesson.slug)} key={lesson.slug}>
        <span className="foundation-symbol" aria-hidden="true">{lesson.symbol}</span>
        <div><small>BÀI {String(index + 1).padStart(2, '0')} · KHOẢNG {lesson.minutes} PHÚT</small><h3>{lesson.title}</h3><p>{lesson.subtitle}</p>
          {saved && <p className="foundation-status">{saved.completedAt ? `Đã hoàn thành · Điểm tốt nhất ${saved.bestScore}/100` : 'Đang học · Có vị trí đọc đã lưu'}</p>}</div><span aria-hidden="true">↗</span>
      </Link>
    })}</div></>
}

export function FoundationProgressOverview() {
  const { user } = useAuth()
  const progress = useResource<FoundationProgress[]>(user ? '/foundation-progress' : null)
  const lessons = useResource<FoundationCard[]>(user ? '/foundations' : null)
  if (!user) return null
  const visible = lessons.data ?? [], records = progress.data ?? []
  const completed = visible.filter(lesson => records.some(p => p.slug === lesson.slug && p.completedAt)).length
  const resume = records.find(p => !p.completedAt && visible.some(lesson => lesson.slug === p.slug))
  const next = visible.find(lesson => lesson.slug === resume?.slug) ?? visible.find(lesson => !records.some(p => p.slug === lesson.slug && p.completedAt))
  return <section className="learner-next foundation-overview"><div><p className="study-eyebrow">TIẾN ĐỘ NHẬP MÔN</p><h2>Pinyin của bạn</h2>
    {progress.loading || lessons.loading ? <p role="status">Đang tải tiến độ nhập môn…</p> : progress.error || lessons.error ? <p role="alert">Chưa tải được tiến độ. <button onClick={() => { progress.reload(); lessons.reload() }}>Thử lại</button></p> : <p>{completed}/{visible.length} bài đang xuất bản đã hoàn thành.{next ? ` Tiếp theo: ${next.title}.` : visible.length ? ' Bạn có thể ôn lại hoặc học theo chủ đề.' : ' Chưa có bài được xuất bản.'}</p>}
    <p>Hoàn thành khi nộp đủ câu tự kiểm tra; mỗi ngày luyện tập được tính vào chuỗi ngày học.</p></div>
    {!progress.loading && !lessons.loading && !progress.error && !lessons.error && <Link className="study-primary" to={next ? foundationPath(next.slug) : '/foundations'}>{next ? 'Tiếp tục nhập môn →' : 'Xem lộ trình →'}</Link>}
  </section>
}

export function FoundationsPage() {
  return <main className="study-page foundations-page">
    <header className="study-heading"><p className="study-eyebrow">BƯỚC ĐẦU TIÊN · DÀNH CHO NGƯỜI MỚI</p><h1>Chào tiếng Trung.<br />Bắt đầu từ những âm đầu tiên.</h1><p>Từng bài nhỏ giúp bạn hiểu Pinyin, luyện khẩu hình và đọc những lời chào đầu tiên. Chọn bài để bắt đầu hoặc tiếp tục học.</p></header>
    <aside className="foundation-note"><strong>Tiếng Trung có “bảng chữ cái” không?</strong><p>Tiếng Trung dùng chữ Hán. Phần này hướng dẫn bảng âm Pinyin — cách ghi âm tiếng Phổ thông bằng chữ Latin để bạn học phát âm.</p></aside>
    <Link className="study-primary" to="/practice#pinyin">Luyện nghe và thu âm Pinyin →</Link><FoundationProgressOverview /><h2>Lộ trình nhập môn</h2><FoundationCards />
    <section className="study-finish"><div><h2>Đã quen với Pinyin?</h2><p>Học từ và câu qua các chủ đề gần gũi.</p></div><Link className="study-primary" to="/lessons">Khám phá bài theo chủ đề →</Link></section>
  </main>
}

export function ResultReview({ result }: { result: QuizResult }) {
  return <div className="foundation-result"><p role="status"><strong>{result.score}/100 điểm · Đúng {result.correctCount}/{result.total} câu</strong> · {result.saved ? 'Đã lưu vào tài khoản' : 'Lượt thử của khách, chưa lưu vào tài khoản'}</p>
    {result.questions.map((q, index) => <div key={index} className="foundation-answer"><strong>{index + 1}. {q.prompt}</strong><p>Bạn chọn: {q.options[q.selected]} · {q.selected === q.correct ? 'Đúng rồi.' : `Cần ôn lại. Đáp án: ${q.options[q.correct]}.`}</p><p>{q.explanation}</p></div>)}
  </div>
}

export function FoundationQuiz({ lesson, signedIn = false, onSaved = () => {}, onReload = () => {} }: { lesson: Lesson; signedIn?: boolean; onSaved?: () => void; onReload?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [conflict, setConflict] = useState(false)
  const [pending, setPending] = useState(false)
  const inFlight = useRef(false)
  const request = useRef<{ requestId: string; lessonVersion: number; answers: number[] } | null>(null)
  const complete = lesson.questions.every((_, index) => answers[index] !== undefined)
  async function submit() {
    if (!complete || inFlight.current || conflict) return
    inFlight.current = true; setBusy(true); setError('')
    request.current ??= { requestId: crypto.randomUUID(), lessonVersion: lesson.version, answers: lesson.questions.map((_, index) => answers[index]) }
    setPending(true)
    try { const saved = await mutate<QuizResult>('POST', `/foundations/${lesson.slug}/check`, request.current); setResult(saved); onSaved() }
    catch (e) { setError(errorMessage(e)); setConflict(e instanceof ApiError && (e.status === 409 || e.status === 404)) }
    finally { inFlight.current = false; setBusy(false) }
  }
  return <section className="foundation-check" aria-labelledby="foundation-check-title"><p className="study-eyebrow">THỬ MỘT CHÚT</p><h2 id="foundation-check-title">Bạn nhớ được gì?</h2>
    <p>{signedIn ? 'Nộp đủ câu để lưu điểm và hoàn thành bài. Bạn có thể làm lại để ôn tập; điểm tốt nhất được giữ.' : 'Bạn đang học thử. Đăng nhập trước khi làm bài để lưu điểm và tiến độ vào tài khoản.'}</p>
    {result ? <><ResultReview result={result} /><button onClick={() => { setResult(null); setAnswers({}); request.current = null; setPending(false) }}>Làm lại</button></> : <form onSubmit={event => { event.preventDefault(); void submit() }}>
      {lesson.questions.map((question, index) => <fieldset key={index} disabled={busy || pending}><legend>{index + 1}. {question.prompt}</legend>
        {question.options.map((option, optionIndex) => <label key={optionIndex}><input type="radio" name={`foundation-question-${index}`} required checked={answers[index] === optionIndex} onChange={() => setAnswers(current => ({ ...current, [index]: optionIndex }))} />{option}</label>)}
      </fieldset>)}
      <button className="study-primary" type="submit" disabled={!complete || busy || conflict}>{busy ? 'Đang lưu kết quả…' : pending ? 'Thử nộp lại' : 'Kiểm tra đáp án'}</button>
      {error && <p role="alert">{error}</p>}{conflict && <button type="button" onClick={onReload}>Tải lại nội dung bài</button>}
    </form>}
  </section>
}

export function ToneChart() {
  const tones = [{ name: 'Thanh 1', sample: 'mā', line: 'M10 15 L110 15', label: 'Cao, ngang' }, { name: 'Thanh 2', sample: 'má', line: 'M10 55 L110 15', label: 'Đi lên' }, { name: 'Thanh 3', sample: 'mǎ', line: 'M10 45 L50 70 L110 25', label: 'Xuống, rồi lên khi đọc riêng' }, { name: 'Thanh 4', sample: 'mà', line: 'M10 15 L110 70', label: 'Đi xuống' }]
  return <section aria-label="Đường cao độ bốn thanh điệu" className="tone-chart">{tones.map(tone => <div key={tone.name}><strong>{tone.name} · {tone.sample}</strong><svg viewBox="0 0 120 85" role="img" aria-label={tone.label}><path d="M10 15H110 M10 45H110 M10 70H110" stroke="#eadfd5" strokeDasharray="3 4" /><path d={tone.line} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{tone.label}</span></div>)}</section>
}

export function FoundationLessonPage() {
  const { slug } = useParams(), { user } = useAuth()
  const lesson = useResource<Lesson>(`/foundations/${encodeURIComponent(slug ?? '')}`)
  const cards = useResource<FoundationCard[]>('/foundations')
  const progress = useResource<FoundationProgress[]>(user ? '/foundation-progress' : null)
  return <main className="study-page foundations-page"><Link className="study-back" to="/foundations">← Lộ trình nhập môn</Link>
    {lesson.loading ? <p role="status">Đang tải bài nhập môn…</p> : lesson.error ? <div role="alert"><h1>Chưa mở được bài nhập môn</h1><p>{lesson.error}</p><button onClick={lesson.reload}>Thử lại</button></div> : lesson.data && <LessonBody key={`${slug}-${lesson.data.version}-${user?.id ?? 'guest'}`} lesson={lesson.data} cards={cards.data ?? []} saved={progress.data?.find(p => p.slug === slug)} progressReady={!progress.loading && !progress.error} progressError={progress.error} reloadProgress={progress.reload} reloadLesson={lesson.reload} signedIn={!!user} />}
  </main>
}

function LessonBody({ lesson, cards, saved, progressReady, progressError, reloadProgress, reloadLesson, signedIn }: { lesson: Lesson; cards: FoundationCard[]; saved?: FoundationProgress; progressReady: boolean; progressError?: string; reloadProgress: () => void; reloadLesson: () => void; signedIn: boolean }) {
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState('')
  const saving = useRef(false)
  const index = cards.findIndex(card => card.slug === lesson.slug)
  const next = index >= 0 ? cards[index + 1] : undefined, previous = index > 0 ? cards[index - 1] : undefined
  async function bookmark(sectionIndex: number) {
    if (saving.current || !progressReady) return
    saving.current = true; setBusy(true); setNotice(''); setError('')
    try { await mutate('PUT', `/foundation-progress/${lesson.slug}`, { sectionIndex, lessonVersion: lesson.version, version: saved?.version ?? 0 }); setNotice('Đã lưu vị trí đọc vào tài khoản.'); reloadProgress() }
    catch (e) { setError(errorMessage(e)); reloadProgress() }
    finally { saving.current = false; setBusy(false) }
  }
  return <><header className="study-heading"><p className="study-eyebrow">NHẬP MÔN · KHOẢNG {lesson.minutes} PHÚT</p><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></header>
    {signedIn ? <aside className="foundation-note">{!progressReady && !progressError && <p role="status">Đang tải vị trí học…</p>}{progressError && <p role="alert">{progressError} <button onClick={reloadProgress}>Thử lại</button></p>}
      {saved && <><p>{saved.completedAt ? `Đã hoàn thành · Điểm tốt nhất ${saved.bestScore}/100 · ${saved.attempts} lượt` : 'Bạn đã bắt đầu bài này.'}</p>{saved.lessonVersion === lesson.version ? <a href={`#foundation-section-${saved.sectionIndex}`}>Tiếp tục tại: {lesson.sections[saved.sectionIndex]?.title}</a> : <p>Nội dung bài đã được cập nhật. Hãy đọc lại từ đầu; kết quả trước đây vẫn được giữ.</p>}</>}
      {progressReady && !saved && <p>Bấm “Lưu vị trí đọc” dưới một phần để lần sau học tiếp.</p>}</aside> : <p><Link to="/login" state={{ from: foundationPath(lesson.slug) }}>Đăng nhập để lưu vị trí học và điểm →</Link></p>}
    <div className="foundation-reading">{lesson.sections.map((section, sectionIndex) => <section id={`foundation-section-${sectionIndex}`} key={sectionIndex}><h2>{section.title}</h2><p>{section.text}</p>{signedIn && <button disabled={busy || !progressReady} onClick={() => void bookmark(sectionIndex)}>Lưu vị trí đọc: phần {sectionIndex + 1}</button>}</section>)}</div>
    {notice && <p role="status">{notice}</p>}{error && <p role="alert">{error} <button onClick={reloadLesson}>Tải lại bài</button></p>}
    {!!lesson.groups.length && <section className="foundation-groups" aria-label="Bảng âm Pinyin">{lesson.groups.map((group, i) => <article key={i}><h3>{group.title}</h3><div className="sound-chips">{group.sounds.split(/\s+/).map((sound, j) => <span key={j}>{sound}</span>)}</div><p>{group.note}</p></article>)}</section>}
    {lesson.toneChart && <ToneChart />}
    <section className="foundation-examples"><h2>Nhìn âm · nghe ví dụ · đọc lại</h2><p>Nghe ví dụ rồi đọc lại. Chọn “Đọc chậm” để nghe rõ hơn.</p><div className="sound-examples">{lesson.examples.map((example, i) => <article key={i}><span className="sound-symbol">{example.symbol}</span><p className="sound-pinyin">{example.pinyin}</p><p><span lang="zh-CN">{example.hanzi}</span> · {example.meaning}</p><p>{example.tip}</p><div className="word-pronunciation"><ListenButton key={example.audioSrc + example.hanzi} text={example.hanzi} audioSrc={example.audioSrc} label="▶ Nghe phát âm" /></div></article>)}</div></section>
    <FoundationQuiz lesson={lesson} signedIn={signedIn} onSaved={reloadProgress} onReload={reloadLesson} />
    {saved?.lastResult && <details className="foundation-saved-result"><summary>Kết quả đã lưu gần nhất · {new Date(saved.lastResult.submittedAt).toLocaleString('vi-VN')}</summary><p>Kết quả của nội dung tại thời điểm nộp.</p><ResultReview result={saved.lastResult} /></details>}
    <nav className="foundation-pagination" aria-label="Chuyển bài nhập môn">{previous ? <Link to={foundationPath(previous.slug)}>← {previous.title}</Link> : <Link to="/foundations">← Tất cả bài nhập môn</Link>}<Link className="study-primary" to={next ? foundationPath(next.slug) : '/foundations'}>{next ? `Bài tiếp: ${next.title}` : 'Về lộ trình nhập môn'} →</Link></nav>
    <p className="study-hint">Hoàn thành bài ghi nhận khi nộp đủ câu, không phải chứng nhận thành thạo. Nộp bài bằng tài khoản học viên được tính vào chuỗi ngày học; nhiều lượt trong ngày vẫn chỉ tính một ngày.</p>
    <details className="foundation-sources"><summary>Tài liệu tham khảo phát âm</summary><p>Các bài nhập môn ban đầu được đối chiếu với <a href="https://chinese.yabla.com/chinese-pinyin-chart.php" target="_blank" rel="noreferrer">bảng Pinyin của Yabla</a>, <a href="https://www.open.edu/openlearn/mod/oucontent/view.php?id=106502&section=3.3" target="_blank" rel="noreferrer">bài thanh điệu của Open University</a> và <a href="https://ocw.mit.edu/courses/res-21g-003-learning-chinese-a-foundation-course-in-mandarin-spring-2011/" target="_blank" rel="noreferrer">khóa nhập môn Mandarin của MIT</a>.</p></details>
  </>
}
