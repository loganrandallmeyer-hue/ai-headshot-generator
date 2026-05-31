import Replicate from 'replicate'

const PHOTOMAKER_VERSION =
  'ddfc2b08d209f9fa8c1eca692712918bd449f695d785824b1fe844f1af4041a8'

const HEADSHOT_STYLES = [
  { style: 'Photographic (Default)', bg: 'white background, studio lighting' },
  { style: 'Photographic (Default)', bg: 'office background, professional environment' },
  { style: 'Photographic (Default)', bg: 'blurred bokeh background, outdoor natural light' },
  { style: 'Photographic (Default)', bg: 'dark gradient background, dramatic studio lighting' },
  { style: 'Photographic (Default)', bg: 'light grey background, soft lighting' },
]

export const TIERS = {
  basic:    { price: 999,  label: '1 Headshot',  count: 1  },
  standard: { price: 1999, label: '15 Headshots', count: 15 },
  premium:  { price: 2499, label: '30 Headshots', count: 30 },
} as const

export type Tier = keyof typeof TIERS

export async function uploadFileToReplicate(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': mimeType,
    },
    body: new Blob([new Uint8Array(buffer)], { type: mimeType }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Replicate file upload failed: ${err}`)
  }

  const data = await response.json()
  return data.urls.get
}

export async function generatePreview(imageUrls: string[]): Promise<string> {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
  const primaryImage = imageUrls[0]

  const output = await replicate.run(
    `tencentarc/photomaker:${PHOTOMAKER_VERSION}`,
    {
      input: {
        prompt: 'professional corporate headshot photo of a person img, white background, studio lighting, sharp focus, high resolution, business attire, confident expression, photorealistic',
        input_image: primaryImage,
        num_outputs: 1,
        guidance_scale: 5,
        negative_prompt: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, cartoon, painting, illustration, drawing',
        style_name: 'Photographic (Default)',
        style_strength_ratio: 20,
        num_inference_steps: 30,
      },
    }
  ) as string[]

  return output[0]
}

export async function generateHeadshots(imageUrls: string[], count: number = 30): Promise<string[]> {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
  const primaryImage = imageUrls[0]
  const allResults: string[] = []

  if (count === 1) {
    const output = await replicate.run(
      `tencentarc/photomaker:${PHOTOMAKER_VERSION}`,
      {
        input: {
          prompt: 'professional corporate headshot photo of a person img, white background, studio lighting, sharp focus, high resolution, business attire, confident expression, photorealistic',
          input_image: primaryImage,
          num_outputs: 1,
          guidance_scale: 5,
          negative_prompt: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, cartoon, painting, illustration, drawing',
          style_name: 'Photographic (Default)',
          style_strength_ratio: 20,
          num_inference_steps: 50,
        },
      }
    ) as string[]
    return output
  }

  const stylesToUse = count === 15 ? HEADSHOT_STYLES.slice(0, 3) : HEADSHOT_STYLES
  const perStyle = Math.ceil(count / stylesToUse.length)

  for (const { style, bg } of stylesToUse) {
    const prompt = `professional corporate headshot photo of a person img, ${bg}, sharp focus, high resolution, business attire, confident expression, photorealistic`

    const output = await replicate.run(
      `tencentarc/photomaker:${PHOTOMAKER_VERSION}`,
      {
        input: {
          prompt,
          input_image: primaryImage,
          num_outputs: perStyle,
          guidance_scale: 5,
          negative_prompt: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, cartoon, painting, illustration, drawing',
          style_name: style,
          style_strength_ratio: 20,
          num_inference_steps: 50,
        },
      }
    ) as string[]

    allResults.push(...output)
    if (allResults.length >= count) break
  }

  return allResults.slice(0, count)
}
