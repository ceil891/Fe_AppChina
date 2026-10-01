import { useCallback, useEffect, useState } from 'react'
import { get } from '../../services/api'

export function useResource<T>(path: string | null) {
  const [attempt, setAttempt] = useState(0)
  const reload = useCallback(() => setAttempt(value => value + 1), [])
  const [result, setResult] = useState<{ path: string; attempt: number; data?: T; error?: string }>()
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    get<T>(path, controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult({ path, attempt, data }) })
      .catch(e => { if (!controller.signal.aborted) setResult({ path, attempt, error: e instanceof Error ? e.message : 'Không tải được dữ liệu.' }) })
    return () => controller.abort()
  }, [path, attempt])
  const current = path !== null && result?.path === path && result.attempt === attempt
  return {
    data: current ? result.data : undefined,
    error: current ? result.error : undefined,
    loading: path !== null && !current,
    reload,
  }
}
