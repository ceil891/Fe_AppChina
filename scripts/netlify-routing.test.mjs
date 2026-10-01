import { test } from 'node:test'
import assert from 'node:assert/strict'
import { routing } from './netlify-routing.mjs'
test('API proxy preserves API prefix and precedes SPA fallback', () => {
 assert.equal(routing('https://example-api.onrender.com'), '/api/*  https://example-api.onrender.com/api/:splat  200!\n/*  /index.html  200\n')
})
test('reject untrusted, credential-bearing and malformed origins', () => {
 for (const value of ['http://example.onrender.com','https://example.onrender.com.evil.test','https://u:p@example.onrender.com','https://example.onrender.com/api','https://example.onrender.com?key=secret','https://example.onrender.com:8443','https://example.onrender.com/#x']) assert.throws(() => routing(value))
})
