/**
 * Route-handler tests for SnapShot AI.
 * Executes the REAL API route handlers with stubbed Stripe (https-level),
 * Replicate + Resend (fetch-level) backends — including a valid HMAC-signed
 * Stripe webhook event for the full payment→generation→email path.
 */
import { createHmac } from 'crypto'
import { EventEmitter } from 'events'
import { Readable } from 'stream'

process.env.REPLICATE_API_TOKEN = 'test-token'
process.env.RESEND_API_KEY = 'test-key'
process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_testsecret'
process.env.NEXT_PUBLIC_BASE_URL = 'https://snapshot.example.com'

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.log(`  FAIL  ${name} ${detail}`) }
}

// ---------------- Stripe stub (Node https level) ----------------
const stripeCalls: { method: string; path: string; body: string }[] = []
const piMetadata: Record<string, Record<string, string>> = {
  pi_dup: { fulfilled: 'true' },
  pi_fresh: {},
}

function fakeStripeResponse(method: string, path: string, body: string): { status: number; json: unknown } {
  stripeCalls.push({ method, path, body })
  const piGet = path.match(/^\/v1\/payment_intents\/([^/?]+)$/)
  if (piGet && method === 'GET') {
    return { status: 200, json: { id: piGet[1], object: 'payment_intent', metadata: piMetadata[piGet[1]] ?? {} } }
  }
  if (piGet && method === 'POST') {
    // metadata update — merge form-encoded metadata[...] keys
    const params = new URLSearchParams(body)
    const md = piMetadata[piGet[1]] ?? (piMetadata[piGet[1]] = {})
    params.forEach((v, k) => {
      const m = k.match(/^metadata\[(.+)\]$/)
      if (m) md[m[1]] = v
    })
    return { status: 200, json: { id: piGet[1], object: 'payment_intent', metadata: md } }
  }
  if (path.startsWith('/v1/checkout/sessions') && method === 'POST') {
    return { status: 200, json: { id: 'cs_test_123', object: 'checkout.session', url: 'https://checkout.stripe.com/c/pay/cs_test_123' } }
  }
  return { status: 404, json: { error: { message: `unstubbed stripe ${method} ${path}` } } }
}

class FakeClientRequest extends EventEmitter {
  private chunks: Buffer[] = []
  constructor(private options: { method?: string; path?: string }) {
    super()
    setImmediate(() => this.emit('socket', { connecting: false }))
  }
  setTimeout() { return this }
  write(d: string | Buffer) { this.chunks.push(Buffer.from(d)); return true }
  end() {
    setImmediate(() => {
      const { status, json } = fakeStripeResponse(
        this.options.method ?? 'GET',
        this.options.path ?? '/',
        Buffer.concat(this.chunks).toString()
      )
      const payload = JSON.stringify(json)
      const res = Readable.from([Buffer.from(payload)]) as Readable & { statusCode: number; headers: Record<string, string> }
      res.statusCode = status
      res.headers = { 'content-type': 'application/json', 'request-id': 'req_test' }
      this.emit('response', res)
    })
  }
  destroy() {}
  abort() {}
}

// stripe-node v14 holds the https module object and calls .request() on it
// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require('https')
const realHttpsRequest = https.request
https.request = function (options: any, ...rest: any[]) {
  const host = options?.host ?? options?.hostname ?? ''
  if (String(host).includes('api.stripe.com')) return new FakeClientRequest(options)
  return realHttpsRequest.apply(this, [options, ...rest])
}

// ---------------- Replicate + Resend stub (fetch level) ----------------
const DATA_URLS = [1, 2, 3, 4].map((i) => `data:image/jpeg;base64,PHOTO${i}`)
interface CreatedPrediction { id: string; numOutputs: number; input: Record<string, unknown> }
const created: CreatedPrediction[] = []
const sentEmails: { subject: string; to: unknown; attachments: unknown[] }[] = []
let previewPredictionAgeMs = 0
let checkPreviewMode: 'succeeded' | 'error' = 'succeeded'

