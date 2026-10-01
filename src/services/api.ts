export class ApiError extends Error {
  readonly status: number
  readonly retryAfter: number
  readonly fields: Record<string, string>
  constructor(status: number, message: string, retryAfter = 0, fields: Record<string, string> = {}) {
    super(message); this.status = status; this.retryAfter = retryAfter; this.fields = fields
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { ...options, credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}))
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/me') {
      window.dispatchEvent(new Event('auth-expired'))
    }
    const fields = Object.fromEntries(Object.entries(problem.errors ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
    const seconds = Number(response.headers.get('Retry-After'))
    const retryAfter = Number.isFinite(seconds) ? Math.min(3600, Math.max(0, seconds)) : 0
    throw new ApiError(response.status, Object.values(fields).join(' ') || problem.detail || 'Không thực hiện được yêu cầu.', retryAfter, fields)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { signal })
}

export async function mutate<T>(method: 'POST' | 'PATCH' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
  // Re-read token after session rotation/login/logout; never cache identity or secrets locally.
  const csrf = await get<{ token: string; headerName: string }>('/auth/csrf')
  return request<T>(path, {
    method, headers: { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
