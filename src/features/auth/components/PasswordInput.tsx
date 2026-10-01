import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Icon } from '../../../shared/components/Icon'
export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false)
  return <div className="auth-input-wrap"><Icon name="lock" className="input-icon" />
    <input {...props} type={visible ? 'text' : 'password'} />
    <button type="button" className="password-toggle" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible}
      aria-controls={props.id} disabled={props.disabled} onClick={() => setVisible(v => !v)}><Icon name={visible ? 'eye-off' : 'eye'} /></button>
  </div>
}
