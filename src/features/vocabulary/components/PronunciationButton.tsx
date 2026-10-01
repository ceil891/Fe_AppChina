import { ListenButton } from '../../skills/AudioPractice'
import audio from '../vocabularyAudio.json'

export function PronunciationButton({ text }: { text: string }) {
  const source = Object.hasOwn(audio, text) ? (audio as Record<string, string>)[text] : undefined
  return <div className="word-pronunciation"><ListenButton key={text} text={text} audioSrc={source} label="▶ Nghe phát âm" /></div>
}
