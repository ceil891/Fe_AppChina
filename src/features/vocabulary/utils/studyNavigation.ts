// Location state may come from another page; only accept local learner destinations.
export function wordReturnPath(from: unknown) {
  if (typeof from !== 'string') return '/vocabulary'
  if (/^\/lessons\/[1-9]\d*(?:\?courseId=[1-9]\d*)?$/.test(from)) return from
  if (/^\/vocabulary(?:\?[^#]*)?$/.test(from)) return from
  return '/vocabulary'
}
