import { useState } from 'react'
import { ListenButton, Recorder } from '../skills/AudioPractice'
import { Icon } from '../../shared/components/Icon'
import type { Example } from './types'
import { listeningChoices } from './listeningChoices'

export function FoundationSoundLab({ examples }: { examples: Example[] }) {
  const [mode, setMode] = useState<'study' | 'listen'>('study')
  const [selected, setSelected] = useState(0)
  const [query, setQuery] = useState('')
  const [recorded, setRecorded] = useState(false)
  const active = examples[selected] ?? examples[0]
  if (!active) return null
  const normalize = (text: string) => text.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const filtered = examples.map((example, index) => ({ example, index })).filter(({ example }) => normalize(`${example.symbol} ${example.pinyin} ${example.hanzi} ${example.meaning}`).includes(normalize(query)))
  return <section id="foundation-sounds" className="foundation-sound-lab" aria-labelledby="sound-lab-title">
    <header className="foundation-section-header"><div><p className="study-eyebrow">NGHE RÕ · ĐỌC ĐÚNG · NHỚ LÂU</p><h2 id="sound-lab-title">Phòng thực hành âm</h2><p>{examples.length} mẫu nghe trong bài. Chọn một âm để nghe, đọc chậm và thử nói lại.</p></div><span className="sound-lab-stamp" aria-hidden="true">听</span></header>
    <div className="sound-lab-modes" role="group" aria-label="Chế độ thực hành"><button type="button" aria-pressed={mode === 'study'} onClick={() => setMode('study')}><Icon name="book" /> Khám phá mẫu âm</button><button type="button" aria-pressed={mode === 'listen'} onClick={() => setMode('listen')}><Icon name="check" /> Luyện nghe</button></div>
    {mode === 'study' ? <><div className="sound-lab-body"><div className="sound-picker"><label>Tìm âm hoặc nghĩa<input type="search" placeholder="Pinyin, chữ Hán hoặc nghĩa…" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="sound-picker-grid">{filtered.map(({ example, index }) => <button type="button" key={index} aria-pressed={selected === index} onClick={() => { setSelected(index); setRecorded(false) }}><strong>{example.symbol}</strong><span>{example.pinyin}</span></button>)}</div>{filtered.length === 0 && <p role="status">Chưa có mẫu phù hợp. Thử một âm hoặc nghĩa khác.</p>}</div><article className="sound-focus" aria-label="Âm đang chọn"><p className="study-eyebrow">MẪU {String(selected + 1).padStart(2, '0')} / {examples.length}</p><strong className="sound-focus-hanzi" lang="zh-CN">{active.hanzi}</strong><p className="sound-focus-pinyin">{active.pinyin}</p><p className="sound-focus-meaning">{active.meaning}</p><div className="sound-focus-tip"><Icon name="spark" /><p>{active.tip}</p></div><ListenButton key={active.audioSrc} text={active.hanzi} audioSrc={active.audioSrc} label={`▶ Nghe ${active.pinyin}`} /><p className="sound-focus-routine">Nghe một lần → đọc lại ba lần → nghe để đối chiếu.</p></article></div>
      <details className="foundation-recording"><summary>Thu âm để nghe lại giọng của bạn <span aria-hidden="true">↗</span></summary><div><p>Thử đọc <strong>{active.pinyin}</strong>, rồi so sánh với mẫu. Đây là phần tự đối chiếu, chưa chấm phát âm tự động.</p><Recorder key={selected} onReady={setRecorded} />{recorded && <p role="status">Bạn đã nghe lại bản thu. Chú ý âm đầu, âm cuối và đường thanh khi so với mẫu.</p>}</div></details></> : <FoundationListeningDrill examples={examples} />}
  </section>
}

export function FoundationListeningDrill({ examples }: { examples: Example[] }) {
  const [rounds, setRounds] = useState<Example[]>([])
  const [round, setRound] = useState(0)
  const [heard, setHeard] = useState(false)
  const [choice, setChoice] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(0)
  const current = rounds[round]
  const finished = rounds.length > 0 && round >= rounds.length
  function start() {
    const pool = examples.filter((example, index) => examples.findIndex(item => item.pinyin === example.pinyin) === index)
    for (let index = pool.length - 1; index > 0; index--) { const other = Math.floor(Math.random() * (index + 1)); [pool[index], pool[other]] = [pool[other], pool[index]] }
    setRounds(pool.slice(0, 10)); setRound(0); setHeard(false); setChoice(null); setChecked(false); setCorrect(0)
  }
  return <div className="foundation-listening-drill"><div className="listening-intro"><span aria-hidden="true">听</span><div><h3>Nghe trước, nhìn Pinyin sau.</h3><p>Mỗi lượt tối đa 10 âm. Kết quả luyện nghe chỉ ở trang này; bài tự kiểm tra cuối trang mới lưu tiến độ.</p></div></div>
    {!rounds.length ? <button className="study-primary" type="button" onClick={start}>Bắt đầu luyện nghe →</button> : finished ? <div role="status" className="listening-result"><h3>Bạn đã luyện xong một lượt.</h3><p>Chọn đúng {correct}/{rounds.length} âm. Quay lại mẫu nghe để ôn những âm còn dễ nhầm.</p><button type="button" onClick={start}>Luyện lượt mới</button></div> : current && <><div className="listening-progress"><strong>Âm {round + 1}/{rounds.length}</strong><span>Đã đúng {correct} âm</span></div><progress aria-label="Tiến độ luyện nghe" value={round} max={rounds.length} /><ListenButton key={`${round}-${current.audioSrc}`} text={current.hanzi} audioSrc={current.audioSrc} label="▶ Nghe âm cần chọn" onHeard={() => setHeard(true)} />
      {!heard && <p className="study-hint" role="status">Nghe hết mẫu để mở các lựa chọn.</p>}<fieldset disabled={!heard || checked}><legend>Bạn vừa nghe được Pinyin nào?</legend>{listeningChoices(examples, current, round).map(option => <label key={option.pinyin}><input type="radio" name="foundation-listening-choice" checked={choice === option.pinyin} onChange={() => setChoice(option.pinyin)} />{option.pinyin}</label>)}</fieldset>
      {!checked ? <button type="button" className="study-primary" disabled={!heard || choice === null} onClick={() => { setChecked(true); if (choice === current.pinyin) setCorrect(value => value + 1) }}>Kiểm tra lựa chọn</button> : <div className="listening-result" role="status"><strong>{choice === current.pinyin ? 'Đúng rồi!' : 'Cùng nghe lại một chút.'} {current.pinyin} · {current.meaning}</strong><p>{current.tip}</p><button type="button" onClick={() => { setRound(value => value + 1); setHeard(false); setChoice(null); setChecked(false) }}>{round + 1 === rounds.length ? 'Xem kết quả lượt luyện' : 'Âm tiếp theo →'}</button></div>}</>}
  </div>
}
