import { aiModes } from '../modes'
import type { AiMode } from '../modes'
import type { FormEvent } from 'react'

export function ChatComposer({ value, onChange, onSubmit, disabled, busy, uncertain, mode = 'EXPLAIN' }: {
  mode?: AiMode; value: string; onChange: (value: string) => void; onSubmit: () => void; disabled: boolean; busy: boolean; uncertain: boolean
}) {
  function submit(event: FormEvent) { event.preventDefault(); if (!disabled && value.trim()) onSubmit() }
  return <form className="ai-composer" onSubmit={submit}>
    <div className="ai-suggestions" aria-label="Gợi ý câu hỏi">
      {aiModes[mode].prompts.map(([label, prompt]) => <button key={label} type="button" disabled={disabled || uncertain || !!value} onClick={() => onChange(prompt)}>{label}</button>)}
    </div>
    <label htmlFor="ai-question">Câu hỏi của bạn</label>
    <textarea id="ai-question" name="question" value={value} maxLength={1500} rows={4} required disabled={disabled || uncertain}
      onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.nativeEvent.isComposing && !disabled && !uncertain && value.trim()) { e.preventDefault(); onSubmit() } }}
      onChange={e => onChange(e.target.value)} placeholder="Ví dụ: Giải thích giúp mình cách dùng 是 và 很." aria-describedby="ai-input-hint" />
    <div className="ai-compose-footer"><span id="ai-input-hint">{value.length}/1500 ký tự · Enter xuống dòng · Ctrl/⌘ + Enter để gửi</span>
      <button className="study-primary" disabled={disabled || !value.trim()} type="submit">{busy ? 'Đang gửi…' : uncertain ? 'Kiểm tra và gửi lại' : 'Gửi câu hỏi'}</button></div>
  </form>
}
