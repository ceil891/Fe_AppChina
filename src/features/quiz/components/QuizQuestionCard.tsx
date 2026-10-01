import type { QuizQuestion } from '../types/quiz.types'

export function QuizQuestionCard({ question, submitted, busy, onSelect }: {
  question: QuizQuestion; submitted: boolean; busy: boolean; onSelect: (optionId: string) => void
}) {
  // A result is only displayed from a submitted attempt; never infer correctness from option order.
  return <fieldset className="quiz-question" id={'question-' + question.position} disabled={busy || submitted}>
    <legend><span>Câu {question.position} · {question.type === 'CHOOSE_MEANING' ? 'Chọn nghĩa' : 'Chọn từ'}</span>{question.prompt}</legend>
    <div className="quiz-options">{question.options.map((option, index) => {
      const chosen = question.selectedOptionId === option.id
      const correct = submitted && question.correctOptionId === option.id
      return <label key={option.id} className={'quiz-option' + (chosen ? ' chosen' : '') + (correct ? ' correct' : '') + (submitted && chosen && !correct ? ' incorrect' : '')}>
        <input type="radio" name={question.id} value={option.id} checked={chosen} onChange={() => onSelect(option.id)} />
        <span className="quiz-letter">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>
        {correct && <small>Đáp án đúng</small>}{submitted && chosen && !correct && <small>Bạn đã chọn</small>}
      </label>
    })}</div>
    {submitted && <div className={'quiz-explanation ' + (question.correct ? 'is-correct' : 'is-incorrect')}><strong>{question.correct ? 'Bạn trả lời đúng' : 'Cần ôn lại'}</strong><p>{question.explanation}</p></div>}
    {!submitted && question.selectedOptionId && <p className="quiz-saved">Đã lưu câu trả lời</p>}
  </fieldset>
}
