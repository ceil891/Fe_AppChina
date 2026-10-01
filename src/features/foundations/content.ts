// Original editorial fixture used by migration V19 and tests. Live content comes from /foundations.
export interface SoundExample { symbol: string; pinyin: string; hanzi: string; meaning: string; tip: string }
export interface FoundationQuestion { prompt: string; options: string[]; correct: number; explanation: string }
export interface FoundationLesson {
  slug: string; title: string; subtitle: string; minutes: number; symbol: string
  sections: { title: string; text: string }[]
  groups?: { title: string; sounds: string; note: string }[]
  examples: SoundExample[]; questions: FoundationQuestion[]
}

export const foundationLessons: FoundationLesson[] = [
  {
    slug: 'pinyin', title: 'Tiếng Trung bắt đầu từ đâu?', subtitle: 'Chữ Hán, Pinyin và cấu tạo một âm tiết.', minutes: 8, symbol: '拼',
    sections: [
      { title: 'Chữ Hán và Pinyin là hai điều khác nhau', text: 'Tiếng Trung dùng chữ Hán để viết. Pinyin (bính âm) dùng chữ Latin để ghi cách đọc tiếng Phổ thông. Vì vậy, “bảng chữ cái tiếng Trung” mà người mới thường tìm chính là bảng âm Pinyin. Bạn sẽ học âm cùng với chữ Hán, không cần thuộc nhiều chữ ngay từ đầu.' },
      { title: 'Một âm tiết có những gì?', text: 'Ví dụ mā: m là thanh mẫu (âm đầu), a là vận mẫu (phần còn lại), dấu ngang là thanh 1. Có âm tiết không có thanh mẫu, như ài (爱, yêu). Thanh điệu là một phần của cách đọc và có thể làm thay đổi nghĩa.' },
      { title: 'Học theo ba bước', text: 'Nhìn Pinyin → nghe ví dụ → đọc lại chậm. Đừng đọc các chữ b, p, q, x theo tên chữ cái tiếng Việt hoặc tiếng Anh. Hãy học âm của chúng trong âm tiết hoàn chỉnh. Ví dụ nghe trong bài dùng chữ Hán để giọng đọc không đọc thành tên chữ Latin.' },
    ],
    examples: [
      { symbol: 'm + a + ˉ', pinyin: 'mā', hanzi: '妈', meaning: 'mẹ', tip: 'Một âm tiết, thanh 1.' },
      { symbol: 'n + i + ˇ', pinyin: 'nǐ', hanzi: '你', meaning: 'bạn', tip: 'Một âm tiết, thanh 3.' },
      { symbol: 'h + ao + ˇ', pinyin: 'hǎo', hanzi: '好', meaning: 'tốt', tip: 'ao là một vận mẫu.' },
    ],
    questions: [
      { prompt: 'Pinyin dùng để làm gì?', options: ['Thay thế hoàn toàn chữ Hán', 'Ghi cách phát âm tiếng Phổ thông', 'Ghi nghĩa tiếng Việt'], correct: 1, explanation: 'Pinyin hỗ trợ ghi âm; chữ Hán vẫn là hệ chữ viết bạn sẽ học.' },
      { prompt: 'Trong mā, đâu là thanh mẫu?', options: ['m', 'a', 'Dấu ngang'], correct: 0, explanation: 'm là âm đầu, a là vận mẫu và dấu ngang chỉ thanh 1.' },
    ],
  },
  {
    slug: 'van-mau-don', title: '6 vận mẫu đơn', subtitle: 'Làm quen a, o, e, i, u, ü và khẩu hình.', minutes: 10, symbol: 'ü',
    sections: [
      { title: 'Bắt đầu với miệng và môi', text: 'Vận mẫu chứa phần nguyên âm của âm tiết. Luyện sáu âm cơ bản a, o, e, i, u, ü trước; đọc chậm và quan sát khẩu hình trong gương. Các gợi ý tiếng Việt chỉ giúp hình dung ban đầu, không thay thế việc nghe tiếng Phổ thông.' },
      { title: 'Phân biệt u và ü', text: 'Với u, tròn môi và đưa lưỡi về phía sau. Với ü, giữ vị trí lưỡi gần âm i rồi tròn môi, không chuyển lưỡi về vị trí u. So sánh lù (路, đường) và lǜ (绿, xanh lá). Sau n, l, hai chấm của ü vẫn được giữ.' },
      { title: 'Một chữ viết có thể có cách đọc khác theo âm tiết', text: 'Âm i trong mǐ khác phần cuối của zhī, chī, shī, rì và zī, cí, sī. Âm o sau b, p, m, f cũng nên học trong cả âm tiết như bō. Chưa cần ép mọi chữ viết vào một âm tiếng Việt tương đương.' },
    ],
    groups: [{ title: 'Bảng vận mẫu đơn', sounds: 'a o e i u ü', note: 'Đọc từng âm, thả lỏng hàm và không thêm âm cuối.' }],
    examples: [
      { symbol: 'a', pinyin: 'bā', hanzi: '八', meaning: 'tám', tip: 'Mở miệng rộng, lưỡi thả lỏng.' },
      { symbol: 'o', pinyin: 'bō', hanzi: '波', meaning: 'sóng', tip: 'Tròn môi; nghe và bắt chước cả âm bō.' },
      { symbol: 'e', pinyin: 'gē', hanzi: '哥', meaning: 'anh trai', tip: 'Môi không tròn, lưỡi lùi về sau.' },
      { symbol: 'i', pinyin: 'mǐ', hanzi: '米', meaning: 'gạo', tip: 'Miệng mở hẹp, lưỡi nâng về trước.' },
      { symbol: 'u', pinyin: 'lù', hanzi: '路', meaning: 'đường', tip: 'Tròn môi, lưỡi nâng về phía sau.' },
      { symbol: 'ü', pinyin: 'lǜ', hanzi: '绿', meaning: 'xanh lá', tip: 'Lưỡi như i, môi tròn như u.' },
    ],
    questions: [
      { prompt: 'Khẩu hình nào giúp tạo âm ü?', options: ['Miệng mở rộng như a', 'Đọc u và giữ nguyên lưỡi', 'Giữ lưỡi gần i rồi tròn môi'], correct: 2, explanation: 'Điểm khác quan trọng là vị trí lưỡi: ü ở phía trước, u ở phía sau.' },
      { prompt: 'Cặp nào cần phân biệt âm u và ü?', options: ['mā / má', 'lù / lǜ', 'bā / pā'], correct: 1, explanation: 'lù và lǜ có cùng thanh 4 nhưng khác vận mẫu.' },
    ],
  },
  {
    slug: 'thanh-mau', title: '21 thanh mẫu', subtitle: 'Nhóm âm đầu và cách phân biệt bật hơi.', minutes: 15, symbol: 'b p',
    sections: [
      { title: 'Học theo nhóm thay vì học một hàng dài', text: 'Thanh mẫu là âm đầu của âm tiết. Bảng dưới có 21 thanh mẫu phụ âm thường dạy trong Pinyin. y và w được học riêng như cách viết âm tiết bắt đầu bằng i, u, ü; không cộng chúng vào bảng 21 này.' },
      { title: 'Bật hơi: khác biệt cần nghe và cảm nhận', text: 'Các cặp b/p, d/t, g/k, j/q, zh/ch, z/c khác nhau chủ yếu ở luồng hơi bật ra. Âm thứ hai bật hơi mạnh hơn. Đặt bàn tay trước miệng và thử bā rồi pā: với pā, bạn cảm thấy hơi rõ hơn. Đừng chỉ dựa vào cách đọc b, d tiếng Việt.' },
      { title: 'Ba nhóm dễ lẫn', text: 'j, q, x: đầu lưỡi gần mặt sau răng dưới, phần trước lưỡi nâng lên. zh, ch, sh, r: nâng đầu lưỡi về phía sau gờ lợi, tránh cuộn quá mạnh. z, c, s: đầu lưỡi gần răng trên, không nâng lùi như zh, ch, sh.' },
    ],
    groups: [
      { title: 'Môi và răng–môi', sounds: 'b p m f', note: 'b/p khép hai môi; m có hơi qua mũi; f đặt răng trên nhẹ lên môi dưới.' },
      { title: 'Đầu lưỡi', sounds: 'd t n l', note: 'Đầu lưỡi chạm vùng lợi phía sau răng trên; t bật hơi hơn d.' },
      { title: 'Gốc lưỡi', sounds: 'g k h', note: 'Tạo âm ở phía sau khoang miệng; k bật hơi hơn g.' },
      { title: 'Mặt lưỡi', sounds: 'j q x', note: 'Đầu lưỡi ở thấp; q bật hơi hơn j.' },
      { title: 'Đầu lưỡi nâng lùi', sounds: 'zh ch sh r', note: 'zh và ch là mỗi âm một thanh mẫu, dù viết bằng hai chữ.' },
      { title: 'Đầu lưỡi phía trước', sounds: 'z c s', note: 'c bật hơi hơn z; không đọc c theo cách đọc chữ c tiếng Việt.' },
    ],
    examples: [
      { symbol: 'b / p', pinyin: 'bā · pā', hanzi: '八。趴。', meaning: 'tám · nằm sấp', tip: 'Cảm nhận luồng hơi mạnh hơn ở pā.' },
      { symbol: 'j / q', pinyin: 'jī · qī', hanzi: '鸡。七。', meaning: 'gà · bảy', tip: 'Giữ vị trí lưỡi, đổi mức bật hơi.' },
      { symbol: 'z / zh', pinyin: 'zǎo · zhǎo', hanzi: '早。找。', meaning: 'sớm · tìm', tip: 'Chú ý vị trí đầu lưỡi; cả hai cùng thanh 3.' },
    ],
    questions: [
      { prompt: 'Âm nào bật hơi mạnh hơn trong cặp b/p?', options: ['b', 'p', 'Hai âm giống hệt nhau'], correct: 1, explanation: 'p bật hơi, b không bật hơi mạnh. Thử cảm nhận bằng bàn tay trước miệng.' },
      { prompt: 'zh được tính thế nào trong bảng thanh mẫu?', options: ['Hai thanh mẫu z và h', 'Một vận mẫu', 'Một thanh mẫu viết bằng hai chữ'], correct: 2, explanation: 'zh, ch, sh đều là các thanh mẫu riêng.' },
    ],
  },
  {
    slug: 'van-mau-ghep', title: 'Vận mẫu ghép và âm mũi', subtitle: 'Ghép âm mượt hơn, phân biệt -n với -ng.', minutes: 15, symbol: 'ai',
    sections: [
      { title: 'Giữ các phần trong cùng một âm tiết', text: 'Khi đọc ai, ao, ou, lưỡi và môi chuyển từ vị trí đầu đến vị trí cuối trong một âm tiết. Không ngắt thành hai tiếng. Luyện hǎo, lái, kǒu thật chậm rồi tăng dần tốc độ.' },
      { title: 'Âm mũi -n và -ng', text: 'Với -n, đầu lưỡi chạm vùng lợi sau răng trên. Với -ng, phần sau lưỡi nâng lên chạm ngạc mềm; không thêm tiếng g ở cuối. Luyện theo cặp như jīn/jīng và xīn/xīng để nghe khác biệt.' },
      { title: 'Cách viết rút gọn', text: 'Sau thanh mẫu, iou thường viết iu (liú), uei viết ui (shuǐ), uen viết un (lùn). Khi không có thanh mẫu, chúng được viết you, wei, wen. Bảng này nhóm các cách viết thường gặp để tra cứu, không khẳng định mọi thanh mẫu đều ghép được với mọi vận mẫu.' },
    ],
    groups: [
      { title: 'Vận mẫu ghép cơ bản', sounds: 'ai ei ao ou', note: 'Ví dụ: lái (đến), běi (bắc), hǎo (tốt), kǒu (miệng).' },
      { title: 'Kết thúc bằng âm mũi', sounds: 'an en ang eng ong', note: 'So sánh an/ang và en/eng; không bỏ âm cuối.' },
      { title: 'Nhóm bắt đầu bằng i', sounds: 'ia ie iao iu ian in iang ing iong', note: 'Ví dụ: jiā, xiè, xiǎo, liú, tiān, xīn, xiǎng, jīng, xiōng.' },
      { title: 'Nhóm bắt đầu bằng u', sounds: 'ua uo uai ui uan un uang ueng', note: 'ueng thường xuất hiện ở âm tiết weng; ui, un là cách viết rút gọn sau thanh mẫu.' },
      { title: 'Nhóm ü và âm er', sounds: 'üe üan ün er', note: 'Sau j, q, x, ü bỏ hai chấm: jue, quan, xun. er là một âm tiết riêng; âm -r hóa sẽ học sau.' },
    ],
    examples: [
      { symbol: 'ai', pinyin: 'lái', hanzi: '来', meaning: 'đến', tip: 'Chuyển âm liên tục, không tách a và i thành hai tiếng.' },
      { symbol: 'in / ing', pinyin: 'jīn · jīng', hanzi: '金。京。', meaning: 'vàng · kinh đô', tip: 'Nghe vị trí kết thúc khác nhau của -n và -ng.' },
      { symbol: 'üe', pinyin: 'xué', hanzi: '学', meaning: 'học', tip: 'u sau x ở đây biểu thị ü, dù không viết hai chấm.' },
    ],
    questions: [
      { prompt: 'Sau thanh mẫu, uei thường được viết là gì?', options: ['ui', 'iu', 'ü'], correct: 0, explanation: 'Ví dụ shuǐ dùng cách viết ui thay cho uei.' },
      { prompt: 'Trong xué, chữ u biểu thị âm nào?', options: ['u như trong lù', 'ü', 'Không có nguyên âm'], correct: 1, explanation: 'Sau j, q, x, hai chấm của ü được lược bỏ trong cách viết.' },
    ],
  },
  {
    slug: 'thanh-dieu', title: '4 thanh điệu và thanh nhẹ', subtitle: 'Cùng một âm, đổi thanh có thể đổi nghĩa.', minutes: 12, symbol: 'ǎ',
    sections: [
      { title: 'Luyện đường đi của giọng', text: 'Thanh 1 giữ giọng cao và đều; thanh 2 đi từ vừa lên cao; thanh 3 khi đọc riêng hạ thấp rồi nâng lên; thanh 4 đi từ cao xuống thấp. Các đường minh họa bên dưới thể hiện độ cao tương đối, không yêu cầu mọi người có cùng cao độ.' },
      { title: 'Thanh nhẹ không có dấu', text: 'Thanh nhẹ được đọc ngắn và nhẹ hơn âm tiết nhấn. Cao độ phụ thuộc âm đứng trước, không phải lúc nào cũng ngang. Ví dụ âm ma trong câu hỏi có 吗. Không đồng nhất các thanh tiếng Trung với dấu sắc, hỏi, nặng của tiếng Việt.' },
      { title: 'Thanh 3 trong lời nói tự nhiên', text: 'Thanh 3 thường chỉ xuống thấp khi đứng trước thanh 1, 2 hoặc 4; không cần lúc nào cũng kéo lên rõ. Khi hai thanh 3 đứng cạnh nhau, thanh đầu thường đọc thành thanh 2: nǐ hǎo nghe gần ní hǎo, nhưng Pinyin cơ bản vẫn viết nǐ hǎo.' },
    ],
    examples: [
      { symbol: 'ˉ', pinyin: 'mā', hanzi: '妈', meaning: 'mẹ', tip: 'Thanh 1 · cao và ngang.' },
      { symbol: 'ˊ', pinyin: 'má', hanzi: '麻', meaning: 'gai / tê', tip: 'Thanh 2 · đi lên.' },
      { symbol: 'ˇ', pinyin: 'mǎ', hanzi: '马', meaning: 'ngựa', tip: 'Thanh 3 · thấp, xuống rồi lên khi đọc riêng.' },
      { symbol: 'ˋ', pinyin: 'mà', hanzi: '骂', meaning: 'mắng', tip: 'Thanh 4 · đi xuống dứt khoát.' },
      { symbol: '·', pinyin: 'nǐ hǎo ma?', hanzi: '你好吗？', meaning: 'bạn khỏe không?', tip: 'ma cuối câu là thanh nhẹ; nghe trong cả câu.' },
    ],
    questions: [
      { prompt: 'mǎ mang thanh nào?', options: ['Thanh 2', 'Thanh 3', 'Thanh 4'], correct: 1, explanation: 'Dấu ˇ là thanh 3. mǎ (马) nghĩa là ngựa.' },
      { prompt: 'Khi đọc tự nhiên nǐ hǎo, thanh của nǐ thường đổi thế nào?', options: ['Đọc gần thanh 2', 'Đọc thanh 4', 'Bỏ hẳn âm nǐ'], correct: 0, explanation: 'Hai thanh 3 liên tiếp: thanh đầu thường đọc thành thanh 2.' },
    ],
  },
  {
    slug: 'ghep-am', title: 'Ghép âm và lời chào đầu tiên', subtitle: 'Đặt dấu thanh, nhận diện y/w và đọc câu ngắn.', minutes: 12, symbol: '你好',
    sections: [
      { title: 'Đặt dấu thanh ở đâu?', text: 'Có a thì đặt trên a; không có a thì ưu tiên o hoặc e. Với iu và ui, đặt dấu lên nguyên âm sau: liú, shuǐ. Với i, bỏ chấm khi thêm dấu: nǐ. Ví dụ hǎo, xué, dōu. Dấu thanh thuộc cả âm tiết, không chỉ riêng nguyên âm mang dấu.' },
      { title: 'y, w và các âm tiết không có thanh mẫu', text: 'Những cách viết thường gặp: i → yi, ia → ya, ie → ye; u → wu, ua → wa, uo → wo; ü → yu, üe → yue, üan → yuan, ün → yun. y và w giúp thể hiện ranh giới âm tiết. Chữ u trong yu biểu thị ü.' },
      { title: 'Một chút biến điệu của 不 và 一', text: '不 thường đọc bù, nhưng trước thanh 4 đọc bú: bú shì (不是, không phải). 一 đọc yī khi đứng riêng hoặc đếm; trước thanh 4 thường đọc yí (yí gè), trước thanh 1, 2, 3 thường đọc yì (yì tiān). Hãy học qua cụm từ, vì còn ngữ cảnh dùng khác.' },
      { title: 'Từ âm đến câu', text: 'Đọc 你好 chậm theo từng âm, rồi nối lại thành lời chào. Với 谢谢, âm xiè đầu là thanh 4 và xie sau thường là thanh nhẹ. Tập nói từng cụm ba lần, nghe lại mẫu giữa các lượt. Sau bài này, chuyển sang bài theo chủ đề để học chữ Hán và từ vựng trong ngữ cảnh.' },
    ],
    examples: [
      { symbol: '你好', pinyin: 'nǐ hǎo', hanzi: '你好', meaning: 'xin chào', tip: 'Thanh 3 + thanh 3: âm đầu đổi khi nói.' },
      { symbol: '谢谢', pinyin: 'xièxie', hanzi: '谢谢', meaning: 'cảm ơn', tip: 'Âm sau ngắn và nhẹ hơn.' },
      { symbol: '再见', pinyin: 'zàijiàn', hanzi: '再见', meaning: 'tạm biệt', tip: 'Hai âm thanh 4, giữ rõ từng âm.' },
      { symbol: '不是', pinyin: 'bú shì', hanzi: '不是', meaning: 'không phải', tip: '不 đổi thành thanh 2 trước shì.' },
    ],
    questions: [
      { prompt: 'Cách đặt dấu thanh 3 đúng cho shui là gì?', options: ['shǔi', 'shuǐ', 'shùi'], correct: 1, explanation: 'Với ui, dấu thanh đặt trên i, nguyên âm đứng sau.' },
      { prompt: 'Khi đứng trước shì (thanh 4), 不 thường đọc thế nào?', options: ['bū', 'bù', 'bú'], correct: 2, explanation: '不 đổi từ thanh 4 sang thanh 2 trước một âm tiết thanh 4.' },
    ],
  },
]

export const foundationPath = (slug: string) => `/foundations/${slug}`
