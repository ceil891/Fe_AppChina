import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    // Keep the browser's Host so Spring can identify same-origin requests.
    proxy: { '/api': { target: 'http://127.0.0.1:8080', changeOrigin: false } },
  },
})
