export const aiModes = {
  EXPLAIN: { label: 'Giải thích từ và ngữ pháp', description: 'Hiểu cách dùng từ, pinyin và ví dụ ngắn.', prompts: [['Giải thích từ', 'Giải thích cách dùng 学习, kèm pinyin, nghĩa Việt và một ví dụ ngắn.'], ['Phân biệt cách dùng', '是 và 很 khác nhau thế nào? Cho mình ví dụ dễ hiểu.']] },
  CORRECT: { label: 'Sửa câu tiếng Trung', description: 'Giữ ý của bạn, chỉ ra lỗi và giải thích cách sửa.', prompts: [['Thử sửa câu', 'Sửa giúp mình câu 我是很高兴。 Giải thích ngắn gọn bằng tiếng Việt.'], ['Kiểm tra câu đúng', 'Câu 我很喜欢喝茶。 có tự nhiên không? Giải thích giúp mình.']] },
  CONVERSATION: { label: 'Luyện hội thoại', description: 'AI hỏi từng câu, chờ bạn trả lời và góp ý.', prompts: [['Làm quen', 'Đóng vai bạn cùng lớp. Cùng mình luyện chào hỏi, hỏi từng câu một, kèm pinyin.'], ['Gọi đồ uống', 'Đóng vai nhân viên quán cà phê. Hãy hỏi mình một câu đơn giản để bắt đầu gọi đồ uống.']] },
  REVIEW: { label: 'Ôn bài cùng AI', description: 'Luyện từng câu hỏi theo bài đã chọn, nhận giải thích sau khi trả lời.', prompts: [['Bắt đầu ôn', 'Giúp mình ôn bài đã chọn. Hỏi từng câu một và đợi mình trả lời. Nếu chưa chọn bài, hãy hỏi chủ đề.'], ['Ôn từ vựng', 'Cho mình một câu hỏi ôn từ vựng trong bài, chưa tiết lộ đáp án.']] },
} as const
export type AiMode = keyof typeof aiModes
