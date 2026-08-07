/**
 * Logic tests for SnapShot AI — runs the REAL lib code against a stubbed
 * Replicate + Resend HTTP layer (global fetch interception).
 */
process.env.REPLICATE_API_TOKEN = 'test-token'
process.env.RESEND_API_KEY = 'test-key'

import { generateHeadshots, buildHeadshotInput, normalizeOutput, TIERS } from '../lib/replicate'
import { sendHeadshotsEmail } from '../lib/email'

let failures = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  PASS  ${name}`)
  else { failures++; console.log(`  FAIL  ${name} ${detail}`) }
}

// ---------- fetch stub ----------
interface CreatedPrediction { id: string; prompt: string; input: Record<string, unknown>; fail: boolean }
const created: CreatedPrediction[] = []
let failNextNPredictions = 0
const sentEmails: { subject: string; attachments: { filename: string; content: unknown }[] }[] = []
let imageByteSize = 500 * 1024

const realFetch = globalThis.fetch
globalThis.fetch = (async (url: any, opts: any = {}) => {
  const u = String(url)

  // Replicate: create prediction
  if (u.includes('api.replicate.com') && u.includes('/predictions') && opts.method === 'POST') {
    const body = JSON.parse(opts.body)
    const id = `pred-${created.length}`
    const fail = failNextNPredictions > 0
    if (fail) failNextNPredictions--
    created.push({ id, prompt: body.input.prompt, input: body.input, fail })
    return jsonRes(predictionPayload(created[created.length - 1]))
  }
  // Replicate: get prediction
  const getMatch = u.match(/api\.replicate\.com\/v1\/predictions\/(pred-\d+)/)
  if (getMatch) {
    const p = created.find((c) => c.id === getMatch[1])!
    return jsonRes(predictionPayload(p))
  }
  // Generated image download
  if (u.includes('replicate.delivery')) {
    return new Response(new Uint8Array(imageByteSize), { status: 200 })
  }
  // Resend send
  if (u.includes('api.resend.com')) {
    const body = JSON.parse(opts.body)
    sentEmails.push({ subject: body.subject, attachments: body.attachments ?? [] })
    return jsonRes({ id: `email-${sentEmails.length}` })
  }
  return realFetch(url, opts)
}) as typeof fetch

function predictionPayload(p: CreatedPrediction) {
  return {
    id: p.id,
    status: p.fail ? 'failed' : 'succeeded',
    error: p.fail ? 'boom' : null,
    input: p.input,
    output: p.fail ? null : `https://replicate.delivery/fake/${p.id}.jpg`,
    created_at: new Date().toISOString(),
    urls: { get: `https://api.replicate.com/v1/predictions/${p.id}`, cancel: '' },
  }
}
function jsonRes(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json' } })
}

const IMGS = ['data:image/jpeg;base64,AAA1', 'data:image/jpeg;base64,AAA2', 'data:image/jpeg;base64,AAA3', 'data:image/jpeg;base64,AAA4']

async function main() {
  // ---------- buildHeadshotInput / normalizeOutput ----------
  console.log('\nbuildHeadshotInput:')
  const inp = buildHeadshotInput(IMGS[0], 'linkedin')
  check('uses the source photo', inp.input_image === IMGS[0])
  check('prompt demands identity preservation', String(inp.prompt).includes('identity'))
  check('any valid style yields a prompt', String(buildHeadshotInput(IMGS[0], 'academic').prompt).length > 0)
  check('normalizes string output', normalizeOutput('https://x/a.jpg').length === 1)
  check('normalizes array output', normalizeOutput(['https://x/a.jpg', 'https://x/b.jpg']).length === 2)

  // ---------- premium tier: 30 images ----------
  console.log('\ngenerateHeadshots premium (30):')
  created.length = 0
  const out30 = await generateHeadshots(IMGS, TIERS.premium.count)
  check('returns exactly 30 images', out30.length === 30, `got ${out30.length}`)
  check('creates exactly 30 predictions (1 image each)', created.length === 30, `got ${created.length}`)
  const styles30 = new Set(created.map((c) => c.prompt))
  check('single chosen style across the set', styles30.size === 1, `got ${styles30.size}`)
  check('every job uses the source photo', created.every((c) => c.input.input_image === IMGS[0]))

  // ---------- standard tier: 15 images ----------
  console.log('\ngenerateHeadshots standard (15):')
  created.length = 0
  const out15 = await generateHeadshots(IMGS, TIERS.standard.count)
  check('returns exactly 15 images', out15.length === 15, `got ${out15.length}`)
  check('single chosen style across the set', new Set(created.map((c) => c.prompt)).size === 1)

  // ---------- basic tier: 1 image ----------
  console.log('\ngenerateHeadshots basic (1):')
  created.length = 0
  const out1 = await generateHeadshots(IMGS, TIERS.basic.count)
  check('returns exactly 1 image', out1.length === 1)
  check('creates exactly 1 prediction', created.length === 1)

  // ---------- partial failure tolerance ----------
  console.log('\npartial failure:')
  created.length = 0
  failNextNPredictions = 1
  const outPartial = await generateHeadshots(IMGS, 30)
  check('tolerates one failed job, delivers the rest', outPartial.length === 29, `got ${outPartial.length}`)

  // ---------- total failure ----------
  created.length = 0
  failNextNPredictions = 99
  let threw = false
  try { await generateHeadshots(IMGS, 30) } catch { threw = true }
  check('throws when all jobs fail (Stripe will retry)', threw)
  failNextNPredictions = 0

  // ---------- email: normal set fits one email ----------
  console.log('\nemail delivery:')
  sentEmails.length = 0
  imageByteSize = 500 * 1024 // 30 × 0.5MB = 15MB
  const urls30 = Array.from({ length: 30 }, (_, i) => `https://replicate.delivery/fake/a-${i}.jpg`)
  await sendHeadshotsEmail('test@example.com', urls30)
  check('30 normal images → single email', sentEmails.length === 1, `got ${sentEmails.length}`)
  check('all 30 attached', sentEmails[0].attachments.length === 30, `got ${sentEmails[0].attachments.length}`)

  // ---------- email: oversized set splits ----------
  sentEmails.length = 0
  imageByteSize = 2 * 1024 * 1024 // 30 × 2MB = 60MB > 30MB limit
  await sendHeadshotsEmail('test@example.com', urls30)
  check('oversized set splits into 2 emails', sentEmails.length === 2, `got ${sentEmails.length}`)
  const totalAttached = sentEmails.reduce((s, e) => s + e.attachments.length, 0)
  check('no attachments lost in split', totalAttached === 30, `got ${totalAttached}`)
  check('subjects labeled part 1/2', sentEmails[0].subject.includes('part 1 of 2') && sentEmails[1].subject.includes('part 2 of 2'))

  console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} TEST(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
