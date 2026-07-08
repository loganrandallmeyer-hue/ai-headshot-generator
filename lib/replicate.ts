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

const HEADSHOT_PROMPTS = [
  `Change the background to a clean white studio backdrop, change the clothing to professional business attire, and apply soft even studio lighting, sharp focus, like a corporate headshot. ${IDENTITY_GUARD}`,
  `Change the background to a blurred modern office and change the clothing to professional business attire, with natural professional lighting and sharp focus. ${IDENTITY_GUARD}`,
  `Change the background to an outdoor scene with soft bokeh and change the clothing to smart-casual attire, with warm natural light and sharp focus. ${IDENTITY_GUARD}`,
  `Change the background to a dark gradient studio backdrop and change the clothing to dark business attire, with professional rim lighting and sharp focus, like an executive portrait. ${IDENTITY_GUARD}`,
  `Change the background to a light grey seamless studio backdrop and change the clothing to business-casual attire, with soft diffused lighting and sharp focus. ${IDENTITY_GUARD}`,
]

export const TIERS = {
  basic:    { price: 999,  label: '1 Headshot',   count: 1  },
  standard: { price: 1999, label: '15 Headshots', count: 15 },
  premium:  { price: 2499, label: '30 Headshots', count: 30 },
} as const

export type Tier = keyof typeof TIERS

export function buildHeadshotInput(imageUrl: string, promptIndex: number): Record<string, unknown> {
  return {
    prompt: HEADSHOT_PROMPTS[promptIndex % HEADSHOT_PROMPTS.length],
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
 * Generate `count` headshots from one photo, cycling background styles.
 * One prediction per image, all in PARALLEL. Tolerates partial failures
 * as long as at least half the set generates.
 */
export async function generateHeadshots(imageUrls: string[], count: number = 30): Promise<string[]> {
  const replicate = newReplicate()
  const sourceImage = imageUrls[0]
  const styleCount = count <= 1 ? 1 : count <= 15 ? 3 : HEADSHOT_PROMPTS.length

  const results = await Promise.allSettled(
    Array.from({ length: count }, (_, i) =>
      replicate.run(HEADSHOT_MODEL as `${string}/${string}`, {
        input: buildHeadshotInput(sourceImage, i % styleCount),
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
