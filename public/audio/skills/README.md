# Âm thanh luyện kỹ năng

12 đoạn giọng tổng hợp tiếng Trung phổ thông (`zh-CN`), sinh ngày 21/09/2026 bằng gTTS 2.5.4 từ các câu nhập môn do dự án biên tập. Không phải bản thu của giáo viên hoặc học viên.

Nguồn công cụ: https://gtts.readthedocs.io/en/latest/module.html

Tái tạo bằng `scripts/generate-skill-audio.py` tại thư mục gốc, với Python và gTTS 2.5.4. Script chỉ gửi các câu cố định trong mã nguồn tới Google Translate TTS; bỏ qua file đã tồn tại. Cần người dạy kiểm tra chất lượng phát âm trước khi coi là tài liệu chuẩn.

Trong lúc học, trình duyệt tải MP3 từ chính ứng dụng, không gọi nhà cung cấp TTS. Tên file chứa ID bài có phiên bản và ID câu; giữ file cũ khi xuất bản phiên bản mới để các lượt đã lưu vẫn nghe lại được.
