import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
export function routing(origin) {
 const url = new URL(origin)
 if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.onrender\.com$/.test(url.hostname) || url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
   throw new Error('RENDER_API_ORIGIN must be the exact HTTPS onrender.com service origin.')
 return '/api/*  ' + url.origin + '/api/:splat  200!\n/*  /index.html  200\n'
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
 if (!process.env.RENDER_API_ORIGIN) throw new Error('Set RENDER_API_ORIGIN in Netlify build environment.')
 await writeFile(new URL('../dist/_redirects', import.meta.url), routing(process.env.RENDER_API_ORIGIN))
 console.log('Generated API proxy before SPA fallback.')
}
