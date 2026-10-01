import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthContext'
import { useResource } from '../../shared/hooks/useResource'
import { ApiError, mutate } from '../../services/api'
import { FoundationSoundLab } from './FoundationSoundLab'
import { Icon } from '../../shared/components/Icon'
import { LoadingState } from '../../shared/components/LoadingState'
import { foundationPath } from './types'
import type { Lesson, FoundationCard, FoundationProgress, QuizResult } from './types'
import '../../shared/styles/study.css'
import './foundations.css'
import './foundation-lesson.css'

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Không thực hiện được. Hãy thử lại.'

export function FoundationCards({ limit }: { limit?: number } = {}) {
  const lessons = useResource<FoundationCard[]>('/foundations')
  if (lessons.loading) return <LoadingState label="Đang tải lộ trình nhập môn…" />
  if (lessons.error) return <p role="alert">{lessons.error} <button onClick={lessons.reload}>Thử lại</button></p>
  return <>
    {!lessons.data?.length && <p>Chưa có bài nhập môn được xuất bản.</p>}
    <FoundationCardList lessons={limit ? lessons.data?.slice(0, limit) ?? [] : lessons.data ?? []} /></>
}

export function FoundationCardList({ lessons }: { lessons: FoundationCard[] }) {
  return <ol className="foundation-cards">{lessons.map((lesson, index) => {
    const content = <><div className="foundation-card-top"><span className="foundation-step">Bài {String(index + 1).padStart(2, '0')}</span><span className="foundation-badge"><Icon name={lesson.locked ? 'lock' : lesson.completed ? 'check' : 'book'} width="14" height="14" />{lesson.locked ? 'Chưa mở khóa' : lesson.completed ? 'Đã hoàn thành' : 'Sẵn sàng học'}</span></div>
      <div className="foundation-card-body"><span className="foundation-symbol" aria-hidden="true">{lesson.symbol}</span><div><h3>{lesson.title}</h3><p>{lesson.subtitle}</p></div></div>
      <div className="foundation-card-footer"><span><Icon name="clock" width="15" height="15" /> {lesson.minutes} phút</span><strong>{lesson.locked ? `Hoàn thành ${lesson.prerequisiteTitle ?? 'bài trước'} để mở` : lesson.completed ? 'Ôn lại bài →' : 'Bắt đầu học →'}</strong></div></>
    return <li key={lesson.slug}>{lesson.locked ? <article className="foundation-card is-locked" aria-disabled="true">{content}</article> : <Link className={`foundation-card ${lesson.completed ? 'is-completed' : 'is-current'}`} to={foundationPath(lesson.slug)}>{content}</Link>}</li>
  })}</ol>
}

export function FoundationProgressOverview() {
  const { user } = useAuth()
  const lessons = useResource<FoundationCard[]>(user ? '/foundations' : null)
  if (!user) return null
  const visible = lessons.data ?? []
  const completed = visible.filter(lesson => lesson.completed).length
  const next = visible.find(lesson => !lesson.locked && !lesson.completed)
  return <section className="learner-next foundation-overview"><div><p className="study-eyebrow">TIẾN ĐỘ NHẬP MÔN</p><h2>Pinyin của bạn</h2>
    {lessons.loading ? <LoadingState label="Đang tải tiến độ nhập môn…" compact /> : lessons.error ? <p role="alert">Chưa tải được tiến độ. <button onClick={lessons.reload}>Thử lại</button></p> : <><p>{completed}/{visible.length} bài đã hoàn thành.{next ? ` Tiếp theo: ${next.title}.` : visible.length ? ' Bạn có thể quay lại ôn tập.' : ' Chưa có bài được xuất bản.'}</p><progress aria-label="Tiến độ nhập môn" max={Math.max(1, visible.length)} value={completed} /></>}
    <p>Học lần lượt. Nộp đủ câu tự kiểm tra để mở bài tiếp theo.</p></div>
    {!lessons.loading && !lessons.error && <Link className="study-primary" to={next ? foundationPath(next.slug) : '/foundations'}>{next ? 'Tiếp tục nhập môn →' : 'Xem lộ trình →'}</Link>}
  </section>
}

