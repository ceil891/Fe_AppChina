import type { ReactNode } from 'react'
import { Brand } from '../../../shared/components/Brand'
import { Icon } from '../../../shared/components/Icon'
import '../auth.css'
export function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-page" id="page-content">
    <div className="auth-grid">
      <section className="auth-intro" aria-labelledby="intro-title">
        <div className="intro-brand"><Brand /></div>
        <div className="intro-eyebrow"><span /> TỪ NHỮNG LỜI CHÀO ĐẦU TIÊN</div>
        <h1 id="intro-title">Học tiếng Trung<br />{' '}<span>mỗi ngày.</span></h1>
        <p className="intro-description">Chỉ 10–15 phút mỗi ngày để xây dựng vốn từ và cải thiện phản xạ.</p>
        <div className="language-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <Icon name="spark" className="art-spark spark-one" /><Icon name="spark" className="art-spark spark-two" />
          <div className="practice-paper"><div className="paper-label">MỖI NGÀY MỘT TỪ MỚI <span>01</span></div><div className="character-grid" lang="zh"><span>你</span><span>好</span></div><div className="paper-pinyin">nǐ hǎo</div><div className="paper-meaning">Một lời chào, một khởi đầu mới.</div><span className="paper-stamp" lang="zh">学<br />习</span></div>
          <div className="floating-word"><span className="floating-icon"><Icon name="book" /></span><span><strong>你好 <small>Xin chào!</small></strong><span>Chạm vào một ngôn ngữ mới</span></span></div>
          <div className="time-chip"><Icon name="clock" width="15" />10–15 phút / ngày</div>
        </div>
        <div className="intro-benefits"><span><Icon name="check" />Học từ cơ bản</span><span><Icon name="check" />Giải thích tiếng Việt</span><span><Icon name="check" />Theo nhịp của bạn</span></div>
      </section>
      <section className="auth-form-side" aria-label="Tài khoản ChinaNN">{children}<p className="auth-reassurance"><Icon name="shield" width="15" />Một bước nhỏ hôm nay, tiến xa hơn ngày mai.</p></section>
    </div>
    <footer className="auth-footer"><span>© {new Date().getFullYear()} ChinaNN</span><span>Đồng hành cùng bạn từ câu “你好” đầu tiên.</span><span>Được tạo cho người học Việt Nam</span></footer>
  </main>
}
