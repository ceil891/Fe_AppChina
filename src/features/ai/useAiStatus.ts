import { useEffect } from 'react'
import { useResource } from '../../shared/hooks/useResource'
import type { AiStatus } from './types/ai.types'

export function useAiStatus() {
  const result = useResource<AiStatus>('/ai/status')
  useEffect(() => {
    window.addEventListener('focus', result.reload)
    const delay = result.data ? new Date(result.data.resetsAt).getTime() - Date.now() : NaN
    const timer = Number.isFinite(delay) ? window.setTimeout(result.reload, Math.min(2147483647, Math.max(1000, delay + 200))) : undefined
    return () => { window.removeEventListener('focus', result.reload); window.clearTimeout(timer) }
  }, [result.data, result.reload])
  return result
}
