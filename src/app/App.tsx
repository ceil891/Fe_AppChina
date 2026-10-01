import { AdminGeneralSettingsPage } from '../features/admin/pages/AdminGeneralSettingsPage'
import { AdminCoursesPage, AdminCourseEditorPage } from '../features/admin/pages/AdminCoursesPage'
import { AdminAiSettingsPage } from '../features/admin/pages/AdminAiSettingsPage'
import { CoursesPage } from '../features/lesson/pages/CoursesPage'
import { AccountEmailPage } from '../features/auth/pages/AccountEmailPage'
import { AdminLearnerProgressPage } from '../features/admin/pages/AdminLearnerProgressPage'
import { LessonsPage } from '../features/lesson/pages/LessonsPage'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider } from './providers/AuthProvider'
import { useAuth } from './providers/AuthContext'
import { RequireAuth } from './router/RequireAuth'
import { AuthPage } from '../features/auth/pages/AuthPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { LearningPage } from '../features/progress/pages/LearningPage'
import { Brand } from '../shared/components/Brand'
import { LearnerLayout } from '../features/learner/LearnerLayout'
import { LearnerHomePage, PracticePage } from '../features/learner/LearnerHomePage'
import { FoundationsPage, FoundationLessonPage } from '../features/foundations/FoundationsPage'
import { AdminFoundationsPage, AdminFoundationEditorPage } from '../features/admin/pages/AdminFoundationsPage'
import { RequireAdmin } from './router/RequireAdmin'
import { AdminPage } from '../features/admin/pages/AdminPage'
import { RequireLearner } from './router/RequireLearner'
import { homePath } from './router/roleNavigation'
import { hasManagementAccess } from './router/permissions'
import { VocabularyPage } from '../features/vocabulary/pages/VocabularyPage'
import { VocabularyDetailPage } from '../features/vocabulary/pages/VocabularyDetailPage'
import { LessonDetailPage } from '../features/lesson/pages/LessonDetailPage'
import { AdminLayout } from '../features/admin/components/AdminLayout'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'
import { AdminLessonsPage, AdminLessonDetailPage, AdminLessonFormPage } from '../features/admin/pages/AdminLessonsPage'
import { AdminUsersPage, AdminUserEditorPage } from '../features/admin/pages/AdminUsersPage'
import { AdminRolesPage, AdminRoleEditorPage } from '../features/admin/pages/AdminRolesPage'
import { FlashcardPage, FlashcardReviewPage, FlashcardHistoryPage } from '../features/flashcard/pages/FlashcardPage'
import { QuizPage, QuizAttemptPage, QuizHistoryPage } from '../features/quiz/pages/QuizPage'
import { ProgressPage, ProgressHistoryPage } from '../features/progress/pages/ProgressPage'
import { AiTutorPage } from '../features/ai/pages/AiTutorPage'
import { RouteAccessibility } from './router/RouteAccessibility'
import { AdminSecurityPage } from '../features/admin/pages/AdminSecurityPage'
import { AdminQuizzesPage, AdminQuizEditorPage } from '../features/admin/pages/AdminQuizzesPage'
import { AdminSkillsPage, AdminSkillEditorPage } from '../features/admin/pages/AdminSkillsPage'
import { SkillsPage, SkillAttemptPage, SkillHistoryPage } from '../features/skills/SkillsPage'
import { AdminLearnerSkillsPage } from '../features/admin/pages/AdminLearnerSkillsPage'

