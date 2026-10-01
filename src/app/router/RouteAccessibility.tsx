import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function pageTitle(path: string) {
  const names: Record<string, string> = { login: 'Đăng nhập', register: 'Đăng ký', courses: 'Khóa học', lessons: 'Bài học', vocabulary: 'Từ vựng', learning: 'Bài của tôi', profile: 'Hồ sơ', progress: 'Tiến độ', flashcards: 'Flashcard', quizzes: 'Quiz', skills: 'Bốn kỹ năng', ai: 'AI Tutor', admin: 'Quản lý' }
  const learnerNames: Record<string, string> = { home: 'Trang chủ học viên', practice: 'Luyện tập', foundations: 'Nhập môn Pinyin' }
  return (learnerNames[path.split('/')[1] ?? ''] ?? names[path.split('/')[1] ?? ''] ?? 'Học tiếng Trung') + ' · ChinaNN'
}

export function RouteAccessibility() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = pageTitle(pathname)
    let previous: HTMLElement | null = null
    const focusPage = () => {
      const target = document.getElementById('admin-content') ?? document.querySelector<HTMLElement>('main:not([data-route-loading])')
      if (!target || target === previous || target.style.display === 'none') return
      previous = target
      if (!target.id) target.id = 'page-content'
      target.tabIndex = -1
      target.focus({ preventScroll: true })
      const anchor = hash ? document.getElementById(hash.slice(1)) : null
      if (anchor) anchor.scrollIntoView()
      else window.scrollTo(0, 0)
    }
    focusPage()
    // Lazy routes replace their loading surface after the navigation effect runs.
    const observer = new MutationObserver(focusPage)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname, hash])
  return null
}
