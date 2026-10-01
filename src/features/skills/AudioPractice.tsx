import { useEffect, useRef, useState } from 'react'

export function ListenButton({ text, audioSrc, onHeard, label = '▶ Nghe mẫu' }: { text: string; audioSrc?: string; onHeard?: () => void; label?: string }) {
  const [failed, setFailed] = useState(false)
  const [slow, setSlow] = useState(false)
  const [playing, setPlaying] = useState(false)
  const player = useRef<HTMLAudioElement>(null)
  if (!audioSrc || failed) return <BrowserVoice text={text} onHeard={onHeard} label={label} />
  return <div className="skill-audio">
    <button type="button" disabled={playing} onClick={() => { if (player.current) { player.current.currentTime = 0; void player.current.play().catch(() => setFailed(true)) } }}>{playing ? 'Đang phát…' : label}</button>
    <audio ref={player} aria-label="Âm thanh mẫu tiếng Trung" controls preload="metadata" src={audioSrc} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); onHeard?.() }} onError={() => setFailed(true)} />
    <label><input type="checkbox" checked={slow} onChange={e => { setSlow(e.target.checked); if (player.current) player.current.playbackRate = e.target.checked ? 0.75 : 1 }} /> Đọc chậm</label>
  </div>
}

function BrowserVoice({ text, onHeard, label }: { text: string; onHeard?: () => void; label: string }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const [slow, setSlow] = useState(false)
  const active = useRef<SpeechSynthesisUtterance | null>(null)
  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const load = () => setVoices(synth.getVoices().filter(v => /^zh(?:$|[-_](?:CN|TW|SG|Hans|Hant)(?:$|[-_]))/i.test(v.lang)))
    load(); synth.addEventListener('voiceschanged', load)
    return () => { synth.removeEventListener('voiceschanged', load); if (active.current) { active.current.onend = null; active.current.onerror = null; synth.cancel() } }
  }, [supported])
  function play() {
    const voice = voices.find(v => /^zh[-_]CN$/i.test(v.lang)) ?? voices[0]
    if (!voice) return
    const synth = window.speechSynthesis
    synth.cancel(); setError(''); setPlaying(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voice.lang; utterance.voice = voice; utterance.rate = slow ? 0.65 : 0.9
    utterance.onend = () => { active.current = null; setPlaying(false); onHeard?.() }
    utterance.onerror = () => { active.current = null; setPlaying(false); setError('Không phát được âm thanh. Hãy thử lại hoặc kiểm tra giọng tiếng Trung trên thiết bị.') }
    active.current = utterance; synth.speak(utterance)
  }
  return <div className="skill-audio"><button type="button" disabled={!voices.length || playing} onClick={play}>{playing ? 'Đang phát…' : label}</button>
    <label><input type="checkbox" checked={slow} disabled={playing} onChange={e => setSlow(e.target.checked)} /> Đọc chậm</label>
    {!supported ? <p role="status">Trình duyệt này chưa hỗ trợ đọc văn bản. Hãy mở bằng trình duyệt có giọng tiếng Trung.</p> : voices.length === 0 && <p role="status">Chưa tìm thấy giọng tiếng Trung trên thiết bị. Hãy cài giọng đọc tiếng Trung trong cài đặt hệ điều hành rồi mở lại trang.</p>}
    {error && <p role="alert">{error}</p>}
  </div>
}

export function Recorder({ onReady }: { onReady: (ready: boolean) => void }) {
  const [state, setState] = useState<'idle' | 'requesting' | 'recording' | 'ready'>('idle')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const objectUrl = useRef('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alive = useRef(true)
  const supported = typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  const insecure = typeof window !== 'undefined' && window.isSecureContext === false
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      if (timer.current) clearTimeout(timer.current)
      if (recorder.current?.state === 'recording') recorder.current.stop()
      stream.current?.getTracks().forEach(track => track.stop())
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    }
  }, [])
  function stop() { if (recorder.current?.state === 'recording') recorder.current.stop() }
  async function start() {
    setError(''); setState('requesting'); onReady(false)
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = ''; setUrl('') }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!alive.current) { media.getTracks().forEach(track => track.stop()); return }
      stream.current = media
      const recording = new MediaRecorder(media); recorder.current = recording
      const chunks: BlobPart[] = []
      recording.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      recording.onstop = () => {
        media.getTracks().forEach(track => track.stop())
        if (timer.current) clearTimeout(timer.current)
        if (!alive.current) return
        const blob = new Blob(chunks, { type: recording.mimeType || 'audio/webm' })
        if (!blob.size) { setError('Bản ghi trống. Hãy kiểm tra micro rồi thử lại.'); setState('idle'); return }
        objectUrl.current = URL.createObjectURL(blob); setUrl(objectUrl.current); setState('ready')
      }
      recording.onerror = () => { media.getTracks().forEach(track => track.stop()); if (alive.current) { setError('Ghi âm bị gián đoạn. Hãy thử lại.'); setState('idle') } }
      recording.start(); setState('recording'); timer.current = setTimeout(stop, 60000)
    } catch {
      stream.current?.getTracks().forEach(track => track.stop())
      if (alive.current) { setError('Chưa truy cập được micro. Hãy cho phép micro trên trang HTTPS hoặc localhost rồi thử lại.'); setState('idle') }
    }
  }
  return <div className="skill-recorder"><p>Bản thu tối đa 60 giây, chỉ ở trang này và không gửi lên máy chủ. Nghe lại hết bản thu để tự đánh giá.</p>
    {!supported ? <p role="status">{insecure ? 'Trang đang mở qua HTTP nên trình duyệt chưa cho dùng micro. Trên điện thoại, cần địa chỉ HTTPS để thu âm. Bạn vẫn có thể nghe mẫu, đọc bài và luyện viết.' : 'Không có chức năng thu âm trên trình duyệt này. Hãy dùng trình duyệt hỗ trợ micro qua HTTPS hoặc localhost.'}</p> :
      state === 'recording' ? <button type="button" onClick={stop}>■ Dừng ghi âm</button> : <button type="button" disabled={state === 'requesting'} onClick={() => void start()}>{state === 'requesting' ? 'Đang xin quyền micro…' : url ? 'Thu âm lại' : '● Bắt đầu thu âm'}</button>}
    {state === 'recording' && <p role="status">Đang ghi âm · tự dừng sau 60 giây</p>}
    {url && <audio aria-label="Bản thu của bạn" controls src={url} onEnded={() => onReady(true)} />}
    {error && <p role="alert">{error}</p>}
  </div>
}
