import Replicate from 'replicate'

export const PHOTOMAKER_VERSION =
  'ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4'

// PhotoMaker rejects num_outputs > 4
const MAX_OUTPUTS_PER_PREDICTION = 4

const NEGATIVE_PROMPT =
  'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, cartoon, painting, illustration, drawing'

const HEADSHOT_STYLES = [
  'white background, studio lighting',
  'office background, professional environment',
  'blurred bokeh background, outdoor natural light',
  'dark gradient background, dramatic studio lighting',
  'light grey background, soft lighting',
]

export const TIERS = {
  basic:    { price: 999,  label: '1 Headshot',   count: 1  },
  standard: { price: 1999, label: '15 Headshots', count: 15 },
  premium:  { price: 2499, label: '30 Headshots', count: 30 },
} as const

export type Tier = keyof typeof TIERS

/**
 * Build PhotoMaker input using up to 4 of the user's photos.
 * More reference photos = better likeness.
 */
export function buildPhotoMakerInput(
  imageUrls: string[],
  bg: string,
  numOutputs: number,
  inferenceSteps: number
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt: `professional corporate headshot photo of a person img, ${bg}, sharp focus, high resolution, business attire, confident expression, photorealistic`,
    input_image: imageUrls[0],
    num_outputs: Math.min(numOutputs, MAX_OUTPUTS_PER_PREDICTION),
    guidance_scale: 5,
    negative_prompt: NEGATIVE_PROMPT,
    style_name: 'Photographic (Default)',
    style_strength_ratio: 20,
    num_inference_steps: inferenceSteps,
  }
  if (imageUrls[1]) input.input_image2 = imageUrls[1]
  if (imageUrls[2]) input.input_image3 = imageUrls[2]
  if (imageUrls[3]) input.input_image4 = imageUrls[3]
  return input
}

/**
 * Recover the customer's input photos from the preview prediction record.
 * The photos were sent as data URLs, which Replicate echoes back in the
 * prediction input — so we never need to persist them ourselves.
 */
export async function getInputImagesFromPrediction(predictionId: string): Promise<string[]> {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
  const prediction = await replicate.predictions.get(predictionId)
  const input = (prediction.input ?? {}) as Record<string, unknown>
  const images = [input.input_image, input.input_image2, input.input_image3, input.input_image4]
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
  if (images.length === 0) {
    throw new Error(`No input images found on prediction ${predictionId}`)
  }
  return images
}

/**
 * Generate `count` headshots across background styles.
 * Predictions run in PARALLEL (serial generation of 30 images would blow
 * past serverless time limits), and each prediction respects PhotoMaker's
 * 4-output maximum.
 */
export async function generateHeadshots(imageUrls: string[], count: number = 30): Promise<string[]> {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })

  const styleCount = count <= 1 ? 1 : count <= 15 ? 3 : HEADSHOT_STYLES.length
  const styles = HEADSHOT_STYLES.slice(0, styleCount)

  // Split the total across styles, then split each style into <=4-output jobs
  const jobs: { bg: string; outputs: number }[] = []
  let remaining = count
  for (let s = 0; s < styles.length && remaining > 0; s++) {
    const stylesLeft = styles.length - s
    let forThisStyle = Math.ceil(remaining / stylesLeft)
    remaining -= forThisStyle
    while (forThisStyle > 0) {
      const n = Math.min(forThisStyle, MAX_OUTPUTS_PER_PREDICTION)
      jobs.push({ bg: styles[s], outputs: n })
      forThisStyle -= n
    }
  }

  const results = await Promise.allSettled(
    jobs.map(({ bg, outputs }) =>
      replicate.run(`tencentarc/photomaker:${PHOTOMAKER_VERSION}`, {
        input: buildPhotoMakerInput(imageUrls, bg, outputs, 50),
      }) as Promise<string[]>
    )
  )

  const images: string[] = []
  const failures: string[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      images.push(...r.value.filter((u) => typeof u === 'string'))
    } else if (r.status === 'rejected') {
      failures.push(String(r.reason))
    }
  }

  // Tolerate partial failures as long as most of the set generated
  if (images.length === 0) {
    throw new Error(`All generation jobs failed: ${failures[0] ?? 'unknown error'}`)
  }
  if (images.length < count * 0.5) {
    throw new Error(`Only ${images.length}/${count} images generated: ${failures[0] ?? ''}`)
  }

  return images.slice(0, count)
}
