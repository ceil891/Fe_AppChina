# Âm thanh nhập môn

21 tệp MP3 tạo bằng Google Translate TTS qua gTTS 2.5.4 ngày 23/09/2026.
Manifest: `frontend/src/features/foundations/audio.json`; hai ví dụ còn lại dùng lại MP3 từ vựng đã có.
Chỉ gửi các chữ/cụm tiếng Trung cố định trong giáo trình để tổng hợp; không gửi dữ liệu học viên.
Ứng dụng phát MP3 cùng origin, có điều khiển nghe chậm; chỉ thử giọng thiết bị nếu MP3 lỗi.
Đây là âm thanh tổng hợp, chưa được giáo viên phát âm nghiệm thu độc lập.

Tái tạo bằng `scripts/generate-foundation-audio.py` trong môi trường có gTTS 2.5.4.
Script giữ nguyên các tệp có sẵn. Khi đổi câu ví dụ, dùng tên tệp mới và cập nhật manifest.
