import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthContext'
import { can } from '../../../app/router/permissions'
import { useResource } from '../../../shared/hooks/useResource'
import { skillNames, ratingNames } from '../../skills/types'
import type { Skill, SkillStat, History, Attempt } from '../../skills/types'
import type { ManagedUser } from '../types/adminUser.types'
import '../../skills/skills.css'
import '../management.css'

const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' })

export function AdminLearnerSkillsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const allowed = can(user, 'users.read') && can(user, 'users.skills.read')
  const [params, setParams] = useSearchParams()
  const skill = params.get('skill') ?? ''
  const page = Math.max(0, Number.parseInt(params.get('page') ?? '0') || 0)
  const selected = params.get('attempt')
  const base = allowed ? `/admin/users/${id}/skills` : null
  const account = useResource<ManagedUser>(allowed ? `/admin/users/${id}` : null)
  const stats = useResource<SkillStat[]>(base)
  const history = useResource<History>(base ? `${base}/attempts?${new URLSearchParams({ skill, page: String(page), size: '20' })}` : null)
  const detail = useResource<Attempt>(base && selected ? `${base}/attempts/${encodeURIComponent(selected)}` : null)
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key === 'skill') next.delete('page')
    if (key !== 'attempt') next.delete('attempt')
    setParams(next)
  }
  if (!allowed) return <main className="admin-page"><h1>Bạn không có quyền xem kỹ năng học viên.</h1></main>
  return <main className="admin-page skills-page">
    <Link className="management-back" to="/admin/users">← Danh sách tài khoản</Link>
    <div className="admin-heading"><div><p className="admin-eyebrow">THEO DÕI HỌC VIÊN</p><h1>Kỹ năng của {account.data?.displayName ?? 'học viên'}</h1>
      {account.data && <p>{account.data.email} · {account.data.enabled ? 'Đang hoạt động' : 'Tài khoản đã khóa'}</p>}</div>
      <button onClick={() => { account.reload(); stats.reload(); history.reload(); detail.reload() }} disabled={stats.loading || history.loading}>Cập nhật</button>
    </div>
    <p>Tiến độ Nghe, Nói, Đọc, Viết và kết quả từng lượt luyện. Ngày giờ hiển thị theo giờ Việt Nam.</p>
    {[account.error, stats.error, history.error].filter(Boolean).map((error, index) => <p key={index} className="admin-error" role="alert">{error}</p>)}
    {stats.loading && <p role="status">Đang tải tiến độ học viên…</p>}
    {stats.data && <LearnerSkillSummary stats={stats.data} />}
    <section aria-label="Lịch sử luyện kỹ năng"><h2>Lịch sử luyện tập</h2>
      <label>Lọc kỹ năng<select value={skill} onChange={e => filter('skill', e.target.value)}><option value="">Tất cả kỹ năng</option>{(Object.keys(skillNames) as Skill[]).map(s => <option key={s} value={s}>{skillNames[s]}</option>)}</select></label>
      {history.loading && <p role="status">Đang tải lịch sử…</p>}
      {history.data && <><p>{history.data.total} lượt luyện phù hợp</p>
        {history.data.items.length === 0 ? <p className="admin-empty">Học viên chưa có lượt luyện phù hợp với bộ lọc.</p> : <ol className="skill-history">{history.data.items.map(item => <li key={item.id}><div><small>{skillNames[item.skill]} · {formatDate(item.createdAt)}</small><h3>{item.title}</h3><p>{!item.submittedAt ? 'Chưa nộp bài' : item.skill === 'SPEAKING' ? 'Đã luyện · tự đánh giá' : `${item.score}/100 điểm`}</p></div>
          <button aria-expanded={selected === item.id} onClick={() => filter('attempt', selected === item.id ? '' : item.id)}>Xem chi tiết</button></li>)}</ol>}
        <div className="admin-pagination"><button disabled={page === 0} onClick={() => filter('page', String(page - 1))}>← Trang trước</button><span>Trang {page + 1}/{Math.max(1, Math.ceil(history.data.total / 20))}</span><button disabled={(page + 1) * 20 >= history.data.total} onClick={() => filter('page', String(page + 1))}>Trang sau →</button></div>
      </>}
    </section>
    {selected && <section aria-label="Chi tiết lượt luyện"><h2>Chi tiết lượt luyện</h2><button onClick={() => filter('attempt', '')}>Đóng chi tiết</button>
      {detail.loading && <p role="status">Đang tải câu trả lời…</p>}{detail.error && <p className="admin-error" role="alert">{detail.error}</p>}
      {detail.data && <LearnerAttemptDetail attempt={detail.data} />}
    </section>}
  </main>
}

export function LearnerSkillSummary({ stats }: { stats: SkillStat[] }) {
  return <section className="skill-grid" aria-label="Bốn kỹ năng của học viên">{stats.map(stat => <article className="skill-tile" key={stat.skill}><h2>{skillNames[stat.skill]}</h2>
    <strong>{stat.completedExercises} bài đã luyện</strong><p>{stat.attempts} lượt hoàn thành</p>
    {stat.skill === 'SPEAKING' ? <p>Tự đánh giá, chưa chấm phát âm tự động.</p> : <p>{stat.averageScore == null ? 'Chưa có điểm' : `Trung bình ${stat.averageScore}/100 · Cao nhất ${stat.bestScore}/100`}</p>}
    <small>{stat.lastPracticedAt ? `Lần gần nhất: ${formatDate(stat.lastPracticedAt)}` : 'Chưa luyện kỹ năng này'}</small>
  </article>)}</section>
}

export function LearnerAttemptDetail({ attempt }: { attempt: Attempt }) {
  const spoken = attempt.summary.skill === 'SPEAKING'
  if (!attempt.summary.submittedAt) return <p>Lượt “{attempt.summary.title}” chưa nộp. Câu trả lời đang làm chưa được lưu.</p>
  return <><h3>{attempt.summary.title}</h3><p>Nộp lúc {formatDate(attempt.summary.submittedAt)} · {spoken ? 'Tự đánh giá' : `${attempt.summary.score}/100 điểm`}</p>
    {spoken && <p className="skill-note">Bản ghi âm chỉ tồn tại trên thiết bị học viên trong lúc luyện, không tải lên máy chủ. Trang này xem được mức tự đánh giá từng câu.</p>}
    {attempt.questions.map((q, index) => <article key={q.id} className="skill-question"><h4>Câu {index + 1}: {q.prompt}</h4>{q.text && <p lang="zh-CN">{q.text}</p>}{q.hint && <p>{q.hint}</p>}
      {spoken ? <p>Tự đánh giá: <strong>{ratingNames[q.answer ?? ''] ?? 'Chưa có'}</strong></p> : <><p>Học viên trả lời: <strong>{q.answer}</strong> · {q.correct ? 'Đúng' : 'Chưa đúng'}</p><p>Đáp án: {q.accepted?.join(' / ')}</p></>}
      <p>{q.explanation}</p>
    </article>)}
  </>
}