function AppRoutes() {
  const { user, checking, error, refresh, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function signOut() {
    setBusy(true); setLogoutError('')
    try { await logout(); navigate('/login', { replace: true }) }
    catch { setLogoutError('Chưa đăng xuất được. Vui lòng thử lại.') }
    finally { setBusy(false) }
  }
  if (checking) return <main><p role="status">Đang kiểm tra phiên đăng nhập…</p></main>
  if (error) return <main><p role="alert">{error}</p><button onClick={() => void refresh()}>Thử lại</button></main>
  return <>
    <RouteAccessibility />
    <Routes>
      <Route path="/account/forgot" element={<AccountEmailPage key="forgot" mode="forgot" />} /><Route path="/account/reset" element={<AccountEmailPage key="reset" mode="reset" />} /><Route path="/account/verify" element={<AccountEmailPage key="verify" mode="verify" />} />
      <Route path="/" element={<Navigate to={homePath(user)} replace />} />
      <Route path="/login" element={<><header className="auth-site-header"><Brand /><Link to="/home">Khám phá bài học →</Link></header><AuthPage key="login" /></>} />
      <Route path="/register" element={<><header className="auth-site-header"><Brand /><Link to="/home">Khám phá bài học →</Link></header><AuthPage key="register" register /></>} />
      <Route element={<RequireLearner />}>
        <Route element={<LearnerLayout key={user?.id ?? 'guest'} busy={busy} logoutError={logoutError} onLogout={signOut} />}>
        <Route path="/home" element={<LearnerHomePage key={user?.id ?? 'guest'} />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/foundations" element={<FoundationsPage />} />
        <Route path="/foundations/:slug" element={<FoundationLessonPage />} />
        <Route path="/courses" element={<CoursesPage />} /><Route path="/courses/:id" element={<CoursesPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:id" element={<LessonDetailPage key={user?.id ?? 'guest'} />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/:id" element={<VocabularyDetailPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage key={user?.id} />} />
          <Route path="/skills" element={<SkillsPage key={user?.id} />} />
          <Route path="/skills/history" element={<SkillHistoryPage key={user?.id} />} />
          <Route path="/skills/attempts/:id" element={<SkillAttemptPage key={user?.id} />} />
          <Route path="/ai" element={<AiTutorPage key={user?.id} />} />
          <Route path="/ai/conversations/:id" element={<AiTutorPage key={user?.id} />} />
          <Route path="/learning" element={<LearningPage key={user?.id} />} />
          <Route path="/progress" element={<ProgressPage key={user?.id} />} />
          <Route path="/progress/history" element={<ProgressHistoryPage key={user?.id} />} />
          <Route path="/flashcards" element={<FlashcardPage key={user?.id} />} />
          <Route path="/flashcards/review" element={<FlashcardReviewPage key={user?.id} />} />
          <Route path="/flashcards/history" element={<FlashcardHistoryPage key={user?.id} />} />
          <Route path="/quizzes" element={<QuizPage key={user?.id} />} />
          <Route path="/quizzes/history" element={<QuizHistoryPage key={user?.id} />} />
          <Route path="/quizzes/attempts/:id" element={<QuizAttemptPage key={user?.id} />} />
        </Route>
        </Route>
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout busy={busy} logoutError={logoutError} onLogout={signOut} />}>
          <Route index element={<AdminDashboardPage />} /><Route path="learner-progress" element={<AdminLearnerProgressPage />} />
          <Route path="foundations" element={<AdminFoundationsPage />} />
          <Route path="foundations/new" element={<AdminFoundationEditorPage create />} />
          <Route path="foundations/:slug" element={<AdminFoundationEditorPage />} />
          <Route path="courses" element={<AdminCoursesPage />} /><Route path="courses/new" element={<AdminCourseEditorPage />} /><Route path="courses/:id" element={<AdminCourseEditorPage />} /><Route path="general-settings" element={<AdminGeneralSettingsPage />} /><Route path="ai-settings" element={<AdminAiSettingsPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="skills/:skill" element={<AdminSkillsPage />} />
          <Route path="skills/:skill/new" element={<AdminSkillEditorPage create />} />
          <Route path="skills/:skill/:id" element={<AdminSkillEditorPage />} />
          <Route path="quizzes" element={<AdminQuizzesPage />} />
          <Route path="quizzes/new" element={<AdminQuizEditorPage create />} />
          <Route path="quizzes/:id" element={<AdminQuizEditorPage />} />
          <Route path="quizzes/:id/edit" element={<AdminQuizEditorPage />} />
          <Route path="vocabulary" element={<AdminPage section="vocabulary" key="vocabulary" />} />
          <Route path="vocabulary/new" element={<AdminPage section="vocabulary" create key="new-vocabulary" />} />
          <Route path="lessons" element={<AdminLessonsPage />} />
          <Route path="lessons/new" element={<AdminLessonFormPage />} />
          <Route path="lessons/:id" element={<AdminLessonDetailPage />} />
          <Route path="lessons/:id/edit" element={<AdminLessonFormPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AdminUserEditorPage />} />
          <Route path="users/:id/edit" element={<AdminUserEditorPage />} />
          <Route path="users/:id/skills" element={<AdminLearnerSkillsPage />} />
          <Route path="users/:id/password" element={<AdminUserEditorPage passwordOnly />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="roles/new" element={<AdminRoleEditorPage />} />
          <Route path="roles/:code" element={<AdminRoleEditorPage readOnly />} />
          <Route path="roles/:code/edit" element={<AdminRoleEditorPage />} />
          <Route path="*" element={<main className="admin-page"><h1>Không tìm thấy trang quản lý</h1><Link to="/admin">Về tổng quan</Link></main>} />
        </Route>
      </Route>
      <Route path="*" element={<main><h1>Không tìm thấy trang</h1><Link to={homePath(user)}>{hasManagementAccess(user) ? 'Về quản lý' : 'Về trang chủ'}</Link></main>} />
    </Routes>
  </>
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}