const realFetch = globalThis.fetch
globalThis.fetch = (async (url: any, opts: any = {}) => {
  const u = String(url)

  if (u.includes('api.replicate.com')) {
    // create generation prediction
    if (u.endsWith('/predictions') && opts.method === 'POST') {
      const body = JSON.parse(opts.body)
      const id = `pred-gen-${created.length}`
      created.push({ id, numOutputs: body.input.num_outputs, input: body.input })
      return jsonRes(genPayload(created[created.length - 1]))
    }
    // preview prediction record (photo recovery + freshness checks)
    if (u.includes('/predictions/pred-preview')) {
      if (checkPreviewMode === 'error') return jsonRes({ detail: 'bad request' }, 400)
      return jsonRes({
        id: 'pred-preview',
        status: 'succeeded',
        input: { input_image: DATA_URLS[0], input_image2: DATA_URLS[1], input_image3: DATA_URLS[2], input_image4: DATA_URLS[3], prompt: 'x' },
        output: ['https://replicate.delivery/fake/preview.jpg'],
        created_at: new Date(Date.now() - previewPredictionAgeMs).toISOString(),
        urls: { get: '', cancel: '' },
      })
    }
    // generation prediction polling
    const m = u.match(/predictions\/(pred-gen-\d+)/)
    if (m) {
      const p = created.find((c) => c.id === m[1])!
      return jsonRes(genPayload(p))
    }
  }
  if (u.includes('replicate.delivery')) {
    return new Response(new Uint8Array(10 * 1024), { status: 200 })
  }
  if (u.includes('api.resend.com')) {
    const body = JSON.parse(opts.body)
    sentEmails.push({ subject: body.subject, to: body.to, attachments: body.attachments ?? [] })
    return jsonRes({ id: `email-${sentEmails.length}` })
  }
  return realFetch(url, opts)
}) as typeof fetch

function genPayload(p: CreatedPrediction) {
  return {
    id: p.id,
    status: 'succeeded',
    error: null,
    input: p.input,
    output: Array.from({ length: p.numOutputs }, (_, i) => `https://replicate.delivery/fake/${p.id}-${i}.jpg`),
    created_at: new Date().toISOString(),
    urls: { get: `https://api.replicate.com/v1/predictions/${p.id}`, cancel: '' },
  }
}
function jsonRes(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } })
}

// ---------------- import the REAL route handlers ----------------
import { POST as generatePreview } from '../app/api/generate-preview/route'
import { GET as checkPreview } from '../app/api/check-preview/route'
import { POST as createCheckout } from '../app/api/create-checkout/route'
import { POST as webhook } from '../app/api/webhook/route'
import { NextRequest } from 'next/server'

function postJson(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

function signedWebhookRequest(eventBody: string) {
  const t = Math.floor(Date.now() / 1000)
  const sig = createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET!)
    .update(`${t}.${eventBody}`)
    .digest('hex')
  return new NextRequest('http://localhost/api/webhook', {
    method: 'POST',
    body: eventBody,
    headers: { 'stripe-signature': `t=${t},v1=${sig}` },
  })
}

const checkoutEvent = (pi: string) =>
  JSON.stringify({
    id: 'evt_test',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        payment_intent: pi,
        metadata: { session_id: 'sess-1', email: 'buyer@example.com', tier: 'premium', prediction_id: 'pred-preview' },
      },
    },
  })

