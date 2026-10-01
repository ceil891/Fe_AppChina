import type { Profile } from '../../features/auth/types/auth.types'
import { canOpenAdminPath, hasManagementAccess } from './permissions'

export function homePath(user: Profile | null) {
  return hasManagementAccess(user) ? '/admin' : '/home'
}
export function loginDestination(user: Profile, requestedPath: unknown) {
  if (typeof requestedPath !== 'string') return homePath(user)
  if (!hasManagementAccess(user) && /^\/courses(?:\/[1-9]\d*)?$/.test(requestedPath)) return requestedPath
  if (hasManagementAccess(user)) return canOpenAdminPath(user, requestedPath) ? requestedPath : '/admin'
  if (/^\/lessons\/[1-9]\d*\?courseId=[1-9]\d*$/.test(requestedPath)) return requestedPath
  if (/^\/ai\?lessonId=[1-9]\d*$/.test(requestedPath)) return requestedPath
  if (/^\/skills\?skill=(LISTENING|SPEAKING|READING|WRITING)(&exercise=[a-zA-Z0-9-]{1,60})?$/.test(requestedPath)) return requestedPath
  return ['/home', '/practice', '/foundations', '/skills', '/skills/history', '/ai', '/lessons', '/vocabulary', '/learning', '/profile', '/progress', '/progress/history', '/flashcards', '/flashcards/review', '/flashcards/history', '/quizzes', '/quizzes/history'].includes(requestedPath) || /^\/foundations\/[a-z][a-z0-9-]{1,59}$/.test(requestedPath) || /^\/(lessons|vocabulary)\/[1-9]\d*$/.test(requestedPath) || /^\/(?:skills\/attempts|quizzes\/attempts|ai\/conversations)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedPath)
    ? requestedPath : '/home'
}