export function FoundationsPage() {
  return <main className="study-page foundations-page">
    <header className="study-heading"><p className="study-eyebrow">BƯỚC ĐẦU TIÊN · DÀNH CHO NGƯỜI MỚI</p><h1>Vững âm đầu.<br />Tự tin những câu đầu tiên.</h1><p>Làm quen Pinyin qua từng bài ngắn. Hoàn thành phần tự kiểm tra của bài trước để mở khóa bài tiếp theo.</p><div className="heading-chips"><span><Icon name="book" /> Học theo thứ tự</span><span><Icon name="check" /> Lưu từng bước tiến</span><span><Icon name="clock" /> Theo nhịp của bạn</span></div></header>
    <aside className="foundation-note"><strong>Tiếng Trung có “bảng chữ cái” không?</strong><p>Tiếng Trung dùng chữ Hán. Phần này hướng dẫn bảng âm Pinyin — cách ghi âm tiếng Phổ thông bằng chữ Latin để bạn học phát âm.</p></aside>
    <FoundationProgressOverview /><div className="learner-section-heading"><div><p className="study-eyebrow">LỘ TRÌNH NHẬP MÔN</p><h2>Từng bài nhỏ, nền tảng vững.</h2><p>Mỗi bài có giải thích, mẫu phát âm và phần tự kiểm tra.</p></div></div><FoundationCards />
    <section className="study-finish"><div><h2>Sau Pinyin là những câu chuyện mới.</h2><p>Hoàn thành cả 6 bài nhập môn để mở bài chủ đề, từ vựng, Quiz và 4 kỹ năng.</p></div><Link className="study-primary" to="/lessons">Khám phá bước tiếp theo →</Link></section>
  </main>
}

export function ResultReview({ result }: { result: QuizResult }) {
  return <div className="foundation-result"><p role="status"><strong>{result.score}/100 điểm · Đúng {result.correctCount}/{result.total} câu</strong> · {result.saved ? 'Đã lưu vào tài khoản' : 'Lượt thử của khách, chưa lưu vào tài khoản'}</p>
    {result.questions.map((q, index) => <div key={index} className="foundation-answer"><strong>{index + 1}. {q.prompt}</strong><p>Bạn chọn: {q.options[q.selected]} · {q.selected === q.correct ? 'Đúng rồi.' : `Cần ôn lại. Đáp án: ${q.options[q.correct]}.`}</p><p>{q.explanation}</p></div>)}
  </div>
}

