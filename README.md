# ChinaNN Frontend

React / TypeScript / Vite. Backend: https://github.com/ceil891/BE_AppChiNa/tree/dev

## Local development
npm ci
npm run dev

Vite proxies /api to http://127.0.0.1:8080. Run the backend separately.

## Checks
npm run lint
npm run test:roles
node --test scripts/netlify-routing.test.mjs
npm run build

## Netlify
Import this repository and select branch dev. Base directory: blank (repo root).
Build command: npm run build && node scripts/netlify-routing.mjs
Publish directory: dist
Node: 22 (configured in netlify.toml).
Set RENDER_API_ORIGIN to the real HTTPS backend origin, for example https://YOUR-BACKEND.onrender.com. The build fails without this value to avoid deploying a broken API route.
The build generates /api proxy rules before the SPA fallback. Do not add database passwords or Gemini API keys to Netlify. Backend Render FRONTEND_ORIGIN must match the exact Netlify HTTPS origin, without a trailing slash.
Validate login, Secure/HttpOnly cookie, CSRF, refresh and logout on the deployed site before opening it to learners.
