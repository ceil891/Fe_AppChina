import type { Example } from './types'

export function listeningChoices(examples: Example[], current: Example, round: number) {
  const distinct = examples.filter((example, index) => example.pinyin !== current.pinyin && examples.findIndex(item => item.pinyin === example.pinyin) === index)
  const offset = round % Math.max(1, distinct.length)
  const choices = distinct.slice(offset).concat(distinct.slice(0, offset)).slice(0, 3)
  choices.splice(round % (choices.length + 1), 0, current)
  return choices
}