export function FoundationQuiz({ lesson, signedIn = false, onSaved = () => {}, onReload = () => {} }: { lesson: Lesson; signedIn?: boolean; onSaved?: () => void; onReload?: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [questionIndex, setQuestionIndex] = useState(0)
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
  return <section id="foundation-quiz" className="foundation-check" aria-labelledby="foundation-check-title"><p className="study-eyebrow">TỰ KIỂM TRA CUỐI BÀI</p><h2 id="foundation-check-title">Bạn nhớ được gì?</h2>
    <p>{signedIn ? 'Nộp đủ câu để lưu điểm và hoàn thành bài. Bạn có thể làm lại để ôn tập; điểm tốt nhất được giữ.' : 'Bạn đang học thử. Đăng nhập trước khi làm bài để lưu điểm và tiến độ vào tài khoản.'}</p>
    {result ? <><ResultReview result={result} /><button onClick={() => { setResult(null); setAnswers({}); setQuestionIndex(0); request.current = null; setPending(false) }}>Làm lại</button></> : <form onSubmit={event => { event.preventDefault(); if (questionIndex === lesson.questions.length - 1) void submit() }}>
      <div className="foundation-quiz-progress"><span>Câu {questionIndex + 1}/{lesson.questions.length}</span><strong>Đã chọn {Object.keys(answers).length}/{lesson.questions.length}</strong></div><progress aria-label="Số câu đã trả lời" value={Object.keys(answers).length} max={lesson.questions.length} />
      {lesson.questions.map((question, index) => index === questionIndex && <fieldset key={index} disabled={busy || pending}><legend>{index + 1}. {question.prompt}</legend>
        {question.options.map((option, optionIndex) => <label key={optionIndex}><input type="radio" name={`foundation-question-${index}`} required checked={answers[index] === optionIndex} onChange={() => setAnswers(current => ({ ...current, [index]: optionIndex }))} />{option}</label>)}
      </fieldset>)}
      <div className="foundation-quiz-actions"><button type="button" disabled={questionIndex === 0 || busy || pending} onClick={() => setQuestionIndex(value => value - 1)}>← Câu trước</button>{questionIndex < lesson.questions.length - 1 ? <button className="study-primary" type="button" disabled={answers[questionIndex] === undefined} onClick={() => setQuestionIndex(value => value + 1)}>Câu tiếp →</button> : <button className="study-primary" type="submit" disabled={!complete || busy || conflict}>{busy ? 'Đang lưu kết quả…' : pending ? 'Thử nộp lại' : 'Kiểm tra đáp án'}</button>}</div>
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
  return <main className="study-page foundations-page foundation-lesson-page"><Link className="study-back" to="/foundations">← Lộ trình nhập môn</Link>
    {lesson.loading ? <LoadingState label="Đang tải bài nhập môn…" /> : lesson.error ? <div className="study-empty" role="alert"><Icon name="lock" width="32" height="32" /><h1>Chưa mở được bài nhập môn</h1><p>{cards.data?.find(card => card.slug === slug)?.locked ? `Hoàn thành ${cards.data.find(card => card.slug === slug)?.prerequisiteTitle ?? 'bài trước'} để mở bài này.` : lesson.error}</p><Link className="study-primary" to="/foundations">Về lộ trình</Link> <button onClick={() => { lesson.reload(); cards.reload() }}>Kiểm tra lại</button></div> : lesson.data && <LessonBody key={`${slug}-${lesson.data.version}-${user?.id ?? 'guest'}`} lesson={lesson.data} cards={cards.data ?? []} saved={progress.data?.find(p => p.slug === slug)} progressReady={!progress.loading && !progress.error} progressError={progress.error} reloadProgress={() => { progress.reload(); cards.reload() }} reloadLesson={lesson.reload} signedIn={!!user} />}
  </main>
}

function LessonBody({ lesson, cards, saved, progressReady, progressError, reloadProgress, reloadLesson, signedIn }: { lesson: Lesson; cards: FoundationCard[]; saved?: FoundationProgress; progressReady: boolean; progressError?: string; reloadProgress: () => void; reloadLesson: () => void; signedIn: boolean }) {
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState('')
  const saving = useRef(false)
  const index = cards.findIndex(card => card.slug === lesson.slug)
  const next = index >= 0 ? cards[index + 1] : undefined, previous = index > 0 ? cards[index - 1] : undefined
  const curriculumComplete = index >= 0 && !next && !!saved?.completedAt && cards.every(card => card.completed && !card.locked)
  async function bookmark(sectionIndex: number) {
    if (saving.current || !progressReady) return
    saving.current = true; setBusy(true); setNotice(''); setError('')
    try { await mutate('PUT', `/foundation-progress/${lesson.slug}`, { sectionIndex, lessonVersion: lesson.version, version: saved?.version ?? 0 }); setNotice('Đã lưu vị trí đọc vào tài khoản.'); reloadProgress() }
    catch (e) { setError(errorMessage(e)); reloadProgress() }
    finally { saving.current = false; setBusy(false) }
  }
  return <><header className="study-heading foundation-lesson-hero"><div><p className="study-eyebrow">NHẬP MÔN · BÀI {index + 1} / {cards.length || 6}</p><h1>{lesson.title}</h1><p>{lesson.subtitle}</p><div className="heading-chips"><span><Icon name="clock" /> {lesson.minutes} phút</span><span><Icon name="book" /> {lesson.sections.length} mục học</span><span><Icon name="check" /> {lesson.questions.length} câu tự kiểm tra</span></div></div><span className="foundation-hero-symbol" aria-hidden="true">{lesson.symbol}</span></header>
    <div className="foundation-lesson-grid"><aside className="foundation-toc"><p className="study-eyebrow">TRONG BÀI NÀY</p><nav aria-label="Mục lục bài Pinyin">{lesson.sections.map((section, sectionIndex) => <a key={sectionIndex} href={`#foundation-section-${sectionIndex}`}><span>{String(sectionIndex + 1).padStart(2, '0')}</span>{section.title}</a>)}{!!lesson.groups.length && <a href="#foundation-sound-groups"><Icon name="book" /> Bảng âm tham khảo</a>}{lesson.toneChart && <a href="#foundation-tone-chart"><Icon name="spark" /> Đường thanh điệu</a>}<a href="#foundation-sounds"><Icon name="cards" /> Nghe và luyện phát âm</a><a href="#foundation-quiz"><Icon name="check" /> Tự kiểm tra cuối bài</a></nav><p>Đi từng mục, nghe mẫu và đọc lại. Bạn có thể lưu vị trí để học tiếp.</p></aside><div className="foundation-lesson-content">
    {signedIn ? <aside className="foundation-note">{!progressReady && !progressError && <p role="status">Đang tải vị trí học…</p>}{progressError && <p role="alert">{progressError} <button onClick={reloadProgress}>Thử lại</button></p>}
      {saved && <><p>{saved.completedAt ? `Đã hoàn thành · Điểm tốt nhất ${saved.bestScore}/100 · ${saved.attempts} lượt` : 'Bạn đã bắt đầu bài này.'}</p>{saved.lessonVersion === lesson.version ? <a href={`#foundation-section-${saved.sectionIndex}`}>Tiếp tục tại: {lesson.sections[saved.sectionIndex]?.title}</a> : <p>Nội dung bài đã được cập nhật. Hãy đọc lại từ đầu; kết quả trước đây vẫn được giữ.</p>}</>}
      {progressReady && !saved && <p>Bấm “Lưu vị trí đọc” dưới một phần để lần sau học tiếp.</p>}</aside> : <p><Link to="/login" state={{ from: foundationPath(lesson.slug) }}>Đăng nhập để lưu vị trí học và điểm →</Link></p>}
    <div className="foundation-reading">{lesson.sections.map((section, sectionIndex) => <section id={`foundation-section-${sectionIndex}`} key={sectionIndex}><span className="foundation-reading-number">{String(sectionIndex + 1).padStart(2, '0')}</span><h2>{section.title}</h2><p>{section.text}</p>{signedIn && <button disabled={busy || !progressReady} onClick={() => void bookmark(sectionIndex)}>Lưu vị trí đọc: phần {sectionIndex + 1}</button>}</section>)}</div>
    {notice && <p role="status">{notice}</p>}{error && <p role="alert">{error} <button onClick={reloadLesson}>Tải lại bài</button></p>}
    {!!lesson.groups.length && <section id="foundation-sound-groups" className="foundation-groups" aria-label="Bảng âm Pinyin">{lesson.groups.map((group, i) => <article key={i}><h3>{group.title}</h3><div className="sound-chips">{group.sounds.split(/\s+/).map((sound, j) => <span key={j}>{sound}</span>)}</div><p>{group.note}</p></article>)}</section>}
    {lesson.toneChart && <div id="foundation-tone-chart"><h2>Nhìn đường thanh, nghe cao độ</h2><ToneChart /></div>}
    <FoundationSoundLab examples={lesson.examples} />
    <FoundationQuiz lesson={lesson} signedIn={signedIn} onSaved={reloadProgress} onReload={reloadLesson} />
    {saved?.lastResult && <details className="foundation-saved-result"><summary>Kết quả đã lưu gần nhất · {new Date(saved.lastResult.submittedAt).toLocaleString('vi-VN')}</summary><p>Kết quả của nội dung tại thời điểm nộp.</p><ResultReview result={saved.lastResult} /></details>}
    {curriculumComplete && <section className="study-finish"><div><p className="study-eyebrow">BẠN ĐÃ HOÀN THÀNH NHẬP MÔN</p><h2>Một nền tảng mới. Nhiều điều để khám phá.</h2><p>Khóa học chủ đề, từ vựng, Quiz và 4 kỹ năng đã mở. Bạn luôn có thể quay lại ôn Pinyin.</p></div><Link className="study-primary" to="/lessons">Bắt đầu bài theo chủ đề →</Link></section>}
    <nav className="foundation-pagination" aria-label="Chuyển bài nhập môn">{previous && !previous.locked ? <Link to={foundationPath(previous.slug)}>← {previous.title}</Link> : <Link to="/foundations">← Tất cả bài nhập môn</Link>}{next ? next.locked || !saved?.completedAt ? <div className="foundation-next-locked"><Icon name="lock" /><span>{signedIn ? 'Hoàn thành tự kiểm tra để mở bài tiếp theo.' : <Link to="/login" state={{ from: foundationPath(lesson.slug) }}>Đăng nhập để lưu kết quả và mở bài tiếp theo</Link>}</span></div> : <Link className="study-primary" to={foundationPath(next.slug)}>Bài tiếp: {next.title} →</Link> : <Link className="study-primary" to="/foundations">Về lộ trình nhập môn →</Link>}</nav>
    <p className="study-hint">Hoàn thành bài ghi nhận khi nộp đủ câu, không phải chứng nhận thành thạo. Nộp bài bằng tài khoản học viên được tính vào chuỗi ngày học; nhiều lượt trong ngày vẫn chỉ tính một ngày.</p>
    <details className="foundation-sources"><summary>Tài liệu tham khảo phát âm</summary><p>Các bài nhập môn ban đầu được đối chiếu với <a href="https://chinese.yabla.com/chinese-pinyin-chart.php" target="_blank" rel="noreferrer">bảng Pinyin của Yabla</a>, <a href="https://www.open.edu/openlearn/mod/oucontent/view.php?id=106502&section=3.3" target="_blank" rel="noreferrer">bài thanh điệu của Open University</a> và <a href="https://ocw.mit.edu/courses/res-21g-003-learning-chinese-a-foundation-course-in-mandarin-spring-2011/" target="_blank" rel="noreferrer">khóa nhập môn Mandarin của MIT</a>.</p></details>
    </div></div>
  </>
}