async function main() {
  // ---------- /api/generate-preview validation ----------
  console.log('\n/api/generate-preview:')
  let res: any = await generatePreview(postJson('/api/generate-preview', { fileUrls: DATA_URLS, email: 'not-an-email' }))
  check('rejects invalid email (400)', res.status === 400)

  res = await generatePreview(postJson('/api/generate-preview', { fileUrls: Array(21).fill(DATA_URLS[0]), email: 'a@b.co' }))
  check('rejects >20 photos (400)', res.status === 400)

  res = await generatePreview(postJson('/api/generate-preview', { fileUrls: ['https://evil.com/x.jpg'], email: 'a@b.co' }))
  check('rejects non-data-URL photo (400)', res.status === 400)

  res = await generatePreview(postJson('/api/generate-preview', { fileUrls: ['data:image/jpeg;base64,' + 'A'.repeat(500 * 1024)], email: 'a@b.co' }))
  check('rejects oversized photo (400)', res.status === 400)

  created.length = 0
  res = await generatePreview(postJson('/api/generate-preview', { fileUrls: DATA_URLS, email: 'a@b.co' }))
  const previewJson = await res.json()
  check('valid request → 200 + predictionId + sessionId', res.status === 200 && !!previewJson.predictionId && !!previewJson.sessionId)
  check('preview uses all 4 reference photos', created[0]?.input.input_image4 === DATA_URLS[3])
  check('preview generates exactly 1 image', created[0]?.numOutputs === 1)

  // ---------- /api/check-preview ----------
  console.log('\n/api/check-preview:')
  res = await checkPreview(new NextRequest('http://localhost/api/check-preview'))
  check('missing id → 400', res.status === 400)

  checkPreviewMode = 'error'
  res = await checkPreview(new NextRequest('http://localhost/api/check-preview?id=pred-preview'))
  let j = await res.json()
  check('Replicate error → pending (client keeps polling)', res.status === 200 && j.status === 'pending' && j.transient === true)
  checkPreviewMode = 'succeeded'

  res = await checkPreview(new NextRequest('http://localhost/api/check-preview?id=pred-preview'))
  j = await res.json()
  check('succeeded → done + previewUrl', j.status === 'done' && j.previewUrl.includes('preview.jpg'))

  // ---------- /api/create-checkout ----------
  console.log('\n/api/create-checkout:')
  res = await createCheckout(postJson('/api/create-checkout', { email: 'a@b.co', tier: 'premium' }))
  check('missing fields → 400', res.status === 400)

  res = await createCheckout(postJson('/api/create-checkout', { email: 'a@b.co', sessionId: 's', tier: 'mega', predictionId: 'pred-preview' }))
  check('invalid tier → 400', res.status === 400)

  previewPredictionAgeMs = 30 * 60 * 1000 // 30 min old — inputs near Replicate's 1h deletion
  stripeCalls.length = 0
  res = await createCheckout(postJson('/api/create-checkout', { email: 'a@b.co', sessionId: 's', tier: 'premium', predictionId: 'pred-preview' }))
  check('stale preview (30 min) → 409 expired', res.status === 409)
  check('no Stripe session created for stale preview', !stripeCalls.some((c) => c.path.includes('checkout/sessions')))

  previewPredictionAgeMs = 2 * 60 * 1000 // 2 min old — fresh
  stripeCalls.length = 0
  res = await createCheckout(postJson('/api/create-checkout', { email: 'a@b.co', sessionId: 'sess-1', tier: 'premium', predictionId: 'pred-preview' }))
  j = await res.json()
  check('fresh preview → 200 + checkout URL', res.status === 200 && j.checkoutUrl.includes('checkout.stripe.com'))
  const sessionCall = stripeCalls.find((c) => c.path.includes('checkout/sessions'))
  check('metadata carries prediction_id (not photo blobs)', !!sessionCall && sessionCall.body.includes('prediction_id') && sessionCall.body.includes('pred-preview'))
  check('checkout session has expiry set', !!sessionCall && sessionCall.body.includes('expires_at'))
  check('no base64 photo data sent to Stripe', !!sessionCall && !sessionCall.body.includes('PHOTO1'))

  // ---------- /api/webhook ----------
  console.log('\n/api/webhook:')
  const badSig = new NextRequest('http://localhost/api/webhook', {
    method: 'POST', body: checkoutEvent('pi_fresh'), headers: { 'stripe-signature': 't=1,v1=deadbeef' },
  })
  res = await webhook(badSig)
  check('invalid signature → 400', res.status === 400)

  created.length = 0
  sentEmails.length = 0
  res = await webhook(signedWebhookRequest(checkoutEvent('pi_dup')))
  j = await res.json()
  check('already-fulfilled order → skipped (idempotent)', res.status === 200 && j.duplicate === true)
  check('duplicate: no generation, no email', created.length === 0 && sentEmails.length === 0)

  created.length = 0
  sentEmails.length = 0
  res = await webhook(signedWebhookRequest(checkoutEvent('pi_fresh')))
  j = await res.json()
  check('fresh order → fulfilled (200 success)', res.status === 200 && j.success === true, JSON.stringify(j))
  check('delivered 30 headshots (premium)', j.count === 30, `got ${j.count}`)
  check('photos recovered from preview prediction', created.every((c) => c.input.input_image === DATA_URLS[0] && c.input.input_image4 === DATA_URLS[3]))
  check('every generation job ≤ 4 outputs', created.every((c) => c.numOutputs <= 4))
  check('email sent with 30 attachments', sentEmails.length === 1 && sentEmails[0].attachments.length === 30, `emails=${sentEmails.length}`)
  check('PaymentIntent marked fulfilled', piMetadata.pi_fresh.fulfilled === 'true')

  // second delivery attempt for the same order must be skipped
  created.length = 0
  sentEmails.length = 0
  res = await webhook(signedWebhookRequest(checkoutEvent('pi_fresh')))
  j = await res.json()
  check('Stripe retry after success → no double delivery', j.duplicate === true && sentEmails.length === 0)

  console.log(failures === 0 ? '\nALL ROUTE TESTS PASSED' : `\n${failures} TEST(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
