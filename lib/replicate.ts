import Replicate from 'replicate'

// FLUX.1 Kontext Pro — edits the customer's ACTUAL photo rather than
// generating a lookalike, so facial identity is preserved by construction.
// One output per prediction, ~$0.04/image.
export const HEADSHOT_MODEL = 'black-forest-labs/flux-kontext-pro'

const IDENTITY_GUARD =
  "Preserve this exact person's face, identity, skin tone, and hair. Do not change their facial features."

const HEADSHOT_PROMPTS = [
  `Transform this into a professional corporate headshot: business attire, clean white studio background, soft even studio lighting, sharp focus, confident friendly expression. ${IDENTITY_GUARD}`,
  `Transform this into a professional headshot: business attire, blurred modern office background, natural professional lighting, sharp focus. ${IDENTITY_GUARD}`,
  `Transform this into a professional headshot: smart-casual attire, outdoor background with soft bokeh, warm natural golden-hour light, sharp focus. ${IDENTITY_GUARD}`,
  `Transform this into an executive portrait: dark business attire, dark gradient studio background, dramatic professional rim lighting, sharp focus. ${IDENTITY_GUARD}`,
  `Transform this into a professional headshot: business-casual attire, light grey seamless studio background, soft diffused lighting, sharp focus, approachable expression. ${IDENTITY_GUARD}`,
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
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
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
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
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
