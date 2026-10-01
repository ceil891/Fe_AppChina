import type { AiStatus } from '../types/ai.types'

export function Availability({ status }: { status: AiStatus }) {
  const explanations: Record<string, string> = {
    DISABLED: 'AI Tutor đang tạm tắt bởi quản trị viên. Bạn vẫn có thể học bài và ôn tập.',
    NOT_CONFIGURED: 'AI Tutor chưa được bật. Quản trị viên cần cấu hình kết nối Gemini.',
    GLOBAL_LIMIT: 'Ứng dụng đã hết hạn mức AI hôm nay. Bạn có thể quay lại sau khi hạn mức làm mới.',
    DAILY_LIMIT: 'Bạn đã dùng hết lượt AI hôm nay. Hãy tiếp tục học bài hoặc ôn tập.',
  }
  return <div className="ai-availability" role="status">
    <p>{status.available ? `Còn ${status.remainingToday}/${status.dailyLimit} lượt gửi hôm nay` : explanations[status.reason] ?? 'AI Tutor chưa sẵn sàng. Bạn vẫn có thể học bài, ôn Flashcard và làm Quiz.'}</p>
    <small>Hạn mức làm mới lúc {new Date(status.resetsAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (giờ Việt Nam). Lượt gửi lỗi cũng có thể tính vào hạn mức.</small>
  </div>
}
