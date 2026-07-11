import Replicate from 'replicate'

// FLUX.1 Kontext Pro — edits the customer's ACTUAL photo rather than
// generating a lookalike, so facial identity is preserved by construction.
// One output per prediction, ~$0.04/image.
export const HEADSHOT_MODEL = 'black-forest-labs/flux-kontext-pro'

/**
 * Replicate client that BYPASSES Next.js's fetch data cache.
 * Next caches GET responses by default, which froze status polling:
 * the first poll (mid-generation) was cached and replayed forever,
 * so completed predictions never appeared as done.
 */
export function newReplicate(): Replicate {
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
    fetch: (url: any, init?: any) => fetch(url, { ...init, cache: 'no-store' }),
  })
}

const IDENTITY_GUARD =
  "Keep this exact person's identity completely unchanged: same face, same facial structure, same gender, same jawline, same nose, same eyes, same lips, same skin tone and natural skin texture, same hairstyle. Do NOT add makeup, lip gloss, or lipstick. Do NOT smooth or retouch the skin. Do NOT feminize, masculinize, beautify, or slim the face. The person must be instantly recognizable as the same person from the original photo."

/**
 * Single source of truth for every selectable headshot style: the frontend
 * picker, the preview generation call, and the full-set generation call all
 * derive from this map. Adding a new style is exactly one new entry here —
 * no other file needs to change.
 */
export const HEADSHOT_STYLES = {
  linkedin: {
    label: 'LinkedIn',
    description: 'Clean, approachable, business-casual',
    preview: '/styles/linkedin.jpg',
    prompt: `Change the outfit to modern business-casual attire and the background to a clean, softly blurred contemporary office. Apply soft natural lighting and give the subject a warm, approachable, friendly expression with relaxed shoulders. Sharp focus, authentic and modern professional photography, ideal for a LinkedIn profile photo. ${IDENTITY_GUARD}`,
  },
  corporate: {
    label: 'Corporate',
    description: 'Formal attire, neutral studio backdrop',
    preview: '/styles/corporate.jpg',
    prompt: `Change the outfit to formal business attire and the background to a neutral, seamless studio backdrop. Apply even, traditional studio lighting and give the subject a conservative, upright, professional posture with a composed expression. Sharp focus, high-end traditional corporate portrait photography. ${IDENTITY_GUARD}`,
  },
  executive: {
    label: 'Executive',
    description: 'Commanding presence, dark tones',
    preview: '/styles/executive.jpg',
    prompt: `Change the outfit to a tailored formal suit and the background to a dark gradient studio backdrop. Apply dramatic rim lighting and give the subject a commanding, confident posture with a composed, authoritative expression. Sharp focus, premium luxury aesthetic, like a CEO or leadership portrait. ${IDENTITY_GUARD}`,
  },
  creative: {
    label: 'Creative',
    description: 'Relaxed, modern, personality-forward',
    preview: '/styles/creative.jpg',
    prompt: `Change the outfit to modern, fashion-forward smart-casual clothing and the background to a contemporary artistic office or studio space. Apply editorial-style lighting and give the subject a relaxed posture with a genuine, personality-forward, expressive smile. Sharp focus, modern editorial portrait photography, more candid and less rigid than a traditional headshot. ${IDENTITY_GUARD}`,
  },
  startup: {
    label: 'Startup',
    description: 'Smart-casual, bright and energetic',
    preview: '/styles/startup.jpg',
    prompt: `Change the outfit to smart-casual modern clothing and the background to a bright, contemporary tech office. Apply bright natural lighting and give the subject an energetic, friendly, founder-like expression with an approachable posture. Sharp focus, modern startup branding photography, energetic and optimistic mood. ${IDENTITY_GUARD}`,
  },
  academic: {
    label: 'Academic',
    description: 'Professional, understated, credible',
    preview: '/styles/academic.jpg',
    prompt: `Change the outfit to understated, neutral professional attire and the background to a clean university or library-inspired setting. Apply soft, even lighting and give the subject a credible, intelligent, composed expression with a minimalistic, uncluttered composition. Sharp focus, understated academic professional photography. ${IDENTITY_GUARD}`,
  },
} as const

export type StyleId = keyof typeof HEADSHOT_STYLES

export const DEFAULT_STYLE: StyleId = 'linkedin'

export function isValidStyle(value: unknown): value is StyleId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(HEADSHOT_STYLES, value)
}

export const TIERS = {
  basic:    { price: 999,  label: '1 Headshot',   count: 1  },
  standard: { price: 1999, label: '15 Headshots', count: 15 },
  premium:  { price: 2499, label: '30 Headshots', count: 30 },
} as const

export type Tier = keyof typeof TIERS

export function buildHeadshotInput(imageUrl: string, style: StyleId): Record<string, unknown> {
  return {
    prompt: HEADSHOT_STYLES[style].prompt,
    input_image: imageUrl,
    aspect_ratio: '1:1',
    output_format: 'jpg',
  }
}

// Kontext returns a single image URI (sometimes wrapped in an array or file object)
export function normalizeOutput(output: unknown): string[] {
  if (typeof output === 'string') return [output]
  if (Array.isArray(output)) return output.map(String).filter((s) => s.startsWith('http'))
  if (output && typeof output === 'object' && 'url' in output) {
    const u = (output as { url: unknown }).url
    return [typeof u === 'function' ? String(u.call(output)) : String(u)]
  }
  return []
}

/**
 * Recover the customer's photo from the preview prediction record —
 * it's echoed back in prediction.input, so we never store it ourselves.
 */
export async function getInputImagesFromPrediction(predictionId: string): Promise<string[]> {
  const replicate = newReplicate()
  const prediction = await replicate.predictions.get(predictionId)
  const input = (prediction.input ?? {}) as Record<string, unknown>
  const image = input.input_image
  if (typeof image !== 'string' || image.length === 0) {
    throw new Error(`No input image found on prediction ${predictionId}`)
  }
  return [image]
}

/**
 * Generate `count` headshots from one photo, all in the chosen style.
 * One prediction per image, all in PARALLEL — each call gets its own model
 * seed, so the set has natural pose/framing variety despite sharing a
 * prompt. Tolerates partial failures as long as at least half the set
 * generates.
 */
export async function generateHeadshots(imageUrls: string[], count: number = 30, style: StyleId = DEFAULT_STYLE): Promise<string[]> {
  const replicate = newReplicate()
  const sourceImage = imageUrls[0]

  const results = await Promise.allSettled(
    Array.from({ length: count }, () =>
      replicate.run(HEADSHOT_MODEL as `${string}/${string}`, {
        input: buildHeadshotInput(sourceImage, style),
      })
    )
  )

  const images: string[] = []
  const failures: string[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') images.push(...normalizeOutput(r.value))
    else failures.push(String(r.reason))
  }

  if (images.length === 0) {
    throw new Error(`All generation jobs failed: ${failures[0] ?? 'unknown error'}`)
  }
  if (images.length < count * 0.5) {
    throw new Error(`Only ${images.length}/${count} images generated: ${failures[0] ?? ''}`)
  }

  return images.slice(0, count)
}
