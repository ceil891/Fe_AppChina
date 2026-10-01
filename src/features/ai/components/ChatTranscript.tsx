import type { AiTurn } from '../types/ai.types'

const messages: Record<string, string> = {
  TIMEOUT: 'AI trả lời quá lâu hoặc kết nối bị gián đoạn. Câu hỏi của bạn đã được lưu.',
  PROVIDER_ERROR: 'Chưa nhận được câu trả lời từ Gemini. Bạn có thể thử lại sau.',
  RATE_LIMITED: 'Gemini đang giới hạn lượt gọi. Vui lòng đợi rồi thử lại.',
  UNAVAILABLE: 'Dịch vụ Gemini chưa sẵn sàng. Vui lòng quay lại sau.',
  BLOCKED: 'Gemini không thể trả lời yêu cầu này. Hãy diễn đạt lại câu hỏi học tiếng Trung.',
  CONTEXT_LIMIT: 'Nội dung hội thoại quá dài để gửi tiếp. Hãy bắt đầu hội thoại mới với câu hỏi ngắn hơn.',
  OUTPUT_LIMIT: 'Câu trả lời vượt giới hạn độ dài. Hãy yêu cầu giải thích ngắn hơn.',
  INVALID_RESPONSE: 'Gemini chưa trả về câu trả lời hoàn chỉnh. Bạn có thể thử lại sau.',
}
export function ChatTranscript({ turns, busy, onRetry }: { turns: AiTurn[]; busy: boolean; onRetry: (turn: AiTurn) => void }) {
  return <section className="ai-transcript" aria-label="Nội dung hội thoại">
    {!turns.length && <div className="ai-empty"><span lang="zh">一起学习</span><h2>Cùng học một chút mỗi ngày</h2><p>Hỏi nghĩa của từ, nhờ sửa một câu hoặc luyện một đoạn hội thoại ngắn.</p></div>}
    {turns.map((turn, index) => <article className="ai-turn" key={turn.id}>
      <div className="ai-question"><span>Bạn{turn.retryOf ? ' · Thử lại' : ''}</span><p>{turn.question}</p></div>
      <div className="ai-answer"><span>AI Tutor · Gemini</span>
        {turn.status === 'SUCCEEDED' ? <p>{turn.answer}</p> : turn.status === 'PENDING' ? <p role="status">Đang soạn câu trả lời…</p> : <div className="ai-failure" role="alert"><p>{messages[turn.errorCode ?? ''] ?? 'Chưa nhận được câu trả lời. Vui lòng thử lại sau.'}</p>
          {index === turns.length - 1 && !turn.retryOf && ['TIMEOUT', 'PROVIDER_ERROR', 'RATE_LIMITED', 'INVALID_RESPONSE'].includes(turn.errorCode ?? '') && <button disabled={busy} onClick={() => onRetry(turn)}>Thử lại một lần</button>}
        </div>}
      </div>
    </article>)}
  </section>
}
