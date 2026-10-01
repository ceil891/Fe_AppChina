import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' })
const { get, mutate } = await server.ssrLoadModule('/src/services/api.ts')
after(() => server.close())

test('shares concurrent reads, isolates cancellation, and never caches completed data', async () => {
  let calls=0, finish
  globalThis.fetch=async () => { calls++; return new Promise(resolve => { finish=()=>resolve(new Response('{"ok":true}',{headers:{'Content-Type':'application/json'}})) }) }
  const controller=new AbortController()
  const first=get('/dedupe-test',controller.signal)
  const second=get('/dedupe-test')
  const cancelled=assert.rejects(first,{name:'AbortError'})
  controller.abort(); finish()
  await cancelled
  assert.deepEqual(await second,{ok:true})
  assert.equal(calls,1)
  const third=get('/dedupe-test'); finish(); await third
  assert.equal(calls,2)
})

test('a session mutation does not reuse earlier in-flight user data', async () => {
  let finishOld, reads=0
  globalThis.fetch=async (url) => {
    if(url.endsWith('/auth/csrf')) return Response.json({token:'test',headerName:'X-CSRF-TOKEN'})
    if(url.endsWith('/auth/logout')) return new Response(null,{status:204})
    reads++
    if(reads===1) return new Promise(resolve=>{finishOld=()=>resolve(Response.json({owner:'old'}))})
    return Response.json({owner:'new'})
  }
  const previous=get('/identity-test')
  await mutate('POST','/auth/logout')
  assert.deepEqual(await get('/identity-test'),{owner:'new'})
  finishOld(); await previous
})
