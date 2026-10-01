import { useEffect, useState } from 'react'
import { ApiError } from '../../services/api'

export function useRequestCooldown() {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const remaining = Math.max(0, Math.ceil((until - now) / 1000))
  useEffect(() => {
    if (!until) return
    const timer = window.setInterval(() => {
      const time = Date.now()
      setNow(time)
      if (time >= until) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [until])
  function apply(error: unknown) {
    if (error instanceof ApiError && error.status === 429) {
      const time = Date.now(); setNow(time); setUntil(time + (error.retryAfter || 60) * 1000)
    }
  }
  return { remaining, apply }
}
