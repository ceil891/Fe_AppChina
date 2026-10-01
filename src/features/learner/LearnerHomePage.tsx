import { LoadingState } from '../../shared/components/LoadingState'
import type { LearningRecord } from '../progress/api/learningApi'
import type { LessonSummary } from '../lesson/types/lesson.types'
import { StrokePractice } from '../foundations/StrokePractice'
import { LearningRoadmap } from './LearningRoadmap'
import { PronunciationPractice } from '../foundations/PronunciationPractice'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthContext'
import { useResource } from '../../shared/hooks/useResource'
import { Icon } from '../../shared/components/Icon'
import type { ProgressData } from '../progress/types/progress.types'
import { FoundationCards, FoundationProgressOverview } from '../foundations/FoundationsPage'
import { foundationAccess } from '../foundations/access'
import type { FoundationCard } from '../foundations/types'
import '../../shared/styles/study.css'

export function LearnerHomePage() {
  const { user } = useAuth()
  const foundations = useResource<FoundationCard[]>('/foundations')
  const unlocked = !!user && foundationAccess(foundations.data).unlocked
  const { data, loading, error, reload } = useResource<ProgressData>(user ? '/progress' : null)
  useEffect(() => {
    if (!user) return
    window.addEventListener('focus', reload)
    const delay = data ? Math.max(1000, new Date(data.nextDayAt).getTime() - new Date(data.serverTime).getTime() + 100) : undefined
    const timer = delay !== undefined ? window.setTimeout(reload, delay) : undefined
    return () => { window.removeEventListener('focus', reload); window.clearTimeout(timer) }
  }, [user, data, reload])
  const records = useResource<LearningRecord[]>(unlocked ? '/learning-records' : null)
  const lessons = useResource<LessonSummary[]>(unlocked ? '/lessons' : null)
  const started = records.data?.find(record => !record.completedAt && lessons.data?.some(lesson => lesson.id === record.lessonId))
  const resumedLesson = lessons.data?.find(lesson => lesson.id === started?.lessonId)
  const experienced = !!resumedLesson || !!(data && data.streak.activeDays > 0)
  const nextAction = resumedLesson ? {path: '/lessons/' + resumedLesson.id,label: resumedLesson.title,description: 'Tiếp tục bài bạn đã lưu. Học từ vựng, ôn tập và đánh dấu hoàn thành khi sẵn sàng.'} : data?.nextAction
  return <main className="study-page learner-home">
    <div className="learner-greeting"><span><span className="greeting-dot" /> KHÔNG GIAN HỌC TẬP CỦA BẠN</span><span>慢慢来 · Cứ từng bước thôi</span></div>
    <section className="learner-hero">
      <div className="learner-hero-copy"><p className="study-eyebrow">{user ? `CHÀO ${user.displayName.toLocaleUpperCase('vi')}!` : 'CHÀO BẠN, RẤT VUI ĐƯỢC GẶP BẠN'}</p>
        <h1>{experienced ? <>Tiếp nối hôm qua.<br /><em>Tiến thêm hôm nay.</em></> : <>Một khởi đầu nhỏ.<br /><em>Một ngôn ngữ mới.</em></>}</h1>
        <p>Từ những âm Pinyin đầu tiên đến câu chuyện của riêng bạn. Hôm nay, mình cùng học một chút nhé.</p>
        <div className="learner-hero-actions"><Link className="study-primary" to={experienced && nextAction ? nextAction.path : '/foundations'}>{experienced ? 'Tiếp tục học' : 'Bắt đầu nhập môn'} <Icon name="arrow" /></Link><Link to="/foundations">Khám phá lộ trình nhập môn ↗</Link></div>
        <div className="learner-hero-tags"><span>Từ những bài nền tảng</span><span>Giải thích tiếng Việt</span><span>Theo nhịp của bạn</span></div>
      </div>
      <div className="learner-art" aria-hidden="true"><span className="art-caption">LỜI CHÀO ĐẦU TIÊN</span><div className="learner-hanzi"><span>你</span><span>好</span></div><span className="learner-pinyin">nǐ hǎo</span><span>Xin chào, hành trình mới.</span><span className="learner-seal">学</span><div className="learner-art-note"><Icon name="spark" /> Bắt đầu từ điều đơn giản</div></div>
    </section>
    {user && <section className="learner-progress" aria-label="Tiến độ học của bạn">
      {loading ? <LoadingState label="Đang tải tiến độ của bạn…" /> : error ? <div role="alert"><p>{error}</p><button onClick={reload}>Thử tải lại tiến độ</button></div> : data && <>
        <div><span className="metric-icon"><Icon name="spark" /></span><p><strong>{data.streak.current} ngày</strong><span>Chuỗi học hiện tại</span></p></div>
        <div><span className="metric-icon"><Icon name="book" /></span><p><strong>{data.totals.completedLessons}/{data.totalLessons}</strong><span>Bài chủ đề hoàn thành</span></p></div>
        <div><span className="metric-icon"><Icon name="cards" /></span><p><strong>{data.flashcards.due} thẻ</strong><span>Đến hạn ôn tập</span></p></div><Link to="/progress">Xem tiến độ →</Link>
      </>}
    </section>}
    {experienced && nextAction && <section className="learner-next"><div><p className="study-eyebrow">GỢI Ý CHO HÔM NAY</p><h2>{nextAction.label}</h2><p>{nextAction.description}</p></div><Link className="study-primary" to={nextAction.path}>Bắt đầu →</Link></section>}
    <nav className="learner-shortcuts" aria-label="Truy cập học tập"><Link to="/courses"><Icon name="book" /><span>Khóa học<small>Lộ trình từng bước</small></span><span aria-hidden="true">↗</span></Link><Link to="/learning"><Icon name="cards" /><span>Bài của tôi<small>Tiếp tục bài đã lưu</small></span><span aria-hidden="true">↗</span></Link><Link to="/vocabulary"><Icon name="check" /><span>Tra từ vựng<small>Nghĩa, Pinyin và phát âm</small></span><span aria-hidden="true">↗</span></Link></nav>
    {user && data && <section className="learner-today" aria-labelledby="today-heading"><div><p className="study-eyebrow">NHỊP HỌC HÔM NAY</p><h2 id="today-heading">{data.streak.studiedToday ? 'Bạn đã dành thời gian cho tiếng Trung.' : 'Một bài nhỏ cũng là một bước tiến.'}</h2><p>{data.streak.studiedToday ? 'Kết quả được lưu lại để bạn tiếp tục theo nhịp của mình.' : 'Chọn bài học hoặc ôn vài thẻ để bắt đầu ngày học hôm nay.'}</p></div><dl><div><dt>Bài hoàn thành</dt><dd>{data.todayActivity.completedLessons}</dd></div><div><dt>Lượt ôn thẻ</dt><dd>{data.todayActivity.flashcardReviews}</dd></div><div><dt>Quiz đã làm</dt><dd>{data.todayActivity.submittedQuizzes}</dd></div></dl></section>}
    <FoundationProgressOverview />
    <section className="learner-foundations"><div className="learner-section-heading"><div><p className="study-eyebrow">01 / XÂY NỀN TẢNG</p><h2>{experienced ? 'Ôn lại nền tảng khi bạn cần.' : 'Chưa biết gì? Bắt đầu ở đây.'}</h2><p>6 bài: Pinyin cơ bản, vận mẫu đơn, thanh mẫu, vận mẫu ghép, thanh điệu và ghép âm.</p></div><Link to="/foundations">Xem lộ trình →</Link></div><FoundationCards /></section>
    <section><div className="learner-section-heading"><div><p className="study-eyebrow">02 / LUYỆN MỖI NGÀY</p><h2>Học theo cách của bạn.</h2><p>Đọc, nghe, nói và ghi nhớ qua từng hoạt động nhỏ.</p></div><Link to="/practice">Tất cả hoạt động →</Link></div><PracticeCards compact locked={!unlocked} /></section>
    <LearningRoadmap />
    {!user && <section className="learner-next"><div><h2>Giữ lại từng bước tiến bộ</h2><p>Đăng nhập để lưu bài, ôn thẻ và theo dõi chuỗi ngày học.</p></div><Link className="study-primary" to="/login">Đăng nhập →</Link></section>}
  </main>
}

