export function selectPermission(previous: string[], code: string, checked: boolean) {
  const next = new Set(previous), module = code.split('.')[0]
  if (checked) {
    next.add(code); next.add(module + '.read')
    if (['courses.create', 'courses.update'].includes(code)) next.add('lessons.read')
    if (['lessons.create', 'lessons.update'].includes(code)) next.add('vocabulary.read')
  } else {
    next.delete(code)
    if (code === module + '.read') for (const permission of next) if (permission.startsWith(module + '.')) next.delete(permission)
    if (code === 'lessons.read') { next.delete('courses.create'); next.delete('courses.update') }
    if (code === 'vocabulary.read') { next.delete('lessons.create'); next.delete('lessons.update') }
  }
  return [...next]
}
