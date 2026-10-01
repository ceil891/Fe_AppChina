import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile, stat } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' })

try {
  const drafts = await server.ssrLoadModule('/src/features/progress/noteDrafts.ts')
  test('Note drafts isolate accounts, preserve empty edits, expire and clear on logout', () => {
    drafts.clearNoteDrafts()
    drafts.writeNoteDraft('alice','record','private',100)
    assert.equal(drafts.readNoteDraft('bob','record',101),undefined)
    assert.equal(drafts.readNoteDraft('alice','record',101),'private')
    drafts.writeNoteDraft('alice','record','',102)
    assert.equal(drafts.readNoteDraft('alice','record',103),'')
    assert.equal(drafts.readNoteDraft('alice','record',1800102),undefined)
    drafts.writeNoteDraft('alice','record','text',2000000)
    drafts.removeNoteDraft('alice','record')
    assert.equal(drafts.readNoteDraft('alice','record',2000001),undefined)
    drafts.writeNoteDraft('alice','record','text',2000000)
    drafts.clearNoteDrafts()
    assert.equal(drafts.readNoteDraft('alice','record',2000001),undefined)
  })
  const { courseProgress, lessonPath } = await server.ssrLoadModule('/src/features/lesson/courseProgress.ts')
  test('Course resume respects course membership, saved work, completion and empty courses', () => {
    const lessons=[{id:1},{id:2},{id:3}]
    const records=[{lessonId:99,completedAt:null},{lessonId:3,completedAt:null},{lessonId:1,completedAt:'2026-09-30'}]
    const result=courseProgress(lessons,records)
    assert.equal(result.next.id,3);assert.equal(result.count,1);assert.equal(result.percent,33)
    assert.equal(courseProgress(lessons,[]).next.id,1)
    assert.equal(courseProgress(lessons,lessons.map(l=>({lessonId:l.id,completedAt:'done'}))).next,undefined)
    assert.equal(courseProgress([],records).percent,0)
    assert.equal(lessonPath(3,'2'),'/lessons/3?courseId=2')
    assert.equal(lessonPath(3,'https://evil.test'),'/lessons/3')
  })
  const { selectLessons } = await server.ssrLoadModule('/src/features/admin/utils/lessonList.ts')
  test('Admin lesson filters combine publication, empty content and Vietnamese search without mutating source', () => {
    const lessons = [
      { id: 1, title: 'Lời chào', description: '', position: 3, wordCount: 0, published: false },
      { id: 2, title: 'Lời chào mới', description: '', position: 1, wordCount: 5, published: true },
      { id: 3, title: 'Gia đình', description: '', position: 2, wordCount: 0 },
    ]
    const select = query => selectLessons(lessons, new URLSearchParams(query))
    assert.deepEqual(select('q=loi+chao&publication=hidden&empty=1').items.map(l => l.id), [1])
    assert.deepEqual(select('publication=visible').items.map(l => l.id), [2, 3])
    assert.deepEqual(select('sort=words').items.map(l => l.id), [3, 1, 2])
    assert.deepEqual(lessons.map(l => l.id), [1, 2, 3])
    assert.equal(select('q=missing&page=999').page, 0)
    assert.equal(select('page=-4').page, 0)
    assert.deepEqual(select('sort=unknown&publication=unknown').items.map(l => l.id), [2, 3, 1])
  })
  const { homePath, loginDestination } = await server.ssrLoadModule('/src/app/router/roleNavigation.ts')
  test('Course context survives login only for validated local lesson paths', () => {
    assert.equal(loginDestination({permissions:[]},'/lessons/3?courseId=2'),'/lessons/3?courseId=2')
    assert.equal(loginDestination({permissions:[]},'/lessons/3?courseId=2&redirect=https://evil.test'),'/home')
  })
  const { Navbar } = await server.ssrLoadModule('/src/shared/components/Navbar.tsx')
  const { AdminLayout } = await server.ssrLoadModule('/src/features/admin/components/AdminLayout.tsx')
  const { AuthContext } = await server.ssrLoadModule('/src/app/providers/AuthContext.ts')
  const { RequireAdmin } = await server.ssrLoadModule('/src/app/router/RequireAdmin.tsx')
  const { RequireLearner } = await server.ssrLoadModule('/src/app/router/RequireLearner.tsx')
  const { RequireAuth } = await server.ssrLoadModule('/src/app/router/RequireAuth.tsx')
  const { ReviewCard } = await server.ssrLoadModule('/src/features/flashcard/components/ReviewCard.tsx')
  const { QuizQuestionCard } = await server.ssrLoadModule('/src/features/quiz/components/QuizQuestionCard.tsx')
  const { QuizAttemptForm } = await server.ssrLoadModule('/src/features/quiz/components/QuizAttemptForm.tsx')
  const { ProgressDashboard, ActivityList } = await server.ssrLoadModule('/src/features/progress/components/ProgressDashboard.tsx')
  test('Foundation activity displays zero score and returns to the foundation roadmap', () => {
    const html = renderToStaticMarkup(h(MemoryRouter, null, h(ActivityList, { timeZone: 'Asia/Ho_Chi_Minh', items: [{ id: 1, kind: 'FOUNDATION_SUBMITTED', sourceId: 'test', occurredAt: '2026-09-23T17:01:00Z', studyDate: '2026-09-24', label: 'Pinyin', lessonId: null, score: 0, rating: null }] })));
    assert.match(html, /Luyện nhập môn Pinyin/);
    assert.ok(html.includes('0/100 điểm'));
    assert.ok(html.includes('href="/foundations"'));
    assert.ok(!html.includes('flashcards/history'));
  });
  const { studyDateLabel } = await server.ssrLoadModule('/src/features/progress/utils/progressDisplay.ts')
  const { ChatTranscript } = await server.ssrLoadModule('/src/features/ai/components/ChatTranscript.tsx')
  const { Availability } = await server.ssrLoadModule('/src/features/ai/components/Availability.tsx')
  test('AI availability distinguishes setup from exhausted quotas', () => {
    const render = reason => renderToStaticMarkup(h(Availability, { status: { available: false, reason, remainingToday: 0, dailyLimit: 20, resetsAt: '2026-10-01T00:00:00+07:00' } }))
    assert.ok(render('NOT_CONFIGURED').includes('cấu hình kết nối Gemini'))
    assert.ok(render('DAILY_LIMIT').includes('Bạn đã dùng hết lượt AI'))
    assert.ok(render('GLOBAL_LIMIT').includes('Ứng dụng đã hết hạn mức AI'))
    assert.ok(!render('DAILY_LIMIT').includes('cấu hình kết nối'))
  })
  const { ChatComposer } = await server.ssrLoadModule('/src/features/ai/components/ChatComposer.tsx')
  const { wordReturnPath } = await server.ssrLoadModule('/src/features/vocabulary/utils/studyNavigation.ts')
  test('Vocabulary returns to the exact course lesson without accepting extra query parameters', () => {
    assert.equal(wordReturnPath('/lessons/3?courseId=2'),'/lessons/3?courseId=2')
    assert.equal(wordReturnPath('/lessons/3?courseId=2&redirect=evil'),'/vocabulary')
  })
  const { canOpenAdminPath } = await server.ssrLoadModule('/src/app/router/permissions.ts')
  test('Course and AI management routes enforce separate read and create permissions', () => {
    const profile = permissions => ({ permissions })
    assert.equal(canOpenAdminPath(profile(['lessons.read']), '/admin/courses'), false)
    assert.equal(canOpenAdminPath(profile(['courses.read']), '/admin/courses'), true)
    assert.equal(canOpenAdminPath(profile(['courses.read']), '/admin/courses/new'), false)
    assert.equal(canOpenAdminPath(profile(['courses.read', 'courses.create']), '/admin/courses/new'), true)
    assert.equal(canOpenAdminPath(profile(['courses.read']), '/admin/courses/9'), true)
    assert.equal(canOpenAdminPath(profile(['courses.read']), '/admin/courses/not-an-id'), false)
    assert.equal(canOpenAdminPath(profile(['ai.read']), '/admin/ai-settings'), true)
    assert.equal(canOpenAdminPath(profile(['users.read']), '/admin/ai-settings'), false)
  })
  const { ChangePasswordForm } = await server.ssrLoadModule('/src/features/auth/components/ChangePasswordForm.tsx')
  const { LoginForm } = await server.ssrLoadModule('/src/features/auth/components/LoginForm.tsx')
  const { Practice } = await server.ssrLoadModule('/src/features/skills/SkillsPage.tsx')
  const { LearnerSkillSummary, LearnerAttemptDetail } = await server.ssrLoadModule('/src/features/admin/pages/AdminLearnerSkillsPage.tsx')
  const { selectPermission } = await server.ssrLoadModule('/src/features/admin/permissionSelection.ts')
  const { SkillEditor } = await server.ssrLoadModule('/src/features/admin/pages/AdminSkillsPage.tsx')
  const { foundationLessons } = await server.ssrLoadModule('/src/features/foundations/content.ts')
  const { FoundationQuiz, ResultReview } = await server.ssrLoadModule('/src/features/foundations/FoundationsPage.tsx')
  const { FoundationEditor } = await server.ssrLoadModule('/src/features/admin/pages/AdminFoundationsPage.tsx')
  test('Removing skill oversight preserves unrelated account permissions', () => {
    assert.deepEqual(selectPermission(['users.read', 'users.update', 'users.skills.read'], 'users.skills.read', false), ['users.read', 'users.update'])
    assert.deepEqual(selectPermission(['users.read', 'users.update', 'users.skills.read'], 'users.read', false), [])
    assert.deepEqual(selectPermission([], 'users.skills.read', true).sort(), ['users.read', 'users.skills.read'])
  })
  const { RoadmapContent } = await server.ssrLoadModule('/src/features/learner/LearningRoadmap.tsx')
  const { nextRoadmapStep } = await server.ssrLoadModule('/src/features/learner/roadmap.ts')
  test('Roadmap prioritizes unfinished work and handles empty and completed curricula', () => {
    const fresh = { stage: 'Pinyin', title: 'Bài mới', path: '/foundations/pinyin', status: 'NEW' }
    const started = { stage: '4 kỹ năng', title: 'Bài đang luyện', path: '/skills/attempts/example', status: 'STARTED' }
    assert.equal(nextRoadmapStep([fresh, started]), started)
    assert.equal(nextRoadmapStep([fresh]), fresh)
    assert.equal(nextRoadmapStep([]), undefined)
    const render = (steps, signedIn) => renderToStaticMarkup(h(MemoryRouter, null, h(RoadmapContent, { steps, signedIn })))
    assert.ok(render([], true).includes('Chưa có bài học được xuất bản'))
    assert.ok(render([{ ...fresh, status: 'COMPLETED' }], true).includes('Bạn đã hoàn thành tất cả bài'))
    assert.ok(render([fresh, started], true).includes('Tiếp tục bài đang học'))
    const guest = render([fresh], false)
    assert.ok(!guest.includes('bài hoàn thành'))
    assert.ok(!guest.includes('Chưa bắt đầu'))
  })
  const learner = { id: 'learner', email: 'learner@example.test', displayName: 'Người học', role: 'USER', roleName: 'Người học', permissions: [] }
  const permissions = ['vocabulary', 'lessons', 'roles'].flatMap(module => ['read', 'create', 'update', 'delete'].map(action => module + '.' + action)).concat(['users.read', 'users.create', 'users.update', 'users.assign_role', 'users.status', 'users.password', 'users.delete'])
  const admin = { id: 'admin', email: 'admin@example.test', displayName: 'Biên tập viên', role: 'ADMIN', roleName: 'Quản trị hệ thống', permissions }

  test('Learner oversight needs both account and progress read permissions', () => {
    const path = '/admin/learner-progress';
    assert.equal(canOpenAdminPath({ ...admin, permissions: ['users.read'] }, path), false);
    assert.equal(canOpenAdminPath({ ...admin, permissions: ['users.progress.read'] }, path), false);
    assert.equal(canOpenAdminPath({ ...admin, permissions: ['users.read', 'users.progress.read'] }, path), true);
    assert.deepEqual(selectPermission([], 'users.progress.read', true).sort(), ['users.progress.read', 'users.read']);
  });
  const { AccountEmailPage } = await server.ssrLoadModule('/src/features/auth/pages/AccountEmailPage.tsx');
  test('Account email recovery offers a replacement link and role-aware verification destination', () => {
    const render = (mode, user) => renderToStaticMarkup(h(AuthContext.Provider, { value: { user, refresh: async () => {} } }, h(MemoryRouter, null, h(AccountEmailPage, { mode }))));
    assert.ok(render('reset', null).includes('href="/account/forgot"'));
    assert.ok(render('verify', learner).includes('href="/profile"'));
    assert.ok(render('verify', admin).includes('href="/admin/security"'));
    assert.ok(render('verify', null).includes('Đăng nhập để yêu cầu email xác minh mới'));
  });
  test('A reset email link renders password fields with safe autocomplete and length constraints', () => {
    const html = renderToStaticMarkup(h(AuthContext.Provider, { value: { user: null, refresh: async () => {} } }, h(MemoryRouter, { initialEntries: ['/account/reset#token=sample-link'] }, h(AccountEmailPage, { mode: 'reset' }))));
    assert.ok(html.includes('name="newPassword"'));
    assert.ok(html.includes('name="confirmPassword"'));
    assert.ok(html.includes('autoComplete="new-password"'));
    assert.ok(html.includes('minLength="12"'));
    assert.ok(!html.includes('Liên kết thiếu mã xác nhận'));
    assert.ok(!html.includes('sample-link'));
  });
  test('Password reset without a token cannot be submitted', () => {
    const html = renderToStaticMarkup(h(AuthContext.Provider, { value: { user: null, refresh: async () => {} } }, h(MemoryRouter, null, h(AccountEmailPage, { mode: 'reset' }))));
    assert.ok(html.includes('Liên kết thiếu mã xác nhận'));
    assert.match(html, /<button disabled=""/);
  });
  test('AI preserves lesson context after login and only accepts the known lesson parameter', () => {
    assert.equal(loginDestination(learner, '/ai?lessonId=12'), '/ai?lessonId=12')
    assert.equal(loginDestination(learner, '/ai?lessonId=12&next=https://example.com'), '/home')
    assert.equal(loginDestination(learner, '/ai?lessonId=-1'), '/home')
    assert.equal(loginDestination(admin, '/ai?lessonId=12'), '/admin')
  })
  test('AI composer uses prompts for the selected learning mode', () => {
    const render = mode => renderToStaticMarkup(h(ChatComposer, { mode, value: '', disabled: false, busy: false, uncertain: false, onChange: () => {}, onSubmit: () => {} }))
    assert.ok(render('CONVERSATION').includes('Gọi đồ uống'))
    assert.ok(!render('CONVERSATION').includes('Thử sửa câu'))
    assert.ok(render('CORRECT').includes('Thử sửa câu'))
    assert.ok(render('REVIEW').includes('Bắt đầu ôn'))
    assert.ok(render('EXPLAIN').includes('Giải thích từ'))
  })
  test('Exact exercise destinations survive login while untrusted query parameters are rejected', () => {
    const destination = '/skills?skill=LISTENING&exercise=listening-dialogue-intro-v1'
    assert.equal(loginDestination(learner, destination), destination)
    for (const path of [destination + '&next=https://example.com', '/skills?skill=READING&exercise=../admin', '/skills?skill=READING&exercise=']) {
      assert.equal(loginDestination(learner, path), '/home')
    }
    assert.equal(loginDestination(admin, destination), '/admin')
  })
  test('Skill roadmap links survive sign-in without allowing arbitrary query destinations', () => {
    assert.equal(loginDestination(learner, '/skills?skill=READING'), '/skills?skill=READING');
    assert.equal(loginDestination(learner, '/skills?skill=READING&next=https://external.test'), '/home');
    assert.equal(loginDestination(admin, '/skills?skill=READING'), '/admin');
  });
  test('New learner destinations preserve role isolation and reject arbitrary foundation URLs', () => {
    for (const path of ['/home', '/practice', '/foundations', ...foundationLessons.map(lesson => '/foundations/' + lesson.slug)]) {
      assert.equal(loginDestination(learner, path), path)
      assert.equal(loginDestination(admin, path), '/admin')
      assert.ok(!guardedContent(RequireLearner, admin, path).includes('protected-content'))
      assert.ok(guardedContent(RequireLearner, null, path).includes('protected-content'))
    }
    assert.equal(loginDestination(learner, '/foundations/new-editorial-lesson'), '/foundations/new-editorial-lesson')
    for (const path of ['/foundations/a/b', '/foundations/../admin', '//external.test', '/home?next=https://external.test']) {
      assert.equal(loginDestination(learner, path), '/home')
    }
  })

  test('Foundation exercises require answers and distinguish guest practice from saved results', () => {
    assert.equal(new Set(foundationLessons.map(lesson => lesson.slug)).size, 6)
    for (const lesson of foundationLessons) {
      for (const question of lesson.questions) {
        assert.ok(question.correct >= 0 && question.correct < question.options.length)
        assert.equal(new Set(question.options).size, question.options.length)
      }
      const html = renderToStaticMarkup(h(FoundationQuiz, { lesson }))
      assert.ok(html.includes('type="radio"'))
      assert.ok(html.includes('Đăng nhập trước khi làm bài'))
      assert.match(html, /<button[^>]*disabled=""[^>]*>Kiểm tra đáp án/)
      assert.ok(!html.includes('Cần ôn lại. Đáp án:'))
    }
    const result = renderToStaticMarkup(h(ResultReview, { result: { score: 0, correctCount: 0, total: 1, saved: true, questions: [{ prompt: '<script>bad</script>', options: ['a', 'b'], selected: 1, correct: 0, explanation: 'Review' }] } }))
    assert.ok(result.includes('0/100 điểm')); assert.ok(result.includes('Đã lưu vào tài khoản'))
    assert.ok(result.includes('Cần ôn lại')); assert.ok(!result.includes('<script>bad'))
  })

  test('Foundation reader can inspect content but cannot edit or publish', () => {
    const profile = { ...learner, permissions: ['foundations.read'] }
    assert.equal(homePath(profile), '/admin')
    assert.ok(canOpenAdminPath(profile, '/admin/foundations/pinyin'))
    assert.ok(!canOpenAdminPath(profile, '/admin/foundations/new'))
    assert.equal(loginDestination(learner, '/admin/foundations/pinyin'), '/home')
    const content = { ...foundationLessons[0], groups: [], examples: [] }
    const render = (permissions, published) => renderToStaticMarkup(h(AuthContext.Provider, { value: { user: { ...profile, permissions } } }, h(MemoryRouter, null, h(FoundationEditor, { initial: { content, position: 1, version: 0, published }, onReload() {} }))))
    const reader = render(['foundations.read'], false)
    assert.match(reader, /fieldset disabled/); assert.ok(!reader.includes('Lưu bản nháp')); assert.ok(!reader.includes('Xuất bản bài'))
    const published = render(['foundations.read', 'foundations.update', 'foundations.publish'], true)
    assert.ok(published.includes('Gỡ xuất bản')); assert.ok(!published.includes('Lưu bản nháp'))
  })

  await test('Every foundation example has a bundled audio file', async () => {
    const manifest = JSON.parse(await readFile('src/features/foundations/audio.json', 'utf8'))
    for (const lesson of foundationLessons) for (const example of lesson.examples) {
      const path = manifest[example.hanzi]
      assert.ok(path?.startsWith('/audio/'))
      assert.ok((await stat('public' + path)).size > 1000)
    }
  })

  test('Skill editors have four management destinations without learner-results access', () => {
    const reader = { ...admin, permissions: ['skills.read'] }
    assert.equal(homePath(reader), '/admin')
    for (const skill of ['LISTENING', 'SPEAKING', 'READING', 'WRITING']) {
      const path = '/admin/skills/' + skill
      assert.equal(canOpenAdminPath(reader, path), true)
      assert.equal(canOpenAdminPath(reader, path + '/new'), false)
      assert.equal(canOpenAdminPath({ ...reader, permissions: ['skills.read', 'skills.create'] }, path + '/new'), true)
      assert.equal(canOpenAdminPath(learner, path), false)
    }
    assert.equal(canOpenAdminPath(reader, '/admin/skills/INVALID'), false)
    const html = renderToStaticMarkup(h(AuthContext.Provider, { value: { user: reader } }, h(MemoryRouter, null, h(AdminLayout, { busy: false, logoutError: '', onLogout() {} }))))
    for (const name of ['Nghe', 'Nói', 'Đọc', 'Viết']) assert.ok(html.includes('Quản lý ' + name))
    assert.ok(!html.includes('Quản lý tài khoản'))
  })
  test('Skill editor read-only and publication states disable content and protect results', () => {
    const initial = { exercise: { id: 'test', skill: 'SPEAKING', title: 'Nói', description: 'Test', questions: [{ prompt: 'Say', text: '你好', hint: '', options: [], accepted: [], explanation: 'Criteria', audioSrc: '/audio/skills/test.mp3' }] }, version: 0, published: true }
    const render = permissions => renderToStaticMarkup(h(AuthContext.Provider, { value: { user: { ...admin, permissions } } }, h(MemoryRouter, null, h(SkillEditor, { initial }))))
    const reader = render(['skills.read'])
    assert.match(reader, /fieldset disabled/)
    assert.ok(!reader.includes('Lưu bản nháp'))
    assert.ok(!reader.includes('Kết quả học viên'))
    assert.ok(reader.includes('chưa chấm phát âm tự động'))
    const publisher = render(['skills.read', 'skills.update', 'skills.publish'])
    assert.ok(publisher.includes('Ẩn bài</button>'))
    assert.ok(!publisher.includes('Lưu bản nháp'))
  })

  test('Learner skill oversight needs both account-read and skill-read permissions', () => {
    const path = '/admin/users/12345678-1234-1234-1234-123456789012/skills'
    assert.equal(canOpenAdminPath({ ...admin, permissions: ['users.read'] }, path), false)
    assert.equal(canOpenAdminPath({ ...admin, permissions: ['users.skills.read'] }, path), false)
    const observer = { ...admin, permissions: ['users.read', 'users.skills.read'] }
    assert.equal(canOpenAdminPath(observer, path), true)
    assert.equal(loginDestination(observer, path), path)
    assert.equal(canOpenAdminPath(observer, path.replace('12345678-1234-1234-1234-123456789012', 'invalid')), false)
  })
  test('Oversight distinguishes absent scores from zero and never exposes a learner submit form', () => {
    const html = renderToStaticMarkup(h(LearnerSkillSummary, { stats: [
      { skill: 'SPEAKING', attempts: 1, completedExercises: 1, averageScore: null, bestScore: null, lastPracticedAt: null },
      { skill: 'WRITING', attempts: 1, completedExercises: 1, averageScore: 0, bestScore: 0, lastPracticedAt: '2026-09-21T00:00:00Z' },
      { skill: 'READING', attempts: 0, completedExercises: 0, averageScore: null, bestScore: null, lastPracticedAt: null },
    ] }))
    assert.match(html, /Tự đánh giá/); assert.match(html, /Trung bình 0\/100/); assert.match(html, /Chưa có điểm/)
    const detail = renderToStaticMarkup(h(LearnerAttemptDetail, { attempt: {
      summary: { title: 'Nói', skill: 'SPEAKING', submittedAt: '2026-09-21T00:00:00Z', score: null },
      questions: [{ id: '1', prompt: 'Đọc câu mẫu', text: '你好', hint: '', answer: 'AGAIN', accepted: [], explanation: 'Đọc lại.' }],
    } }))
    assert.match(detail, /Cần luyện thêm/); assert.doesNotMatch(detail, /<form|<input|<select|\/100 điểm/)
  })

  test('Four-skill links retain the learner destination and do not open management', () => {
    for (const path of ['/skills', '/skills/history', '/skills/attempts/12345678-1234-1234-1234-123456789012']) {
      assert.equal(loginDestination(learner, path), path)
      assert.equal(loginDestination(admin, path), '/admin')
    }
    assert.match(navbar(learner, '/skills'), /4 kỹ năng/)
    assert.equal(loginDestination(learner, '/skills/attempts/invalid'), '/home')
  })
  function skillPractice(skill, submitted = false, score = null) {
    return renderToStaticMarkup(h(MemoryRouter, {}, h(Practice, { initial: {
      summary: { id: 'attempt', exerciseId: 'example', skill, title: 'Bài luyện', score, createdAt: '2026-09-21T10:00:00Z', submittedAt: submitted ? '2026-09-21T10:01:00Z' : null },
      description: 'Luyện tập', questions: [{ id: '1', prompt: 'Câu hỏi', text: '你好', hint: 'nǐ hǎo', options: [], answer: submitted ? 'OK' : null, correct: null, accepted: submitted && skill !== 'SPEAKING' ? ['你好'] : null, explanation: submitted ? 'Giải thích' : null }],
    } })))
  }
  test('Writing drafts require an answer, expose no correction, and explain when input is saved', () => {
    const html = skillPractice('WRITING')
    assert.match(html, /Câu trả lời bằng Hán tự/)
    assert.match(html, /Bấm Lưu bản nháp trước khi rời trang/)
    assert.doesNotMatch(html, /Đáp án:|Giải thích/)
    assert.match(html, /disabled=""[^>]*>Nộp bài và lưu kết quả/)
  })
  test('Saved writing draft restores the learners own answer without revealing solutions', () => {
    const initial = { draftVersion: 1, summary: { id: 'draft', exerciseId: 'writing', skill: 'WRITING', title: 'Viết', score: null, createdAt: '2026-09-30T00:00:00Z', submittedAt: null }, description: '', questions: [{ id: '1', prompt: 'Viết lời chào', text: '', hint: '', options: [], answer: '你好', correct: null, accepted: null, explanation: null }] }
    const html = renderToStaticMarkup(h(MemoryRouter, null, h(Practice, { initial })))
    assert.ok(html.includes('value="你好"'))
    assert.ok(html.includes('Lưu bản nháp'))
    assert.ok(!html.includes('Đáp án:'))
    assert.ok(!html.includes('disabled="" type="submit"'))
  })
  test('Speaking explicitly uses self-assessment without inventing a pronunciation score', () => {
    const draft = skillPractice('SPEAKING')
    assert.match(draft, /chưa chấm thanh điệu hoặc phát âm bằng AI/)
    assert.match(draft, /không gửi lên máy chủ/)
    assert.match(draft, /Tự đánh giá sau khi nghe lại/)
    const result = skillPractice('SPEAKING', true)
    assert.match(result, /Tự đánh giá: Đọc được/)
    assert.doesNotMatch(result, /\/100 điểm/)
    assert.match(skillPractice('WRITING', true, 0), /0\/100 điểm/)
  })

  test('Quiz readers can inspect banks without access to creation or editing routes', () => {
    const reader = { ...admin, role: 'QUIZ_READER', permissions: ['quizzes.read'] }
    assert.equal(canOpenAdminPath(reader, '/admin/quizzes'), true)
    assert.equal(canOpenAdminPath(reader, '/admin/quizzes/1'), true)
    assert.equal(canOpenAdminPath(reader, '/admin/quizzes/new'), false)
    assert.equal(canOpenAdminPath(reader, '/admin/quizzes/1/edit'), false)
    assert.equal(canOpenAdminPath(reader, '/admin/quizzes/invalid'), false)
    assert.match(adminLayout(reader, '/admin/quizzes'), /Quản lý Quiz/)
    assert.doesNotMatch(adminLayout(learner, '/admin/quizzes'), /Quản lý Quiz/)
  })

  function navbar(user, path) {
    return renderToStaticMarkup(h(MemoryRouter, { initialEntries: [path] },
      h(Navbar, { user, busy: false, onLogout() {} })))
  }

  function adminLayout(user, path) {
    return renderToStaticMarkup(h(AuthContext.Provider, { value: { user } },
      h(MemoryRouter, { initialEntries: [path] }, h(AdminLayout, { busy: false, logoutError: '', onLogout() {} }))))
  }

  function guardedContent(Guard, user, path) {
    return renderToStaticMarkup(h(AuthContext.Provider, { value: { user } },
      h(MemoryRouter, { initialEntries: [path] },
        h(Routes, null, h(Route, { element: h(Guard) },
          h(Route, { path, element: h('p', null, 'protected-content') }))))))
  }

  await test('Personal admin security stays inside management without granting account-management permissions', () => {
    const reader = { ...admin, permissions: ['vocabulary.read'] }
    assert.ok(canOpenAdminPath(reader, '/admin/security'))
    assert.ok(!canOpenAdminPath(learner, '/admin/security'))
    assert.equal(loginDestination(reader, '/admin/security'), '/admin/security')
    assert.ok(!guardedContent(RequireAdmin, learner, '/admin/security').includes('protected-content'))
    assert.ok(!guardedContent(RequireAdmin, null, '/admin/security').includes('protected-content'))
    assert.ok(adminLayout(reader, '/admin/security').includes('href="/admin/security"'))
    assert.ok(!canOpenAdminPath(reader, '/admin/users/new'))
  })
  await test('Password form requires current and confirmed new passwords, with no prefilled secret', () => {
    const html = renderToStaticMarkup(h(AuthContext.Provider, { value: { user: learner } }, h(MemoryRouter, null, h(ChangePasswordForm))))
    assert.equal([...html.matchAll(/type="password"/g)].length, 3)
    assert.match(html, /autoComplete="current-password"/)
    assert.equal([...html.matchAll(/autoComplete="new-password"/g)].length, 2)
    assert.match(html, /<button[^>]*class="auth-submit"[^>]*disabled/)
    assert.ok(html.includes('tất cả thiết bị'))
  })
  await test('Auth form explains throttling and a successful password change', () => {
    const html = renderToStaticMarkup(h(MemoryRouter, null, h(LoginForm, { register: false, busy: false, registered: false, passwordChanged: true, retryIn: 45, error: 'Vui lòng chờ.', onSubmit() {} })))
    assert.ok(html.includes('45'))
    assert.ok(html.includes('Hãy đăng nhập bằng mật khẩu mới'))
    assert.ok(html.includes('role="alert"'))
  })

  await test('AI Tutor routes require a learner session and preserve valid return paths', () => {
    for (const path of ['/ai', '/ai/conversations/00000000-0000-0000-0000-000000000001']) {
      assert.equal(loginDestination(learner, path), path); assert.equal(loginDestination(admin, path), '/admin')
      assert.ok(!guardedContent(RequireAuth, null, path).includes('protected-content'))
      assert.ok(!guardedContent(RequireLearner, admin, path).includes('protected-content'))
    }
    assert.equal(loginDestination(learner, '/ai/conversations/../admin'), '/home')
    assert.ok(navbar(learner, '/ai').includes('href="/ai"'))
    assert.ok(!adminLayout(admin, '/admin').includes('href="/ai"'))
  })
  await test('AI transcript escapes generated HTML and clearly distinguishes errors from answers', () => {
    const turn = { id: 'turn', question: '<img src=x onerror=alert(1)>', answer: '<script>alert(1)</script>', status: 'SUCCEEDED' }
    const render = turns => renderToStaticMarkup(h(ChatTranscript, { turns, busy: false, onRetry() {} }))
    const safe = render([turn]); assert.ok(!safe.includes('<script>')); assert.ok(!safe.includes('<img'))
    assert.ok(safe.includes('&lt;script&gt;')); assert.ok(safe.includes('&lt;img'))
    const failed = render([{ ...turn, status: 'FAILED', answer: null, errorCode: 'TIMEOUT', retryOf: null }])
    assert.ok(failed.includes('Câu hỏi của bạn đã được lưu')); assert.ok(failed.includes('Thử lại một lần'))
    assert.ok(!render([{ ...turn, status: 'FAILED', errorCode: 'TIMEOUT', retryOf: 'old' }]).includes('Thử lại một lần'))
    assert.ok(render([{ ...turn, status: 'PENDING', answer: null }]).includes('Đang soạn câu trả lời'))
  })
  await test('AI composer blocks blank and unavailable sends and keeps text during uncertain network results', () => {
    const render = options => renderToStaticMarkup(h(ChatComposer, { value: '', disabled: false, busy: false, uncertain: false, onChange() {}, onSubmit() {}, ...options }))
    assert.match(render({ value: '  ' }), /<button[^>]*disabled/)
    assert.match(render({ value: '你好', disabled: true }), /<button[^>]*disabled/)
    const uncertain = render({ value: '你好', uncertain: true })
    assert.ok(uncertain.includes('你好')); assert.ok(uncertain.includes('Kiểm tra và gửi lại'))
    assert.match(uncertain, /<textarea[^>]*disabled/); assert.ok(uncertain.includes('maxLength="1500"'))
  })

  await test('Progress routes are private, role-separated and available in learner navigation', () => {
    for (const path of ['/progress', '/progress/history']) {
      assert.equal(loginDestination(learner, path), path); assert.equal(loginDestination(admin, path), '/admin')
      assert.ok(!guardedContent(RequireAuth, null, path).includes('protected-content'))
      assert.ok(!guardedContent(RequireLearner, admin, path).includes('protected-content'))
      assert.ok(guardedContent(RequireAuth, learner, path).includes('protected-content'))
    }
    assert.ok(navbar(learner, '/progress').includes('href="/progress"'))
    assert.ok(!adminLayout(admin, '/admin').includes('href="/progress"'))
  })
  await test('Progress distinguishes zero quiz score from no results and renders accessible daily history', () => {
    const emptyDay = { date: '2026-09-14', completedLessons: 0, flashcardReviews: 0, submittedQuizzes: 0, totalActivities: 0 }
    const data = { timeZone: 'Asia/Ho_Chi_Minh', today: emptyDay.date, streak: { current: 0, longest: 0, activeDays: 0, studiedToday: false, lastStudyDate: null },
      totals: { completedLessons: 0, flashcardReviews: 0, submittedQuizzes: 0, averageQuizScore: null }, totalLessons: 12,
      flashcards: { due: 0, saved: 0, reviewed: 0 }, todayActivity: emptyDay, calendar: [emptyDay], recentActivities: [],
      nextAction: { kind: 'LESSON', label: 'Học bài tiếp theo', description: 'Xin chào', path: '/lessons/1' } }
    function render(value) { return renderToStaticMarkup(h(MemoryRouter, null, h(ProgressDashboard, { data: value }))) }
    const empty = render(data)
    assert.ok(empty.includes('Chưa có điểm Quiz')); assert.ok(empty.includes('Chưa có lịch sử'))
    assert.ok(empty.includes('aria-current="date"')); assert.ok(empty.includes('2026-09-14: 0 hoạt động'))
    assert.ok(empty.includes('href="/progress/history?date=2026-09-14"')); assert.ok(empty.includes('href="/lessons/1"'))
    const zero = render({ ...data, totals: { ...data.totals, submittedQuizzes: 1, averageQuizScore: 0 } })
    assert.ok(zero.includes('Trung bình 0/100')); assert.ok(!zero.includes('Chưa có điểm Quiz'))
  })
  await test('Activity times and calendar dates keep the Vietnam study day across browser timezones', () => {
    const previous = process.env.TZ
    try {
      process.env.TZ = 'UTC'
      assert.match(studyDateLabel('2026-09-15'), /^15[/-]09$/)
      const html = renderToStaticMarkup(h(MemoryRouter, null, h(ActivityList, { timeZone: 'Asia/Ho_Chi_Minh', items: [{ id: 1, kind: 'QUIZ_SUBMITTED', sourceId: 'attempt', occurredAt: '2026-09-14T17:00:01Z', studyDate: '2026-09-15', label: 'Bài thử', score: 0, rating: null, lessonId: null }] })))
      assert.match(html, /15[/-]0?9[/-](?:2026|26)/); assert.ok(html.includes('0/100 điểm')); assert.ok(html.includes('href="/quizzes/attempts/attempt"'))
    } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous }
  })

  await test('Quiz routes are private learner routes and preserve safe login return URLs', () => {
    for (const path of ['/quizzes', '/quizzes/history', '/quizzes/attempts/00000000-0000-0000-0000-000000000001']) {
      assert.equal(loginDestination(learner, path), path)
      assert.equal(loginDestination(admin, path), '/admin')
      assert.ok(!guardedContent(RequireAuth, null, path).includes('protected-content'))
      assert.ok(!guardedContent(RequireLearner, admin, path).includes('protected-content'))
      assert.ok(guardedContent(RequireAuth, learner, path).includes('protected-content'))
    }
    for (const path of ['/quizzes/attempts/nope', '/quizzes/attempts/../admin', '/quizzes//evil']) assert.equal(loginDestination(learner, path), '/home')
    assert.ok(navbar(learner, '/quizzes').includes('href="/quizzes"'))
    assert.ok(!adminLayout(admin, '/admin').includes('href="/quizzes"'))
  })

  const quizQuestion = { id: 'question', position: 1, type: 'CHOOSE_MEANING', prompt: '你好 có nghĩa là gì?', options: [{ id: 'a', text: 'Xin chào' }, { id: 'b', text: 'Tạm biệt' }], selectedOptionId: 'b', correctOptionId: 'a', correct: false, explanation: 'Lời giải chỉ xuất hiện sau khi nộp.' }
  await test('Quiz choices use native radios and draft rendering never reveals explanations or correctness', () => {
    const draft = renderToStaticMarkup(h(QuizQuestionCard, { question: quizQuestion, submitted: false, busy: false, onSelect() {} }))
    assert.ok(draft.includes('<fieldset')); assert.ok(draft.includes('<legend')); assert.ok(draft.includes('type="radio"')); assert.ok(draft.includes('checked=""'))
    assert.ok(!draft.includes(quizQuestion.explanation)); assert.ok(!draft.includes('Đáp án đúng')); assert.ok(!draft.includes('Cần ôn lại'))
    const result = renderToStaticMarkup(h(QuizQuestionCard, { question: quizQuestion, submitted: true, busy: false, onSelect() {} }))
    assert.ok(result.includes(quizQuestion.explanation)); assert.ok(result.includes('Đáp án đúng')); assert.ok(result.includes('Bạn đã chọn')); assert.ok(result.includes('disabled=""'))
  })
  await test('Incomplete quiz cannot submit and submitted result renders persisted score and review', () => {
    const summary = { id: 'attempt', setId: 1, title: 'Bài thử', status: 'IN_PROGRESS', questionCount: 5, answeredCount: 1, version: 1, createdAt: '2026-09-14T10:00:00Z', submittedAt: null, correctCount: null, score: null }
    function render(attempt) { return renderToStaticMarkup(h(MemoryRouter, null, h(QuizAttemptForm, { initial: { attempt, questions: [quizQuestion] }, onReload() {} }))) }
    const draft = render(summary)
    assert.ok(draft.includes('Còn 4 câu chưa trả lời')); assert.match(draft, /<button[^>]*disabled=""[^>]*>Nộp bài<\/button>/)
    assert.ok(!draft.includes(quizQuestion.explanation))
    const submitted = render({ ...summary, status: 'SUBMITTED', answeredCount: 5, score: 40, correctCount: 2, submittedAt: summary.createdAt })
    assert.ok(submitted.includes('40')); assert.ok(submitted.includes('Đúng 2/5 câu')); assert.ok(submitted.includes('Chỉ xem câu sai')); assert.ok(submitted.includes(quizQuestion.explanation))
    assert.ok(!submitted.includes('>Nộp bài</button>'))
  })

  await test('Each role has its own landing page and permitted return destinations', () => {
    assert.equal(homePath(null), '/home')
    assert.equal(homePath(learner), '/home')
    assert.equal(homePath(admin), '/admin')
    for (const path of ['/admin', '/admin/vocabulary', '/admin/lessons', '/admin/vocabulary/new', '/admin/lessons/new', '/admin/lessons/1', '/admin/lessons/1/edit', '/admin/users', '/admin/users/new', '/admin/users/00000000-0000-0000-0000-000000000001/edit', '/admin/users/00000000-0000-0000-0000-000000000001/password']) {
      assert.equal(loginDestination(admin, path), path)
      assert.equal(loginDestination(learner, path), '/home')
    }
    for (const path of ['/lessons', '/profile', '/learning', '/vocabulary', '/lessons/12', '/vocabulary/120']) {
      assert.equal(loginDestination(learner, path), path)
      assert.equal(loginDestination(admin, path), '/admin')
    }
    for (const path of [undefined, null, {}, '/admin/settings', '/admin/users/bad/edit', '/admin/lessons/0', '/admin/users/../profile', 'https://example.test', '//example.test', '/lessons/1/../../admin', '/vocabulary/0']) {
      assert.equal(loginDestination(learner, path), '/home')
      assert.equal(loginDestination(admin, path), '/admin')
    }
  })

  await test('Word details return to the original lesson or filtered vocabulary list only', () => {
    for (const path of ['/lessons/1', '/lessons/12', '/vocabulary', '/vocabulary?q=xue&lessonId=1&page=2']) {
      assert.equal(wordReturnPath(path), path)
    }
    for (const path of [null, {}, 'https://example.test', '//example.test', '/admin', '/vocabulary/1', '/vocabulary/../admin', '/lessons/0']) {
      assert.equal(wordReturnPath(path), '/vocabulary')
    }
  })

  await test('Learner and guest navigation never includes management links', () => {
    for (const user of [null, learner]) {
      const html = navbar(user, '/lessons')
      for (const path of ['/home', '/lessons', '/learning', '/vocabulary', '/foundations']) {
        assert.ok(html.includes(`href="${path}"`))
      }
      assert.ok(!html.includes('href="/admin'))
      assert.ok(!html.includes('Quản trị'))
      assert.ok(!html.includes('Quản lý'))
      assert.ok(html.includes('aria-current="page"'))
    }
    assert.ok(navbar(null, '/login').includes('href="/register"'))
    assert.ok(navbar(learner, '/lessons').includes('Đăng xuất'))
  })

  await test('Admin navigation only links to management and can sign out', () => {
    const html = adminLayout(admin, '/admin/lessons')
    assert.ok(html.includes('href="/admin"'))
    assert.ok(html.includes('href="/admin/vocabulary"'))
    assert.ok(html.includes('href="/admin/lessons"'))
    assert.ok(html.includes('href="/admin/users"'))
    assert.ok(html.includes('aria-current="page"'))
    assert.ok(html.includes('Đăng xuất'))
    for (const path of ['/lessons', '/learning', '/profile', '/vocabulary', '/login', '/register']) {
      assert.ok(!html.includes(`href="${path}"`))
    }
    assert.ok(!html.includes('Từ vựng của tôi'))
    assert.ok(!html.includes('Tiến độ'))
    assert.ok(!html.includes('Hồ sơ'))
    assert.equal(navbar(admin, '/admin'), '')
    assert.equal(adminLayout(learner, '/admin'), '')
    assert.equal(adminLayout(null, '/admin'), '')
  })

  await test('Admin sidebar marks only the matching management section active', () => {
    for (const path of ['/admin', '/admin/vocabulary', '/admin/vocabulary/new', '/admin/lessons/new', '/admin/lessons/1', '/admin/lessons/1/edit', '/admin/users', '/admin/users/new', '/admin/users/00000000-0000-0000-0000-000000000001/edit', '/admin/users/00000000-0000-0000-0000-000000000001/password']) {
      const html = adminLayout(admin, path)
      assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1)
      assert.ok(html.includes('aria-controls="admin-navigation"'))
      assert.ok(html.includes('aria-expanded="false"'))
    }
  })

  await test('Direct admin URLs never render management content for learners or guests', () => {
    for (const path of ['/admin', '/admin/vocabulary', '/admin/lessons', '/admin/vocabulary/new', '/admin/lessons/new', '/admin/lessons/1', '/admin/lessons/1/edit', '/admin/users', '/admin/users/new', '/admin/users/00000000-0000-0000-0000-000000000001/edit', '/admin/users/00000000-0000-0000-0000-000000000001/password']) {
      assert.ok(guardedContent(RequireAdmin, admin, path).includes('protected-content'))
      for (const user of [null, learner]) {
        assert.ok(!guardedContent(RequireAdmin, user, path).includes('protected-content'))
      }
    }
  })

  await test('Admin never renders the learner pages even through a direct URL', () => {
    for (const path of ['/lessons', '/learning', '/profile', '/vocabulary', '/vocabulary/120', '/lessons/12']) {
      assert.ok(!guardedContent(RequireLearner, admin, path).includes('protected-content'))
      assert.ok(guardedContent(RequireLearner, learner, path).includes('protected-content'))
    }
    assert.ok(guardedContent(RequireLearner, null, '/lessons').includes('protected-content'))
  })

  await test('A custom reader sees only its permitted menu and cannot open write routes', () => {
    const reader = { ...learner, role: 'REVIEWER', roleName: 'Người duyệt', permissions: ['vocabulary.read'] }
    assert.equal(homePath(reader), '/admin')
    const html = adminLayout(reader, '/admin/vocabulary')
    assert.ok(html.includes('href="/admin/vocabulary"'))
    assert.ok(html.includes('Người duyệt'))
    for (const path of ['/admin/users', '/admin/lessons', '/admin/roles']) assert.ok(!html.includes(`href="${path}"`))
    assert.ok(guardedContent(RequireAdmin, reader, '/admin/vocabulary').includes('protected-content'))
    for (const path of ['/admin/users', '/admin/vocabulary/new', '/admin/roles/new']) {
      assert.ok(!guardedContent(RequireAdmin, reader, path).includes('protected-content'))
      assert.equal(loginDestination(reader, path), '/admin')
    }
    assert.equal(navbar(reader, '/admin'), '')
    assert.ok(!guardedContent(RequireLearner, reader, '/lessons').includes('protected-content'))
  })

  await test('Granular account and role permissions control deep links independently', () => {
    const id = '00000000-0000-0000-0000-000000000001'
    const assigner = { ...learner, role: 'ASSIGNER', permissions: ['users.read', 'users.assign_role'] }
    assert.ok(canOpenAdminPath(assigner, `/admin/users/${id}/edit`))
    assert.ok(!canOpenAdminPath(assigner, `/admin/users/${id}/password`))
    assert.ok(!canOpenAdminPath(assigner, '/admin/users/new'))
    const roleReader = { ...learner, role: 'ROLE_READER', permissions: ['roles.read'] }
    assert.ok(canOpenAdminPath(roleReader, '/admin/roles/EDITOR'))
    assert.ok(!canOpenAdminPath(roleReader, '/admin/roles/EDITOR/edit'))
    for (const path of ['/admin/roles', '/admin/roles/new', '/admin/roles/EDITOR', '/admin/roles/EDITOR/edit']) {
      assert.equal(loginDestination(admin, path), path)
      assert.ok(guardedContent(RequireAdmin, admin, path).includes('protected-content'))
    }
  })

  await test('Role names alone grant no access; empty custom roles remain learners', () => {
    for (const profile of [{ ...admin, permissions: [] }, { ...learner, role: 'CUSTOM' }]) {
      assert.equal(homePath(profile), '/home')
      assert.equal(adminLayout(profile, '/admin'), '')
      assert.ok(!guardedContent(RequireAdmin, profile, '/admin').includes('protected-content'))
      assert.ok(guardedContent(RequireLearner, profile, '/lessons').includes('protected-content'))
    }
  })

  await test('Flashcard routes are private, return after login and stay outside management', () => {
    for (const path of ['/flashcards', '/flashcards/review', '/flashcards/history']) {
      assert.equal(loginDestination(learner, path), path)
      assert.equal(loginDestination(admin, path), '/admin')
      assert.ok(!guardedContent(RequireAuth, null, path).includes('protected-content'))
      assert.ok(guardedContent(RequireAuth, learner, path).includes('protected-content'))
      assert.ok(!guardedContent(RequireLearner, admin, path).includes('protected-content'))
    }
    assert.ok(navbar(learner, '/flashcards').includes('href="/flashcards"'))
    assert.ok(!adminLayout(admin, '/admin').includes('href="/flashcards"'))
  })

  await test('The front of a flashcard hides pronunciation, meaning and rating controls', () => {
    const card = { id: 'card', version: 0, successStreak: 0, reviewCount: 0, nextReviewAt: '2026-09-14T08:00:00Z', lastReviewedAt: null,
      word: { id: 1, hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'Xin chào', exampleHanzi: '你好，小明。', examplePinyin: 'Nǐ hǎo, Xiǎomíng.', exampleMeaningVi: 'Chào Tiểu Minh.' } }
    const html = renderToStaticMarkup(h(ReviewCard, { card, onRecorded() {}, onReload() {} }))
    assert.ok(html.includes('你好'))
    assert.ok(html.includes('Lật thẻ'))
    assert.ok(!html.includes('nǐ hǎo'))
    assert.ok(!html.includes('Xin chào'))
    assert.ok(!html.includes('Chưa nhớ'))
    assert.ok(!html.includes('Chào Tiểu Minh.'))
  })
} finally {
  await server.close()
}
