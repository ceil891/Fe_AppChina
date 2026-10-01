export function LoadingState({ label = 'Đang tải nội dung…', compact = false }: { label?: string; compact?: boolean }) {
  return <div className={`loading-state${compact ? ' is-compact' : ''}`} role="status" aria-live="polite"><span className="loading-label"><span className="loading-dot" aria-hidden="true" />{label}</span>{!compact && <div className="loading-lines" aria-hidden="true"><span /><span /><span /></div>}</div>
}
