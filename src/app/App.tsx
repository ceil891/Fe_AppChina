import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import { AuthProvider } from './providers/AuthProvider'
import { useAuth } from './providers/AuthContext'
import { RequireAuth } from './router/RequireAuth'
import { RequireFoundation } from './router/RequireFoundation'
import { Brand } from '../shared/components/Brand'
import { LearnerLayout } from '../features/learner/LearnerLayout'
import { RequireAdmin } from './router/RequireAdmin'
import { RequireLearner } from './router/RequireLearner'
import { homePath } from './router/roleNavigation'
import { hasManagementAccess } from './router/permissions'
import { AdminLayout } from '../features/admin/components/AdminLayout'
import { RouteAccessibility } from './router/RouteAccessibility'
import { LoadingState } from '../shared/components/LoadingState'

const AdminGeneralSettingsPage = lazy(() => import('../features/admin/pages/AdminGeneralSettingsPage').then(module => ({ default: module.AdminGeneralSettingsPage })))
const AdminCoursesPage = lazy(() => import('../features/admin/pages/AdminCoursesPage').then(module => ({ default: module.AdminCoursesPage })))
const AdminCourseEditorPage = lazy(() => import('../features/admin/pages/AdminCoursesPage').then(module => ({ default: module.AdminCourseEditorPage })))
const AdminAiSettingsPage = lazy(() => import('../features/admin/pages/AdminAiSettingsPage').then(module => ({ default: module.AdminAiSettingsPage })))
const CoursesPage = lazy(() => import('../features/lesson/pages/CoursesPage').then(module => ({ default: module.CoursesPage })))
const AccountEmailPage = lazy(() => import('../features/auth/pages/AccountEmailPage').then(module => ({ default: module.AccountEmailPage })))
const AdminLearnerProgressPage = lazy(() => import('../features/admin/pages/AdminLearnerProgressPage').then(module => ({ default: module.AdminLearnerProgressPage })))
const LessonsPage = lazy(() => import('../features/lesson/pages/LessonsPage').then(module => ({ default: module.LessonsPage })))
const AuthPage = lazy(() => import('../features/auth/pages/AuthPage').then(module => ({ default: module.AuthPage })))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage').then(module => ({ default: module.ProfilePage })))
const LearningPage = lazy(() => import('../features/progress/pages/LearningPage').then(module => ({ default: module.LearningPage })))
const LearnerHomePage = lazy(() => import('../features/learner/LearnerHomePage').then(module => ({ default: module.LearnerHomePage })))
const PracticePage = lazy(() => import('../features/learner/LearnerHomePage').then(module => ({ default: module.PracticePage })))
const FoundationsPage = lazy(() => import('../features/foundations/FoundationsPage').then(module => ({ default: module.FoundationsPage })))
const FoundationLessonPage = lazy(() => import('../features/foundations/FoundationsPage').then(module => ({ default: module.FoundationLessonPage })))
const AdminFoundationsPage = lazy(() => import('../features/admin/pages/AdminFoundationsPage').then(module => ({ default: module.AdminFoundationsPage })))
const AdminFoundationEditorPage = lazy(() => import('../features/admin/pages/AdminFoundationsPage').then(module => ({ default: module.AdminFoundationEditorPage })))
const AdminPage = lazy(() => import('../features/admin/pages/AdminPage').then(module => ({ default: module.AdminPage })))
const VocabularyPage = lazy(() => import('../features/vocabulary/pages/VocabularyPage').then(module => ({ default: module.VocabularyPage })))
const VocabularyDetailPage = lazy(() => import('../features/vocabulary/pages/VocabularyDetailPage').then(module => ({ default: module.VocabularyDetailPage })))
const LessonDetailPage = lazy(() => import('../features/lesson/pages/LessonDetailPage').then(module => ({ default: module.LessonDetailPage })))
const AdminDashboardPage = lazy(() => import('../features/admin/pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })))
const AdminLessonsPage = lazy(() => import('../features/admin/pages/AdminLessonsPage').then(module => ({ default: module.AdminLessonsPage })))
const AdminLessonDetailPage = lazy(() => import('../features/admin/pages/AdminLessonsPage').then(module => ({ default: module.AdminLessonDetailPage })))
const AdminLessonFormPage = lazy(() => import('../features/admin/pages/AdminLessonsPage').then(module => ({ default: module.AdminLessonFormPage })))
const AdminUsersPage = lazy(() => import('../features/admin/pages/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const AdminUserEditorPage = lazy(() => import('../features/admin/pages/AdminUsersPage').then(module => ({ default: module.AdminUserEditorPage })))
const AdminRolesPage = lazy(() => import('../features/admin/pages/AdminRolesPage').then(module => ({ default: module.AdminRolesPage })))
const AdminRoleEditorPage = lazy(() => import('../features/admin/pages/AdminRolesPage').then(module => ({ default: module.AdminRoleEditorPage })))
const FlashcardPage = lazy(() => import('../features/flashcard/pages/FlashcardPage').then(module => ({ default: module.FlashcardPage })))
const FlashcardReviewPage = lazy(() => import('../features/flashcard/pages/FlashcardPage').then(module => ({ default: module.FlashcardReviewPage })))
const FlashcardHistoryPage = lazy(() => import('../features/flashcard/pages/FlashcardPage').then(module => ({ default: module.FlashcardHistoryPage })))
const QuizPage = lazy(() => import('../features/quiz/pages/QuizPage').then(module => ({ default: module.QuizPage })))
const QuizAttemptPage = lazy(() => import('../features/quiz/pages/QuizPage').then(module => ({ default: module.QuizAttemptPage })))
const QuizHistoryPage = lazy(() => import('../features/quiz/pages/QuizPage').then(module => ({ default: module.QuizHistoryPage })))
const ProgressPage = lazy(() => import('../features/progress/pages/ProgressPage').then(module => ({ default: module.ProgressPage })))
const ProgressHistoryPage = lazy(() => import('../features/progress/pages/ProgressPage').then(module => ({ default: module.ProgressHistoryPage })))
const AiTutorPage = lazy(() => import('../features/ai/pages/AiTutorPage').then(module => ({ default: module.AiTutorPage })))
const AdminSecurityPage = lazy(() => import('../features/admin/pages/AdminSecurityPage').then(module => ({ default: module.AdminSecurityPage })))
const AdminQuizzesPage = lazy(() => import('../features/admin/pages/AdminQuizzesPage').then(module => ({ default: module.AdminQuizzesPage })))
const AdminQuizEditorPage = lazy(() => import('../features/admin/pages/AdminQuizzesPage').then(module => ({ default: module.AdminQuizEditorPage })))
const AdminSkillsPage = lazy(() => import('../features/admin/pages/AdminSkillsPage').then(module => ({ default: module.AdminSkillsPage })))
const AdminSkillEditorPage = lazy(() => import('../features/admin/pages/AdminSkillsPage').then(module => ({ default: module.AdminSkillEditorPage })))
const SkillsPage = lazy(() => import('../features/skills/SkillsPage').then(module => ({ default: module.SkillsPage })))
const SkillAttemptPage = lazy(() => import('../features/skills/SkillsPage').then(module => ({ default: module.SkillAttemptPage })))
const SkillHistoryPage = lazy(() => import('../features/skills/SkillsPage').then(module => ({ default: module.SkillHistoryPage })))
const AdminLearnerSkillsPage = lazy(() => import('../features/admin/pages/AdminLearnerSkillsPage').then(module => ({ default: module.AdminLearnerSkillsPage })))

function AppRoutes() {
  const { user, error, refresh, logout } = useAuth()
  const [logoutError, setLogoutError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function signOut() {
    setBusy(true); setLogoutError('')
    try { await logout(); navigate('/login', { replace: true }) }
    catch { setLogoutError('Chưa đăng xuất được. Vui lòng thử lại.') }
    finally { setBusy(false) }
  }
  return <>
    {error && <aside role="alert"><p>{error}</p><button onClick={() => void refresh()}>Thử lại</button></aside>}
    <RouteAccessibility />
    <Suspense fallback={<main data-route-loading><LoadingState label="Đang mở trang…" /></main>}><Routes>
      <Route path="/account/forgot" element={<AccountEmailPage key="forgot" mode="forgot" />} /><Route path="/account/reset" element={<AccountEmailPage key="reset" mode="reset" />} /><Route path="/account/verify" element={<AccountEmailPage key="verify" mode="verify" />} />
      <Route path="/" element={<Navigate to={homePath(user)} replace />} />
      <Route path="/login" element={<><header className="auth-site-header"><Brand /><Link to="/home">Khám phá bài học →</Link></header><AuthPage key="login" /></>} />
      <Route path="/register" element={<><header className="auth-site-header"><Brand /><Link to="/home">Khám phá bài học →</Link></header><AuthPage key="register" register /></>} />
      <Route element={<RequireLearner />}>
        <Route element={<LearnerLayout key={user?.id ?? 'guest'} busy={busy} logoutError={logoutError} onLogout={signOut} />}>
        <Route path="/home" element={<LearnerHomePage key={user?.id ?? 'guest'} />} />
        <Route path="/foundations" element={<FoundationsPage />} />
        <Route path="/foundations/:slug" element={<FoundationLessonPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage key={user?.id} />} />
          <Route path="/progress" element={<ProgressPage key={user?.id} />} />
          <Route path="/progress/history" element={<ProgressHistoryPage key={user?.id} />} />
        </Route>
        <Route element={<RequireFoundation />}>
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/courses" element={<CoursesPage />} /><Route path="/courses/:id" element={<CoursesPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:id" element={<LessonDetailPage key={user?.id ?? 'guest'} />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/:id" element={<VocabularyDetailPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/skills" element={<SkillsPage key={user?.id} />} />
          <Route path="/skills/history" element={<SkillHistoryPage key={user?.id} />} />
          <Route path="/skills/attempts/:id" element={<SkillAttemptPage key={user?.id} />} />
          <Route path="/ai" element={<AiTutorPage key={user?.id} />} />
          <Route path="/ai/conversations/:id" element={<AiTutorPage key={user?.id} />} />
          <Route path="/learning" element={<LearningPage key={user?.id} />} />
          <Route path="/flashcards" element={<FlashcardPage key={user?.id} />} />
          <Route path="/flashcards/review" element={<FlashcardReviewPage key={user?.id} />} />
          <Route path="/flashcards/history" element={<FlashcardHistoryPage key={user?.id} />} />
          <Route path="/quizzes" element={<QuizPage key={user?.id} />} />
          <Route path="/quizzes/history" element={<QuizHistoryPage key={user?.id} />} />
          <Route path="/quizzes/attempts/:id" element={<QuizAttemptPage key={user?.id} />} />
        </Route>
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
    </Routes></Suspense>
  </>
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>
}
