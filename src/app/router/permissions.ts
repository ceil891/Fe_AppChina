import type { Profile } from '../../features/auth/types/auth.types'

export function can(user: Profile | null, permission: string | string[]) {
  const codes = Array.isArray(permission) ? permission : [permission]
  return codes.some(code => user?.permissions?.includes(code))
}
export function hasManagementAccess(user: Profile | null) {
  return can(user, ['settings.read', 'courses.read', 'ai.read', 'vocabulary.read', 'lessons.read', 'quizzes.read', 'skills.read', 'foundations.read', 'users.read', 'roles.read'])
}
export function canOpenAdminPath(user: Profile, path: string) {
  if (path === '/admin/general-settings') return can(user, 'settings.read')
  if (path === '/admin/ai-settings') return can(user, 'ai.read')
  if (path === '/admin/learner-progress') return can(user, 'users.read') && can(user, 'users.progress.read')
  if (path === '/admin' || path === '/admin/security') return hasManagementAccess(user)
  const foundationPath = /^\/admin\/foundations(?:\/([a-z][a-z0-9-]{1,59}))?$/.exec(path)
  if (foundationPath) return can(user, 'foundations.read') && (foundationPath[1] !== 'new' || can(user, 'foundations.create'))
  const skillPath = /^\/admin\/skills\/(LISTENING|SPEAKING|READING|WRITING)(?:\/([a-zA-Z0-9-]+))?$/.exec(path)
  if (skillPath) return can(user, 'skills.read') && (skillPath[2] !== 'new' || can(user, 'skills.create'))
  if (/^\/admin\/users\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/skills$/i.test(path))
    return can(user, 'users.read') && can(user, 'users.skills.read')
  const match = /^\/admin\/(courses|vocabulary|lessons|quizzes|users|roles)(?:\/([^/]+))?(?:\/(edit|password))?$/.exec(path)
  if (!match) return false
  const [, section, id, action] = match
  if (!can(user, section + '.read')) return false
  if (!id) return !action
  if (id === 'new') return !action && can(user, section + '.create')
  if (section === 'vocabulary') return false
  if (['courses', 'lessons', 'quizzes'].includes(section) && !/^[1-9]\d*$/.test(id)) return false
  if (section === 'users' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return false
  if (section === 'roles' && !/^[A-Z][A-Z0-9_]{1,39}$/.test(id)) return false
  if (action === 'password') return section === 'users' && can(user, 'users.password')
  if (action === 'edit') return can(user, section === 'users' ? ['users.update', 'users.assign_role', 'users.status'] : section + '.update')
  return section !== 'users'
}
