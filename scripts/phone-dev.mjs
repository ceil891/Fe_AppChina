import { networkInterfaces } from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const addresses = [...new Set(Object.values(networkInterfaces()).flat().filter(item => {
  if (!item || item.internal || item.family !== 'IPv4') return false
  const parts = item.address.split('.').map(Number)
  return parts[0] === 10 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
}).map(item => item.address))]
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--host')) {
  console.error('Cách dùng: npm run dev:phone -- --host <IPv4 mạng nội bộ của máy>')
  process.exit(1)
}
const address = args[1] ?? (addresses.length === 1 ? addresses[0] : undefined)
if (!address || !addresses.includes(address)) {
  console.error('Hãy chọn địa chỉ Wi-Fi/Ethernet của máy. Các địa chỉ mạng nội bộ đang có:')
  for (const candidate of addresses) console.error(`  npm run dev:phone -- --host ${candidate}`)
  if (!addresses.length) console.error('Chưa tìm thấy IPv4 mạng nội bộ. Kết nối Wi-Fi/Ethernet rồi thử lại.')
  process.exit(1)
}
try {
  const response = await fetch('http://127.0.0.1:8080/api/v1/lessons', { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Backend chưa sẵn sàng.')
} catch {
  console.error('Hãy khởi động backend tại 127.0.0.1:8080 trước khi mở web cho điện thoại.')
  process.exit(1)
}
console.log(`Điện thoại cùng Wi-Fi: http://${address}:5174/home`)
console.log('Giữ máy tính và terminal này đang chạy. Dừng bằng Ctrl+C.')
console.log('HTTP qua Wi-Fi chưa hỗ trợ micro; cần HTTPS để thu âm trên điện thoại.')
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)), '--host', address, '--port', '5174', '--strictPort'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'inherit',
})
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 0 })
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
