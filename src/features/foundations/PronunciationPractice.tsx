import { useRef, useState } from 'react'
import { ListenButton, Recorder } from '../skills/AudioPractice'
import audio from './audio.json'
import './pronunciation.css'

const tones = [
  { hanzi: '妈', pinyin: 'mā', name: 'Thanh 1 · cao, ngang', hint: 'Giữ giọng cao và đều.' },
  { hanzi: '麻', pinyin: 'má', name: 'Thanh 2 · đi lên', hint: 'Nâng giọng từ vừa lên cao.' },
  { hanzi: '马', pinyin: 'mǎ', name: 'Thanh 3 · xuống rồi lên', hint: 'Khi đọc riêng, hạ giọng thấp rồi nâng lên.' },
  { hanzi: '骂', pinyin: 'mà', name: 'Thanh 4 · đi xuống', hint: 'Hạ giọng từ cao xuống thấp, dứt khoát.' },
] as const
const pairs = [
  { text: '八。趴。', label: 'b / p · bā — pā', tip: 'So sánh luồng hơi: p bật hơi mạnh hơn b.' },
  { text: '鸡。七。', label: 'j / q · jī — qī', tip: 'Giữ vị trí lưỡi gần nhau, chú ý q bật hơi mạnh hơn.' },
  { text: '早。找。', label: 'z / zh · zǎo — zhǎo', tip: 'Nghe sự khác nhau ở âm đầu, không chỉ nhìn chữ Pinyin.' },
  { text: '金。京。', label: 'n / ng · jīn — jīng', tip: 'Chú ý vị trí kết thúc âm: đầu lưỡi với -n, phía sau lưỡi với -ng.' },
] as const
const source = (text: string) => audio[text as keyof typeof audio]

export function ToneChallenge() {
  const [question, setQuestion] = useState<number | null>(null)
  const [choice, setChoice] = useState<number | null>(null)
  const [heard, setHeard] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [error, setError] = useState('')
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const player = useRef<HTMLAudioElement>(null)
  function next() {
    player.current?.pause()
    setQuestion(Math.floor(Math.random() * tones.length)); setChoice(null); setHeard(false); setAnswered(false); setError('')
  }
  const current = question === null ? null : tones[question]
  return <section className="pronunciation-panel" aria-label="Nghe và chọn thanh điệu"><h3>Nghe rồi chọn thanh điệu</h3><p>Nghe trọn âm mẫu, chọn thanh bạn nghe được rồi kiểm tra. Điểm luyện nhanh chỉ giữ trong trang này, không cộng chuỗi ngày học.</p>
    {!current ? <button type="button" onClick={next}>Bắt đầu nghe thử</button> : <>
      <audio key={`${score.total}-${question}`} ref={player} src={source(current.hanzi)} preload="auto" onEnded={() => setHeard(true)} onError={() => setError('Không tải được âm mẫu. Hãy thử lại khi kết nối ổn định.')} />
      <button type="button" onClick={() => { const el = player.current; if (el) { setError(''); el.currentTime = 0; void el.play().catch(() => setError('Chưa phát được âm mẫu. Hãy bấm nghe lại.')) } }}>▶ Nghe âm bí mật</button>
      {error && <p role="alert">{error}</p>}
      <fieldset disabled={!heard || answered}><legend>Bạn nghe được thanh nào?</legend>{tones.map((tone, index) => <label key={tone.hanzi}><input type="radio" name="tone-challenge" checked={choice === index} onChange={() => setChoice(index)} />{tone.name}</label>)}</fieldset>
      {!heard && <p role="status">Nghe hết âm mẫu để chọn đáp án.</p>}
      <button type="button" disabled={!heard || choice === null || answered} onClick={() => { setAnswered(true); setScore(s => ({ correct: s.correct + (choice === question ? 1 : 0), total: s.total + 1 })) }}>Kiểm tra thanh điệu</button>
      {answered && <div role="status"><p><strong>{choice === question ? 'Đúng rồi!' : 'Cùng nghe lại nhé.'}</strong> {current.pinyin} · {current.name}. {current.hint}</p><button type="button" onClick={next}>Âm tiếp theo →</button></div>}
    </>}
    <p>Đúng {score.correct}/{score.total} câu trong lượt luyện này.</p>
  </section>
}

export function PronunciationPractice() {
  const [selected, setSelected] = useState(0)
  const [ready, setReady] = useState(false)
  return <section id="pinyin" className="pronunciation-practice" aria-label="Luyện phát âm Pinyin"><header><p className="study-eyebrow">NGHE · PHÂN BIỆT · ĐỌC LẠI</p><h2>Phòng luyện phát âm Pinyin</h2><p>Bắt đầu với các âm đã có mẫu nghe, rồi so sánh bản đọc của bạn. Chưa chấm phát âm tự động.</p></header>
    <div className="pronunciation-grid">{tones.map(tone => <article className="pronunciation-panel" key={tone.hanzi}><h3>{tone.pinyin} <span lang="zh-CN">{tone.hanzi}</span></h3><p>{tone.name}</p><ListenButton text={tone.hanzi} audioSrc={source(tone.hanzi)} label={`▶ Nghe ${tone.pinyin}`} /></article>)}</div>
    <h3>Các cặp dễ nhầm</h3><div className="pronunciation-grid">{pairs.map(pair => <article className="pronunciation-panel" key={pair.text}><h4>{pair.label}</h4><p>{pair.tip}</p><ListenButton text={pair.text} audioSrc={source(pair.text)} label="▶ Nghe lần lượt hai âm" /></article>)}</div>
    <ToneChallenge />
    <section className="pronunciation-panel"><h3>Thu âm và tự đối chiếu</h3><label>Chọn âm để luyện <select value={selected} onChange={e => { setSelected(Number(e.target.value)); setReady(false) }}>{tones.map((tone, i) => <option key={tone.hanzi} value={i}>{tone.pinyin} · {tone.name}</option>)}</select></label>
      <ListenButton key={selected} text={tones[selected].hanzi} audioSrc={source(tones[selected].hanzi)} />
      <Recorder key={`record-${selected}`} onReady={setReady} />
      {ready && <p role="status">Đã nghe lại bản thu. So sánh hướng đi của giọng, độ dài và sự rõ ràng với âm mẫu. Bạn có thể thu lại để tự đối chiếu.</p>}
    </section>
  </section>
}