const activities = [
  { path: '/skills', icon: 'book' as const, title: '4 kỹ năng', label: '听 说 读 写', description: 'Luyện Nghe, Nói, Đọc, Viết với các bài tập ngắn.', tag: 'Luyện tập toàn diện' },
  { path: '/flashcards', icon: 'cards' as const, title: 'Flashcard', label: '记', description: 'Ôn lại từ đã lưu, từng thẻ một theo lịch ôn.', tag: 'Ghi nhớ từ vựng' },
  { path: '/quizzes', icon: 'check' as const, title: 'Quiz', label: '练', description: 'Thử sức, xem lời giải và học lại câu chưa đúng.', tag: 'Kiểm tra kiến thức' },
  { path: '/ai', icon: 'spark' as const, title: 'AI Tutor', label: '聊', description: 'Hỏi cách dùng từ và luyện viết câu khi AI được bật.', tag: 'Hỏi đáp cùng AI' },
]

export function PracticeCards({ compact = false, locked = false }: { compact?: boolean; locked?: boolean }) {
  return <div className={`learner-activities ${compact ? 'compact' : ''}`}>{activities.map(activity => {
    const content = <><span className="activity-top"><Icon name={locked ? 'lock' : activity.icon} /><span lang="zh-CN">{activity.label}</span></span><small>{locked ? 'Mở sau khi hoàn thành nhập môn' : activity.tag}</small><h3>{activity.title} <span aria-hidden="true">{locked ? '' : '↗'}</span></h3><p>{activity.description}</p></>
    return locked ? <article key={activity.path} className="learner-activity is-locked" aria-disabled="true">{content}</article> : <Link key={activity.path} className="learner-activity" to={activity.path}>{content}</Link>
  })}</div>
}

export function PracticePage() {
  return <main className="study-page"><header className="study-heading"><p className="study-eyebrow">MỖI NGÀY MỘT CHÚT</p><h1>Hôm nay bạn muốn luyện gì?</h1><p>Chọn hoạt động phù hợp. Các bài luyện cần đăng nhập để lưu kết quả riêng cho bạn.</p></header><PracticeCards /><PronunciationPractice /><StrokePractice /><section className="learner-next"><div><h2>Cần ôn lại phát âm?</h2><p>Bảng thanh mẫu, vận mẫu và thanh điệu luôn ở đây.</p></div><Link className="study-primary" to="/foundations">Ôn Pinyin →</Link></section><div className="learner-quick-links"><Link to="/vocabulary">Tra cứu từ vựng →</Link><Link to="/learning">Bài đã lưu →</Link><Link to="/quizzes/history">Lịch sử Quiz →</Link><Link to="/skills/history">Lịch sử 4 kỹ năng →</Link></div></main>
}
