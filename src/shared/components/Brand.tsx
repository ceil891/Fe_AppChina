import { Link } from 'react-router-dom'
export function Brand({ admin = false }: { admin?: boolean }) {
  return <Link className="brand" to={admin ? '/admin' : '/home'} aria-label={admin ? 'ChinaNN — về quản lý' : 'ChinaNN — về trang chủ'}>
    <span className="brand-symbol" lang="zh" aria-hidden="true">中</span>
    <span>China<span className="brand-accent">NN</span><small>{admin ? 'KHÔNG GIAN QUẢN LÝ' : 'TIẾNG TRUNG, GẦN HƠN MỖI NGÀY'}</small></span>
  </Link>
}
